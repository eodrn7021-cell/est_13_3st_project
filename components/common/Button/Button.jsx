"use client";

import styles from "./Button.module.scss";

const Button = ({ children, type = "button", variant = "primary", ...props }) => {
  return (
    <button type={type} className={`${styles.button} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
