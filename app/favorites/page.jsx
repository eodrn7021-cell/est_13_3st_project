"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation/MobileNavigation";
import { createClient } from "@/lib/supabase/client";

import styles from "./favorites.module.scss";

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
  22: "/images/home/recommended-character-01.webp", // 은빛 성녀 엘리안느
  23: "/images/home/recommended-character-02.webp", // 어둠의 왕자 카이론
  24: "/images/home/recommended-character-03.webp", // 왕국의 후예 셀리아
  25: "/images/home/recommended-character-03.webp", // 정복왕 바이올렛
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

const FavoritesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ========================================
    북마크 캐릭터
  ======================================== */

  const [favoriteCharacters, setFavoriteCharacters] = useState([]);

  const [loading, setLoading] = useState(true);

  /* ========================================
     삭제 중인 캐릭터
  ======================================== */

  const [removingId, setRemovingId] = useState(null);

  /* ========================================
     북마크 조회
  ======================================== */

  useEffect(() => {
    const fetchFavoriteCharacters = async () => {
      setLoading(true);

      try {
        /* ====================================
           1. 현재 로그인 사용자 확인
        ==================================== */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          console.warn("로그인한 사용자가 없습니다.");

          setFavoriteCharacters([]);

          return;
        }

        console.log("북마크 현재 사용자 UUID:", user.id);

        /* ====================================
           2. 현재 사용자의 북마크 조회

           created_at 기준으로
           최근 북마크한 순서
        ==================================== */

        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from("character_bookmarks")
          .select("id, character_id, user_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (bookmarkError) {
          throw bookmarkError;
        }

        console.log("현재 사용자의 북마크:", bookmarkData);

        /* ====================================
           북마크가 없는 경우
        ==================================== */

        if (!bookmarkData || bookmarkData.length === 0) {
          setFavoriteCharacters([]);

          return;
        }

        /* ====================================
           3. character_id 추출
        ==================================== */

        const characterIds = bookmarkData.map((bookmark) => bookmark.character_id);

        /* ====================================
           4. 캐릭터 조회
        ==================================== */

        const { data: characterData, error: characterError } = await supabase
          .from("characters")
          .select("*")
          .in("id", characterIds);

        if (characterError) {
          throw characterError;
        }

        console.log("북마크 캐릭터:", characterData);

        /* ====================================
           5. bookmark 순서를 유지하면서
              캐릭터 연결

           Supabase의 .in() 결과 순서는
           보장되지 않기 때문에
           bookmarkData 순서를 기준으로
           다시 정렬
        ==================================== */

        const characterMap = new Map(
          (characterData ?? []).map((character) => [character.id, character]),
        );

        const formattedCharacters = bookmarkData
          .map((bookmark, index) => {
            const character = characterMap.get(bookmark.character_id);

            if (!character) {
              return null;
            }

            return {
              ...formatCharacter(character, index),

              bookmarkId: bookmark.id,
              bookmarkedAt: bookmark.created_at,
            };
          })
          .filter(Boolean);

        console.log("화면용 북마크 캐릭터:", formattedCharacters);

        setFavoriteCharacters(formattedCharacters);
      } catch (error) {
        console.error("북마크 조회 실패:", error);

        setFavoriteCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteCharacters();
  }, []);

  /* ========================================
     북마크 삭제
  ======================================== */

  const handleRemoveFavorite = async (characterId) => {
    if (removingId) {
      return;
    }

    const confirmed = window.confirm("이 캐릭터를 북마크에서 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    setRemovingId(characterId);

    try {
      /* ====================================
         현재 로그인 사용자 확인
      ==================================== */

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

      /* ====================================
         북마크 삭제
      ==================================== */

      const { error: deleteError } = await supabase
        .from("character_bookmarks")
        .delete()
        .eq("character_id", characterId)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      /* ====================================
         화면에서도 제거
      ==================================== */

      setFavoriteCharacters((prevCharacters) =>
        prevCharacters.filter((character) => character.id !== characterId),
      );

      alert("북마크에서 삭제되었습니다.");
    } catch (error) {
      console.error("북마크 삭제 실패:", error);

      alert("북마크에서 삭제하지 못했습니다.");
    } finally {
      setRemovingId(null);
    }
  };

  /* ========================================
     태그 표시
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
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page="favorites" />

        <main className={styles.page}>
          <div className={styles.container}>
            {/* =================================
                Title
            ================================= */}

            <section className={styles.titleSection}>
              <div>
                <h1>북마크</h1>

                <p>마음에 드는 캐릭터를 모아볼 수 있습니다.</p>
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
                <p className={styles.message}>북마크를 불러오는 중입니다...</p>
              ) : favoriteCharacters.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className="material-symbols-rounded" aria-hidden="true">
                    favorite_border
                  </span>

                  <h2>북마크한 캐릭터가 없습니다.</h2>

                  <p>마음에 드는 캐릭터를 북마크에 추가해보세요.</p>

                  <Link href="/my-characters" className={styles.emptyButton}>
                    내 캐릭터 보러가기
                  </Link>
                </div>
              ) : (
                <div className={styles.characterGrid}>
                  {favoriteCharacters.map((character) => (
                    <article key={character.id} className={styles.characterCard}>
                      {/* =================================
                          Character Link
                      ================================= */}

                      <Link
                        href={`/characters/${character.id}`}
                        className={styles.cardLink}
                        aria-label={`${character.name} 상세보기`}
                      >
                        <div className={styles.thumbnail}>
                          <Image
                            src={character.image}
                            alt={character.name}
                            fill
                            sizes="(max-width: 768px) 45vw, 285px"
                          />

                          <div className={styles.cardGradient} />

                          <div className={styles.cardContent}>
                            <span className={styles.recommended}>추천캐릭터</span>

                            <h2>{character.name}</h2>

                            <p>{character.description}</p>

                            <span className={styles.tags}>{renderTags(character)}</span>
                          </div>
                        </div>
                      </Link>

                      {/* =================================
                          Remove Button
                      ================================= */}

                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => handleRemoveFavorite(character.id)}
                        disabled={removingId === character.id}
                        aria-label={`${character.name} 북마크 삭제`}
                      >
                        <span className="material-symbols-rounded" aria-hidden="true">
                          favorite
                        </span>

                        <span>{removingId === character.id ? "삭제 중..." : "북마크 삭제"}</span>
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* =================================
          Mobile Navigation
      ================================= */}

      <div className={styles.pageFooter}>
        <Footer />
      </div>

      <MobileNavigation />
    </div>
  );
};

export default FavoritesPage;
