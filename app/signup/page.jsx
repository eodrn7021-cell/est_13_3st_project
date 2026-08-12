"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import AuthButton from "@/components/form/AuthButton/AuthButton";
import AuthInput from "@/components/form/AuthInput/AuthInput";

// Supabase 브라우저 클라이언트
import { createClient } from "@/lib/supabase/client";

import styles from "./signup.module.scss";

const SignupPage = () => {
  // 비밀번호 보기
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 회원가입 입력값
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 에러 메시지
  const [passwordError, setPasswordError] = useState("");
  const [signupError, setSignupError] = useState("");

  // 회원가입 성공 메시지
  const [signupMessage, setSignupMessage] = useState("");

  // 중복 클릭 방지
  const [isLoading, setIsLoading] = useState(false);

  // Supabase client
  const supabase = createClient();

  // 실제 Supabase 회원가입
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSignupError("");
    setSignupMessage("");

    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setPasswordError("");
    setIsLoading(true);

    // Supabase Auth 회원가입
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
        },
        emailRedirectTo: `${window.location.origin}/signup/complete`,
      },
    });

    if (error) {
      if (error.message === "Password should be at least 6 characters.") {
        setSignupError("비밀번호는 6자 이상 입력해주세요.");
      } else {
        setSignupError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
      }

      setIsLoading(false);
      return;
    }

    // Confirm email이 켜져 있으므로 바로 로그인하지 않음
    setSignupMessage("회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.");

    setIsLoading(false);
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
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              minLength={6}
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
                minLength={6}
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

              <p
                className={`${styles.password_error} ${passwordError ? styles.show : ""}`}
                role="alert"
              >
                {passwordError}
              </p>
            </div>

            {/* 이용약관 */}
            <label htmlFor="agreement" className={styles.checkbox}>
              <input id="agreement" type="checkbox" required />

              <span>이용약관 및 개인정보처리방침에 동의합니다.</span>
            </label>

            {/* Supabase 회원가입 실패 메시지 */}
            {signupError && (
              <p className={styles.error_message} role="alert">
                {signupError}
              </p>
            )}

            {/* 회원가입 성공 메시지 */}
            {signupMessage && <p className={styles.success_message}>{signupMessage}</p>}

            <AuthButton type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "가입 중..." : "계정 만들기"}
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
