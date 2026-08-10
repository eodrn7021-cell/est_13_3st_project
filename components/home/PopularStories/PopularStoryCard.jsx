import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/common/Tag/Tag";
import styles from "./PopularStoryCard.module.scss";

const PopularStoryCard = ({ image, title, description, tags }) => {
  return (
    <Link href="/characters" className={styles.card}>
      {/* 스토리 이미지 */}
      <div className={styles.card_image_wrap}>
        <Image
          src={image}
          alt={`${title} 스토리 이미지`}
          fill
          sizes="(max-width: 480px) 106px, (max-width: 1200px) 331px, 210px"
          className={styles.card_image}
        />
      </div>

      {/* PC / 태블릿 이미지 위 그라디언트 */}
      <div className={styles.card_overlay} aria-hidden="true" />

      {/* 스토리 정보 */}
      <div className={styles.card_content}>
        <div className={styles.card_text}>
          <h3 className={`kr_body_b ${styles.card_title}`}>{title}</h3>
          <p className={`kr_caption ${styles.card_description}`}>{description}</p>
        </div>

        <div className={styles.card_tags}>
          {tags.map((tag) => (
            <Tag
              key={tag}
              interactive={false} // 정보 표시용 태그
              className={styles.card_tag}
            >
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default PopularStoryCard;
