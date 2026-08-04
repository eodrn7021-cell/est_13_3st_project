"use client";

import { useState } from "react";
import Textarea from "@/components/form/Textarea/Textarea";
import Select, { SelectInput } from "@/components/form/Select/Select";
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

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
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

  return (
    <form className={`${styles.formContainer} ${className}`.trim()} style={style} onSubmit={handleSubmit}>
      {/* 
        [1번 레이아웃]: 3열 2행 구조
        - 1열 1~2행: 기본 정보 * (통합 카드)
        - 2~3열 1행: 배경 스토리 * (2개 열 병합)
        - 2열 2행: 외형적 특징 *
        - 3열 2행: 성격 및 성향 *
      */}
      <div className={styles.sectionOne}>
        {/* 기본 정보 카드 (1열 1~2행 차지) */}
        <div className={styles.basicInfoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.headerIcon}>
              <EditNoteIcon />
            </span>
            <h3 className={styles.headerTitle}>기본 정보 *</h3>
          </div>

          <div className={styles.divider} />

          <div className={styles.fieldList}>
            <SelectInput
              placeholder="이름"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <Select
              fieldTitle="종족"
              options={RACE_OPTIONS}
              value={formData.race}
              onChange={(val) => handleChange("race", val)}
            />
            <Select
              fieldTitle="성별"
              options={GENDER_OPTIONS}
              value={formData.gender}
              onChange={(val) => handleChange("gender", val)}
            />
            <SelectInput
              placeholder="나이"
              value={formData.age}
              onChange={(e) => handleChange("age", e.target.value)}
            />
            <SelectInput
              placeholder="직업"
              value={formData.job}
              onChange={(e) => handleChange("job", e.target.value)}
            />
          </div>
        </div>

        {/* 배경 스토리 * (2~3열 1행 차지) */}
        <div className={styles.backgroundStoryCard}>
          <Textarea
            title="배경 스토리 *"
            rightAction={<ShareIcon />}
            placeholder="고요한 성역을 지키며 세상의 운명에 신비로운 빛을 비추는 은빛 성녀입니다. 2,000년이라는 기나긴 세월을 살아오며 빛과 어둠의 경계에서 세계의 균형을 수호하는 막중한 임무를 홀로 견뎌내고 있습니다."
            value={formData.backgroundStory}
            onChange={(e) => handleChange("backgroundStory", e.target.value)}
            containerStyle={{ height: "100%" }}
            inputStyle={{ minHeight: "130px", flex: 1 }}
          />
        </div>

        {/* 외형적 특징 * (2열 2행 차지) */}
        <div className={styles.appearanceCard}>
          <Textarea
            title="외형적 특징 *"
            rightAction={<ShareIcon />}
            placeholder="마치 달빛처럼 길게 흘러내리는 은빛 머리카락과, 심연의 바닥까지 꿰뚫어 보는 듯한 신비로운 보랏빛 눈동자를 지녔습니다."
            value={formData.appearance}
            onChange={(e) => handleChange("appearance", e.target.value)}
            containerStyle={{ height: "100%" }}
            inputStyle={{ minHeight: "120px", flex: 1 }}
          />
        </div>

        {/* 성격 및 성향 * (3열 2행 차지) */}
        <div className={styles.personalityCard}>
          <Textarea
            title="성격 및 성향 *"
            rightAction={<ShareIcon />}
            placeholder="캐릭터의 평소 성격이나 가치관, 장단점, 독특한 버릇 등을 상세히 적어주세요."
            value={formData.personality}
            onChange={(e) => handleChange("personality", e.target.value)}
            containerStyle={{ height: "100%" }}
            inputStyle={{ minHeight: "120px", flex: 1 }}
          />
        </div>
      </div>

      {/* 
        [2번 레이아웃]: 2열 1행 (반반 50:50) 구조
        - 1열 1행: 능력치
        - 2열 1행: 관련 인물
      */}
      <div className={styles.sectionTwo}>
        {/* 능력치 (1열 1행) */}
        <div className={styles.abilitiesCard}>
          <Textarea
            title="능력치"
            rightAction={<ShareIcon />}
            placeholder="2,000년의 세월 동안 축적된 방대한 지식과 뛰어난 마법..."
            value={formData.abilities}
            onChange={(e) => handleChange("abilities", e.target.value)}
            inputStyle={{ minHeight: "120px" }}
          />
        </div>

        {/* 관련 인물 (2열 1행) */}
        <div className={styles.relatedCharactersCard}>
          <Textarea
            title="관련 인물"
            rightAction={<ShareIcon />}
            placeholder="관련 캐릭터의 이름과 그 캐릭터와의 관계(가족, 조력자, 숙적 등), 두 사람 사이에 있었던 특별한 사건 등을 자유롭게 작성해주세요."
            value={formData.relatedCharacters}
            onChange={(e) => handleChange("relatedCharacters", e.target.value)}
            inputStyle={{ minHeight: "120px" }}
          />
        </div>
      </div>
    </form>
  );
}
