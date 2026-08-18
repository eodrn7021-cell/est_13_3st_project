import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const worldId = searchParams.get("worldId");

  if (!worldId) {
    return NextResponse.json({ error: "worldId is required" }, { status: 400 });
  }

  // 서비스 키를 사용하여 RLS를 우회하고 데이터를 강제로 읽어옵니다.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createSupabaseClient(url, serviceKey);

  try {
    const { data, error } = await supabase
      .from("characters")
      .select("*, character_relations!source_character_id(*)")
      .eq("world_id", worldId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
