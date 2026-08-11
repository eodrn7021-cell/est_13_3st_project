"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
        {/* Left */}
        <section className={styles.left}>
          <Image
            src="/images/icons/logo.png"
            alt="VisuLore"
            width={190}
            height={58}
            priority
            className={styles.logo}
          />

          <h1 className={styles.title}>
            새로운 세계의 시작,
            <br />
            지금 함께하세요.
          </h1>

          <p className={styles.description}>
            VisuLore와 함께
            <br />
            당신만의 세계를 창조해보세요.
          </p>
        </section>

        {/* Right */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>로그인</h2>

          <p className={styles.cardSub}>계정에 로그인하여 계속 이용하세요.</p>

          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">이메일</label>

              <input id="email" type="email" placeholder="이메일을 입력해주세요" />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">비밀번호</label>

              <div className={styles.passwordField}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                />

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
              </div>
            </div>

            <div className={styles.optionRow}>
              <label htmlFor="remember" className={styles.checkbox}>
                <input id="remember" type="checkbox" />
                <span>로그인 상태 유지</span>
              </label>

              <Link href="#">비밀번호 찾기</Link>
            </div>

            <button className={styles.loginButton} type="submit">
              로그인
            </button>
          </form>

          <div className={styles.divider}>
            <span>또는 다른 방법으로 로그인</span>
          </div>

          <button className={styles.googleButton} type="button">
            <Image
              src="/images/icons/google.png"
              alt=""
              aria-hidden="true"
              width={20}
              height={20}
            />
            Google로 계속하기
          </button>

          <p className={styles.signup}>
            아직 계정이 없으신가요?
            <Link href="/signup">회원가입</Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
