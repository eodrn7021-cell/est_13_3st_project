"use client";

import { useState } from "react";
import styles from "./WorldSelectModal.module.scss";

export default function WorldSelectModal({
  isOpen,
  worlds = [],
  onSelectNewWorld,
  onSelectExistingWorld,
  onClose,
}) {
  const [selectedType, setSelectedType] = useState("new"); // "new" | "existing"
  const [selectedWorldId, setSelectedWorldId] = useState(
    worlds.length > 0 ? worlds[0].id : ""
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedType === "new") {
      onSelectNewWorld();
    } else {
      const chosenWorld = worlds.find(
        (w) => String(w.id) === String(selectedWorldId)
      );
      if (chosenWorld) {
        onSelectExistingWorld(chosenWorld);
      } else {
        onSelectNewWorld();
      }
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modalBox}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={`material-icons-outlined ${styles.icon}`}>
              auto_awesome
            </span>
            세계관 설정 및 캐릭터 생성
          </h2>
          <p className={styles.subtitle}>
            어떤 세계관에서 새로운 캐릭터를 만드시겠습니까?
            <br />
            기존 세계관을 선택하시면 해당 세계관의 설정 정보가 자동으로 연결됩니다.
          </p>
        </div>

        <div className={styles.optionList}>
          {/* 옵션 1: 새로운 세계관 생성 */}
          <div
            className={`${styles.optionCard} ${
              selectedType === "new" ? styles.selected : ""
            }`}
            onClick={() => setSelectedType("new")}
          >
            <div className={styles.cardTitleRow}>
              <div className={styles.cardLabel}>
                <span className="material-icons-outlined">add_circle_outline</span>
                새로운 세계관에서 생성
              </div>
              <div
                className={`${styles.radio} ${
                  selectedType === "new" ? styles.checked : ""
                }`}
              />
            </div>
            <p className={styles.cardDesc}>
              독자적인 신규 세계관(배경, 역사, 신화 등)을 처음부터 자유롭게 구상하여 작성합니다.
            </p>
          </div>

          {/* 옵션 2: 기존 세계관 선택 */}
          <div
            className={`${styles.optionCard} ${
              selectedType === "existing" ? styles.selected : ""
            }`}
            onClick={() => setSelectedType("existing")}
          >
            <div className={styles.cardTitleRow}>
              <div className={styles.cardLabel}>
                <span className="material-icons-outlined">collections_bookmark</span>
                기존 세계관 선택하여 생성
              </div>
              <div
                className={`${styles.radio} ${
                  selectedType === "existing" ? styles.checked : ""
                }`}
              />
            </div>
            <p className={styles.cardDesc}>
              내가 이전에 만들어 둔 세계관에 새로운 인물(캐릭터)을 추가합니다.
            </p>

            {selectedType === "existing" && (
              <div
                className={styles.worldSelectContainer}
                onClick={(e) => e.stopPropagation()}
              >
                <label className={styles.selectLabel}>내 세계관 목록</label>
                {worlds.length > 0 ? (
                  <select
                    className={styles.selectBox}
                    value={selectedWorldId}
                    onChange={(e) => setSelectedWorldId(e.target.value)}
                  >
                    {worlds.map((world) => (
                      <option key={world.id} value={world.id}>
                        {world.name || world.title || `세계관 #${world.id}`} ({world.theme || "테마 미지정"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className={styles.emptyMsg}>
                    현재 저장된 세계관이 없습니다. 새로운 세계관에서 생성을 선택해주세요.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          {onClose && (
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
          )}
          <button type="button" className={styles.confirmBtn} onClick={handleConfirm}>
            생성 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
