import Link from "next/link";
import Image from "next/image";
import Button from "@/components/common/Button/Button";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import styles from "./Header.module.scss";

const Header = ({ variant = "main", accountContent = null }) => {
  return (
    <header className={styles.header}>
      <div className={styles.header_inner}>
        {/* {태블릿·모바일 햄버거 버튼} */}
        {variant === "main" && (
          <button className={styles.header_menu_button} type="button" aria-label="메뉴 열기">
            <span
              className={`material-symbols-rounded icon_36 ${styles.header_menu_icon}`}
              aria-hidden="true"
            >
              menu
            </span>
          </button>
        )}
        {/* 공통 로고 */}
        <Link href="/" className={styles.header_logo}>
          <Image src="/images/icons/logo.png" alt="VisuLore 로고" width={48} height={48} priority />

          <span className="en_t_title">VisuLore</span>
        </Link>

        {/* 메인·캐릭터 목록 페이지 */}
        {variant === "main" && (
          <div className={styles.header_actions}>
            <div className={styles.header_pc_search}>
              <SearchBar />
            </div>

            <div className={styles.header_buttons}>
              <Button variant="secondary" size="medium">
                <span className="kr_body">로그인</span>
              </Button>

              <Button variant="primary" size="large">
                <span className="kr_body">회원가입</span>
              </Button>
            </div>
          </div>
        )}

        {/* 캐릭터 만들기·캐릭터 상세 페이지 */}
        {variant === "account" && (
          <div className={styles.header_account}>
            {accountContent || (
              <Link href="/mypage" className={styles.header_mypage}>
                <span className="kr_body">마이페이지</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 태블릿·모바일에서 아래로 내려오는 검색창 */}
      {variant === "main" && (
        <div className={styles.header_responsive_search}>
          <SearchBar />
        </div>
      )}
    </header>
  );
};

export default Header;
