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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId");

    if (!characterId) {
      return NextResponse.json({ images: [] });
    }

    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("character_images")
      .select("image_url")
      .eq("character_id", Number(characterId))
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.warn("character_images DB 최근 4개 히스토리 조회 실패:", error.message);
      return NextResponse.json({ images: [], error: error.message });
    }

    const images = data ? data.map((item) => item.image_url) : [];
    return NextResponse.json({ images });
  } catch (err) {
    console.error("이미지 히스토리 API 예외 발생:", err);
    return NextResponse.json({ images: [], error: err.message });
  }
}
