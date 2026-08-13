"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import RecommendedCharacterCard from "./RecommendedCharacterCard";
import styles from "./RecommendedCharacters.module.scss";

const RecommendedCharacters = () => {
  const [recommendedCharacters, setRecommendedCharacters] = useState([]);

  // 현재 페이지
  const [activeIndex, setActiveIndex] = useState(0);

  // 한 페이지에 보여줄 카드 개수
  const [cardsPerPage, setCardsPerPage] = useState(3);

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

      // 화면 크기가 바뀌면 첫 페이지로 이동
      setActiveIndex(0);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 추천 캐릭터 조회
  useEffect(() => {
    const fetchRecommendedCharacters = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("characters")
        .select("id, name, race, job_role, background_story, image_url")
        .limit(9); // 최대 9개 조회

      if (error) {
        console.error("추천 캐릭터 조회 실패:", error);
        return;
      }

      const formattedCharacters = (data || []).map((character) => ({
        id: character.id,
        image: character.image_url || "/images/home/recommended-character-01.webp",
        name: character.name,
        description: character.background_story || "캐릭터 소개가 아직 없습니다.",
        tags: [character.race, character.job_role].filter(Boolean),
      }));

      setRecommendedCharacters(formattedCharacters);
    };

    fetchRecommendedCharacters();
  }, []);

  // PC 9개 / 태블릿 6개 / 모바일 3개만 사용
  const visibleCharacterCount = cardsPerPage * 3;
  const visibleCharacters = recommendedCharacters.slice(0, visibleCharacterCount);

  // 현재 페이지에 보여줄 캐릭터만 자르기
  const startIndex = activeIndex * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentCharacters = visibleCharacters.slice(startIndex, endIndex);

  // 페이지 이동
  const handlePageChange = (index) => {
    setActiveIndex(index);
  };

  return (
    <section className={styles.recommended}>
      <h2 className={styles.sr_only}>추천 캐릭터</h2>

      {/* 현재 페이지의 카드만 렌더링 */}
      <div className={styles.recommended_list}>
        {currentCharacters.map((character, index) => (
          <RecommendedCharacterCard
            key={character.id}
            id={character.id}
            image={character.image}
            name={character.name}
            description={character.description}
            tags={character.tags}
            isPriority={activeIndex === 0 && index === 0}
          />
        ))}
      </div>

      {/* 페이지네이션은 항상 3개 */}
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
    </section>
  );
};

export default RecommendedCharacters;
