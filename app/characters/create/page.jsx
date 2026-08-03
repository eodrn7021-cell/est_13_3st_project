// app/characters/create/page.jsx
"use client"; // 💡 버튼 클릭 등 프론트엔드 상호작용이 있으므로 클라이언트 컴포넌트로 선언

import { useState } from "react";
// 💡 폴더 구조(app/characters/create)에 맞춰 lib 폴더의 클라이언트 경로를 정확히 지정합니다.
import { createClient } from "../../../lib/supabase/client"; 

export default function CreateCharacterPage() {
  const supabase = createClient();
  const [status, setStatus] = useState("대기 중...");

  const handleInsertTestData = async () => {
    setStatus("데이터 전송 중... ⏳");

    try {
      // 1. 가짜 세계관 먼저 생성 (characters 테이블이 world_id를 필수로 요구하기 때문)
      const { data: worldData, error: worldError } = await supabase
        .from("worlds")
        .insert([
          {
            name: "테스트 이세계",
            theme: "판타지",
            genre: "모험",
          }
        ])
        .select() // 삽입된 데이터를 다시 돌려받기 위해 사용
        .single(); // 배열이 아닌 단일 객체로 받기

      if (worldError) throw worldError;

      // 2. 방금 만든 세계관의 ID(worldData.id)를 연결하여 가짜 캐릭터 생성
      const { data: charData, error: charError } = await supabase
        .from("characters")
        .insert([
          {
            world_id: worldData.id, // 💡 핵심: 위에서 만든 세계관의 ID
            name: "테스트 엘리안느",
            background_story: "이곳은 테스트를 위한 임시 배경 스토리입니다.",
            appearance: "은발에 푸른 눈을 가진 테스트 캐릭터",
          }
        ])
        .select()
        .single();

      if (charError) throw charError;

      setStatus(`성공! 🎉 세계관 [${worldData.name}]과 캐릭터 [${charData.name}]가 저장되었습니다.`);
      
    } catch (error) {
      console.error("DB 에러:", error);
      setStatus(`에러 발생 ❌: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>DB 연결 테스트 페이지</h1>
      <p style={{ marginBottom: "20px" }}>버튼을 누르면 Supabase로 가짜 데이터가 날아갑니다.</p>
      
      <button 
        onClick={handleInsertTestData}
        style={{
          padding: "10px 20px",
          backgroundColor: "#333",
          color: "#fff",
          cursor: "pointer",
          borderRadius: "5px",
          border: "none"
        }}
      >
        가짜 데이터 DB에 넣기
      </button>

      {/* 상태 메시지 출력 부분 */}
      <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px" }}>
        <strong>현재 상태: </strong> {status}
      </div>
    </div>
  );
}