'use client';

import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import MobileNavigation from '@/components/layout/MobileNavigation/MobileNavigation';
import Button from '@/components/common/Button/Button';
import Tag from '@/components/common/Tag/Tag';
import styles from './characters.module.scss';
import Image from 'next/image';

function CharactersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [characters, setCharacters] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    sort: searchParams.get('sort') === 'popular' ? '인기순' : '최신순',
    world_id: '',
    job_role: '',
    gender: '',
  });

  const supabase = createClient();
  const tags = ['판타지', '기사', '마법사', '엘프', '악역', '성장', '악마'];

  // 검색
  const searchQuery =
    searchParams.get('search') || searchParams.get('q') || searchParams.get('query') || '';

  const handleHeaderCapture = (e) => {
    const hamburgerBtn = e.target.closest('[class*="header_menu_button"]');
    if (hamburgerBtn) {
      setIsMobileMenuOpen(true);
      return;
    }

    if (e.type === 'submit' || (e.type === 'keydown' && e.key === 'Enter')) {
      const searchInput = e.currentTarget.querySelector(
        'input[type="text"], input[type="search"], input',
      );

      if (searchInput && searchInput.value.trim()) {
        e.preventDefault();
        const val = searchInput.value.trim();
        router.push(`/characters?search=${encodeURIComponent(val)}`);
      }
    }
  };

  // 필터링 로직
  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);

      let query = supabase.from('characters').select('*, worlds(genre)');

      if (filters.world_id) {
        query = query.eq('world_id', Number(filters.world_id));
      }
      if (filters.job_role) {
        query = query.eq('job_role', filters.job_role);
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }

      // 검색어 필터링
      if (searchQuery.trim()) {
        const keyword = `%${searchQuery.trim()}%`;
        query = query.or(
          `name.ilike.${keyword},race.ilike.${keyword},job_role.ilike.${keyword},background_story.ilike.${keyword},personality.ilike.${keyword}`,
        );
      }

      if (filters.sort === '인기순') {
        query = query.order('like_count', { ascending: false }); // 좋아요 많은 순
      } else {
        query = query.order('created_at', { ascending: false }); // 최신 등록 순
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase 에러:', error);
      } else {
        let list = data || [];

        // 인기순일 경우 좋아요 개수가 많은 순서대로
        if (filters.sort === '인기순') {
          list.sort((a, b) => {
            const likesA = a.character_likes?.[0]?.count || 0;
            const likesB = b.character_likes?.[0]?.count || 0;
            return likesB - likesA;
          });
        }
        setCharacters(list);
      }

      setIsLoading(false);
    };

    fetchCharacters();
  }, [filters, searchQuery]);

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

  const displayList = characters;

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
      <div
        onClick={handleHeaderCapture}
        onSubmitCapture={handleHeaderCapture}
        onKeyDownCapture={handleHeaderCapture}
      >
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
        <div className={styles.layout_body}>
          <div className={styles.pc_sidebar}>
            <Sidebar variant="world" topContent={PcSidebarContent} />
          </div>

          <main className={styles.content_area}>
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
                  <option value="">세계관</option>
                  <option value="1">1번 세계관</option>
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              <div className={styles.select_wrapper}>
                <select className={styles.filter_select}>
                  <option value="">소속</option>
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
                  <option value="">직업</option>
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
                  <option value="">성별</option>
                  <option value="여성">여성</option>
                  <option value="남성">남성</option>
                  <option value="무성">무성</option>
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>
            </div>

            <div className={styles.card_grid_container}>
              {isLoading ? null : displayList && displayList.length > 0 ? (
                <div className={styles.card_grid}>
                  {displayList.map((item) => (
                    <div
                      key={item.id}
                      className={styles.card_item}
                      onClick={() => router.push(`/characters/${item.id}`)}
                    >
                      <div className={styles.image_box}>
                        {item.badge && <span className={styles.badge}>{item.badge}</span>}

                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name || '캐릭터 이미지'} />
                        ) : (
                          <div className={styles.no_image}>
                            <span className={`material-symbols-outlined ${styles.no_image_icon}`}>
                              person
                            </span>
                          </div>
                        )}

                        <div className={styles.card_overlay}>
                          <div className={styles.card_info}>
                            <h3>{item.name}</h3>
                            <p className={styles.description}>
                              {item.background_story || '캐릭터 상세 설명이 없습니다.'}
                            </p>
                            <div className={styles.tag_badge}>
                              {[item.race, item.job_role, item.worlds?.genre]
                                .filter(Boolean)
                                .join(' · ') || '태그 없음'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.empty_state}>
                  <span className={`material-symbols-outlined ${styles.empty_icon}`}>error</span>
                  <p className={styles.empty_text}>검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </main>
        </div>

        <footer className={styles.pc_footer_wrapper}>
          <Footer />
        </footer>
      </div>

      <div className={styles.mobile_nav_wrapper}>
        <MobileNavigation />
      </div>
    </div>
  );
}

const CharactersPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CharactersContent />
    </Suspense>
  );
};

export default CharactersPage;
