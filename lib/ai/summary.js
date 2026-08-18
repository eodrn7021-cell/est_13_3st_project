export async function generateCharacterSummary(data) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn("OPENAI_API_KEY is not set. Skipping AI summary generation.");
    return null;
  }

  // 사용자가 입력한 데이터에서 의미 있는 정보만 추출하여 프롬프트 작성
  const infoParts = [];
  
  if (data.name) infoParts.push(`이름: ${data.name}`);
  if (data.race) infoParts.push(`종족: ${data.race}`);
  if (data.gender) infoParts.push(`성별: ${data.gender}`);
  if (data.age) infoParts.push(`나이: ${data.age}`);
  if (data.job_role) infoParts.push(`직업/역할: ${data.job_role}`);
  
  if (data.background_story) infoParts.push(`배경스토리: ${data.background_story}`);
  if (data.personality) infoParts.push(`성격: ${data.personality}`);
  if (data.appearance) infoParts.push(`외형: ${data.appearance}`);
  if (data.abilities) infoParts.push(`능력: ${data.abilities}`);
  if (data.relationships && typeof data.relationships === "object") {
    let relStr = "";
    for (const [targetId, desc] of Object.entries(data.relationships)) {
      if (desc && desc.trim()) {
        // AI가 대상을 ID가 아닌 의미로 파악하기는 어렵지만, 적혀있는 관계 내용 자체를 요약에 참고하도록 추가합니다.
        relStr += `- 대상(${targetId}): ${desc.trim()} `;
      }
    }
    if (relStr) {
      infoParts.push(`관계: ${relStr}`);
    }
  } else if (typeof data.relationships === "string" && data.relationships.trim()) {
    infoParts.push(`관계: ${data.relationships}`);
  }

  // 값이 아예 없으면 요약하지 않음
  if (infoParts.length === 0) {
    return null;
  }

  const promptText = `다음은 사용자가 작성한 캐릭터의 프로필 정보입니다:\n\n${infoParts.join("\n")}\n\n이 캐릭터에 대해 매력적이고 간결하게 1~2문장의 한글로 요약해 주세요. 불필요한 인사말이나 서론 없이 바로 요약 내용만 작성해 주세요.`;

  try {
    const alanKey = process.env.ALAN_CLIENT_KEY;
    if (!alanKey) {
      console.warn("ALAN_CLIENT_KEY is not set. Skipping AI summary.");
      return null;
    }

    // 알란 API는 GET 메서드와 queryParam으로 content와 client_id를 받습니다.
    const endpoint = `https://kdt-api-function.azurewebsites.net/api/v1/question?client_id=${alanKey}&content=${encodeURIComponent(promptText)}`;

    const res = await fetch(endpoint, {
      method: 'GET',
    });

    if (!res.ok) {
      console.error("Alan API 요약 요청 실패:", res.status, res.statusText);
      return null;
    }

    const resData = await res.json();
    // 응답 형태: { answer: "요약 내용", references: [] }
    let summary = resData?.answer?.trim();
    
    // 만약 양끝에 따옴표나 불필요한 마크다운 기호가 들어갔다면 제거
    if (summary && summary.startsWith('"') && summary.endsWith('"')) {
      summary = summary.substring(1, summary.length - 1);
    }
    // "밥을 먹고 있습니다." 형식으로 나오는 볼드체 마크다운 등 제거 (선택적)
    summary = summary?.replace(/\*\*/g, "");
    
    return summary || null;
  } catch (error) {
    console.error("AI 요약(Alan) 생성 중 예외 발생:", error);
    return null; // 요약에 실패하더라도 메인 기능이 뻗지 않도록 null 반환
  }
}

export async function generateWorldSummary(data) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn("OPENAI_API_KEY is not set. Skipping AI summary generation.");
    return null;
  }

  const infoParts = [];
  
  if (data.title || data.name) infoParts.push(`세계관 이름: ${data.title || data.name}`);
  if (data.theme) infoParts.push(`테마: ${data.theme}`);
  if (data.genre) infoParts.push(`장르: ${data.genre}`);
  if (data.myth_history) infoParts.push(`창조 신화 & 역사: ${data.myth_history}`);
  if (data.religion_culture) infoParts.push(`종교 & 문화: ${data.religion_culture}`);
  if (data.social_structure) infoParts.push(`사회 구조: ${data.social_structure}`);
  if (data.climate_landmarks) infoParts.push(`기후 & 랜드마크: ${data.climate_landmarks}`);
  if (data.resource_currency) infoParts.push(`자원 & 화폐: ${data.resource_currency}`);

  if (infoParts.length === 0) {
    return null;
  }

  const promptText = `다음은 사용자가 작성한 세계관의 설정 정보입니다:\n\n${infoParts.join("\n")}\n\n이 세계관에 대해 매력적이고 간결하게 1~2문장의 한글로 요약해 주세요. 불필요한 인사말이나 서론 없이 바로 요약 내용만 작성해 주세요.`;

  try {
    const alanKey = process.env.ALAN_CLIENT_KEY;
    if (!alanKey) {
      console.warn("ALAN_CLIENT_KEY is not set. Skipping AI summary.");
      return null;
    }

    const endpoint = `https://kdt-api-function.azurewebsites.net/api/v1/question?client_id=${alanKey}&content=${encodeURIComponent(promptText)}`;

    const res = await fetch(endpoint, {
      method: 'GET',
    });

    if (!res.ok) {
      console.error("Alan API 요약 요청 실패:", res.status, res.statusText);
      return null;
    }

    const resData = await res.json();
    let summary = resData?.answer?.trim();
    
    if (summary && summary.startsWith('"') && summary.endsWith('"')) {
      summary = summary.substring(1, summary.length - 1);
    }
    summary = summary?.replace(/\*\*/g, "");
    
    return summary || null;
  } catch (error) {
    console.error("AI 요약(Alan) 생성 중 예외 발생:", error);
    return null;
  }
}
