"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AuthInput from "../../components/form/AuthInput/AuthInput";
import styles from "./signup.module.scss";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

          <div className={styles.intro}>
            <h1 className={styles.title}>
              새로운 세계의 시작,
              <br />
              지금 함께하세요.
            </h1>

            <p className={styles.description}>VisuLore와 함께 당신만의 세계를 창조해보세요.</p>
          </div>
        </section>

        {/* Right */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>회원가입</h2>

          <p className={styles.cardSub}>새로운 계정을 만들어 VisuLore를 시작해보세요.</p>

          <form className={styles.form}>
            {/* 닉네임 */}
            <AuthInput
              label="닉네임"
              name="nickname"
              type="text"
              placeholder="닉네임을 입력해주세요"
              icon={<span className="material-symbols-rounded">person</span>}
            />

            {/* 이메일 */}
            <AuthInput
              label="이메일"
              name="email"
              type="email"
              placeholder="이메일을 입력해주세요"
              icon={<span className="material-symbols-rounded">email</span>}
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

            {/* 비밀번호 확인 */}
            <AuthInput
              label="비밀번호 확인"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="비밀번호를 다시 입력해주세요"
            >
              <button
                type="button"
                className={styles.eyeButton}
                aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                <span className="material-symbols-rounded">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </AuthInput>

            {/* 이용약관 */}
            <label htmlFor="agreement" className={styles.checkbox}>
              <input id="agreement" type="checkbox" />

              <span>이용약관 및 개인정보처리방침에 동의합니다.</span>
            </label>

            {/* 회원가입 버튼 */}
            <button className={styles.signupButton} type="submit">
              회원가입
            </button>
          </form>

          <div className={styles.divider}>
            <span>또는 다른 방법으로 가입</span>
          </div>

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

          <p className={styles.login}>
            이미 계정이 있으신가요?
            <Link href="/login">로그인</Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default SignupPage;
