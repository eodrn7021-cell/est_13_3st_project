'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import Button from '@/components/common/Button/Button';
import Tag from '@/components/common/Tag/Tag';
import styles from './characters.module.scss';

const CharactersPage = () => {
  const [characters, setCharacters] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const supabase = createClient();
  const tags = ['판타지', '기사', '마법사', '엘프', '악역', '성장', '악마'];

  useEffect(() => {
    const fetchCharacters = async () => {
      const { data, error } = await supabase.from('portfolio').select('*');
      if (error) console.error('Error fetching data:', error);
      else setCharacters(data || []);
    };

    fetchCharacters();
  }, []);

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

  const filteredCharacters =
    selectedTags.length > 0
      ? characters.filter((char) => {
          const charTags = Array.isArray(char.tags) ? char.tags : [char.tags];
          return selectedTags.some((tag) => charTags.includes(tag));
        })
      : characters;

  const displayList =
    filteredCharacters.length > 0
      ? filteredCharacters
      : Array.from({ length: 8 }, (_, i) => ({
          id: `mock-${i}`,
          title: `테스트 캐릭터 ${i + 1}`,
          description: '스타일 확인용 임시입니다. 피그마 레이아웃에 맞춰 표시됩니다.',
          badge: i % 2 === 0 ? 'RECOMMEND' : null,
          thumbnail: null,
        }));

  const MySidebarContent = (
    <>
      {/* 상단 사이드 메뉴*/}
      <ul className={styles.side_menu}>
        <li>
          <span className="material-symbols-outlined">home</span>
          <span>홈</span>
        </li>
        <li>
          <span className="material-symbols-outlined">favorite</span>
          <span>추천</span>
        </li>
        <li>
          <span className="material-symbols-outlined">add_circle</span>
          <span>만들기</span>
        </li>
        <li>
          <span className="material-symbols-outlined">person</span>
          <span>마이페이지</span>
        </li>
      </ul>

      {/* 태그 탐색 섹션 */}
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
    </>
  );

  return (
    <div className={styles.page_container}>
      <div onClick={handleHeaderClick}>
        <Header />
      </div>

      <div className={`${styles.mobile_drawer} ${isMobileMenuOpen ? styles.is_open : ''}`}>
        <div className={styles.backdrop} onClick={() => setIsMobileMenuOpen(false)} />

        <div className={styles.drawer_content}>
          <div className={styles.drawer_header}>
            <span className="en_t_title">VisuLore</span>
            <button type="button" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className={styles.drawer_body}>{MySidebarContent}</div>

          {/* 사이드바 내부 아래쪽 푸터 */}
          <div className={styles.drawer_footer}>
            <Footer />
          </div>
        </div>
      </div>

      {/* 3. 본문 영역 */}
      <div className={styles.main_wrapper}>
        {/* PC용 사이드바 */}
        <div className={styles.pc_sidebar}>
          <Sidebar variant="world" topContent={MySidebarContent} />
        </div>

        {/* 우측 메인 콘텐츠 */}
        <main className={styles.content_area}>
          <div className={styles.filter_bar}>
            <div className={styles.select_wrapper}>
              <select className={styles.filter_select}>
                <option>인기순</option>
                <option>최신순</option>
              </select>
              <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                expand_more
              </span>
            </div>

            <div className={styles.select_wrapper}>
              <select className={styles.filter_select}>
                <option>세계관</option>
              </select>
              <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                expand_more
              </span>
            </div>

            <div className={styles.select_wrapper}>
              <select className={styles.filter_select}>
                <option>소속</option>
              </select>
              <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                expand_more
              </span>
            </div>

            <div className={styles.select_wrapper}>
              <select className={styles.filter_select}>
                <option>직업</option>
              </select>
              <span className={`material-symbols-outlined ${styles.select_arrow}`}>
                expand_more
              </span>
            </div>

            <div className={styles.select_wrapper}>
              <select className={styles.filter_select}>
                <option>성별</option>
                <option>여</option>
                <option>남</option>
                <option>없음</option>
                <option>비공개</option>
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
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt={item.title || '캐릭터 이미지'} />
                    )}
                    {item.badge && <span className={styles.badge}>{item.badge}</span>}
                  </div>
                  <div className={styles.card_info}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* PC 전용 하단 푸터 */}
      <div className={styles.pc_footer}>
        <Footer />
      </div>
    </div>
  );
};

export default CharactersPage;
