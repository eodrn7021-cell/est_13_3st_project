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
        : '최신순';

  const raceFilter = searchParams.get('race') || '';
  const themeFilter = searchParams.get('theme') || '';
  const genderFilter = searchParams.get('gender') || '';
  const genreFilter = searchParams.get('genre') || '';

  const [characters, setCharacters] = useState([]);

  const [raceOptions, setRaceOptions] = useState([]);
  const [themeOptions, setThemeOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  // 필터 옵션(종족, 테마, 장르, 성별 목록)을 불러오는 함수
  useEffect(() => {
    const fetchFilterOptions = async () => {
      // 종족 데이터 조회
      const { data: raceData } = await supabase.from('races').select('id, name');
      if (raceData) setRaceOptions(raceData);

      // 테마 데이터 조회
      const { data: themeData } = await supabase.from('themes').select('id, name');
      if (themeData) setThemeOptions(themeData);

      // 장르 데이터 조회
      const { data: genreData } = await supabase.from('genres').select('id, name');
      if (genreData) setGenreOptions(genreData);

      // 성별 목록 추출을 위한 캐릭터 데이터 조회
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

      // 기본 Supabase 조회 쿼리 (worlds 테이블 조인 포함)
      const baseQuery = supabase
        .from('characters')
        .select('*, worlds!inner(*), character_likes(count)');

      // 현재 URL의 필터 및 검색 조건을 쿼리에 동적으로 적용하는 내부 함수
      const applyFilters = (q) => {
        let filteredQ = q;
        if (raceFilter) filteredQ = filteredQ.eq('race', raceFilter);

        if (genderFilter) {
          const genders = genderFilter
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean);
          if (genders.length > 1) {
            filteredQ = filteredQ.in('gender', genders);
          } else if (genders.length === 1) {
            filteredQ = filteredQ.eq('gender', genders[0]);
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

      // 1차 필터 쿼리 실행
      const { data, error } = await applyFilters(baseQuery);

      // 조인 조건 등으로 인해 1차 쿼리에서 에러 발생 시 폴백(우회) 쿼리 실행
      if (error) {
        console.error('Supabase Error:', error);
        const fallbackBaseQuery = supabase
          .from('characters')
          .select('*, worlds(*), character_likes(count)');

        const fallbackQuery = applyFilters(fallbackBaseQuery);
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;

        // 폴백 쿼리마저 실패할 경우 앱 크래시를 막기 위해 빈 배열 대입 후 종료
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
        // 정상 조회된 데이터를 정렬 조건(추천순, 인기순, 최신순)에 맞게 정렬
        const rawData = data || [];

        const sortedData = [...rawData].sort((a, b) => {
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

        setCharacters(sortedData);
      }

      setIsLoading(false);
    };

    fetchCharacters();
  }, [actualSort, raceFilter, themeFilter, genderFilter, genreFilter, searchQuery]);

  // 사용자가 필터 드롭다운을 변경했을 때 URL 쿼리 파라미터를 업데이트하는 함수
  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // 적용된 모든 필터와 검색 조건을 초기화하고 기본 페이지로 돌아가는 함수
  const handleResetFilters = () => {
    router.replace(pathname);
    router.refresh();
  };

  // 상단 헤더 영역에서 검색창 입력 및 엔터 이벤트를 감지하여 검색 결과 페이지로 이동시키는 함수
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

  // 현재 입력된 태그(currentTags)를 바탕으로 캐릭터 목록을 필터링하고 매칭 점수를 계산하는 함수
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

  const sortedByLikes = [...displayList].sort((a, b) => {
    const likesA = a.character_likes?.[0]?.count || a.like_count || 0;
    const likesB = b.character_likes?.[0]?.count || b.like_count || 0;
    return likesB - likesA;
  });

  const recommendedCount = Math.max(1, Math.ceil((displayList?.length || 0) * 0.1));
  const recommendedIds = new Set(sortedByLikes.slice(0, recommendedCount).map((c) => c.id));

  return (
    <div className={styles.page_container}>
      {/* 모바일 환경 상단 헤더 영역 (이벤트 캡처를 통해 검색 제어) */}
      <div
        onClick={handleHeaderCapture}
        onSubmitCapture={handleHeaderCapture}
        onKeyDownCapture={handleHeaderCapture}
      >
        <HomeMobileMenu headerVariant="main" showSearch />
      </div>

      <div className={styles.main_wrapper}>
        <div className={styles.layout_body}>
          {/* PC 환경 좌측 사이드바 영역 */}
          <div className={styles.pc_sidebar}>
            <HomeSidebar />
          </div>

          {/* 메인 컨텐츠 영역 (필터 바 및 캐릭터 카드 그리드) */}
          <main className={styles.content_area}>
            {/* 정렬 및 상세 필터(종족, 테마, 성별, 장르) 드롭다운 바 영역 */}
            <div className={styles.filter_bar}>
              {/* 정렬 기준 선택 (최신순, 추천순, 인기순) */}
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

              {/* 필터나 검색어가 적용되어 있을 때만 노출되는 초기화 버튼 */}
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

            {/* 캐릭터 카드 목록이 표시되는 그리드 영역 */}
            <div className={styles.card_grid_container}>
              {isLoading ? null : displayList && displayList.length > 0 ? (
                <div className={styles.card_grid}>
                  {displayList.map((item) => {
                    const isRecommended = recommendedIds.has(item.id);

                    return (
                      /* 개별 캐릭터 카드 아이템 (클릭 시 상세 페이지로 이동) */
                      <div
                        key={item.id}
                        className={styles.card_item}
                        onClick={() => router.push(`/characters/${item.id}`)}
                      >
                        <div className={styles.image_box}>
                          {/* 추천 뱃지 혹은 커스텀 뱃지 표시 */}
                          {(isRecommended || item.badge) && (
                            <span className={styles.badge}>{item.badge || '추천 캐릭터'}</span>
                          )}

                          {/* 캐릭터 이미지 또는 이미지가 없을 때 대체 아이콘 표시 */}
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name || '캐릭터 이미지'} />
                          ) : (
                            <div className={styles.no_image}>
                              <span className={`material-symbols-outlined ${styles.no_image_icon}`}>
                                person
                              </span>
                            </div>
                          )}

                          {/* 마우스 호버 시 나타나는 캐릭터 오버레이 정보 영역 */}
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
                /* 검색 결과나 데이터가 없을 때 노출되는 빈 상태(Empty State) 화면 */
                <div className={styles.empty_state}>
                  <span className={`material-symbols-outlined ${styles.empty_icon}`}>error</span>
                  <p className={styles.empty_text}>검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* 하단 푸터 영역 (PC 전용) */}
        <footer className={styles.pc_footer_wrapper}>
          <Footer />
        </footer>
      </div>

      {/* 모바일 환경 하단 고정 네비게이션바 영역 */}
      <div className={styles.mobile_nav_wrapper}>
        <MobileNavigation />
      </div>
    </div>
  );
};

// [컴포넌트 역할] Next.js Suspense 경계를 제공하여 클라이언트 컴포넌트의 비동기 렌더링 안정성을 보장하는 페이지 컴포넌트
const CharactersPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CharactersContent />
    </Suspense>
  );
};

export default CharactersPage;
