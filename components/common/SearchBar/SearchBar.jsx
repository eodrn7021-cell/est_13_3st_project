"use client";
import styles from "./SearchBar.module.scss";

const SearchBar = () => {
  const HandleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form className={styles.search_bar} role="search" onSubmit={HandleSubmit}>
      <input
        className={`kr_caption ${styles.search_input}`}
        type="search"
        name="keyword"
        placeholder="캐릭터, 태그 검색"
        aria-label="캐릭터와 태그 검색"
      />

      <button className={styles.search_button} type="submit" aria-label="검색">
        <span
          className={`material-symbols-rounded icon_24 ${styles.search_icon}`}
          aria-hidden="true"
        >
          search
        </span>
      </button>
    </form>
  );
};

export default SearchBar;
