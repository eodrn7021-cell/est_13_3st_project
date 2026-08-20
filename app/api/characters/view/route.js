import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { characterId } = await req.json();

    if (!characterId) {
      return NextResponse.json({ error: "캐릭터 ID가 필요합니다." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. 현재 조회수 가져오기
    const { data: character, error: fetchError } = await supabase
      .from("characters")
      .select("view_count")
      .eq("id", characterId)
      .single();

    if (fetchError || !character) {
      return NextResponse.json({ error: "캐릭터를 찾을 수 없습니다." }, { status: 404 });
    }

    // 2. 조회수 1 증가 (기존 값이 null이면 0으로 간주)
    const currentViewCount = character.view_count || 0;
    const { error: updateError } = await supabase
      .from("characters")
      .update({ view_count: currentViewCount + 1 })
      .eq("id", characterId);

    if (updateError) {
      return NextResponse.json({ error: "조회수 업데이트에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true, view_count: currentViewCount + 1 });
  } catch (err) {
    return NextResponse.json({ error: "서버 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
