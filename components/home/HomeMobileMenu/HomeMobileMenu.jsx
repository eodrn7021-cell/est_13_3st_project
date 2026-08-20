"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/common/Button/Button";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import styles from "./HomeMobileMenu.module.scss";

const HomeMobileMenu = ({
  headerVariant = "main",
  hideResponsiveSearch = false,
  showSearch = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    if (!isOpen) return;

    let subscription;
    let isCancelled = false;

    const checkUser = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (isCancelled) return;

      setUser(user);

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isCancelled) {
          setUser(session?.user ?? null);
        }
      });

      subscription = data.subscription;
    };

    checkUser();

    return () => {
      isCancelled = true;
      subscription?.unsubscribe();
    };
  }, [isOpen]);

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
  function handleClose() {
    setIsClosing(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250);
  }

  // 로그아웃
  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      return;
    }

    setUser(null);
    setIsOpen(false);

    window.location.href = "/";
  };

  return (
    <>
      {/* 기존 Header는 여기에서 그대로 사용 */}
      <Header
        variant={headerVariant}
        hideResponsiveSearch={hideResponsiveSearch}
        showSearch={showSearch} // 여기 추가
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
                  <Button
                    href="/my-page"
                    variant="secondary"
                    size="small"
                    className={styles.auth_button}
                  >
                    마이페이지
                  </Button>

                  <Button
                    variant="primary"
                    size="small"
                    className={`${styles.auth_button} ${styles.auth_primary_button}`}
                    onClick={handleLogout}
                  >
                    <span>로그아웃</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    href="/login"
                    variant="secondary"
                    size="small"
                    className={styles.auth_button}
                  >
                    로그인
                  </Button>

                  <Button
                    href="/signup"
                    variant="primary"
                    size="small"
                    className={`${styles.auth_button} ${styles.auth_primary_button}`}
                  >
                    <span>회원가입</span>
                  </Button>
                </>
              )}
            </div>
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
