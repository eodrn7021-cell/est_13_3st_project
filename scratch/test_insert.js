import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const [k, v] = line.split("=");
  if (k && v) envVars[k.trim()] = v.trim();
});

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const key = envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log("Supabase URL:", url);
const supabase = createClient(url, key);

async function testInsert() {
  const { data, error } = await supabase
    .from("character_images")
    .insert({
      character_id: 14,
      image_url: "https://example.com/test.png",
      is_main: false,
    })
    .select();

  console.log("INSERT RESULT:", { data, error });
}

testInsert();
