/**
 * Decision Mirror Recommendation Engine (Rule-based Mock for future Gemini integration)
 */

const recommendationPool = {
  A: [
    "현재 가치관 기준으로 A가 더 적합합니다.",
    "장기 안정성을 고려하면 A 추천입니다.",
    "리스크를 줄이고 싶다면 A가 유리합니다."
  ],
  B: [
    "성장 가능성을 고려하면 B 추천입니다.",
    "도전을 원한다면 B가 적합합니다.",
    "장기 기대값은 B가 더 높습니다."
  ]
};

/**
 * Main abstraction wrapper.
 * This is designed to be easily swapped with the Gemini API in the future.
 */
function generateRecommendation(data, scoreA, scoreB) {
  // Currently calls the mock generator. Can be swapped with:
  // return callGeminiRecommendation(data);
  return getMockRecommendation(data, scoreA, scoreB);
}

/**
 * Rule-based recommendation engine.
 * Combines random elements with smart conditional checks to emulate an AI advice card.
 */
function getMockRecommendation(data, scoreA, scoreB) {
  const winner = scoreA > scoreB ? "A" : "B";
  const pool = recommendationPool[winner];
  const baseMessage = pool[Math.floor(Math.random() * pool.length)];

  // Gather some contextual info
  const q1 = Number(data.quiz[0]) || 3; // Stability
  const q3 = Number(data.quiz[2]) || 3; // Growth/Challenge
  const q5 = Number(data.quiz[4]) || 3; // Risk/Loss aversion
  const q6 = Number(data.quiz[5]) || 3; // Stress

  let personalPrefix = "";
  
  if (winner === "A") {
    if (q1 >= 4 && q5 >= 4) {
      personalPrefix = `당신은 안정성을 중요하게 생각하며(${data.optionA} 선호), 실패에 대한 두려움도 비교적 큰 상태입니다. 리스크를 안고 무리한 길을 가기보다는 안전장치가 준비된 길을 갈 때 심적 평온을 얻을 수 있습니다. `;
    } else if (q1 >= 4) {
      personalPrefix = `탄탄한 기반과 장기적인 안정성이 최우선 순위인 것으로 보입니다. `;
    } else {
      personalPrefix = `종합적인 밸런스를 고려했을 때, 리스크가 적고 예측 가능한 결과가 예상되는 선택이 지금은 유리해 보입니다. `;
    }
  } else { // Winner is B
    if (q3 >= 4) {
      personalPrefix = `당신은 새로운 도전과 성장의 가능성(${data.optionB} 선호)에 크게 이끌리는 성향입니다. 다소의 리스크가 따르더라도 주체적인 성과와 경험을 얻을 수 있는 선택에 마음이 기울고 있습니다. `;
    } else if (q1 <= 2) {
      personalPrefix = `정체된 환경보다는 유연하고 변화무쌍한 환경을 상대적으로 선호하는 가치관이 돋보입니다. `;
    } else {
      personalPrefix = `현재 가치관 지표상 기회비용과 성장 잠재력에 더 큰 비중을 두고 있습니다. `;
    }
  }

  // Bias advisory text
  let biasAdvice = "";
  const biases = analyzeBias(data.quiz);
  if (biases.length > 0) {
    if (q6 >= 4) {
      biasAdvice = ` 단, 현재 스트레스 지수가 높아 방어적이거나 과도하게 회피적인 선택을 유도했을 가능성이 있습니다. 머리를 식힌 후 재점검해보시길 강력 권장합니다.`;
    } else if (q4 >= 4) {
      biasAdvice = ` 단, 주변 사람들의 시선이나 사회적 고정관념에 지나치게 얽매여 본인의 실제 욕구를 누르고 있지는 않은지 자문해볼 필요가 있습니다.`;
    } else if (q5 >= 4) {
      biasAdvice = ` 단, 단순히 잃는 것이 싫어서 더 큰 가능성을 포기하려고 하는 '손실 회피' 심리가 작동하고 있는지 꼼꼼히 점검해보세요.`;
    }
  }

  return {
    winner,
    title: `Decision Mirror가 추천하는 방향은 [${winner === "A" ? data.optionA : data.optionB}]입니다.`,
    text: `${personalPrefix}${baseMessage}${biasAdvice}`
  };
}

// Attach to window scope
window.generateRecommendation = generateRecommendation;
