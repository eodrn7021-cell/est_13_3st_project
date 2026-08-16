"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation/MobileNavigation";

import styles from "./my-characters.module.scss";

const characters = [
  {
    id: 1,
    name: "은빛 성녀 엘리안느",
    description: "고요한 성역을 지키는 성녀. 당신의 운명에 신비로운 빛을 비춥니다.",
    image: "/images/home/recommended-character-01.webp",
    tags: ["엘프", "성녀", "치유"],
    status: "public",
  },
  {
    id: 2,
    name: "어둠의 왕자 카이론",
    description: "저주받은 왕국의 후계자. 그와 함께 진실을 파헤치고 운명을 바꾸세요.",
    image: "/images/home/recommended-character-02.webp",
    tags: ["왕자", "암흑", "야망"],
    status: "private",
  },
  {
    id: 3,
    name: "왕국의 후예 셀리아",
    description: "사라진 왕좌 계승자를 찾아 떠나는 여정. 당신의 선택이 역사를 만듭니다.",
    image: "/images/home/recommended-character-03.webp",
    tags: ["기사", "왕국", "모험"],
    status: "public",
  },
  {
    id: 4,
    name: "정복왕 바이올렛",
    description: "수많은 전장을 승리로 이끈 정복왕. 새로운 대륙과 운명을 당신의 손으로 개척합니다.",
    image: "/images/home/recommended-character-03.webp",
    tags: ["기사", "왕국", "개척"],
    status: "private",
  },
];

const MyCharactersPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 필터
  const [filter, setFilter] = useState("all");

  // 모바일 페이지
  const [mobilePage, setMobilePage] = useState(1);

  // 모바일 한 페이지에 2개
  const MOBILE_ITEMS_PER_PAGE = 2;

  // 시안 기준 1~3 페이지
  const MOBILE_PAGE_COUNT = 3;

  // ----------------------------------------
  // 필터 적용
  // ----------------------------------------
  const filteredCharacters =
    filter === "all" ? characters : characters.filter((character) => character.status === filter);

  // ----------------------------------------
  // 필터를 변경하면 모바일은 1페이지
  // ----------------------------------------
  useEffect(() => {
    setMobilePage(1);
  }, [filter]);

  // ----------------------------------------
  // 모바일 현재 페이지 데이터
  // ----------------------------------------
  const mobileStartIndex = (mobilePage - 1) * MOBILE_ITEMS_PER_PAGE;

  const mobileCharacters = filteredCharacters.slice(
    mobileStartIndex,
    mobileStartIndex + MOBILE_ITEMS_PER_PAGE,
  );

  // ----------------------------------------
  // 모바일 페이지 이동
  // ----------------------------------------
  const moveMobilePage = (page) => {
    if (page < 1) {
      setMobilePage(MOBILE_PAGE_COUNT);
      return;
    }

    if (page > MOBILE_PAGE_COUNT) {
      setMobilePage(1);
      return;
    }

    setMobilePage(page);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar + Main */}
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
                  1920px → 4개
                  768px → 2개 × 2줄
              --------------------------------- */}
              <div className={styles.characterGridDesktop}>
                {filteredCharacters.map((character) => (
                  <article key={character.id} className={styles.characterCard}>
                    <div className={styles.thumbnail}>
                      <Image
                        src={character.image}
                        alt={character.name}
                        fill
                        sizes="(max-width: 1200px) 247.5px, 205px"
                      />
                    </div>

                    <div className={styles.cardBody}>
                      <span className={styles.recommended}>추천캐릭터</span>

                      <h2>{character.name}</h2>

                      <p>{character.description}</p>

                      <div className={styles.tags}>{character.tags.join(" · ")}</div>
                    </div>
                  </article>
                ))}
              </div>

              {/* ---------------------------------
                  Mobile
                  480px → 2개
              --------------------------------- */}
              <div className={styles.characterGridMobile}>
                {mobileCharacters.map((character) => (
                  <article key={character.id} className={styles.characterCard}>
                    <div className={styles.thumbnail}>
                      <Image src={character.image} alt={character.name} fill sizes="190px" />
                    </div>

                    <div className={styles.cardBody}>
                      <span className={styles.recommended}>추천캐릭터</span>

                      <h2>{character.name}</h2>

                      <p>{character.description}</p>

                      <div className={styles.tags}>{character.tags.join(" · ")}</div>
                    </div>
                  </article>
                ))}
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

              <button type="button" className={styles.deleteButton}>
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

              {[1, 2, 3].map((page) => (
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

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default MyCharactersPage;
