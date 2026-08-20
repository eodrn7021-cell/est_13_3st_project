import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { characterId } = await req.json();

    if (!characterId) {
      return NextResponse.json({ error: "캐릭터 ID가 필요합니다." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. 현재 접속한 유저의 권한을 무시하고 조회수를 1 올리는 RPC 함수 호출
    const { error: updateError } = await supabase
      .rpc('increment_view_count', { target_id: characterId });

    if (updateError) {
      console.error("RPC Error:", updateError);
      return NextResponse.json({ error: "조회수 업데이트에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Catch Error:", err);
    return NextResponse.json({ error: "서버 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
