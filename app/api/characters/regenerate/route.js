import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(request) {
  try {
    const { characterId } = await request.json();

    if (!characterId) {
      return NextResponse.json({ error: "characterId가 필요합니다." }, { status: 400 });
    }

    const supabase = createClient();

    // 1. 캐릭터 및 연동 세계관 데이터 조회
    const { data: character, error: fetchError } = await supabase
      .from("characters")
      .select("*, worlds(*)")
      .eq("id", characterId)
      .single();

    if (fetchError || !character) {
      return NextResponse.json({ error: "캐릭터 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const world = character.worlds || {};

    // 2. 한국어 선택 옵션(종족/성별 등)을 영문 키워드로 매핑하여 프롬프트 왜곡 방지
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

    const raceEn = RACE_MAP[character.race] || character.race || "human";
    const genderEn = GENDER_MAP[character.gender] || character.gender || "character";

    const baseInfoParts = [];
    if (character.age) baseInfoParts.push(`${character.age} years old`);
    baseInfoParts.push(genderEn);
    baseInfoParts.push(raceEn);
    if (character.job_role) baseInfoParts.push(character.job_role);

    const basicInfoDesc = baseInfoParts.join(" ");

    const promptText = `
당신은 AI 이미지 프롬프트 전문 번역가입니다.
아래 캐릭터의 "외형적 특징"과 "기본 정보"를 가장 정확하게 반영하여 이미지 생성용 영문 프롬프트를 작성하세요.

[캐릭터 정보]
- 이름: ${character.name}
- 기본 정보: ${basicInfoDesc}
- 외형적 특징 (가장 중요): ${character.appearance || "특이사항 없음"}
- 성격/분위기: ${character.personality || ""}
- 세계관 배경: ${world.theme || ""} ${world.genre || ""}

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
            translatedEnglish = alanJson.content
              .replace(/[^a-zA-Z0-9\s,.':\-]/g, " ")
              .replace(/\s+/g, " ")
              .trim();
          }
        }
      }
    } catch (alanErr) {
      console.warn("알란 AI 호출 실패, 폴백 처리:", alanErr);
    }

    const appearanceDirect = character.appearance ? `with ${character.appearance}` : "";
    const promptCore = translatedEnglish || `detailed portrait of a ${basicInfoDesc} ${appearanceDirect}`;

    // 이미지 예시화풍: 다크 판타지 한국 웹소설 표지 스타일, 정교한 의상/장신구, 은은한 마법 입자/조명, WLOP/Artstation 메인 화풍
    const stylePreset = "dark fantasy semi-realistic digital art, Korean webnovel cover illustration, intricate ornate dark clothing with golden and purple jewels, glowing ethereal magic particles, dramatic cinematic gothic lighting, masterpiece, ultra-detailed elegant facial features, 8k resolution, WLOP artstyle, trending on Artstation";

    const finalPrompt = `masterpiece dark fantasy portrait of ${character.name}, a ${basicInfoDesc}, ${promptCore}, ${world.theme || "dark fantasy"} ${world.genre || ""} background, ${stylePreset}`;

    // 3. OpenAI 전용 이미지 재생성 (dall-e-3)
    const openAiKey = process.env.OPENAI_API_KEY;

    if (!openAiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 .env.local에 설정되어 있지 않습니다." },
        { status: 400 }
      );
    }

    const openAiModels = ["gpt-image-1", "gpt-image-1.5", "chatgpt-image-latest", "dall-e-3", "dall-e-2"];
    let newImageUrl = "";
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
            newImageUrl = item.url;
          } else if (item.b64_json) {
            newImageUrl = `data:image/png;base64,${item.b64_json}`;
          }
          if (newImageUrl) break;
        } else if (openAiJson?.error?.message) {
          openAiErrorMessage = openAiJson.error.message;
          console.warn(`OpenAI 이미지 모델 (${modelName}) 재생성 응답 메세지:`, openAiErrorMessage);
        }
      } catch (err) {
        openAiErrorMessage = err.message || "OpenAI 서버 통신 에러가 발생했습니다.";
      }
    }

    if (!newImageUrl) {
      return NextResponse.json(
        { error: `OpenAI 이미지 재생성 오류: ${openAiErrorMessage}` },
        { status: 500 }
      );
    }

    // Supabase DB update
    await supabase
      .from("characters")
      .update({ image_url: newImageUrl })
      .eq("id", characterId);

    return NextResponse.json({
      success: true,
      imageUrl: newImageUrl,
    });
  } catch (err) {
    console.error("이미지 재생성 중 예외 발생:", err);
    return NextResponse.json({ error: "이미지 재생성 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
