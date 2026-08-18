"use client";

import styles from "./HelpModal.module.scss";

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={`material-icons-outlined ${styles.icon}`}>
              help_outline
            </span>
            캐릭터 생성 도움말
          </h2>
          <p className={styles.subtitle}>
            세계관과 캐릭터를 만드는 방법에 대해 안내해 드립니다.
          </p>
        </div>

        <div className={styles.content}>
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
