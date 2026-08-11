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
      href: "/my-character",
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

  // 내 캐릭터 목록, 휴지통에서만 휴지통 메뉴 표시
  if (page === "character" || page === "trash") {
    menus.push({
      icon: "delete",
      label: "휴지통",
      href: "/trash",
    });
  }

  return (
    <>
      {/* 배경 */}
      <div className={`${styles.backdrop} ${open ? styles.show : ""}`} onClick={onClose} />

      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <nav>
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`${styles.menu}
              ${pathname === menu.href ? styles.active : ""}`}
              onClick={onClose}
            >
              <span className="material-symbols-rounded">{menu.icon}</span>

              <span>{menu.label}</span>
            </Link>
          ))}

          <button className={styles.logout}>
            <span className="material-symbols-rounded">logout</span>
            로그아웃
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
