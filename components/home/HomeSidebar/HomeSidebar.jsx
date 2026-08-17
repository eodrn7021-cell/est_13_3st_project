'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import Tag from '@/components/common/Tag/Tag';
import TagModal from '@/components/home/TagModal/TagModal';
import styles from './HomeSidebar.module.scss';

const tags = ['판타지', '기사', '마법사', '엘프', '악역', '성장', '악마'];

const HomeSidebar = () => {
  // 태그 모달 열림 상태
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // URL 쿼리 파라미터 확인 (현재 선택된 태그 감지)
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag');

  return (
    <>
      <Sidebar>
        <div className={styles.home_sidebar}>
          {/* 상단 메뉴 */}
          <nav className={styles.sidebar_nav} aria-label="메인 메뉴">
            <Link href="/" className={`${styles.sidebar_link} ${styles.sidebar_link_active}`}>
              <span
                className={`material-symbols-rounded icon_24 ${styles.sidebar_icon}`}
                aria-hidden="true"
              >
                home
              </span>
              <span className="kr_body">홈</span>
            </Link>

            <Link href="/characters" className={styles.sidebar_link}>
              <span
                className={`material-symbols-rounded icon_24 ${styles.sidebar_icon}`}
                aria-hidden="true"
              >
                favorite
              </span>
              <span className="kr_body">추천</span>
            </Link>

            <Link href="/characters/create" className={styles.sidebar_link}>
              <span
                className={`material-symbols-rounded icon_24 ${styles.sidebar_icon}`}
                aria-hidden="true"
              >
                add_circle
              </span>
              <span className="kr_body">만들기</span>
            </Link>

            <Link href="/my-page" className={styles.sidebar_link}>
              <span
                className={`material-symbols-rounded icon_24 ${styles.sidebar_icon}`}
                aria-hidden="true"
              >
                person
              </span>
              <span className="kr_body">마이페이지</span>
            </Link>
          </nav>

          {/* 구분선 */}
          <div className={styles.sidebar_divider} />

          {/* 태그 탐색 */}
          <section className={styles.tag_section}>
            <h2 className={`kr_body ${styles.tag_title}`}>태그 탐색</h2>

            <div className={styles.tag_list}>
              {tags.map((tag) => {
                const isActive = currentTag === tag;
                return (
                  <Link
                    key={tag}
                    href={isActive ? '/characters' : `/characters?tag=${encodeURIComponent(tag)}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Tag active={isActive}>{tag}</Tag>
                  </Link>
                );
              })}
            </div>

            {/* 더 많은 태그 모달 열기 */}
            <button
              type="button"
              className={styles.more_tags}
              onClick={() => setIsTagModalOpen(true)}
            >
              <span className="kr_body">더 많은 태그 보기</span>

              <span className="material-symbols-rounded icon_24" aria-hidden="true">
                chevron_right
              </span>
            </button>
          </section>
        </div>
      </Sidebar>

      {/* 태그 모달 */}
      <TagModal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} />
    </>
  );
};

export default HomeSidebar;
