"use client";

import { Suspense, useState, useEffect, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import HomeMobileMenu from "@/components/home/HomeMobileMenu/HomeMobileMenu";
import MobileNavigation from "@/components/layout/MobileNavigation/MobileNavigation";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import CharacterDetail from "@/components/character/CharacterDetail/CharacterDetail";
import Button from "@/components/common/Button/Button";
import LoginModal from "@/components/auth/LoginModal/LoginModal";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import HelpModal from "@/components/character/HelpModal/HelpModal";
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

function CharacterDetailContent({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [generatingMode] = useState(searchParams.get("generating"));
  const [isGeneratingMode] = useState(Boolean(generatingMode));

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const [isLiked, setIsLiked] = useState(() => Boolean(cachedCharacter?.initialIsLiked));
  const [isBookmarked, setIsBookmarked] = useState(() => Boolean(cachedCharacter?.initialIsBookmarked));
  const [likes, setLikes] = useState(() => cachedCharacter?.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const [isWorldLiked, setIsWorldLiked] = useState(false);
  const [isWorldBookmarked, setIsWorldBookmarked] = useState(false);
  const [worldLikes, setWorldLikes] = useState(0);
  const [isWorldLiking, setIsWorldLiking] = useState(false);
  const [isWorldBookmarking, setIsWorldBookmarking] = useState(false);

  const [character, setCharacter] = useState(() => cachedCharacter);
  const [loading, setLoading] = useState(!cachedCharacter);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isWorldRegenerating, setIsWorldRegenerating] = useState(false);
  const [dbImageHistory, setDbImageHistory] = useState(() => cachedDbImageHistory);
  const [selectedImage, setSelectedImage] = useState(null);

  const [dbWorldImageHistory, setDbWorldImageHistory] = useState([]);
  const [selectedWorldImage, setSelectedWorldImage] = useState(null);

  const [activeNav, setActiveNav] = useState("character");
  const [isCharacterOpen, setIsCharacterOpen] = useState(true);
  const [worldCharacters, setWorldCharacters] = useState(() => cachedWorldCharacters);

  // 코멘트 상태
  const [comments, setComments] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [worldComments, setWorldComments] = useState([]);
  const [isSubmittingWorldComment, setIsSubmittingWorldComment] = useState(false);

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

  const fetchWorldImageHistory = async (worldId) => {
    if (!worldId) return;
    try {
      const res = await fetch(`/api/worlds/images?worldId=${worldId}`);
      if (res.ok) {
        const json = await res.json();
        setDbWorldImageHistory(json?.images || []);
      }
    } catch (err) {
      console.warn("세계관 이미지 히스토리 조회 오류:", err);
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

      // 이미지가 생성되면 자동으로 메인 이미지로 저장
      try {
        const saveRes = await fetch("/api/characters/set-main-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            characterId: charId || id,
            imageUrl: result.imageUrl,
          }),
        });
        const saveResult = await saveRes.json();
        if (saveRes.ok && !saveResult.error) {
          setCharacter((prev) => ({
            ...prev,
            image_url: result.imageUrl,
          }));
        }
      } catch (saveErr) {
        console.error("자동 대표 이미지 저장 중 오류:", saveErr);
      }

      await fetchImageHistory(charId || id);
    } catch (err) {
      console.error("자동 이미지 생성 요청 오류:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const triggerWorldImageGeneration = async (worldId) => {
    setIsWorldRegenerating(true);
    try {
      const res = await fetch("/api/worlds/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldId }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        console.error("세계관 이미지 생성 중 오류:", result.error);
        setIsWorldRegenerating(false);
        return;
      }

      // 이미지가 생성되면 자동으로 메인 이미지로 저장
      try {
        const saveRes = await fetch("/api/worlds/set-main-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worldId: worldId,
            imageUrl: result.imageUrl,
          }),
        });
        
        if (saveRes.ok) {
           setCharacter((prev) => prev ? {
             ...prev,
             worlds: prev.worlds ? { ...prev.worlds, image_url: result.imageUrl } : null
           } : prev);
           await fetchWorldImageHistory(worldId);
        }
      } catch (saveErr) {
        console.error("세계관 메인 이미지 저장 중 오류:", saveErr);
      }
    } catch (err) {
      console.error("세계관 이미지 생성 요청 오류:", err);
    } finally {
      setIsWorldRegenerating(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (activeNav === "world") {
      if (isWorldRegenerating || !character?.world_id) return;
      await triggerWorldImageGeneration(character.world_id);
    } else {
      if (isRegenerating || !id) return;
      await triggerImageGeneration(id);
    }
  };

  const handleSaveMainImage = async () => {
    if (activeNav === "world") {
      const targetImage = selectedWorldImage || character?.worlds?.image_url;
      if (!targetImage || !character?.world_id) {
        alert("저장할 세계관 이미지가 선택되지 않았습니다.");
        return;
      }

      try {
        const res = await fetch("/api/worlds/set-main-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worldId: character.world_id,
            imageUrl: targetImage,
          }),
        });

        const result = await res.json();
        if (!res.ok || result.error) {
          alert(result.error || "대표 이미지 저장 실패");
          return;
        }

        setCharacter((prev) => prev ? {
          ...prev,
          worlds: prev.worlds ? { ...prev.worlds, image_url: targetImage } : null
        } : prev);
        await fetchWorldImageHistory(character.world_id);
        alert("선택한 이미지가 세계관 대표 이미지로 지정 및 저장되었습니다!");
      } catch (err) {
        console.error("세계관 대표 이미지 저장 오류:", err);
        alert("세계관 대표 이미지 저장 중 오류가 발생했습니다.");
      }
    } else {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDbImageHistory([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDbWorldImageHistory([]);
    }
    setSelectedImage(null);
    setSelectedWorldImage(null);

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

        // 세계관 좋아요, 북마크 상태 조회
        if (data.world_id) {
          try {
            const [
              { count: wLikesCount },
              { data: wLikeData },
              { data: wBookmarkData }
            ] = await Promise.all([
              supabase.from("world_likes").select("*", { count: "exact", head: true }).eq("world_id", data.world_id),
              user ? supabase.from("world_likes").select("id").eq("world_id", data.world_id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
              user ? supabase.from("world_bookmarks").select("id").eq("world_id", data.world_id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null })
            ]);

            setWorldLikes(wLikesCount || 0);
            setIsWorldLiked(Boolean(wLikeData));
            setIsWorldBookmarked(Boolean(wBookmarkData));
          } catch (wErr) {
            console.error("세계관 좋아요/북마크 조회 오류:", wErr);
          }
        }

        // 생성창이 아닐 때만 해당 세계관의 다른 캐릭터들 조회
        if (!isGeneratingMode && data.world_id) {
          const { data: chars } = await supabase
            .from("characters")
            .select("id, name")
            .eq("world_id", data.world_id)
            .order("created_at", { ascending: false });
          
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

        // 세계관 코멘트 조회
        if (data.world_id) {
          try {
            const wCommentsRes = await fetch(`/api/worlds/comments?worldId=${data.world_id}`);
            if (wCommentsRes.ok) {
              const wCommentsJson = await wCommentsRes.json();
              if (wCommentsJson.success) {
                setWorldComments(wCommentsJson.comments || []);
              }
            }
          } catch (wCommentErr) {
            console.error("세계관 코멘트 조회 오류:", wCommentErr);
          }
          await fetchWorldImageHistory(data.world_id);
        }

        await fetchImageHistory(data.id);
        // 새로고침 시 무한 자동 생성을 막기 위해, isGeneratingMode일 때만 1회 실행
        if (isGeneratingMode && !generationTriggered.current) {
          generationTriggered.current = true;
          
          if (generatingMode === "all" || generatingMode === "true") {
            triggerImageGeneration(data.id).then(() => {
              if (data.world_id && data.worlds && !data.worlds.image_url) {
                triggerWorldImageGeneration(data.world_id);
              }
            });
          } else if (generatingMode === "character") {
            triggerImageGeneration(data.id);
          } else if (generatingMode === "world" && data.world_id) {
            triggerWorldImageGeneration(data.world_id);
          }
          
          // 새로고침 시 다시 생성되지 않도록 URL에서 파라미터 제거
          router.replace(`/characters/${data.id}`);
        }
      }
    };

    fetchCharacterAndUser();
  }, [id, isGeneratingMode, router]);

  useEffect(() => {
    // 선택된 캐릭터가 아코디언 영역 내에 보이도록 스크롤 이동
    const activeDesktop = document.getElementById("active-desktop-item");
    if (activeDesktop) {
      activeDesktop.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    const activeMobile = document.getElementById("active-mobile-item");
    if (activeMobile) {
      activeMobile.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [id, worldCharacters, isCharacterOpen]);

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

  const handleAddWorldComment = async (content) => {
    if (!currentUser) {
      setIsConfirmModalOpen(true);
      return;
    }
    const targetWorldId = character?.world_id;
    if (isSubmittingWorldComment || !content?.trim() || !targetWorldId) return;

    setIsSubmittingWorldComment(true);
    try {
      const res = await fetch("/api/worlds/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldId: targetWorldId, content: content.trim() }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert(result.error || "코멘트 등록 중 오류가 발생했습니다.");
        return;
      }

      setWorldComments((prev) => [result.comment, ...prev]);
    } catch (err) {
      console.error("세계관 코멘트 등록 예외:", err);
      alert("코멘트 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingWorldComment(false);
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

  const handleWorldLikeToggle = async () => {
    if (!currentUser) {
      setIsConfirmModalOpen(true);
      return;
    }
    const targetWorldId = character?.world_id;
    if (isWorldLiking || !targetWorldId) return;

    setIsWorldLiking(true);
    const prevIsLiked = isWorldLiked;
    const prevLikes = worldLikes;

    setIsWorldLiked(!prevIsLiked);
    setWorldLikes((prev) => (prevIsLiked ? Math.max(0, prev - 1) : prev + 1));

    try {
      const res = await fetch("/api/worlds/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldId: targetWorldId }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setIsWorldLiked(prevIsLiked);
        setWorldLikes(prevLikes);
        alert(result.error || "좋아요 처리 중 오류가 발생했습니다.");
        return;
      }

      setIsWorldLiked(result.isLiked);
      setWorldLikes(result.likes);
    } catch (err) {
      console.error("세계관 좋아요 처리 중 예외 발생:", err);
      setIsWorldLiked(prevIsLiked);
      setWorldLikes(prevLikes);
    } finally {
      setIsWorldLiking(false);
    }
  };

  const handleWorldBookmarkToggle = async () => {
    if (!currentUser) {
      setIsConfirmModalOpen(true);
      return;
    }
    const targetWorldId = character?.world_id;
    if (isWorldBookmarking || !targetWorldId) return;

    setIsWorldBookmarking(true);
    const prevIsBookmarked = isWorldBookmarked;

    setIsWorldBookmarked(!prevIsBookmarked);

    try {
      const res = await fetch("/api/worlds/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldId: targetWorldId }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setIsWorldBookmarked(prevIsBookmarked);
        alert(result.error || "북마크 처리 중 오류가 발생했습니다.");
        return;
      }

      setIsWorldBookmarked(result.isBookmarked);
    } catch (err) {
      console.error("세계관 북마크 처리 중 예외 발생:", err);
      setIsWorldBookmarked(prevIsBookmarked);
    } finally {
      setIsWorldBookmarking(false);
    }
  };

  // 삭제 대상 (handleRegenerateImage 함수는 위로 이동됨)

  const world = character?.worlds;
  const worldTitle = world?.name || world?.title || "";
  const characterName = character?.name || "";

  // 현재 캐릭터의 DB 히스토리 중 가장 최근 4개 이미지 추출
  const imageHistory = activeNav === "world" ? dbWorldImageHistory.slice(0, 4) : dbImageHistory.slice(0, 4);

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
                  id={String(char.id) === String(id) ? "active-desktop-item" : undefined}
                  className={`${sidebarStyles.subItem} ${String(char.id) === String(id) ? sidebarStyles.active : ""}`}
                  onClick={() => router.push(`/characters/${char.id}`, { scroll: false })}
                >
                  {String(char.id) === String(id) ? (
                    <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                      auto_stories
                    </span>
                  ) : (
                    <span className="icon_24" style={{ display: "inline-flex", width: "24px", height: "24px", flexShrink: 0 }} />
                  )}
                  <span className="kr_body_b">{char.name}</span>
                </div>
              ))
            ) : (
              <div className={`${sidebarStyles.subItem} ${sidebarStyles.active}`}>
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
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className={sidebarStyles.thumbBox}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "rgba(255,255,255,0.2)", fontSize: "24px" }}>image</span>
                </div>
              ))
            ) : (
              imageHistory.map((imgSrc, idx) => (
                <div
                  key={imgSrc}
                  className={sidebarStyles.thumbBox}
                  onClick={() => {
                    if (activeNav === "world") {
                      setSelectedWorldImage(imgSrc);
                    } else {
                      setSelectedImage(imgSrc);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Image src={imgSrc} alt={`생성 이미지 ${idx + 1}`} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("정말 이 캐릭터를 삭제하시겠습니까?\n삭제된 캐릭터는 복구할 수 없습니다.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/characters/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: id }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.error || "삭제에 실패했습니다.");
        setIsDeleting(false);
        return;
      }
      alert("캐릭터가 성공적으로 삭제되었습니다.");
      // 모듈 단위 캐시 무효화
      cachedCharacter = null;
      router.push("/");
    } catch (err) {
      console.error("삭제 중 오류:", err);
      alert("삭제 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    // 생성창으로 이동하면서 worldId와 charId를 전달 (create 페이지에서 처리할 수 있도록)
    if (character?.world_id) {
      router.push(`/characters/create?worldId=${character.world_id}&charId=${id}`);
    } else {
      router.push("/characters/create");
    }
  };

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
          <span className="kr_body">{activeNav === "world" ? worldLikes : likes}</span>
        </div>
      </div>

      {!isOwner && (
        <div className={sidebarStyles.nonOwnerActionGroup}>
          <button
            type="button"
            aria-label="좋아요"
            className={(activeNav === "world" ? isWorldLiked : isLiked) ? sidebarStyles.active : ""}
            onClick={activeNav === "world" ? handleWorldLikeToggle : handleLikeToggle}
            disabled={activeNav === "world" ? isWorldLiking : isLiking}
          >
            <span
              className="material-symbols-outlined icon_36"
              style={(activeNav === "world" ? isWorldLiked : isLiked) ? { fontVariationSettings: "'FILL' 1" } : undefined}
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
            className={(activeNav === "world" ? isWorldBookmarked : isBookmarked) ? sidebarStyles.activeBookmark : ""}
            onClick={activeNav === "world" ? handleWorldBookmarkToggle : handleBookmarkToggle}
            disabled={activeNav === "world" ? isWorldBookmarking : isBookmarking}
          >
            <span
              className="material-symbols-outlined icon_36"
              style={(activeNav === "world" ? isWorldBookmarked : isBookmarked) ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              bookmark
            </span>
          </button>
        </div>
      )}

      {isOwner && (
        <>
          <button type="button" className={sidebarStyles.sideButton} onClick={() => setIsHelpModalOpen(true)}>
            <span className={sidebarStyles.buttonIcon}>
              <HelpOutlineIcon />
            </span>
            <span className="kr_body_b">도움말</span>
          </button>

          <button type="button" className={sidebarStyles.sideButton} onClick={handleEdit}>
            <span className="kr_body_b">수정</span>
          </button>

          <button type="button" className={sidebarStyles.sideButton} onClick={handleDelete} disabled={isDeleting}>
            <span className="kr_body_b">{isDeleting ? "삭제 중..." : "삭제"}</span>
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
                      id={String(char.id) === String(id) ? "active-mobile-item" : undefined}
                      className={`${createStyles.topSubItem} ${String(char.id) === String(id) ? createStyles.active : ""}`}
                      onClick={() => router.push(`/characters/${char.id}`, { scroll: false })}
                    >
                      {String(char.id) === String(id) ? (
                        <span className="material-icons-outlined icon_24" style={{ display: "inline-flex", alignItems: "center" }}>
                          auto_stories
                        </span>
                      ) : (
                        <span className="icon_24" style={{ display: "inline-flex", width: "24px", height: "24px", flexShrink: 0 }} />
                      )}
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
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", position: "relative" }}>
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
                  <span className={`kr_body_b ${createStyles.generatingOverlayText}`}>캐릭터 변경 중...</span>
                </div>
              )}
              {isWorldRegenerating && (
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(15, 17, 26, 0.7)",
                  zIndex: 49,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "16px",
                  backdropFilter: "blur(4px)"
                }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <div className="spinner"></div>
                    <span className={`kr_body_b ${createStyles.generatingOverlayText}`}>세계관 이미지 생성 중...</span>
                  </div>
                </div>
              )}
              <CharacterDetail
                character={character ? { 
                  ...character, 
                  image_url: activeNav === "world" 
                    ? (selectedWorldImage || character?.worlds?.image_url) 
                    : (selectedImage || character?.image_url) 
                } : null}
                activeNav={activeNav}
                onRegenerateImage={handleRegenerateImage}
                onSaveImage={handleSaveMainImage}
                isRegenerating={activeNav === "world" ? isWorldRegenerating : isRegenerating}
                isGeneratingMode={isGeneratingMode}
                isOwner={isOwner}
                currentUser={currentUser}
                comments={activeNav === "world" ? worldComments : comments}
                onAddComment={activeNav === "world" ? handleAddWorldComment : handleAddComment}
                isSubmittingComment={activeNav === "world" ? isSubmittingWorldComment : isSubmittingComment}
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
                    좋아요 : <span>{activeNav === "world" ? worldLikes : likes}</span>
                  </div>
                </div>
                
                {isOwner ? (
                  <div className={createStyles.mobileActionGrid}>
                    <button className={`kr_body_b ${createStyles.actionBtnPrimary}`} onClick={handleEdit}>
                      수정
                    </button>
                    <button className={`kr_body_b ${createStyles.actionBtnSecondary}`} onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                ) : (
                  <div className={createStyles.mobileActionGrid}>
                    <button
                      className={`${createStyles.actionBtnIcon} ${(activeNav === "world" ? isWorldLiked : isLiked) ? createStyles.active : ""}`}
                      onClick={activeNav === "world" ? handleWorldLikeToggle : handleLikeToggle}
                      disabled={activeNav === "world" ? isWorldLiking : isLiking}
                    >
                      <span className="material-symbols-outlined icon_24" style={(activeNav === "world" ? isWorldLiked : isLiked) ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                    </button>
                    <button className={createStyles.actionBtnIcon} onClick={handleShare}>
                      <span className="material-symbols-outlined icon_24">share</span>
                    </button>
                    <button
                      className={`${createStyles.actionBtnIcon} ${(activeNav === "world" ? isWorldBookmarked : isBookmarked) ? createStyles.active : ""}`}
                      onClick={activeNav === "world" ? handleWorldBookmarkToggle : handleBookmarkToggle}
                      disabled={activeNav === "world" ? isWorldBookmarking : isBookmarking}
                    >
                      <span className="material-symbols-outlined icon_24" style={(activeNav === "world" ? isWorldBookmarked : isBookmarked) ? { fontVariationSettings: "'FILL' 1" } : undefined}>bookmark</span>
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
        message="로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?"
        confirmText="로그인"
        cancelText="취소"
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleLoginConfirm}
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

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        mode="detail"
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

export default function CharacterDetailPage(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CharacterDetailContent {...props} />
    </Suspense>
  );
}
