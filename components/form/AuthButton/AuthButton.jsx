"use client";

import styles from "./AuthButton.module.scss";

const AuthButton = ({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
}) => {
  // 로그인/회원가입 전용 버튼 variant
  const buttonClassName = [styles.button, styles[`button_${variant}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={buttonClassName} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default AuthButton;
