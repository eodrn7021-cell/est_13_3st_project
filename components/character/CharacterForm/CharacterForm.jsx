"use client";

import { useState, useEffect } from "react";
import Input from "@/components/form/Input/Input";
import Textarea from "@/components/form/Textarea/Textarea";
import Select from "@/components/form/Select/Select";
import styles from "./CharacterForm.module.scss";

const RACE_OPTIONS = ["인간", "엘프", "드워프", "수인", "마족"];
const GENDER_OPTIONS = ["남성", "여성", "무성"];

function EditNoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="36"
      height="36"
      aria-hidden="true"
    >
      <path d="M3 10h11v2H3zm0-4h11v2H3zm0 8h7v2H3zm15.01-3.13l1.41-1.41c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-1.41 1.41-2.12-2.12zm-.71.71l-5.3 5.3V18h2.12l5.3-5.3-2.12-2.12z" />
    </svg>
  );
}

export default function CharacterForm({
  initialValues = {},
  onSubmit,
  onChange,
  className = "",
  style,
}) {
  const [activeSelect, setActiveSelect] = useState(null);
  const [openCard, setOpenCard] = useState("backgroundStory");
  const [isResponsive, setIsResponsive] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsResponsive(window.innerWidth < 1920);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const toggleCard = (cardName) => {
    setOpenCard((prev) => (prev === cardName ? null : cardName));
  };

  const [formData, setFormData] = useState({
    name: initialValues.name || "",
    race: initialValues.race || "",
    gender: initialValues.gender || "",
    age: initialValues.age || "",
    job: initialValues.job || "",
    backgroundStory: initialValues.backgroundStory || "",
    appearance: initialValues.appearance || "",
    personality: initialValues.personality || "",
    abilities: initialValues.abilities || "",
    relatedCharacters: initialValues.relatedCharacters || "",
  });

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onChange) {
      onChange(field, value, updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const isBasicInfoOpen = !isResponsive || openCard === "basicInfo";

  return (
    <form className={`${styles.formContainer} ${className}`.trim()} style={style} onSubmit={handleSubmit}>
      <div className={styles.sectionOne}>
        {/* 기본 정보 카드 */}
        <div className={`${styles.basicInfoCard} ${isResponsive && !isBasicInfoOpen ? styles.closed : ""}`}>
          <div
            className={`${styles.cardHeader} ${isResponsive ? styles.clickable : ""}`}
            onClick={() => isResponsive && toggleCard("basicInfo")}
          >
            <span className={styles.headerIcon}>
              <EditNoteIcon />
            </span>
            <h3 className={`kr_body_b ${styles.headerTitle}`}>기본 정보 *</h3>
          </div>

          {isBasicInfoOpen && (
            <>
              <div className={styles.divider} />
              <div className={styles.fieldList}>
                <Input
                  placeholder="이름"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <Select
                  fieldTitle="종족"
                  options={RACE_OPTIONS}
                  value={formData.race}
                  onChange={(val) => handleChange("race", val)}
                  isOpen={activeSelect === "race"}
                  onToggle={(nextState) => setActiveSelect(nextState ? "race" : null)}
                />
                <Select
                  fieldTitle="성별"
                  options={GENDER_OPTIONS}
                  value={formData.gender}
                  onChange={(val) => handleChange("gender", val)}
                  isOpen={activeSelect === "gender"}
                  onToggle={(nextState) => setActiveSelect(nextState ? "gender" : null)}
                />
                <Input
                  placeholder="나이"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                />
                <Input
                  placeholder="직업"
                  value={formData.job}
                  onChange={(e) => handleChange("job", e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* 배경 스토리 * */}
        <div className={styles.backgroundStoryCard}>
          <Textarea
            title="배경 스토리 *"
            placeholder="고요를 상징하며 지켜온 세상의 서쪽에 신비로운 성물 비추는..."
            value={formData.backgroundStory}
            onChange={(e) => handleChange("backgroundStory", e.target.value)}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "backgroundStory"}
            onToggle={() => toggleCard("backgroundStory")}
          />
        </div>

        {/* 외형적 특징 * */}
        <div className={styles.appearanceCard}>
          <Textarea
            title="외형적 특징 *"
            placeholder="마치 질풍처럼 짙게 흩날리는 검은 머리카락..."
            value={formData.appearance}
            onChange={(e) => handleChange("appearance", e.target.value)}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "appearance"}
            onToggle={() => toggleCard("appearance")}
          />
        </div>

        {/* 성격 및 성향 * */}
        <div className={styles.personalityCard}>
          <Textarea
            title="성격 및 성향 *"
            placeholder="캐릭터의 평소 성격이나 가치관, 행동패턴, 취향 등 몰입 등을 상세히 적어주세요."
            value={formData.personality}
            onChange={(e) => handleChange("personality", e.target.value)}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "personality"}
            onToggle={() => toggleCard("personality")}
          />
        </div>
      </div>

      <div className={styles.sectionTwo}>
        {/* 능력치 */}
        <div className={styles.abilitiesCard}>
          <Textarea
            title="능력치"
            placeholder="2,000년의 세월 동안 축적된 방대한 지식과 뛰어난 마법..."
            value={formData.abilities}
            onChange={(e) => handleChange("abilities", e.target.value)}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "abilities"}
            onToggle={() => toggleCard("abilities")}
          />
        </div>

        {/* 관련 인물 */}
        <div className={styles.relatedCharactersCard}>
          <Textarea
            title="관련 인물"
            placeholder="관련 캐릭터의 이름과 그 캐릭터와의 관계(가족, 조력자, 숙적 등), 두 사람 사이에 있었던 특별한 사건 등을 자유롭게 작성해주세요."
            value={formData.relatedCharacters}
            onChange={(e) => handleChange("relatedCharacters", e.target.value)}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "relatedCharacters"}
            onToggle={() => toggleCard("relatedCharacters")}
          />
        </div>
      </div>
    </form>
  );
}
