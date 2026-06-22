/**
 * Decision Mirror Main App Orchestrator
 */

// Application State
const state = {
  title: "",
  optionA: "",
  optionB: "",
  prosA: [""],
  consA: [""],
  prosB: [""],
  consB: [""],
  quiz: [3, 3, 3, 3, 3, 3] // Default slider values (1 to 5)
};

// DOM Elements
const screens = {
  landing: document.getElementById("landing-screen"),
  input: document.getElementById("input-screen"),
  proscons: document.getElementById("proscons-screen"),
  quiz: document.getElementById("quiz-screen"),
  loading: document.getElementById("loading-screen"),
  result: document.getElementById("result-screen")
};

const stepBar = document.getElementById("step-bar");
const stepProgressLine = document.getElementById("step-progress-line");
const stepDots = document.querySelectorAll(".step-dot");
const btnResetApp = document.getElementById("btn-reset-app");

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  loadSavedState();
  renderQuiz();
  updateNavigationUI();
});

// Load state from local storage
function loadSavedState() {
  const savedState = localStorage.getItem("decision_mirror_state");
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      Object.assign(state, parsed);
      
      // Update form inputs
      document.getElementById("input-title").value = state.title || "";
      document.getElementById("input-option-a").value = state.optionA || "";
      document.getElementById("input-option-b").value = state.optionB || "";
      
      // Show reset button if we have saved data
      if (state.title || state.optionA || state.optionB) {
        btnResetApp.style.display = "block";
      }
    } catch (e) {
      console.error("Error loading localStorage state:", e);
    }
  }
}

// Save state to local storage
function saveState() {
  localStorage.setItem("decision_mirror_state", JSON.stringify(state));
  if (state.title || state.optionA || state.optionB) {
    btnResetApp.style.display = "block";
  } else {
    btnResetApp.style.display = "none";
  }
}

// Reset state
function resetApp() {
  if (confirm("정말 처음부터 다시 작성하시겠습니까? 저장된 내용이 초기화됩니다.")) {
    localStorage.removeItem("decision_mirror_state");
    state.title = "";
    state.optionA = "";
    state.optionB = "";
    state.prosA = [""];
    state.consA = [""];
    state.prosB = [""];
    state.consB = [""];
    state.quiz = [3, 3, 3, 3, 3, 3];
    
    // Clear inputs
    document.getElementById("input-title").value = "";
    document.getElementById("input-option-a").value = "";
    document.getElementById("input-option-b").value = "";
    
    // Clear dynamic pros/cons
    renderDynamicLists();
    
    // Reset sliders
    const sliders = document.querySelectorAll(".range-slider");
    sliders.forEach((slider, idx) => {
      slider.value = 3;
      state.quiz[idx] = 3;
    });

    btnResetApp.style.display = "none";
    navigateTo("landing");
  }
}

// Screen Routing Function
function navigateTo(screenId) {
  // Hide all screens
  Object.values(screens).forEach(screen => {
    screen.classList.remove("active");
  });

  // Show target screen after animation delay
  const target = screens[screenId];
  if (target) {
    target.classList.add("active");
  }

  updateNavigationUI(screenId);
}

// Update Step Indicators and Navigation visibility
function updateNavigationUI(currentScreenId = "landing") {
  // Header logo home button
  const logo = document.getElementById("logo-home");
  logo.onclick = (e) => {
    e.preventDefault();
    navigateTo("landing");
  };

  // Step indicator visibility
  if (currentScreenId === "input" || currentScreenId === "proscons" || currentScreenId === "quiz") {
    stepBar.style.display = "block";
  } else {
    stepBar.style.display = "none";
  }

  // Update dots status and connection line
  stepDots.forEach(dot => {
    const stepNum = parseInt(dot.getAttribute("data-step"));
    dot.classList.remove("active", "completed");

    if (currentScreenId === "input") {
      stepProgressLine.style.width = "0%";
      if (stepNum === 1) dot.classList.add("active");
    } else if (currentScreenId === "proscons") {
      stepProgressLine.style.width = "50%";
      if (stepNum === 1) dot.classList.add("completed");
      if (stepNum === 2) dot.classList.add("active");
    } else if (currentScreenId === "quiz") {
      stepProgressLine.style.width = "100%";
      if (stepNum < 3) dot.classList.add("completed");
      if (stepNum === 3) dot.classList.add("active");
    }
  });
}

