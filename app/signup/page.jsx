import Image from "next/image";
import Link from "next/link";
import styles from "./signup.module.scss";

const SignupPage = () => {
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
          <h2 className={styles.cardTitle}>회원가입</h2>

          <p className={styles.cardSub}>새로운 계정을 만들어 VisuLore를 시작해보세요.</p>

          <form className={styles.form}>
            {/* 이메일 */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">이메일</label>

              <input id="email" type="email" placeholder="이메일을 입력해주세요" />
            </div>

            {/* 닉네임 */}
            <div className={styles.inputGroup}>
              <label htmlFor="nickname">닉네임</label>

              <input id="nickname" type="text" placeholder="닉네임을 입력해주세요" />
            </div>

            {/* 비밀번호 */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">비밀번호</label>

              <div className={styles.passwordField}>
                <input id="password" type="password" placeholder="비밀번호를 입력해주세요" />

                <button type="button" className={styles.eyeButton} aria-label="비밀번호 보기">
                  <span className="material-symbols-rounded">visibility</span>
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">비밀번호 확인</label>

              <div className={styles.passwordField}>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력해주세요"
                />

                <button type="button" className={styles.eyeButton} aria-label="비밀번호 보기">
                  <span className="material-symbols-rounded">visibility</span>
                </button>
              </div>
            </div>

            {/* 이용약관 */}
            <label htmlFor="agreement" className={styles.checkbox}>
              <input id="agreement" type="checkbox" />

              <span>개인정보 처리방침 및 이용약관에 동의합니다.</span>
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
            Google로 가입하기
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
