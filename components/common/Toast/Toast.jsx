"use client";
import { useEffect, useState } from "react";
import styles from "./Toast.module.scss";

export default function Toast({ message, onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.toastContainer} ${isVisible ? styles.show : styles.hide}`}>
      <div className={styles.toastContent}>
        <span className="material-symbols-outlined icon_20" style={{ color: "var(--color-primary, #fff)" }}>info</span>
        <span className="kr_body">{message}</span>
      </div>
    </div>
  );
}
