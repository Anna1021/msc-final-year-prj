const questions = [
  {
    context: "The cat sat on the",
    display: "The cat sat on the ____.",
    options: ["mat", "moon", "pizza", "computer"],
    correct: "mat",
    base: { mat: 72, floor: 18, chair: 7, pizza: 3 }
  },
  {
    context: "I drink coffee every",
    display: "I drink coffee every ____.",
    options: ["morning", "planet", "shoe", "keyboard"],
    correct: "morning",
    base: { morning: 68, day: 17, night: 10, week: 5 }
  },
  {
    context: "She opened the book and started to",
    display: "She opened the book and started to ____.",
    options: ["read", "swim", "melt", "sleep"],
    correct: "read",
    base: { read: 64, write: 16, learn: 12, sleep: 8 }
  },
  {
    context: "The teacher wrote on the",
    display: "The teacher wrote on the ____.",
    options: ["board", "cloud", "sandwich", "moon"],
    correct: "board",
    base: { board: 70, paper: 17, screen: 9, wall: 4 }
  },
  {
    context: "For homework, check your",
    display: "For homework, check your ____.",
    options: ["answer", "banana", "spaceship", "pillow"],
    correct: "answer",
    base: { answer: 62, work: 20, source: 13, spelling: 5 }
  }
];

const barColors = ["#79d65a", "#61aaf4", "#f6bc3e", "#f48ca5", "#9b7cf0"];
const STORAGE_KEY = "aiExplorerProgress";
let questionIndex = 0;
let selectedAnswer = "";
let currentProbabilities = {};
let completeCount = 0;
let toastTimer;

function defaultProgressState() {
  return {
    xp: 1200,
    streak: 7,
    missions: {
      1: { progress: 0, completed: false },
      2: { progress: 0, completed: false },
      3: { progress: 0, completed: false },
      4: { progress: 0, completed: false },
      5: { progress: 0, completed: false },
      6: { progress: 0, completed: false }
    }
  };
}

function getProgressState() {
  const base = defaultProgressState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...base, ...saved, missions: { ...base.missions, ...(saved.missions || {}) } };
  } catch {
    return base;
  }
}

function saveProgressState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveMissionTwoProgress(doneCount) {
  const state = getProgressState();
  const previous = state.missions[2] || { progress: 0, completed: false };
  const progress = Math.max(previous.progress || 0, Math.round((doneCount / questions.length) * 100));
  const completed = progress >= 100;
  if (completed && !previous.completed) {
    state.xp += 100;
  }
  state.missions[2] = { progress, completed };
  saveProgressState(state);
}

function $(selector) {
  return document.querySelector(selector);
}

function showToast(message) {
  const toast = $("#toast");
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function temperatureScale(base, temp) {
  const entries = Object.entries(base);
  const power = 0.7 / Number(temp);
  const scaled = entries.map(([word, value]) => [word, Math.pow(value / 100, power)]);
  const total = scaled.reduce((sum, [, value]) => sum + value, 0);
  const rounded = {};
  scaled.forEach(([word, value]) => {
    rounded[word] = Math.max(1, Math.round((value / total) * 100));
  });

  const diff = 100 - Object.values(rounded).reduce((sum, value) => sum + value, 0);
  const first = Object.keys(rounded)[0];
  rounded[first] += diff;
  return rounded;
}

function currentQuestion() {
  return questions[questionIndex];
}

function renderQuestion() {
  const q = currentQuestion();
  selectedAnswer = "";
  $("#questionBadge").textContent = `Question ${questionIndex + 1} of 5`;
  $("#questionText").textContent = q.display;
  $("#contextFlow").textContent = q.context;
  $("#submitGuessBtn").disabled = true;

  const options = $("#answerOptions");
  options.innerHTML = "";
  q.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.textContent = option;
    button.addEventListener("click", () => selectAnswer(option));
    options.appendChild(button);
  });
  renderPrediction(false);
}

function selectAnswer(answer) {
  selectedAnswer = answer;
  document.querySelectorAll(".answer-option").forEach((button) => {
    const isSelected = button.textContent === answer;
    button.classList.toggle("selected", isSelected && answer === currentQuestion().correct);
    button.classList.toggle("alt-selected", isSelected && answer !== currentQuestion().correct);
  });
  $("#submitGuessBtn").disabled = false;
}

