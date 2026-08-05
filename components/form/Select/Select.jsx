"use client";

import { useState } from "react";
import styles from "./Select.module.scss";
import Input from "@/components/form/Input/Input";

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

function ChevronIcon({ isExpanded }) {
  return (
    <svg
      className={`${styles.chevron} ${isExpanded ? styles.expanded : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function Select({
  title,
  icon,
  fieldTitle,
  placeholder = "Default message",
  options = [],
  value,
  defaultValue,
  onChange,
  onSelect,
  defaultOpen = false,
  isOpen: propIsOpen,
  onToggle,
  className = "",
  containerStyle,
  disabled = false,
  isInput = false,
  type = "text",
  hasCard,
  ...props
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  if (isInput) {
    return (
      <Input
        title={title}
        icon={icon}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        type={type}
        className={className}
        containerStyle={containerStyle}
        disabled={disabled}
        hasCard={hasCard}
        {...props}
      />
    );
  }

  const currentValue = value !== undefined ? value : internalValue;
  const isCard = hasCard !== undefined ? hasCard : Boolean(title);

  const renderIcon = () => {
    if (!icon || icon === "edit_note") return <EditNoteIcon />;
    if (typeof icon === "string") {
      return (
        <span className={`material-symbols-outlined ${styles.materialIcon}`}>
          {icon}
        </span>
      );
    }
    return icon;
  };

  const handleToggle = () => {
    if (disabled) return;
    if (onToggle) {
      onToggle(!isOpen);
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const handleSelectOption = (option) => {
    if (disabled) return;
    const optionValue = typeof option === "object" && option !== null ? option.value : option;

    if (value === undefined) {
      setInternalValue(optionValue);
    }

    if (onChange) {
      onChange(optionValue, option);
    }

    if (onSelect) {
      onSelect(option);
    }

    if (onToggle) {
      onToggle(false);
    } else {
      setInternalIsOpen(false);
    }
  };

  const getSelectedLabel = () => {
    if (currentValue === "" || currentValue === null || currentValue === undefined) {
      return "";
    }
    const found = options.find((opt) =>
      typeof opt === "object" && opt !== null ? opt.value === currentValue : opt === currentValue
    );
    if (!found) return currentValue;
    return typeof found === "object" ? found.label : found;
  };

  const selectedLabel = getSelectedLabel();
  const isPlaceholder = !fieldTitle && !selectedLabel;
  const displayLabel = fieldTitle || selectedLabel || placeholder;

  return (
    <div
      className={`${styles.container} ${isCard ? styles.hasCard : ""} ${className}`.trim()}
      style={containerStyle}
    >
      {title && (
        <div className={styles.inputTitle}>
          <span className={styles.icon}>{renderIcon()}</span>
          <span className={styles.titleText}>{title}</span>
        </div>
      )}

      <div className={`${styles.selectBox} ${isOpen ? styles.open : ""} ${disabled ? styles.disabled : ""}`}>
        <button
          type="button"
          className={styles.selectHeader}
          onClick={handleToggle}
          disabled={disabled}
          aria-expanded={isOpen}
        >
          <span className={`${styles.selectTitle} ${isPlaceholder ? styles.isPlaceholder : ""}`}>
            {displayLabel}
          </span>
          <span className={`${styles.iconWrapper} ${isOpen ? styles.expanded : ""}`}>
            <ChevronIcon isExpanded={isOpen} />
          </span>
        </button>

        {isOpen && (
          <div className={styles.content}>
            <div className={styles.divider} />
            <div className={styles.optionsWrapper}>
              <div className={styles.optionsBox}>
                {options.length > 0 ? (
                  options.map((option, index) => {
                    const label = typeof option === "object" && option !== null ? option.label : option;
                    const optValue = typeof option === "object" && option !== null ? option.value : option;
                    const isSelected = optValue === currentValue;

                    return (
                      <div
                        key={typeof option === "object" && option !== null && option.value ? option.value : `${optValue}-${index}`}
                        className={`${styles.optionItem} ${isSelected ? styles.selected : ""}`}
                        onClick={() => handleSelectOption(option)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectOption(option);
                          }
                        }}
                      >
                        <span className={styles.optionLabel}>{label}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyMessage}>선택 가능한 옵션이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
