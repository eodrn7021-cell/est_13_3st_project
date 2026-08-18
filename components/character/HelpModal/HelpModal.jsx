"use client";

import styles from "./HelpModal.module.scss";

export default function HelpModal({ isOpen, onClose, mode = "create" }) {
  if (!isOpen) return null;

  const isDetailMode = mode === "detail";

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={`material-icons-outlined ${styles.icon}`}>
              help_outline
            </span>
            {isDetailMode ? "캐릭터 상세 도움말" : "캐릭터 생성 도움말"}
          </h2>
          <p className={styles.subtitle}>
            {isDetailMode
              ? "캐릭터 정보를 확인하고 이미지 수정 및 상호작용하는 방법을 안내합니다."
              : "세계관과 캐릭터를 만드는 방법에 대해 안내해 드립니다."}
          </p>
        </div>

        <div className={styles.content}>
          {isDetailMode ? (
            <>
              <div className={styles.section}>
                <h3>
                  <span className="material-icons-outlined">edit_note</span>
                  1. 캐릭터 수정
                </h3>
                <p>
                  작성자 본인이라면 좌측 사이드바의 <strong>'수정'</strong> 버튼을 눌러 캐릭터의 상세 설정과 세계관을 언제든지 다시 편집할 수 있습니다.
                </p>
              </div>

              <div className={styles.section}>
                <h3>
                  <span className="material-icons-outlined">photo_library</span>
                  2. 이전 이미지 선택
                </h3>
                <p>
                  이미지를 여러 번 재생성하셨다면, 좌측 사이드바 하단의 <strong>'사용된 이미지'</strong> 목록에서 과거에 생성했던 이미지를 클릭하여 언제든 다시 불러올 수 있습니다.
                </p>
              </div>

              <div className={styles.section}>
                <h3>
                  <span className="material-icons-outlined">save</span>
                  3. 대표 이미지 저장
                </h3>
                <p>
                  불러온 이전 이미지나 새롭게 재생성한 이미지를 캐릭터의 기본 프로필로 적용하려면, 반드시 우측 하단의 <strong>'이미지 저장'</strong> 버튼을 눌러야 변경사항이 최종 반영됩니다.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={styles.section}>
                <h3>
                  <span className="material-icons-outlined">history_edu</span>
                  1. 세계관 작성
                </h3>
                <p>
                  새로운 캐릭터를 생성하기 전, 캐릭터가 살아갈 <strong>세계관</strong>을 먼저 설정합니다. 
                  장르와 테마를 정하고, 역사나 문화를 구체적으로 작성하면 AI가 더 입체적인 캐릭터 이미지를 생성하는 데 도움을 줍니다. 
                  입력이 막막할 때는 각 항목 우측 상단의 <strong>자동 작성 아이콘(✨)</strong>을 눌러 AI의 도움을 받아보세요.
                </p>
              </div>

              <div className={styles.section}>
                <h3>
                  <span className="material-icons-outlined">person</span>
                  2. 캐릭터 작성
                </h3>
                <p>
                  세계관 작성이 끝났다면 캐릭터의 상세 설정을 작성합니다. 이름, 나이, 외형 등 필수 정보를 입력하세요. 
                  <strong>관련 인물</strong> 항목에서는 같은 세계관 내의 다른 캐릭터를 선택하여 둘 사이의 관계성을 정의할 수도 있습니다.
                </p>
              </div>

              <div className={styles.section}>
                <h3>
                  <span className="material-icons-outlined">check_circle</span>
                  3. 체크 리스트 확인
                </h3>
                <p>
                  좌측 사이드바의 체크 리스트가 모두 파란색으로 활성화되었는지 확인하세요. 
                  필수 항목이 모두 채워져야 <strong>'저장 후 이미지 생성'</strong> 버튼이 활성화됩니다.
                </p>
              </div>
            </>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button type="button" className={styles.confirmBtn} onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
