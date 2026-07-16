const STORAGE_KEY = "aiExplorerProgress";

const icons = {
  token: `<span class="letters-icon">Aa</span>`,
  bolt: `<svg viewBox="0 0 24 24"><path d="m13 2-8 12h6l-1 8 9-13h-6z"></path></svg>`,
  question: `<svg viewBox="0 0 24 24"><path d="M12 17h.01"></path><path d="M9.4 9a3 3 0 1 1 4.6 2.5c-1.1.8-2 1.4-2 3"></path><path d="M4.5 5.6A9 9 0 1 1 7 19.5L3 21l1.4-4A9 9 0 0 1 4.5 5.6Z"></path></svg>`,
  link: `<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"></path></svg>`,
  database: `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="7" ry="3"></ellipse><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"></path><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"></path></svg>`,
  scale: `<svg viewBox="0 0 24 24"><path d="M12 3v18"></path><path d="M5 6h14"></path><path d="M6 6 3 13h6z"></path><path d="m18 6-3 7h6z"></path></svg>`,
  chart: `<svg viewBox="0 0 24 24"><path d="M4 19h16"></path><path d="M7 16V9"></path><path d="M12 16V5"></path><path d="M17 16v-6"></path><path d="m7 9 5-4 5 5"></path></svg>`,
  trophy: `<svg viewBox="0 0 24 24"><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10v5a5 5 0 0 1-10 0z"></path><path d="M7 6H4v2a3 3 0 0 0 3 3"></path><path d="M17 6h3v2a3 3 0 0 1-3 3"></path><path d="m12 7 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5L11 9z"></path></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-8"></path></svg>`,
  lock: `<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>`,
  cap: `<svg viewBox="0 0 24 24"><path d="m3 8 9-4 9 4-9 4z"></path><path d="M7 10v5c0 1.7 2.2 3 5 3s5-1.3 5-3v-5"></path></svg>`,
  badgeFoot: `<svg viewBox="0 0 24 24"><path d="M8.2 6.2c.7-1 2.4-.8 3 .3.7 1.4.2 3.5-1 4.4-.8.6-2 .4-2.7-.5-.8-1.1-.2-3.1.7-4.2Z"></path><path d="M15.8 5.4c1-.8 2.6-.2 2.9 1.1.4 1.6-.6 3.5-2 4-.9.4-2-.1-2.4-1.2-.5-1.3.4-3.1 1.5-3.9Z"></path><path d="M5.6 14.5c1.2-1.4 3.5-1.2 4.6.2 1.1 1.5.4 3.7-1.4 4.4-1.5.6-3.5-.3-4-1.9-.3-1 .1-2 .8-2.7Z"></path><path d="M14.1 15.1c1.2-1.5 3.7-1.4 4.8.2 1.1 1.6.2 3.9-1.7 4.4-1.5.4-3.3-.5-3.7-2-.2-.9 0-1.9.6-2.6Z"></path></svg>`,
  cube: `<svg viewBox="0 0 24 24"><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9z"></path><path d="M12 11 4.5 6.8"></path><path d="M12 11v9"></path><path d="m12 11 7.5-4.2"></path></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m16 16 4 4"></path></svg>`
};

const missions = [
  { id: 1, title: "How does ChatGPT read?", desc: "Learn how text is broken into tokens.", href: "mission-1-tokenisation.html", icon: "token", color: "violet", badge: "First Steps" },
  { id: 2, title: "Can you think like ChatGPT?", desc: "Predict the next token using probability.", href: "mission-2-next-token.html", icon: "bolt", color: "blue", badge: "Predictor" },
  { id: 3, title: "Why does ChatGPT make mistakes?", desc: "Discover hallucinations and probabilistic errors.", href: "#", icon: "question", color: "orange", badge: "AI Detective" },
  { id: 4, title: "Why does context matter?", desc: "See how earlier words change the meaning.", href: "#", icon: "link", color: "pink" },
  { id: 5, title: "Train your own AI", desc: "Add training data and see how it changes the model.", href: "#", icon: "database", color: "green", badge: "Data Collector" },
  { id: 6, title: "Can AI be biased?", desc: "Explore how bias in data leads to biased outputs.", href: "#", icon: "scale", color: "yellow" }
];

const skills = [
  ["tokenisation", "Tokens & Tokenisation", "token", "violet"],
  ["next-token-prediction", "Next-token Prediction", "bolt", "blue"],
  ["probability", "Probability & Sampling", "chart", "orange"],
  ["context", "Context & Meaning", "link", "pink"],
  ["training-data", "Training Data Influence", "database", "green"],
  ["bias", "Bias & Fairness", "scale", "yellow"]
];

const badges = [
  { title: "First Steps", mission: "Mission 1", icon: "badgeFoot", earnedBy: 1 },
  { title: "Predictor", mission: "Mission 2", icon: "bolt", earnedBy: 2 },
  { title: "Data Collector", mission: "Mission 5", icon: "cube", earnedBy: 5 },
  { title: "AI Detective", mission: "Mission 6", icon: "search", earnedBy: 6 }
];

let toastTimer;

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
    return {
      ...base,
      ...saved,
      missions: { ...base.missions, ...(saved.missions || {}) }
    };
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

function icon(name) {
  return icons[name] || icons.question;
}

function isUnlocked(state, missionId) {
  return missionId === 1 || state.missions[missionId - 1]?.completed;
}

function completedCount(state) {
  return missions.filter((mission) => state.missions[mission.id]?.completed).length;
}

