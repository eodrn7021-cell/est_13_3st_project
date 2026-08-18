"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation/MobileNavigation";
import { createClient } from "@/lib/supabase/client";

import styles from "./recent.module.scss";

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

const formatCharacter = (character, index, visibility = null) => {
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

    status: visibility?.visibility || null,
  };
};

/* ========================================
   Page
======================================== */

const RecentPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ========================================
     캐릭터
  ======================================== */

  const [characters, setCharacters] = useState([]);

  /* ========================================
     로딩
  ======================================== */

  const [loading, setLoading] = useState(true);

  /* ========================================
     페이지
  ======================================== */

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  /* ========================================
     최근 생성 데이터 조회
  ======================================== */

  useEffect(() => {
    const fetchRecentCharacters = async () => {
      setLoading(true);

      try {
        /* ====================================
           1. 로그인 사용자 확인
        ==================================== */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log("최근 생성 사용자:", {
          user,
          userId: user?.id,
          error: userError,
        });

        if (userError) {
          throw userError;
        }

        if (!user) {
          console.warn("로그인한 사용자가 없습니다.");

          setCharacters([]);

          return;
        }

        console.log("최근 생성 현재 사용자 UUID:", user.id);

        /* ====================================
           2. 현재 사용자의 캐릭터 조회

           created_at DESC
           → 최근 생성된 순서
        ==================================== */

        const { data: characterData, error: characterError } = await supabase
          .from("characters")
          .select("*")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false });

        if (characterError) {
          throw characterError;
        }

        console.log("최근 생성 전체 캐릭터:", characterData);

        /* ====================================
           3. 캐릭터 ID 추출
        ==================================== */

        const characterIds = (characterData ?? []).map((character) => character.id);

        /* ====================================
           4. 공개 / 비공개 정보 조회
        ==================================== */

        let visibilityData = [];

        if (characterIds.length > 0) {
          const { data, error: visibilityError } = await supabase
            .from("character_visibility")
            .select("character_id, visibility")
            .eq("user_id", user.id)
            .in("character_id", characterIds);

          if (visibilityError) {
            throw visibilityError;
          }

          visibilityData = data ?? [];
        }

        /* ====================================
           5. visibility Map 생성
        ==================================== */

        const visibilityMap = new Map(
          visibilityData.map((item) => [item.character_id, item.visibility]),
        );

        /* ====================================
           6. 휴지통 조회
        ==================================== */

        let trashCharacterIds = [];

        if (characterIds.length > 0) {
          const { data: trashData, error: trashError } = await supabase
            .from("character_trash")
            .select("character_id")
            .eq("user_id", user.id)
            .in("character_id", characterIds);

          if (trashError) {
            throw trashError;
          }

          trashCharacterIds = (trashData ?? []).map((item) => item.character_id);
        }

        console.log("최근 생성 휴지통 캐릭터:", trashCharacterIds);

        /* ====================================
           7. 휴지통 캐릭터 제외
        ==================================== */

        const activeCharacters = (characterData ?? []).filter(
          (character) => !trashCharacterIds.includes(character.id),
        );

        /* ====================================
           8. 화면용 데이터 변환
        ==================================== */

        const formattedCharacters = activeCharacters.map((character, index) => {
          const visibilityValue = visibilityMap.get(character.id);

          const visibility = visibilityValue
            ? {
                visibility: visibilityValue,
              }
            : null;

          return formatCharacter(character, index, visibility);
        });

        console.log("최근 생성 화면용 캐릭터:", formattedCharacters);

        setCharacters(formattedCharacters);

        setCurrentPage(1);
      } catch (error) {
        console.error("최근 생성 조회 실패:", error);

        setCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCharacters();
  }, []);

  /* ========================================
     전체 페이지 수
  ======================================== */

  const pageCount = Math.max(1, Math.ceil(characters.length / ITEMS_PER_PAGE));

  /* ========================================
     페이지 데이터
  ======================================== */

  const paginatedCharacters = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return characters.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [characters, currentPage]);

  /* ========================================
     페이지 이동
  ======================================== */

  const movePage = (page) => {
    if (page < 1) {
      setCurrentPage(pageCount);
      return;
    }

    if (page > pageCount) {
      setCurrentPage(1);
      return;
    }

    setCurrentPage(page);
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
     상태
  ======================================== */

  const renderStatus = (character) => {
    return character.status === "private" ? "비공개" : "공개";
  };

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
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page="mypage" />

        <main className={styles.page}>
          <div className={styles.container}>
            {/* =================================
                Title
            ================================= */}

            <section className={styles.titleSection}>
              <div>
                <h1>최근 생성</h1>

                <p>최근에 생성한 캐릭터를 확인할 수 있습니다.</p>
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
                <p className={styles.message}>최근 생성한 캐릭터를 불러오는 중입니다...</p>
              ) : characters.length === 0 ? (
                <p className={styles.message}>최근 생성한 캐릭터가 없습니다.</p>
              ) : (
                <div className={styles.characterGrid}>
                  {paginatedCharacters.map((character) => (
                    <article key={character.id} className={styles.characterCard}>
                      <Link
                        href={`/characters/${character.id}`}
                        className={styles.cardLink}
                        aria-label={`${character.name} 상세보기`}
                      >
                        <div className={styles.imageWrapper}>
                          <Image
                            src={character.image}
                            alt={character.name}
                            fill
                            sizes="(max-width: 480px) 45vw, (max-width: 1200px) 247.5px, 205px"
                            unoptimized
                          />

                          <span className={styles.status}>{renderStatus(character)}</span>

                          <div className={styles.cardGradient} />

                          <div className={styles.cardContent}>
                            <span className={styles.recommended}>추천캐릭터</span>

                            <h2>{character.name}</h2>

                            <p>{character.description}</p>

                            <span className={styles.tags}>{renderTags(character)}</span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* =================================
                Pagination
            ================================= */}

            {!loading && characters.length > 0 && (
              <nav className={styles.pagination} aria-label="최근 생성 캐릭터 페이지">
                <button
                  type="button"
                  aria-label="이전 페이지"
                  onClick={() => movePage(currentPage - 1)}
                >
                  <span className="material-symbols-rounded">chevron_left</span>
                </button>

                {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={page === currentPage ? styles.current : ""}
                    onClick={() => movePage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  aria-label="다음 페이지"
                  onClick={() => movePage(currentPage + 1)}
                >
                  <span className="material-symbols-rounded">chevron_right</span>
                </button>
              </nav>
            )}
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

export default RecentPage;
