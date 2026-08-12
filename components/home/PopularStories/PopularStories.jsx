"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PopularStoryCard from "./PopularStoryCard";
import styles from "./PopularStories.module.scss";

const PopularStories = () => {
  const [popularStories, setPopularStories] = useState([]);

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
    };

    fetchPopularStories();
  }, []);

  return (
    <section className={styles.popular_stories}>
      {/* 제목 + 더보기 */}
      <div className={styles.popular_stories_header}>
        <h2 className="kr_body_b">인기 스토리</h2>

        {/* 추후 캐릭터 목록의 좋아요순 정렬과 연결 */}
        <Link href="/characters?sort=likes" className={`kr_caption ${styles.popular_stories_more}`}>
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
        {popularStories.map((story) => (
          <PopularStoryCard
            key={story.id}
            image={story.image}
            title={story.title}
            description={story.description}
            tags={story.tags}
          />
        ))}
      </div>
    </section>
  );
};

export default PopularStories;
