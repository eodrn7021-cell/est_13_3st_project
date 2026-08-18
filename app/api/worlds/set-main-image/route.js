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
    const { worldId, imageUrl } = await request.json();

    if (!worldId || !imageUrl) {
      return NextResponse.json(
        { error: "worldId와 imageUrl이 필요합니다." },
        { status: 400 }
      );
    }

    const authSupabase = await createClient();
    const { data: authData } = await authSupabase.auth.getUser();
    const currentUserId = authData?.user?.id || null;

    const supabase = await getSupabaseServerClient();

    // 1. 해당 세계관의 모든 world_images의 is_main을 false로 초기화
    await supabase
      .from("world_images")
      .update({ is_main: false })
      .eq("world_id", worldId);

    // 2. 선택한 imageUrl의 is_main을 true로 설정
    const { data: existingImg } = await supabase
      .from("world_images")
      .select("id")
      .eq("world_id", worldId)
      .eq("image_url", imageUrl);

    if (existingImg && existingImg.length > 0) {
      await supabase
        .from("world_images")
        .update({ is_main: true })
        .eq("id", existingImg[0].id);
    } else {
      // 혹시 해당 URL 레코드가 없으면 신규 insert
      await supabase.from("world_images").insert({
        world_id: worldId,
        user_id: currentUserId,
        image_url: imageUrl,
        is_main: true,
      });
    }

    // 3. worlds 테이블의 image_url을 선택된 URL로 업데이트
    const { error: worldErr } = await supabase
      .from("worlds")
      .update({
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", worldId);

    if (worldErr) {
      console.error("worlds table image_url update failed:", worldErr);
      return NextResponse.json(
        { error: "세계관 대표 이미지 업데이트 실패: " + worldErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      worldId,
      imageUrl,
    });
  } catch (err) {
    console.error("세계관 대표 이미지 저장 처리 예외:", err);
    return NextResponse.json(
      { error: "대표 이미지 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
