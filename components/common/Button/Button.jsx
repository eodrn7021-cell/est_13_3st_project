"use client";
import Link from "next/link";
import styles from "./Button.module.scss";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
  href,
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

  if (href) {
    return (
      <Link href={href} className={ButtonClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={ButtonClassName} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
