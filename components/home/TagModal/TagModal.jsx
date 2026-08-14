"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/common/Button/Button";
import Tag from "@/components/common/Tag/Tag";
import { createClient } from "@/lib/supabase/client";

import styles from "./TagModal.module.scss";

// 추가: 모달 카테고리와 DB 테이블 연결
const TAG_GROUPS = [
  {
    id: "race",
    label: "종족",
    table: "races",
  },
  {
    id: "theme",
    label: "테마",
    table: "themes",
  },
  {
    id: "gender",
    label: "성별",
    table: "genders",
  },
  {
    id: "genre",
    label: "장르",
    table: "genres",
  },
];

const TagModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  // 추가: 현재 열려 있는 아코디언
  const [openGroup, setOpenGroup] = useState(null);

  // 추가: DB에서 가져온 태그
  const [tagOptions, setTagOptions] = useState({
    race: [],
    theme: [],
    gender: [],
    genre: [],
  });

  // 추가: 선택된 태그
  const [selectedTags, setSelectedTags] = useState({
    race: [],
    theme: [],
    gender: [],
    genre: [],
  });

  // 추가: DB 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 추가: 4개 테이블에서 태그 목록 조회
  useEffect(() => {
    if (!isOpen) return;

    const fetchTags = async () => {
      setIsLoading(true);

      const supabase = createClient();

      const [racesResult, themesResult, gendersResult, genresResult] = await Promise.all([
        supabase.from("races").select("id, name").order("id"),
        supabase.from("themes").select("id, name").order("id"),
        supabase.from("genders").select("id, name").order("id"),
        supabase.from("genres").select("id, name").order("id"),
      ]);

      const results = [racesResult, themesResult, gendersResult, genresResult];

      const error = results.find((result) => result.error)?.error;

      if (error) {
        console.error("태그 목록 조회 실패:", error);
        setIsLoading(false);
        return;
      }

      setTagOptions({
        race: racesResult.data || [],
        theme: themesResult.data || [],
        gender: gendersResult.data || [],
        genre: genresResult.data || [],
      });

      setIsLoading(false);
    };

    fetchTags();
  }, [isOpen]);

  // 추가: ESC 닫기 + 뒤 페이지 스크롤 방지
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 추가: 하나의 아코디언만 열기
  const handleGroupToggle = (groupId) => {
    setOpenGroup((prev) => (prev === groupId ? null : groupId));
  };

  // 추가: 태그 선택 / 선택 해제
  const handleTagToggle = (groupId, tagName) => {
    setSelectedTags((prev) => {
      const currentTags = prev[groupId];

      const nextTags = currentTags.includes(tagName)
        ? currentTags.filter((tag) => tag !== tagName)
        : [...currentTags, tagName];

      return {
        ...prev,
        [groupId]: nextTags,
      };
    });
  };

  // 추가: 선택된 태그 전체 초기화
  const handleReset = () => {
    setSelectedTags({
      race: [],
      theme: [],
      gender: [],
      genre: [],
    });
  };

  // 추가: 목록페이지로 선택값 전달
  const handleApply = () => {
    const params = new URLSearchParams();

    Object.entries(selectedTags).forEach(([key, values]) => {
      if (values.length > 0) {
        // 여러 개 선택한 경우 쉼표로 묶어서 전달
        params.set(key, values.join(","));
      }
    });

    const queryString = params.toString();

    if (queryString) {
      router.push(`/characters?${queryString}`);
    } else {
      router.push("/characters");
    }

    onClose();
  };

  // 추가: 모달 바깥 클릭 시 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modal_backdrop} onMouseDown={handleBackdropClick} role="presentation">
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="더 많은 태그 보기"
      >
        {/* 닫기 */}
        <button
          type="button"
          className={styles.close_button}
          onClick={onClose}
          aria-label="태그 모달 닫기"
        >
          <span className="material-symbols-rounded icon_24" aria-hidden="true">
            close
          </span>
        </button>

        {/* 태그 카테고리 */}
        <div className={styles.tag_groups}>
          {TAG_GROUPS.map((group) => {
            const isExpanded = openGroup === group.id;

            return (
              <div key={group.id} className={styles.tag_group}>
                <button
                  type="button"
                  className={styles.group_button}
                  onClick={() => handleGroupToggle(group.id)}
                  aria-expanded={isExpanded}
                >
                  <span className="kr_caption">{group.label}</span>

                  <span
                    className={`material-symbols-rounded ${styles.group_icon}`}
                    aria-hidden="true"
                  >
                    {isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  </span>
                </button>

                {isExpanded && (
                  <div className={styles.tag_list}>
                    {isLoading ? (
                      <p className={`kr_caption ${styles.loading_text}`}>태그 불러오는 중...</p>
                    ) : (
                      tagOptions[group.id].map((tag) => {
                        const isSelected = selectedTags[group.id].includes(tag.name);

                        return (
                          <Tag
                            key={tag.id}
                            onClick={() => handleTagToggle(group.id, tag.name)}
                            className={isSelected ? styles.tag_selected : styles.modal_tag}
                          >
                            {tag.name}
                          </Tag>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 추가: 하단 버튼 */}
        <div className={styles.modal_actions}>
          <Button type="button" variant="secondary" onClick={handleReset}>
            <span className="kr_body_b">초기화</span>
          </Button>

          <Button type="button" variant="primary" onClick={handleApply}>
            <span className="kr_body_b">적용하기</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default TagModal;
