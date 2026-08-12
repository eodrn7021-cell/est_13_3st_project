'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import MobileNavigation from '@/components/layout/MobileNavigation/MobileNavigation';
import Button from '@/components/common/Button/Button';
import Tag from '@/components/common/Tag/Tag';
import styles from './characters.module.scss';
import Image from 'next/image';

const CharactersPage = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [characters, setCharacters] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // actual DB 컬럼 구조에 맞춘 필터 상태
  const [filters, setFilters] = useState({
    sort: searchParams.get('sort') === 'popular' ? '인기순' : '최신순',
    world_id: '',
    job_role: '',
    gender: '',
  });

  const supabase = createClient();
  const tags = ['판타지', '기사', '마법사', '엘프', '악역', '성장', '악마'];

  // DB 필터링 로직
  useEffect(() => {
    const fetchCharacters = async () => {
      let query = supabase.from('characters').select('*');

      if (filters.world_id) {
        query = query.eq('world_id', Number(filters.world_id));
      }
      if (filters.job_role) {
        query = query.eq('job_role', filters.job_role);
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (selectedTags.length > 0) {
        query = query.contains('tags', selectedTags);
      }
      if (filters.sort === '인기순') {
        query = query.order('id', { ascending: false });
      } else {
        query = query.order('id', { ascending: false });
      }

      const { data } = await query;
      setCharacters(data || []);
    };

    fetchCharacters();
  }, [filters, selectedTags]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleHeaderClick = (e) => {
    const hamburgerBtn = e.target.closest('[class*="header_menu_button"]');
    if (hamburgerBtn) {
      setIsMobileMenuOpen(true);
    }
  };

  const displayList =
    characters.length > 0
      ? characters
      : Array.from({ length: 8 }, (_, i) => ({
          id: `mock-${i}`,
          title: `테스트 캐릭터 ${i + 1}`,
          description: '스타일 확인용 임시입니다. 피그마 레이아웃에 맞춰 표시됩니다.',
          badge: i % 2 === 0 ? 'RECOMMEND' : null,
          thumbnail: null,
        }));

  const PcSidebarContent = (
    <div className={styles.sidebar_inner}>
      <ul className={styles.side_menu}>
        <li className={pathname === '/' ? styles.active : ''}>
          <Link href="/">
            <span className="material-symbols-outlined">home</span>
            <span>홈</span>
          </Link>
        </li>
        <li className={pathname.startsWith('/characters') ? styles.active : ''}>
          <Link href="/characters">
            <span className="material-symbols-outlined">favorite</span>
            <span>추천</span>
          </Link>
        </li>
        <li className={pathname === '/characters/create' ? styles.active : ''}>
          <Link href="/characters/create">
            <span className="material-symbols-outlined">add_circle</span>
            <span>만들기</span>
          </Link>
        </li>
        <li className={pathname === '/my-page' ? styles.active : ''}>
          <Link href="/my-page">
            <span className="material-symbols-outlined">person</span>
            <span>마이페이지</span>
          </Link>
        </li>
      </ul>

      <div className={styles.tag_section}>
        <hr className={styles.divider} />
        <h4>태그 탐색</h4>
        <div className={styles.tag_list}>
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Tag
                key={tag}
                className={isSelected ? styles.active : ''}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Tag>
            );
          })}
        </div>

        <Button variant="secondary" size="large" fullWidth={true} className={styles.more_tag_btn}>
          <span>더 많은 태그 보기</span>
          <span className="material-symbols-outlined">chevron_right</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className={styles.page_container}>
      <div onClick={handleHeaderClick}>
        <Header />
      </div>

      {/* 모바일 전용 드로어 사이드바 */}
      <div className={`${styles.mobile_drawer} ${isMobileMenuOpen ? styles.is_open : ''}`}>
        <div className={styles.backdrop} onClick={() => setIsMobileMenuOpen(false)} />

        <div className={styles.drawer_content}>
          <div className={styles.drawer_header}>
            <button type="button" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className={styles.mobile_drawer_top}>
            <div className={styles.mobile_logo_box}>
              <Image
                src="/images/icons/logo.png"
                alt="VisuLore 로고"
                width={48}
                height={48}
                priority
              />
              <span className={styles.logo_text}>VisuLore</span>
            </div>
            <div className={styles.mobile_auth_buttons}>
              <Link href="/login" className={styles.btn_login}>
                로그인
              </Link>
              <Link href="/signup" className={styles.btn_signup}>
                회원가입
              </Link>
            </div>
          </div>

          <div className={styles.mobile_drawer_footer}>
            <Footer />
          </div>
        </div>
      </div>

      {/* 메인 래퍼 */}
      <div className={styles.main_wrapper}>
        {/* 사이드바 + 메인 콘텐츠를 감싸는 본체 바디 */}
        <div className={styles.layout_body}>
          {/* PC용 사이드바 */}
          <div className={styles.pc_sidebar}>
            <Sidebar variant="world" topContent={PcSidebarContent} />
          </div>

          {/* 우측 메인 콘텐츠 */}
          <main className={styles.content_area}>
            {/* 필터 바 영역 */}
            <div className={styles.filter_bar}>
              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="최신순">최신순</option>
                  <option value="인기순">인기순</option>
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={filters.world_id}
                  onChange={(e) => handleFilterChange('world_id', e.target.value)}
                >
                  <option value="">세계관 전체</option>
                  <option value="1">1번 세계관</option>
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              <div className={styles.select_wrapper}>
                <select className={styles.filter_select}>
                  <option value="">소속 전체</option>
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={filters.job_role}
                  onChange={(e) => handleFilterChange('job_role', e.target.value)}
                >
                  <option value="">직업 전체</option>
                  <option value="무직">무직</option>
                  <option value="기사">기사</option>
                  <option value="마법사">마법사</option>
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                  <option value="">성별 전체</option>
                  <option value="여성">여성</option>
                  <option value="남성">남성</option>
                  <option value="무성">무성</option>
                  <option value="비공개">비공개</option>
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>
            </div>

            {/* 카드 그리드 영역 */}
            <div className={styles.card_grid_container}>
              <div className={styles.card_grid}>
                {displayList.map((item) => (
                  <div key={item.id} className={styles.card_item}>
                    <div className={styles.image_box}>
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name || '캐릭터 이미지'} />
                      )}
                      {item.badge && <span className={styles.badge}>{item.badge}</span>}
                    </div>
                    <div className={styles.card_info}>
                      <h3>{item.name || item.title}</h3>
                      <p>{item.description || `${item.race || ''} · ${item.gender || ''}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* PC용 푸터 영역 (사이드바 밑까지 전체 너비 차지) */}
        <footer className={styles.pc_footer_wrapper}>
          <Footer />
        </footer>
      </div>

      {/* 1200px 미만 하단 모바일 바 */}
      <div className={styles.mobile_nav_wrapper}>
        <MobileNavigation />
      </div>
    </div>
  );
};

export default CharactersPage;
