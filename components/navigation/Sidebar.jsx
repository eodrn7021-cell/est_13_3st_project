"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "./Sidebar.module.scss";

const Sidebar = ({ open, onClose, page = "mypage" }) => {
  const pathname = usePathname();

  const [user, setUser] = useState(null);

  /* ========================================
     Supabase
  ======================================== */

  useEffect(() => {
    const supabase = createClient();

    let subscription;
    let isCancelled = false;

    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (isCancelled) {
        return;
      }

      setUser(user);

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isCancelled) {
          setUser(session?.user ?? null);
        }
      });

      subscription = data.subscription;
    };

    getCurrentUser();

    return () => {
      isCancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  /* ========================================
     Sidebar Menu
  ======================================== */

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
      label: "북마크",
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

  /* ========================================
     휴지통
  ======================================== */

  if (page === "character" || page === "trash") {
    menus.push({
      icon: "delete",
      label: "휴지통",
      href: "/my-trash",
    });
  }

  /* ========================================
     메뉴 클릭
  ======================================== */

  const handleMenuClick = () => {
    onClose?.();
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <>
      {/* ========================================
          Backdrop
      ======================================== */}

      <div
        className={`${styles.backdrop} ${open ? styles.show : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ========================================
          Sidebar
      ======================================== */}

      <aside
        className={`${styles.sidebar} ${open ? styles.open : ""}`}
        aria-label="마이페이지 메뉴"
      >
        {/* ======================================
            Tablet / Mobile Auth
        ====================================== */}

        <div className={styles.authArea}>
          {user ? (
            <>
              <Link href="/my-page" className={styles.authSecondary} onClick={handleMenuClick}>
                마이페이지
              </Link>

              <button type="button" className={styles.authPrimary} onClick={handleMenuClick}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.authSecondary} onClick={handleMenuClick}>
                로그인
              </Link>

              <Link href="/signup" className={styles.authPrimary} onClick={handleMenuClick}>
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* ======================================
            Navigation
        ====================================== */}

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
              onClick={handleMenuClick}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                {menu.icon}
              </span>

              <span>{menu.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
