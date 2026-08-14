"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { createClient } from "@/lib/supabase/client";
import styles from "./HomeMobileMenu.module.scss";

const HomeMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const supabase = createClient();

  // 로그인 상태 확인
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 메뉴가 열렸을 때 뒤쪽 스크롤 + 스크롤바 숨기기
  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);
  // ESC로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // 애니메이션 후 메뉴 닫기
  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250);
  };

  // 로그아웃
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      console.error("로그아웃 실패:", error);
      return;
    }

    setUser(null);
    setIsOpen(false);

    window.location.href = "/";
  };

  const navigationItems = [
    {
      label: "홈",
      icon: "home",
      href: "/",
    },
    {
      label: "추천",
      icon: "favorite",
      href: "/characters",
    },
    {
      label: "만들기",
      icon: "add_circle",
      href: "/characters/create",
    },
    {
      label: "마이페이지",
      icon: "person",
      href: "/my-page",
    },
  ];

  return (
    <>
      {/* 기존 Header는 여기에서 그대로 사용 */}
      <Header
        onMenuClick={() => {
          setIsClosing(false);
          setIsOpen(true);
        }}
      />
      {isOpen && (
        <div className={`${styles.menu} ${isClosing ? styles.menu_closing : ""}`}>
          {/* 어두운 배경 */}
          <button
            type="button"
            className={styles.overlay}
            aria-label="메뉴 닫기"
            onClick={handleClose}
          />

          {/* 왼쪽 메뉴 */}
          <aside
            className={`${styles.drawer} ${isClosing ? styles.drawer_closing : ""}`}
            aria-label="모바일 메뉴"
          >
            {" "}
            {/* 상단 로고 */}
            <div className={styles.drawer_header}>
              <Link href="/" className={styles.logo} onClick={handleClose}>
                <Image src="/images/icons/logo.png" alt="VisuLore 로고" width={48} height={48} />

                <span className={styles.logo_text}>VisuLore</span>
              </Link>

              <button
                type="button"
                className={styles.close_button}
                aria-label="메뉴 닫기"
                onClick={handleClose}
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  close
                </span>
              </button>
            </div>
            {/* 로그인 상태에 따른 버튼 */}
            <div className={styles.auth_buttons}>
              {user ? (
                <>
                  <Link href="/my-page" className={styles.auth_secondary} onClick={handleClose}>
                    마이페이지
                  </Link>

                  <button type="button" className={styles.auth_primary} onClick={handleLogout}>
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={styles.auth_secondary} onClick={handleClose}>
                    로그인
                  </Link>

                  <Link href="/signup" className={styles.auth_primary} onClick={handleClose}>
                    회원가입
                  </Link>
                </>
              )}
            </div>
            {/* B 방식: 간단한 메뉴만 */}
            <nav className={styles.navigation} aria-label="모바일 주요 메뉴">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={styles.navigation_item}
                  onClick={handleClose}
                >
                  <span
                    className={`material-symbols-rounded ${styles.navigation_icon}`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span className="kr_body">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className={styles.mobile_footer}>
              <Footer variant="mobileMenu" />
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default HomeMobileMenu;
