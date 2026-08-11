import Link from "next/link";

import styles from "./MobileNavigation.module.scss";

const MobileNavigation = () => {
  const navigationItems = [
    {
      label: "홈",
      icon: "home",
      href: "/",
    },
    {
      label: "추천",
      icon: "favorite",
      href: "/characters",
    },
    {
      label: "만들기",
      icon: "add",
      href: "/characters/create",
      isCreate: true,
    },
    {
      label: "내 캐릭터",
      icon: "badge",
      href: "/my-characters",
    },
    {
      label: "마이페이지",
      icon: "person",
      href: "/my-page",
    },
  ];

  return (
    <nav className={styles.mobile_navigation} aria-label="모바일 주요 메뉴">
      <div className={styles.mobile_navigation_inner}>
        {navigationItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`${styles.mobile_navigation_item} ${
              item.isCreate ? styles.mobile_navigation_create : ""
            }`}
          >
            <span
              className={`material-symbols-rounded ${item.isCreate ? "icon_48" : "icon_24"}`}
              aria-hidden="true"
            >
              {item.icon}
            </span>

            <span className="kr_caption">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
