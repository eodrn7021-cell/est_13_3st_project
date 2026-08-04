import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer_inner}>
        {/* 왼쪽 브랜드 영역 */}
        <div className={styles.footer_brand}>
          <h2 className={`en_pc_title ${styles.footer_logo}`}>VisuLore</h2>
          <p className={`kr_body ${styles.footer_subtitle}`}>AI 캐릭터 &amp; 스토리 아카이브</p>
          <p className={`kr_caption ${styles.footer_description}`}>
            상상한 캐릭터와 이야기를 만들고,
            <br />
            저장하고, 관리해보세요.
          </p>

          <div className={styles.footer_sns}>
            <Link href="https://discord.com" target="_blank" rel="noreferrer" aria-label="디스코드">
              <Image
                className={styles.footer_sns_discord}
                src="/images/icons/discord.svg"
                alt=""
                width={24}
                height={24}
              />
            </Link>

            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="인스타그램"
            >
              <Image
                className={styles.footer_sns_instagram}
                src="/images/icons/instagram.svg"
                alt=""
                width={24}
                height={24}
              />
            </Link>

            <Link href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <Image
                className={styles.footer_sns_x}
                src="/images/icons/x.svg"
                alt=""
                width={24}
                height={24}
              />
            </Link>

            <Link href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="유튜브">
              <Image
                className={styles.footer_sns_youtube}
                src="/images/icons/youtube.svg"
                alt=""
                width={24}
                height={24}
              />
            </Link>
          </div>

          <p className={`en_caption ${styles.footer_copyright}`}>
            © 2026 VisuLore. All rights reserved.
          </p>
        </div>

        {/* 오른쪽 메뉴 영역 */}
        <nav className={styles.footer_nav} aria-label="푸터 메뉴">
          <div className={styles.footer_menu_group}>
            <h3 className={`kr_caption ${styles.footer_menu_title}`}>서비스</h3>
            <span className={styles.footer_menu_line} />
            <div className={styles.footer_menu_links}>
              <Link href="/characters">캐릭터 둘러보기</Link>
              <Link href="/characters/create">캐릭터 만들기</Link>
              <Link href="/stories">인기 스토리</Link>
            </div>
          </div>

          <div className={styles.footer_menu_group}>
            <h3 className={`kr_caption ${styles.footer_menu_title}`}>지원</h3>
            <span className={styles.footer_menu_line} />
            <div className={styles.footer_menu_links}>
              <Link href="/guide">이용 가이드</Link>
              <Link href="/faq">자주 묻는 질문</Link>
              <Link href="/contact">문의하기</Link>
            </div>
          </div>

          <div className={styles.footer_menu_group}>
            <h3 className={`kr_caption ${styles.footer_menu_title}`}>정책</h3>
            <span className={styles.footer_menu_line} />
            <div className={styles.footer_menu_links}>
              <Link href="/terms">이용약관</Link>
              <Link href="/privacy">개인정보처리방침</Link>
              <Link href="/content-policy">콘텐츠 정책</Link>
            </div>
          </div>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
