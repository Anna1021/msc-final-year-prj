const STORAGE_KEY = "aiExplorerProgress";

const missions = [
  { id: 1, title: "How does ChatGPT read?", short: "How does ChatGPT read?", desc: "Learn how text is broken into tokens.", href: "mission-1-tokenisation.html", icon: "wand", badge: "First Steps" },
  { id: 2, title: "Can you think like ChatGPT?", short: "Can you think like ChatGPT?", desc: "Predict the next token using probability.", href: "mission-2-next-token.html", icon: "bolt", badge: "Predictor" },
  { id: 3, title: "Why does ChatGPT make mistakes?", short: "Why does ChatGPT make mistakes?", desc: "Discover hallucinations and probabilistic errors.", href: "#", icon: "question", badge: "AI Detective" },
  { id: 4, title: "Why does context matter?", short: "Why does context matter?", desc: "See how earlier words change the meaning.", href: "#", icon: "link" },
  { id: 5, title: "Train your own AI", short: "Train your own AI", desc: "Add training data and see how it changes the model.", href: "#", icon: "database", badge: "Data Collector" },
  { id: 6, title: "Can AI be biased?", short: "Can AI be biased?", desc: "Explore how bias in data leads to biased outputs.", href: "#", icon: "scale" }
];

let toastTimer;

const activityIcons = {
  wand: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 10-10"></path><path d="M12 4l.8 2.2L15 7l-2.2.8L12 10l-.8-2.2L9 7l2.2-.8z"></path><path d="M18 3l.5 1.4L20 5l-1.5.6L18 7l-.5-1.4L16 5l1.5-.6z"></path><path d="M19 12l.8 2.2L22 15l-2.2.8L19 18l-.8-2.2L16 15l2.2-.8z"></path></svg>`,
  bolt: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-8 12h6l-1 8 9-13h-6z"></path></svg>`,
  arrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12"></path><path d="m13 6 6 6-6 6"></path></svg>`
};

