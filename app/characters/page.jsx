'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import Button from '@/components/common/Button/Button';
import styles from './characters.module.scss';

const CharactersPage = () => {
  const [characters, setCharacters] = useState([]);
  const [activeMenu, setActiveMenu] = useState('추천');
  /* const [activeMenu, setActiveMenu] = useState(null); */ //! 추천을 기본?
  const [selectedTag, setSelectedTag] = useState(null);
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

  const filteredCharacters = selectedTag
    ? characters.filter((char) =>
        Array.isArray(char.tags) ? char.tags.includes(selectedTag) : char.tags === selectedTag,
      )
    : characters;

  return (
    <>
      <Header />

      <div className={styles.main_wrapper}>
        {/* 1. 좌측 사이드바: topContent 안에 메뉴와 태그를 전부 집어넣음 */}
        <Sidebar
          variant="world"
          topContent={
            <>
              {/* 상단 사이드 메뉴 */}
              <ul className={styles.side_menu}>
                <li
                  className={activeMenu === '홈' ? styles.active : ''}
                  onClick={() => setActiveMenu('홈')}
                >
                  <span className="material-symbols-outlined">home</span>
                  <span>홈</span>
                </li>
                <li
                  className={activeMenu === '추천' ? styles.active : ''}
                  onClick={() => setActiveMenu('추천')}
                >
                  <span className="material-symbols-outlined">favorite</span>
                  <span>추천</span>
                </li>
                <li
                  className={activeMenu === '만들기' ? styles.active : ''}
                  onClick={() => setActiveMenu('만들기')}
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  <span>만들기</span>
                </li>
                <li
                  className={activeMenu === '마이페이지' ? styles.active : ''}
                  onClick={() => setActiveMenu('마이페이지')}
                >
                  <span className="material-symbols-outlined">person</span>
                  <span>마이페이지</span>
                </li>
              </ul>

              {/* 태그 탐색 섹션 */}
              <div className={styles.tag_section}>
                <hr className={styles.divider} />
                <h4>태그 탐색</h4>
                <div className={styles.tag_list}>
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="large"
                  fullWidth={true}
                  className={styles.more_tag_btn}
                >
                  <span>더 많은 태그 보기</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </Button>
              </div>
            </>
          }
        />

        {/* 2. 우측 메인 콘텐츠 */}
        <main className={styles.content_area}>
          <div className={styles.filter_bar}>
            <select className={styles.filter_select}>
              <option>인기순</option>
              <option>최신순</option>
            </select>
            <select className={styles.filter_select}>
              <option>세계관</option>
            </select>
            <select className={styles.filter_select}>
              <option>소속</option>
            </select>
            <select className={styles.filter_select}>
              <option>직업</option>
            </select>
            <select className={styles.filter_select}>
              <option>성별</option>
              <option>여</option>
              <option>남</option>
              <option>없음</option>
              <option>비공개</option>
            </select>
          </div>

          <div className={styles.card_grid}>
            {filteredCharacters.map((item) => (
              <div key={item.id} className={styles.card_item}>
                <div className={styles.image_box}>
                  <img src={item.thumbnail} alt={item.title || '캐릭터 이미지'} />
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                </div>
                <div className={styles.card_info}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default CharactersPage;
