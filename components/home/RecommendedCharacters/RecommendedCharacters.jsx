"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import RecommendedCharacterCard from "./RecommendedCharacterCard";
import styles from "./RecommendedCharacters.module.scss";

const RecommendedCharacters = () => {
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [recommendedCharacters, setRecommendedCharacters] = useState([]);

  useEffect(() => {
    const fetchRecommendedCharacters = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("characters")
        .select("id, name, race, job_role, background_story, image_url")
        .limit(3);

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

  const handleScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const cardWidth = slider.clientWidth;
    const currentIndex = Math.round(slider.scrollLeft / cardWidth);
    setActiveIndex(currentIndex);
  };

  return (
    <section className={styles.recommended}>
      <h2 className={styles.sr_only}>추천 캐릭터</h2>
      {/* 추천 캐릭터 카드 목록 */}
      <div ref={sliderRef} className={styles.recommended_list} onScroll={handleScroll}>
        {recommendedCharacters.map((character, index) => (
          <RecommendedCharacterCard
            id={character.id}
            key={character.id}
            image={character.image}
            name={character.name}
            description={character.description}
            tags={character.tags}
            isPriority={index === 0}
          />
        ))}
      </div>

      {/* 슬라이더 */}
      <div className={styles.recommended_slider} aria-hidden="true">
        {recommendedCharacters.map((character, index) => (
          <span
            key={character.id}
            className={`${styles.slider_dot} ${
              activeIndex === index ? styles.slider_dot_active : ""
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default RecommendedCharacters;