function defaultState() {
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

function getState() {
  const base = defaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...base, ...saved, missions: { ...base.missions, ...(saved.missions || {}) } };
  } catch {
    return base;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function isUnlocked(state, missionId) {
  return missionId === 1 || state.missions[missionId - 1]?.completed;
}

function completedCount(state) {
  return missions.filter((mission) => state.missions[mission.id]?.completed).length;
}

function currentMission(state) {
  return missions.find((mission) => isUnlocked(state, mission.id) && !state.missions[mission.id]?.completed) || missions[5];
}

function earnedBadges(state) {
  return missions.filter((mission) => mission.badge && state.missions[mission.id]?.completed).length;
}

function routeTo(path) {
  if (!path || path === "#") {
    return;
  }
  if (path.startsWith("/")) {
    showToast(`Open ${path}`);
    return;
  }
  window.location.href = path;
}

function renderStatus(state) {
  const levelProgress = Math.min(100, Math.round((state.xp / 2000) * 100));
  document.querySelector("#topXp").textContent = `${state.xp} XP`;
  document.querySelector("#topStreak").textContent = `${state.streak} day streak`;
  const profileText = document.querySelector("#homeProfileXpText");
  const profileBar = document.querySelector("#homeProfileXpBar");
  if (profileText) profileText.textContent = `${state.xp} / 2000 XP`;
  if (profileBar) profileBar.style.width = `${levelProgress}%`;
  window.AIExplorer?.syncStatus();
}

function renderContinue(state) {
  const mission = currentMission(state);
  const progress = Math.round(state.missions[mission.id]?.progress || 0);
  document.querySelector("#continueMissionTitle").textContent = `Mission ${mission.id}: ${mission.title}`;
  document.querySelector("#continueMissionDesc").textContent = mission.desc;
  document.querySelector("#continueProgressBar").style.width = `${progress}%`;
  document.querySelector("#continueProgressText").textContent = `${progress}% complete`;
  const button = document.querySelector("#continueMissionButton");
  button.href = mission.href;
  button.dataset.destination = mission.href;
}

function renderLearningPath(state) {
  const track = document.querySelector("#learningPath");
  track.innerHTML = "";

  missions.forEach((mission) => {
    const completed = state.missions[mission.id]?.completed;
    const unlocked = isUnlocked(state, mission.id);
    const current = unlocked && !completed;
    const step = document.createElement("a");
    step.href = unlocked ? mission.href : "#";
    step.className = `path-step ${completed ? "completed" : ""} ${current ? "current" : ""} ${!unlocked ? "locked" : ""}`;
    if (!unlocked) {
      step.dataset.locked = `Complete Mission ${mission.id - 1} first.`;
    } else {
      step.dataset.destination = mission.href;
    }
    step.innerHTML = `
      <span class="path-node"><span class="path-symbol ${completed ? "check-symbol" : current ? `${mission.icon}-symbol` : "lock-symbol"}"></span></span>
      <span class="path-number">${mission.id}</span>
      <span class="path-title">${mission.short}</span>
      <span class="path-state">${completed ? "Completed" : current ? "In Progress" : "Locked"}</span>
    `;
    track.appendChild(step);
  });

  const finalUnlocked = completedCount(state) === 6;
  const final = document.createElement("a");
  final.href = finalUnlocked ? "/final-challenge" : "#";
  final.className = `path-step final-step ${finalUnlocked ? "current" : "locked"}`;
  final.dataset.locked = finalUnlocked ? "" : "Complete all 6 missions first.";
  final.innerHTML = `
    <span class="path-node"><span class="path-symbol trophy-symbol"></span></span>
    <span class="path-number">Final Challenge</span>
    <span class="path-title">AI Literacy Escape Room</span>
    <span class="path-state">${finalUnlocked ? "Unlocked" : "Locked"}</span>
  `;
  track.appendChild(final);
}

function renderSideCards(state) {
  const completed = completedCount(state);
  const badges = earnedBadges(state);
  const goalDone = completed > 0 || (state.missions[2]?.progress || 0) > 0;
  document.querySelector("#missionsCompletedStat").textContent = completed;
  document.querySelector("#badgesEarnedStat").textContent = badges;
  document.querySelector("#totalXpStat").textContent = state.xp;
  document.querySelector("#goalProgressBar").style.width = goalDone ? "100%" : "0%";
  document.querySelector("#goalProgressText").textContent = `${goalDone ? 1 : 0} / 1 step completed`;
  document.querySelector("#goalCheck").style.opacity = goalDone ? "1" : ".26";
  document.querySelector("#goalMessage").textContent = goalDone
    ? "Great job! Come back tomorrow to keep your streak."
    : "Complete one step today to keep your streak moving.";
}

function renderActivity(state) {
  const list = document.querySelector("#activityList");
  const activities = [];
  if (state.missions[1]?.completed) {
    activities.push({ icon: "wand", color: "green", title: "Completed Mission 1", desc: "How does ChatGPT read?", xp: "+100 XP", time: "2 days ago" });
  }
  if ((state.missions[2]?.progress || 0) > 0) {
    activities.push({ icon: "bolt", color: "blue", title: state.missions[2]?.completed ? "Completed Mission 2" : "Started Mission 2", desc: "Can you think like ChatGPT?", xp: state.missions[2]?.completed ? "+100 XP" : "+50 XP", time: "Yesterday" });
  }
  if (!activities.length) {
    activities.push({ icon: "arrow", color: "blue", title: "Ready to start Mission 1", desc: "How does ChatGPT read?", xp: "+50 XP", time: "Today" });
  }

  list.innerHTML = activities.slice(0, 2).map((item) => `
    <div class="activity-item">
      <span class="activity-dot ${item.color}">${activityIcons[item.icon]}</span>
      <span><strong>${item.title}</strong><small>${item.desc}</small></span>
      <span class="activity-xp">${item.xp}<small>${item.time}</small></span>
    </div>
  `).join("");
}

function bindEvents(state) {
  document.addEventListener("click", (event) => {
    const popover = event.target.closest("[data-popover]");
    if (popover) {
      event.preventDefault();
      showToast(popover.dataset.popover);
      return;
    }

    const avatar = event.target.closest(".avatar-button");
    if (avatar) {
      event.preventDefault();
      const menu = document.querySelector("#profileMenu");
      const open = menu.classList.toggle("open");
      menu.setAttribute("aria-hidden", String(!open));
      return;
    }

    const bell = event.target.closest(".bell-button");
    if (bell) {
      event.preventDefault();
      showToast("Notifications: Mission progress saved. Complete missions to unlock the final challenge.");
      return;
    }

    const action = event.target.closest("[data-action]");
    if (action) {
      event.preventDefault();
      if (action.dataset.action === "reset") {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
        return;
      }
      showToast("Settings will include sound, animation, text size, and dark mode.");
      return;
    }

    const locked = event.target.closest("[data-locked]");
    if (locked && locked.dataset.locked) {
      event.preventDefault();
      showToast(locked.dataset.locked);
      return;
    }

    const destination = event.target.closest("[data-destination]");
    if (destination) {
      event.preventDefault();
      routeTo(destination.dataset.destination);
      return;
    }

    const route = event.target.closest("[data-route]");
    if (route) {
      event.preventDefault();
      const path = route.dataset.route;
      if (path === "/progress") {
        showToast(`${completedCount(state)} / 6 missions completed.`);
        return;
      }
      if (path === "/glossary") {
        showToast("Open Glossary");
        return;
      }
      showToast(`Open ${path}`);
    }
  });

  const finalCard = document.querySelector("#finalChallengeCard");
  if (completedCount(state) === 6) {
    finalCard.removeAttribute("data-locked");
    finalCard.dataset.route = "/final-challenge";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const state = getState();
  saveState(state);
  renderStatus(state);
  renderContinue(state);
  renderLearningPath(state);
  renderSideCards(state);
  renderActivity(state);
  bindEvents(state);
});
