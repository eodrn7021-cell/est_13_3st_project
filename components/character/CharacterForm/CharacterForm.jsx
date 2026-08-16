"use client";

import { useState, useEffect } from "react";
import Input from "@/components/form/Input/Input";
import Textarea from "@/components/form/Textarea/Textarea";
import Select from "@/components/form/Select/Select";
import styles from "./CharacterForm.module.scss";

const RACE_OPTIONS = ["인간", "엘프", "드워프", "수인", "마족"];
const GENDER_OPTIONS = ["남성", "여성", "무성"];

const THEME_OPTIONS = ["이세계", "아포칼립스", "스팀펑크", "학원물", "신화/무협", "스페이스 오페라"];
const GENRE_OPTIONS = ["판타지", "SF", "로맨스 판타지", "무협", "현대/어반", "미스터리/스릴러"];

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
  mode = "character",
  initialValues = {},
  isReadOnly = false,
  onSubmit,
  onChange,
  className = "",
  style,
}) {
  const [activeSelect, setActiveSelect] = useState(null);
  const [openCard, setOpenCard] = useState("cardOne");
  const [isResponsive, setIsResponsive] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1200px)");
    const handleChange = (e) => {
      setIsResponsive(e.matches);
    };
    setIsResponsive(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleCard = (cardName) => {
    setOpenCard((prev) => (prev === cardName ? null : cardName));
  };

  const [formData, setFormData] = useState({
    // 캐릭터 전용 필드 (Supabase DB 컬럼명)
    name: initialValues.name || "",
    race: initialValues.race || "",
    gender: initialValues.gender || "",
    age: initialValues.age || "",
    job_role: initialValues.job_role || "",
    background_story: initialValues.background_story || "",
    appearance: initialValues.appearance || "",
    personality: initialValues.personality || "",
    abilities: initialValues.abilities || "",
    relationships: initialValues.relationships || "",

    // 세계관 전용 필드 (Supabase DB 컬럼명)
    title: initialValues.title || initialValues.name || "",
    theme: initialValues.theme || "",
    genre: initialValues.genre || "",
    myth_history: initialValues.myth_history || "",
    religion_culture: initialValues.religion_culture || "",
    social_structure: initialValues.social_structure || "",
    climate_landmarks: initialValues.climate_landmarks || "",
    resource_currency: initialValues.resource_currency || "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...initialValues,
      title: initialValues.title || initialValues.name || prev.title,
    }));
  }, [initialValues]);

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
  const isWorldMode = mode === "world";

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
            <h3 className={`kr_body_b ${styles.headerTitle}`}>
              {isWorldMode ? "기본 정보 *" : "기본 정보 *"}
            </h3>
          </div>

          {isBasicInfoOpen && (
            <>
              <div className={styles.divider} />
              <div className={styles.fieldList}>
                {isWorldMode ? (
                  <>
                    <Input
                      placeholder="세계관 이름"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                    />
                    <Select
                      fieldTitle="테마"
                      options={THEME_OPTIONS}
                      value={formData.theme}
                      onChange={(val) => handleChange("theme", val)}
                      isOpen={activeSelect === "theme"}
                      onToggle={(nextState) => setActiveSelect(nextState ? "theme" : null)}
                    />
                    <Select
                      fieldTitle="장르"
                      options={GENRE_OPTIONS}
                      value={formData.genre}
                      onChange={(val) => handleChange("genre", val)}
                      isOpen={activeSelect === "genre"}
                      onToggle={(nextState) => setActiveSelect(nextState ? "genre" : null)}
                    />
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="이름"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      disabled={isReadOnly}
                    />
                    <Select
                      fieldTitle="종족"
                      options={RACE_OPTIONS}
                      value={formData.race}
                      onChange={(val) => handleChange("race", val)}
                      isOpen={activeSelect === "race"}
                      onToggle={(nextState) => setActiveSelect(nextState ? "race" : null)}
                      disabled={isReadOnly}
                    />
                    <Select
                      fieldTitle="성별"
                      options={GENDER_OPTIONS}
                      value={formData.gender}
                      onChange={(val) => handleChange("gender", val)}
                      isOpen={activeSelect === "gender"}
                      onToggle={(nextState) => setActiveSelect(nextState ? "gender" : null)}
                      disabled={isReadOnly}
                    />
                    <Input
                      placeholder="나이"
                      value={formData.age}
                      onChange={(e) => handleChange("age", e.target.value)}
                      disabled={isReadOnly}
                    />
                    <Input
                      placeholder="직업 / 역할"
                      value={formData.job_role}
                      onChange={(e) => handleChange("job_role", e.target.value)}
                      disabled={isReadOnly}
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* 카드 1: 배경 스토리 또는 창조 신화 & 역사 */}
        <div className={styles.backgroundStoryCard}>
          <Textarea
            title={isWorldMode ? "창조 신화 & 역사" : "배경 스토리 *"}
            placeholder={
              isWorldMode
                ? "이 세계가 처음 어떻게 탄생했는지, 그리고 현재 시대에 이르기까지 가장 중요했던 전쟁이나 역사적 대사건을 적어주세요."
                : "캐릭터가 살아온 삶의 궤적, 주요 사건, 현재 직면한 상황 등을 자세히 적어주세요."
            }
            value={isWorldMode ? formData.myth_history : formData.background_story}
            onChange={(e) => handleChange(isWorldMode ? "myth_history" : "background_story", e.target.value)}
            disabled={!isWorldMode && isReadOnly}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "cardOne"}
            onToggle={() => toggleCard("cardOne")}
          />
        </div>

        {/* 카드 2: 외형적 특징 또는 종교, 문화, 사상 */}
        <div className={styles.appearanceCard}>
          <Textarea
            title={isWorldMode ? "종교, 문화, 사상" : "외형적 특징 *"}
            placeholder={
              isWorldMode
                ? "사람들이 주로 믿는 신앙이나 종교, 특별한 명절과 축제, 혹은 사회를 지배하는 핵심 가치관이나 금기사항을 설명해 주세요."
                : "키, 체형, 머리색, 눈동자 색, 흉터나 점, 즐겨 입는 옷차림 등 눈에 띄는 특징을 묘사해 주세요."
            }
            value={isWorldMode ? formData.religion_culture : formData.appearance}
            onChange={(e) => handleChange(isWorldMode ? "religion_culture" : "appearance", e.target.value)}
            disabled={!isWorldMode && isReadOnly}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "cardTwo"}
            onToggle={() => toggleCard("cardTwo")}
          />
        </div>

        {/* 카드 3: 성격 및 성향 또는 사회 구조 / 계층 */}
        <div className={styles.personalityCard}>
          <Textarea
            title={isWorldMode ? "사회 구조 / 계층" : "성격 및 성향 *"}
            placeholder={
              isWorldMode
                ? "왕족, 귀족, 평민, 노예 등 신분 제도가 어떻게 나뉘어 있는지, 권력은 누가 쥐고 있으며 계층 간의 갈등은 어떠한지 적어주세요."
                : "캐릭터의 평소 성격이나 가치관, 행동패턴, 취향 등 몰입 등을 상세히 적어주세요."
            }
            value={isWorldMode ? formData.social_structure : formData.personality}
            onChange={(e) => handleChange(isWorldMode ? "social_structure" : "personality", e.target.value)}
            disabled={!isWorldMode && isReadOnly}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "cardThree"}
            onToggle={() => toggleCard("cardThree")}
          />
        </div>
      </div>

      <div className={styles.sectionTwo}>
        {/* 카드 4: 능력치 또는 기후 특성 & 랜드 마크 */}
        <div className={styles.abilitiesCard}>
          <Textarea
            title={isWorldMode ? "기후 특성 & 랜드 마크" : "능력치"}
            placeholder={
              isWorldMode
                ? "사막, 빙하, 마법 오염 구역 등 독특한 자연환경과 기후를 묘사하고, 세계에서 가장 유명한 유적지나 상징적인 건축물(랜드마크)을 적어주세요."
                : "다룰 수 있는 무기, 고유한 마법 능력, 뛰어난 지능 등 캐릭터의 특별한 전투적/비전투적 능력을 적어주세요."
            }
            value={isWorldMode ? formData.climate_landmarks : formData.abilities}
            onChange={(e) => handleChange(isWorldMode ? "climate_landmarks" : "abilities", e.target.value)}
            disabled={!isWorldMode && isReadOnly}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "cardFour"}
            onToggle={() => toggleCard("cardFour")}
          />
        </div>

        {/* 카드 5: 관련 인물 또는 자원 & 화폐 */}
        <div className={styles.relatedCharactersCard}>
          <Textarea
            title={isWorldMode ? "자원 & 화폐" : "관련 인물"}
            placeholder={
              isWorldMode
                ? "마력석, 희귀 광물 등 이 세계에서 특별하게 취급되는 핵심 자원과, 사람들이 일상적으로 물건을 사고팔 때 사용하는 화폐 단위를 적어주세요."
                : "가족, 친구, 라이벌, 스승 등 주변 인물들과의 관계와 짧은 서사를 적어주세요."
            }
            value={isWorldMode ? formData.resource_currency : formData.relationships}
            onChange={(e) => handleChange(isWorldMode ? "resource_currency" : "relationships", e.target.value)}
            disabled={!isWorldMode && isReadOnly}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "cardFive"}
            onToggle={() => toggleCard("cardFive")}
          />
        </div>
      </div>
    </form>
  );
}
