"use client";

import styles from "./Button.module.scss";

const Button = ({ children, type = "button", onClick, disabled = false }) => {
  return (
    <button type={type} className={styles.button} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
