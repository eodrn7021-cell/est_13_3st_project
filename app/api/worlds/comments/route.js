import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET: 특정 세계관의 코멘트 목록 조회
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const worldId = searchParams.get("worldId");

    if (!worldId) {
      return NextResponse.json(
        { error: "worldId가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from("world_comments")
      .select("id, content, created_at, user_id")
      .eq("world_id", worldId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("세계관 코멘트 조회 오류:", error);
      return NextResponse.json(
        { error: "코멘트를 불러오는 중 오류가 발생했습니다.", details: error },
        { status: 500 }
      );
    }

    let formattedComments = [];

    if (comments && comments.length > 0) {
      // 작성자 닉네임을 가져오기 위한 추가 쿼리 (Foreign Key 이슈 우회)
      const userIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))];
      
      let profilesMap = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, nickname")
          .in("id", userIds);
          
        if (profilesData) {
          profilesData.forEach((p) => {
            profilesMap[p.id] = p.nickname;
          });
        }
      }

      // 응답 형태를 { id, author, content, created_at, user_id }로 정리
      formattedComments = comments.map((c) => ({
        id: c.id,
        author: profilesMap[c.user_id] || "익명",
        content: c.content,
        created_at: c.created_at,
        user_id: c.user_id,
      }));
    }

    return NextResponse.json({ success: true, comments: formattedComments });
  } catch (err) {
    console.error("세계관 코멘트 GET 예외:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST: 세계관 코멘트 등록
export async function POST(request) {
  try {
    const body = await request.json();
    const { worldId, content } = body;

    if (!worldId || !content?.trim()) {
      return NextResponse.json(
        { error: "worldId와 content가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 코멘트 삽입
    const { data: inserted, error: insertError } = await supabase
      .from("world_comments")
      .insert({
        world_id: worldId,
        user_id: user.id,
        content: content.trim(),
      })
      .select("id, content, created_at, user_id")
      .single();

    if (insertError) {
      console.error("세계관 코멘트 등록 오류:", insertError);
      return NextResponse.json(
        { error: "코멘트 등록 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 작성자 닉네임 조회
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();

    const formattedComment = {
      id: inserted.id,
      author: profile?.nickname || "익명",
      content: inserted.content,
      created_at: inserted.created_at,
      user_id: inserted.user_id,
    };

    return NextResponse.json({ success: true, comment: formattedComment });
  } catch (err) {
    console.error("세계관 코멘트 POST 예외:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
