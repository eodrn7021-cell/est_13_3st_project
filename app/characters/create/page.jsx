"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import CharacterForm from "@/components/character/CharacterForm/CharacterForm";
import WorldSelectModal from "@/components/character/WorldSelectModal/WorldSelectModal";
import CreateMobileMenu from "@/components/character/CreateMobileMenu/CreateMobileMenu";
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

  // 세계관 모달 및 선택 상태
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [userWorlds, setUserWorlds] = useState([]);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [existingWorldId, setExistingWorldId] = useState(null);
  const [existingWorldCharacters, setExistingWorldCharacters] = useState([]);

  const [activeNav, setActiveNav] = useState("world");
  const [isCharacterOpen, setIsCharacterOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  // 검색어 상태
  const [worldSearch, setWorldSearch] = useState("");

  const [formData, setFormData] = useState({});
  const [initialFormValues, setInitialFormValues] = useState({});
  const [draftCharValues, setDraftCharValues] = useState({});
  const [isWorldCheckDone, setIsWorldCheckDone] = useState(false);

  const [isCharCheckDone, setIsCharCheckDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAllCheckDone = isWorldCheckDone && isCharCheckDone;

  // 로그인 유저의 기존 세계관 목록 조회
  useEffect(() => {
    const fetchUserWorlds = async () => {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const currentUserId = authData?.user?.id || null;

        let query = supabase.from("worlds").select("*");
        if (currentUserId) {
          query = query.or(`creator_id.eq.${currentUserId},creator_id.is.null`);
        } else {
          query = query.is("creator_id", null);
        }

        const { data: worldsData } = await query.order("created_at", { ascending: false });

        if (worldsData) {
          setUserWorlds(worldsData);

          // URL 파라미터 확인 (수정 모드 진입)
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const wId = params.get("worldId");
            const cId = params.get("charId");
            
            if (wId && cId) {
              const matchedWorld = worldsData.find(w => String(w.id) === String(wId));
              if (matchedWorld) {
                setIsModalOpen(false);
                setSelectedWorld(matchedWorld);
                setExistingWorldId(matchedWorld.id);

                const filled = {
                  title: matchedWorld.name || matchedWorld.title || "",
                  theme: matchedWorld.theme || "",
                  genre: matchedWorld.genre || "",
                  myth_history: matchedWorld.myth_history || "",
                  religion_culture: matchedWorld.religion_culture || "",
                  social_structure: matchedWorld.social_structure || "",
                  climate_landmarks: matchedWorld.climate_landmarks || "",
                  resource_currency: matchedWorld.resource_currency || "",
                };

                setInitialFormValues(filled);
                setFormData((prev) => ({ ...prev, ...filled }));
                setIsWorldCheckDone(Boolean(filled.title?.trim() && filled.theme?.trim() && filled.genre?.trim()));

                // 캐릭터 목록 조회
                const { data: charsData } = await supabase
                  .from("characters")
                  .select("*, character_relations!source_character_id(*)")
                  .eq("world_id", matchedWorld.id)
                  .order("created_at", { ascending: false });

                if (charsData) {
                  setExistingWorldCharacters(charsData);
                  
                  // 해당 캐릭터 찾기
                  const targetChar = charsData.find(c => String(c.id) === String(cId));
                  if (targetChar) {
                    setActiveNav("character");
                    setSelectedCharacterId(`char_${targetChar.id}`);
                    setSelectedCharObj(targetChar);
                    setIsReadOnlyChar(false); // 수정 모드로 바로 진입
                    setIsEditMode(true);

                    // 관계 데이터 맵핑
                    const relMap = {};
                    if (targetChar.character_relations && targetChar.character_relations.length > 0) {
                      targetChar.character_relations.forEach((rel) => {
                        if (rel.target_character_id && rel.description) {
                          relMap[rel.target_character_id] = rel.description;
                        }
                      });
                    }

                    const filledChar = {
                      ...filled,
                      name: targetChar.name || "",
                      race: targetChar.race || "",
                      gender: targetChar.gender || "",
                      age: targetChar.age || "",
                      job_role: targetChar.job_role || "",
                      background_story: targetChar.background_story || "",
                      appearance: targetChar.appearance || "",
                      personality: targetChar.personality || "",
                      abilities: targetChar.abilities || "",
                      relationships: relMap, // 타겟 아이디를 Key로 가지는 객체로 매핑
                    };
                    
                    setInitialFormValues(filledChar);
                    setFormData(filledChar);

                    setIsCharCheckDone(Boolean(
                      filledChar.name?.trim() &&
                      filledChar.race?.trim() &&
                      filledChar.gender?.trim() &&
                      filledChar.age?.trim() &&
                      filledChar.job_role?.trim() &&
                      filledChar.background_story?.trim() &&
                      filledChar.appearance?.trim() &&
                      filledChar.personality?.trim()
                    ));
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("세계관 목록 조회 오류:", err);
      }
    };

    fetchUserWorlds();
  }, []);

  // 새로운 세계관 선택 시
  const handleSelectNewWorld = () => {
    setIsModalOpen(false);
    setSelectedWorld(null);
    setExistingWorldId(null);
    setExistingWorldCharacters([]);
    setInitialFormValues({});
  };

  // 기존 세계관 선택 시 (데이터 자동 바인딩 및 캐릭터 목록 조회)
  const handleSelectExistingWorld = async (chosenWorld) => {
    setIsModalOpen(false);
    setSelectedWorld(chosenWorld);
    setExistingWorldId(chosenWorld.id);

    const filled = {
      title: chosenWorld.name || chosenWorld.title || "",
      theme: chosenWorld.theme || "",
      genre: chosenWorld.genre || "",
      myth_history: chosenWorld.myth_history || "",
      religion_culture: chosenWorld.religion_culture || "",
      social_structure: chosenWorld.social_structure || "",
      climate_landmarks: chosenWorld.climate_landmarks || "",
      resource_currency: chosenWorld.resource_currency || "",
    };

    setInitialFormValues(filled);
    setFormData((prev) => ({ ...prev, ...filled }));
    setIsWorldCheckDone(Boolean(filled.title?.trim() && filled.theme?.trim() && filled.genre?.trim()));

    // 해당 세계관에 속한 기존 캐릭터 목록 조회
    try {
      const supabase = createClient();
      const { data: charsData, error } = await supabase
        .from("characters")
        .select("*, character_relations!source_character_id(*)")
        .eq("world_id", chosenWorld.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("세계관 캐릭터 목록 조회 실패:", error);
      } else if (charsData) {
        setExistingWorldCharacters(charsData);
        // 기존 세계관을 선택했으므로 캐릭터 탭이 열리도록 설정
        setActiveNav("character");
        setIsCharacterOpen(true);
      }
    } catch (err) {
      console.warn("세계관 캐릭터 목록 조회 중 예외 발생:", err);
    }
  };

  // 기존 캐릭터 선택 및 수정 모드 상태
  const [selectedCharObj, setSelectedCharObj] = useState(null);
  const [isReadOnlyChar, setIsReadOnlyChar] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState("draft_new_character");

  const worldTitle =
    selectedWorld?.name ||
    selectedWorld?.title ||
    formData.title ||
    worldData?.title ||
    worldData?.name ||
    "세계관";

  // 아코디언 캐릭터 목록 (unique id 객체 배열)
  const draftItem = {
    id: "draft_new_character",
    name: "새 캐릭터 (작성 중)",
    isDraft: true,
  };

  const existingItems = existingWorldCharacters.map((c) => ({
    id: `char_${c.id}`,
    name: c.name || "무제 캐릭터",
    isDraft: false,
    data: c,
  }));

  const characterItems = isEditMode
    ? existingItems
    : [draftItem, ...existingItems];

  const handleFormChange = (field, value, updatedData) => {
    setFormData(updatedData);

    // 새 캐릭터 작성 중일 때는 입력된 캐릭터 필드값을 draftCharValues에 기억
    if (!selectedCharObj && !isEditMode) {
      setDraftCharValues({
        name: updatedData.name || "",
        race: updatedData.race || "",
        gender: updatedData.gender || "",
        age: updatedData.age || "",
        job_role: updatedData.job_role || "",
        background_story: updatedData.background_story || "",
        appearance: updatedData.appearance || "",
        personality: updatedData.personality || "",
        abilities: updatedData.abilities || "",
        relationships: updatedData.relationships || "",
      });
    }

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

  // 기존 캐릭터 선택 처리
  const handleSelectCharacterItem = (item) => {
    setActiveNav("character");
    setSelectedCharacterId(item.id);

    if (item.isDraft) {
      // 새 캐릭터 (작성 중) 선택 ➔ 작성 중이던 임시 입력값 복원
      setSelectedCharObj(null);
      setIsReadOnlyChar(false);
      setIsEditMode(false);

      const restoreCharValues = {
        ...formData,
        name: draftCharValues.name || "",
        race: draftCharValues.race || "",
        gender: draftCharValues.gender || "",
        age: draftCharValues.age || "",
        job_role: draftCharValues.job_role || "",
        background_story: draftCharValues.background_story || "",
        appearance: draftCharValues.appearance || "",
        personality: draftCharValues.personality || "",
        abilities: draftCharValues.abilities || "",
        relationships: draftCharValues.relationships || {},
      };

      setInitialFormValues((prev) => ({ ...prev, ...restoreCharValues }));
      setFormData(restoreCharValues);

      const isCharComplete = Boolean(
        restoreCharValues.name?.trim() &&
        restoreCharValues.race?.trim() &&
        restoreCharValues.gender?.trim() &&
        restoreCharValues.age?.trim() &&
        restoreCharValues.job_role?.trim() &&
        restoreCharValues.background_story?.trim() &&
        restoreCharValues.appearance?.trim() &&
        restoreCharValues.personality?.trim()
      );
      setIsCharCheckDone(isCharComplete);
    } else {
      // 기존 캐릭터 선택 ➔ 폼에 데이터 바인딩 및 비활성화 (Read-only)
      const foundChar = item.data;
      if (foundChar) {
        setSelectedCharObj(foundChar);
        setIsReadOnlyChar(true);
        setIsEditMode(false);

        const relMap = {};
        if (foundChar.character_relations && foundChar.character_relations.length > 0) {
          foundChar.character_relations.forEach((rel) => {
            if (rel.target_character_id && rel.description) {
              relMap[rel.target_character_id] = rel.description;
            }
          });
        }

        const filledChar = {
          ...formData,
          name: foundChar.name || "",
          race: foundChar.race || "",
          gender: foundChar.gender || "",
          age: foundChar.age || "",
          job_role: foundChar.job_role || "",
          background_story: foundChar.background_story || "",
          appearance: foundChar.appearance || "",
          personality: foundChar.personality || "",
          abilities: foundChar.abilities || "",
          relationships: relMap,
        };

        setInitialFormValues((prev) => ({ ...prev, ...filledChar }));
        setFormData(filledChar);

        const isCharComplete = Boolean(
          filledChar.name?.trim() &&
          filledChar.race?.trim() &&
          filledChar.gender?.trim() &&
          filledChar.age?.trim() &&
          filledChar.job_role?.trim() &&
          filledChar.background_story?.trim() &&
          filledChar.appearance?.trim() &&
          filledChar.personality?.trim()
        );
        setIsCharCheckDone(isCharComplete);
      }
    }
  };

  // '취소' 버튼 클릭 시 ➔ 신규 캐릭터 작성 모드로 복귀
  const handleCancelEditOrView = () => {
    if (confirm("작성 및 수정 중인 내용이 저장되지 않을 수 있습니다.\n이전 페이지로 돌아가시겠습니까?")) {
      router.back();
    }
  };

  // '수정' 버튼 클릭 시 ➔ 편집 모드로 전환
  const handleStartEdit = () => {
    setIsReadOnlyChar(false);
    setIsEditMode(true);
  };

  // '수정 정보 저장' 버튼 클릭 시 ➔ 캐릭터 DB 정보만 수정 저장
  const handleUpdateOnly = async () => {
    if (!isAllCheckDone) {
      alert("모든 체크리스트를 채워주세요.");
      return;
    }
    if (!selectedCharObj || isSubmitting) return;

    // 이전 값과 비교하여 변경된 내용이 없는지 확인
    const isFormChanged = Object.keys(formData).some(
      (key) => formData[key] !== initialFormValues[key]
    );

    if (!isFormChanged) {
      // 변경된 내용이 없으면 쓸데없는 DB API 호출 없이 바로 읽기 전용 모드로 복귀
      setIsEditMode(false);
      setIsReadOnlyChar(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/characters/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          characterId: selectedCharObj.id,
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        alert(result.error || "캐릭터 수정 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/characters/${selectedCharObj.id}`);
    } catch (err) {
      console.error("캐릭터 수정 중 에러:", err);
      alert("서버 연결 처리 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  // '수정 후 이미지 재생성' 버튼 클릭 시 ➔ DB 수정 + DALL-E 신규 이미지 생성 & 스토리지/히스토리 누적 저장
  const handleUpdateAndRegenerate = async () => {
    if (!isAllCheckDone) {
      alert("모든 체크리스트를 채워주세요.");
      return;
    }
    if (!selectedCharObj || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. DB 정보 수정
      const updateRes = await fetch("/api/characters/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          characterId: selectedCharObj.id,
        }),
      });

      const updateResult = await updateRes.json();
      if (!updateRes.ok || updateResult.error) {
        alert(updateResult.error || "캐릭터 수정 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

      // 2. 상세 페이지로 이동하여 비동기로 이미지 재생성 (상세 페이지의 isGeneratingMode가 처리함)
      router.push(`/characters/${selectedCharObj.id}?generating=true`);
    } catch (err) {
      console.error("수정 후 이미지 재생성 중 에러:", err);
      alert("서버 처리 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || null;

      const res = await fetch("/api/characters/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId: currentUserId,
          existingWorldId: existingWorldId,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        console.error("서버 처리 오류:", result.error);
        alert(result.error || "캐릭터 생성 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

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
        if (!selectedCharacterId && characterItems.length > 0) {
          setSelectedCharacterId(characterItems[0].id);
        }
      }
      return nextOpen;
    });
  };

  const sidebarTopContent = (
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
            {characterItems.map((item) => {
              const isSelected = activeNav === "character" && selectedCharacterId === item.id;
              return (
                <div
                  key={item.id}
                  className={`${sidebarStyles.subItem} ${isSelected ? sidebarStyles.active : ""}`}
                  onClick={() => handleSelectCharacterItem(item)}
                  role="button"
                  tabIndex={0}
                >
                  {isSelected && (
                    <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                      auto_stories
                    </span>
                  )}
                  <span className="kr_body_b">{item.name}</span>
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
  );

  const sidebarBottomContent = (
    <>
      <button type="button" className={sidebarStyles.sideButton}>
        <span className={sidebarStyles.buttonIcon}>
          <HelpOutlineIcon />
        </span>
        <span className="kr_body_b">도움말</span>
      </button>

      {/* 하단 버튼 영역: 상태별 분기 */}
      {selectedCharObj && !isEditMode ? (
        /* 기존 캐릭터 읽기 전용 상태 ➔ 단일 '수정' 버튼만 표시 */
        <button
          type="button"
          className={`${sidebarStyles.sideButton} ${sidebarStyles.active}`}
          onClick={handleStartEdit}
        >
          <span className="kr_body_b">수정</span>
        </button>
      ) : selectedCharObj && isEditMode ? (
        /* 기존 캐릭터 수정 편집 모드 상태 ➔ '수정 정보 저장', '수정 후 이미지 재생성', '취소' 버튼 */
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
          <button
            type="button"
            className={`${sidebarStyles.sideButton} ${isAllCheckDone ? sidebarStyles.active : ""}`}
            onClick={handleUpdateOnly}
            disabled={isSubmitting}
          >
            <span className="kr_body_b">수정 정보 저장</span>
          </button>

          <button
            type="button"
            className={`${sidebarStyles.sideButton} ${isAllCheckDone ? sidebarStyles.active : ""}`}
            onClick={handleUpdateAndRegenerate}
            disabled={isSubmitting}
          >
            <span className="kr_body_b">수정 후 이미지 재생성</span>
          </button>

          <button
            type="button"
            className={sidebarStyles.sideButton}
            onClick={handleCancelEditOrView}
          >
            <span className="kr_body_b">취소</span>
          </button>
        </div>
      ) : (
        /* 새 캐릭터 작성 중 상태 ➔ 기존 '저장 후 이미지생성' 버튼 */
        <button
          type="button"
          className={`${sidebarStyles.sideButton} ${isAllCheckDone ? sidebarStyles.active : ""}`}
          onClick={handleSaveClick}
          disabled={!isAllCheckDone || isSubmitting}
        >
          <span className="kr_body_b">저장 후 이미지생성</span>
        </button>
      )}
    </>
  );

  return (
    <div className={createStyles.pageContainer}>
      {/* 모바일 햄버거 메뉴를 포함한 헤더 */}
      <CreateMobileMenu
        headerVariant="account"
        isWorldCheckDone={isWorldCheckDone}
        isCharCheckDone={isCharCheckDone}
      />

      {/* 모바일/태블릿 (<= 1024px) 상단바 */}
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
                {characterItems.map((item) => {
                  const isSelected = activeNav === "character" && selectedCharacterId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`${createStyles.topSubItem} ${isSelected ? createStyles.active : ""}`}
                      onClick={() => handleSelectCharacterItem(item)}
                      role="button"
                      tabIndex={0}
                    >
                      {isSelected && (
                        <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                          auto_stories
                        </span>
                      )}
                      <span className="kr_body_b">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className={createStyles.mainBody}>
        {/* 데스크톱 사이드바 */}
        <div className={createStyles.desktopSidebarWrapper}>
          <Sidebar
            topContent={sidebarTopContent}
            bottomContent={sidebarBottomContent}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
          <CharacterForm
            key={selectedCharacterId || "draft"}
            id="characterForm"
            mode={activeNav === "world" ? "world" : "character"}
            initialValues={initialFormValues}
            isReadOnly={isReadOnlyChar}
            worldCharacters={existingWorldCharacters}
            currentCharacterId={selectedCharObj?.id}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        </div>
      </main>

      {/* 모바일/태블릿 (< 1920px) 하단바 */}
      <div className={createStyles.bottomActionSection}>
        <div className={createStyles.bottomActionContainer}>
          {selectedCharObj && !isEditMode ? (
            <button
              type="button"
              className={`${createStyles.primaryBtn} ${createStyles.active}`}
              onClick={handleStartEdit}
            >
              <span className="kr_body_b">수정</span>
            </button>
          ) : selectedCharObj && isEditMode ? (
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", width: "100%", justifyContent: "center" }}>
              <button
                type="button"
                className={`${createStyles.primaryBtn} ${isAllCheckDone ? createStyles.active : ""}`}
                onClick={handleUpdateOnly}
                disabled={isSubmitting}
                style={{ flex: "1 1 240px", maxWidth: "240px" }}
              >
                <span className="kr_body_b">수정 정보 저장</span>
              </button>
              <button
                type="button"
                className={`${createStyles.primaryBtn} ${isAllCheckDone ? createStyles.active : ""}`}
                onClick={handleUpdateAndRegenerate}
                disabled={isSubmitting}
                style={{ flex: "1 1 240px", maxWidth: "240px" }}
              >
                <span className="kr_body_b">수정 후 이미지 재생성</span>
              </button>
              <button
                type="button"
                className={createStyles.primaryBtn}
                onClick={handleCancelEditOrView}
                style={{ flex: "1 1 240px", maxWidth: "240px", background: "rgba(255, 255, 255, 0.1)" }}
              >
                <span className="kr_body_b">취소</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={`${createStyles.primaryBtn} ${isAllCheckDone ? createStyles.active : ""}`}
              onClick={handleSaveClick}
              disabled={isSubmitting}
            >
              <span className="kr_body_b">저장후 이미지생성</span>
            </button>
          )}
        </div>
      </div>

      {/* 세계관 선택 모달 */}
      <WorldSelectModal
        isOpen={isModalOpen}
        worlds={userWorlds}
        onSelectNewWorld={handleSelectNewWorld}
        onSelectExistingWorld={handleSelectExistingWorld}
        onClose={() => router.back()}
      />

      {/* 하단 풋터 (PC에서만 표시) */}
      <div className={createStyles.desktopFooterWrapper}>
        <Footer />
      </div>
    </div>
  );
}