// Event Listeners Registration
function initEventListeners() {
  btnResetApp.addEventListener("click", resetApp);
  document.getElementById("btn-restart-final").addEventListener("click", () => {
    localStorage.removeItem("decision_mirror_state");
    location.reload();
  });

  // Step 1: Landing
  document.getElementById("btn-start").addEventListener("click", () => {
    navigateTo("input");
  });

  // Step 2: Inputs
  document.getElementById("btn-input-back").addEventListener("click", () => {
    navigateTo("landing");
  });
  document.getElementById("btn-input-next").addEventListener("click", () => {
    const titleVal = document.getElementById("input-title").value.trim();
    const optAVal = document.getElementById("input-option-a").value.trim();
    const optBVal = document.getElementById("input-option-b").value.trim();

    if (!titleVal || !optAVal || !optBVal) {
      alert("고민 주제와 선택지 A, B를 모두 작성해주세요.");
      return;
    }

    state.title = titleVal;
    state.optionA = optAVal;
    state.optionB = optBVal;
    saveState();

    // Prepare Header Names for next screens
    document.getElementById("badge-option-a").textContent = "선택지 A";
    document.getElementById("badge-option-b").textContent = "선택지 B";
    document.getElementById("header-option-a").textContent = optAVal;
    document.getElementById("header-option-b").textContent = optBVal;

    // Render initial dynamic lists
    renderDynamicLists();
    navigateTo("proscons");
  });

  // Step 3: Pros & Cons Add Buttons
  document.getElementById("btn-add-pro-a").addEventListener("click", () => addListItem("prosA", "list-pros-a"));
  document.getElementById("btn-add-con-a").addEventListener("click", () => addListItem("consA", "list-cons-a"));
  document.getElementById("btn-add-pro-b").addEventListener("click", () => addListItem("prosB", "list-pros-b"));
  document.getElementById("btn-add-con-b").addEventListener("click", () => addListItem("consB", "list-cons-b"));

  document.getElementById("btn-proscons-back").addEventListener("click", () => {
    navigateTo("input");
  });
  
  document.getElementById("btn-proscons-next").addEventListener("click", () => {
    // Collect non-empty list items
    state.prosA = collectListItems("list-pros-a");
    state.consA = collectListItems("list-cons-a");
    state.prosB = collectListItems("list-pros-b");
    state.consB = collectListItems("list-cons-b");

    // Validation: Require at least 1 item for each
    if (state.prosA.length === 0 || state.consA.length === 0 || 
        state.prosB.length === 0 || state.consB.length === 0) {
      alert("각 선택지별로 최소 1개 이상의 장점과 단점을 입력해주세요.");
      return;
    }

    saveState();
    navigateTo("quiz");
  });

  // Step 4: Quiz
  document.getElementById("btn-quiz-back").addEventListener("click", () => {
    navigateTo("proscons");
  });

  document.getElementById("btn-quiz-submit").addEventListener("click", () => {
    // Read slider values
    const sliders = document.querySelectorAll(".range-slider");
    sliders.forEach((slider, idx) => {
      state.quiz[idx] = parseInt(slider.value) || 3;
    });

    saveState();
    runFakeLoading();
  });
}

