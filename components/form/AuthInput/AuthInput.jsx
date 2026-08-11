"use client";

import styles from "./AuthInput.module.scss";

const AuthInput = ({
  label,
  type = "text",
  placeholder,
  name,
  value,
  onChange,
  icon,
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label}
        </label>
      )}

      <div className={styles.inputBox}>
        <input
          id={name}
          className={styles.input}
          type={type}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          {...props}
        />

        {icon && <span className={styles.icon}>{icon}</span>}

        {children}
      </div>
    </div>
  );
};

export default AuthInput;
