// app/characters/create/page.jsx
"use client";

import { useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import CharacterForm from "@/components/character/CharacterForm/CharacterForm";
import sidebarStyles from "@/components/layout/Sidebar/Sidebar.module.scss";

// 구글 머티리얼 아이콘 'help_outline' SVG 벡터
function HelpOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
    </svg>
  );
}

export default function CreateCharacterPage() {
  // 활성화 메뉴 상태 ('world' | 'character') - 초기: 'character'
  const [activeNav, setActiveNav] = useState("character");
  const [isCharacterOpen, setIsCharacterOpen] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState("엘리안느"); // 1번 항목 초기 활성화

  // 체크리스트 상태 - 초기: 꺼진 상태 (false)
  const [isWorldCheckDone, setIsWorldCheckDone] = useState(false);
  const [isCharCheckDone, setIsCharCheckDone] = useState(false);

  const handleSubmit = (formData) => {
    console.log("Character form submitted:", formData);
  };

  const characterList = ["엘리안느", "아리안나", "아리안느"];

  // 고요한 성체 선택 시 아코디언 접기
  const handleSelectWorld = () => {
    setActiveNav("world");
    setIsCharacterOpen(false);
  };

  // 아코디언 토글 시: 펼칠 때 1번 항목 및 character 메뉴 활성화
  const handleToggleCharacterAccordion = () => {
    setIsCharacterOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        setActiveNav("character");
        if (!selectedCharacter) {
          setSelectedCharacter("엘리안느"); // 1번 항목 지정
        }
      }
      return nextOpen;
    });
  };

  const handleSelectCharacterItem = (charName) => {
    setActiveNav("character");
    setSelectedCharacter(charName);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      {/* 상단 헤더 */}
      <Header variant="account" />

      {/* 메인 바디 컨테이너 */}
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
        {/* 좌측 사이드바 (topContent + bottomContent) */}
        <Sidebar
          topContent={
            <>
              {/* 1. 고요한 성체 */}
              <button
                type="button"
                className={`${sidebarStyles.accordionButton} ${activeNav === "world" ? sidebarStyles.active : ""}`}
                onClick={handleSelectWorld}
              >
                <span className="material-icons-outlined" style={{ fontSize: 20, display: "inline-flex", alignItems: "center" }}>
                  history_edu
                </span>
                <span>고요한 성체</span>
              </button>

              {/* 2. 캐릭터 아코디언 */}
              <div>
                <button
                  type="button"
                  className={sidebarStyles.accordionButton}
                  onClick={handleToggleCharacterAccordion}
                >
                  <span className="material-icons-outlined" style={{ fontSize: 20, display: "inline-flex", alignItems: "center" }}>
                    person
                  </span>
                  <span>캐릭터</span>
                </button>

                {/* 3. 아코디언 서브목록 (1번 항목 '엘리안느' 기본 활성화) */}
                {isCharacterOpen && (
                  <div className={sidebarStyles.accordionList}>
                    {characterList.map((charName) => {
                      const isSelected = activeNav === "character" && selectedCharacter === charName;
                      return (
                        <div
                          key={charName}
                          className={`${sidebarStyles.subItem} ${isSelected ? sidebarStyles.active : ""}`}
                          onClick={() => handleSelectCharacterItem(charName)}
                          role="button"
                          tabIndex={0}
                        >
                          {isSelected && (
                            <span className="material-icons-outlined" style={{ fontSize: 18, display: "inline-flex", alignItems: "center" }}>
                              auto_stories
                            </span>
                          )}
                          <span>{charName}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. 체크 리스트 영역 (초기 상태: 모두 꺼짐) */}
              <div className={sidebarStyles.checklistSection}>
                <div className={sidebarStyles.checklistTitle}>체크 리스트</div>
                <div className={sidebarStyles.checklistItems}>
                  <label className={sidebarStyles.checkItem}>
                    <input
                      type="checkbox"
                      checked={isWorldCheckDone}
                      onChange={(e) => setIsWorldCheckDone(e.target.checked)}
                    />
                    <span>세계관 필수 입력 사항 작성</span>
                  </label>
                  <label className={sidebarStyles.checkItem}>
                    <input
                      type="checkbox"
                      checked={isCharCheckDone}
                      onChange={(e) => setIsCharCheckDone(e.target.checked)}
                    />
                    <span>캐릭터 필수 입력 사항 작성</span>
                  </label>
                </div>
              </div>
            </>
          }
          bottomContent={
            <>
              <button type="button" className={sidebarStyles.sideButton}>
                <span className={sidebarStyles.buttonIcon}>
                  <HelpOutlineIcon />
                </span>
                <span>도움말</span>
              </button>

              <button
                type="button"
                className={`${sidebarStyles.sideButton} ${sidebarStyles.active}`}
              >
                <span>저장 / 이미지 생성</span>
              </button>

              <button type="button" className={sidebarStyles.sideButton}>
                <span>삭제</span>
              </button>
            </>
          }
        />

        {/* 우측 캐릭터 입력 폼 영역 (H: 810px Fill) */}
        <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
          <CharacterForm onSubmit={handleSubmit} />
        </div>
      </main>

      <Footer />
    </div>
  );
}