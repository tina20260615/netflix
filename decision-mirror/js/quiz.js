/**
 * Decision Mirror Quiz Definitions
 */

const quizQuestions = [
  {
    id: "q1",
    text: "안정성이 중요한가요?",
    minLabel: "전혀 아니다",
    maxLabel: "매우 중요",
    dimension: "stability"
  },
  {
    id: "q2",
    text: "높은 보상이 중요한가요?",
    minLabel: "전혀 아니다",
    maxLabel: "매우 중요",
    dimension: "reward"
  },
  {
    id: "q3",
    text: "새로운 도전을 선호하나요?",
    minLabel: "전혀 아니다",
    maxLabel: "매우 중요",
    dimension: "growth"
  },
  {
    id: "q4",
    text: "타인의 시선을 많이 의식하나요?",
    minLabel: "전혀 아니다",
    maxLabel: "매우 그렇다",
    dimension: "social"
  },
  {
    id: "q5",
    text: "실패를 두려워하나요?",
    minLabel: "전혀 아니다",
    maxLabel: "매우 그렇다",
    dimension: "risk"
  },
  {
    id: "q6",
    text: "현재 스트레스가 높은가요?",
    minLabel: "전혀 아니다",
    maxLabel: "매우 높다",
    dimension: "stress"
  }
];

// Attach to window scope
window.quizQuestions = quizQuestions;
