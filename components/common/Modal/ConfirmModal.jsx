"use client";
import Button from "@/components/common/Button/Button";
import styles from "./ConfirmModal.module.scss";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "확인",
  cancelText = "취소",
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerArea}>
          <h2 className="kr_t_title">{title}</h2>
          <p className="kr_body">{message}</p>
        </div>
        <div className={styles.buttonGroup}>
          <Button type="button" variant="secondary" onClick={onCancel}>
            <span className="kr_body_b">{cancelText}</span>
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm}>
            <span className="kr_body_b">{confirmText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
