import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    return createSupabaseClient(url, serviceKey);
  }
  return null;
}

export async function POST(request) {
  try {
    const { worldId } = await request.json();

    if (!worldId) {
      return NextResponse.json(
        { error: "worldId가 필요합니다." },
        { status: 400 }
      );
    }

    // 1. 요청 쿠키 기반의 SSR 클라이언트로 로그인 사용자 정보 확인
    const authSupabase = await createClient();
    const { data: authData, error: authError } = await authSupabase.auth.getUser();
    const currentUser = authData?.user || null;

    if (authError || !currentUser) {
      return NextResponse.json(
        { error: "로그인이 필요한 서비스입니다." },
        { status: 401 }
      );
    }

    const userId = currentUser.id;
    const dbClient = getSupabaseAdminClient() || authSupabase;

    // 2. 해당 유저가 이 세계관에 이미 좋아요를 눌렀는지 확인
    const { data: existingLike, error: checkError } = await dbClient
      .from("world_likes")
      .select("id")
      .eq("world_id", worldId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) {
      console.error("좋아요 상태 확인 오류:", checkError);
      return NextResponse.json(
        { error: "좋아요 상태 확인 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    let isLiked = false;

    // 3. 이미 존재하면 삭제(취소), 없으면 생성(좋아요)
    if (existingLike) {
      const { error: deleteError } = await dbClient
        .from("world_likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) {
        console.error("좋아요 취소 실패:", deleteError);
        return NextResponse.json(
          { error: "좋아요 취소 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
      isLiked = false;
    } else {
      const { error: insertError } = await dbClient
        .from("world_likes")
        .insert({
          world_id: worldId,
          user_id: userId,
        });

      if (insertError) {
        console.error("좋아요 등록 실패:", insertError);
        return NextResponse.json(
          { error: "좋아요 등록 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
      isLiked = true;
    }

    // 4. 최신 좋아요 총 수 카운트
    const { count: likesCount, error: countError } = await dbClient
      .from("world_likes")
      .select("*", { count: "exact", head: true })
      .eq("world_id", worldId);

    if (countError) {
      console.error("좋아요 카운트 오류:", countError);
    }

    return NextResponse.json({
      success: true,
      isLiked,
      likes: typeof likesCount === "number" ? likesCount : 0,
    });
  } catch (err) {
    console.error("좋아요 토글 예외 처리:", err);
    return NextResponse.json(
      { error: "좋아요 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
