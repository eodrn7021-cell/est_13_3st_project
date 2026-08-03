import Link from "next/link";
import Image from "next/image";

import Button from "@/components/common/Button/Button";
import styles from "./Header.module.scss";

const Header = ({ variant = "main", accountContent = null }) => {
  return (
    <header className={styles.header}>
      <div className={styles.header_inner}>
        {/* 공통 로고 */}
        <Link href="/" className={styles.header_logo}>
          <Image src="/images/icons/logo.png" alt="VisuLore 로고" width={48} height={48} priority />

          <span className="en_t_title">VisuLore</span>
        </Link>

        {/* 메인·캐릭터 목록 페이지 */}
        {variant === "main" && (
          <div className={styles.header_actions}>
            {/* SearchBar 컴포넌트 완성 후 이 위치에 추가 */}

            <div className={styles.header_buttons}>
              <Button variant="secondary" size="medium">
                로그인
              </Button>

              <Button variant="primary" size="large">
                회원가입
              </Button>
            </div>
          </div>
        )}

        {/* 캐릭터 만들기·캐릭터 상세 페이지 */}
        {variant === "account" && (
          <div className={styles.header_account}>
            {accountContent || (
              <Link href="/mypage" className={styles.header_mypage}>
                마이페이지
              </Link>
            )}
          </div>
        )}

        {/* simple은 조건을 넣지 않아서 로고만 표시 */}
      </div>
    </header>
  );
};

export default Header;