function renderMissions(state) {
  const container = document.querySelector("#missionSequence");
  container.innerHTML = "";

  missions.forEach((mission) => {
    const progress = Math.round(state.missions[mission.id]?.progress || 0);
    const completed = progress >= 100 || state.missions[mission.id]?.completed;
    const unlocked = isUnlocked(state, mission.id);
    const card = document.createElement("a");
    card.className = `mission-sequence-card ${completed ? "completed" : ""} ${unlocked && !completed ? "active-mission" : ""} ${!unlocked ? "locked-mission" : ""}`;
    card.href = unlocked ? mission.href : "#";
    if (!unlocked) {
      card.dataset.locked = `Complete Mission ${mission.id - 1} to unlock this mission.`;
    }

    const action = completed
      ? `<button class="complete-check" type="button" data-badge="Mission completed! You earned the ${mission.badge || "mission"} badge.">${icon("check")}</button>`
      : unlocked
        ? `<span class="continue-pill">${progress > 0 ? "Continue" : "Start"}</span>`
        : `<span class="locked-pill">${icon("lock")} Locked</span>`;

    card.innerHTML = `
      <span class="mission-big-icon ${mission.color}">${icon(mission.icon)}</span>
      <span class="mission-sequence-copy"><strong>${mission.id}. ${mission.title}</strong><small>${mission.desc}</small></span>
      <span class="tiny-progress"><span style="width:${progress}%"></span></span>
      <span class="mission-score">${progress}%</span>
      ${action}
      <span class="chevron">›</span>
    `;
    container.appendChild(card);
  });

  const finalUnlocked = completedCount(state) === 6;
  const final = document.createElement("a");
  final.className = `final-mission-card ${finalUnlocked ? "unlocked-final" : ""}`;
  final.href = finalUnlocked ? "/final-challenge" : "#";
  if (!finalUnlocked) {
    final.dataset.locked = "Complete all 6 missions to unlock the Final Challenge.";
  }
  final.innerHTML = `
    <span class="final-trophy">${icon("trophy")}</span>
    <span><strong>Final Challenge: AI Literacy Escape Room</strong><small>Complete all 6 missions to unlock the final challenge and test your AI knowledge!</small></span>
    <span class="final-locked-pill">${finalUnlocked ? "Start Final Challenge" : `${icon("lock")} Locked`}</span>
  `;
  container.appendChild(final);
}

function renderProgress(state) {
  const count = completedCount(state);
  const levelProgress = Math.min(100, Math.round((state.xp / 2000) * 100));
  document.querySelector("#completedCount").textContent = `${count} / 6`;
  document.querySelector("#summaryXp").textContent = `${state.xp} XP`;
  document.querySelector("#profileXpText").textContent = `${state.xp} / 2000 XP`;
  document.querySelector("#profileXpBar").style.width = `${levelProgress}%`;
  document.documentElement.style.setProperty("--mission-progress-angle", `${(count / 6) * 360}deg`);
  document.querySelectorAll(".status-pill").forEach((pill) => {
    if (pill.textContent.includes("XP")) {
      pill.querySelector(".status-text").textContent = `${state.xp} XP`;
    }
  });
}

function renderSkills() {
  const panel = document.querySelector("#learnPanel");
  skills.forEach(([slug, label, iconName, color]) => {
    const link = document.createElement("a");
    link.href = `/glossary#${slug}`;
    link.dataset.route = `/glossary#${slug}`;
    link.innerHTML = `<span class="skill-icon ${color}">${icon(iconName)}</span>${label}`;
    panel.appendChild(link);
  });
}

function renderBadges(state) {
  const row = document.querySelector("#badgeRow");
  row.innerHTML = "";
  badges.forEach((badge) => {
    const earned = state.missions[badge.earnedBy]?.completed;
    const available = isUnlocked(state, badge.earnedBy);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.popover = earned
      ? `Earned by completing ${badge.mission}.`
      : `Complete ${badge.mission} to earn this badge.`;
    button.innerHTML = `
      <span class="hex-badge ${earned ? "earned" : available ? "active" : "locked"}">${icon(badge.icon)}</span>
      <strong>${badge.title}</strong>
      <small>${badge.mission}</small>
    `;
    row.appendChild(button);
  });
}

function toggleProfileMenu() {
  const menu = document.querySelector("#profileMenu");
  const open = menu.classList.toggle("open");
  menu.setAttribute("aria-hidden", String(!open));
}

function bindClicks() {
  document.addEventListener("click", (event) => {
    const completeCheck = event.target.closest(".complete-check");
    if (completeCheck) {
      event.preventDefault();
      event.stopPropagation();
      showToast(completeCheck.dataset.badge);
      return;
    }

    const locked = event.target.closest("[data-locked]");
    if (locked) {
      event.preventDefault();
      showToast(locked.dataset.locked);
      return;
    }

    const popover = event.target.closest("[data-popover]");
    if (popover) {
      event.preventDefault();
      showToast(popover.dataset.popover);
      return;
    }

    const bell = event.target.closest(".bell-button");
    if (bell) {
      event.preventDefault();
      showToast("Notifications: Mission 2 is ready to continue. Complete missions to unlock the final challenge.");
      return;
    }

    const profileButton = event.target.closest(".profile-menu-button");
    if (profileButton) {
      event.preventDefault();
      toggleProfileMenu();
      return;
    }

    const menuAction = event.target.closest("[data-menu-action]");
    if (menuAction) {
      event.preventDefault();
      if (menuAction.dataset.menuAction === "reset") {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
        return;
      }
      showToast(menuAction.textContent.trim());
      return;
    }

    const route = event.target.closest("[data-route]");
    if (route) {
      event.preventDefault();
      showToast(`Open ${route.dataset.route}`);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const state = getState();
  renderMissions(state);
  renderProgress(state);
  renderSkills();
  renderBadges(state);
  bindClicks();
});
