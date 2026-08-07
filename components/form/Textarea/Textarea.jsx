"use client";

import { useState } from "react";
import styles from "./Textarea.module.scss";

function EditNoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="36"
      height="36"
      aria-hidden="true"
    >
      <path d="M3 10h11v2H3zm0-4h11v2H3zm0 8h7v2H3zm15.01-3.13l1.41-1.41c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-1.41 1.41-2.12-2.12zm-.71.71l-5.3 5.3V18h2.12l5.3-5.3-2.12-2.12z" />
    </svg>
  );
}

export default function Textarea({
  title = "Name",
  icon,
  placeholder = "Default message",
  value,
  onChange,
  className = "",
  containerStyle,
  inputStyle,
  collapsible = false,
  isOpen: propIsOpen,
  defaultOpen = true,
  onToggle,
  showActionButton = true,
  actionButtonIcon = "auto_awesome",
  onActionButtonClick,
  ...props
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  const handleTitleClick = () => {
    if (!collapsible) return;
    if (onToggle) {
      onToggle(!isOpen);
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const renderIcon = () => {
    if (!icon || icon === "edit_note") {
      return <EditNoteIcon />;
    }
    if (typeof icon === "string") {
      return (
        <span className={`material-symbols-outlined icon_36 ${styles.materialIcon}`}>
          {icon}
        </span>
      );
    }
    return icon;
  };

  return (
    <div
      className={`${styles.container} ${collapsible ? styles.collapsible : ""} ${isOpen ? styles.open : styles.closed} ${className}`.trim()}
      style={containerStyle}
    >
      <div className={styles.header}>
        <div
          className={`${styles.inputTitle} ${collapsible ? styles.clickable : ""}`}
          onClick={handleTitleClick}
          role={collapsible ? "button" : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onKeyDown={(e) => {
            if (collapsible && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              handleTitleClick();
            }
          }}
        >
          <span className={styles.icon}>
            {renderIcon()}
          </span>
          <span className={`kr_body_b ${styles.titleText}`}>{title}</span>
        </div>

        {showActionButton && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              if (onActionButtonClick) {
                onActionButtonClick(e);
              }
            }}
            aria-label="자동 작성"
          >
            <span className="material-symbols-outlined icon_14">
              {actionButtonIcon}
            </span>
          </button>
        )}
      </div>

      {(!collapsible || isOpen) && (
        <div className={styles.input} style={inputStyle}>
          <textarea
            className={`kr_caption ${styles.textarea}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            {...props}
          />
        </div>
      )}
    </div>
  );
}
