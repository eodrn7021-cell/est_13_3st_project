// app/characters/create/page.jsx
"use client";

import Header from "@/components/layout/Header/Header";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import CharacterForm from "@/components/character/CharacterForm/CharacterForm";

export default function CreateCharacterPage() {
  const handleSubmit = (formData) => {
    console.log("Character form submitted:", formData);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 상단 헤더 */}
      <Header variant="account" />

      {/* 메인 바디 (Figma Dimensions: W 1200, H 870, Gap 20, Padding Y 30, Padding X 0) */}
      <main
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          padding: "30px 0",
          maxWidth: "1200px",
          width: "100%",
          minHeight: "870px",
          margin: "0 auto",
          boxSizing: "border-box",
          flex: 1,
          alignItems: "stretch",
        }}
      >
        {/* 좌측 사이드바 (variant="character" 전달 시 사이드바 내부 구성 자동 렌더링) */}
        <Sidebar variant="character" />

        {/* 우측 캐릭터 입력 폼 영역 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <CharacterForm onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  );
}