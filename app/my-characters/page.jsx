"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation/MobileNavigation";
import { createClient } from "@/lib/supabase/client";

import styles from "./my-characters.module.scss";

/* ========================================
   Supabase Client
======================================== */

const supabase = createClient();

/* ========================================
   기본 이미지
   DB에 지정된 이미지가 없을 때 사용
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
   DB 데이터를 화면용 데이터로 변환
======================================== */

const formatCharacter = (character, index, visibility = null, isBookmarked = false) => {
  /* ----------------------------------------
     이미지
  ---------------------------------------- */

  const image =
    characterImageMap[character.id] ||
    character.image_url ||
    character.image ||
    defaultCharacterImages[index % defaultCharacterImages.length];

  /* ----------------------------------------
     설명
  ---------------------------------------- */

  const description =
    character.description ||
    character.background_story ||
    `${character.race || "미정"} 종족의 캐릭터입니다.`;

  /* ----------------------------------------
     태그
  ---------------------------------------- */

  const tagList =
    characterTagMap[character.id] || [character.race, character.job_role].filter(Boolean);

  return {
    ...character,

    image,
    description,
    tags: tagList,

    /* character_visibility.visibility 사용 */
    status: visibility?.visibility || null,

    /* character_bookmarks 즐겨찾기 여부 */
    isBookmarked,
  };
};

/* ========================================
   Page
======================================== */

const MyCharactersPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ========================================
     캐릭터
  ======================================== */

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ========================================
     필터
  ======================================== */

  const [filter, setFilter] = useState("all");

  /* ========================================
     모바일 페이지
  ======================================== */

  const [mobilePage, setMobilePage] = useState(1);

  const MOBILE_ITEMS_PER_PAGE = 2;

  /* ========================================
     휴지통 관련
  ======================================== */

  // 현재 선택된 캐릭터
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);

  /* ========================================
     즐겨찾기 관련
  ======================================== */

  // 즐겨찾기 처리 중인 캐릭터
  const [bookmarkLoadingId, setBookmarkLoadingId] = useState(null);

  /* ========================================
     현재 로그인 사용자 + 캐릭터 조회
  ======================================== */

  useEffect(() => {
    const fetchMyCharacters = async () => {
      setLoading(true);

      try {
        /* ====================================
           1. 로그인 사용자 확인
        ==================================== */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log("Supabase getUser 결과:", {
          user,
          userId: user?.id,
          userEmail: user?.email,
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

        console.log("현재 로그인 사용자 UUID:", user.id);

        /* ====================================
           2. 현재 사용자 캐릭터 조회

           다른 팀원의 캐릭터는 가져오지 않고
           creator_id가 현재 사용자와 같은
           캐릭터만 조회
        ==================================== */

        const { data: characterData, error: characterError } = await supabase
          .from("characters")
          .select("*")
          .eq("creator_id", user.id)
          .order("id", { ascending: true });

        if (characterError) {
          throw characterError;
        }

        console.log("현재 사용자의 캐릭터:", characterData);

        /* ====================================
           3. 현재 사용자의 캐릭터 ID 추출
        ==================================== */

        const characterIds = (characterData ?? []).map((character) => character.id);

        /* ====================================
           4. 공개 / 비공개 정보 조회

           현재 로그인 사용자의 캐릭터에 해당하는
           visibility만 가져옴
        ==================================== */

        let visibilityData = [];

        if (characterIds.length > 0) {
          const { data, error: visibilityError } = await supabase
            .from("character_visibility")
            .select("character_id, user_id, visibility")
            .eq("user_id", user.id)
            .in("character_id", characterIds);

          if (visibilityError) {
            throw visibilityError;
          }

          visibilityData = data ?? [];
        }

        console.log("캐릭터 공개 설정:", visibilityData);

        /* ====================================
           5. visibility Map 생성
        ==================================== */

        const visibilityMap = new Map(
          visibilityData.map((item) => [item.character_id, item.visibility]),
        );

        /* ====================================
           6. 즐겨찾기 조회

           현재 로그인 사용자가
           즐겨찾기한 캐릭터만 가져옴
        ==================================== */

        let bookmarkData = [];

        if (characterIds.length > 0) {
          const { data, error: bookmarkError } = await supabase
            .from("character_bookmarks")
            .select("character_id, user_id")
            .eq("user_id", user.id)
            .in("character_id", characterIds);

          if (bookmarkError) {
            throw bookmarkError;
          }

          bookmarkData = data ?? [];
        }

        console.log("현재 사용자의 즐겨찾기:", bookmarkData);

        /* ====================================
           7. 즐겨찾기 Map 생성
        ==================================== */

        const bookmarkSet = new Set(bookmarkData.map((item) => item.character_id));

        /* ====================================
           8. 휴지통 캐릭터 조회

           현재 로그인 사용자가 휴지통으로
           보낸 캐릭터 ID만 가져옴
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

        console.log("현재 사용자의 휴지통 캐릭터:", trashCharacterIds);

        /* ====================================
           9. 휴지통에 있는 캐릭터 제외
        ==================================== */

        const activeCharacterData = (characterData ?? []).filter(
          (character) => !trashCharacterIds.includes(character.id),
        );

        /* ====================================
           10. 화면용 캐릭터 데이터 변환
        ==================================== */

        const formattedCharacters = activeCharacterData.map((character, index) => {
          const visibilityValue = visibilityMap.get(character.id);

          const visibility = visibilityValue
            ? {
                visibility: visibilityValue,
              }
            : null;

          const isBookmarked = bookmarkSet.has(character.id);

          return formatCharacter(character, index, visibility, isBookmarked);
        });

        console.log("화면용 캐릭터:", formattedCharacters);

        setCharacters(formattedCharacters);

        /* ----------------------------------------
           휴지통에 있던 캐릭터가 현재 선택되어
           있었다면 선택 해제
        ---------------------------------------- */

        setSelectedCharacterId(null);
      } catch (error) {
        console.error("내 캐릭터 조회 실패:", error);

        setCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCharacters();
  }, []);

  /* ========================================
     즐겨찾기 토글
  ======================================== */

  const handleBookmarkToggle = async (characterId, event) => {
    /* ----------------------------------------
       카드 선택 이벤트 방지
    ---------------------------------------- */

    event.stopPropagation();

    /* ----------------------------------------
       이미 처리 중이면 중복 클릭 방지
    ---------------------------------------- */

    if (bookmarkLoadingId === characterId) {
      return;
    }

    setBookmarkLoadingId(characterId);

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
         현재 캐릭터 찾기
      ---------------------------------------- */

      const currentCharacter = characters.find((character) => character.id === characterId);

      if (!currentCharacter) {
        return;
      }

      /* ========================================
         이미 즐겨찾기 상태
         → 삭제
      ======================================== */

      if (currentCharacter.isBookmarked) {
        const { error } = await supabase
          .from("character_bookmarks")
          .delete()
          .eq("character_id", characterId)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        setCharacters((prevCharacters) =>
          prevCharacters.map((character) =>
            character.id === characterId
              ? {
                  ...character,
                  isBookmarked: false,
                }
              : character,
          ),
        );

        console.log("즐겨찾기 삭제 완료:", characterId);
      } else {
        /* ========================================
           즐겨찾기 상태가 아님
           → 추가
        ======================================== */

        const { error } = await supabase.from("character_bookmarks").insert({
          character_id: characterId,
          user_id: user.id,
        });

        if (error) {
          throw error;
        }

        setCharacters((prevCharacters) =>
          prevCharacters.map((character) =>
            character.id === characterId
              ? {
                  ...character,
                  isBookmarked: true,
                }
              : character,
          ),
        );

        console.log("즐겨찾기 추가 완료:", characterId);
      }
    } catch (error) {
      console.error("즐겨찾기 처리 실패:", error);

      alert("즐겨찾기 처리 중 문제가 발생했습니다.");
    } finally {
      setBookmarkLoadingId(null);
    }
  };

  /* ========================================
     휴지통 이동
  ======================================== */

  const handleDeleteCharacter = async () => {
    /* ----------------------------------------
       선택한 캐릭터가 없는 경우
    ---------------------------------------- */

    if (!selectedCharacterId) {
      alert("삭제할 캐릭터를 먼저 선택해주세요.");
      return;
    }

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
         삭제 확인
      ---------------------------------------- */

      const confirmed = window.confirm("선택한 캐릭터를 휴지통으로 이동하시겠습니까?");

      if (!confirmed) {
        return;
      }

      /* ----------------------------------------
         character_trash에 저장
      ---------------------------------------- */

      const { error: trashError } = await supabase.from("character_trash").insert({
        character_id: selectedCharacterId,
        user_id: user.id,
      });

      if (trashError) {
        throw trashError;
      }

      /* ----------------------------------------
         현재 화면에서 캐릭터 제거
      ---------------------------------------- */

      setCharacters((prevCharacters) =>
        prevCharacters.filter((character) => character.id !== selectedCharacterId),
      );

      /* ----------------------------------------
         선택 상태 초기화
      ---------------------------------------- */

      setSelectedCharacterId(null);

      alert("캐릭터가 휴지통으로 이동되었습니다.");
    } catch (error) {
      console.error("캐릭터 휴지통 이동 실패:", error);

      alert("캐릭터를 휴지통으로 이동하지 못했습니다.");
    }
  };

  /* ========================================
     필터 적용
  ======================================== */

  const filteredCharacters = useMemo(() => {
    if (filter === "all") {
      return characters;
    }

    return characters.filter((character) => {
      return character.status === filter;
    });
  }, [characters, filter]);

  /* ========================================
     필터 변경 → 모바일 1페이지
  ======================================== */

  useEffect(() => {
    setMobilePage(1);
  }, [filter]);

  /* ========================================
     모바일 페이지 수
  ======================================== */

  const mobilePageCount = Math.max(1, Math.ceil(filteredCharacters.length / MOBILE_ITEMS_PER_PAGE));

  /* ========================================
     모바일 현재 페이지 데이터
  ======================================== */

  const mobileStartIndex = (mobilePage - 1) * MOBILE_ITEMS_PER_PAGE;

  const mobileCharacters = filteredCharacters.slice(
    mobileStartIndex,
    mobileStartIndex + MOBILE_ITEMS_PER_PAGE,
  );

  /* ========================================
     모바일 페이지 이동
  ======================================== */

  const moveMobilePage = (page) => {
    if (page < 1) {
      setMobilePage(mobilePageCount);
      return;
    }

    if (page > mobilePageCount) {
      setMobilePage(1);
      return;
    }

    setMobilePage(page);
  };

  /* ========================================
     캐릭터 태그 표시
  ======================================== */

  const renderTags = (character) => {
    if (character.tags.length === 0) {
      return "정보 없음";
    }

    return character.tags.join(" · ");
  };

  /* ========================================
     캐릭터 카드
  ======================================== */

  const renderCharacterCard = (character, mobile = false) => {
    return (
      <article
        key={character.id}
        className={`${styles.characterCard} ${
          selectedCharacterId === character.id ? styles.selected : ""
        }`}
        onClick={() => setSelectedCharacterId(character.id)}
        style={{ position: "relative" }}
      >
        {/* ====================================
            즐겨찾기 버튼
        ==================================== */}

        <button
          type="button"
          aria-label={
            character.isBookmarked
              ? `${character.name} 즐겨찾기 해제`
              : `${character.name} 즐겨찾기 추가`
          }
          aria-pressed={character.isBookmarked}
          onClick={(event) => handleBookmarkToggle(character.id, event)}
          disabled={bookmarkLoadingId === character.id}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            border: "none",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.55)",
            color: character.isBookmarked ? "var(--secondary-color, #a09bee)" : "#ffffff",
            cursor: bookmarkLoadingId === character.id ? "default" : "pointer",
            opacity: bookmarkLoadingId === character.id ? 0.6 : 1,
          }}
        >
          <span
            className="material-symbols-rounded"
            aria-hidden="true"
            style={{
              fontSize: "22px",
              fontVariationSettings: character.isBookmarked ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            star
          </span>
        </button>

        {/* ====================================
            Thumbnail
        ==================================== */}

        <div className={styles.thumbnail}>
          <Image
            src={character.image}
            alt={character.name}
            fill
            sizes={mobile ? "190px" : "(max-width: 1200px) 247.5px, 205px"}
          />
        </div>

        {/* ====================================
            Card Body
        ==================================== */}

        <div className={styles.cardBody}>
          <span className={styles.recommended}>추천캐릭터</span>

          <h2>{character.name}</h2>

          <p>{character.description}</p>

          <div className={styles.tags}>{renderTags(character)}</div>
        </div>
      </article>
    );
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
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page="character" />

        <main className={styles.page}>
          <div className={styles.container}>
            {/* =================================
                제목
            ================================= */}

            <section className={styles.titleSection}>
              <h1>내 캐릭터</h1>

              <Link href="/characters/create" className={styles.createButton}>
                <span className="material-symbols-rounded" aria-hidden="true">
                  add
                </span>

                <span>새로 만들기</span>
              </Link>
            </section>

            {/* =================================
                필터
            ================================= */}

            <section className={styles.filterSection}>
              <div className={styles.filterList}>
                <button
                  type="button"
                  className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
                  onClick={() => setFilter("all")}
                >
                  <span>전체</span>
                </button>

                <button
                  type="button"
                  className={`${styles.filterButton} ${filter === "public" ? styles.active : ""}`}
                  onClick={() => setFilter("public")}
                >
                  <span>공개</span>
                </button>

                <button
                  type="button"
                  className={`${styles.filterButton} ${filter === "private" ? styles.active : ""}`}
                  onClick={() => setFilter("private")}
                >
                  <span>비공개</span>
                </button>
              </div>
            </section>

            {/* =================================
                캐릭터 목록
            ================================= */}

            <section className={styles.characterSection}>
              {/* ---------------------------------
                  PC / Tablet
              --------------------------------- */}

              <div className={styles.characterGridDesktop}>
                {loading ? (
                  <p>캐릭터를 불러오는 중입니다...</p>
                ) : filteredCharacters.length === 0 ? (
                  <p>등록된 캐릭터가 없습니다.</p>
                ) : (
                  filteredCharacters.map((character) => renderCharacterCard(character, false))
                )}
              </div>

              {/* ---------------------------------
                  Mobile
              --------------------------------- */}

              <div className={styles.characterGridMobile}>
                {loading ? (
                  <p>캐릭터를 불러오는 중입니다...</p>
                ) : mobileCharacters.length === 0 ? (
                  <p>등록된 캐릭터가 없습니다.</p>
                ) : (
                  mobileCharacters.map((character) => renderCharacterCard(character, true))
                )}
              </div>
            </section>

            {/* =================================
                카드 관리 버튼
            ================================= */}

            <div className={styles.manageButtons}>
              <button type="button" className={styles.regenerateButton}>
                <span className="material-symbols-rounded" aria-hidden="true">
                  add
                </span>

                <span>재생성</span>
              </button>

              <button type="button" className={styles.editButton}>
                <span className="material-symbols-rounded" aria-hidden="true">
                  edit
                </span>

                <span>수정</span>
              </button>

              <button
                type="button"
                className={styles.deleteButton}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteCharacter();
                }}
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  delete
                </span>

                <span>삭제</span>
              </button>
            </div>

            {/* =================================
                PC / Tablet Pagination
            ================================= */}

            <nav className={styles.paginationDesktop} aria-label="캐릭터 목록 페이지">
              <button type="button" aria-label="이전 페이지">
                <span className="material-symbols-rounded">chevron_left</span>
              </button>

              {[1, 2, 3, 4, 5].map((page) => (
                <button key={page} type="button" className={page === 1 ? styles.current : ""}>
                  {page}
                </button>
              ))}

              <button type="button" aria-label="다음 페이지">
                <span className="material-symbols-rounded">chevron_right</span>
              </button>
            </nav>

            {/* =================================
                Mobile Pagination
            ================================= */}

            <nav className={styles.paginationMobile} aria-label="모바일 캐릭터 목록 페이지">
              <button
                type="button"
                aria-label="이전 페이지"
                onClick={() => moveMobilePage(mobilePage - 1)}
              >
                <span className="material-symbols-rounded">chevron_left</span>
              </button>

              {Array.from({ length: mobilePageCount }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={page === mobilePage ? styles.current : ""}
                  onClick={() => moveMobilePage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                aria-label="다음 페이지"
                onClick={() => moveMobilePage(mobilePage + 1)}
              >
                <span className="material-symbols-rounded">chevron_right</span>
              </button>
            </nav>
          </div>
        </main>
      </div>

      {/* =================================
          Footer
      ================================= */}

      <Footer />

      {/* =================================
          Mobile Bottom Navigation
      ================================= */}

      <MobileNavigation />
    </div>
  );
};

export default MyCharactersPage;
