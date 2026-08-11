"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import AuthInput from "../../components/form/AuthInput/AuthInput";

import styles from "./login.module.scss";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main
      className={styles.page}
      style={{
        backgroundImage: "url('/images/backgrounds/fantasy-space.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className={styles.overlay} />

      <div className={styles.container}>
        {/* =========================
            왼쪽 영역
        ========================= */}
        <section className={styles.left}>
          {/* 로고 */}
          <Link href="/" className={styles.brand}>
            <Image
              src="/images/icons/logo.png"
              alt="VisuLore 로고"
              width={48}
              height={48}
              priority
              className={styles.logo}
            />

            <span className={styles.brandText}>VisuLore</span>
          </Link>

          {/* 소개 문구 */}
          <div className={styles.intro}>
            <h1 className={styles.title}>
              새로운 세계의 시작,
              <br />
              지금 함께하세요.
            </h1>

            <p className={styles.description}>VisuLore와 함께 당신만의 세계를 창조해보세요.</p>
          </div>
        </section>

        {/* =========================
            로그인 카드
        ========================= */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>로그인</h2>

            <p className={styles.cardSub}>계정에 로그인하여 계속 이용하세요.</p>
          </div>

          <form className={styles.form}>
            {/* 이메일 */}
            <AuthInput
              label="이메일"
              name="email"
              type="email"
              placeholder="이메일을 입력해주세요"
            />

            {/* 비밀번호 */}
            <AuthInput
              label="비밀번호"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력해주세요"
            >
              <button
                type="button"
                className={styles.eyeButton}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <span className="material-symbols-rounded">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </AuthInput>

            {/* 로그인 옵션 */}
            <div className={styles.optionRow}>
              <label htmlFor="remember" className={styles.checkbox}>
                <input id="remember" type="checkbox" />

                <span>로그인 상태 유지</span>
              </label>

              <Link href="#" className={styles.findPassword}>
                비밀번호 찾기
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <button className={styles.loginButton} type="submit">
              로그인
            </button>
          </form>

          {/* 구분선 */}
          <div className={styles.divider}>
            <span>또는 다른 방법으로 로그인</span>
          </div>

          {/* Google 로그인 */}
          <button className={styles.googleButton} type="button">
            <Image
              src="/images/icons/google.png"
              alt=""
              aria-hidden="true"
              width={20}
              height={20}
            />

            <span>Google로 계속하기</span>
          </button>

          {/* 회원가입 */}
          <p className={styles.signup}>
            <span>계정이 없으신가요?</span>

            <Link href="/signup">회원가입</Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
