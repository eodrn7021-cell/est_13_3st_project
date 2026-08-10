import Link from "next/link";
import CategoryCard from "./CategoryCard";
import styles from "./CategoryList.module.scss";

const categories = [
  {
    id: 1,
    name: "판타지",
    slug: "fantasy",
    image: "/images/home/category-fantasy.png",
    icon: "/images/home/icon-category-fantasy.png",
  },
  {
    id: 2,
    name: "현대",
    slug: "modern",
    image: "/images/home/category-modern.png",
    icon: "/images/home/icon-category-modern.png",
  },
  {
    id: 3,
    name: "SF",
    slug: "sf",
    image: "/images/home/category-sf.png",
    icon: "/images/home/icon-category-sf.png",
  },
  {
    id: 4,
    name: "무협",
    slug: "martial-arts",
    image: "/images/home/category-martial-arts.png",
    icon: "/images/home/icon-category-martial-arts.png",
  },
  {
    id: 5,
    name: "로맨스",
    slug: "romance",
    image: "/images/home/category-romance.png",
    icon: "/images/home/icon-category-romance.png",
  },
  {
    id: 6,
    name: "스릴러",
    slug: "thriller",
    image: "/images/home/category-thriller.png",
    icon: "/images/home/icon-category-thriller.png",
  },
  {
    id: 7,
    name: "드라마",
    slug: "drama",
    image: "/images/home/category-drama.png",
    icon: "/images/home/icon-category-drama.png",
  },
  {
    id: 8,
    name: "일상",
    slug: "daily",
    image: "/images/home/category-daily.png",
    icon: "/images/home/icon-category-daily.png",
  },
];

const CategoryList = () => {
  return (
    <section className={styles.category}>
      {/* 카테고리 제목 */}
      <div className={styles.category_header}>
        <h2 className={`kr_body_b ${styles.category_title}`}>카테고리</h2>

        {/* 전체 카테고리 페이지 */}
        <Link href="/characters" className={`kr_caption ${styles.category_more}`}>
          더보기
          <span
            className={`material-symbols-rounded ${styles.category_more_icon}`}
            aria-hidden="true"
          >
            chevron_right
          </span>
        </Link>
      </div>

      {/* 카테고리 카드 */}
      <div className={styles.category_list}>
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            name={category.name}
            slug={category.slug}
            image={category.image}
            icon={category.icon}
            isPriority={index === 0}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryList;
