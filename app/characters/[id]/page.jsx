"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Link from "next/link";
import styles from "./detail.module.scss";

export default function CharacterDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;

  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("characters")
        .select("*, worlds(*)")
        .eq("id", id)
        .single();

      setCharacter(data);
      setLoading(false);
    };

    fetchCharacter();
  }, [id]);

  const handleRegenerateImage = async () => {
    if (isRegenerating || !id) return;
    setIsRegenerating(true);

    try {
      const res = await fetch("/api/characters/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: id }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        alert(result.error || "이미지 재생성 중 오류가 발생했습니다.");
        setIsRegenerating(false);
        return;
      }

      // 새로 생성된 이미지 URL 실시간 반영
      setCharacter((prev) => ({
        ...prev,
        image_url: result.imageUrl,
      }));
    } catch (err) {
      console.error("재생성 요청 오류:", err);
      alert("서버 연결 중 오류가 발생했습니다.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const world = character?.worlds;

  return (
    <div className={styles.container}>
      <Header variant="account" />

      <main className={styles.main}>
        <div className={styles.topNav}>
          <Link href="/characters/create" className={styles.backLink}>
            <span className="material-symbols-outlined icon_24">arrow_back</span>
            <span className="kr_body_b">새 캐릭터 작성으로</span>
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>
            <span className="kr_body_b">캐릭터 정보 불러오는 중...</span>
          </div>
        ) : (
          <div className={styles.detailCard}>
            <div className={styles.heroSection}>
              <div className={styles.imageSection}>
                <div className={styles.imageContainer}>
                  {character?.image_url ? (
                    <img
                      src={character.image_url}
                      alt={character?.name || "캐릭터 이미지"}
                      className={styles.characterImage}
                    />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <span className="material-symbols-outlined icon_48">person</span>
                      <span className="kr_caption">이미지 없음</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={styles.regenerateBtn}
                  onClick={handleRegenerateImage}
                  disabled={isRegenerating}
                >
                  <span className={`material-symbols-outlined icon_14 ${isRegenerating ? styles.spin : ""}`}>
                    refresh
                  </span>
                  <span className="kr_body_b">
                    {isRegenerating ? "이미지 재생성 중..." : "이미지 재생성"}
                  </span>
                </button>
              </div>

              <div className={styles.metaInfo}>
                <div className={styles.badgeGroup}>
                  {world?.name && <span className={styles.tag}>{world.name}</span>}
                  {character?.race && <span className={styles.tag}>{character.race}</span>}
                  {character?.gender && <span className={styles.tag}>{character.gender}</span>}
                </div>

                <h1 className={`kr_pc_title_b ${styles.charTitle}`}>
                  {character?.name || "캐릭터 상세"}
                </h1>

                <div className={styles.quickStats}>
                  {character?.job_role && (
                    <div className={styles.statItem}>
                      <span className="kr_caption">직업 / 역할</span>
                      <span className="kr_body_b">{character.job_role}</span>
                    </div>
                  )}
                  {character?.age && (
                    <div className={styles.statItem}>
                      <span className="kr_caption">나이</span>
                      <span className="kr_body_b">{character.age}</span>
                    </div>
                  )}
                  {world?.genre && (
                    <div className={styles.statItem}>
                      <span className="kr_caption">세계관 장르</span>
                      <span className="kr_body_b">{world.genre}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.sectionDivider} />

            <div className={styles.contentGrid}>
              {character?.background_story && (
                <div className={styles.infoBox}>
                  <h3 className={`kr_body_b ${styles.boxTitle}`}>
                    <span className="material-symbols-outlined icon_24">auto_stories</span>
                    배경 스토리
                  </h3>
                  <p className={`kr_body ${styles.boxText}`}>{character.background_story}</p>
                </div>
              )}

              {character?.appearance && (
                <div className={styles.infoBox}>
                  <h3 className={`kr_body_b ${styles.boxTitle}`}>
                    <span className="material-symbols-outlined icon_24">face</span>
                    외형적 특징
                  </h3>
                  <p className={`kr_body ${styles.boxText}`}>{character.appearance}</p>
                </div>
              )}

              {character?.personality && (
                <div className={styles.infoBox}>
                  <h3 className={`kr_body_b ${styles.boxTitle}`}>
                    <span className="material-symbols-outlined icon_24">psychology</span>
                    성격 및 성향
                  </h3>
                  <p className={`kr_body ${styles.boxText}`}>{character.personality}</p>
                </div>
              )}

              {character?.abilities && (
                <div className={styles.infoBox}>
                  <h3 className={`kr_body_b ${styles.boxTitle}`}>
                    <span className="material-symbols-outlined icon_24">bolt</span>
                    능력치
                  </h3>
                  <p className={`kr_body ${styles.boxText}`}>{character.abilities}</p>
                </div>
              )}

              {character?.raw_relationship_input && (
                <div className={styles.infoBox}>
                  <h3 className={`kr_body_b ${styles.boxTitle}`}>
                    <span className="material-symbols-outlined icon_24">groups</span>
                    관련 인물
                  </h3>
                  <p className={`kr_body ${styles.boxText}`}>{character.raw_relationship_input}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
