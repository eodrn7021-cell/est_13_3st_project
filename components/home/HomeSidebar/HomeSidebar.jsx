import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import styles from "./HomeSidebar.module.scss";

const tags = ["판타지", "기사", "마법사", "엘프", "악역", "성장", "악마"];

const HomeSidebar = () => {
  return (
    <Sidebar>
      <div className={styles.home_sidebar}>
        {/* 상단 메뉴 */}
        <nav className={styles.sidebar_nav} aria-label="메인 메뉴">
          <Link href="/" className={`${styles.sidebar_link} ${styles.sidebar_link_active}`}>
            <span
              className={`material-symbols-rounded icon_24 ${styles.sidebar_icon}`}
              aria-hidden="true"
            >
              home
            </span>
            <span className="kr_body">홈</span>
          </Link>

          <Link href="/characters" className={styles.sidebar_link}>
            <span
              className={`material-symbols-rounded icon_24 ${styles.sidebar_icon}`}
              aria-hidden="true"
            >
              favorite
            </span>
            <span className="kr_body">추천</span>
          </Link>

          <Link href="/characters/create" className={styles.sidebar_link}>
            <span
              className={`material-symbols-rounded icon_24 ${styles.sidebar_icon}`}
              aria-hidden="true"
            >
              add_circle
            </span>
            <span className="kr_body">만들기</span>
          </Link>

          <Link href="/my-page" className={styles.sidebar_link}>
            <span
              className={`material-symbols-rounded icon_24 ${styles.sidebar_icon}`}
              aria-hidden="true"
            >
              person
            </span>
            <span className="kr_body">마이페이지</span>
          </Link>
        </nav>

        {/* 구분선 */}
        <div className={styles.sidebar_divider} />

        {/* 태그 탐색 */}
        <section className={styles.tag_section}>
          <h2 className={`kr_caption ${styles.tag_title}`}>태그 탐색</h2>
          <div className={styles.tag_list}>
            {tags.map((tag) => (
              <button key={tag} type="button" className={`kr_caption ${styles.tag_button}`}>
                {tag}
              </button>
            ))}
          </div>

          <Link href="/characters" className={styles.more_tags}>
            <span className="kr_body">더 많은 태그 보기</span>
            <span className="material-symbols-rounded icon_24" aria-hidden="true">
              chevron_right
            </span>
          </Link>
        </section>
      </div>
    </Sidebar>
  );
};

export default HomeSidebar;
