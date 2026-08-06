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
  onSubmit,
  onChange,
  className = "",
  style,
}) {
  const [activeSelect, setActiveSelect] = useState(null);
  const [openCard, setOpenCard] = useState("cardOne");
  const [isResponsive, setIsResponsive] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
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
    mood: initialValues.mood || "",
    myth_history: initialValues.myth_history || "",
    religion_culture: initialValues.religion_culture || "",
    social_structure: initialValues.social_structure || "",
    climate_landmarks: initialValues.climate_landmarks || "",
    resource_currency: initialValues.resource_currency || "",
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
                    <Input
                      placeholder="분위기"
                      value={formData.mood}
                      onChange={(e) => handleChange("mood", e.target.value)}
                    />
                  </>
                ) : (
                  <>
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
                      placeholder="직업 / 역할"
                      value={formData.job_role}
                      onChange={(e) => handleChange("job_role", e.target.value)}
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
                ? "태초에 별빛과 심연이 부딪혀 탄생한 세계, '루미나리스'. 약 2,000년 전, 심연의 문이 열리며 마물들이 쏟아져 나온 대재앙 '황혼의 붕괴'가 일어났습니다. 당시 수많은 종족이 멸망의 위기에 처했으나, 젊은 엘프 마법사였던 엘리안느가 동족들의 희생을 발판 삼아 거대한 마력의 결계를 구축해 대륙을 구원했습니다. 이 사건을 계기로 그녀는 살아있는 전설이자 '성녀'로 추대되었고, 이후 2천 년의 세월 동안 봉인의 중심인 '고요한 성체'에 칩거하며 홀로 세상의 멸망을 막아내고 있는 슬프고도 위대한 역사를 지니고 있습니다."
                : "캐릭터가 살아온 삶의 궤적, 주요 사건, 현재 직면한 상황 등을 자세히 적어주세요."
            }
            value={isWorldMode ? formData.myth_history : formData.background_story}
            onChange={(e) => handleChange(isWorldMode ? "myth_history" : "background_story", e.target.value)}
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
                ? "인격신을 믿지 않고, 세상을 구성하는 '은빛 마력의 흐름' 그 자체를 숭배하는 성류교(星流敎)가 대륙의 유일무이한 국교입니다. 오랜 세월을 사는 엘프들의 지배하에 있어, 감정의 성부른 동요는 곧 마력의 폭주(재앙)를 부른다고 믿습니다. 따라서 '극도의 이성과 침묵'을 최고의 미덕으로 삼으며,"
                : "키, 체형, 머리색, 눈동자 색, 흉터나 점, 즐겨 입는 옷차림 등 눈에 띄는 특징을 묘사해 주세요."
            }
            value={isWorldMode ? formData.religion_culture : formData.appearance}
            onChange={(e) => handleChange(isWorldMode ? "religion_culture" : "appearance", e.target.value)}
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
                ? "신분 제도(예: 귀족과 평민), 정치 체제, 주요 권력 집단 등 사회가 어떤 시스템으로 구성되어 있는지 작성해 주세요."
                : "캐릭터의 평소 성격이나 가치관, 행동패턴, 취향 등 몰입 등을 상세히 적어주세요."
            }
            value={isWorldMode ? formData.social_structure : formData.personality}
            onChange={(e) => handleChange(isWorldMode ? "social_structure" : "personality", e.target.value)}
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
                ? "전반적인 날씨와 지형적 특징, 그리고 이 세계를 대표하는 상징적인 장소나 거대한 건축물을 묘사해 주세요."
                : "다룰 수 있는 무기, 고유한 마법 능력, 뛰어난 지능 등 캐릭터의 특별한 전투적/비전투적 능력을 적어주세요."
            }
            value={isWorldMode ? formData.climate_landmarks : formData.abilities}
            onChange={(e) => handleChange(isWorldMode ? "climate_landmarks" : "abilities", e.target.value)}
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
                ? "심연의 기운과 엘프의 마력이 부딪히며 생성된 마력의 결정체, '루나리움(보랏빛 영석)'이 가장 가치 있는 자원이자 핵심 화폐입니다. 이 광석은 상처를 치유하거나 강력한 마법을 증폭시키는 매개체로 사용되며, 순도가 높고 짙은 보랏빛을 띌수록 가치가 천정부지로 솟습니다. 하층민들은 철이나 구리 동전을 사용한다."
                : "가족, 친구, 라이벌, 스승 등 주변 인물들과의 관계와 짧은 서사를 적어주세요."
            }
            value={isWorldMode ? formData.resource_currency : formData.relationships}
            onChange={(e) => handleChange(isWorldMode ? "resource_currency" : "relationships", e.target.value)}
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
