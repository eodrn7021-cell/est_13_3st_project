"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.scss";

const Sidebar = ({ open, onClose, page = "mypage" }) => {
  const pathname = usePathname();

  const menus = [
    {
      icon: "home",
      label: "마이페이지",
      href: "/my-page",
    },
    {
      icon: "menu_book",
      label: "내 캐릭터 관리",
      href: "/my-characters",
    },
    {
      icon: "favorite",
      label: "즐겨찾기",
      href: "/favorites",
    },
    {
      icon: "history",
      label: "최근 생성",
      href: "/recent",
    },
    {
      icon: "manage_accounts",
      label: "계정 설정",
      href: "/settings",
    },
  ];

  if (page === "character" || page === "trash") {
    menus.push({
      icon: "delete",
      label: "휴지통",
      href: "/trash",
    });
  }

  return (
    <>
      {/* 모바일 / 태블릿 배경 */}
      <div
        className={`${styles.backdrop} ${open ? styles.show : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`${styles.sidebar} ${open ? styles.open : ""}`}
        aria-label="마이페이지 메뉴"
      >
        <nav>
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`
              ${styles.menu}
              ${pathname === menu.href ? styles.active : ""}
              ${menu.icon === "delete" ? styles.trashMenu : ""}
            `}
              onClick={onClose}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                {menu.icon}
              </span>

              <span>{menu.label}</span>
            </Link>
          ))}

          {/* 로그아웃 */}
          <button type="button" className={styles.logout}>
            <span className="material-symbols-rounded" aria-hidden="true">
              logout
            </span>

            <span>로그아웃</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
