"use client";

import styles from "./Button.module.scss";

const Button = ({ children, variant = "primary", type = "button", className = "", ...props }) => {
  return (
    <button type={type} className={`${styles.button} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
