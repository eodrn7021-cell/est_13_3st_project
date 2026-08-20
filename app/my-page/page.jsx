"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation/MobileNavigation";
import { createClient } from "@/lib/supabase/client";

import styles from "./my-page.module.scss";

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

    /* character_visibility에서 가져온 공개 상태 */
    status: visibility || null,
  };
};

/* ========================================
   Page
======================================== */

const MyPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ========================================
     사용자
  ======================================== */

  const [userName, setUserName] = useState("000");

  /* ========================================
     통계
  ======================================== */

  const [characterCount, setCharacterCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [recentCount, setRecentCount] = useState(0);

  /* ========================================
     최근 캐릭터
  ======================================== */

  const [recentCharacters, setRecentCharacters] = useState([]);

  /* ========================================
     로딩
  ======================================== */

  const [loading, setLoading] = useState(true);

  /* ========================================
     마이페이지 데이터 조회
  ======================================== */

  useEffect(() => {
    const fetchMyPageData = async () => {
      setLoading(true);

      try {
        /* ====================================
           1. 로그인 사용자 확인
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

          setUserName("000");
          setCharacterCount(0);
          setBookmarkCount(0);
          setRecentCount(0);
          setRecentCharacters([]);

          return;
        }

        /* ====================================
           2. 사용자 이름 확인

           우선순위:
           user_metadata.name
           user_metadata.nickname
           user_metadata.user_name
           email 앞부분
        ==================================== */

        const metadataName =
          user.user_metadata?.name || user.user_metadata?.nickname || user.user_metadata?.user_name;

        const emailName = user.email ? user.email.split("@")[0] : "000";

        setUserName(metadataName || emailName);

        /* ====================================
           3. 현재 사용자의 모든 캐릭터 조회

           id ASC는 기존 흐름 유지
        ==================================== */

        const { data: characterData, error: characterError } = await supabase
          .from("characters")
          .select("*")
          .eq("creator_id", user.id)
          .order("id", { ascending: true });

        if (characterError) {
          throw characterError;
        }

        const allCharacters = characterData ?? [];

        /* ====================================
           4. 캐릭터 ID 추출
        ==================================== */

        const characterIds = allCharacters.map((character) => character.id);

        /* ====================================
           5. 휴지통 캐릭터 조회
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

        /* ====================================
           6. 실제 활성 캐릭터만 추출
        ==================================== */

        const activeCharacters = allCharacters.filter(
          (character) => !trashCharacterIds.includes(character.id),
        );

        /* ====================================
           7. 내 캐릭터 수
        ==================================== */

        setCharacterCount(activeCharacters.length);

        /* ====================================
           8. 최근 생성 수

           별도의 생성 이력 테이블이 아직 없으므로
           현재 활성 캐릭터 수를 사용
        ==================================== */

        setRecentCount(activeCharacters.length);

        /* ====================================
           9. 공개 / 비공개 정보 조회
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

        /* ====================================
           visibility Map
        ==================================== */

        const visibilityMap = new Map(
          visibilityData.map((item) => [item.character_id, item.visibility]),
        );

        /* ====================================
           10. 북마크 조회

           현재 로그인 사용자가 북마크한
           모든 캐릭터를 조회

           내 캐릭터뿐만 아니라
           팀원이 만든 캐릭터도 포함
        ==================================== */

        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from("character_bookmarks")
          .select("character_id")
          .eq("user_id", user.id);

        if (bookmarkError) {
          throw bookmarkError;
        }

        /* ====================================
           내 캐릭터 중 휴지통에 있는 캐릭터의
           북마크만 통계에서 제외

           팀원이 만든 캐릭터의 북마크는
           정상적으로 카운트
        ==================================== */

        const activeBookmarkCount = (bookmarkData ?? []).filter(
          (item) => !trashCharacterIds.includes(item.character_id),
        ).length;

        setBookmarkCount(activeBookmarkCount);

        /* ====================================
           11. 최근 생성한 캐릭터 3개

           실제 created_at 기준
           최신 → 오래된 순
        ==================================== */

        const recentCharacterData = [...activeCharacters]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);

        /* ====================================
           12. 화면용 데이터 변환

           visibility까지 같이 연결
        ==================================== */

        const formattedRecentCharacters = recentCharacterData.map((character, index) => {
          const visibility = visibilityMap.get(character.id) || null;

          return formatCharacter(character, index, visibility);
        });

        setRecentCharacters(formattedRecentCharacters);
      } catch (error) {
        console.error("마이페이지 데이터 조회 실패:", error);

        setUserName("000");
        setCharacterCount(0);
        setBookmarkCount(0);
        setRecentCount(0);
        setRecentCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, []);

  /* ========================================
     Render
  ======================================== */

  return (
    <div className={styles.page}>
      {/* ====================================
          Header
      ==================================== */}

      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* ====================================
          Sidebar + Main
      ==================================== */}

      <div className={styles.contentLayout}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page="mypage" />

        <main className={styles.main}>
          <div className={styles.container}>
            {/* ==================================
                Profile
            ================================== */}

            <section className={styles.profileSection}>
              <div className={styles.profileInfo}>
                <div className={styles.profileImage}>
                  <Image
                    src="/images/characters/default-profile.png"
                    alt="프로필"
                    width={80}
                    height={80}
                  />
                </div>

                <div className={styles.profileText}>
                  <h1>안녕하세요, {userName}님!</h1>

                  <p>당신의 상상이 만든 캐릭터를 보여드립니다.</p>
                </div>
              </div>

              <Link href="/characters/create" className={styles.createButton}>
                <span className="material-symbols-rounded" aria-hidden="true">
                  add
                </span>

                <span>새로 만들기</span>
              </Link>
            </section>

            {/* ==================================
                Statistics
            ================================== */}

            <section className={styles.stats} aria-label="마이페이지 통계">
              <div className={styles.statCard}>
                <h3>내 캐릭터</h3>

                <strong>{loading ? "-" : characterCount}</strong>
              </div>

              <div className={styles.statCard}>
                <h3>북마크</h3>

                <strong>{loading ? "-" : bookmarkCount}</strong>
              </div>

              <div className={styles.statCard}>
                <h3>최근 생성</h3>

                <strong>{loading ? "-" : recentCount}</strong>
              </div>
            </section>

            {/* ==================================
                Recent Characters
            ================================== */}

            <section className={styles.recentSection}>
              <div className={styles.sectionTitle}>
                <h2>최근 생성한 작업물</h2>

                <Link href="/my-characters" className={styles.viewAllButton}>
                  전체보기
                </Link>
              </div>

              <div className={styles.characterGrid}>
                {loading ? (
                  <p>캐릭터를 불러오는 중입니다...</p>
                ) : recentCharacters.length === 0 ? (
                  <p>최근 생성한 캐릭터가 없습니다.</p>
                ) : (
                  recentCharacters.map((character) => (
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
                            sizes="(max-width: 480px) 45vw, (max-width: 960px) 30vw, 250px"
                            unoptimized
                          />

                          <span className={styles.status}>
                            {character.status === "private" ? "비공개" : "공개"}
                          </span>

                          <div className={styles.cardGradient} />

                          <div className={styles.cardContent}>
                            <span className={styles.recommended}>추천캐릭터</span>

                            <h3>{character.name}</h3>

                            <p>{character.description}</p>

                            <span className={styles.tags}>{character.tags.join(" · ")}</span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* ====================================
          Mobile Navigation
      ==================================== */}

      <div className={styles.pageFooter}>
        <Footer />
      </div>

      <MobileNavigation />
    </div>
  );
};

export default MyPage;
