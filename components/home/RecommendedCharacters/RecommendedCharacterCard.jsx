import Image from "next/image";
// import Tag from "@/components/common/Tag/Tag";
import styles from "./RecommendedCharacterCard.module.scss";

const RecommendedCharacterCard = ({ image, name, description, tags }) => {
  return (
    <article className={styles.card} tabIndex={0}>
      {/* 캐릭터 이미지 */}
      <Image
        src={image}
        alt={`${name} 캐릭터 이미지`}
        fill
        sizes="(max-width: 480px) 100vw, (max-width: 1024px) 218px, 285px"
        className={styles.card_image}
      />

      {/* 이미지 위 어두운 그라디언트 */}
      <div className={styles.card_overlay} />

      {/* 카드 내용 */}
      <div className={styles.card_content}>
        <span className={`kr_caption ${styles.card_badge}`}>추천 캐릭터</span>
        <div className={styles.card_text}>
          <h3 className={`kr_card_title ${styles.card_title}`}>{name}</h3>
          <p className={`kr_caption ${styles.card_description}`}>{description}</p>
        </div>

        <div className={styles.card_tags}>
          {tags.map((tag) => (
            <span key={tag} className={`kr_caption ${styles.card_tag}`}>
              {tag}
            </span>
          ))}
        </div>
        {/* <div className={styles.card_tags}>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div> 태그 컴포넌트 만든 후 사용할거*/}
      </div>
    </article>
  );
};

export default RecommendedCharacterCard;
