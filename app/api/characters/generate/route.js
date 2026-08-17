import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { generateCharacterSummary } from "@/lib/ai/summary";

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
    const data = await request.json();
    const supabase = await getSupabaseServerClient();
    let insertedWorld = null;

    const userId = data.userId || null;
    let worldId = data.existingWorldId;
    let isNewWorldCreated = false;

    // 1. 기존 세계관 ID가 없는 경우에만 신규 세계관(worlds) 테이블 데이터 저장
    if (!worldId) {
      const { data: worldRes, error: worldError } = await supabase
        .from("worlds")
        .insert({
          name: data.title || data.name || "무제 세계관",
          theme: data.theme || "",
          genre: data.genre || "",
          myth_history: data.myth_history || null,
          religion_culture: data.religion_culture || null,
          social_structure: data.social_structure || null,
          climate_landmarks: data.climate_landmarks || null,
          resource_currency: data.resource_currency || null,
          creator_id: userId,
        })
        .select()
        .single();

      if (worldError) {
        console.error("세계관 DB 저장 실패:", worldError);
        return NextResponse.json(
          { error: "세계관 저장 중 오류가 발생했습니다: " + worldError.message },
          { status: 500 }
        );
      }

      worldId = worldRes.id;
      isNewWorldCreated = true;
    }

    // 1.5. AI 요약 생성 (선택 사항, 에러 발생 시 null 반환됨)
    const summaryText = await generateCharacterSummary(data);

    // 2. 캐릭터(characters) 테이블 데이터 저장 (world_id 외래키 연동)
    const { data: insertedChar, error: charError } = await supabase
      .from("characters")
      .insert({
        world_id: worldId,
        creator_id: userId,
        name: data.name || "무제 캐릭터",
        race: data.race || null,
        gender: data.gender || null,
        age: data.age || null,
        job_role: data.job_role || null,
        background_story: data.background_story || "",
        appearance: data.appearance || "",
        personality: data.personality || null,
        abilities: data.abilities || null,
        raw_relationship_input: data.relationships || null,
        summary_text: summaryText,
        image_url: null,
      })
      .select()
      .single();

    if (charError) {
      console.error("캐릭터 DB 저장 실패:", charError);
      if (isNewWorldCreated) {
        await supabase.from("worlds").delete().eq("id", worldId);
      }
      return NextResponse.json(
        { error: "캐릭터 저장 중 오류가 발생하여 롤백되었습니다: " + charError.message },
        { status: 500 }
      );
    }

    // 3. 관계(character_relations) 테이블 저장
    if (data.relationships && typeof data.relationships === "object") {
      const relationsToInsert = [];
      for (const [targetId, desc] of Object.entries(data.relationships)) {
        if (desc && desc.trim() !== "") {
          relationsToInsert.push({
            source_character_id: insertedChar.id,
            target_character_id: parseInt(targetId, 10),
            description: desc.trim(),
          });
        }
      }

      if (relationsToInsert.length > 0) {
        const { error: relError } = await supabase
          .from("character_relations")
          .insert(relationsToInsert);
        
        if (relError) {
          console.error("캐릭터 관계 정보 저장 실패:", relError);
        }
      }
    }

    // DB 저장 후 즉시 상세 페이지로 이동하도록 characterId 반환 (이미지 생성은 상세 화면에서 비동기 처리)
    return NextResponse.json({
      success: true,
      characterId: insertedChar.id,
    });
  } catch (err) {
    console.error("서버 처리 중 전체 예외 발생:", err);
    return NextResponse.json(
      { error: "서버 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
