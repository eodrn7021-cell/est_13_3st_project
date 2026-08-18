"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthButton from "@/components/form/AuthButton/AuthButton";
import AuthInput from "@/components/form/AuthInput/AuthInput";
import { createClient } from "@/lib/supabase/client";
import styles from "./login.module.scss";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loginNotice, setLoginNotice] = useState("");

  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("reason") === "protected") {
      setLoginNotice("로그인 후 이용해주세요.");
    }
  }, []);

  // 로그인 후 이동할 주소 확인
  const getRedirectPath = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    // 허용된 내부 경로만 이동
    const allowedRedirects = ["/my-page", "/my-characters", "/characters/create"];

    if (redirect && allowedRedirects.includes(redirect)) {
      return redirect;
    }

    return "/";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoginError("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    // 로그인 성공 → 원래 이용하려던 페이지로 이동
    const redirectPath = getRedirectPath();

    router.replace(redirectPath);
  };

  const handleGoogleLogin = async () => {
    setLoginError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setLoginError("Google 로그인 중 오류가 발생했습니다.");
    }
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

        {/* 로그인 카드 */}
        <section className={styles.card}>
          <div className={styles.card_header}>
            <h2 className={styles.card_title}>로그인</h2>
            <p className={styles.card_sub}>계정에 로그인하여 계속 이용하세요.</p>
          </div>

          {/* 보호 페이지 접근 안내 */}
          {loginNotice && (
            <p className={styles.error_message} role="status">
              {loginNotice}
            </p>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <AuthInput
              label="이메일"
              name="email"
              type="email"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <AuthInput
              label="비밀번호"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

            <div className={styles.option_row}>
              <label htmlFor="remember" className={styles.checkbox}>
                <input id="remember" type="checkbox" />
                <span>로그인 상태 유지</span>
              </label>

              <Link href="#" className={styles.find_password}>
                비밀번호 찾기
              </Link>
            </div>

            {loginError && (
              <p className={styles.error_message} role="alert">
                {loginError}
              </p>
            )}

            <AuthButton type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </AuthButton>
          </form>

          <div className={styles.divider}>
            <span>또는 다른 방법으로 로그인</span>
          </div>

          <AuthButton type="button" variant="google" onClick={handleGoogleLogin}>
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
