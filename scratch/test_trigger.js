const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  const key = parts[0];
  const val = parts.slice(1).join('=');
  if (key && val) acc[key.trim()] = val.trim().replace(/^"|"$/g, '');
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTriggers() {
  const { data: char, error: err1 } = await supabase.from('characters').insert({ 
    name: 'Test Trigger', age: '10', gender: 'M', race: 'Human', job_role: 'Tester' 
  }).select().single();
  console.log('Created character:', char ? char.id : err1);
  if (!char) return;

  const dummyUrl = 'https://example.com/test_trigger_' + Date.now() + '.png';
  await supabase.from('characters').update({ image_url: dummyUrl }).eq('id', char.id);
  
  const { data: images } = await supabase.from('character_images').select('*').eq('character_id', char.id);
  console.log('Images after update (from DB triggers if any):', images);
  
  await supabase.from('characters').delete().eq('id', char.id);
}
checkTriggers();
