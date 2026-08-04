"use client";

import styles from "./Sidebar.module.scss";


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
