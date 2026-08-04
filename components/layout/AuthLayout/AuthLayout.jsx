import Image from "next/image";
import styles from "./AuthLayout.module.scss";

const AuthLayout = ({ children }) => {
  return (
    <main className={styles.layout}>
      {/* 배경 */}
      <div className={styles.background}>
        <Image
          src="/images/backgrounds/fantasy-space.webp"
          alt="VisuLore Background"
          fill
          priority
          sizes="100vw"
          className={styles.backgroundImage}
        />
        <div className={styles.overlay} />
      </div>

      {/* 콘텐츠 */}
      <div className={styles.content}>{children}</div>
    </main>
  );
};

export default AuthLayout;
