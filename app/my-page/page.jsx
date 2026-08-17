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
   DB image_url이 없을 때 사용
======================================== */

const defaultCharacterImages = [
  "/images/home/recommended-character-01.webp",
  "/images/home/recommended-character-02.webp",
  "/images/home/recommended-character-03.webp",
];

/* ========================================
   캐릭터 태그
   현재 시안에 맞춰 표시
======================================== */

const getCharacterTags = (character, index) => {
  /*
    현재 DB의 characters 테이블에는
    별도의 tags 컬럼이 없기 때문에
    우선 종족 + 직업을 사용한다.

    22 : 엘리안느
    23 : 카이론
    24 : 셀리아
    25 : 바이올렛
  */

  const customTags = {
    22: ["엘프", "성녀", "치유"],
    23: ["왕자", "암흑", "야망"],
    24: ["기사", "왕국", "모험"],
    25: ["기사", "왕국", "개척"],
  };

  if (customTags[character.id]) {
    return customTags[character.id].join(" · ");
  }

  const fallbackTags = [character.race, character.job_role].filter(Boolean);

  if (fallbackTags.length > 0) {
    return fallbackTags.join(" · ");
  }

  return "정보 없음";
};

/* ========================================
   최근 캐릭터 화면용 변환
======================================== */

const formatRecentCharacter = (character, index, visibilityMap) => {
  let image = character.image_url;

  /*
    DB image_url이 없으면
    기존 디자인 이미지 사용
  */
  if (!image) {
    image = defaultCharacterImages[index % defaultCharacterImages.length];
  }

  const description =
    character.description ||
    character.background_story ||
    `${character.race || "미정"} 종족의 캐릭터입니다.`;

  const visibility = visibilityMap.get(character.id) || null;

  return {
    id: character.id,
    image,
    status: visibility === "private" ? "비공개" : "공개",
    name: character.name,
    description,
    tags: getCharacterTags(character, index),
  };
};

/* ========================================
   Page
======================================== */

const MyPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ========================================
     Profile
  ======================================== */

  const [profile, setProfile] = useState(null);

  /* ========================================
     Statistics
  ======================================== */

  const [myCharacterCount, setMyCharacterCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  /* ========================================
     Recent Characters
  ======================================== */

  const [recentCharacters, setRecentCharacters] = useState([]);

  /* ========================================
     Loading
  ======================================== */

  const [loading, setLoading] = useState(true);

  /* ========================================
     Supabase 데이터 조회
  ======================================== */

  useEffect(() => {
    const fetchMyPageData = async () => {
      setLoading(true);

      try {
        /* ====================================
           1. 현재 로그인 사용자
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

          setProfile(null);
          setMyCharacterCount(0);
          setBookmarkCount(0);
          setRecentCharacters([]);

          return;
        }

        console.log("마이페이지 사용자 UUID:", user.id);

        /* ====================================
           2. Profile
        ==================================== */

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, nickname, profile_image_path")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        console.log("마이페이지 프로필:", profileData);

        setProfile(profileData);

        /* ====================================
           3. 내 캐릭터 수
        ==================================== */

        const { count: characterCount, error: characterCountError } = await supabase
          .from("characters")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("creator_id", user.id);

        if (characterCountError) {
          throw characterCountError;
        }

        console.log("내 캐릭터 수:", characterCount);

        setMyCharacterCount(characterCount ?? 0);

        /* ====================================
           4. 즐겨찾기 수
        ==================================== */

        const { count: bookmarkCountData, error: bookmarkCountError } = await supabase
          .from("character_bookmarks")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("user_id", user.id);

        if (bookmarkCountError) {
          throw bookmarkCountError;
        }

        console.log("즐겨찾기 수:", bookmarkCountData);

        setBookmarkCount(bookmarkCountData ?? 0);

        /* ====================================
           5. 최근 생성 캐릭터
           최신 3개
        ==================================== */

        const { data: recentCharacterData, error: recentCharacterError } = await supabase
          .from("characters")
          .select(
            `
            id,
            name,
            race,
            gender,
            age,
            job_role,
            background_story,
            image_url,
            created_at
          `,
          )
          .eq("creator_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(3);

        if (recentCharacterError) {
          throw recentCharacterError;
        }

        console.log("최근 생성 캐릭터:", recentCharacterData);

        /* ====================================
           6. 최근 캐릭터 ID 추출
        ==================================== */

        const recentCharacterIds = (recentCharacterData ?? []).map((character) => character.id);

        /* ====================================
           7. 공개 / 비공개 조회
        ==================================== */

        let visibilityData = [];

        if (recentCharacterIds.length > 0) {
          const { data, error: visibilityError } = await supabase
            .from("character_visibility")
            .select("character_id, visibility")
            .eq("user_id", user.id)
            .in("character_id", recentCharacterIds);

          if (visibilityError) {
            throw visibilityError;
          }

          visibilityData = data ?? [];
        }

        console.log("최근 캐릭터 공개 설정:", visibilityData);

        /* ====================================
           8. visibility Map
        ==================================== */

        const visibilityMap = new Map(
          visibilityData.map((item) => [item.character_id, item.visibility]),
        );

        /* ====================================
           9. 화면용 데이터 변환
        ==================================== */

        const formattedRecentCharacters = (recentCharacterData ?? []).map((character, index) =>
          formatRecentCharacter(character, index, visibilityMap),
        );

        console.log("마이페이지 최근 작업물:", formattedRecentCharacters);

        setRecentCharacters(formattedRecentCharacters);
      } catch (error) {
        console.error("마이페이지 데이터 조회 실패:", error);

        setProfile(null);
        setMyCharacterCount(0);
        setBookmarkCount(0);
        setRecentCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, []);

  return (
    <div className={styles.page}>
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className={styles.contentLayout}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page="mypage" />

        <main className={styles.main}>
          <div className={styles.container}>
            {/* =================================
                Profile
            ================================= */}

            <section className={styles.profileSection}>
              <div className={styles.profileInfo}>
                <div className={styles.profileImage}>
                  <Image
                    src={profile?.profile_image_path || "/images/characters/default-profile.png"}
                    alt="프로필"
                    width={80}
                    height={80}
                    unoptimized
                  />
                </div>

                <div className={styles.profileText}>
                  <h1>
                    안녕하세요, {profile?.nickname || "000"}
                    님!
                  </h1>

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

            {/* =================================
                Statistics
            ================================= */}

            <section className={styles.stats} aria-label="마이페이지 통계">
              <div className={styles.statCard}>
                <h3>내 캐릭터</h3>

                <strong>{loading ? "..." : myCharacterCount}</strong>
              </div>

              <div className={styles.statCard}>
                <h3>즐겨찾기</h3>

                <strong>{loading ? "..." : bookmarkCount}</strong>
              </div>

              <div className={styles.statCard}>
                <h3>최근 생성</h3>

                <strong>{loading ? "..." : myCharacterCount}</strong>
              </div>
            </section>

            {/* =================================
                Recent Characters
            ================================= */}

            <section className={styles.recentSection}>
              <div className={styles.sectionTitle}>
                <h2>최근 생성한 작업물</h2>
              </div>

              <div className={styles.characterGrid}>
                {loading ? (
                  <p>최근 생성한 작업물을 불러오는 중입니다...</p>
                ) : recentCharacters.length === 0 ? (
                  <p>최근 생성한 작업물이 없습니다.</p>
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

                          <span className={styles.status}>{character.status}</span>

                          <div className={styles.cardGradient} />

                          <div className={styles.cardContent}>
                            <span className={styles.recommended}>추천캐릭터</span>

                            <h3>{character.name}</h3>

                            <p>{character.description}</p>

                            <span className={styles.tags}>{character.tags}</span>
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

      <Footer />

      <MobileNavigation />
    </div>
  );
};

export default MyPage;
