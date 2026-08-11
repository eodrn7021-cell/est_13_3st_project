"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AuthButton from "@/components/form/AuthButton/AuthButton";
import AuthInput from "@/components/form/AuthInput/AuthInput";
import styles from "./signup.module.scss";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 비밀번호 값
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 비밀번호 불일치 에러
  const [passwordError, setPasswordError] = useState("");

  // 회원가입 유효성 검사
  const handleSubmit = (e) => {
    e.preventDefault();

    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setPasswordError("");
  };

  return (
    <main className={styles.page}>
      <div className={styles.overlay} />

      <div className={styles.container}>
        {/* 왼쪽 소개 영역 */}
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
            <span className={styles.brand_text}>VisuLore</span>
          </Link>

          <div className={styles.intro}>
            <h1 className={styles.title}>
              새로운 세계의 시작,
              <br className={styles.title_break} />
              지금 함께하세요.
            </h1>

            <p className={styles.description}>
              <span className={styles.description_en}>VisuLore</span>
              <span>와 함께 당신만의 세계를 창조해보세요.</span>
            </p>
          </div>
        </section>

        {/* 회원가입 카드 */}
        <section className={styles.card}>
          <div className={styles.card_header}>
            <h2 className={styles.card_title}>회원가입</h2>
            <p className={styles.card_sub}>간단한 정보만으로 시작할 수 있어요.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* 닉네임 */}
            <AuthInput
              label="닉네임"
              name="nickname"
              type="text"
              placeholder="닉네임을 입력해주세요"
              required
              icon={
                <span className="material-symbols-rounded" aria-hidden="true">
                  person
                </span>
              }
            />

            {/* 이메일 */}
            <AuthInput
              label="이메일"
              name="email"
              type="email"
              placeholder="이메일을 입력해주세요"
              required
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              title="올바른 이메일 형식으로 입력해주세요. 예: example@naver.com"
              icon={
                <span className="material-symbols-rounded" aria-hidden="true">
                  email
                </span>
              }
            />

            {/* 비밀번호 */}
            <AuthInput
              label="비밀번호"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);

                if (e.target.value === confirmPassword) {
                  setPasswordError("");
                }
              }}
              required
            >
              <button
                type="button"
                className={styles.eye_button}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </AuthInput>

            {/* 비밀번호 확인 */}
            <div className={styles.confirm_password}>
              <AuthInput
                label="비밀번호 확인"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력해주세요"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);

                  if (password === e.target.value) {
                    setPasswordError("");
                  }
                }}
                required
              >
                <button
                  type="button"
                  className={styles.eye_button}
                  aria-label={showConfirmPassword ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </AuthInput>

              {passwordError && (
                <p className={styles.error_message} role="alert">
                  {passwordError}
                </p>
              )}
            </div>

            {/* 이용약관 */}
            <label htmlFor="agreement" className={styles.checkbox}>
              <input id="agreement" type="checkbox" required />
              <span>이용약관 및 개인정보처리방침에 동의합니다.</span>
            </label>

            <AuthButton type="submit" variant="primary">
              계정 만들기
            </AuthButton>
          </form>
          <div className={styles.divider}>
            <span>또는 다른 방법으로 가입</span>
          </div>

          <AuthButton type="button" variant="google">
            <Image
              src="/images/icons/google.png"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              className={styles.google_icon}
            />
            <span>Google로 계속하기</span>
          </AuthButton>

          <p className={styles.login}>
            <span>이미 계정이 있으신가요?</span>
            <Link href="/login">로그인</Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default SignupPage;
