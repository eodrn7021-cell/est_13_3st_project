"use client";

import { useRouter } from "next/navigation";
import styles from "./complete.module.scss";

const SignupCompletePage = () => {
  const router = useRouter();

  const handleConfirm = () => {
    router.replace("/login");
  };

  return (
    <main className={styles.page}>
      <div className={styles.overlay} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <span className={`material-symbols-rounded ${styles.icon}`} aria-hidden="true">
          check_circle
        </span>

        <h1 className={styles.title}>회원가입이 완료되었습니다.</h1>

        <p className={styles.description}>
          이메일 인증이 완료되었습니다.
          <br />
          로그인하여 VisuLore를 시작해보세요.
        </p>

        <button type="button" className={styles.button} onClick={handleConfirm}>
          확인
        </button>
      </div>
    </main>
  );
};

export default SignupCompletePage;
