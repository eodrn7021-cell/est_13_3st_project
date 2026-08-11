import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    return createSupabaseClient(url, serviceKey);
  }
  return await createClient();
}

export async function POST(request) {
  try {
    const { characterId } = await request.json();

    if (!characterId) {
      return NextResponse.json({ error: "characterId가 필요합니다." }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    const realUserId = authData?.user?.id || null;

    // 1. DB에서 캐릭터 및 세계관 정보 조회
    const { data: char, error: charErr } = await supabase
      .from("characters")
      .select("*, worlds(*)")
      .eq("id", Number(characterId))
      .single();

    if (charErr || !char) {
      return NextResponse.json({ error: "캐릭터 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const promptText = `A detailed digital fantasy portrait of ${char.name || "a character"}, ${char.gender || ""} ${char.race || "human"} ${char.job_role || "adventurer"}, ${char.appearance || "stylish outfit"}, ${char.worlds?.theme || "fantasy"} background, 8k resolution, artstation masterpiece.`;

    const apiKey = process.env.OPENAI_API_KEY;
    let tempImageUrl = "";
    let lastErrorMsg = "";

    // 2. OpenAI DALL-E 3 및 DALL-E 2 순차 시도
    if (apiKey) {
      const modelsToTry = ["dall-e-3", "dall-e-2"];
      for (const modelName of modelsToTry) {
        try {
          const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: modelName,
              prompt: promptText,
              n: 1,
              size: "1024x1024",
            }),
          });

          const openaiData = await openaiRes.json();

          if (openaiRes.ok && openaiData?.data?.[0]?.url) {
            tempImageUrl = openaiData.data[0].url;
            break;
          } else if (openaiData?.error?.message) {
            lastErrorMsg = openaiData.error.message;
            console.warn(`OpenAI 모델 (${modelName}) 응답 에러:`, lastErrorMsg);
          }
        } catch (err) {
          lastErrorMsg = err.message;
        }
      }
    }

    // 3. OpenAI 실패 시 무료 폴백 AI (Pollinations AI) 사용
    if (!tempImageUrl) {
      console.warn("OpenAI 사용 불가/실패로 무료 AI 엔진 폴백 사용:", lastErrorMsg);
      const encodedPrompt = encodeURIComponent(promptText);
      const seed = Math.floor(Math.random() * 1000000);
      tempImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
    }

    let publicUrl = tempImageUrl;

    // 4. Supabase Storage (character-images 버킷) 업로드
    try {
      const imgFetchRes = await fetch(tempImageUrl);
      if (imgFetchRes.ok) {
        const imgBuffer = await imgFetchRes.arrayBuffer();
        const fileName = `character_${characterId}_${Date.now()}.png`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("character-images")
          .upload(fileName, imgBuffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (!uploadErr && uploadData?.path) {
          const { data: publicUrlObj } = supabase.storage
            .from("character-images")
            .getPublicUrl(uploadData.path);
          if (publicUrlObj?.publicUrl) {
            publicUrl = publicUrlObj.publicUrl;
          }
        } else if (uploadErr) {
          console.warn("Supabase 스토리지 업로드 실패 경고:", uploadErr.message);
        }
      }
    } catch (storageErr) {
      console.warn("스토리지 업로드 예외 발생, 생성된 URL 직연동:", storageErr);
    }

    // 5. character_images 히스토리 DB 테이블에 인서트
    const insertPayload = {
      character_id: Number(characterId),
      image_url: publicUrl,
      is_main: false,
    };

    if (realUserId) {
      insertPayload.user_id = realUserId;
    }

    const { data: histRes, error: histErr } = await supabase
      .from("character_images")
      .insert(insertPayload)
      .select();

    if (histErr) {
      console.error("character_images DB 인서트 실패:", histErr.message);
    } else {
      console.log("character_images DB 인서트 성공:", histRes);
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
    });
  } catch (err) {
    console.error("이미지 생성 API 처리 중 예외 발생:", err);
    return NextResponse.json(
      { error: "이미지 생성 처리 중 예외가 발생했습니다." },
      { status: 500 }
    );
  }
}
