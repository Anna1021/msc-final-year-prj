const defaultSentence = "I love chocolate ice cream";
const STORAGE_KEY = "aiExplorerProgress";
let currentTokens = [];
let sourceTokens = [];
let droppedTokens = [];
let missionComplete = false;
let toastTimer;

const tokenColors = ["#eadfff", "#dff0ff", "#daf6e4", "#ffedc9", "#ffd8e3"];

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

function completeMissionOne() {
  const state = getProgressState();
  const wasCompleted = state.missions[1]?.completed;
  state.missions[1] = { progress: 100, completed: true };
  if (!wasCompleted) {
    state.xp += 150;
  }
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

function tokenize(text) {
  return (text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|\d+|[^\sA-Za-z\d]/g) || []).filter(Boolean);
}

function renderTokenCards(tokens) {
  const target = $("#tokenCards");
  target.innerHTML = "";
  tokens.forEach((token, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "token-chip";
    button.textContent = token;
    button.addEventListener("click", () => {
      if (token.toLowerCase() === "ice") {
        showToast("This token will be processed before the next token.");
      } else {
        showToast("This is one token. The model reads it as one piece of text.");
      }
    });
    target.appendChild(button);
  });
}

function renderFlow(tokens) {
  $("#flowSentence").textContent = $("#sentenceInput").value.trim() || defaultSentence;
  $("#flowTokens").innerHTML = tokens.map((token, index) => (
    `<span class="flow-token" style="background:${tokenColors[index % tokenColors.length]}">${token}</span>`
  )).join("");
  $("#flowDots").innerHTML = tokens.map((_, index) => (
    `<span style="background:${["#9b78df", "#8ea2ee", "#7bb8fa", "#64c879", "#f1bd57", "#f58da3"][index % 6]}"></span>`
  )).join("");
}

function shuffle(tokens) {
  const preferred = ["ice", "cream", "I", "love", "chocolate"];
  if (tokens.join(" ") === defaultSentence) {
    return preferred;
  }
  return [...tokens].sort((a, b) => a.localeCompare(b)).reverse();
}

function renderChallenge(tokens) {
  sourceTokens = shuffle(tokens).map((token, index) => ({
    id: `${index}-${token}-${Math.random().toString(16).slice(2)}`,
    text: token,
    color: tokenColors[index % tokenColors.length]
  }));
  droppedTokens = [];
  renderChallengeTokens();
  $("#challengeFeedback").textContent = "";
  $("#challengeFeedback").className = "challenge-feedback";
  $("#checkBtn").disabled = true;
  $("#checkBtn").classList.remove("ready");
}

function renderChallengeTokens() {
  renderSourceTokens();
  renderDropZone();
  updateCheckState();
}

function createTokenButton(item, location, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `drag-token ${location === "drop" ? "dropped-token" : ""}`;
  button.textContent = item.text;
  button.draggable = true;
  button.style.background = item.color;
  button.dataset.tokenId = item.id;
  button.dataset.location = location;
  button.title = location === "drop" ? "Drag to reorder, or click to move back." : "Drag or click to add.";

  button.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("application/json", JSON.stringify({ id: item.id, from: location }));
    event.dataTransfer.effectAllowed = "move";
    button.classList.add("dragging");
  });
  button.addEventListener("dragend", () => button.classList.remove("dragging"));

  if (location === "source") {
    button.addEventListener("click", () => moveSourceToDrop(item.id));
  } else {
    button.addEventListener("click", () => moveDropToSource(item.id));
    button.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      button.classList.add("insert-before");
    });
    button.addEventListener("dragleave", () => button.classList.remove("insert-before"));
    button.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      button.classList.remove("insert-before");
      const payload = readDragPayload(event);
      if (payload) {
        moveToDropAt(payload.id, index);
      }
    });
  }

  return button;
}

function renderSourceTokens() {
  const source = $("#scrambledTokens");
  source.innerHTML = "";
  sourceTokens.forEach((item, index) => {
    source.appendChild(createTokenButton(item, "source", index));
  });
}

function readDragPayload(event) {
  try {
    return JSON.parse(event.dataTransfer.getData("application/json"));
  } catch {
    return null;
  }
}

function takeToken(id) {
  const sourceIndex = sourceTokens.findIndex((item) => item.id === id);
  if (sourceIndex >= 0) {
    return sourceTokens.splice(sourceIndex, 1)[0];
  }

  const dropIndex = droppedTokens.findIndex((item) => item.id === id);
  if (dropIndex >= 0) {
    return droppedTokens.splice(dropIndex, 1)[0];
  }

  return null;
}

