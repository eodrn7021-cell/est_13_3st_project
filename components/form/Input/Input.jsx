"use client";

import styles from "./Input.module.scss";

const Input = ({ label, type = "text", placeholder, name, value, onChange, icon, children }) => {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.inputBox}>
        <input
          className={styles.input}
          type={type}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
        />

        {icon && <span className={styles.icon}>{icon}</span>}

        {children}
      </div>
    </div>
  );
};

export default Input;
