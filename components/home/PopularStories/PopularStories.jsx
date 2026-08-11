import Link from "next/link";
import PopularStoryCard from "./PopularStoryCard";
import styles from "./PopularStories.module.scss";

// 인기 스토리 임시 데이터
// 추후 Supabase 데이터로 교체
const popularStories = [
  {
    id: 1,
    image: "/images/home/popular-story-neon-shadow.webp",
    title: "네온 사이의 그림자",
    description: "진실은 언제나 빛 뒤에 숨어 있다.",
    tags: ["현대", "스릴러"],
  },
  {
    id: 2,
    image: "/images/home/popular-story-promise.webp",
    title: "그날의 약속",
    description: "시간이 흘러도, 마음은 기억한다.",
    tags: ["로맨스", "드라마"],
  },
  {
    id: 3,
    image: "/images/home/popular-story-star-records.webp",
    title: "별의 기록자들",
    description: "우주 끝에서 마주한 잊힌 약속.",
    tags: ["SF", "모험"],
  },
  {
    id: 4,
    image: "/images/home/popular-story-last-prayer.webp",
    title: "성역의 마지막 기도",
    description: "빛이 꺼져가는 순간, 기억이 시작된다.",
    tags: ["판타지", "성장형"],
  },
];

const PopularStories = () => {
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
