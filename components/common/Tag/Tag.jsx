import styles from "./Tag.module.scss";

const Tag = ({ children, className = "", onClick, tabIndex, interactive = true }) => {
  const tagClassName = [styles.tag, interactive ? styles.tag_interactive : "", className]
    .filter(Boolean)
    .join(" ");

  //정보 표시용 태그
  if (!interactive) {
    return <span className={`kr_caption ${tagClassName}`}>{children}</span>;
  }

  return (
    <button
      type="button"
      className={`kr_caption ${tagClassName}`}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      {children}
    </button>
  );
};

export default Tag;
