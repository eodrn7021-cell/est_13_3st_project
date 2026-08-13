"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation/MobileNavigation";

import styles from "./my-page.module.scss";

const recentCharacters = [
  {
    id: 1,
    image: "/images/home/recommended-character-01.webp",
    status: "공개",
    name: "은빛 성녀 엘리안느",
    description: "고요한 성역을 지키는 성녀, 당신의 운명에 신비로운 빛을 비춥니다.",
    tags: "엘프 · 성녀 · 치유",
  },
  {
    id: 2,
    image: "/images/home/recommended-character-02.webp",
    status: "비공개",
    name: "어둠의 왕자 카이론",
    description: "저주받은 왕국의 후계자. 그와 함께 진실을 파헤치고 운명을 바꾸세요.",
    tags: "왕자 · 암흑 · 야망",
  },
  {
    id: 3,
    image: "/images/home/recommended-character-03.webp",
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
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar + Main Content */}
      <div className={styles.contentLayout}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page="mypage" />

        <main className={styles.main}>
          <div className={styles.container}>
            {/* ========================================
                Profile
            ======================================== */}
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
                <span className="material-symbols-rounded" aria-hidden="true">
                  add
                </span>

                <span>새로 만들기</span>
              </Link>
            </section>

            {/* ========================================
                Statistics
            ======================================== */}
            <section className={styles.stats} aria-label="마이페이지 통계">
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

            {/* ========================================
                Recent Characters
            ======================================== */}
            <section className={styles.recentSection}>
              <div className={styles.sectionTitle}>
                <h2>최근 생성한 작업물</h2>
              </div>

              <div className={styles.characterGrid}>
                {recentCharacters.map((character) => (
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
                ))}
              </div>
            </section>
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

export default MyPage;
