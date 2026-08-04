"use client";

import styles from "./Textarea.module.scss";

function EditNoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="36"
      height="36"
      aria-hidden="true"
    >
      <path d="M3 10h11v2H3zm0-4h11v2H3zm0 8h7v2H3zm15.01-3.13l1.41-1.41c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-1.41 1.41-2.12-2.12zm-.71.71l-5.3 5.3V18h2.12l5.3-5.3-2.12-2.12z" />
    </svg>
  );
}

export default function Textarea({
  title = "Name",
  icon,
  rightAction,
  placeholder = "Default message",
  value,
  onChange,
  className = "",
  containerStyle,
  inputStyle,
  ...props
}) {
  const renderIcon = () => {
    if (!icon || icon === "edit_note") {
      return <EditNoteIcon />;
    }
    if (typeof icon === "string") {
      return (
        <span className={`material-symbols-outlined ${styles.materialIcon}`}>
          {icon}
        </span>
      );
    }
    return icon;
  };

  return (
    <div className={`${styles.container} ${className}`.trim()} style={containerStyle}>
      <div className={styles.inputTitle}>
        <div className={styles.titleLeft}>
          <span className={styles.icon}>
            {renderIcon()}
          </span>
          <span className={styles.titleText}>{title}</span>
        </div>
        {rightAction && <div className={styles.titleRight}>{rightAction}</div>}
      </div>

      <div className={styles.input} style={inputStyle}>
        <textarea
          className={styles.textarea}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
      </div>
    </div>
  );
}
