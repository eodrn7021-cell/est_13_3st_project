import Link from "next/link";
import styles from "./QuickMenu.module.scss";

const QuickMenu = ({ href, icon, title, description }) => {
  return (
    <Link className={styles.quick_menu_card} href={href}>
      <span
        className={`material-symbols-rounded icon_36 ${styles.quick_menu_icon}`}
        aria-hidden="true"
      >
        {icon}
      </span>

      <div className={styles.quick_menu_content}>
        <strong className={`kr_pc_btn_text ${styles.quick_menu_title}`}>{title}</strong>

        <div className={styles.quick_menu_bottom}>
          <p className={`kr_caption ${styles.quick_menu_description}`}>{description}</p>

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
