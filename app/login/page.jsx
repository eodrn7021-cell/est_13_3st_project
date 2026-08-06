"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

import AuthLayout from "@/components/layout/AuthLayout/AuthLayout";
import Input from "@/components/form/Input/Input";
import Button from "@/components/common/Button/Button";

import styles from "./login.module.scss";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout>
      <div className={styles.container}>
        {/* ================= LEFT ================= */}
        <section className={styles.left}>
          <Image
            src="/images/icons/logo.png"
            alt="VisuLore"
            width={230}
            height={72}
            priority
            className={styles.logo}
          />

          <h1 className={styles.title}>
            새로운 세계의 시작,
            <br />
            지금 함께하세요.
          </h1>

          <p className={styles.description}>
            AI가 당신만의 세계관과 캐릭터를
            <br />
            더욱 쉽고 풍부하게 만들어드립니다.
          </p>
        </section>

        {/* ================= RIGHT ================= */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>로그인</h2>

          <form className={styles.form}>
            <Input label="이메일" type="email" placeholder="이메일을 입력해주세요." />

            <div className={styles.passwordWrapper}>
              <Input
                label="비밀번호"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력해주세요."
              />

              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className={styles.optionRow}>
              <label className={styles.checkbox}>
                <input type="checkbox" />
                로그인 상태 유지
              </label>

              <button type="button" className={styles.findPassword}>
                비밀번호 찾기
              </button>
            </div>

            <Button type="submit">로그인</Button>

            <div className={styles.divider}>
              <span>또는</span>
            </div>

            <button type="button" className={styles.googleButton}>
              <Image src="/images/icons/google.png" alt="Google" width={20} height={20} />
              Google로 로그인
            </button>

            <p className={styles.signup}>
              아직 계정이 없으신가요?
              <span> 회원가입</span>
            </p>
          </form>
        </section>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
