"use client";

import { useState } from "react";
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
    const supabase = createClient();
    let insertedWorld = null;

    try {
      // 1. 세계관(worlds) 테이블에 먼저 저장 후 ID 반환받기
      const { data: worldRes, error: worldError } = await supabase
        .from("worlds")
        .insert({
          name: data.title || data.name || "무제 세계관",
          theme: data.theme || "",
          genre: data.genre || "",
          myth_history: data.myth_history || null,
          religion_culture: data.religion_culture || null,
          social_structure: data.social_structure || null,
          climate_landmarks: data.climate_landmarks || null,
          resource_currency: data.resource_currency || null,
        })
        .select()
        .single();

      if (worldError) {
        console.error("세계관 데이터 삽입 실패:", worldError);
        alert("세계관 저장 중 오류가 발생했습니다: " + worldError.message);
        return;
      }

      insertedWorld = worldRes;

      // 2. 저장된 세계관의 id (world_id)를 외래키로 지정하여 캐릭터(characters) 테이블에 저장
      const { data: insertedChar, error: charError } = await supabase
        .from("characters")
        .insert({
          world_id: insertedWorld.id,
          name: data.name || "무제 캐릭터",
          race: data.race || null,
          gender: data.gender || null,
          age: data.age || null,
          job_role: data.job_role || null,
          background_story: data.background_story || "",
          appearance: data.appearance || "",
          personality: data.personality || null,
          abilities: data.abilities || null,
          raw_relationship_input: data.relationships || null,
          image_url: data.image_url || null,
        })
        .select()
        .single();

      if (charError) {
        console.error("캐릭터 데이터 삽입 실패. 저장된 세계관을 롤백(삭제)합니다:", charError);
        // 트랜잭션 보장: 캐릭터 저장 실패 시 1단계에서 생성된 세계관 삭제
        await supabase.from("worlds").delete().eq("id", insertedWorld.id);
        alert("캐릭터 저장 중 오류가 발생하여 전체 저장을 취소(롤백)했습니다: " + charError.message);
        return;
      }

      console.log("데이터 성공적으로 저장됨:", { insertedWorld, insertedChar });
      alert("세계관과 캐릭터가 성공적으로 저장되었습니다!");
    } catch (err) {
      console.error("데이터 저장 중 예외 발생:", err);
      if (insertedWorld?.id) {
        await supabase.from("worlds").delete().eq("id", insertedWorld.id);
      }
      alert("저장 작업 처리 중 오류가 발생하여 전체 저장을 취소했습니다.");
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
                <span className="kr_body_b">저장 / 이미지 생성</span>
              </button>

              <button type="button" className={sidebarStyles.sideButton}>
                <span className="kr_body_b">삭제</span>
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
            <span className="kr_body_b">저장 / 이미지 생성</span>
          </button>
          <button type="button" className={createStyles.deleteBtn}>
            <span className="kr_body_b">삭제</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}