"use client";

import styles from "./Button.module.scss";

const Button = ({ children, type = "button", onClick, disabled = false }) => {
  return (
    <button type={type} className={styles.button} onClick={onClick} disabled={disabled}>
const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
}) => {
  const ButtonClassName = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    fullWidth ? styles.button_full_width : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={ButtonClassName} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
