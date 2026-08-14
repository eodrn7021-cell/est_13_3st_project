"use server";

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET: 특정 캐릭터의 코멘트 목록 조회
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId");

    if (!characterId) {
      return NextResponse.json(
        { error: "characterId가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from("character_comments")
      .select("id, content, created_at, user_id, profiles(nickname)")
      .eq("character_id", characterId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("코멘트 조회 오류:", error);
      return NextResponse.json(
        { error: "코멘트를 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 응답 형태를 { id, author, content, created_at }로 정리
    const formattedComments = (comments || []).map((c) => ({
      id: c.id,
      author: c.profiles?.nickname || "익명",
      content: c.content,
      created_at: c.created_at,
      user_id: c.user_id,
    }));

    return NextResponse.json({ success: true, comments: formattedComments });
  } catch (err) {
    console.error("코멘트 GET 예외:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST: 코멘트 등록
export async function POST(request) {
  try {
    const body = await request.json();
    const { characterId, content } = body;

    if (!characterId || !content?.trim()) {
      return NextResponse.json(
        { error: "characterId와 content가 필요합니다." },
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
      .from("character_comments")
      .insert({
        character_id: characterId,
        user_id: user.id,
        content: content.trim(),
      })
      .select("id, content, created_at, user_id")
      .single();

    if (insertError) {
      console.error("코멘트 등록 오류:", insertError);
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
    console.error("코멘트 POST 예외:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
