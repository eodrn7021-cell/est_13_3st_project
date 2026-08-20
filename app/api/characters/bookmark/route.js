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
    const { characterId } = await request.json();

    if (!characterId) {
      return NextResponse.json(
        { error: "characterId가 필요합니다." },
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

    // 2. 해당 유저가 이 캐릭터를 이미 북마크했는지 확인
    const { data: existingBookmark, error: checkError } = await dbClient
      .from("character_bookmarks")
      .select("id")
      .eq("character_id", characterId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { error: "북마크 상태 확인 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    let isBookmarked = false;

    // 3. 이미 존재하면 삭제(취소), 없으면 생성(북마크)
    if (existingBookmark) {
      const { error: deleteError } = await dbClient
        .from("character_bookmarks")
        .delete()
        .eq("id", existingBookmark.id);

      if (deleteError) {
        return NextResponse.json(
          { error: "북마크 취소 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
      isBookmarked = false;
    } else {
      const { error: insertError } = await dbClient
        .from("character_bookmarks")
        .insert({
          character_id: characterId,
          user_id: userId,
        });

      if (insertError) {
        return NextResponse.json(
          { error: "북마크 등록 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
      isBookmarked = true;
    }

    return NextResponse.json({
      success: true,
      isBookmarked,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "북마크 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