function renderPrediction(showFeedback = true) {
  const q = currentQuestion();
  currentProbabilities = temperatureScale(q.base, $("#temperatureSlider").value);
  const bars = $("#probabilityBars");
  bars.innerHTML = "";

  Object.entries(currentProbabilities).forEach(([word, value], index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "prob-row";
    row.innerHTML = `
      <span>${word}</span>
      <span class="prob-track"><span class="prob-fill" style="width:${value}%; background:${barColors[index % barColors.length]}"></span></span>
      <strong>${value}%</strong>
    `;
    row.addEventListener("click", () => {
      if (word === q.correct) {
        showToast("The model thinks this is the most likely next word.");
      } else {
        showToast("This is possible, but not very likely in this context.");
      }
    });
    bars.appendChild(row);
  });

  if (showFeedback) {
    renderFeedback();
  } else {
    $("#predictionFeedback").innerHTML = `
      <div class="feedback-top">
        <span class="feedback-icon">?</span>
        <div><strong>Make a guess</strong><p>Choose a word, then submit to compare with the model.</p></div>
      </div>
      <div class="feedback-explain">The bars will show how likely each next token is.</div>
    `;
  }
}

function renderFeedback() {
  const q = currentQuestion();
  const correct = selectedAnswer === q.correct;
  const selectedProb = currentProbabilities[selectedAnswer] || 1;
  $("#predictionFeedback").innerHTML = correct ? `
    <div class="feedback-top">
      <span class="feedback-icon">✓</span>
      <div><strong>Great!</strong><p>You predicted like the model.</p></div>
    </div>
    <div class="feedback-explain">ChatGPT gives many possible next tokens a probability score. The highest probability token is usually chosen.</div>
  ` : `
    <div class="feedback-top interesting">
      <span class="feedback-icon">i</span>
      <div><strong>Interesting!</strong><p>The model thought "${q.correct}" was much more likely.</p></div>
    </div>
    <div class="feedback-explain interesting">"${selectedAnswer}" is possible, but much less likely in this context: about ${selectedProb}%.</div>
  `;
}

function submitGuess() {
  if (!selectedAnswer) return;
  renderPrediction(true);
  completeCount = Math.max(completeCount, questionIndex + 1);
  saveMissionTwoProgress(completeCount);
  if (completeCount === questions.length) {
    showToast("Mission 2 Complete. Predictor badge unlocked. +100 XP");
    return;
  }
  window.setTimeout(() => {
    questionIndex += 1;
    renderQuestion();
    showToast(`Question ${questionIndex + 1} of 5`);
  }, 2200);
}

function bindSettings() {
  const modal = $("#settingsModal");
  $(".settings-trigger").addEventListener("click", () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  });
  document.querySelectorAll("[data-close-settings]").forEach((item) => {
    item.addEventListener("click", () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    });
  });
}

function bindRoutes() {
  document.addEventListener("click", (event) => {
    const route = event.target.closest("[data-route]");
    if (!route) return;
    event.preventDefault();
    showToast(`Open ${route.dataset.route}`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const state = getProgressState();
  completeCount = Math.round(((state.missions[2]?.progress || 0) / 100) * questions.length);
  questionIndex = Math.min(completeCount, questions.length - 1);

  $("#submitGuessBtn").addEventListener("click", submitGuess);
  $("#temperatureSlider").addEventListener("input", () => {
    $("#temperatureValue").textContent = $("#temperatureSlider").value;
  });
  $("#showAgainBtn").addEventListener("click", () => {
    renderPrediction(Boolean(selectedAnswer));
    showToast("Probabilities updated with the new temperature.");
  });
  $("#nextMissionBtn").addEventListener("click", () => {
    if (completeCount < questions.length) {
      showToast("Finish all 5 questions to continue.");
      return;
    }
    window.history.pushState({}, "", "/mission/3-hallucination");
    showToast("Open Mission 3: Why does ChatGPT make mistakes?");
  });
  document.querySelectorAll("[data-popover]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.popover));
  });
  bindSettings();
  bindRoutes();
  renderQuestion();
});
