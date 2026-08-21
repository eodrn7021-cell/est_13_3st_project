import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    return createSupabaseClient(url, serviceKey);
  }
  return await createClient();
}

function buildCharacterPrompt(char) {
  const world = char.worlds || {};
  const promptParts = [];

  const identityList = [
    char.name ? `named ${char.name}` : null,
    char.age ? `${char.age} years old` : null,
    char.gender ? char.gender : null,
    char.race ? char.race : "human",
    char.job_role ? `role: ${char.job_role}` : null,
  ].filter(Boolean);

  promptParts.push(`Digital concept art portrait of a character (${identityList.join(", ")}).`);

  if (char.appearance) {
    promptParts.push(`Visual Appearance & Clothing: ${char.appearance}.`);
  }

  if (char.personality) {
    promptParts.push(`Personality & Expression: ${char.personality}.`);
  }

  if (char.abilities) {
    promptParts.push(`Abilities & Magic & Equipment: ${char.abilities}.`);
  }

  if (char.background_story) {
    promptParts.push(`Background Story Context: ${char.background_story}.`);
  }

  const worldDetails = [
    world.name || world.title ? `World: ${world.name || world.title}` : null,
    world.theme ? `Theme: ${world.theme}` : null,
    world.genre ? `Genre: ${world.genre}` : null,
    world.climate_landmarks ? `Environment: ${world.climate_landmarks}` : null,
    world.myth_history ? `Lore: ${world.myth_history}` : null,
    world.religion_culture ? `Culture: ${world.religion_culture}` : null,
  ].filter(Boolean);

  if (worldDetails.length > 0) {
    promptParts.push(`World Setting: ${worldDetails.join(", ")}.`);
  }

  promptParts.push("Art style: High quality fantasy digital illustration, detailed lighting, cinematic atmosphere, 8k resolution, artstation masterpiece.");
  promptParts.push("IMPORTANT: Do NOT include any text, letters, words, speech bubbles, dialogue boxes, stats panels, or UI elements in the image. Pure character art and background ONLY.");

  return promptParts.join(" ").slice(0, 3500);
}

export async function POST(request) {
  try {
    const { characterId } = await request.json();

    if (!characterId) {
      return NextResponse.json({ error: "characterId가 필요합니다." }, { status: 400 });
    }

    const authSupabase = await createClient();
    const { data: authData } = await authSupabase.auth.getUser();
    const realUserId = authData?.user?.id || null;

    const supabase = await getSupabaseServerClient();

    // 1. DB에서 캐릭터 및 세계관 정보 조회
    const { data: char, error: charErr } = await supabase
      .from("characters")
      .select("*, worlds(*)")
      .eq("id", Number(characterId))
      .single();

    if (charErr || !char) {
      return NextResponse.json({ error: "캐릭터 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const promptText = buildCharacterPrompt(char);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다. .env.local 파일의 OPENAI_API_KEY를 확인해주세요." },
        { status: 500 }
      );
    }

    let tempImageUrl = "";
    let tempImageBase64 = "";
    let lastErrorMsg = "";

    // 2. OpenAI gpt-image-2 시도
    const modelsToTry = ["gpt-image-2"];
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

        if (openaiRes.ok) {
          if (openaiData?.data?.[0]?.url) {
            tempImageUrl = openaiData.data[0].url;
            break;
          } else if (openaiData?.data?.[0]?.b64_json) {
            tempImageBase64 = openaiData.data[0].b64_json;
            break;
          }
        }
        
        if (openaiData?.error?.message) {
          lastErrorMsg = openaiData.error.message;

        }
      } catch (err) {
        lastErrorMsg = err.message;
      }
    }

    // 3. OpenAI 실패 시 오류 메시지 반환
    if (!tempImageUrl && !tempImageBase64) {
      return NextResponse.json(
        { error: `OpenAI 이미지 생성 실패: ${lastErrorMsg || "알 수 없는 오류"}` },
        { status: 500 }
      );
    }

    let publicUrl = tempImageUrl || "";

    // 4. Supabase Storage (character-images 버킷) 업로드
    try {
      let imgBuffer;
      if (tempImageBase64) {
        imgBuffer = Buffer.from(tempImageBase64, "base64");
      } else if (tempImageUrl) {
        const imgFetchRes = await fetch(tempImageUrl);
        if (imgFetchRes.ok) {
          imgBuffer = await imgFetchRes.arrayBuffer();
        }
      }

      if (imgBuffer) {
        const promptHash = crypto.createHash("sha256").update(promptText).digest("hex").substring(0, 16);
        const fileName = `character_${characterId}_${promptHash}.png`;

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
        }
      }
    } catch (err) {
    }

    // 5. character_images 히스토리 DB 테이블에 인서트 전, 기존 메인 이미지들 false 처리
    await supabase
      .from("character_images")
      .update({ is_main: false })
      .eq("character_id", Number(characterId));

    // 6. characters 테이블의 image_url 업데이트 (만약 DB에 트리거가 있다면 여기서 history가 자동 생성됨)
    await supabase
      .from("characters")
      .update({
        image_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", Number(characterId));

    // 7. DB 트리거로 인해 history가 자동 생성되었는지 확인
    const { data: existingImg } = await supabase
      .from("character_images")
      .select("id")
      .eq("character_id", Number(characterId))
      .eq("image_url", publicUrl);

    if (existingImg && existingImg.length > 0) {
      // 이미 생성되었다면 중복 생성을 막고 is_main 상태만 true로 설정
      await supabase
        .from("character_images")
        .update({ is_main: true })
        .eq("id", existingImg[0].id);
    } else {
      // 트리거가 없어서 생성되지 않았다면 직접 인서트
      const insertPayload = {
        character_id: Number(characterId),
        image_url: publicUrl,
        is_main: true,
      };

      if (realUserId) {
        insertPayload.user_id = realUserId;
      }

      await supabase
        .from("character_images")
        .insert(insertPayload);
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "이미지 생성 처리 중 예외가 발생했습니다." },
      { status: 500 }
    );
  }
}
