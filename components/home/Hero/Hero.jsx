import Link from "next/link";
import styles from "./Hero.module.scss";

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.hero_content}>
        <h1 className={`kr_pc_title ${styles.hero_title}`}>
          AI로 나만의
          <br />
          <span className={styles.hero_highlight}>캐릭터</span>를 만들어 보세요
        </h1>

        <p className={`kr_body ${styles.hero_description}`}>
          상상한 세계관과 캐릭터 설정을
          <br />
          이미지와 이야기로 완성해보세요.
        </p>

        <Link href="/characters/create" className={`kr_body ${styles.hero_button}`}>
          <span className={`kr_body ${styles.hero_button_text}`}>캐릭터 만들기</span>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
