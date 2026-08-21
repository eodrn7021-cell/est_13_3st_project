import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // 1. Create a dummy character
  const { data: char, error: err1 } = await supabase.from('characters').insert({ 
    name: 'Test Trigger', age: '10', gender: 'M', race: 'Human', job_role: 'Tester' 
  }).select().single();
  
  if (err1 || !char) {
    return NextResponse.json({ error: err1 });
  }
  
  // 2. Update its image_url
  const dummyUrl = 'https://example.com/test_trigger_' + Date.now() + '.png';
  await supabase.from('characters').update({ image_url: dummyUrl }).eq('id', char.id);
  
  // 3. Check character_images
  const { data: images } = await supabase.from('character_images').select('*').eq('character_id', char.id);
  
  // 4. Cleanup
  await supabase.from('characters').delete().eq('id', char.id);
  
  return NextResponse.json({ images });
}
