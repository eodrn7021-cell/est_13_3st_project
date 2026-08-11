import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(request) {
  try {
    const data = await request.json();
    const { characterId, ...updateFields } = data;

    if (!characterId) {
      return NextResponse.json({ error: "characterId가 필요합니다." }, { status: 400 });
    }

    const supabase = createClient();

    // 1. 캐릭터 테이블 (characters) 데이터 업데이트
    const { data: updatedChar, error: charError } = await supabase
      .from("characters")
      .update({
        name: updateFields.name || "무제 캐릭터",
        race: updateFields.race || null,
        gender: updateFields.gender || null,
        age: updateFields.age || null,
        job_role: updateFields.job_role || null,
        background_story: updateFields.background_story || "",
        appearance: updateFields.appearance || "",
        personality: updateFields.personality || null,
        abilities: updateFields.abilities || null,
        raw_relationship_input: updateFields.relationships || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", characterId)
      .select()
      .single();

    if (charError) {
      console.error("캐릭터 정보 수정 실패:", charError);
      return NextResponse.json(
        { error: "캐릭터 수정 중 오류가 발생했습니다: " + charError.message },
        { status: 500 }
      );
    }

    // 2. 필요 시 세계관(worlds) 테이블 데이터도 업데이트
    if (updatedChar.world_id && (updateFields.title || updateFields.theme)) {
      await supabase
        .from("worlds")
        .update({
          name: updateFields.title || updateFields.name || "무제 세계관",
          theme: updateFields.theme || "",
          genre: updateFields.genre || "",
          myth_history: updateFields.myth_history || null,
          religion_culture: updateFields.religion_culture || null,
          social_structure: updateFields.social_structure || null,
          climate_landmarks: updateFields.climate_landmarks || null,
          resource_currency: updateFields.resource_currency || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedChar.world_id);
    }

    return NextResponse.json({
      success: true,
      characterId: updatedChar.id,
    });
  } catch (err) {
    console.error("캐릭터 수정 처리 예외 발생:", err);
    return NextResponse.json(
      { error: "캐릭터 수정 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
