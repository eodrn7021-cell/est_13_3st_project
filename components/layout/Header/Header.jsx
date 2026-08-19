"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/common/Button/Button";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import styles from "./Header.module.scss";
import { useAuth } from "@/context/AuthContext";

const Header = ({
  variant = "main",
  accountContent = null,
  onMenuClick,
  showSearch = false,
  hideResponsiveSearch = false,
}) => {
  // 로그인 사용자
  const { user, loading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className={styles.header}>
      <div className={`${styles.header_inner} ${showSearch ? styles.header_inner_search : ""}`}>
        {/* 태블릿·모바일 햄버거 버튼 */}
        <button
          className={styles.header_menu_button}
          type="button"
          aria-label="메뉴 열기"
          onClick={onMenuClick}
        >
          <span
            className={`material-symbols-rounded icon_36 ${styles.header_menu_icon}`}
            aria-hidden="true"
          >
            menu
          </span>
        </button>
        {/* 공통 로고 */}
        <Link href="/" className={styles.header_logo}>
          <Image src="/images/icons/logo.png" alt="VisuLore 로고" width={48} height={48} priority />

          <span className={`en_t_title ${styles.header_logo_text}`}>VisuLore</span>
        </Link>
        {variant === "main" && showSearch && (
          <div className={styles.header_pc_search}>
            <SearchBar />
          </div>
        )}
        {/* 메인·캐릭터 목록 페이지 */}
        {variant === "main" && (
          <div className={styles.header_actions}>
            <div className={styles.header_buttons}>
              {/* 로그인 상태에 따라 Header 버튼 변경 */}
              {!loading &&
                (user ? (
                  <>
                    <Button href="/my-page" variant="secondary" size="medium">
                      <span className="kr_body">마이페이지</span>
                    </Button>

                    <button type="button" className={styles.header_logout} onClick={handleLogout}>
                      <span className="kr_body">로그아웃</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Button href="/login" variant="secondary" size="medium">
                      <span className="kr_body">로그인</span>
                    </Button>

                    <Button href="/signup" variant="primary" size="large">
                      <span className="kr_body">회원가입</span>
                    </Button>
                  </>
                ))}
            </div>
          </div>
        )}
        {/* 캐릭터 만들기·캐릭터 상세 페이지 */}
        {variant === "account" && (
          <div className={styles.header_account}>
            {accountContent || (
              <Link href="/my-page" className={styles.header_mypage}>
                <span className="kr_body">마이페이지</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 태블릿·모바일에서 아래로 내려오는 검색창 */}
      {variant === "main" && showSearch && !hideResponsiveSearch && (
        <div className={styles.header_responsive_search}>
          <SearchBar />
        </div>
      )}
    </header>
  );
};

export default Header;