// Dynamic List Rendering and Management
function renderDynamicLists() {
  renderListContainer("prosA", "list-pros-a", "예: 안정적인 급여와 복지제도");
  renderListContainer("consA", "list-cons-a", "예: 정체되는 느낌과 느린 성장 속도");
  renderListContainer("prosB", "list-pros-b", "예: 주도적으로 일하고 빠른 커리어 성장");
  renderListContainer("consB", "list-cons-b", "예: 높은 스트레스와 불확실성");
}

function renderListContainer(stateKey, listId, placeholder) {
  const container = document.getElementById(listId);
  container.innerHTML = "";
  
  const items = state[stateKey];
  if (items.length === 0) {
    items.push("");
  }

  items.forEach((val, idx) => {
    createListItemElement(container, stateKey, val, placeholder);
  });
}

function createListItemElement(container, stateKey, value, placeholder) {
  const itemDiv = document.createElement("div");
  itemDiv.className = "dynamic-item";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control";
  input.placeholder = placeholder;
  input.value = value;
  
  // Save content changes on typing
  input.addEventListener("input", () => {
    const parent = input.parentElement.parentElement;
    state[stateKey] = Array.from(parent.querySelectorAll(".form-control")).map(inp => inp.value.trim());
    saveState();
  });

  const btnDel = document.createElement("button");
  btnDel.className = "btn-icon-del";
  btnDel.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>`;
  
  btnDel.addEventListener("click", () => {
    const parentContainer = itemDiv.parentElement;
    itemDiv.remove();
    // Re-sync state
    state[stateKey] = Array.from(parentContainer.querySelectorAll(".form-control")).map(inp => inp.value.trim());
    saveState();
  });

  itemDiv.appendChild(input);
  itemDiv.appendChild(btnDel);
  container.appendChild(itemDiv);
}

function addListItem(stateKey, listId) {
  const container = document.getElementById(listId);
  let placeholder = "항목 입력";
  if (stateKey.startsWith("pros")) placeholder = "예: 긍정적인 요소 추가";
  if (stateKey.startsWith("cons")) placeholder = "예: 부정적인 요소 추가";

  createListItemElement(container, stateKey, "", placeholder);
  state[stateKey].push("");
  saveState();
}

function collectListItems(listId) {
  const container = document.getElementById(listId);
  return Array.from(container.querySelectorAll(".form-control"))
    .map(input => input.value.trim())
    .filter(val => val !== "");
}

// Render quiz items dynamically
function renderQuiz() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  window.quizQuestions.forEach((q, idx) => {
    const initialVal = state.quiz[idx] !== undefined ? state.quiz[idx] : 3;

    const quizItem = document.createElement("div");
    quizItem.className = "quiz-item";
    quizItem.innerHTML = `
      <div class="quiz-header">
        <span class="quiz-number">Q${idx + 1}</span>
        <span class="quiz-question">${q.text}</span>
      </div>
      <div class="slider-container">
        <input type="range" class="range-slider" min="1" max="5" value="${initialVal}" id="slider-${q.id}">
        <div class="slider-labels">
          <span>1 (${q.minLabel})</span>
          <span>3 (보통)</span>
          <span>5 (${q.maxLabel})</span>
        </div>
      </div>
    `;

    container.appendChild(quizItem);
  });
}

// Fake 2-seconds Loading animation
function runFakeLoading() {
  navigateTo("loading");
  const loadingMsg = document.getElementById("loading-message");
  
  const messages = [
    "당신의 고민을 분석 중...",
    "편향 여부 확인 중...",
    "추천안을 생성 중..."
  ];

  let currentMsgIdx = 0;
  loadingMsg.textContent = messages[currentMsgIdx];

  const msgInterval = setInterval(() => {
    currentMsgIdx = (currentMsgIdx + 1) % messages.length;
    loadingMsg.textContent = messages[currentMsgIdx];
  }, 650);

  setTimeout(() => {
    clearInterval(msgInterval);
    renderReport();
  }, 2000);
}

// Generate and Render final analysis report
let radarChartInstance = null;
function renderReport() {
  // 1. Run scoring algorithm
  const result = window.calculateScore(state);
  const biases = window.analyzeBias(state.quiz);
  const recommendation = window.generateRecommendation(state, result.scoreA, result.scoreB);

  // 2. Set text content
  document.getElementById("result-topic").textContent = `[${state.title}] 분석 리포트`;
  
  document.getElementById("result-name-a").textContent = state.optionA;
  document.getElementById("result-score-a").textContent = `${result.scoreA}점`;
  
  document.getElementById("result-name-b").textContent = state.optionB;
  document.getElementById("result-score-b").textContent = `${result.scoreB}점`;

  // Bar chart animation
  const barA = document.getElementById("bar-result-a");
  const barB = document.getElementById("bar-result-b");
  barA.style.width = "0%";
  barB.style.width = "0%";

  setTimeout(() => {
    barA.style.width = `${result.scoreA}%`;
    barB.style.width = `${result.scoreB}%`;
  }, 100);

  // 3. Highlight Winner Card
  const cardA = document.getElementById("card-result-a");
  const cardB = document.getElementById("card-result-b");
  cardA.classList.remove("winner");
  cardB.classList.remove("winner");

  if (result.scoreA > result.scoreB) {
    cardA.classList.add("winner");
  } else {
    cardB.classList.add("winner");
  }

  // 4. Render Cognitive Biases
  const biasContainer = document.getElementById("result-bias-container");
  biasContainer.innerHTML = "";
  if (biases.length === 0) {
    biasContainer.innerHTML = `
      <div style="color: var(--success); font-weight: 500; font-size: 0.95rem; display: flex; align-items: center; gap: 0.35rem; width: 100%;">
        ✅ 특별한 부정적 심리 편향이 감지되지 않았습니다. 비교적 합리적인 인지 상태입니다.
      </div>`;
  } else {
    biases.forEach(bias => {
      const badgeClass = bias.level === "위험" ? "btn-danger" : "badge-warning";
      const badgeIcon = bias.level === "위험" ? "🚨" : "⚠️";
      
      const badgeDiv = document.createElement("div");
      badgeDiv.style.width = "100%";
      badgeDiv.style.marginBottom = "0.75rem";
      badgeDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <span class="badge ${badgeClass}">${badgeIcon} ${bias.title}</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; padding-left: 0.5rem;">${bias.description}</p>
      `;
      biasContainer.appendChild(badgeDiv);
    });
  }

  // 5. Render Recommendation Advice
  document.getElementById("recommendation-title").textContent = recommendation.title;
  document.getElementById("recommendation-desc").textContent = recommendation.text;

  // 6. Draw Radar Chart using Chart.js
  drawRadarChart();

  navigateTo("result");
}

function drawRadarChart() {
  const ctx = document.getElementById("radarChart").getContext("2d");
  
  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  // Map state quiz metrics:
  // 안정성 (Q1), 보상 (Q2), 성장 (Q3), 사회적 시선 (Q4), 리스크 감수 (6-Q5), 스트레스 (Q6)
  const stability = state.quiz[0];
  const reward = state.quiz[1];
  const growth = state.quiz[2];
  const social = state.quiz[3];
  const riskTaking = 6 - state.quiz[4]; // Invert loss aversion (Q5) to show active risk-tolerance
  const stress = state.quiz[5];

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['안정 지향', '보상 가치', '도전/성장', '사회적 의식', '리스크 수용', '스트레스 지수'],
      datasets: [{
        label: '나의 의사결정 지표',
        data: [stability, reward, growth, social, riskTaking, stress],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            display: true,
            color: 'rgba(226, 232, 240, 0.8)'
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.8)'
          },
          suggestedMin: 1,
          suggestedMax: 5,
          ticks: {
            stepSize: 1,
            display: false // Hide text numbers on grid
          },
          pointLabels: {
            font: {
              family: 'Plus Jakarta Sans',
              size: 11,
              weight: 'bold'
            },
            color: '#1e293b'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}
