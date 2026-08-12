(function () {
  const STORAGE_KEY = "aiExplorerProgress";

  const navItems = [
    ["home", "Home", "index.html", "icon-home"],
    ["missions", "Missions", "missions.html", "icon-target"],
    ["progress", "Progress", "/progress", "icon-chart"],
    ["badges", "Badges", "/badges", "icon-badge"],
    ["glossary", "Glossary", "/glossary", "icon-book"],
    ["about", "About", "/about", "icon-info"]
  ];

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

  function completedCount(state = getState()) {
    return Object.values(state.missions || {}).filter((mission) => mission.completed).length;
  }

  function activePage() {
    const path = window.location.pathname;
    if (path.endsWith("index.html") || path === "/" || path.endsWith("/postgraduate_prj/")) return "home";
    if (path.includes("mission") || path.endsWith("missions.html")) return "missions";
    return document.body.dataset.activePage || "home";
  }

  function robotLogo() {
    return `
      <span class="robot-logo" aria-hidden="true">
        <span class="antenna"></span>
        <span class="robot-face"><span></span></span>
      </span>
    `;
  }

  function avatarMarkup(extraClass = "") {
    return `
      <span class="avatar ${extraClass}" aria-hidden="true">
        <span class="avatar-hair"></span>
        <span class="avatar-face"></span>
      </span>
    `;
  }

  function renderSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    const state = getState();
    const active = activePage();
    const xpPercent = Math.min(100, Math.round((state.xp / 2000) * 100));
    const includeTip = active === "home";

    sidebar.innerHTML = `
      <a class="logo" href="index.html" aria-label="LLM Explorer dashboard">
        ${robotLogo()}
        <span class="logo-copy"><strong>LLM Explorer</strong><small>How ChatGPT Thinks</small></span>
      </a>

      <nav class="side-nav">
        ${navItems.map(([key, label, href, iconClass]) => `
          <a class="${active === key ? "active" : ""}" href="${href}" ${href.startsWith("/") ? `data-route="${href}"` : ""}>
            <span class="nav-icon ${iconClass}"></span>${label}
          </a>
        `).join("")}
      </nav>

      <div class="sidebar-bottom">
        <a class="profile-card" href="/profile" data-route="/profile" aria-label="Open profile">
          ${avatarMarkup()}
          <span class="profile-copy"><strong>Explorer</strong><em>Level 3</em></span>
          <span class="xp-track"><span class="js-profile-xp-bar" style="width:${xpPercent}%"></span></span>
          <small class="js-profile-xp-text">${state.xp} / 2000 XP</small>
        </a>
        ${includeTip ? `
          <section class="tip-card">
            <h2><span class="tip-icon">💡</span>Tip of the day</h2>
            <p>ChatGPT predicts tokens one by one, not whole sentences!</p>
          </section>
        ` : ""}
      </div>
    `;
  }

  function syncStatus() {
    const state = getState();
    document.querySelectorAll(".js-xp-text, #topXp, #summaryXp").forEach((node) => {
      node.textContent = `${state.xp} XP`;
    });
    document.querySelectorAll(".js-streak-text, #topStreak").forEach((node) => {
      node.textContent = `${state.streak} day streak`;
    });
    document.querySelectorAll(".js-profile-xp-text, #homeProfileXpText, #profileXpText").forEach((node) => {
      node.textContent = `${state.xp} / 2000 XP`;
    });
    const xpPercent = Math.min(100, Math.round((state.xp / 2000) * 100));
    document.querySelectorAll(".js-profile-xp-bar, #homeProfileXpBar, #profileXpBar").forEach((node) => {
      node.style.width = `${xpPercent}%`;
    });
  }

  function bindSharedRoutes() {
    document.addEventListener("click", (event) => {
      const route = event.target.closest("[data-route]");
      if (!route) return;
      const path = route.dataset.route;
      if (path === "/missions") {
        event.preventDefault();
        window.location.href = "missions.html";
      }
    });
  }

  function init() {
    saveState(getState());
    renderSidebar();
    syncStatus();
    bindSharedRoutes();
  }

  window.AIExplorer = {
    STORAGE_KEY,
    getState,
    saveState,
    completedCount,
    renderSidebar,
    syncStatus,
    avatarMarkup
  };

  document.addEventListener("DOMContentLoaded", init);
}());
