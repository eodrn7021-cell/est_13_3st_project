import Link from "next/link";
import styles from "./QuickMenu.module.scss";

const QuickMenu = () => {
  return (
    <Link className={styles.quick_menu_card} href="/characters/create">
      <span
        className={`material-symbols-rounded icon_36 ${styles.quick_menu_icon}`}
        aria-hidden="true"
      >
        person_add
      </span>

      <div className={styles.quick_menu_content}>
        <strong className={`kr_pc_btn_text ${styles.quick_menu_title}`}>캐릭터 만들기</strong>

        <div className={styles.quick_menu_bottom}>
          <p className={`kr_caption ${styles.quick_menu_description}`}>
            나만의 캐릭터를 생성하고
            <br />
            스토리를 시작해보세요
          </p>

          <span
            className={`material-symbols-rounded icon_24 ${styles.quick_menu_arrow}`}
            aria-hidden="true"
          >
            chevron_right
          </span>
        </div>
      </div>
    </Link>
  );
};

export default QuickMenu;
