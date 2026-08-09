import styles from "./Tag.module.scss";

const Tag = ({ children, className = "", onClick }) => {
  const tagClassName = [styles.tag, className].filter(Boolean).join(" ");

  return (
    <button type="button" className={`kr_caption ${tagClassName}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Tag;
