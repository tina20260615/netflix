/**
 * Decision Mirror Scoring and Bias Logic
 */

/**
 * Calculates the score for both options A and B based on user inputs.
 * @param {Object} data - The decision data.
 * @param {number[]} data.quiz - Array of slider values (1-5) for Q1 to Q6 (0-indexed).
 * @param {string[]} data.prosA - Array of pros for Option A.
 * @param {string[]} data.consA - Array of cons for Option A.
 * @param {string[]} data.prosB - Array of pros for Option B.
 * @param {string[]} data.consB - Array of cons for Option B.
 * @returns {Object} Scores for Option A and B.
 */
function calculateScore(data) {
  let scoreA = 50;
  let scoreB = 50;

  // 1. Pros and Cons Calculations
  if (data.prosA && Array.isArray(data.prosA)) {
    scoreA += data.prosA.length * 8;
  }
  if (data.consA && Array.isArray(data.consA)) {
    scoreA -= data.consA.length * 6;
  }

  if (data.prosB && Array.isArray(data.prosB)) {
    scoreB += data.prosB.length * 8;
  }
  if (data.consB && Array.isArray(data.consB)) {
    scoreB -= data.consB.length * 6;
  }

  // 2. Personal Value Alignment Calculations
  // Quiz values are 1-5, 0-indexed in array (q1 is index 0, etc.)
  const q1 = Number(data.quiz[0]) || 3; // Stability
  const q3 = Number(data.quiz[2]) || 3; // New Challenges

  // Q1 (안정성 중요) 4 이상: scoreA += 10 (안정적인 선택지 A 가정)
  if (q1 >= 4) {
    scoreA += 10;
  }

  // Q3 (새로운 도전 선호) 4 이상: scoreB += 10 (도전적인 선택지 B 가정)
  if (q3 >= 4) {
    scoreB += 10;
  }

  // Keep score within logical limits (e.g. 0 to 100 or keep it open but nice)
  // Let's cap between 0 and 100 for display elegance
  scoreA = Math.max(0, Math.min(100, scoreA));
  scoreB = Math.max(0, Math.min(100, scoreB));

  return { scoreA, scoreB };
}

/**
 * Detects cognitive biases based on the values in the quiz questionnaire.
 * @param {number[]} quiz - Array of answers for Q1-Q6.
 * @returns {Object[]} List of detected biases with title and risk level.
 */
function analyzeBias(quiz) {
  const biases = [];
  
  const q4 = Number(quiz[3]) || 3; // Social pressure
  const q5 = Number(quiz[4]) || 3; // Loss aversion
  const q6 = Number(quiz[5]) || 3; // Stress level

  // Q4 >= 4: 사회적 시선 편향
  if (q4 >= 4) {
    biases.push({
      id: "social-conformity",
      title: "사회적 시선 편향",
      description: "타인의 시선을 많이 의식하여 본인의 진짜 가치관보다는 사회적 평판이나 남들이 좋게 보는 선택을 할 위험이 높습니다.",
      level: "경고"
    });
  }

  // Q5 >= 4: 손실 회피 편향
  if (q5 >= 4) {
    biases.push({
      id: "loss-aversion",
      title: "손실 회피 편향",
      description: "새로운 이득을 얻는 것보다 현재 가진 것을 잃지 않으려는 성향이 강해, 더 나은 기회도 놓칠 수 있습니다.",
      level: "경고"
    });
  }

  // Q6 >= 4: 스트레스 기반 판단 위험
  if (q6 >= 4) {
    biases.push({
      id: "stress-risk",
      title: "스트레스 기반 판단 위험",
      description: "현재 높은 스트레스로 인해 감정적이거나 지나치게 방어적인 판단을 내리고 있을 가능성이 큽니다. 한 걸음 물러나 안정을 먼저 취하는 것을 권장합니다.",
      level: "위험"
    });
  }

  return biases;
}

// Attach functions to window scope to avoid import/export errors on local filesystem
window.calculateScore = calculateScore;
window.analyzeBias = analyzeBias;
