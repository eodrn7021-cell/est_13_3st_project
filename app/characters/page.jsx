'use client';

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import HomeSidebar from '@/components/home/HomeSidebar/HomeSidebar';
import MobileNavigation from '@/components/layout/MobileNavigation/MobileNavigation';
import styles from './characters.module.scss';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const CharactersContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // 1. URL 쿼리 파라미터 파싱 (에러 원인이었던 selectedTags를 안전하게 선언)
  const searchParamsString = searchParams.toString();
  const tagsParam = searchParams.get('tags') || searchParams.get('tag') || '';
  const currentTags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
  const searchQuery =
    searchParams.get('search') || searchParams.get('q') || searchParams.get('query') || '';

  // 2. 상태(State) 관리
  const [characters, setCharacters] = useState([]);
  const [worlds, setWorlds] = useState([]);

  // 필터 옵션 목록
  const [raceOptions, setRaceOptions] = useState([]);
  const [jobOptions, setJobOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState([]);

  // UI 상태
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 선택된 필터 조건 상태
  const [filters, setFilters] = useState({
    sort: searchParams.get('sort') === 'popular' ? '인기순' : '최신순',
    world_id: searchParams.get('world_id') || '',
    race: searchParams.get('race') || '',
    job_role: searchParams.get('job_role') || '',
    gender: searchParams.get('gender') || '',
    tags: currentTags,
  });

  // 3. URL 변경 감지 및 filters 상태 동기화 (단일 useEffect로 통합하여 렌더링 최적화)
  useEffect(() => {
    setFilters({
      sort: searchParams.get('sort') === 'popular' ? '인기순' : '최신순',
      world_id: searchParams.get('world_id') || '',
      race: searchParams.get('race') || '',
      job_role: searchParams.get('job_role') || '',
      gender: searchParams.get('gender') || '',
      tags: currentTags,
    });
  }, [searchParamsString]);

  // 4. 초기 셀렉트박스 옵션 데이터 조회 (세계관, 종족, 직업, 성별)
  useEffect(() => {
    const fetchFilterData = async () => {
      const { data: worldData, error: worldError } = await supabase.from('worlds').select('*');
      if (worldError) {
        console.error('세계관 로딩 에러:', worldError);
      } else if (worldData) {
        setWorlds(worldData);
      }

      const { data: charData, error: charError } = await supabase
        .from('characters')
        .select('world_id, race, job_role, gender');

      if (charError) {
        console.error('캐릭터 필터 데이터 로딩 에러:', charError);
      } else if (charData) {
        const races = Array.from(new Set(charData.map((item) => item.race).filter(Boolean)));
        const jobs = Array.from(new Set(charData.map((item) => item.job_role).filter(Boolean)));
        const genders = Array.from(new Set(charData.map((item) => item.gender).filter(Boolean)));

        setRaceOptions(races);
        setJobOptions(jobs);
        setGenderOptions(genders);

        if (!worldData || worldData.length === 0) {
          const uniqueWorldIds = Array.from(
            new Set(charData.map((item) => item.world_id).filter(Boolean)),
          );
          setWorlds(uniqueWorldIds.map((id) => ({ id, name: `세계관 ${id}` })));
        }
      }
    };

    fetchFilterData();
  }, []);

  // 5. 캐릭터 데이터 Fetch (드롭다운 필터 및 정렬 변경 시)
  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);

      let query = supabase.from('characters').select('*, worlds(*), character_likes(count)');

      if (filters.world_id) query = query.eq('world_id', Number(filters.world_id));
      if (filters.race) query = query.eq('race', filters.race);
      if (filters.job_role) query = query.eq('job_role', filters.job_role);
      if (filters.gender) query = query.eq('gender', filters.gender);

      if (searchQuery.trim()) {
        const keyword = `%${searchQuery.trim()}%`;
        query = query.or(
          `name.ilike.${keyword},race.ilike.${keyword},job_role.ilike.${keyword},background_story.ilike.${keyword},personality.ilike.${keyword}`,
        );
      }

      if (filters.sort === '인기순') {
        query = query.order('view_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase Error:', error);
      } else {
        setCharacters(data || []);
      }

      setIsLoading(false);
    };

    fetchCharacters();
  }, [filters.sort, filters.world_id, filters.race, filters.job_role, filters.gender, searchQuery]);

  // 핸들러: 상단 필터 변경 시
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 핸들러: 헤더 검색 및 모바일 메뉴 캐치
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

  // 6. 다중 태그 일치 필터링 & 일치 개수 순(내림차순) 정렬 처리
  const processDisplayList = () => {
    if (!filters.tags || filters.tags.length === 0) {
      return characters;
    }

    return characters
      .map((item) => {
        const itemTags = [
          item.race,
          item.job_role,
          item.worlds?.name,
          item.worlds?.genre,
          item.gender,
        ].filter(Boolean);

        // 태그 일치 개수 계산 (단일/복수 태그 및 스토리 검사)
        const matchCount = filters.tags.reduce((acc, tag) => {
          const isDirectMatch = itemTags.includes(tag);
          const isStoryMatch = item.background_story?.includes(tag);
          return isDirectMatch || isStoryMatch ? acc + 1 : acc;
        }, 0);

        return { ...item, matchCount };
      })
      .filter((item) => item.matchCount > 0) // 1개 이상 만족하는 경우만 포함 (OR 조건)
      .sort((a, b) => b.matchCount - a.matchCount); // 일치 개수 많은 순 정렬
  };

  const displayList = processDisplayList();

  // 추천 캐릭터 배지 노출용 좋아요 순 정렬
  const sortedByLikes = [...displayList].sort((a, b) => {
    const likesA = a.character_likes?.[0]?.count || a.like_count || 0;
    const likesB = b.character_likes?.[0]?.count || b.like_count || 0;
    return likesB - likesA;
  });

  const recommendedCount = Math.max(1, Math.ceil((displayList?.length || 0) * 0.1));
  const recommendedIds = new Set(sortedByLikes.slice(0, recommendedCount).map((c) => c.id));

  return (
    <div className={styles.page_container}>
      <div
        onClick={handleHeaderCapture}
        onSubmitCapture={handleHeaderCapture}
        onKeyDownCapture={handleHeaderCapture}
      >
        <Header />
      </div>

      {/* 모바일 서랍 메뉴 */}
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
            <Footer variant="mobileMenu" onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 레이아웃 */}
      <div className={styles.main_wrapper}>
        <div className={styles.layout_body}>
          <div className={styles.pc_sidebar}>
            <HomeSidebar />
          </div>

          <main className={styles.content_area}>
            {/* 상단 드롭다운 필터 바 */}
            <div className={styles.filter_bar}>
              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={filters.sort || '최신순'}
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
                  value={filters.race || ''}
                  onChange={(e) => handleFilterChange('race', e.target.value)}
                >
                  <option value="">종족</option>
                  {(raceOptions || []).map((race) => (
                    <option key={race} value={race}>
                      {race}
                    </option>
                  ))}
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={filters.world_id || ''}
                  onChange={(e) => handleFilterChange('world_id', e.target.value)}
                >
                  <option value="">테마</option>
                  {(worlds || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.title || t.world_name}
                    </option>
                  ))}
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={filters.gender || ''}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                  <option value="">성별</option>
                  {(genderOptions || []).map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={filters.job_role || ''}
                  onChange={(e) => handleFilterChange('job_role', e.target.value)}
                >
                  <option value="">장르</option>
                  {(jobOptions || []).map((job) => (
                    <option key={job} value={job}>
                      {job}
                    </option>
                  ))}
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>
            </div>

            {/* 카드 그리드 영역 */}
            <div className={styles.card_grid_container}>
              {isLoading ? null : displayList && displayList.length > 0 ? (
                <div className={styles.card_grid}>
                  {displayList.map((item) => {
                    const isRecommended = recommendedIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className={styles.card_item}
                        onClick={() => router.push(`/characters/${item.id}`)}
                      >
                        <div className={styles.image_box}>
                          {(isRecommended || item.badge) && (
                            <span className={styles.badge}>{item.badge || '추천 캐릭터'}</span>
                          )}

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
                                {[
                                  item.race,
                                  item.job_role,
                                  item.worlds?.name || item.worlds?.title || item.worlds?.genre,
                                ]
                                  .filter(Boolean)
                                  .join(' · ') || '태그 없음'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
};

const CharactersPage = () => {
  return (
    <Suspense fallback={null}>
      <CharactersContent />
    </Suspense>
  );
};

export default CharactersPage;
