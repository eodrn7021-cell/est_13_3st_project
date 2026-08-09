import Image from "next/image";
import Link from "next/link";
import styles from "./CategoryCard.module.scss";

const CategoryCard = ({ name, slug, image, icon, isPriority = false }) => {
  return (
    <Link href={`/characters?category=${slug}`} className={styles.category_card}>
      {/* 배경 이미지 */}
      <Image
        src={image}
        alt=""
        fill
        loading={isPriority ? "eager" : "lazy"}
        sizes="(max-width: 480px) 50vw, (max-width: 767px) 50vw, (max-width: 1200px) 25vw, 212px"
        className={styles.category_image}
      />

      {/* 아이콘 + 카테고리 이름 */}
      <div className={styles.category_content}>
        <Image src={icon} alt="" width={22} height={24} className={styles.category_icon} />
        <span className={`kr_body ${styles.category_name}`}>{name}</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
