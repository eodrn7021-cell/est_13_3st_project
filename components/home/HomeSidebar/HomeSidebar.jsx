'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import Tag from '@/components/common/Tag/Tag';
import TagModal from '@/components/home/TagModal/TagModal';
import styles from './HomeSidebar.module.scss';

// DB에 실제 존재하는 장르/테마/종족 데이터 기반 태그 (2줄 레이아웃에 딱 맞는 6개)
const tags = [
  { name: '판타지', param: 'genre' },
  { name: '이세계', param: 'theme' },
  { name: '아포칼립스', param: 'theme' },
  { name: '사이버펑크', param: 'theme' },
  { name: '인간', param: 'race' },
  { name: '엘프', param: 'race' },
];

const HomeSidebar = () => {
  // 태그 모달 열림 상태
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // URL 쿼리 파라미터 확인 (현재 선택된 필터 감지)
  const searchParams = useSearchParams();

  // 현재 URL에 적용된 필터값 확인
  const currentGenre = searchParams.get('genre');
  const currentTheme = searchParams.get('theme');
  const currentRace = searchParams.get('race');
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

            <Link href="/characters?sort=popular" className={styles.sidebar_link}>
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
              {tags.map((item) => {
                // 해당 태그가 활성화되어 있는지 여부 체크
                const isActive =
                  currentGenre === item.name ||
                  currentTheme === item.name ||
                  currentRace === item.name ||
                  currentTag === item.name;

                // 클릭 시 이동할 URL 지정 (활성화 시 클릭하면 필터 해제, 미활성화 시 해당 필터 적용)
                const href = isActive
                  ? '/characters'
                  : `/characters?${item.param}=${encodeURIComponent(item.name)}`;

                return (
                  <Link key={item.name} href={href} style={{ textDecoration: 'none' }}>
                    <Tag active={isActive}>{item.name}</Tag>
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
