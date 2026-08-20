'use client';

import { Suspense, useEffect, useState } from 'react';
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
        : sortParam === '최신순'
          ? '최신순'
          : ''; // sort 파라미터가 없으면 빈 문자열("")로 처리하여 '정렬' 옵션 선택 유도

  const raceFilter = searchParams.get('race') || '';
  const themeFilter = searchParams.get('theme') || '';
  const genderFilter = searchParams.get('gender') || '';
  const genreFilter = searchParams.get('genre') || '';

  const [characters, setCharacters] = useState([]);

  // 화면 크기에 따른 컬럼 개수 상태 및 리사이즈 감지 로직
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setColumnCount(2); // 모바일 화면 등에서 2열
      } else if (width <= 1200) {
        setColumnCount(3); // 태블릿 화면 등에서 3열
      } else {
        setColumnCount(4); // PC 화면에서 4열
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [raceOptions, setRaceOptions] = useState([]);
  const [themeOptions, setThemeOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  // 필터 옵션(종족, 테마, 장르, 성별 목록)을 불러오는 함수
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

  // 캐릭터 목록을 조건에 맞춰 불러오고 정렬 및 예외 방어를 처리하는 함수
  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);

      const baseQuery = supabase
        .from('characters')
        .select('*, worlds!inner(*), character_likes(count)');

      const applyFilters = (q) => {
        let filteredQ = q;
        if (raceFilter) filteredQ = filteredQ.eq('race', raceFilter);

        if (raceFilter) {
          const races = raceFilter
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean);
          if (races.length > 1) {
            filteredQ = filteredQ.in('race', races);
          } else if (races.length === 1) {
            filteredQ = filteredQ.eq('race', races[0]);
          }
        }

        if (genreFilter) {
          filteredQ = filteredQ.eq('worlds.genre', genreFilter);
        }
        if (themeFilter) {
          filteredQ = filteredQ.or(`theme.eq.${themeFilter},worlds.theme.eq.${themeFilter}`);
        }

        if (searchQuery.trim()) {
          const keyword = `%${searchQuery.trim()}%`;
          filteredQ = filteredQ.or(
            `name.ilike.${keyword},race.ilike.${keyword},job_role.ilike.${keyword},background_story.ilike.${keyword},personality.ilike.${keyword}`,
          );
        }
        return filteredQ;
      };

      const { data, error } = await applyFilters(baseQuery);

      if (error) {
        const fallbackBaseQuery = supabase
          .from('characters')
          .select('*, worlds(*), character_likes(count)');

        const fallbackQuery = applyFilters(fallbackBaseQuery);
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;

        if (fallbackError) {
          setCharacters([]);
          setIsLoading(false);
          return;
        }

        const rawFallback = fallbackData || [];
        const filtered = rawFallback.filter((item) => {
          const matchGenre =
            !genreFilter || item.worlds?.genre === genreFilter || item.genre === genreFilter;
          const matchTheme =
            !themeFilter || item.worlds?.theme === themeFilter || item.theme === themeFilter;
          return matchGenre && matchTheme;
        });

        setCharacters(filtered);
      } else {
        const rawData = data || [];

        const filteredData = rawData.filter((item) => item.image_url);
        const sortedData = [...filteredData].sort((a, b) => {
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
            // 기본값은 최신순 정렬
            if (timeB !== timeA) return timeB - timeA;
            return viewsB - viewsA;
          }
        });

        setCharacters(sortedData);
      }

      setIsLoading(false);
    };

    fetchCharacters();
  }, [actualSort, raceFilter, themeFilter, genderFilter, genreFilter, searchQuery]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.replace(pathname);
    router.refresh();
  };

  // 데이터 배열 재정렬 함수 (동적 컬럼 개수 적용)
  const reorderForColumnLayout = (items, numColumns = 4) => {
    if (!items || items.length === 0) return [];
    const cols = Array.from({ length: numColumns }, () => []);
    items.forEach((item, index) => {
      cols[index % numColumns].push(item);
    });
    return cols.flat();
  };

  const handleHeaderCapture = (e) => {
    if (e.type === 'submit' || (e.type === 'keydown' && e.key === 'Enter')) {
      const searchInput = e.currentTarget.querySelector(
        'input[type="text"], input[type="search"], input',
      );

      // 검색어가 있는 경우 검색 페이지로 이동
      if (searchInput && searchInput.value.trim()) {
        e.preventDefault();
        const val = searchInput.value.trim();
        router.push(`/characters?search=${encodeURIComponent(val)}`);
      }
      // 검색어가 비어있는 경우 (빈값 엔터)
      else if (searchInput && searchInput.value.trim() === '') {
        e.preventDefault();
        // 검색 파라미터를 삭제하고 기본 상태로 이동 (정렬 유지 또는 초기화)
        router.push('/characters');
      }
    }
  };

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
      .sort((a, b) => {
        // 1순위: 일치하는 태그 개수가 많은 순서 (내림차순)
        if (b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount;
        }
        // 2순위: 태그 개수가 같다면 캐릭터 이름 가나다순(오름차순) 정렬
        return (a.name || '').localeCompare(b.name || '', 'ko');
      });
  };

  const displayList = processDisplayList();

  const finalDisplayList = reorderForColumnLayout(displayList, columnCount);

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
            <div className={styles.filter_bar}>
              {/* 정렬 기준 선택 (정렬, 최신순, 추천순, 인기순) */}
              <div className={styles.select_wrapper}>
                <select
                  className={styles.filter_select}
                  value={actualSort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="">정렬</option>
                  <option value="최신순">최신순</option>
                  <option value="추천순">추천순</option>
                  <option value="인기순">인기순</option>
                </select>
                <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                  expand_more
                </span>
              </div>

              {/* 종족 필터 선택 */}
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

              {/* 테마 필터 선택 */}
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

              {/* 성별 필터 선택 */}
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

              {/* 장르 필터 선택 */}
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

            <div className={styles.card_grid_container}>
              {isLoading ? (
                <div className={styles.card_grid}>
                  {Array.from({ length: 16 }).map((_, index) => (
                    <div key={index} className={styles.skeleton_card} />
                  ))}
                </div>
              ) : finalDisplayList && finalDisplayList.length > 0 ? (
                <div className={styles.card_grid}>
                  {finalDisplayList.map((item) => {
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
    <Suspense fallback={<div>Loading...</div>}>
      <CharactersContent />
    </Suspense>
  );
};

export default CharactersPage;
