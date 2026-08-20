import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, fieldName, isWorldMode } = body;

    if (!fieldName) {
      return NextResponse.json({ error: "fieldName is required" }, { status: 400 });
    }

    const alanKey = process.env.ALAN_CLIENT_KEY;
    if (!alanKey) {
      return NextResponse.json({ error: "ALAN_CLIENT_KEY is missing" }, { status: 500 });
    }

    // 작성된 기본 정보 모으기
    const contextParts = [];
    if (isWorldMode) {
      if (formData.title) contextParts.push(`세계관 이름: ${formData.title}`);
      if (formData.theme) contextParts.push(`테마: ${formData.theme}`);
      if (formData.genre) contextParts.push(`장르: ${formData.genre}`);
    } else {
      if (formData.name) contextParts.push(`이름: ${formData.name}`);
      if (formData.race) contextParts.push(`종족: ${formData.race}`);
      if (formData.gender) contextParts.push(`성별: ${formData.gender}`);
      if (formData.age) contextParts.push(`나이: ${formData.age}`);
      if (formData.job_role) contextParts.push(`직업/역할: ${formData.job_role}`);
    }

    const contextStr = contextParts.length > 0 
      ? `현재까지 작성된 정보는 다음과 같습니다.\n${contextParts.join(", ")}\n\n`
      : "";

    // 필드별 프롬프트 구성
    let targetDesc = "";
    if (isWorldMode) {
      switch (fieldName) {
        case "myth_history": targetDesc = "이 세계가 처음 어떻게 탄생했는지, 그리고 현재 시대에 이르기까지 가장 중요했던 전쟁이나 역사적 대사건"; break;
        case "religion_culture": targetDesc = "사람들이 주로 믿는 신앙이나 종교, 특별한 명절과 축제, 혹은 사회를 지배하는 핵심 가치관이나 금기사항"; break;
        case "social_structure": targetDesc = "왕족, 귀족, 평민, 노예 등 신분 제도가 어떻게 나뉘어 있는지, 권력은 누가 쥐고 있으며 계층 간의 갈등"; break;
        case "climate_landmarks": targetDesc = "사막, 빙하, 마법 오염 구역 등 독특한 자연환경과 기후, 세계에서 가장 유명한 유적지나 상징적인 건축물(랜드마크)"; break;
        case "resource_currency": targetDesc = "마력석, 희귀 광물 등 이 세계에서 특별하게 취급되는 핵심 자원과, 사람들이 일상적으로 물건을 사고팔 때 사용하는 화폐 단위"; break;
        default: targetDesc = "설명 내용";
      }
    } else {
      switch (fieldName) {
        case "background_story": targetDesc = "캐릭터가 살아온 삶의 궤적, 주요 사건, 현재 직면한 상황"; break;
        case "appearance": targetDesc = "키, 체형, 머리색, 눈동자 색, 흉터나 점, 즐겨 입는 옷차림 등 눈에 띄는 특징"; break;
        case "personality": targetDesc = "캐릭터의 평소 성격이나 가치관, 행동패턴, 취향 등 몰입 요소"; break;
        case "abilities": targetDesc = "다룰 수 있는 무기, 고유한 마법 능력, 뛰어난 지능 등 캐릭터의 특별한 전투적/비전투적 능력"; break;
        case "relationships": 
          const tName = body.targetName || "대상 인물";
          targetDesc = `이 캐릭터와 대상 인물('${tName}') 간의 관계와 그에 얽힌 사연`; 
          break;
        default: targetDesc = "설명 내용";
      }
    }

    const promptText = `당신은 판타지/웹소설 설정 전문 작가입니다. ${contextStr}이 정보를 바탕으로 '${targetDesc}'에 대한 내용을 창의적이고 몰입감 있게 작성해 주세요. 3~4문장 정도의 길이로 작성하고, 불필요한 서론이나 인사말 없이 내용만 바로 작성해 주세요.`;

    const endpoint = `https://kdt-api-function.azurewebsites.net/api/v1/question?client_id=${alanKey}&content=${encodeURIComponent(promptText)}`;

    const res = await fetch(endpoint, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Alan API Error: ${res.status} ${res.statusText}`);
    }

    const resData = await res.json();
    let answer = resData?.answer?.trim() || "";
    
    if (answer && answer.startsWith('"') && answer.endsWith('"')) {
      answer = answer.substring(1, answer.length - 1);
    }
    answer = answer.replace(/\*\*/g, "");

    return NextResponse.json({ success: true, text: answer });
  } catch (err) {
    return NextResponse.json({ error: "생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
