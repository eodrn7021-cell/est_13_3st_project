"use client";

import { useState } from "react";
import styles from "./CharacterDetail.module.scss";

// 한글/영문 감지하여 적절한 Typography 클래스 반환하는 헬퍼 함수
function getFontClass(text, krClass, enClass) {
  const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text || "");
  return isKorean ? krClass : enClass;
}

export default function CharacterDetail({
  character,
  initialComments = [],
  onRegenerateImage,
  onSaveImage,
  isRegenerating = false,
  isGeneratingMode = false,
  isOwner = false,
}) {
  // 기본 더미 코멘트 (시안 참고)
  const defaultComments = [
    { id: 1, author: "지나가는 관찰자", content: "와 너무 잘만드셨다." },
    { id: 2, author: "이쁜거 보면 짓는 사람", content: "왈! 왈! 왈!" },
    { id: 3, author: "||||||||", content: "언니 완전 내 취향." },
  ];

  const [comments, setComments] = useState(
    initialComments.length > 0 ? initialComments : defaultComments
  );
  const [newAuthor, setNewAuthor] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      author: newAuthor.trim() || "익명 관찰자",
      content: newContent.trim(),
    };

    setComments((prev) => [newCommentObj, ...prev]);
    setNewAuthor("");
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

  const name = character?.name || "무명";
  const race = character?.race;
  const gender = character?.gender;
  const age = character?.age;
  const jobRole = character?.job_role;
  const summaryText =
    character?.summary ||
    character?.background_story ||
    "캐릭터 설명이 없습니다.";

  // 우측 카드 태그 목록 (존재하는 값만 필터링)
  const rightTags = [race, jobRole].filter(Boolean);

  return (
    <div className={styles.container2Col}>
      {/* 좌측 상세 정보 및 댓글 카드 */}
      <div className={styles.leftCard}>
        {/* 상단 헤더: person 구글 머티리얼 아이콘 (icon_36) + 캐릭터 이름 (Card Title) */}
        <div className={styles.headerSection}>
          <span className={`material-symbols-outlined icon_36 ${styles.personIcon}`}>
            person
          </span>
          <h2 className={`${getFontClass(name, "kr_card_title", "en_m_title")} ${styles.characterName}`}>
            {name}
          </h2>
        </div>

        {/* 기본 정보 알약 태그 그룹 (Body 사용) */}
        <div className={styles.tagGroup}>
          {race && (
            <div className={`${getFontClass(race, "kr_body", "en_body")} ${styles.infoTag}`}>
              종족 : {race}
            </div>
          )}
          {gender && (
            <div className={`${getFontClass(gender, "kr_body", "en_body")} ${styles.infoTag}`}>
              성별 : {gender}
            </div>
          )}
          {age && (
            <div className={`${getFontClass(age, "kr_body", "en_body")} ${styles.infoTag}`}>
              나이 : {age}
            </div>
          )}
          {jobRole && (
            <div className={`${getFontClass(jobRole, "kr_body", "en_body")} ${styles.infoTag}`}>
              직업 / 지위 : {jobRole}
            </div>
          )}
        </div>

        {/* 캐릭터 요약 본문 (Body 150) */}
        <div className={styles.summarySection}>
          <span className={`kr_body ${styles.summaryLabel}`}>캐릭터 요약 :</span>
          <div className={`${styles.summaryBox} ${getFontClass(summaryText, "kr_body_150", "en_body")}`}>
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
            {comments.map((comment) => (
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
            ))}
          </div>

          {/* 새 코멘트 작성 폼 (소유자가 아닐 때만 표시) */}
          {!isOwner && (
            <form onSubmit={handleAddComment} className={styles.commentForm}>
              <div className={styles.formInputGroup}>
                <input
                  type="text"
                  placeholder="작성자 이름 (선택)"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className={`kr_caption ${styles.authorInput}`}
                />
                <button type="submit" className={`kr_body ${styles.submitBtn}`}>
                  등록
                </button>
              </div>
              <textarea
                placeholder="코멘트를 입력하세요..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className={`kr_body ${styles.contentInput}`}
              />
            </form>
          )}
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
            <img
              src={character.image_url}
              alt={name}
              className={styles.aiCharacterImage}
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
      </div>
    </div>
  );
}
