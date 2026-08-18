"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import Footer from "@/components/layout/Footer/Footer";

import styles from "./Sidebar.module.scss";

const Sidebar = ({ open, onClose, page = "mypage" }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);

  /* ========================================
     로그인 상태
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
     기존 Sidebar 메뉴 그대로 유지
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
     로그아웃
  ======================================== */

  const handleLogout = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      console.error("로그아웃 실패:", error);

      alert("로그아웃에 실패했습니다.");

      return;
    }

    setUser(null);
    onClose?.();

    router.replace("/");
    router.refresh();
  };

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
            Mobile Header
            768px 이하에서만 표시
        ====================================== */}

        <div className={styles.mobileHeader}>
          <Link href="/" className={styles.mobileLogo} onClick={handleMenuClick}>
            <Image src="/images/icons/logo.png" alt="VisuLore 로고" width={40} height={40} />

            <span>VisuLore</span>
          </Link>

          <button
            type="button"
            className={styles.closeButton}
            aria-label="메뉴 닫기"
            onClick={onClose}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* ======================================
            Mobile Auth
            768px 이하에서만 표시
        ====================================== */}

        <div className={styles.authButtons}>
          {user ? (
            <>
              <Link href="/my-page" className={styles.authSecondary} onClick={handleMenuClick}>
                마이페이지
              </Link>

              <button type="button" className={styles.authPrimary} onClick={handleLogout}>
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
            Navigation + Footer Scroll Area
        ====================================== */}

        <div className={styles.sidebarScroll}>
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

          {/* ======================================
              Mobile Footer
              1200px 이하에서 표시
          ====================================== */}

          <div className={styles.mobileFooter}>
            <Footer variant="mobileMenu" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
