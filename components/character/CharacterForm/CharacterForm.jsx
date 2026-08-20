"use client";

import { useState, useEffect } from "react";
import Input from "@/components/form/Input/Input";
import Textarea from "@/components/form/Textarea/Textarea";
import Select from "@/components/form/Select/Select";
import { createClient } from "@/lib/supabase/client";
import styles from "./CharacterForm.module.scss";

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
  worldCharacters = [],
  currentCharacterId = null,
  onSubmit,
  onChange,
  className = "",
  style,
}) {
  const [activeSelect, setActiveSelect] = useState(null);
  const [openCard, setOpenCard] = useState("cardOne");
  const [isResponsive, setIsResponsive] = useState(false);

  const [raceOptions, setRaceOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState([]);
  const [themeOptions, setThemeOptions] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const supabase = createClient();
      
      try {
        const { data: racesData } = await supabase.from("races").select("id, name").order("id");
        const { data: gendersData } = await supabase.from("genders").select("id, name").order("id");
        const { data: themesData } = await supabase.from("themes").select("id, name").order("id");
        const { data: genresData } = await supabase.from("genres").select("id, name").order("id");

        if (racesData) setRaceOptions(racesData.map((item) => ({ id: item.id, label: item.name, value: item.name })));
        if (gendersData) setGenderOptions(gendersData.map((item) => ({ id: item.id, label: item.name, value: item.name })));
        if (themesData) setThemeOptions(themesData.map((item) => ({ id: item.id, label: item.name, value: item.name })));
        if (genresData) setGenreOptions(genresData.map((item) => ({ id: item.id, label: item.name, value: item.name })));
      } catch (error) {
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1200px)");
    const handleChange = (e) => {
      setIsResponsive(e.matches);
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({
      ...prev,
      ...initialValues,
      title: initialValues.title || initialValues.name || prev.title,
    }));
  }, [initialValues]);

  const [relationshipMap, setRelationshipMap] = useState({});
  const [activeRelTabId, setActiveRelTabId] = useState(null);

  useEffect(() => {
    // 이제 initialValues.relationships는 객체 형태로 넘어옵니다.
    setRelationshipMap(initialValues.relationships || {});
  }, [initialValues.relationships]);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onChange) {
      onChange(field, value, updated);
    }
  };

  const handleRelationshipChange = (targetId, value) => {
    const newMap = { ...relationshipMap, [targetId]: value };
    setRelationshipMap(newMap);
    handleChange("relationships", newMap);
  };

  const otherCharacters = worldCharacters.filter(c => String(c.id) !== String(currentCharacterId) && !c.isDraft);

  useEffect(() => {
    if (otherCharacters.length > 0) {
      if (!activeRelTabId || !otherCharacters.find(c => String(c.id) === String(activeRelTabId))) {
        // 기존에 작성된 관계가 있는 캐릭터를 우선 선택
        const hasRelChar = otherCharacters.find(c => relationshipMap && relationshipMap[c.id]);
        setActiveRelTabId(hasRelChar ? hasRelChar.id : otherCharacters[0].id);
      }
    } else {
      setActiveRelTabId(null);
    }
  }, [currentCharacterId, otherCharacters.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const [isGeneratingField, setIsGeneratingField] = useState(false);

  const handleAutoGenerate = async (fieldName) => {
    if (isGeneratingField) return;
    
    // 관계 설정인 경우 타겟 인물이 없으면 중단
    if (fieldName === "relationships" && !activeRelTabId) {
      alert("관계 대상을 먼저 선택해주세요.");
      return;
    }
    
    setIsGeneratingField(true);
    let targetName = "";
    let previousValue = "";

    if (fieldName === "relationships") {
      targetName = otherCharacters.find(c => c.id === activeRelTabId)?.name || "";
      previousValue = relationshipMap[activeRelTabId] || "";
      handleRelationshipChange(activeRelTabId, "AI가 내용을 생성하고 있습니다...");
    } else {
      previousValue = formData[fieldName] || "";
      handleChange(fieldName, "AI가 내용을 생성하고 있습니다...");
    }

    try {
      const res = await fetch("/api/characters/auto-generate-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          fieldName,
          isWorldMode: mode === "world",
          targetName
        })
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        // 오류 발생 시 이전 값 복원
        if (fieldName === "relationships") {
          handleRelationshipChange(activeRelTabId, previousValue);
        } else {
          handleChange(fieldName, previousValue);
        }
        alert(result.error || "자동 생성 중 오류가 발생했습니다.");
        return;
      }

      if (result.success && result.text) {
        if (fieldName === "relationships") {
          handleRelationshipChange(activeRelTabId, result.text);
        } else {
          handleChange(fieldName, result.text);
        }
      }
    } catch (error) {
      // 예외 발생 시 이전 값 복원
      if (fieldName === "relationships") {
        handleRelationshipChange(activeRelTabId, previousValue);
      } else {
        handleChange(fieldName, previousValue);
      }
      alert("서버 연결 처리 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingField(false);
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
                      disabled={isReadOnly}
                    />
                    <Select
                      fieldTitle="테마"
                      options={themeOptions}
                      value={formData.theme}
                      onChange={(val) => handleChange("theme", val)}
                      isOpen={activeSelect === "theme"}
                      onToggle={(nextState) => setActiveSelect(nextState ? "theme" : null)}
                      disabled={isReadOnly}
                    />
                    <Select
                      fieldTitle="장르"
                      options={genreOptions}
                      value={formData.genre}
                      onChange={(val) => handleChange("genre", val)}
                      isOpen={activeSelect === "genre"}
                      onToggle={(nextState) => setActiveSelect(nextState ? "genre" : null)}
                      disabled={isReadOnly}
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
                      options={raceOptions}
                      value={formData.race}
                      onChange={(val) => handleChange("race", val)}
                      isOpen={activeSelect === "race"}
                      onToggle={(nextState) => setActiveSelect(nextState ? "race" : null)}
                      disabled={isReadOnly}
                    />
                    <Select
                      fieldTitle="성별"
                      options={genderOptions}
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
            disabled={isReadOnly}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "cardOne"}
            onToggle={() => toggleCard("cardOne")}
            showActionButton={true}
            onActionButtonClick={() => handleAutoGenerate(isWorldMode ? "myth_history" : "background_story")}
            actionButtonDisabled={isGeneratingField}
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
            disabled={isReadOnly}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "cardTwo"}
            onToggle={() => toggleCard("cardTwo")}
            showActionButton={true}
            onActionButtonClick={() => handleAutoGenerate(isWorldMode ? "religion_culture" : "appearance")}
            actionButtonDisabled={isGeneratingField}
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
            disabled={isReadOnly}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "cardThree"}
            onToggle={() => toggleCard("cardThree")}
            showActionButton={true}
            onActionButtonClick={() => handleAutoGenerate(isWorldMode ? "social_structure" : "personality")}
            actionButtonDisabled={isGeneratingField}
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
            disabled={isReadOnly}
            containerStyle={{ height: "100%" }}
            inputStyle={{ flex: 1 }}
            collapsible={isResponsive}
            isOpen={!isResponsive || openCard === "cardFour"}
            onToggle={() => toggleCard("cardFour")}
            showActionButton={true}
            onActionButtonClick={() => handleAutoGenerate(isWorldMode ? "climate_landmarks" : "abilities")}
            actionButtonDisabled={isGeneratingField}
          />
        </div>

        {/* 카드 5: 관련 인물 또는 자원 & 화폐 */}
        <div className={styles.relatedCharactersCard}>
          {isWorldMode ? (
            <Textarea
              title="자원 & 화폐"
              placeholder="마력석, 희귀 광물 등 이 세계에서 특별하게 취급되는 핵심 자원과, 사람들이 일상적으로 물건을 사고팔 때 사용하는 화폐 단위를 적어주세요."
              value={formData.resource_currency}
              onChange={(e) => handleChange("resource_currency", e.target.value)}
              disabled={isReadOnly}
              containerStyle={{ height: "100%" }}
              inputStyle={{ flex: 1 }}
              collapsible={isResponsive}
              isOpen={!isResponsive || openCard === "cardFive"}
              onToggle={() => toggleCard("cardFive")}
              showActionButton={true}
              onActionButtonClick={() => handleAutoGenerate("resource_currency")}
              actionButtonDisabled={isGeneratingField}
            />
          ) : (
            otherCharacters.length === 0 ? (
              <Textarea
                title="관련 인물"
                placeholder="세계관 소속 캐릭터가 없습니다."
                value="세계관 소속 캐릭터가 없습니다."
                disabled={true}
                containerStyle={{ height: "100%" }}
                inputStyle={{ flex: 1 }}
                collapsible={isResponsive}
                isOpen={!isResponsive || openCard === "cardFive"}
                onToggle={() => toggleCard("cardFive")}
                showActionButton={false}
              />
            ) : (
              <div className={`${styles.splitViewContainer} ${isResponsive && openCard !== 'cardFive' ? styles.closed : ''}`}>
                <div className={styles.splitHeader}>
                  <div 
                    className={`${styles.inputTitle} ${isResponsive ? styles.clickable : ''}`} 
                    onClick={() => isResponsive && toggleCard("cardFive")}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: 0, flex: 1, justifyContent: "flex-start" }}
                  >
                    <span className={styles.icon} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <EditNoteIcon />
                    </span>
                    <span className="kr_body_b" style={{ color: "var(--color-white)", lineHeight: 1.4 }}>관련 인물</span>
                  </div>
                  <button
                    type="button"
                    className={styles.actionButton}
                    aria-label="자동 작성"
                    onClick={() => handleAutoGenerate("relationships")}
                    disabled={isGeneratingField}
                  >
                    <span className="material-symbols-outlined icon_14">
                      auto_awesome
                    </span>
                  </button>
                </div>
                {(!isResponsive || openCard === 'cardFive') && activeRelTabId && (
                  <div className={styles.splitBodyRow}>
                    <div className={styles.splitLeftSelect}>
                      <Select
                        fieldTitle="대상 인물 선택"
                        options={otherCharacters.map(c => ({ id: c.id, label: c.name, value: c.id }))}
                        value={activeRelTabId}
                        onChange={(val) => setActiveRelTabId(val)}
                        isOpen={activeSelect === "relatedCharacter"}
                        onToggle={(nextState) => setActiveSelect(nextState ? "relatedCharacter" : null)}
                      />
                    </div>
                    <div className={styles.splitInputContainer}>
                      <textarea
                        className={`kr_caption ${styles.relTextarea}`}
                        placeholder={`${otherCharacters.find(c => c.id === activeRelTabId)?.name || ''}와의 관계를 적어주세요.`}
                        value={relationshipMap[activeRelTabId] || ""}
                        onChange={(e) => handleRelationshipChange(activeRelTabId, e.target.value)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </form>
  );
}
