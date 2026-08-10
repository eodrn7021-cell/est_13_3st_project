"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import CharacterForm from "@/components/character/CharacterForm/CharacterForm";
import { createClient } from "@/lib/supabase/client";
import sidebarStyles from "@/components/layout/Sidebar/Sidebar.module.scss";
import createStyles from "./create.module.scss";

function HelpOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
      <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
    </svg>
  );
}

export default function CreateCharacterPage({ worldData, characterListData }) {
  const router = useRouter();
  const worldTitle = worldData?.title || worldData?.name || "세계관";
  const characterList =
    characterListData && characterListData.length > 0
      ? characterListData
      : ["캐릭터"];

  const [activeNav, setActiveNav] = useState("world");
  const [isCharacterOpen, setIsCharacterOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(characterList[0]);

  const [formData, setFormData] = useState({});
  const [isWorldCheckDone, setIsWorldCheckDone] = useState(false);
  const [isCharCheckDone, setIsCharCheckDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAllCheckDone = isWorldCheckDone && isCharCheckDone;

  const handleFormChange = (field, value, updatedData) => {
    setFormData(updatedData);

    const isWorldComplete = Boolean(
      updatedData.title?.trim() &&
      updatedData.theme?.trim() &&
      updatedData.genre?.trim()
    );
    setIsWorldCheckDone(isWorldComplete);

    const isCharComplete = Boolean(
      updatedData.name?.trim() &&
      updatedData.race?.trim() &&
      updatedData.gender?.trim() &&
      updatedData.age?.trim() &&
      updatedData.job_role?.trim() &&
      updatedData.background_story?.trim() &&
      updatedData.appearance?.trim() &&
      updatedData.personality?.trim()
    );
    setIsCharCheckDone(isCharComplete);
  };

  const handleSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 서버 단 API Route (/api/characters/generate)로 데이터 전달
      // DB 저장, 롤백 관리, 알란 AI 영문 번역, 이미지 생성 및 DB 업데이트를 모두 서버에서 안전하게 수행
      const res = await fetch("/api/characters/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        console.error("서버 처리 오류:", result.error);
        alert(result.error || "캐릭터 생성 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

      // DB 저장 완료 후 즉시 생성된 캐릭터 상세 페이지 (/characters/[id]?generating=true)로 이동
      router.push(`/characters/${result.characterId}?generating=true`);
    } catch (err) {
      console.error("서버 요청 중 예외 발생:", err);
      alert("서버 연결 처리 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  const handleSaveClick = (e) => {
    if (e) e.preventDefault();
    if (!isAllCheckDone) {
      alert("모든 체크리스트를 채워주세요.");
      return;
    }
    handleSubmit(formData);
  };

  const handleSelectWorld = () => {
    setActiveNav("world");
    setIsCharacterOpen(false);
  };

  const handleToggleCharacterAccordion = () => {
    setIsCharacterOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        setActiveNav("character");
        if (!selectedCharacter && characterList.length > 0) {
          setSelectedCharacter(characterList[0]);
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
    <div className={createStyles.pageContainer}>
      <Header variant="account" />

      {/* 모바일/태블릿 (<= 1024px) 상단바: mainBody 밖에서 화면 100% 가득 참 */}
      <div className={createStyles.topNavSection}>
        <div className={createStyles.topNavContainer}>
          <button
            type="button"
            className={`${createStyles.topTabButton} ${activeNav === "world" ? createStyles.active : ""}`}
            onClick={handleSelectWorld}
          >
            <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
              history_edu
            </span>
            <span className="kr_body_b">{worldTitle}</span>
          </button>

          <div>
            <button
              type="button"
              className={createStyles.topTabButton}
              onClick={handleToggleCharacterAccordion}
            >
              <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                person
              </span>
              <span className="kr_body_b">캐릭터</span>
            </button>

            {isCharacterOpen && (
              <div className={createStyles.topAccordionList}>
                {characterList.map((charName) => {
                  const isSelected = activeNav === "character" && selectedCharacter === charName;
                  return (
                    <div
                      key={charName}
                      className={`${createStyles.topSubItem} ${isSelected ? createStyles.active : ""}`}
                      onClick={() => handleSelectCharacterItem(charName)}
                      role="button"
                      tabIndex={0}
                    >
                      {isSelected && (
                        <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                          auto_stories
                        </span>
                      )}
                      <span className="kr_body_b">{charName}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className={createStyles.mainBody}>
        {/* 데스크톱 (>= 1920px) 사이드바 */}
        <Sidebar
          topContent={
            <>
              <button
                type="button"
                className={`${sidebarStyles.accordionButton} ${activeNav === "world" ? sidebarStyles.active : ""}`}
                onClick={handleSelectWorld}
              >
                <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                  history_edu
                </span>
                <span className="kr_body_b">{worldTitle}</span>
              </button>

              <div>
                <button
                  type="button"
                  className={sidebarStyles.accordionButton}
                  onClick={handleToggleCharacterAccordion}
                >
                  <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                    person
                  </span>
                  <span className="kr_body_b">캐릭터</span>
                </button>

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
                            <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                              auto_stories
                            </span>
                          )}
                          <span className="kr_body_b">{charName}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={sidebarStyles.checklistSection}>
                <div className={`kr_body_b ${sidebarStyles.checklistTitle}`}>체크 리스트</div>
                <div className={sidebarStyles.checklistItems}>
                  <label className={sidebarStyles.checkItem} style={{ cursor: "default" }}>
                    <input
                      type="checkbox"
                      checked={isWorldCheckDone}
                      readOnly
                      onClick={(e) => e.preventDefault()}
                    />
                    <span className="kr_body_b">세계관 필수 입력 사항 작성</span>
                  </label>
                  <label className={sidebarStyles.checkItem} style={{ cursor: "default" }}>
                    <input
                      type="checkbox"
                      checked={isCharCheckDone}
                      readOnly
                      onClick={(e) => e.preventDefault()}
                    />
                    <span className="kr_body_b">캐릭터 필수 입력 사항 작성</span>
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
                <span className="kr_body_b">도움말</span>
              </button>

              <button
                type="button"
                className={`${sidebarStyles.sideButton} ${isAllCheckDone ? sidebarStyles.active : ""}`}
                onClick={handleSaveClick}
              >
                <span className="kr_body_b">저장후 이미지생성</span>
              </button>
            </>
          }
        />

        <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
          <CharacterForm
            id="characterForm"
            mode={activeNav === "world" ? "world" : "character"}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        </div>
      </main>

      {/* 모바일/태블릿 (< 1920px) 하단바: mainBody 밖에서 화면 100% 가득 참 */}
      <div className={createStyles.bottomActionSection}>
        <div className={createStyles.bottomActionContainer}>
          <button
            type="button"
            className={`${createStyles.primaryBtn} ${isAllCheckDone ? createStyles.active : ""}`}
            onClick={handleSaveClick}
          >
            <span className="kr_body_b">저장후 이미지생성</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}