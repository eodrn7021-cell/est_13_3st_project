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

function buildWorldPrompt(world) {
  const promptParts = [];

  promptParts.push(`Digital concept art, wide landscape view of a fantasy world.`);
  
  if (world.name) promptParts.push(`World Name: ${world.name}.`);
  if (world.theme) promptParts.push(`Theme: ${world.theme}.`);
  if (world.genre) promptParts.push(`Genre: ${world.genre}.`);
  if (world.climate_landmarks) promptParts.push(`Environment & Landmarks: ${world.climate_landmarks}.`);
  if (world.myth_history) promptParts.push(`Lore & History: ${world.myth_history}.`);
  if (world.religion_culture) promptParts.push(`Culture: ${world.religion_culture}.`);

  promptParts.push("Art style: High quality digital environment illustration, epic scale, detailed lighting, cinematic atmosphere, 8k resolution, artstation masterpiece.");
  promptParts.push("IMPORTANT: No characters in the foreground, focus on the landscape, architecture, and environment. Do NOT include any text, letters, words, or UI elements.");

  return promptParts.join(" ").slice(0, 3500);
}

export async function POST(request) {
  try {
    const { worldId } = await request.json();

    if (!worldId) {
      return NextResponse.json({ error: "worldId가 필요합니다." }, { status: 400 });
    }

    const authSupabase = await createClient();
    const { data: authData } = await authSupabase.auth.getUser();
    const realUserId = authData?.user?.id || null;

    const supabase = await getSupabaseServerClient();

    // 1. DB에서 세계관 정보 조회
    const { data: world, error: worldErr } = await supabase
      .from("worlds")
      .select("*")
      .eq("id", Number(worldId))
      .single();

    if (worldErr || !world) {
      return NextResponse.json({ error: "세계관 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const promptText = buildWorldPrompt(world);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    let tempImageUrl = "";
    let tempImageBase64 = "";
    let lastErrorMsg = "";

    // 2. OpenAI 이미지 생성 시도
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

    if (!tempImageUrl && !tempImageBase64) {
      return NextResponse.json(
        { error: `OpenAI 이미지 생성 실패: ${lastErrorMsg || "알 수 없는 오류"}` },
        { status: 500 }
      );
    }

    let publicUrl = tempImageUrl || "";

    // 3. Supabase Storage (world-images 버킷) 업로드
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
        const fileName = `world_${worldId}_${Date.now()}.png`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("world-images")
          .upload(fileName, imgBuffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (!uploadErr && uploadData?.path) {
          const { data: publicUrlObj } = supabase.storage
            .from("world-images")
            .getPublicUrl(uploadData.path);
          if (publicUrlObj?.publicUrl) {
            publicUrl = publicUrlObj.publicUrl;
          }
        } else if (uploadErr) {
          return NextResponse.json(
            { error: `스토리지 업로드 실패: ${uploadErr.message}. (Storage Policy를 확인해주세요)` },
            { status: 500 }
          );
        }
      }
    } catch (err) {
    }

    // 4. world_images 히스토리 DB 테이블에 인서트
    const insertPayload = {
      world_id: Number(worldId),
      image_url: publicUrl,
      is_main: false,
    };

    if (realUserId) {
      insertPayload.user_id = realUserId;
    }

    const { data: histRes, error: histErr } = await supabase
      .from("world_images")
      .insert(insertPayload)
      .select();

    if (histErr) {
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
