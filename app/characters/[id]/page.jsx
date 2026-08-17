"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import HomeMobileMenu from "@/components/home/HomeMobileMenu/HomeMobileMenu";
import MobileNavigation from "@/components/layout/MobileNavigation/MobileNavigation";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import CharacterDetail from "@/components/character/CharacterDetail/CharacterDetail";
import Button from "@/components/common/Button/Button";
import LoginModal from "@/components/auth/LoginModal/LoginModal";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
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

// Module-level cache to preserve UI during Next.js dynamic route remounts
let cachedCharacter = null;
let cachedWorldCharacters = [];
let cachedIsOwner = false;
let cachedDbImageHistory = [];

export default function CharacterDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 최초 진입 시 URL에 generating=true가 있는지 한 번만 확인하고 상태로 유지
  const [isGeneratingMode] = useState(searchParams.get("generating") === "true");

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [isLiked, setIsLiked] = useState(() => Boolean(cachedCharacter?.initialIsLiked));
  const [isBookmarked, setIsBookmarked] = useState(() => Boolean(cachedCharacter?.initialIsBookmarked));
  const [likes, setLikes] = useState(() => cachedCharacter?.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const [character, setCharacter] = useState(() => cachedCharacter);
  const [loading, setLoading] = useState(!cachedCharacter);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [dbImageHistory, setDbImageHistory] = useState(() => cachedDbImageHistory);
  const [selectedImage, setSelectedImage] = useState(null);

  const [activeNav, setActiveNav] = useState("character");
  const [isCharacterOpen, setIsCharacterOpen] = useState(true);
  const [worldCharacters, setWorldCharacters] = useState(() => cachedWorldCharacters);

  // 코멘트 상태
  const [comments, setComments] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 현재 사용자 세션 정보 및 소유자 여부 상태
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(() => cachedIsOwner);

  const fetchImageHistory = async (charId) => {
    const targetId = charId || id;
    if (!targetId) return;
    try {
      const res = await fetch(`/api/characters/images?characterId=${targetId}`);
      if (res.ok) {
        const json = await res.json();
        // 현재 캐릭터 ID에 해당하는 DB 히스토리로 정확히 갱신 (없으면 빈 배열)
        setDbImageHistory(json?.images || []);
        cachedDbImageHistory = json?.images || [];
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

  const generationTriggered = useRef(false);
  const viewRecorded = useRef(false);

  useEffect(() => {
    if (!isGeneratingMode && !viewRecorded.current) {
      viewRecorded.current = true;
      fetch("/api/characters/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: id }),
      }).catch((err) => console.error("조회수 증가 호출 실패:", err));
    }
    // 캐시가 없거나 다른 캐릭터를 처음 진입할 때만 초기화
    if (!cachedCharacter || cachedCharacter.id !== id) {
      setLoading(true);
    }
    setSelectedImage(null);

    const fetchCharacterAndUser = async () => {
      const supabase = createClient();
      
      // 1. 현재 접속 중인 유저 및 닉네임 확인
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      let userProfile = null;
      
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("nickname, profile_image_path")
          .eq("id", user.id)
          .single();
        userProfile = profileData;
      }
      setCurrentUser(user ? { ...user, profile: userProfile } : null);

      // 2. 캐릭터 데이터 조회
      const { data } = await supabase
        .from("characters")
        .select("*, worlds(*)")
        .eq("id", id)
        .single();

      if (data) {
        // 작성자 프로필, 좋아요 수, 로그인한 유저의 좋아요/북마크 상태 병렬 조회
        const [
          { count: likesCount },
          { data: userLikeData },
          { data: userBookmarkData },
          { data: creatorProfile }
        ] = await Promise.all([
          supabase.from("character_likes").select("*", { count: "exact", head: true }).eq("character_id", id),
          user ? supabase.from("character_likes").select("id").eq("character_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
          user ? supabase.from("character_bookmarks").select("id").eq("character_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
          data.creator_id ? supabase.from("profiles").select("nickname").eq("id", data.creator_id).single() : Promise.resolve({ data: null })
        ]);

        const characterWithStats = {
          ...data,
          likes: likesCount || 0,
          initialIsLiked: Boolean(userLikeData),
          initialIsBookmarked: Boolean(userBookmarkData),
          author_name: creatorProfile?.nickname || "익명",
        };

        setCharacter(characterWithStats);
        cachedCharacter = characterWithStats;
        setIsLiked(Boolean(userLikeData));
        setIsBookmarked(Boolean(userBookmarkData));
        setLikes(likesCount || 0);
        setLoading(false);
        
        // 현재 접속 중인 유저가 존재하고, 그 유저의 ID가 캐릭터의 creator_id와 같을 때만 소유자로 판단
        const ownerCheck = Boolean(user && data.creator_id === user.id);
        setIsOwner(ownerCheck);
        cachedIsOwner = ownerCheck;

        // 생성창이 아닐 때만 해당 세계관의 다른 캐릭터들 조회
        if (!isGeneratingMode && data.world_id) {
          const { data: chars } = await supabase
            .from("characters")
            .select("id, name")
            .eq("world_id", data.world_id)
            .order("created_at", { ascending: true });
          
          if (chars) {
            setWorldCharacters(chars);
            cachedWorldCharacters = chars;
          }
        }

        // 코멘트 조회
        try {
          const commentsRes = await fetch(`/api/characters/comments?characterId=${id}`);
          if (commentsRes.ok) {
            const commentsJson = await commentsRes.json();
            if (commentsJson.success) {
              setComments(commentsJson.comments || []);
            }
          }
        } catch (commentErr) {
          console.error("코멘트 조회 오류:", commentErr);
        }

        await fetchImageHistory(data.id);
        // 새로고침 시 무한 자동 생성을 막기 위해, isGeneratingMode일 때만 1회 실행
        if (isGeneratingMode && !generationTriggered.current) {
          generationTriggered.current = true;
          triggerImageGeneration(data.id);
          
          // 새로고침 시 다시 생성되지 않도록 URL에서 파라미터 제거
          router.replace(`/characters/${data.id}`);
        }
      }
    };

    fetchCharacterAndUser();
  }, [id, isGeneratingMode, router]);

  const handleLikeToggle = async () => {
    if (!currentUser) {
      setIsConfirmModalOpen(true);
      return;
    }
    if (isLiking || !id) return;

    setIsLiking(true);
    const prevIsLiked = isLiked;
    const prevLikes = likes;

    // 낙관적 업데이트 (Optimistic UI Update)
    setIsLiked(!prevIsLiked);
    setLikes((prev) => (prevIsLiked ? Math.max(0, prev - 1) : prev + 1));
    setCharacter((prev) =>
      prev
        ? {
            ...prev,
            likes: prevIsLiked ? Math.max(0, (prev.likes || 0) - 1) : (prev.likes || 0) + 1,
            initialIsLiked: !prevIsLiked,
          }
        : prev
    );

    try {
      const res = await fetch("/api/characters/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: id }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setIsLiked(prevIsLiked);
        setLikes(prevLikes);
        setCharacter((prev) =>
          prev
            ? {
                ...prev,
                likes: prevLikes,
                initialIsLiked: prevIsLiked,
              }
            : prev
        );
        alert(result.error || "좋아요 처리 중 오류가 발생했습니다.");
        return;
      }

      setIsLiked(result.isLiked);
      setLikes(result.likes);
      setCharacter((prev) =>
        prev
          ? {
              ...prev,
              likes: result.likes,
              initialIsLiked: result.isLiked,
            }
          : prev
      );
    } catch (err) {
      console.error("좋아요 처리 중 예외 발생:", err);
      setIsLiked(prevIsLiked);
      setLikes(prevLikes);
      setCharacter((prev) =>
        prev
          ? {
              ...prev,
              likes: prevLikes,
              initialIsLiked: prevIsLiked,
            }
          : prev
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleLoginConfirm = () => {
    setIsConfirmModalOpen(false);
    router.push("/login");
  };

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        alert("캐릭터 링크가 클립보드에 복사되었습니다.");
      }
    } catch (err) {
      console.error("공유 링크 복사 실패:", err);
    }
  };

  const handleAddComment = async (content) => {
    if (!currentUser) {
      setIsConfirmModalOpen(true);
      return;
    }
    if (isSubmittingComment || !content?.trim() || !id) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch("/api/characters/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: id, content: content.trim() }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert(result.error || "코멘트 등록 중 오류가 발생했습니다.");
        return;
      }

      // 새 코멘트를 목록 맨 앞에 추가
      setComments((prev) => [result.comment, ...prev]);
    } catch (err) {
      console.error("코멘트 등록 예외:", err);
      alert("코멘트 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      setIsConfirmModalOpen(true);
      return;
    }
    if (isBookmarking || !id) return;

    setIsBookmarking(true);
    const prevIsBookmarked = isBookmarked;

    // 낙관적 업데이트
    setIsBookmarked(!prevIsBookmarked);
    setCharacter((prev) =>
      prev
        ? {
            ...prev,
            initialIsBookmarked: !prevIsBookmarked,
          }
        : prev
    );

    try {
      const res = await fetch("/api/characters/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: id }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setIsBookmarked(prevIsBookmarked);
        setCharacter((prev) =>
          prev
            ? {
                ...prev,
                initialIsBookmarked: prevIsBookmarked,
              }
            : prev
        );
        alert(result.error || "북마크 처리 중 오류가 발생했습니다.");
        return;
      }

      setIsBookmarked(result.isBookmarked);
      setCharacter((prev) =>
        prev
          ? {
              ...prev,
              initialIsBookmarked: result.isBookmarked,
            }
          : prev
      );
    } catch (err) {
      console.error("북마크 처리 중 예외 발생:", err);
      setIsBookmarked(prevIsBookmarked);
      setCharacter((prev) =>
        prev
          ? {
              ...prev,
              initialIsBookmarked: prevIsBookmarked,
            }
          : prev
      );
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (isRegenerating || !id) return;
    await triggerImageGeneration(id);
  };

  const world = character?.worlds;
  const worldTitle = world?.name || world?.title || "";
  const characterName = character?.name || "";

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

  const sidebarTopContent = (
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
          className={sidebarStyles.accordionButton}
          onClick={handleToggleCharacterAccordion}
        >
          <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
            person
          </span>
          <span className="kr_body_b">캐릭터</span>
        </button>

        {isCharacterOpen && (
          <div className={sidebarStyles.accordionList}>
            {worldCharacters.length > 0 ? (
              worldCharacters.map((char) => (
                <div
                  key={char.id}
                  className={`${sidebarStyles.subItem} ${String(char.id) === String(id) ? sidebarStyles.active : ""}`}
                  onClick={() => router.push(`/characters/${char.id}`)}
                >
                  <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                    auto_stories
                  </span>
                  <span className="kr_body_b">{char.name}</span>
                </div>
              ))
            ) : (
              <div className={`${createStyles.topSubItem} ${createStyles.active}`}>
                <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                  auto_stories
                </span>
                <span className="kr_body_b">{characterName}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 사용된 이미지 (이전 생성 이미지 갤러리) */}
      {isOwner && (
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
                <Image src={imgSrc} alt={`생성 이미지 ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const sidebarBottomContent = (
    <>
      {/* 캐릭터 통계 메타정보 (하단 버튼 바로 위에 배치) */}
      <div className={sidebarStyles.metaStatsSection}>
        <div className={sidebarStyles.statRow}>
          <span className="kr_body">작성자 :</span>
          <span className="en_body">{character?.author_name || "알 수 없음"}</span>
        </div>
        <div className={sidebarStyles.statRow}>
          <span className="kr_body">생성일 :</span>
          <span className="kr_body">
            {character?.created_at ? new Date(character.created_at).toLocaleDateString("ko-KR") : "-"}
          </span>
        </div>
        <div className={sidebarStyles.statRow}>
          <span className="kr_body">조회수 :</span>
          <span className="kr_body">{character?.view_count ?? 0}</span>
        </div>
        <div className={sidebarStyles.statRow}>
          <span className="kr_body">좋아요 :</span>
          <span className="kr_body">{likes}</span>
        </div>
      </div>

      {!isOwner && (
        <div className={sidebarStyles.nonOwnerActionGroup}>
          <button
            type="button"
            aria-label="좋아요"
            className={isLiked ? sidebarStyles.active : ""}
            onClick={handleLikeToggle}
            disabled={isLiking}
          >
            <span
              className="material-symbols-outlined icon_36"
              style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
          <button type="button" aria-label="공유" onClick={handleShare}>
            <span className="material-symbols-outlined icon_36">share</span>
          </button>
          <button
            type="button"
            aria-label="북마크"
            className={isBookmarked ? sidebarStyles.activeBookmark : ""}
            onClick={handleBookmarkToggle}
            disabled={isBookmarking}
          >
            <span
              className="material-symbols-outlined icon_36"
              style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              bookmark
            </span>
          </button>
        </div>
      )}

      <button type="button" className={sidebarStyles.sideButton}>
        <span className={sidebarStyles.buttonIcon}>
          <HelpOutlineIcon />
        </span>
        <span className="kr_body_b">도움말</span>
      </button>

      {isOwner && (
        <>
          <button type="button" className={sidebarStyles.sideButton}>
            <span className="kr_body_b">수정</span>
          </button>

          <button type="button" className={sidebarStyles.sideButton}>
            <span className="kr_body_b">삭제</span>
          </button>
        </>
      )}
    </>
  );

  return (
    <div className={createStyles.pageContainer}>
      {/* 상단 헤더 및 글로벌 모바일 메뉴 사이드바 */}
      <HomeMobileMenu headerVariant="main" />

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
              className={createStyles.topTabButton}
              onClick={handleToggleCharacterAccordion}
            >
              <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                person
              </span>
              <span className="kr_body_b">캐릭터</span>
            </button>

            {isCharacterOpen && (
              <div className={createStyles.topAccordionList}>
                {worldCharacters.length > 0 ? (
                  worldCharacters.map((char) => (
                    <div
                      key={char.id}
                      className={`${createStyles.topSubItem} ${String(char.id) === String(id) ? createStyles.active : ""}`}
                      onClick={() => router.push(`/characters/${char.id}`)}
                    >
                      <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                        auto_stories
                      </span>
                      <span className="kr_body_b">{char.name}</span>
                    </div>
                  ))
                ) : (
                  <div className={`${createStyles.topSubItem} ${createStyles.active}`}>
                    <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                      auto_stories
                    </span>
                    <span className="kr_body_b">{characterName}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메인 본문: 사이드바 + CharacterDetail */}
      <main className={createStyles.mainBody}>
        <div className={createStyles.desktopSidebarWrapper}>
          <Sidebar
            topContent={sidebarTopContent}
            bottomContent={sidebarBottomContent}
          />
        </div>

        {/* 메인 폼 위치에 CharacterDetail 컴포넌트 배치 */}
        <div style={{ flex: 1, minWidth: 0, height: "100%", position: "relative" }}>
          {loading && !character ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <span className="kr_body_b">캐릭터 정보 불러오는 중...</span>
            </div>
          ) : (
            <>
              {loading && character && (
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "#0f111a",
                  zIndex: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "16px"
                }}>
                  <span className="kr_body_b" style={{ color: "rgba(255,255,255,0.8)" }}>캐릭터 변경 중...</span>
                </div>
              )}
              <CharacterDetail
                character={character ? { ...character, image_url: selectedImage || character.image_url } : null}
                onRegenerateImage={handleRegenerateImage}
                onSaveImage={handleSaveMainImage}
                isRegenerating={isRegenerating}
                isGeneratingMode={isGeneratingMode}
                isOwner={isOwner}
                currentUser={currentUser}
                comments={comments}
                onAddComment={handleAddComment}
                isSubmittingComment={isSubmittingComment}
              />

              {/* 모바일/태블릿용 메타 정보 및 액션 버튼 (PC에서는 숨김 처리) */}
              <div className={createStyles.mobileMetaActionsWrapper}>
                <div className={createStyles.mobileMetaGrid}>
                  <div className={`kr_body ${createStyles.mobileMetaItem}`}>
                    작성자 : <span>{character?.author_name || "알 수 없음"}</span>
                  </div>
                  <div className={`kr_body ${createStyles.mobileMetaItem}`}>
                    생성일 : <span>{character?.created_at ? new Date(character.created_at).toLocaleDateString("ko-KR") : "-"}</span>
                  </div>
                  <div className={`kr_body ${createStyles.mobileMetaItem}`}>
                    조회수 : <span>{character?.view_count ?? 0}</span>
                  </div>
                  <div className={`kr_body ${createStyles.mobileMetaItem}`}>
                    좋아요 : <span>{likes}</span>
                  </div>
                </div>
                
                {isOwner ? (
                  <div className={createStyles.mobileActionGrid}>
                    <button className={`kr_body_b ${createStyles.actionBtnPrimary}`}>수정</button>
                    <button className={`kr_body_b ${createStyles.actionBtnSecondary}`}>삭제</button>
                  </div>
                ) : (
                  <div className={createStyles.mobileActionGrid}>
                    <button
                      className={`${createStyles.actionBtnIcon} ${isLiked ? createStyles.active : ""}`}
                      onClick={handleLikeToggle}
                      disabled={isLiking}
                    >
                      <span className="material-symbols-outlined icon_24" style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                    </button>
                    <button className={createStyles.actionBtnIcon} onClick={handleShare}>
                      <span className="material-symbols-outlined icon_24">share</span>
                    </button>
                    <button
                      className={`${createStyles.actionBtnIcon} ${isBookmarked ? createStyles.active : ""}`}
                      onClick={handleBookmarkToggle}
                      disabled={isBookmarking}
                    >
                      <span className="material-symbols-outlined icon_24" style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}>bookmark</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* 로그인 확인 모달 */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="로그인 필요"
        message="로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?"
        confirmText="이동하기"
        cancelText="취소"
        onConfirm={handleLoginConfirm}
        onCancel={() => setIsConfirmModalOpen(false)}
      />

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => {
          console.log("로그인 성공:", user);
          window.location.reload();
        }}
      />

      {/* 하단 풋터 (PC에서만 표시) */}
      <div className={createStyles.desktopFooterWrapper}>
        <Footer />
      </div>

      {/* 모바일 하단 네비게이션 */}
      <MobileNavigation />
    </div>
  );
}
