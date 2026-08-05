"use client";

import styles from "./Input.module.scss";

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

export default function Input({
  title,
  icon,
  placeholder = "Default message",
  value,
  onChange,
  type = "text",
  className = "",
  containerStyle,
  disabled = false,
  hasCard,
  ...props
}) {
  const isCard = hasCard !== undefined ? hasCard : Boolean(title);

  const renderIcon = () => {
    if (!icon || icon === "edit_note") return <EditNoteIcon />;
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
    <div
      className={`${styles.container} ${isCard ? styles.hasCard : ""} ${className}`.trim()}
      style={containerStyle}
    >
      {title && (
        <div className={styles.inputTitle}>
          <span className={styles.icon}>{renderIcon()}</span>
          <span className={styles.titleText}>{title}</span>
        </div>
      )}

      <div className={`${styles.inputBox} ${disabled ? styles.disabled : ""}`}>
        <div className={styles.inputWrapper}>
          <input
            type={type}
            className={styles.inputField}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />
        </div>
      </div>
    </div>
  );
}
