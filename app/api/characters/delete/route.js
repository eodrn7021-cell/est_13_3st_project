import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { characterId } = body;

    if (!characterId) {
      return NextResponse.json({ error: "캐릭터 ID가 필요합니다." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 2. 해당 캐릭터의 소유자 확인
    const { data: character, error: charError } = await supabase
      .from("characters")
      .select("creator_id")
      .eq("id", characterId)
      .single();

    if (charError || !character) {
      return NextResponse.json({ error: "캐릭터를 찾을 수 없습니다." }, { status: 404 });
    }

    if (character.creator_id !== user.id) {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    }

    // 3. 캐릭터 삭제 (Supabase에서 cascade 설정이 되어있다고 가정, 안 되어 있다면 수동 삭제 필요)
    // 수동 삭제: 연관된 likes, bookmarks, comments 등
    await Promise.all([
      supabase.from("character_likes").delete().eq("character_id", characterId),
      supabase.from("character_bookmarks").delete().eq("character_id", characterId),
      supabase.from("character_comments").delete().eq("character_id", characterId),
      supabase.from("character_images").delete().eq("character_id", characterId)
    ]);

    const { error: deleteError } = await supabase
      .from("characters")
      .delete()
      .eq("id", characterId);

    if (deleteError) {
      return NextResponse.json({ error: "캐릭터 삭제에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
