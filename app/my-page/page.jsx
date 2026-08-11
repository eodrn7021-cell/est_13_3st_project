"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

import styles from "./my-page.module.scss";

const recentCharacters = [
  {
    id: 1,
    image: "/home/recommended-character-01.png",
    status: "공개",
    name: "은빛 성녀 엘리안느",
    description: "고요한 성역을 지키는 성녀, 당신의 운명에 신비로운 빛을 비춥니다.",
    tags: "엘프 · 성녀 · 치유",
  },
  {
    id: 2,
    image: "/home/recommended-character-02.png",
    status: "비공개",
    name: "어둠의 왕자 카이론",
    description: "저주받은 왕국의 후계자. 그와 함께 진실을 파헤치고 운명을 바꾸세요.",
    tags: "왕자 · 암흑 · 야망",
  },
  {
    id: 3,
    image: "/home/recommended-character-03.png",
    status: "공개",
    name: "왕국의 후예 셀리아",
    description: "사라진 왕좌 계승자를 찾아 떠나는 여정. 당신의 선택이 역사를 만듭니다.",
    tags: "기사 · 왕국 · 모험",
  },
];

const MyPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.page}>
      {/* 기존 Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page="mypage" />

      <main className={styles.main}>
        <div className={styles.container}>
          {/* 프로필 */}
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
                <h1>안녕하세요, 000님!</h1>

                <p>당신의 상상이 만든 캐릭터를 보여드립니다.</p>
              </div>
            </div>
            <Link href="/characters/create" className={styles.createButton}>
              <span className="material-symbols-rounded">add</span>

              <span>새로 만들기</span>
            </Link>
          </section>

          {/* 통계 */}
          <section className={styles.stats}>
            <div className={styles.statCard}>
              <h3>내 캐릭터</h3>
              <strong>10</strong>
            </div>

            <div className={styles.statCard}>
              <h3>즐겨찾기</h3>
              <strong>8</strong>
            </div>

            <div className={styles.statCard}>
              <h3>최근 생성</h3>
              <strong>24</strong>
            </div>
          </section>

          {/* 최근 생성 */}
          <section className={styles.recentSection}>
            <h2>최근 생성한 작업물</h2>

            <div className={styles.characterGrid}>
              {characters.map((character) => (
                <article key={character.id} className={styles.characterCard}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={character.image}
                      alt={character.name}
                      fill
                      sizes="(max-width: 480px) 90vw, (max-width: 768px) 42vw, 30vw"
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
                </article>
              ))}
            </div>
          </section>

          {/* 페이지네이션 */}
          <div className={styles.pagination}>
            <button type="button" aria-label="이전 페이지">
              <span className="material-symbols-rounded">chevron_left</span>
            </button>

            <button type="button" className={styles.currentPage}>
              1
            </button>

            <button type="button">2</button>

            <button type="button">3</button>

            <button type="button" aria-label="다음 페이지">
              <span className="material-symbols-rounded">chevron_right</span>
            </button>
          </div>
        </div>
      </main>

      {/* 기존 Footer */}
      <Footer />
    </div>
  );
};

export default MyPage;
