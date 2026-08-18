"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation/MobileNavigation";
import { createClient } from "@/lib/supabase/client";

import styles from "./my-trash.module.scss";

/* ========================================
   Supabase Client
======================================== */

const supabase = createClient();

/* ========================================
   기본 이미지
======================================== */

const defaultCharacterImages = [
  "/images/home/recommended-character-01.webp",
  "/images/home/recommended-character-02.webp",
  "/images/home/recommended-character-03.webp",
];

/* ========================================
   현재 시안 캐릭터 이미지 매핑
======================================== */

const characterImageMap = {
  22: "/images/home/recommended-character-01.webp",
  23: "/images/home/recommended-character-02.webp",
  24: "/images/home/recommended-character-03.webp",
  25: "/images/home/recommended-character-03.webp",
};

/* ========================================
   현재 시안 캐릭터 태그 매핑
======================================== */

const characterTagMap = {
  22: ["엘프", "성녀", "치유"],
  23: ["왕자", "암흑", "야망"],
  24: ["기사", "왕국", "모험"],
  25: ["기사", "왕국", "개척"],
};

/* ========================================
   캐릭터 화면 데이터 변환
======================================== */

const formatCharacter = (character, index) => {
  const image =
    characterImageMap[character.id] ||
    character.image_url ||
    character.image ||
    defaultCharacterImages[index % defaultCharacterImages.length];

  const description =
    character.description ||
    character.background_story ||
    `${character.race || "미정"} 종족의 캐릭터입니다.`;

  const tags =
    characterTagMap[character.id] || [character.race, character.job_role].filter(Boolean);

  return {
    ...character,
    image,
    description,
    tags,
  };
};

/* ========================================
   Page
======================================== */

const MyTrashPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ========================================
     휴지통 캐릭터
  ======================================== */

  const [trashCharacters, setTrashCharacters] = useState([]);

  const [loading, setLoading] = useState(true);

  /* ========================================
     복원 중인 캐릭터
  ======================================== */

  const [restoringId, setRestoringId] = useState(null);

  /* ========================================
     영구 삭제 중인 캐릭터
  ======================================== */

  const [deletingId, setDeletingId] = useState(null);

  /* ========================================
     휴지통 데이터 조회
  ======================================== */

  useEffect(() => {
    const fetchTrashCharacters = async () => {
      setLoading(true);

      try {
        /* ----------------------------------------
           1. 로그인 사용자 확인
        ---------------------------------------- */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          console.warn("로그인한 사용자가 없습니다.");

          setTrashCharacters([]);

          return;
        }

        console.log("휴지통 현재 사용자 UUID:", user.id);

        /* ----------------------------------------
           2. 현재 사용자의 휴지통 조회
        ---------------------------------------- */

        const { data: trashData, error: trashError } = await supabase
          .from("character_trash")
          .select("character_id")
          .eq("user_id", user.id);

        if (trashError) {
          throw trashError;
        }

        console.log("휴지통 데이터:", trashData);

        /* ----------------------------------------
           휴지통이 비어있는 경우
        ---------------------------------------- */

        if (!trashData || trashData.length === 0) {
          setTrashCharacters([]);

          return;
        }

        /* ----------------------------------------
           3. character_id 추출
        ---------------------------------------- */

        const characterIds = trashData.map((item) => item.character_id);

        /* ----------------------------------------
           4. characters 데이터 조회
           
           휴지통에 들어간 캐릭터만 조회
        ---------------------------------------- */

        const { data: characterData, error: characterError } = await supabase
          .from("characters")
          .select("*")
          .in("id", characterIds)
          .order("id", { ascending: true });

        if (characterError) {
          throw characterError;
        }

        console.log("휴지통 캐릭터:", characterData);

        /* ----------------------------------------
           5. 화면용 데이터 변환
        ---------------------------------------- */

        const formattedCharacters = (characterData ?? []).map((character, index) =>
          formatCharacter(character, index),
        );

        setTrashCharacters(formattedCharacters);
      } catch (error) {
        console.error("휴지통 조회 실패:", error);

        setTrashCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrashCharacters();
  }, []);

  /* ========================================
     캐릭터 복원
  ======================================== */

  const handleRestoreCharacter = async (characterId) => {
    if (restoringId || deletingId) {
      return;
    }

    const confirmed = window.confirm("이 캐릭터를 복원하시겠습니까?");

    if (!confirmed) {
      return;
    }

    setRestoringId(characterId);

    try {
      /* ----------------------------------------
         현재 로그인 사용자 확인
      ---------------------------------------- */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        alert("로그인이 필요합니다.");

        return;
      }

      /* ----------------------------------------
         character_trash에서 삭제
         → 복원
      ---------------------------------------- */

      const { error: deleteError } = await supabase
        .from("character_trash")
        .delete()
        .eq("character_id", characterId)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      /* ----------------------------------------
         화면에서도 제거
      ---------------------------------------- */

      setTrashCharacters((prevCharacters) =>
        prevCharacters.filter((character) => character.id !== characterId),
      );

      alert("캐릭터가 복원되었습니다.");
    } catch (error) {
      console.error("캐릭터 복원 실패:", error);

      alert("캐릭터를 복원하지 못했습니다.");
    } finally {
      setRestoringId(null);
    }
  };

  /* ========================================
     캐릭터 영구 삭제
  ======================================== */

  const handlePermanentDelete = async (characterId) => {
    if (restoringId || deletingId) {
      return;
    }

    const character = trashCharacters.find((item) => item.id === characterId);

    const characterName = character?.name || "이 캐릭터";

    const confirmed = window.confirm(
      `"${characterName}"을(를) 영구적으로 삭제하시겠습니까?\n\n영구 삭제한 캐릭터는 복원할 수 없습니다.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(characterId);

    try {
      /* ----------------------------------------
         1. 현재 로그인 사용자 확인
      ---------------------------------------- */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        alert("로그인이 필요합니다.");

        return;
      }

      console.log("영구 삭제 캐릭터:", characterId);
      console.log("영구 삭제 사용자:", user.id);

      /* ----------------------------------------
         2. 내 즐겨찾기에서 제거
         
         해당 캐릭터를 내가 즐겨찾기한 경우
         함께 정리
      ---------------------------------------- */

      const { error: bookmarkError } = await supabase
        .from("character_bookmarks")
        .delete()
        .eq("character_id", characterId)
        .eq("user_id", user.id);

      if (bookmarkError) {
        throw bookmarkError;
      }

      /* ----------------------------------------
         3. 휴지통 기록 제거
      ---------------------------------------- */

      const { error: trashError } = await supabase
        .from("character_trash")
        .delete()
        .eq("character_id", characterId)
        .eq("user_id", user.id);

      if (trashError) {
        throw trashError;
      }

      /* ----------------------------------------
         4. characters에서 실제 삭제
         
         여기서부터 실제 데이터가 삭제됨
      ---------------------------------------- */

      const { error: characterError } = await supabase
        .from("characters")
        .delete()
        .eq("id", characterId)
        .eq("creator_id", user.id);

      if (characterError) {
        throw characterError;
      }

      /* ----------------------------------------
         5. 화면에서도 제거
      ---------------------------------------- */

      setTrashCharacters((prevCharacters) =>
        prevCharacters.filter((character) => character.id !== characterId),
      );

      alert("캐릭터가 영구적으로 삭제되었습니다.");
    } catch (error) {
      console.error("캐릭터 영구 삭제 실패:", error);

      alert(
        "캐릭터를 영구적으로 삭제하지 못했습니다.\n\n관련 데이터가 남아 있거나 삭제 권한이 없는 경우일 수 있습니다.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ========================================
     태그
  ======================================== */

  const renderTags = (character) => {
    if (!character.tags || character.tags.length === 0) {
      return "정보 없음";
    }

    return character.tags.join(" · ");
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <div className={styles.pageWrapper}>
      {/* =================================
          Header
      ================================= */}

      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* =================================
          Sidebar + Main
      ================================= */}

      <div className={styles.contentLayout}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page="trash" />

        <main className={styles.page}>
          <div className={styles.container}>
            {/* =================================
                Title
            ================================= */}

            <section className={styles.titleSection}>
              <div>
                <h1>휴지통</h1>

                <p>삭제한 캐릭터를 확인하고 복원하거나 영구적으로 삭제할 수 있습니다.</p>
              </div>

              <Link href="/my-characters" className={styles.backButton}>
                내 캐릭터
              </Link>
            </section>

            {/* =================================
                Character List
            ================================= */}

            <section className={styles.characterSection}>
              {loading ? (
                <p className={styles.message}>휴지통을 불러오는 중입니다...</p>
              ) : trashCharacters.length === 0 ? (
                <p className={styles.message}>휴지통이 비어있습니다.</p>
              ) : (
                <div className={styles.characterGrid}>
                  {trashCharacters.map((character) => (
                    <article key={character.id} className={styles.characterCard}>
                      {/* ---------------------------------
                          Thumbnail
                      --------------------------------- */}

                      <div className={styles.thumbnail}>
                        <Image
                          src={character.image}
                          alt={character.name}
                          fill
                          sizes="(max-width: 1200px) 247.5px, 205px"
                        />
                      </div>

                      {/* ---------------------------------
                          Card Body
                      --------------------------------- */}

                      <div className={styles.cardBody}>
                        <span className={styles.deletedBadge}>휴지통</span>

                        <h2>{character.name}</h2>

                        <p>{character.description}</p>

                        <div className={styles.tags}>{renderTags(character)}</div>

                        {/* ---------------------------------
                            Action Buttons
                        --------------------------------- */}

                        <div className={styles.actionButtons}>
                          {/* 복원 */}

                          <button
                            type="button"
                            className={styles.restoreButton}
                            onClick={() => handleRestoreCharacter(character.id)}
                            disabled={restoringId === character.id || deletingId === character.id}
                          >
                            {restoringId === character.id ? "복원 중..." : "복원"}
                          </button>

                          {/* 영구 삭제 */}

                          <button
                            type="button"
                            className={styles.permanentDeleteButton}
                            onClick={() => handlePermanentDelete(character.id)}
                            disabled={restoringId === character.id || deletingId === character.id}
                          >
                            {deletingId === character.id ? "삭제 중..." : "영구 삭제"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* =================================
          Footer
      ================================= */}

      <Footer />

      {/* =================================
          Mobile Navigation
      ================================= */}

      <MobileNavigation />
    </div>
  );
};

export default MyTrashPage;
