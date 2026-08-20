"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import RecommendedCharacterCard from "./RecommendedCharacterCard";
import styles from "./RecommendedCharacters.module.scss";

const RecommendedCharacters = () => {
  const [recommendedCharacters, setRecommendedCharacters] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  // 현재 페이지
  const [activeIndex, setActiveIndex] = useState(0);

  // 한 페이지에 보여줄 카드 개수
  const [cardsPerPage, setCardsPerPage] = useState(3);

  // 실제 드래그 위치
  const [dragOffset, setDragOffset] = useState(0);

  // 현재 드래그 중인지 확인
  const [isDragging, setIsDragging] = useState(false);

  // 드래그 시작 위치
  const dragStartX = useRef(null);

  // 드래그 후 카드 링크 클릭 방지
  const preventClick = useRef(false);

  // 화면 크기에 따라 사용할 데이터 개수 설정
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        // 모바일: 1개씩
        setCardsPerPage(1);
      } else if (window.innerWidth <= 767) {
        // 작은 태블릿: 2개씩
        setCardsPerPage(2);
      } else {
        // PC / 넓은 태블릿: 3개씩
        setCardsPerPage(3);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 한 페이지에 보여주는 카드 개수가 실제로 바뀔 때만 첫 페이지로 이동
  useEffect(() => {
    setActiveIndex(0);
    setDragOffset(0);
  }, [cardsPerPage]);

  // 추천 캐릭터 조회
  useEffect(() => {
    const fetchRecommendedCharacters = async () => {
      setIsLoading(true);
      setErrorMessage("");
      const supabase = createClient();

      const { data, error } = await supabase.from("characters").select(`
    id,
    name,
    race,
    job_role,
    background_story,
    image_url,
    character_likes(count)
  `);

      if (error) {
        setErrorMessage("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        setIsLoading(false);
        return;
      }

      const formattedCharacters = (data || [])
        .map((character) => ({
          id: character.id,
          image: character.image_url || "/images/home/recommended-character-01.webp",
          name: character.name,
          description: character.background_story || "캐릭터 소개가 아직 없습니다.",
          tags: [character.race, character.job_role].filter(Boolean),
          likeCount: character.character_likes?.[0]?.count || 0,
        }))
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 9);

      setRecommendedCharacters(formattedCharacters);
      setIsLoading(false);
    };

    fetchRecommendedCharacters();
  }, []);

  // PC 9개 / 태블릿 6개 / 모바일 3개만 사용
  const visibleCharacterCount = cardsPerPage * 3;

  const visibleCharacters = recommendedCharacters.slice(0, visibleCharacterCount);

  // 캐릭터를 항상 3페이지로 나누기
  const characterPages = [0, 1, 2].map((pageIndex) => {
    const startIndex = pageIndex * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    return visibleCharacters.slice(startIndex, endIndex);
  });

  // 페이지 이동
  const handlePageChange = (index) => {
    setActiveIndex(index);
    setDragOffset(0);
  };

  // 드래그 시작
  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    dragStartX.current = e.clientX;

    preventClick.current = false;
    setIsDragging(true);
  };

  // 드래그하면 실제 카드도 같이 이동
  const handlePointerMove = (e) => {
    if (dragStartX.current === null) return;

    const distance = e.clientX - dragStartX.current;

    setDragOffset(distance);

    // 실제로 10px 이상 움직였을 때만 드래그로 판단
    if (Math.abs(distance) > 10) {
      preventClick.current = true;

      // 실제 드래그가 시작된 뒤에만 pointer capture
      if (!e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }
    }
  };

  // 드래그 종료
  const handlePointerUp = (e) => {
    if (dragStartX.current === null) return;

    const distance = e.clientX - dragStartX.current;

    // 60px 이상 드래그했을 때 페이지 이동
    if (Math.abs(distance) >= 60) {
      if (distance < 0) {
        // 왼쪽으로 드래그 → 다음 페이지
        setActiveIndex((prev) => Math.min(prev + 1, 2));
      } else {
        // 오른쪽으로 드래그 → 이전 페이지
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }

      preventClick.current = true;
    }

    dragStartX.current = null;

    // 놓으면 페이지 위치로 스냅
    setDragOffset(0);
    setIsDragging(false);

    // 실제로 pointer capture가 걸려 있을 때만 해제
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
  };

  // 드래그 취소
  const handlePointerCancel = () => {
    dragStartX.current = null;
    preventClick.current = false;

    setDragOffset(0);
    setIsDragging(false);
  };

  // 드래그 후 카드 상세 페이지 이동 방지
  const handleClickCapture = (e) => {
    if (!preventClick.current) return;

    e.preventDefault();
    e.stopPropagation();

    preventClick.current = false;
  };

  // 브라우저 기본 이미지 / 링크 드래그 방지
  const handleDragStart = (e) => {
    e.preventDefault();
  };

  return (
    <section className={styles.recommended}>
      <h2 className={styles.sr_only}>추천 캐릭터</h2>
      {!isLoading && errorMessage ? (
        // 네트워크 오류
        <div className={styles.state_message} role="alert">
          <span className="kr_body">{errorMessage}</span>
        </div>
      ) : !isLoading && recommendedCharacters.length === 0 ? (
        // 조회된 데이터 없음
        <div className={styles.state_message}>
          <span className="kr_body">등록된 추천 캐릭터가 없습니다.</span>
        </div>
      ) : (
        <>
          {/* 슬라이더 바깥 영역 */}
          <div
            className={styles.recommended_list}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onClickCapture={handleClickCapture}
            onDragStart={handleDragStart}
          >
            {/* 실제로 좌우 이동하는 슬라이더 트랙 */}
            <div
              className={`${styles.recommended_track} ${isDragging ? styles.is_dragging : ""}`}
              style={{
                transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
              }}
            >
              {/* 항상 3페이지 렌더링 */}
              {characterPages.map((pageCharacters, pageIndex) => (
                <div key={pageIndex} className={styles.recommended_page}>
                  {isLoading && pageIndex === 0 ? (
                    <>
                      {/* 로딩 중 placeholder 3개 */}
                      {[0, 1, 2].map((index) => (
                        <div
                          key={`placeholder-${index}`}
                          className={styles.recommended_placeholder}
                          aria-hidden="true"
                        />
                      ))}
                    </>
                  ) : (
                    pageCharacters.map((character, index) => (
                      <RecommendedCharacterCard
                        key={character.id}
                        id={character.id}
                        image={character.image}
                        name={character.name}
                        description={character.description}
                        tags={character.tags}
                        isPriority={pageIndex === 0 && index === 0}
                        tabIndex={pageIndex === activeIndex ? 0 : -1}
                      />
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 페이지네이션 3개 고정 */}
          {!isLoading && (
            <div className={styles.recommended_slider} aria-label="추천 캐릭터 페이지">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.slider_dot} ${
                    activeIndex === index ? styles.slider_dot_active : ""
                  }`}
                  onClick={() => handlePageChange(index)}
                  aria-label={`${index + 1}페이지`}
                  aria-current={activeIndex === index ? "page" : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default RecommendedCharacters;
