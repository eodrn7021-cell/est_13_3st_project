"use client";

import styles from "./Sidebar.module.scss";

/**
 * 어디서든 사용할 수 있는 공통 사이드바 컴포넌트
 */
export default function Sidebar({
  children,
  variant = "default",
  topContent,
  bottomContent,
  className = "",
  style,
  ...props
}) {
  return (
    <aside
      className={`${styles.sidebar} ${styles[`sidebar_${variant}`] || ""} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children ? (
        children
      ) : (topContent || bottomContent) ? (
        <div className={styles.inner}>
          {topContent && <div className={styles.topSection}>{topContent}</div>}
          {bottomContent && <div className={styles.bottomSection}>{bottomContent}</div>}
        </div>
      ) : null}
    </aside>
  );
}
