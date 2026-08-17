"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { createClient } from "@/lib/supabase/client";
import styles from "./CreateMobileMenu.module.scss";

function HelpOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
      <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
    </svg>
  );
}

const CreateMobileMenu = ({ headerVariant = "account", isWorldCheckDone, isCharCheckDone }) => {
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

  return (
    <>
      <Header
        variant={headerVariant}
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

            {/* 로그인 상태에 따른 버튼 (마이페이지/로그아웃) */}
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

            {/* 체크리스트 및 도움말 영역 */}
            <div className={styles.custom_section}>
              <div className={`kr_body_b ${styles.custom_title}`}>체크 리스트</div>
              <div className={styles.checklist_items}>
                <label className={styles.check_item} style={{ cursor: "default" }}>
                  <input
                    type="checkbox"
                    checked={isWorldCheckDone}
                    readOnly
                    onClick={(e) => e.preventDefault()}
                  />
                  <span className="kr_body_b">세계관 필수 입력 사항 작성</span>
                </label>
                <label className={styles.check_item} style={{ cursor: "default" }}>
                  <input
                    type="checkbox"
                    checked={isCharCheckDone}
                    readOnly
                    onClick={(e) => e.preventDefault()}
                  />
                  <span className="kr_body_b">캐릭터 필수 입력 사항 작성</span>
                </label>
              </div>

              <button type="button" className={styles.help_button}>
                <HelpOutlineIcon />
                <span className="kr_body_b">도움말</span>
              </button>
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

export default CreateMobileMenu;
