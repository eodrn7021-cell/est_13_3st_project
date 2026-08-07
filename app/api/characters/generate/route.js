import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(request) {
  try {
    const data = await request.json();
    const supabase = createClient();
    let insertedWorld = null;

    // 1. 세계관(worlds) 테이블 데이터 저장
    const { data: worldRes, error: worldError } = await supabase
      .from("worlds")
      .insert({
        name: data.title || data.name || "무제 세계관",
        theme: data.theme || "",
        genre: data.genre || "",
        myth_history: data.myth_history || null,
        religion_culture: data.religion_culture || null,
        social_structure: data.social_structure || null,
        climate_landmarks: data.climate_landmarks || null,
        resource_currency: data.resource_currency || null,
      })
      .select()
      .single();

    if (worldError) {
      console.error("세계관 DB 저장 실패:", worldError);
      return NextResponse.json(
        { error: "세계관 저장 중 오류가 발생했습니다: " + worldError.message },
        { status: 500 }
      );
    }

    insertedWorld = worldRes;

    // 2. 캐릭터(characters) 테이블 데이터 저장 (world_id 외래키 연동)
    const { data: insertedChar, error: charError } = await supabase
      .from("characters")
      .insert({
        world_id: insertedWorld.id,
        name: data.name || "무제 캐릭터",
        race: data.race || null,
        gender: data.gender || null,
        age: data.age || null,
        job_role: data.job_role || null,
        background_story: data.background_story || "",
        appearance: data.appearance || "",
        personality: data.personality || null,
        abilities: data.abilities || null,
        raw_relationship_input: data.relationships || null,
        image_url: null,
      })
      .select()
      .single();

    if (charError) {
      console.error("캐릭터 DB 저장 실패. 세계관 롤백 실행:", charError);
      await supabase.from("worlds").delete().eq("id", insertedWorld.id);
      return NextResponse.json(
        { error: "캐릭터 저장 중 오류가 발생하여 롤백되었습니다: " + charError.message },
        { status: 500 }
      );
    }

    // 3. 한국어 선택 옵션(종족/성별 등)을 영문 키워드로 매핑하여 프롬프트 왜곡 방지
    const RACE_MAP = {
      "인간": "human",
      "엘프": "elf",
      "드워프": "dwarf",
      "수인": "beastkin beast-person",
      "마족": "demon-race demon",
    };

    const GENDER_MAP = {
      "남성": "male",
      "여성": "female",
      "무성": "genderless",
    };

    const raceEn = RACE_MAP[insertedChar.race] || insertedChar.race || "human";
    const genderEn = GENDER_MAP[insertedChar.gender] || insertedChar.gender || "character";

    const baseInfoParts = [];
    if (insertedChar.age) baseInfoParts.push(`${insertedChar.age} years old`);
    baseInfoParts.push(genderEn);
    baseInfoParts.push(raceEn);
    if (insertedChar.job_role) baseInfoParts.push(insertedChar.job_role);

    const basicInfoDesc = baseInfoParts.join(" ");

    const promptText = `
당신은 AI 이미지 프롬프트 전문 번역가입니다.
아래 캐릭터의 "외형적 특징"과 "기본 정보"를 가장 정확하게 반영하여 이미지 생성용 영문 프롬프트를 작성하세요.

[캐릭터 정보]
- 이름: ${insertedChar.name}
- 기본 정보: ${basicInfoDesc}
- 외형적 특징 (가장 중요): ${insertedChar.appearance || "특이사항 없음"}
- 성격/분위기: ${insertedChar.personality || ""}
- 세계관 배경: ${insertedWorld.theme || ""} ${insertedWorld.genre || ""}

[작성 규칙]
1. 인사말, 서론, 한국어 설명은 완전히 배제하고 오직 영문(English) 프롬프트 텍스트만 출력하세요.
2. 외형적 특징(얼굴, 머리 모양/색, 눈동자, 피부/비늘/날개, 의상 등)을 생생하고 정확하게 영문 단어 및 문장으로 기술하세요.
`.trim();

    let translatedEnglish = "";
    const alanClientKey = process.env.NEXT_PUBLIC_ALAN_CLIENT_KEY || process.env.ALAN_CLIENT_KEY;

    try {
      if (alanClientKey) {
        const alanRes = await fetch(
          `https://alan.kro.kr/api/v1/action/completion?client_key=${alanClientKey}&content=${encodeURIComponent(promptText)}`
        );
        if (alanRes.ok) {
          const alanJson = await alanRes.json();
          if (alanJson?.content) {
            // 한국어 서론 및 잡다한 문자 제거 후 순수 알파벳/문장 부호만 추출
            translatedEnglish = alanJson.content
              .replace(/[^a-zA-Z0-9\s,.':\-]/g, " ")
              .replace(/\s+/g, " ")
              .trim();
          }
        }
      }
    } catch (alanErr) {
      console.warn("알란 AI 서버 호출 실패, 폴백 처리:", alanErr);
    }

    // 4. 프롬프트 맨 앞에 [기본정보] + [외형적 특징] + [고품질 다크 판타지 웹소설 일러스트 화풍] 적용
    const appearanceDirect = insertedChar.appearance ? `with ${insertedChar.appearance}` : "";
    const promptCore = translatedEnglish || `detailed portrait of a ${basicInfoDesc} ${appearanceDirect}`;

    // 이미지 예시화풍: 다크 판타지 한국 웹소설 표지 스타일, 정교한 의상/장신구, 은은한 마법 입자/조명, WLOP/Artstation 메인 화풍
    const stylePreset = "dark fantasy semi-realistic digital art, Korean webnovel cover illustration, intricate ornate dark clothing with golden and purple jewels, glowing ethereal magic particles, dramatic cinematic gothic lighting, masterpiece, ultra-detailed elegant facial features, 8k resolution, WLOP artstyle, trending on Artstation";

    const finalPrompt = `masterpiece dark fantasy portrait of ${insertedChar.name}, a ${basicInfoDesc}, ${promptCore}, ${insertedWorld.theme || "dark fantasy"} ${insertedWorld.genre || ""} background, ${stylePreset}`;

    // 5. OpenAI 전용 이미지 생성 (dall-e-3 호출)
    const openAiKey = process.env.OPENAI_API_KEY;

    if (!openAiKey) {
      await supabase.from("worlds").delete().eq("id", insertedWorld.id);
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 .env.local에 설정되어 있지 않습니다." },
        { status: 400 }
      );
    }

    const openAiModels = ["gpt-image-1", "gpt-image-1.5", "chatgpt-image-latest", "dall-e-3", "dall-e-2"];
    let generatedImageUrl = "";
    let openAiErrorMessage = "";

    for (const modelName of openAiModels) {
      try {
        const openAiRes = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            prompt: finalPrompt,
            n: 1,
            size: "1024x1024",
          }),
        });

        const openAiJson = await openAiRes.json();

        if (openAiRes.ok && openAiJson?.data?.[0]) {
          const item = openAiJson.data[0];
          if (item.url) {
            generatedImageUrl = item.url;
          } else if (item.b64_json) {
            generatedImageUrl = `data:image/png;base64,${item.b64_json}`;
          }
          if (generatedImageUrl) break;
        } else if (openAiJson?.error?.message) {
          openAiErrorMessage = openAiJson.error.message;
          console.warn(`OpenAI 이미지 모델 (${modelName}) 응답 메세지:`, openAiErrorMessage);
        }
      } catch (err) {
        openAiErrorMessage = err.message || "OpenAI 서버 통신 에러가 발생했습니다.";
      }
    }

    if (!generatedImageUrl) {
      // 이미지 생성 실패 시 DB 롤백 실행
      await supabase.from("worlds").delete().eq("id", insertedWorld.id);
      return NextResponse.json(
        { error: `OpenAI 이미지 생성 오류: ${openAiErrorMessage}` },
        { status: 500 }
      );
    }

    await supabase
      .from("characters")
      .update({ image_url: generatedImageUrl })
      .eq("id", insertedChar.id);

    // 5. 성공적으로 처리된 캐릭터 ID 반환
    return NextResponse.json({
      success: true,
      characterId: insertedChar.id,
      imageUrl: generatedImageUrl,
    });
  } catch (err) {
    console.error("서버 처리 중 전체 예외 발생:", err);
    return NextResponse.json(
      { error: "서버 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
