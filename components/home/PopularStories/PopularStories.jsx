"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PopularStoryCard from "./PopularStoryCard";
import styles from "./PopularStories.module.scss";

const PopularStories = () => {
  const [popularStories, setPopularStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPopularStories = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("characters")
        .select("id, name, background_story, image_url, race, job_role, view_count, created_at")
        .order("view_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("인기 스토리 조회 실패:", error);
        setErrorMessage("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        setIsLoading(false);
        return;
      }

      const formattedStories = (data || []).map((character) => ({
        id: character.id,
        image: character.image_url || "/images/home/popular-story-neon-shadow.webp",
        title: character.name,
        description: character.background_story || "캐릭터 소개가 아직 없습니다.",
        tags: [character.race, character.job_role].filter(Boolean),
      }));

      setPopularStories(formattedStories);
      setIsLoading(false);
    };

    fetchPopularStories();
  }, []);

  return (
    <section className={styles.popular_stories}>
      {/* 제목 + 더보기 */}
      <div className={styles.popular_stories_header}>
        <h2 className="kr_body_b">인기 스토리</h2>

        <Link href="/characters?sort=views" className={`kr_caption ${styles.popular_stories_more}`}>
          더보기
          <span
            className={`material-symbols-rounded ${styles.popular_stories_more_icon}`}
            aria-hidden="true"
          >
            chevron_right
          </span>
        </Link>
      </div>

      {/* 인기 스토리 카드 */}
      <div className={styles.popular_stories_list}>
        {isLoading ? (
          [0, 1, 2, 3].map((index) => (
            <div
              key={`placeholder-${index}`}
              className={styles.popular_story_placeholder}
              aria-hidden="true"
            />
          ))
        ) : errorMessage ? (
          <div className={styles.state_message} role="alert">
            <span className="kr_body">{errorMessage}</span>
          </div>
        ) : popularStories.length === 0 ? (
          <div className={styles.state_message}>
            <span className="kr_body">등록된 인기 스토리가 없습니다.</span>
          </div>
        ) : (
          popularStories.map((story) => (
            <PopularStoryCard
              key={story.id}
              id={story.id}
              image={story.image}
              title={story.title}
              description={story.description}
              tags={story.tags}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default PopularStories;