function moveSourceToDrop(id) {
  const item = takeToken(id);
  if (!item) return;
  droppedTokens.push(item);
  renderChallengeTokens();
}

function moveDropToSource(id) {
  const item = takeToken(id);
  if (!item) return;
  sourceTokens.push(item);
  renderChallengeTokens();
}

function moveToDropAt(id, index) {
  const item = takeToken(id);
  if (!item) return;
  const nextIndex = Math.max(0, Math.min(index, droppedTokens.length));
  droppedTokens.splice(nextIndex, 0, item);
  renderChallengeTokens();
}

function moveToDropEnd(id) {
  const item = takeToken(id);
  if (!item) return;
  droppedTokens.push(item);
  renderChallengeTokens();
}

function renderDropZone() {
  const drop = $("#dropZone");
  drop.innerHTML = "";
  if (droppedTokens.length === 0) {
    const placeholder = document.createElement("span");
    placeholder.className = "drop-placeholder";
    placeholder.textContent = "Drop here";
    drop.appendChild(placeholder);
    return;
  }
  droppedTokens.forEach((item, index) => {
    drop.appendChild(createTokenButton(item, "drop", index));
  });
}

function updateCheckState() {
  const ready = droppedTokens.length === currentTokens.length && currentTokens.length > 0;
  $("#checkBtn").disabled = !ready;
  $("#checkBtn").classList.toggle("ready", ready);
}

function breakIntoTokens(silent = false) {
  const input = $("#sentenceInput").value.trim() || defaultSentence;
  $("#sentenceInput").value = input;
  currentTokens = tokenize(input);
  renderTokenCards(currentTokens);
  renderFlow(currentTokens);
  renderChallenge(currentTokens);
  if (!silent) {
    showToast("Mini Challenge unlocked. Put the tokens back in order.");
  }
}

function checkAnswer() {
  const feedback = $("#challengeFeedback");
  const answer = droppedTokens.map((item) => item.text);
  if (answer.join("\u0000") === currentTokens.join("\u0000")) {
    missionComplete = true;
    completeMissionOne();
    feedback.textContent = "Correct! The model reads tokens in order. +50 XP";
    feedback.className = "challenge-feedback success";
    showToast("Mission progress complete. +50 XP earned.");
  } else {
    feedback.textContent = "Not quite. Try reading the sentence from left to right.";
    feedback.className = "challenge-feedback error";
  }
}

function bindDropZone() {
  const drop = $("#dropZone");
  drop.addEventListener("dragover", (event) => {
    event.preventDefault();
    drop.classList.add("active");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("active"));
  drop.addEventListener("drop", (event) => {
    event.preventDefault();
    drop.classList.remove("active");
    const payload = readDragPayload(event);
    if (payload) {
      moveToDropEnd(payload.id);
    }
  });

  const source = $("#scrambledTokens");
  source.addEventListener("dragover", (event) => {
    event.preventDefault();
    source.classList.add("active");
  });
  source.addEventListener("dragleave", () => source.classList.remove("active"));
  source.addEventListener("drop", (event) => {
    event.preventDefault();
    source.classList.remove("active");
    const payload = readDragPayload(event);
    if (payload) {
      moveDropToSource(payload.id);
    }
  });
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

function bindFlowCards() {
  document.querySelectorAll("[data-focus]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.focus);
      target.classList.remove("focus-pulse");
      void target.offsetWidth;
      target.classList.add("focus-pulse");
    });
  });
  document.querySelectorAll("[data-explain]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.explain));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("#breakBtn").addEventListener("click", breakIntoTokens);
  $("#sentenceInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") breakIntoTokens();
  });
  $("#checkBtn").addEventListener("click", checkAnswer);
  $("#hintBtn").addEventListener("click", () => showToast('Start with "I", then think about what comes next.'));
  $("#nextBtn").addEventListener("click", () => {
    if (!missionComplete) {
      showToast("Complete the mini challenge to continue.");
      return;
    }
    window.location.href = "mission-2-next-token.html";
  });

  document.querySelectorAll("[data-popover]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.popover));
  });

  bindDropZone();
  bindSettings();
  bindRoutes();
  bindFlowCards();
  breakIntoTokens(true);
});
