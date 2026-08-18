'use client';

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Footer from '@/components/layout/Footer/Footer';
import HomeSidebar from '@/components/home/HomeSidebar/HomeSidebar';
import HomeMobileMenu from '@/components/home/HomeMobileMenu/HomeMobileMenu';
import MobileNavigation from '@/components/layout/MobileNavigation/MobileNavigation';
import styles from './characters.module.scss';

export const dynamic = 'force-dynamic';

const CharactersContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // 1. URL 쿼리 파라미터를 직접 읽어와서 파싱 (상태 동기화 꼬임 방지)
  const searchParamsString = searchParams.toString();
  const tagsParam = searchParams.get('tags') || searchParams.get('tag') || '';
  const currentTags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
  const searchQuery =
    searchParams.get('search') || searchParams.get('q') || searchParams.get('query') || '';

  const sortParam = searchParams.get('sort');
  const actualSort =
    sortParam === 'popular' || sortParam === '추천순'
      ? '추천순'
      : sortParam === 'views' || sortParam === '인기순'
        ? '인기순'
        : '최신순';

  const raceFilter = searchParams.get('race') || '';
  const themeFilter = searchParams.get('theme') || '';
  const genderFilter = searchParams.get('gender') || '';
  const genreFilter = searchParams.get('genre') || '';

  // 2. 상태(State) 관리 - DB 옵션 및 결과 데이터만 관리
  const [characters, setCharacters] = useState([]);

  // 필터 옵션 목록 (races, themes, genres, gender)
  const [raceOptions, setRaceOptions] = useState([]);
  const [themeOptions, setThemeOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);

  // UI 상태
  const [isLoading, setIsLoading] = useState(true);

  // DB에서 필터 옵션 조회
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const { data: raceData } = await supabase.from('races').select('id, name');
      if (raceData) setRaceOptions(raceData);

      const { data: themeData } = await supabase.from('themes').select('id, name');
      if (themeData) setThemeOptions(themeData);

      const { data: genreData } = await supabase.from('genres').select('id, name');
      if (genreData) setGenreOptions(genreData);

      const { data: charGenderData } = await supabase.from('characters').select('gender');
      if (charGenderData) {
        const genders = Array.from(
          new Set(charGenderData.map((item) => item.gender).filter(Boolean)),
        );
        setGenderOptions(genders);
      }
    };

    fetchFilterOptions();
  }, []);

  // 캐릭터 데이터 Fetch (필터 조건 실시간 반영)
  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);

      let query = supabase.from('characters').select('*, worlds!inner(*), character_likes(count)');

      if (raceFilter) query = query.eq('race', raceFilter);
      if (genderFilter) query = query.eq('gender', genderFilter);

      if (genreFilter) {
        query = query.eq('worlds.genre', genreFilter);
      }
      if (themeFilter) {
        query = query.or(`theme.eq.${themeFilter},worlds.theme.eq.${themeFilter}`);
      }

      if (searchQuery.trim()) {
        const keyword = `%${searchQuery.trim()}%`;
        query = query.or(
          `name.ilike.${keyword},race.ilike.${keyword},job_role.ilike.${keyword},background_story.ilike.${keyword},personality.ilike.${keyword}`,
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase Error:', error);
        let fallbackQuery = supabase
          .from('characters')
          .select('*, worlds(*), character_likes(count)');
        if (raceFilter) fallbackQuery = fallbackQuery.eq('race', raceFilter);
        if (genderFilter) fallbackQuery = fallbackQuery.eq('gender', genderFilter);
        const { data: fallbackData } = await fallbackQuery;

        let filtered = fallbackData || [];
        if (genreFilter) {
          filtered = filtered.filter(
            (item) => item.worlds?.genre === genreFilter || item.genre === genreFilter,
          );
        }
        if (themeFilter) {
          filtered = filtered.filter(
            (item) => item.worlds?.theme === themeFilter || item.theme === themeFilter,
          );
        }
        setCharacters(filtered);
      } else {
        let resultData = data || [];

        resultData = [...resultData].sort((a, b) => {
          const likesA = a.character_likes?.[0]?.count || a.like_count || 0;
          const likesB = b.character_likes?.[0]?.count || b.like_count || 0;
          const viewsA = a.view_count || 0;
          const viewsB = b.view_count || 0;
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();

          if (actualSort === '추천순') {
            if (likesB !== likesA) return likesB - likesA;
            return viewsB - viewsA;
          } else if (actualSort === '인기순') {
            if (viewsB !== viewsA) return viewsB - viewsA;
            return likesB - likesA;
          } else {
            if (timeB !== timeA) return timeB - timeA;
            return viewsB - viewsA;
          }
        });

        setCharacters(resultData);
      }

      setIsLoading(false);
    };

    fetchCharacters();
  }, [actualSort, raceFilter, themeFilter, genderFilter, genreFilter, searchQuery]);

  // 핸들러: 상단 드롭다운 필터 변경 시 URL 파라미터 갱신
  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // 🔥 핵심: 초기화 버튼 핸들러 (누르는 즉시 URL 파라미터 전부 날리고 전체 목록으로 이동)
  const handleResetFilters = () => {
    router.push(pathname);
  };

  // 핸들러: 헤더 검색어 제출 캐치
  const handleHeaderCapture = (e) => {
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

  // 다중 태그 일치 필터링 & 가중치 정렬 처리
  const processDisplayList = () => {
    if (!currentTags || currentTags.length === 0) {
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

        const matchCount = currentTags.reduce((acc, tag) => {
          const isDirectMatch = itemTags.includes(tag);
          const isStoryMatch = item.background_story?.includes(tag);
          return isDirectMatch || isStoryMatch ? acc + 1 : acc;
        }, 0);

        return { ...item, matchCount };
      })
      .filter((item) => item.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);
  };

  const displayList = processDisplayList();

  // 추천 캐릭터 배지 노출용
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
        <HomeMobileMenu headerVariant="main" showSearch />
      </div>

      <div className={styles.main_wrapper}>
        <div className={styles.layout_body}>
          <div className={styles.pc_sidebar}>
            <HomeSidebar />
          </div>

          <main className={styles.content_area}>
            {/* 상단 드롭다운 필터 바 */}
            <div className={styles.filter_bar}>
              {/* 정렬 필터 */}
              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={actualSort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="최신순">최신순</option>
                  <option value="추천순">추천순</option>
                  <option value="인기순">인기순</option>
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              {/* 종족 필터 (races 테이블 연동) */}
              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={raceFilter}
                  onChange={(e) => handleFilterChange('race', e.target.value)}
                >
                  <option value="">종족</option>
                  {(raceOptions || []).map((item) => (
                    <option key={item.id || item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              {/* 테마 필터 (themes 테이블 연동) */}
              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={themeFilter}
                  onChange={(e) => handleFilterChange('theme', e.target.value)}
                >
                  <option value="">테마</option>
                  {(themeOptions || []).map((item) => (
                    <option key={item.id || item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              {/* 성별 필터 (characters.gender 연동) */}
              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={genderFilter}
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

              {/* 장르 필터 (genres 테이블 연동) */}
              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={genreFilter}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                >
                  <option value="">장르</option>
                  {(genreOptions || []).map((item) => (
                    <option key={item.id || item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              {/* 🔥 추가된 초기화 버튼 (인라인 스타일 대신 SCSS 활용 혹은 필요시 클래스 연결) */}
              {(raceFilter ||
                themeFilter ||
                genderFilter ||
                genreFilter ||
                searchQuery ||
                currentTags.length > 0) && (
                <button
                  type="button"
                  className={styles.reset_button || ''}
                  onClick={handleResetFilters}
                >
                  필터 초기화
                </button>
              )}
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
