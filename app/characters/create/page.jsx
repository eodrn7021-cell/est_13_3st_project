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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0f111a", // Deep Background ($color_background_deep)
        color: "#ffffff",
      }}
    >
      {/* 상단 헤더 */}
      <Header variant="account" />

      {/* 
        피그마 메인 바디 세팅:
        - Dimensions: W 1200, H 870
        - Auto layout: Flow Horizontal, Gap 20, Padding X 0, Padding Y 30
        - Resizing: Sidebar -> H Fill (stretch), Form -> W Fill (flex 1)
      */}
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
        {/* 좌측 사이드바 (H: 810px Fill) */}
        <Sidebar />

        {/* 우측 캐릭터 입력 폼 영역 (H: 810px Fill) */}
        <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
          <CharacterForm onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  );
}