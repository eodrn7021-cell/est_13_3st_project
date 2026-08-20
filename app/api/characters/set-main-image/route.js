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
    const { characterId, imageUrl } = await request.json();

    if (!characterId || !imageUrl) {
      return NextResponse.json(
        { error: "characterId와 imageUrl이 필요합니다." },
        { status: 400 }
      );
    }

    const authSupabase = await createClient();
    const { data: authData } = await authSupabase.auth.getUser();
    const currentUserId = authData?.user?.id || null;

    const supabase = await getSupabaseServerClient();

    // 1. 해당 캐릭터의 모든 character_images의 is_main을 false로 초기화
    await supabase
      .from("character_images")
      .update({ is_main: false })
      .eq("character_id", characterId);

    // 2. 선택한 imageUrl의 is_main을 true로 설정
    const { data: existingImg } = await supabase
      .from("character_images")
      .select("id")
      .eq("character_id", characterId)
      .eq("image_url", imageUrl);

    if (existingImg && existingImg.length > 0) {
      await supabase
        .from("character_images")
        .update({ is_main: true })
        .eq("id", existingImg[0].id);
    } else {
      // 혹시 해당 URL 레코드가 없으면 신규 insert
      await supabase.from("character_images").insert({
        character_id: characterId,
        user_id: currentUserId,
        image_url: imageUrl,
        is_main: true,
      });
    }

    // 3. characters 테이블의 image_url을 선택된 URL로 업데이트
    const { error: charErr } = await supabase
      .from("characters")
      .update({
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", characterId);

    if (charErr) {
      return NextResponse.json(
        { error: "캐릭터 대표 이미지 업데이트 실패: " + charErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      characterId,
      imageUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "대표 이미지 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
