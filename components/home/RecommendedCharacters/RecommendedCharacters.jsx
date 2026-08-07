"use client";
import { useRef, useState } from "react";
import RecommendedCharacterCard from "./RecommendedCharacterCard";
import styles from "./RecommendedCharacters.module.scss";

const recommendedCharacters = [
  {
    id: 1,
    image: "/images/home/recommended-character-01.png",
    name: "은빛 성녀 엘리안느",
    description: "고요한 성역을 지키는 성녀. 당신의 운명에 신비로운 빛을 비춥니다.",
    tags: ["엘프", "성녀"],
  },
  {
    id: 2,
    image: "/images/home/recommended-character-02.png",
    name: "어둠의 왕자 카이론",
    description: "저주박은  왕국의 후계자. 그와 함께 진실을 파헤치고 운명을 바꾸세요.",
    tags: ["왕자", "암흑"],
  },
  {
    id: 3,
    image: "/images/home/recommended-character-03.png",
    name: "왕국의 후예",
    description: "사라진 왕좌 계승자를 찾아 떠나는 여정. 당신의 선택이 역사를 만듭니다.",
    tags: ["기사", "모험"],
  },
];

const RecommendedCharacters = () => {
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const cardWidth = slider.clientWidth;
    const currentIndex = Math.round(slider.scrollLeft / cardWidth);
    setActiveIndex(currentIndex);
  };

  return (
    <section className={styles.recommended}>
      {/* 추천 캐릭터 카드 목록 */}
      <div ref={sliderRef} className={styles.recommended_list} onScroll={handleScroll}>
        {recommendedCharacters.map((character) => (
          <RecommendedCharacterCard
            key={character.id}
            image={character.image}
            name={character.name}
            description={character.description}
            tags={character.tags}
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
