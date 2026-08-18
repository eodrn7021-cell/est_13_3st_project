"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./CharacterDetail.module.scss";

// 한글/영문 감지하여 적절한 Typography 클래스 반환하는 헬퍼 함수
function getFontClass(text, krClass, enClass) {
  const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text || "");
  return isKorean ? krClass : enClass;
}

export default function CharacterDetail({
  character,
  onRegenerateImage,
  onSaveImage,
  isRegenerating = false,
  isGeneratingMode = false,
  isOwner = false,
  currentUser = null,
  comments = [],
  onAddComment,
  isSubmittingComment = false,
  activeNav = "character",
}) {
  const [newContent, setNewContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    setNewContent("");
  }, [activeNav]);

  const COMMENTS_PER_PAGE = 4;
  const totalPages = Math.max(1, Math.ceil(comments.length / COMMENTS_PER_PAGE));
  
  const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
  const paginatedComments = comments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newContent.trim() || !onAddComment) return;

    onAddComment(newContent.trim());
    setNewContent("");
  };

  const handleSaveImage = async () => {
    if (onSaveImage) {
      onSaveImage();
      return;
    }
    if (!character?.image_url) return;
    try {
      const response = await fetch(character.image_url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${character?.name || "character"}_image.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("이미지 다운로드 예외 발생, 새 창으로 열기:", err);
      window.open(character.image_url, "_blank");
    }
  };

  const isWorldMode = activeNav === "world";
  const world = character?.worlds;

  const name = isWorldMode ? (world?.name || world?.title || "무명 세계관") : (character?.name || "무명");
  
  let displayTags = [];
  let summaryText = "";

  if (isWorldMode && world) {
    displayTags = [
      { label: "테마", value: world.theme },
      { label: "장르", value: world.genre },
    ];
    summaryText = [
      world.myth_history && `[창조 신화 & 역사]\n${world.myth_history}`,
      world.religion_culture && `[종교, 문화, 사상]\n${world.religion_culture}`,
      world.social_structure && `[사회 구조 / 계층]\n${world.social_structure}`,
      world.climate_landmarks && `[기후 특성 & 랜드 마크]\n${world.climate_landmarks}`,
      world.resource_currency && `[자원 & 화폐]\n${world.resource_currency}`,
    ].filter(Boolean).join("\n\n") || "세계관 설명이 없습니다.";
  } else {
    displayTags = [
      { label: "종족", value: character?.race },
      { label: "성별", value: character?.gender },
      { label: "나이", value: character?.age },
      { label: "직업 / 지위", value: character?.job_role },
    ];
    summaryText = character?.summary_text || character?.background_story || "캐릭터 설명이 없습니다.";
  }

  // 우측 카드 태그 목록
  const rawTags = isWorldMode 
    ? [
        character?.worlds?.theme,
        character?.worlds?.genre,
      ].filter(Boolean)
    : [
        character?.race,
        character?.job_role,
        character?.gender,
        character?.age ? `${character?.age}세` : null,
      ].filter(Boolean);

  const rightTags = rawTags
    .flatMap((tag) => tag.split(","))
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className={styles.container2Col}>
      {/* 좌측 상세 정보 및 댓글 카드 */}
      <div className={styles.leftCard}>
        {/* 상단 헤더: person 구글 머티리얼 아이콘 (icon_36) + 캐릭터 이름 (Card Title) */}
        <div className={styles.headerSection}>
          <span className={`material-symbols-outlined icon_36 ${styles.personIcon}`}>
            {isWorldMode ? "history_edu" : "person"}
          </span>
          <h2 className={`${getFontClass(name, "kr_card_title", "en_m_title")} ${styles.characterName}`}>
            {name}
          </h2>
        </div>

        {/* 기본 정보 알약 태그 그룹 (Body 사용) */}
        <div className={styles.tagGroup}>
          {displayTags.map((tag, idx) => tag.value ? (
            <div key={idx} className={`${getFontClass(tag.value, "kr_body", "en_body")} ${styles.infoTag}`}>
              {tag.label} : {tag.value}
            </div>
          ) : null)}
        </div>

        {/* 캐릭터 요약 본문 (Body 150) */}
        <div className={styles.summarySection}>
          <span className={`kr_body ${styles.summaryLabel}`}>{isWorldMode ? "세계관 요약 :" : "캐릭터 요약 :"}</span>
          <div className={`${styles.summaryBox} ${getFontClass(summaryText, "kr_body_150", "en_body")}`} style={{ whiteSpace: "pre-wrap" }}>
            {summaryText}
          </div>
        </div>

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 코멘트 영역 */}
        <div className={styles.commentSection}>
          {/* 코멘트 문구 (EN/Body) */}
          <h3 className={`en_body ${styles.commentTitle}`}>Comment</h3>

          {/* 코멘트 리스트 */}
          <div className={styles.commentList}>
            {paginatedComments.length > 0 ? (
              paginatedComments.map((comment) => (
                <div key={comment.id} className={styles.commentCard}>
                  <span
                    className={`${getFontClass(
                      comment.author,
                      "kr_caption",
                      "en_caption"
                    )} ${styles.commentAuthor}`}
                  >
                    작성자 : {comment.author}
                  </span>
                  <p
                    className={`${getFontClass(
                      comment.content,
                      "kr_body",
                      "en_body"
                    )} ${styles.commentContent}`}
                  >
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <div className={styles.emptyComment}>
                <span className="kr_body">아직 코멘트가 없습니다.</span>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <span className="material-symbols-rounded icon_20">chevron_left</span>
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let startPage = Math.max(1, currentPage - 2);
                if (startPage + 4 > totalPages) {
                  startPage = Math.max(1, totalPages - 4);
                }
                const pageNum = startPage + i;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`${styles.pageBtn} ${currentPage === pageNum ? styles.activePage : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="material-symbols-rounded icon_20">chevron_right</span>
              </button>
            </div>
          )}

          {/* 새 코멘트 작성 폼 */}
          <form onSubmit={handleAddComment} className={styles.commentForm}>
            <div className={styles.formInputGroup}>
              <input
                type="text"
                value={currentUser?.profile?.nickname || ""}
                className={`kr_caption ${styles.authorInput}`}
                disabled
                placeholder={currentUser ? "" : "로그인 후 작성 가능"}
                style={{ backgroundColor: "transparent", color: "white" }}
              />
              <button
                type="submit"
                className={`kr_body ${styles.submitBtn}`}
                disabled={isSubmittingComment || !newContent.trim()}
              >
                {isSubmittingComment ? "등록 중..." : "등록"}
              </button>
            </div>
            <textarea
              placeholder="코멘트를 입력하세요..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className={`kr_body ${styles.contentInput}`}
            />
          </form>
        </div>
      </div>

      {/* 우측 AI 캐릭터 이미지 및 액션 카드 (Figma 시안 1, 2, 3 반영) */}
      <div className={styles.rightCard}>
        {/* 이미지 출력 박스 (W: 468, H: 591.16, Radius: 20) */}
        <div className={styles.imageDisplayContainer}>
          {isRegenerating ? (
            <div className={styles.generatingStateBox}>
              <span className={`material-symbols-outlined icon_36 ${styles.spin}`}>
                sync
              </span>
              <span className="kr_m_title">이미지 생성 중...</span>
            </div>
          ) : character?.image_url ? (
            <Image
              src={character.image_url}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className={styles.aiCharacterImage}
              priority
            />
          ) : (
            <div className={styles.placeholderStateBox}>
              <span className="material-symbols-outlined icon_48">person</span>
              <span className="kr_m_title">이미지 없음</span>
            </div>
          )}
        </div>

        {/* 하단 태그 (Figma 시안 1번: H 60, Radius 30, Gap 10, Padding 16 0, M Title 폰트) */}
        <div className={styles.rightTagGroup}>
          {rightTags.map((tagText, idx) => (
            <div
              key={idx}
              className={`${styles.rightTagCapsule} ${getFontClass(tagText, "kr_m_title", "en_m_title")}`}
            >
              {tagText}
            </div>
          ))}
        </div>

        {/* 하단 버튼 그룹 (이미지 재생성, 이미지 저장) */}
        {isOwner && (
          <div className={styles.actionButtonGroup}>
            <button
              type="button"
              className={styles.regenerateActionButton}
              onClick={onRegenerateImage}
              disabled={isRegenerating}
            >
              <span className="kr_body_b">
                {isRegenerating ? "생성 중..." : "이미지 재생성"}
              </span>
            </button>

            <button
              type="button"
              className={styles.saveActionButton}
              onClick={handleSaveImage}
              disabled={isRegenerating || !character?.image_url}
            >
              <span className="kr_body_b">이미지 저장</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
