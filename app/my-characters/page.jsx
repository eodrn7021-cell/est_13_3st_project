"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
    image: "/images/home/recommended-character-01.png",
    tags: ["엘프", "성녀", "치유"],
  },
  {
    id: 2,
    name: "어둠의 왕자 카이론",
    description: "저주받은 왕국의 후계자. 그와 함께 진실을 파헤치고 운명을 바꾸세요.",
    image: "/images/home/recommended-character-02.png",
    tags: ["왕자", "암흑", "야망"],
  },
  {
    id: 3,
    name: "왕국의 후예 셀리아",
    description: "사라진 왕좌 계승자를 찾아 떠나는 여정. 당신의 선택이 역사를 만듭니다.",
    image: "/images/home/recommended-character-03.png",
    tags: ["기사", "왕국", "모험"],
  },
  {
    id: 4,
    name: "정복왕 바이올렛",
    description: "수많은 전장을 승리로 이끈 정복왕. 새로운 대륙과 운명을 당신의 손으로 개척합니다.",
    image: "/images/home/recommended-character-03.png",
    tags: ["기사", "왕국", "개척"],
  },
];

const MyCharactersPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page="character" />

      <main className={styles.page}>
        <div className={styles.container}>
          {/* =================================
              페이지 제목
          ================================= */}
          <section className={styles.titleSection}>
            <h1>내 캐릭터</h1>

            <Link href="/characters/create" className={styles.createButton}>
              <span className="material-symbols-rounded">add</span>

              <span>새로 만들기</span>
            </Link>
          </section>

          {/* =================================
              필터
          ================================= */}
          <section className={styles.filterSection}>
            <div className={styles.filterList}>
              <button type="button" className={`${styles.filterButton} ${styles.active}`}>
                전체
                <span className="material-symbols-rounded">expand_more</span>
              </button>

              <button type="button" className={styles.filterButton}>
                공개
                <span className="material-symbols-rounded">expand_more</span>
              </button>

              <button type="button" className={styles.filterButton}>
                비공개
                <span className="material-symbols-rounded">expand_more</span>
              </button>
            </div>
          </section>

          {/* =================================
              캐릭터 목록
          ================================= */}
          <section className={styles.characterSection}>
            <div className={styles.characterGrid}>
              {characters.map((character) => (
                <article key={character.id} className={styles.characterCard}>
                  {/* 이미지 */}
                  <div className={styles.thumbnail}>
                    <Image
                      src={character.image}
                      alt={character.name}
                      fill
                      sizes="
                        (max-width: 480px) 42vw,
                        (max-width: 768px) 42vw,
                        (max-width: 1200px) 23vw,
                        260px
                      "
                    />
                  </div>

                  {/* 카드 내용 */}
                  <div className={styles.cardBody}>
                    <span className={styles.recommended}>추천캐릭터</span>

                    <h2>{character.name}</h2>

                    <p>{character.description}</p>

                    <div className={styles.tags}>
                      {character.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
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
              <span className="material-symbols-rounded">add</span>

              <span>재생성</span>
            </button>

            <button type="button" className={styles.editButton}>
              <span className="material-symbols-rounded">edit</span>

              <span>수정</span>
            </button>

            <button type="button" className={styles.deleteButton}>
              <span className="material-symbols-rounded">delete</span>

              <span>삭제</span>
            </button>
          </div>

          {/* =================================
              페이지네이션
          ================================= */}
          <nav className={styles.pagination} aria-label="캐릭터 목록 페이지">
            <button type="button" aria-label="이전 페이지">
              <span className="material-symbols-rounded">chevron_left</span>
            </button>

            <button type="button" className={styles.current}>
              1
            </button>

            <button type="button">2</button>

            <button type="button">3</button>

            <button type="button">4</button>

            <button type="button">5</button>

            <button type="button" aria-label="다음 페이지">
              <span className="material-symbols-rounded">chevron_right</span>
            </button>
          </nav>
        </div>
      </main>

      <Footer />
      <MobileNavigation />
    </>
  );
};

export default MyCharactersPage;
