"use client";

import { useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import CharacterForm from "@/components/character/CharacterForm/CharacterForm";
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

  const [isWorldCheckDone, setIsWorldCheckDone] = useState(false);
  const [isCharCheckDone, setIsCharCheckDone] = useState(false);

  const handleSubmit = (formData) => {
    console.log("Form submitted:", formData);
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
                  <label className={sidebarStyles.checkItem}>
                    <input
                      type="checkbox"
                      checked={isWorldCheckDone}
                      onChange={(e) => setIsWorldCheckDone(e.target.checked)}
                    />
                    <span className="kr_body_b">세계관 필수 입력 사항 작성</span>
                  </label>
                  <label className={sidebarStyles.checkItem}>
                    <input
                      type="checkbox"
                      checked={isCharCheckDone}
                      onChange={(e) => setIsCharCheckDone(e.target.checked)}
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
                className={`${sidebarStyles.sideButton} ${sidebarStyles.active}`}
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
            onSubmit={handleSubmit}
          />
        </div>
      </main>

      {/* 모바일/태블릿 (< 1920px) 하단바: mainBody 밖에서 화면 100% 가득 참 */}
      <div className={createStyles.bottomActionSection}>
        <div className={createStyles.bottomActionContainer}>
          <button type="submit" form="characterForm" className={createStyles.primaryBtn}>
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