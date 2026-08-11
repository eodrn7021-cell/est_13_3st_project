"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import CharacterDetail from "@/components/character/CharacterDetail/CharacterDetail";
import LoginModal from "@/components/auth/LoginModal/LoginModal";
import { createClient } from "@/lib/supabase/client";
import sidebarStyles from "@/components/layout/Sidebar/Sidebar.module.scss";
import createStyles from "@/app/characters/create/create.module.scss";

function HelpOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
      <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
    </svg>
  );
}

export default function CharacterDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [dbImageHistory, setDbImageHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [activeNav, setActiveNav] = useState("character");
  const [isCharacterOpen, setIsCharacterOpen] = useState(true);

  const fetchImageHistory = async (charId) => {
    const targetId = charId || id;
    if (!targetId) return;
    try {
      const res = await fetch(`/api/characters/images?characterId=${targetId}`);
      if (res.ok) {
        const json = await res.json();
        // 현재 캐릭터 ID에 해당하는 DB 히스토리로 정확히 갱신 (없으면 빈 배열)
        setDbImageHistory(json?.images || []);
      }
    } catch (err) {
      console.warn("이미지 히스토리 조회 오류:", err);
    }
  };

  const triggerImageGeneration = async (charId) => {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/characters/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: charId || id }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        console.error("이미지 생성 중 오류:", result.error);
        alert(result.error || "이미지 생성 중 오류가 발생했습니다.");
        setIsRegenerating(false);
        return;
      }

      setSelectedImage(result.imageUrl);
      await fetchImageHistory(charId || id);
    } catch (err) {
      console.error("자동 이미지 생성 요청 오류:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveMainImage = async () => {
    const targetImage = selectedImage || character?.image_url;
    if (!targetImage || !id) {
      alert("저장할 이미지가 선택되지 않았습니다.");
      return;
    }

    try {
      const res = await fetch("/api/characters/set-main-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: id,
          imageUrl: targetImage,
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        alert(result.error || "대표 이미지 저장 실패");
        return;
      }

      setCharacter((prev) => ({
        ...prev,
        image_url: targetImage,
      }));
      await fetchImageHistory(id);
      alert("선택한 이미지가 캐릭터 대표 이미지로 지정 및 저장되었습니다!");
    } catch (err) {
      console.error("대표 이미지 저장 오류:", err);
      alert("대표 이미지 저장 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    setDbImageHistory([]);
    setSelectedImage(null);

    const fetchCharacter = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("characters")
        .select("*, worlds(*)")
        .eq("id", id)
        .single();

      setCharacter(data);
      setLoading(false);

      if (data) {
        await fetchImageHistory(data.id);
        if (!data.image_url) {
          triggerImageGeneration(data.id);
        }
      }
    };

    fetchCharacter();
  }, [id]);

  const handleRegenerateImage = async () => {
    if (isRegenerating || !id) return;
    await triggerImageGeneration(id);
  };

  const world = character?.worlds;
  const worldTitle = world?.name || world?.title || "고요한 성역";
  const characterName = character?.name || "엘리안느";

  // 현재 캐릭터의 DB 히스토리 중 가장 최근 4개 이미지 추출
  const imageHistory = dbImageHistory.slice(0, 4);

  const handleSelectWorld = () => {
    setActiveNav("world");
    setIsCharacterOpen(false);
  };

  const handleToggleCharacterAccordion = () => {
    setIsCharacterOpen((prev) => !prev);
    setActiveNav("character");
  };

  return (
    <div className={createStyles.pageContainer}>
      {/* 상단 헤더 */}
      <Header
        variant="account"
        accountContent={
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              type="button"
              className={createStyles.loginHeaderButton}
              onClick={() => setIsLoginModalOpen(true)}
            >
              <span className="kr_body_b">로그인</span>
            </button>
            <Link href="/my-page" className={createStyles.mypageLink}>
              <span className="kr_body">마이페이지</span>
            </Link>
          </div>
        }
      />

      {/* 모바일/태블릿 (<= 1024px) 상단바 */}
      <div className={createStyles.topNavSection}>
        <div className={createStyles.topNavContainer}>
          <button
            type="button"
            className={`${createStyles.topTabButton} ${activeNav === "world" ? createStyles.active : ""}`}
            onClick={handleSelectWorld}
          >
            <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
              history_edu
            </span>
            <span className="kr_body_b">{worldTitle}</span>
          </button>

          <div>
            <button
              type="button"
              className={`${createStyles.topTabButton} ${activeNav === "character" ? createStyles.active : ""}`}
              onClick={handleToggleCharacterAccordion}
            >
              <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                person
              </span>
              <span className="kr_body_b">캐릭터</span>
            </button>

            {isCharacterOpen && (
              <div className={createStyles.topAccordionList}>
                <div className={`${createStyles.topSubItem} ${createStyles.active}`}>
                  <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                    auto_stories
                  </span>
                  <span className="kr_body_b">{characterName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메인 본문: 사이드바 + CharacterDetail */}
      <main className={createStyles.mainBody}>
        <Sidebar
          topContent={
            <>
              {/* 세계관 아코디언 */}
              <button
                type="button"
                className={`${sidebarStyles.accordionButton} ${activeNav === "world" ? sidebarStyles.active : ""}`}
                onClick={handleSelectWorld}
              >
                <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                  history_edu
                </span>
                <span className="kr_body_b">{worldTitle}</span>
              </button>

              {/* 캐릭터 아코디언 */}
              <div>
                <button
                  type="button"
                  className={`${sidebarStyles.accordionButton} ${activeNav === "character" ? sidebarStyles.active : ""}`}
                  onClick={handleToggleCharacterAccordion}
                >
                  <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                    person
                  </span>
                  <span className="kr_body_b">캐릭터</span>
                </button>

                {isCharacterOpen && (
                  <div className={sidebarStyles.accordionList}>
                    <div className={`${sidebarStyles.subItem} ${sidebarStyles.active}`}>
                      <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                        auto_stories
                      </span>
                      <span className="kr_body_b">{characterName}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 사용된 이미지 (이전 생성 이미지 갤러리) */}
              <div className={sidebarStyles.usedImagesSection}>
                <div className={sidebarStyles.usedImagesTitle}>사용된 이미지</div>
                <div className={sidebarStyles.imageGrid}>
                  {imageHistory.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className={sidebarStyles.thumbBox}
                      onClick={() => setSelectedImage(imgSrc)}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={imgSrc} alt={`생성 이미지 ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          }
          bottomContent={
            <>
              {/* 캐릭터 통계 메타정보 (하단 버튼 바로 위에 배치) */}
              <div className={sidebarStyles.metaStatsSection}>
                <div className={sidebarStyles.statRow}>
                  <span className="kr_body">작성자 :</span>
                  <span className="en_body">{character?.author || "Sin sia"}</span>
                </div>
                <div className={sidebarStyles.statRow}>
                  <span className="kr_body">생성일 :</span>
                  <span className="kr_body">{character?.created_at ? new Date(character.created_at).toLocaleDateString() : "2026 / 07 /28"}</span>
                </div>
                <div className={sidebarStyles.statRow}>
                  <span className="kr_body">조회수 :</span>
                  <span className="kr_body">{character?.views ?? 280}</span>
                </div>
                <div className={sidebarStyles.statRow}>
                  <span className="kr_body">좋아요 :</span>
                  <span className="kr_body">{character?.likes ?? 120}</span>
                </div>
              </div>

              <button type="button" className={sidebarStyles.sideButton}>
                <span className={sidebarStyles.buttonIcon}>
                  <HelpOutlineIcon />
                </span>
                <span className="kr_body_b">도움말</span>
              </button>

              <button type="button" className={sidebarStyles.sideButton}>
                <span className="kr_body_b">수정</span>
              </button>

              <button type="button" className={sidebarStyles.sideButton}>
                <span className="kr_body_b">삭제</span>
              </button>
            </>
          }
        />

        {/* 메인 폼 위치에 CharacterDetail 컴포넌트 배치 */}
        <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <span className="kr_body_b">캐릭터 정보 불러오는 중...</span>
            </div>
          ) : (
            <CharacterDetail
              character={character ? { ...character, image_url: selectedImage || character.image_url } : null}
              onRegenerateImage={handleRegenerateImage}
              onSaveImage={handleSaveMainImage}
              isRegenerating={isRegenerating}
            />
          )}
        </div>
      </main>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => {
          console.log("로그인 성공:", user);
          window.location.reload();
        }}
      />

      {/* 하단 풋터 */}
      <Footer />
    </div>
  );
}
