import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const STORAGE_KEY = "aiExplorerProgress";

const missionData = [
  { id: 1, title: "How does ChatGPT read?", short: "How does ChatGPT read?", desc: "Learn how text is broken into tokens.", route: "/mission/1-tokenisation", skill: "Tokens & Tokenisation", badge: "First Steps", icon: "wand" },
  { id: 2, title: "Can you think like ChatGPT?", short: "Can you think like ChatGPT?", desc: "Predict the next token using probability.", route: "/mission/2-next-token", skill: "Next-token Prediction", badge: "Predictor", icon: "bolt" },
  { id: 3, title: "Why does ChatGPT make mistakes?", short: "Why does ChatGPT make mistakes?", desc: "Discover hallucinations and probabilistic errors.", route: "/mission/3-hallucination", skill: "Probability & Sampling", badge: "AI Detective", icon: "question" },
  { id: 4, title: "Why does context matter?", short: "Why does context matter?", desc: "See how earlier words change the meaning.", route: "/mission/4-context", skill: "Context & Meaning", icon: "link" },
  { id: 5, title: "Train your own AI", short: "Train your own AI", desc: "Add training data and see how it changes the model.", route: "/mission/5-training-data", skill: "Training Data Influence", badge: "Data Collector", icon: "database" },
  { id: 6, title: "Can AI be biased?", short: "Can AI be biased?", desc: "Explore how bias in data leads to biased outputs.", route: "/mission/6-bias", skill: "Bias & Fairness", badge: "Bias Detective", icon: "scale" }
];

const questions = [
  { context: "The cat sat on the", display: "The cat sat on the ____.", options: ["mat", "moon", "pizza", "computer"], correct: "mat", base: { mat: 72, floor: 18, chair: 7, pizza: 3 } },
  { context: "I drink coffee every", display: "I drink coffee every ____.", options: ["morning", "planet", "shoe", "keyboard"], correct: "morning", base: { morning: 68, day: 17, night: 10, week: 5 } },
  { context: "She opened the book and started to", display: "She opened the book and started to ____.", options: ["read", "swim", "melt", "sleep"], correct: "read", base: { read: 64, write: 16, learn: 12, sleep: 8 } },
  { context: "The teacher wrote on the", display: "The teacher wrote on the ____.", options: ["board", "cloud", "sandwich", "moon"], correct: "board", base: { board: 70, paper: 17, screen: 9, wall: 4 } },
  { context: "For homework, check your", display: "For homework, check your ____.", options: ["answer", "banana", "spaceship", "pillow"], correct: "answer", base: { answer: 62, work: 20, source: 13, spelling: 5 } },
  { context: "The dog chased the", display: "The dog chased the ____.", options: ["ball", "planet", "keyboard", "cloud"], correct: "ball", base: { ball: 66, cat: 15, stick: 12, car: 7 } },
  { context: "Please close the", display: "Please close the ____.", options: ["door", "banana", "river", "idea"], correct: "door", base: { door: 74, window: 17, book: 6, file: 3 } },
  { context: "She wore a warm", display: "She wore a warm ____.", options: ["coat", "computer", "pizza", "question"], correct: "coat", base: { coat: 69, jacket: 18, scarf: 10, hat: 3 } }
];

const detectiveCards = ["Penguins can fly.", "The Sun is made of ice.", "Water freezes at 0°C.", "The Moon orbits Earth."];
const detectiveTrueFacts = ["Water freezes at 0°C.", "The Moon orbits Earth."];
const detectiveFalseFacts = ["Penguins can fly.", "The Sun is made of ice."];

function shuffleList(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function defaultProgress() {
  return {
    xp: 1200,
    streak: 7,
    missions: Object.fromEntries(missionData.map((m) => [m.id, { progress: 0, completed: false }]))
  };
}

function readProgress() {
  const base = defaultProgress();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...base, ...saved, missions: { ...base.missions, ...(saved.missions || {}) } };
  } catch {
    return base;
  }
}

function writeProgress(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function readLearningNotes() {
  try {
    const notes = JSON.parse(localStorage.getItem("aiExplorerLearningNotes") || "[]");
    if (Array.isArray(notes)) return notes;
  } catch {
    // Ignore malformed local notes and fall back to an empty list.
  }
  return [];
}

function saveLearningNote(note) {
  const notes = readLearningNotes();
  const next = [
    { ...note, savedAt: new Date().toISOString() },
    ...notes.filter((item) => item.id !== note.id)
  ];
  localStorage.setItem("aiExplorerLearningNotes", JSON.stringify(next));
  return next;
}

function completedCount(progress) {
  return missionData.filter((mission) => progress.missions[mission.id]?.completed).length;
}

function Icon({ name, className = "" }) {
  const paths = {
    home: <><path d="M3 10.6 12 3l9 7.6v9.9h-5.6v-6.4H8.6v6.4H3z" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="m15.8 8.2 4-4M17.4 4h2.4v2.4M12 12l4.2-4.2" /></>,
    chart: <><path d="M4 20h17M6 17V9M12 17V5M18 17v-7" /></>,
    award: <><path d="M8 14 6.5 21l5.5-3 5.5 3L16 14" /><circle cx="12" cy="9" r="6" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H7a3 3 0 0 0-3 3zM4 5.5V22M8 7h8M8 11h6" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
    star: <path d="m12 2.5 2.9 6 6.6 1-4.8 4.7 1.1 6.6-5.8-3.1-5.8 3.1 1.1-6.6-4.8-4.7 6.6-1z" />,
    flame: <path d="M13.7 2.5c.6 3.7-2.1 5-1 7.7 1.2-1.2 2-2.6 2.2-4.1 3.2 2.4 5 5.4 5 8.3A7.7 7.7 0 0 1 12 22a7.7 7.7 0 0 1-7.9-7.6c0-3.1 1.8-5.5 4.3-7.6-.2 2.1.4 3.8 1.9 5.1C9.7 8.1 11 5 13.7 2.5z" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" /><path d="M10 21h4" /></>,
    bookmark: <path d="M6 4h12v17l-6-3-6 3z" />,
    wand: <><path d="m4 20 10-10M12 4l.8 2.2L15 7l-2.2.8L12 10l-.8-2.2L9 7l2.2-.8zM18 2l.6 1.5L20 4l-1.4.5L18 6l-.6-1.5L16 4l1.4-.5zM19 11l.8 2.2L22 14l-2.2.8L19 17l-.8-2.2L16 14l2.2-.8z" /></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6z" />,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    check: <path d="m5 12 4 4 10-10" />,
    trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" /></>,
    shield: <path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    scale: <><path d="M12 3v18M5 6h14M6 6l-3 7h6zm12 0-3 7h6z" /></>,
    rocket: <path d="M14 4c2.5-.9 4.8-.7 6-.3.4 1.2.6 3.5-.3 6l-6.9 6.9-5.4-5.4zM7.5 14.5 5 19l4.5-2.5M9 7 5 8.5 3.5 12l4.7-.8M17 15l-.8 4.7L19.5 18l1.5-4" />,
    database: <><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
    question: <><path d="M12 17h.01" /><path d="M9.4 9a3 3 0 1 1 4.6 2.5c-1.1.8-2 1.4-2 3" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    gear: <><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
    bulb: <><path d="M9 18h6M10 22h4M8 14.5A6 6 0 1 1 16 14.5c-1.1.8-1.6 1.8-1.8 3.5H9.8c-.2-1.7-.7-2.7-1.8-3.5Z" /><path d="M12 2v2M4.9 4.9l1.4 1.4M19.1 4.9l-1.4 1.4" /></>,
    message: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v5A3.5 3.5 0 0 1 16.5 14H11l-5 5v-5.4A3.5 3.5 0 0 1 4 10.5z" /><path d="M8 8h.01M12 8h.01M16 8h.01" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></>,
    puzzle: <><path d="M9 3h6v4.1a2.1 2.1 0 1 1 0 3.8V15h-4.1a2.1 2.1 0 1 0-3.8 0H3V9h4.1a2.1 2.1 0 1 1 0-3.8V3z" /><path d="M15 15v6H9v-4.1a2.1 2.1 0 1 1-3.8 0H3V15" /></>,
    brain: <><path d="M9 4.5A3.5 3.5 0 0 0 5.8 9 3.8 3.8 0 0 0 7 16.2V19a2 2 0 0 0 4 0V5.5A2.7 2.7 0 0 0 9 4.5Z" /><path d="M15 4.5A3.5 3.5 0 0 1 18.2 9 3.8 3.8 0 0 1 17 16.2V19a2 2 0 0 1-4 0V5.5a2.7 2.7 0 0 1 2-1Z" /><path d="M7.2 9.2h3.2M13.6 9.2h3.2M8 14h2.5M13.5 14H16" /></>,
    alert: <><path d="M12 3 22 20H2z" /><path d="M12 9v5M12 17h.01" /></>,
    ghost: <><path d="M5 21V9a7 7 0 0 1 14 0v12l-3-2-2 2-2-2-2 2-2-2z" /><path d="M9 10h.01M15 10h.01M10 15c1.2 1 2.8 1 4 0" /></>,
    server: <><rect x="4" y="4" width="16" height="6" rx="2" /><rect x="4" y="14" width="16" height="6" rx="2" /><path d="M8 7h.01M8 17h.01M12 7h4M12 17h4" /></>,
    flask: <><path d="M10 3h4M10.8 3v5.4L5.2 18a2.1 2.1 0 0 0 1.8 3.1h10a2.1 2.1 0 0 0 1.8-3.1l-5.6-9.6V3" /><path d="M7.6 15.2h8.8" /><path d="M9.2 18h5.6" /><circle cx="12.2" cy="12.4" r="1.1" /></>,
    calculator: <><rect x="5" y="3" width="14" height="18" rx="2.4" /><path d="M8 7h8" /><rect x="8" y="10.5" width="2.2" height="2.2" rx=".5" /><rect x="12" y="10.5" width="2.2" height="2.2" rx=".5" /><rect x="16" y="10.5" width="2.2" height="2.2" rx=".5" /><rect x="8" y="14.5" width="2.2" height="2.2" rx=".5" /><rect x="12" y="14.5" width="2.2" height="2.2" rx=".5" /><rect x="16" y="14.5" width="2.2" height="2.2" rx=".5" /></>,
    storybook: <><path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h13v16H7a3 3 0 0 0-2.5 1.3z" /><path d="M4.5 5.5v14.8" /><path d="M8 7h8M8 10h6" /><path d="M15 14l1.2 1.8 2.3-3.6" /></>,
    person: <><circle cx="12" cy="7" r="3.4" /><path d="M6.2 20.5a5.8 5.8 0 0 1 11.6 0" /><path d="M12 10.8v4.8" /><path d="M9.6 15.4h4.8" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M4 10h16" /><path d="M8 14h2M12 14h2M16 14h.01M8 17h2M12 17h2" /></>
  };
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function RobotLogo() {
  return <span className="robot-logo"><span className="antenna" /><span className="robot-face"><span /></span></span>;
}

function Avatar({ small = false }) {
  return <span className={`avatar ${small ? "small-avatar" : ""}`}><span className="avatar-hair" /><span className="avatar-face" /></span>;
}

function StickerIcon({ name, tone = "purple", className = "" }) {
  return <span className={`sticker-icon ${tone} ${className}`}><Icon name={name} /></span>;
}

function Mascot({ type = "pointing" }) {
  const src = type === "reading"
    ? "/assets/img/mission-robot-reading.png"
    : type === "hallucination"
      ? "/assets/img/mission3-robot-hallucination.png"
      : type === "missions"
        ? "/assets/img/missions-robot-target.png"
        : type === "training"
          ? "/assets/img/mission5-robot-training.png"
      : "/assets/img/mission-robot-pointing.png";
  if (type === "training") {
    return <span className="mascot training-mascot"><img src={src} alt="Friendly AI Explorer robot" /><span className="data-orbit" aria-hidden="true"><i>DATA</i><i>101</i><i>✓</i></span></span>;
  }
  if (type === "detective" || type === "idea") {
    return <span className={`mascot detective-mascot ${type === "idea" ? "idea-mascot" : ""}`}><img src="/assets/img/mission-robot-pointing.png" alt="Friendly AI Explorer robot" />{type === "detective" ? <><span className="detective-lens" aria-hidden="true"><Icon name="search" /></span><span className="pattern-sparks" aria-hidden="true"><i /><i /><i /></span></> : <span className="idea-bulb" aria-hidden="true"><Icon name="bulb" /></span>}</span>;
  }
  return <img className="mascot" src={src} alt="Friendly AI Explorer robot" />;
}

function MountainIllustration() {
  return (
    <svg className="mountain-art" viewBox="0 0 180 72" aria-hidden="true">
      <path d="M0 64h180v8H0z" fill="#eef4ff" />
      <path d="M28 58 66 12l38 46H28Z" fill="#b6c2ff" />
      <path d="m66 12 13 16-12-5-10 5 9-16Z" fill="#fff7cf" />
      <path d="M81 58 112 26l31 32H81Z" fill="#9eacef" />
      <path d="M8 60 28 38l20 22H8Z" fill="#d8e2ff" />
      <path d="M70 8h3v28h-3z" fill="#f4a72f" />
      <path d="M73 8h24l-7 8 7 8H73z" fill="#f4a72f" />
      <path d="M18 20c8-6 17-6 25 0M129 18c7-5 15-5 22 0" stroke="#e7eefc" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function PlantIllustration() {
  return (
    <svg className="plant-art" viewBox="0 0 72 88" aria-hidden="true">
      <path d="M34 57c.5-15 5-27 13-38M35 58C29 45 22 37 12 31" stroke="#72cda4" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M47 20c11-8 17-18 17-18 3 15-2 25-14 31-5 2-9-9-3-13Z" fill="#6bd0a7" />
      <path d="M18 30C7 26 1 18 1 18c14-3 24 2 31 13 3 5-9 8-14-1Z" fill="#82dab6" />
      <path d="M44 45c11-4 20-2 20-2-7 11-16 15-27 12-5-2 1-8 7-10Z" fill="#62c998" />
      <path d="M22 60h36l-5 24H27z" fill="#cfd6e5" />
      <path d="M18 55h44v10H18z" fill="#e5e9f2" />
    </svg>
  );
}

function RiverIllustration() {
  return (
    <svg className="river-art" viewBox="0 0 150 110" aria-hidden="true">
      <defs>
        <linearGradient id="riverSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#cfefff" />
          <stop offset="1" stopColor="#eff9ff" />
        </linearGradient>
        <linearGradient id="riverWater" x1="0" x2="1">
          <stop offset="0" stopColor="#64c4ee" />
          <stop offset="1" stopColor="#3a9bdd" />
        </linearGradient>
      </defs>
      <rect x="10" y="8" width="130" height="94" rx="22" fill="url(#riverSky)" />
      <path d="M18 78c22-12 39-15 59-8 20 8 34 3 55-10v38H18z" fill="#86d68f" />
      <path d="M16 82c30-26 51-22 69-8 16 12 30 9 48-9" fill="none" stroke="url(#riverWater)" strokeWidth="18" strokeLinecap="round" />
      <path d="M16 82c30-26 51-22 69-8 16 12 30 9 48-9" fill="none" stroke="#bfeeff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
      <path d="M28 67 45 47l19 20zM92 65l18-20 24 20z" fill="#66bd73" />
      <path d="M20 39c9-8 19-8 28 0M93 33c9-8 19-8 28 0" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M54 62c0-10 13-10 13 0M108 58c0-9 12-9 12 0" stroke="#4baa59" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function Sidebar({ route, progress, navigate }) {
  const nav = [
    ["dashboard", "Home", "/dashboard", "home"],
    ["missions", "Missions", "/missions", "target"],
    ["progress", "Progress", "/progress", "chart"],
    ["badges", "Badges", "/badges", "award"],
    ["glossary", "Glossary", "/glossary", "book"],
    ["about", "About", "/about", "info"]
  ];
  return (
    <aside className="sidebar">
      <button className="logo reset-buttonish" onClick={() => navigate("/dashboard")}>
        <RobotLogo />
        <span><strong>AI Explorer</strong><small>How ChatGPT Thinks</small></span>
      </button>
      <nav className="side-nav">
        {nav.map(([key, label, href, icon]) => (
          <button key={key} className={routeGroup(route) === key ? "active" : ""} onClick={() => navigate(href)}>
            <Icon name={icon} />{label}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="profile-card reset-buttonish" onClick={() => navigate("/profile")}>
          <Avatar />
          <span className="profile-copy"><strong>Explorer</strong><em>Level 3</em></span>
          <span className="xp-track"><span style={{ width: `${Math.min(100, progress.xp / 20)}%` }} /></span>
          <small>{progress.xp} / 2000 XP</small>
        </button>
        {routeGroup(route) === "dashboard" && <section className="tip-card"><h2>Tip of the day</h2><p>ChatGPT predicts tokens one by one, not whole sentences!</p></section>}
      </div>
    </aside>
  );
}

function routeGroup(route) {
  if (route === "/" || route === "/dashboard") return "dashboard";
  if (route === "/missions" || route.startsWith("/mission")) return "missions";
  if (route === "/activity" || route.startsWith("/progress")) return "progress";
  return route.replace("/", "") || "dashboard";
}

function TopBar({ route, progress, navigate, notify, resetProgress }) {
  const [open, setOpen] = useState(false);
  const isProgressLike = route === "/progress" || route === "/activity";
  return (
    <header className={`topbar ${isProgressLike ? "progress-topbar" : ""}`}>
      {route === "/progress" ? <><button className="outline" onClick={() => navigate("/missions")}>‹ Back to Missions</button><strong className="topbar-title">Your Progress</strong></> : route === "/activity" ? <><button className="outline" onClick={() => navigate("/progress")}>‹ Back to Progress</button><strong className="topbar-title">All Activity</strong></> : <div />}
      <div className="top-actions">
        <button className="status-pill" onClick={() => notify("XP shows your learning progress. Complete missions to earn more XP.")}><Icon name="star" className="star" />{progress.xp} XP</button>
        <button className="status-pill" onClick={() => notify(`You have learned for ${progress.streak} days in a row.`)}><Icon name="flame" className="flame" />{progress.streak} day streak</button>
        <button className="icon-button" onClick={() => notify("Notifications: your mission progress is saved.")}><Icon name="bell" /><em>2</em></button>
        <button className="avatar-button" onClick={() => isProgressLike ? navigate("/profile") : setOpen(!open)}><Avatar small /><span>⌄</span></button>
        {open && <div className="profile-menu"><button onClick={() => notify("Profile")}>Profile</button><button onClick={() => notify("Settings")}>Settings</button><button onClick={resetProgress}>Reset Progress</button></div>}
      </div>
    </header>
  );
}

function Shell({ route, progress, navigate, notify, resetProgress, children }) {
  const isMissionPage = route.startsWith("/mission/");
  return <div className="app-shell"><Sidebar route={route} progress={progress} navigate={navigate} /><main className="page">{!isMissionPage && <TopBar route={route} progress={progress} navigate={navigate} notify={notify} resetProgress={resetProgress} />}{children}</main></div>;
}

function ProgressPill({ children, type = "locked" }) {
  return <span className={`state-pill ${type}`}>{children}</span>;
}

function Dashboard({ progress, navigate, notify }) {
  const completed = completedCount(progress);
  const current = missionData.find((m) => isUnlocked(progress, m.id) && !progress.missions[m.id].completed) || missionData[5];
  const currentProgress = progress.missions[current.id]?.progress || 0;
  const badges = missionData.filter((m) => m.badge && progress.missions[m.id].completed).length;
  const goalDone = completed > 0 || currentProgress > 0;
  return (
    <div className="dashboard-layout">
      <section className="main-column">
        <header className="welcome">
          <div><h1>Welcome back, Explorer! 👋</h1><p><strong>Ready to continue your AI learning adventure?</strong></p><p>Pick up where you left off or explore something new.</p></div>
          <div className="welcome-art"><MountainIllustration /><Mascot /></div>
        </header>
        <section className="card continue-card">
          <h2><StickerIcon name="bookmark" tone="purple" className="tiny" />Continue Learning</h2>
          <div className="continue-inner">
            <div><h3>Mission {current.id}: {current.title}</h3><p>{current.desc}</p><div className="bar-row"><span className="bar"><span style={{ width: `${currentProgress}%` }} /></span><small>{currentProgress}% complete</small></div><button className="primary" onClick={() => navigate(current.route)}>Continue Mission</button></div>
            <div className="orb"><StickerIcon name={current.icon} tone="blue" className="hero-sticker" /></div>
          </div>
        </section>
        <LearningPath progress={progress} navigate={navigate} notify={notify} />
        <section className="card why-card"><h2>Why Learn About How ChatGPT Works?</h2><div className="why-grid">
          <Why icon="shield" tone="purple" title="Use AI Responsibly" text="Understand limitations and avoid over-trusting AI answers." />
          <Why icon="search" tone="green" title="Think Critically" text="Evaluate AI outputs and detect when it might be wrong." />
          <Why icon="scale" tone="orange" title="Spot Bias" text="Learn how bias can appear in AI and how to reduce it." />
          <Why icon="rocket" tone="blue" title="Build the Future" text="AI literacy is a key skill for the world ahead." />
        </div></section>
        <button className="card final-card" onClick={() => completed === 6 ? navigate("/final-challenge") : notify("Complete all 6 missions to unlock the Final Challenge.")}>
          <MountainIllustration />
          <span><strong>Finish all missions to become an AI Literacy Explorer!</strong><small>Complete the Final Challenge and earn your certificate.</small></span>
          <span className="primary">See Final Challenge</span>
        </button>
      </section>
      <aside className="right-column">
        <section className="card goal-card"><h2><StickerIcon name="target" tone="purple" className="tiny" />Today's Goal</h2><div className="goal-box"><strong>Complete one mission step</strong><span className="bar"><span style={{ width: goalDone ? "100%" : "0%" }} /></span><small>{goalDone ? 1 : 0} / 1 step completed</small><span className="goal-check"><Icon name="check" /></span></div><p>{goalDone ? "Great job! Come back tomorrow to keep your streak." : "Complete one step today to keep your streak moving."}</p><PlantIllustration /></section>
        <section className="card stats-card"><h2><StickerIcon name="chart" tone="purple" className="tiny" />Your Stats</h2><div className="stats-grid"><span><strong>{completed}</strong><small>Mission<br />Completed</small></span><span><strong>{badges}</strong><small>Badges<br />Earned</small></span><span><strong>{progress.xp}</strong><small>Total XP<br />Earned</small></span></div><button className="outline" onClick={() => navigate("/progress")}>View Progress ›</button></section>
        <Activity progress={progress} />
        <section className="card help-card"><span className="help-bubble">•••</span><div><h2>Need help?</h2><p>Check the Glossary or watch explainers to learn more.</p><button className="light" onClick={() => navigate("/glossary")}>Go to Glossary</button></div></section>
      </aside>
    </div>
  );
}

function Why({ icon, title, text, tone = "purple" }) {
  return <button className="why-item"><StickerIcon name={icon} tone={tone} /><strong>{title}</strong><small>{text}</small></button>;
}

function isUnlocked(progress, id) {
  return id === 1 || progress.missions[id - 1]?.completed;
}

function LearningPath({ progress, navigate, notify, compact = false }) {
  const completed = completedCount(progress);
  return (
    <section className={`card learning-card ${compact ? "compact" : ""}`}>
      <h2><StickerIcon name="book" tone="purple" className="tiny" />Learning Path</h2>
      <div className="path-track">
        {missionData.map((m) => {
          const done = progress.missions[m.id].completed;
          const unlocked = isUnlocked(progress, m.id);
          const current = unlocked && !done;
          return <button key={m.id} className={`path-step ${done ? "done" : ""} ${current ? "current" : ""}`} onClick={() => unlocked ? navigate(m.route) : notify(`Complete Mission ${m.id - 1} first.`)}>
            <span className="path-node"><StickerIcon name={done ? "wand" : current ? m.icon : "lock"} tone={done ? "green" : current ? "blue" : "gray"} className="path-sticker" /></span>
            <strong>{m.id}</strong><small>{m.short}</small><ProgressPill type={done ? "done" : current ? "current" : "locked"}>{done ? "Completed" : current ? "In Progress" : "Locked"}</ProgressPill>
          </button>;
        })}
        <button className="path-step" onClick={() => completed === 6 ? navigate("/final-challenge") : notify("Complete all 6 missions first.")}><span className="path-node final-node"><StickerIcon name="trophy" tone="gray" className="path-sticker" /></span><strong>Final Challenge</strong><small>AI Literacy Escape Room</small><ProgressPill>Locked</ProgressPill></button>
      </div>
    </section>
  );
}

function Activity({ progress }) {
  const items = [];
  if (progress.missions[1].completed) items.push(["wand", "Completed Mission 1", "How does ChatGPT read?", "+100 XP", "2 days ago"]);
  if (progress.missions[2].progress > 0) items.push(["bolt", progress.missions[2].completed ? "Completed Mission 2" : "Started Mission 2", "Can you think like ChatGPT?", progress.missions[2].completed ? "+100 XP" : "+50 XP", "Yesterday"]);
  if (!items.length) items.push(["wand", "Ready to start Mission 1", "How does ChatGPT read?", "+50 XP", "Today"]);
  return <section className="card activity-card"><div className="row-title"><h2><StickerIcon name="clock" tone="purple" className="tiny" />Recent Activity</h2><button>View all</button></div>{items.slice(0, 2).map(([icon, title, desc, xp, time], index) => <div className="activity-item" key={title}><StickerIcon name={icon} tone={index === 0 ? "green" : "blue"} className="activity-sticker" /><div><strong>{title}</strong><small>{desc}</small></div><em>{xp}<small>{time}</small></em></div>)}</section>;
}

function MissionsPage({ progress, navigate, notify }) {
  const completed = completedCount(progress);
  return <div className="missions-layout"><section className="missions-main"><header className="page-hero missions-hero"><div><h1>All Missions</h1><p>Complete missions step by step to understand how ChatGPT works.<br />Finish all missions to unlock the Final Challenge!</p></div><Mascot type="missions" /></header><div className="mission-sequence">{missionData.map((m) => <MissionRow key={m.id} mission={m} progress={progress} navigate={navigate} notify={notify} />)}<button className="final-row" onClick={() => completed === 6 ? navigate("/final-challenge") : notify("Complete all 6 missions to unlock the Final Challenge.")}><MountainIllustration /><span><strong>Final Challenge: AI Literacy Escape Room</strong><small>Complete all 6 missions to unlock the final challenge and test your AI knowledge!</small></span><ProgressPill>Locked</ProgressPill></button></div></section><aside className="right-column"><section className="card ring-card"><h2>Your Progress</h2><div className="progress-ring" style={{ "--angle": `${completed / 6 * 360}deg` }}><strong>{completed} / 6</strong><small>Missions Completed</small></div></section><section className="card"><h2>What You’ll Learn</h2><div className="learn-list">{missionData.map((m) => <span key={m.id}><Icon name={m.icon} />{m.skill}</span>)}</div></section><Activity progress={progress} /></aside></div>;
}

function ProgressPage({ progress, navigate, notify }) {
  const completed = completedCount(progress);
  const inProgress = missionData.filter((m) => !progress.missions[m.id]?.completed && (progress.missions[m.id]?.progress || 0) > 0).length;
  const locked = missionData.filter((m) => !isUnlocked(progress, m.id)).length;
  const overall = Math.round((completed / missionData.length) * 100);
  const badges = missionData.filter((m) => m.badge && progress.missions[m.id]?.completed);
  const quizCount = completed * 2 + inProgress;
  const correctAnswers = completed * 5 + inProgress * 3;
  const stats = [
    ["star", progress.xp, "Total XP", () => notify("XP Breakdown: Mission Complete +100, Quiz Complete +20, Challenge +50.")],
    ["flame", progress.streak, "Day Streak", () => notify(`Current Streak: ${progress.streak} days. Longest Streak: 12 days.`)],
    ["target", quizCount, "Quizzes Taken", () => navigate("/quizzes")],
    ["check", correctAnswers, "Correct Answers", () => notify(`Accuracy: ${correctAnswers} / ${Math.max(32, correctAnswers)} answers.`)]
  ];
  return <div className="progress-page"><section className="progress-main"><div className="progress-summary-grid"><button className="card overall-card" onClick={() => navigate("/progress/details")}><h2>Overall Progress</h2><div className="overall-inner"><div className="progress-ring big" style={{ "--angle": `${overall / 100 * 360}deg` }}><strong>{overall}%</strong><small>Completed</small></div><div className="progress-legend"><span><i className="purple-dot" />Completed<b>{completed} / 6 Missions</b></span><span><i className="gold-dot" />In Progress<b>{inProgress} Mission{inProgress === 1 ? "" : "s"}</b></span><span><i />Locked<b>{locked} Mission{locked === 1 ? "" : "s"}</b></span></div></div></button><section className="card progress-stats-card"><h2>Your Stats</h2><div className="progress-stats-grid">{stats.map(([icon, value, label, action]) => <button key={label} onClick={action}><Icon name={icon} /><strong>{value}</strong><small>{label}</small></button>)}</div></section><section className="card learning-time-card"><h2>Learning Time</h2><div className="time-head"><Icon name="clock" /><strong>6h 45m</strong><small>Total Time Spent</small></div><div className="week-chart">{[["Mon", 54, "50m"], ["Tue", 34, "30m"], ["Wed", 64, "1h 05m"], ["Thu", 56, "55m"], ["Fri", 46, "45m"], ["Sat", 84, "1h 45m"], ["Sun", 12, "10m"]].map(([day, height, label]) => <button key={day} onClick={() => notify(`${day}: ${label}. Mission practice and quiz activity.`)}><span style={{ height: `${height}%` }} /><small>{day}</small></button>)}</div></section></div><section className="card mission-progress-card"><h2>Mission Progress</h2><div className="mission-table-head"><span>Mission</span><span>Progress</span><span>Score</span></div><div className="mission-progress-list">{missionData.map((mission) => <ProgressMissionRow key={mission.id} mission={mission} progress={progress} navigate={navigate} notify={notify} />)}</div><button className="progress-final-banner" onClick={() => completed === 6 ? navigate("/final-challenge") : notify(`Complete Mission ${completed + 1} first.`)}><Icon name="trophy" /><span><strong>{completed === 6 ? "Final Challenge unlocked!" : "Complete all missions to unlock the Final Challenge!"}</strong><small>{completed === 6 ? "You are ready for the escape room." : "You're almost there!"}</small></span><Icon name={completed === 6 ? "rocket" : "lock"} /></button></section></section><aside className="progress-right"><ProgressActivity progress={progress} navigate={navigate} notify={notify} /><section className="card achievements-card"><div className="row-title"><h2>Achievements</h2><button onClick={() => navigate("/badges")}>View all</button></div><div className="achievement-grid">{[["Aa", "Token Master", "Mission 1", 1, "wand"], ["•••", "Prediction Pro", "Mission 2", 2, "message"], ["", "Curious Learner", "Mission 3", 3, "bulb"]].map(([mark, title, detail, id, icon]) => { const earned = progress.missions[id]?.completed; return <button key={title} className={earned ? "earned" : ""} onClick={() => notify(earned ? `${title}: unlocked by completing ${detail}.` : `Complete ${detail} to unlock ${title}.`)}><span>{mark || <Icon name={icon} />}</span><strong>{title}</strong><small>{earned ? `Completed ${detail}` : `Locked: ${detail}`}</small></button>; })}</div></section></aside></div>;
}

function ProgressMissionRow({ mission, progress, navigate, notify }) {
  const state = progress.missions[mission.id] || { progress: 0, completed: false };
  const unlocked = isUnlocked(progress, mission.id);
  const status = state.completed ? "Completed" : state.progress > 0 ? "In Progress" : unlocked ? "Start" : "Locked";
  const score = state.completed ? 100 : state.progress > 0 ? Math.max(60, state.progress) : 0;
  return <button className={`progress-mission-row ${state.completed ? "done" : ""} ${state.progress > 0 && !state.completed ? "current" : ""}`} onClick={() => unlocked ? navigate(mission.route) : notify(`Complete Mission ${mission.id - 1} first.`)}><span className="mission-number">{mission.id}</span><span className="mission-art compact"><Icon name={mission.icon} /></span><span className="mission-copy"><strong>{mission.title}</strong><small>{mission.skill}</small></span><span className="mini-bar"><span style={{ width: `${state.progress}%` }} /></span><ProgressPill type={state.completed ? "done" : state.progress > 0 ? "current" : "locked"}>{status}</ProgressPill><span className="score-pill">{score}% <Icon name="star" className="star" /></span><Icon name={unlocked ? "link" : "lock"} /></button>;
}

function ProgressActivity({ progress, navigate, notify }) {
  const activities = [];
  missionData.forEach((mission) => {
    const state = progress.missions[mission.id];
    if (state?.completed) activities.unshift([mission.icon, `Completed Mission ${mission.id}`, mission.short, "+100 XP", mission.route, mission.id === 5 ? "2 hours ago" : "Yesterday"]);
    else if ((state?.progress || 0) > 0) activities.unshift([mission.icon, `Continued Mission ${mission.id}`, mission.short, "+50 XP", mission.route, "Today"]);
  });
  activities.push(["flame", "Maintained 7-day streak!", "Keep it up!", "+50 XP", "/streak", "Yesterday"]);
  return <section className="card progress-activity-card"><div className="row-title"><h2>Recent Activity</h2><button onClick={() => navigate("/activity")}>View all</button></div>{activities.slice(0, 4).map(([icon, title, desc, xp, route, time]) => <button className="activity-item" key={`${title}-${desc}`} onClick={() => route.startsWith("/mission") ? navigate(route) : notify(title)}><span><Icon name={icon} /></span><div><strong>{title}</strong><small>{desc}</small></div><em>{xp}<small>{time}</small></em></button>)}</section>;
}

function activityRecords(progress) {
  const generated = missionData.flatMap((mission) => {
    const state = progress.missions[mission.id];
    if (state?.completed) return [{ type: "Missions", mission: mission.id, icon: mission.icon, tone: "green", title: `Completed Mission ${mission.id}`, subtitle: mission.short, detail: `Mission ${mission.id}: ${mission.skill}`, xp: 100, time: mission.id === 5 ? "2 hours ago" : "Yesterday", route: mission.route }];
    if ((state?.progress || 0) > 0) return [{ type: "Missions", mission: mission.id, icon: mission.icon, tone: "green", title: `Started Mission ${mission.id}`, subtitle: mission.short, detail: `Mission ${mission.id}: ${mission.skill}`, xp: 0, time: "Today", route: mission.route }];
    return [];
  });
  return [
    ...generated,
    { type: "Quizzes", mission: 4, icon: "check", tone: "purple", title: "Quiz Completed (100%)", subtitle: "Mission 4: Why does context matter?", detail: "Score: 4/4", xp: 20, time: "Yesterday", route: "/progress" },
    { type: "Streaks", mission: 0, icon: "flame", tone: "orange", title: "Maintained 7-day streak!", subtitle: "Keep it up!", detail: "7 consecutive days", xp: 50, time: "Yesterday", route: "/progress" },
    { type: "Quizzes", mission: 2, icon: "target", tone: "blue", title: "Quiz Completed (80%)", subtitle: "Mission 2: Can you think like ChatGPT?", detail: "Score: 4/5", xp: 15, time: "2 days ago", route: "/mission/2-next-token" },
    { type: "Quizzes", mission: 6, icon: "message", tone: "purple", title: "Took a Quiz", subtitle: "Mission 6: Can AI be biased?", detail: "Score: 3/5", xp: 10, time: "3 days ago", route: "/mission/6-bias" },
    { type: "Glossary", mission: 0, icon: "book", tone: "green", title: "Read Glossary Term", subtitle: "Hallucination", detail: "Learned new term", xp: 5, time: "3 days ago", route: "/glossary" },
    { type: "Goal", mission: 0, icon: "bolt", tone: "blue", title: "Daily Goal Achieved", subtitle: "Complete 2 missions", detail: "Goal: 2/2", xp: 30, time: "3 days ago", route: "/dashboard" },
    { type: "Achievements", mission: 2, icon: "award", tone: "purple", title: "Earned Badge", subtitle: "Prediction Pro", detail: "Completed Mission 2", xp: 0, time: "3 days ago", route: "/badges" },
    { type: "System", mission: 0, icon: "person", tone: "lav", title: "Avatar Updated", subtitle: "Explorer profile", detail: "Profile changed", xp: 0, time: "Last week", route: "/profile" }
  ].map((record, index) => ({ ...record, id: index + 1 }));
}

function ActivityPage({ progress, navigate, notify }) {
  const [tab, setTab] = useState(() => localStorage.getItem("aiExplorerActivityTab") || "All Activity");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [missionFilter, setMissionFilter] = useState("All Missions");
  const [xpFilter, setXpFilter] = useState("All XP");
  const [savedNotes] = useState(readLearningNotes);
  const records = activityRecords(progress);
  const filtered = records.filter((item) => {
    const typeOk = filter === "All" || item.type === filter;
    const missionOk = missionFilter === "All Missions" || item.mission === Number(missionFilter.replace("Mission ", ""));
    const xpOk = xpFilter === "All XP" || item.xp >= Number(xpFilter.replace("+ XP", ""));
    return typeOk && missionOk && xpOk;
  });
  const perPage = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);
  const notes = savedNotes;
  function chooseTab(next) {
    setTab(next);
    localStorage.setItem("aiExplorerActivityTab", next);
  }
  function applyFilter(next) {
    setFilter(next);
    setPage(1);
  }
  function openActivity(item) {
    if (item.route) navigate(item.route);
    else notify(item.title);
  }
  return <div className="activity-page"><section className="activity-main"><div className="activity-tabs"><button className={tab === "All Activity" ? "active" : ""} onClick={() => chooseTab("All Activity")}>All Activity</button><button className={tab === "My Notes" ? "active" : ""} onClick={() => chooseTab("My Notes")}>My Notes <em>{savedNotes.length}</em></button></div>{tab === "All Activity" ? <><div className="activity-toolbar"><div className="activity-filters">{["All", "Missions", "Quizzes", "Streaks", "Achievements", "System"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => applyFilter(item)}>{item}</button>)}</div><button className="date-filter" onClick={() => notify("Date filter: Today, This Week, This Month, Custom Range.")}><Icon name="calendar" />May 12 – May 18, 2025⌄</button></div><section className="card activity-table-card"><h2>Recent Activity</h2><div className="activity-table-head"><span>Activity</span><span>Details</span><span>XP</span><span>Time</span></div><div className="activity-table-list">{visible.map((item) => <button className="activity-row" key={item.id} onClick={() => openActivity(item)}><span className={`activity-icon ${item.tone}`}><Icon name={item.icon} /></span><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><span>{item.detail}</span><b>{item.xp > 0 ? `+${item.xp} XP` : "+0 XP"}</b><time>{item.time}</time><Icon name="link" /></button>)}</div>{pageCount > 1 && <div className="activity-pagination"><button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button>{Array.from({ length: Math.min(pageCount, 4) }, (_, index) => index + 1).map((num) => <button key={num} className={page === num ? "active" : ""} onClick={() => setPage(num)}>{num}</button>)}{pageCount > 4 && <span>...</span>}{pageCount > 4 && <button onClick={() => setPage(pageCount)}>{pageCount}</button>}<button disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>›</button></div>}</section></> : <section className="card notes-card"><h2>My Notes</h2><p>Saved reflections from mission activities appear here.</p>{notes.length ? notes.map((item) => <button key={item.id} onClick={() => notify(`${item.mission}: ${item.title}`)}><strong>{item.mission} · {item.title}</strong><small>{item.prompt}</small><span>{item.note}</span></button>) : <div className="empty-notes"><Icon name="book" /><strong>No notes yet</strong><span>Save a reflection inside a mission and it will appear here.</span></div>}</section>}</section><ActivityAside records={records} filter={filter} setFilter={applyFilter} missionFilter={missionFilter} setMissionFilter={setMissionFilter} xpFilter={xpFilter} setXpFilter={setXpFilter} notify={notify} /></div>;
}

function ActivityAside({ records, filter, setFilter, missionFilter, setMissionFilter, xpFilter, setXpFilter, notify }) {
  const xpTotal = records.reduce((sum, item) => sum + item.xp, 0);
  const quizCount = records.filter((item) => item.type === "Quizzes").length;
  return <aside className="activity-right"><section className="card activity-summary-card"><h2>Activity Summary</h2><p>This Week (May 12 – May 18)</p><div className="summary-grid"><button onClick={() => setFilter("All")}><Icon name="calendar" /><strong>{records.length}</strong><small>Total Activities</small></button><button onClick={() => notify("XP earned from missions, quizzes, streaks and other activity.")}><Icon name="star" /><strong>{xpTotal}</strong><small>XP Earned</small></button><button onClick={() => setFilter("Quizzes")}><Icon name="target" /><strong>{quizCount}</strong><small>Quizzes Taken</small></button><button onClick={() => setFilter("Streaks")}><Icon name="flame" /><strong>7</strong><small>Day Streak</small></button></div></section><section className="card xp-sources-card"><h2>XP Sources</h2><div className="xp-source-body"><button className="source-ring" aria-label="XP sources chart" onClick={() => setFilter("Missions")} /><div className="source-list">{[["Missions", "62%", "210 XP", "purple"], ["Quizzes", "24%", "80 XP", "blue"], ["Streaks", "10%", "35 XP", "gold"], ["Others", "4%", "10 XP", "grey"]].map(([label, pct, xp, tone]) => <button key={label} onClick={() => setFilter(label === "Others" ? "All" : label)}><i className={tone} /><strong>{label}</strong><span>{pct} ({xp})</span></button>)}</div></div></section><section className="card activity-advanced-filter"><div className="row-title"><h2>Filter Activity</h2><button onClick={() => { setFilter("All"); setMissionFilter("All Missions"); setXpFilter("All XP"); }}>Clear all</button></div><button onClick={() => notify("Use the filter chips above to change activity type.")}><Icon name="grid" />{filter === "All" ? "All Activity Types" : filter}<span>⌄</span></button><select value={missionFilter} onChange={(event) => setMissionFilter(event.target.value)}>{["All Missions", ...missionData.map((mission) => `Mission ${mission.id}`)].map((item) => <option key={item}>{item}</option>)}</select><select value={xpFilter} onChange={(event) => setXpFilter(event.target.value)}>{["All XP", "100+ XP", "50+ XP", "20+ XP"].map((item) => <option key={item}>{item}</option>)}</select><button onClick={() => notify("Time filter: Today, This Week, This Month.")}><Icon name="calendar" />All Time<span>⌄</span></button></section></aside>;
}

function MissionRow({ mission, progress, navigate, notify }) {
  const state = progress.missions[mission.id];
  const unlocked = isUnlocked(progress, mission.id);
  const done = state.completed;
  return <button className={`mission-row ${unlocked ? "" : "locked"} ${done ? "done" : ""}`} onClick={() => unlocked ? navigate(mission.route) : notify(`Complete Mission ${mission.id - 1} first.`)}><span className="mission-art"><Icon name={mission.icon} /></span><span><strong>{mission.id}. {mission.title}</strong><small>{mission.desc}</small></span><span className="mini-bar"><span style={{ width: `${state.progress}%` }} /></span><b>{state.progress}%</b>{done ? <span className="done-check"><Icon name="check" /></span> : <ProgressPill type={unlocked ? "current" : "locked"}>{unlocked ? (state.progress ? "Continue" : "Start") : "Locked"}</ProgressPill>}</button>;
}

function Mission1({ progress, setProgress, navigate, notify }) {
  const [sentence, setSentence] = useState("Cats are amazing friends");
  const [tokens, setTokens] = useState(["Cats", "are", "amazing", "friends"]);
  const [source, setSource] = useState(["ice", "cream", "I", "love", "chocolate"]);
  const [drop, setDrop] = useState([]);
  const [tryDone, setTryDone] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [challengeResult, setChallengeResult] = useState("");
  const [challengeFeedback, setChallengeFeedback] = useState("");
  const [reflection, setReflection] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("token");
  const [readSections, setReadSections] = useState({ token: true });
  const colors = ["lav", "blue", "green", "yellow", "pink"];
  const exampleTokens = ["I", "love", "chocolate", "ice", "cream"];
  const challengeTokens = ["I", "love", "chocolate", "ice", "cream"];
  const sections = [
    ["token", "What is a token?"],
    ["see", "See how it is tokenized"],
    ["try", "Try it yourself"],
    ["training", "Training Stage"],
    ["challenge", "Mini Challenge"],
    ["summary", "Summary"]
  ];
  const summaryReached = Boolean(readSections.summary);
  const nextReady = tryDone && challengeResult === "correct" && summaryReached;
  const tokenClass = (token) => colors[Math.max(0, challengeTokens.indexOf(token)) % colors.length];
  const tokenize = (text) => {
    const clean = text.trim();
    if (/^unbelievable[.!?]?$/i.test(clean)) return ["un", "believ", "able", ...(clean.match(/[.!?]$/) || [])];
    return clean.match(/[A-Za-z]+(?:'[A-Za-z]+)?|\d+|[^\sA-Za-z\d]/g) || [];
  };
  const dragData = (from, index) => JSON.stringify({ from, index });
  const readDragData = (event) => {
    try {
      return JSON.parse(event.dataTransfer.getData("application/json"));
    } catch {
      return null;
    }
  };
  React.useEffect(() => {
    const container = document.querySelector(".mission-1 .mission-content");
    if (!container) return undefined;
    const update = () => {
      let current = sections[0][0];
      const containerTop = container.getBoundingClientRect().top;
      sections.forEach(([id]) => {
        const node = document.getElementById(`m1-${id}`);
        if (node && node.getBoundingClientRect().top - containerTop < 190) current = id;
      });
      setActiveSection(current);
      setReadSections((read) => ({ ...read, [current]: true }));
    };
    update();
    container.addEventListener("scroll", update, { passive: true });
    return () => container.removeEventListener("scroll", update);
  }, []);
  function scrollToSection(id) {
    document.getElementById(`m1-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function split() {
    const next = tokenize(sentence || "Cats are amazing friends");
    setTokens(next);
    setTryDone(true);
    notify("Tokenized! Now you can try the mini challenge.");
  }
  function moveToDrop(index, position = drop.length) {
    const token = source[index];
    if (!token) return;
    setChallengeResult("");
    setChallengeFeedback("");
    setSource((s) => s.filter((_, i) => i !== index));
    setDrop((d) => {
      const next = [...d];
      next.splice(Math.min(position, next.length), 0, token);
      return next;
    });
  }
  function moveBack(index) {
    const token = drop[index];
    if (!token) return;
    setChallengeResult("");
    setChallengeFeedback("");
    setDrop((d) => d.filter((_, i) => i !== index));
    setSource((s) => [...s, token]);
  }
  function moveDropToEnd(from) {
    setChallengeResult("");
    setChallengeFeedback("");
    setDrop((d) => {
      const next = [...d];
      const [item] = next.splice(from, 1);
      if (item) next.push(item);
      return next;
    });
  }
  function insertDragged(payload, to) {
    if (!payload) return;
    if (payload.from === "source") {
      moveToDrop(payload.index, to);
      return;
    }
    if (payload.from === "drop") reorder(payload.index, to);
  }
  function reorder(from, to) {
    if (from === to) return;
    setChallengeResult("");
    setChallengeFeedback("");
    setDrop((d) => {
      const next = [...d];
      const [item] = next.splice(from, 1);
      if (item) next.splice(to, 0, item);
      return next;
    });
  }
  function completeMissionOne() {
    setProgress((prev) => {
      const next = structuredClone(prev);
      if (!next.missions[1].completed) next.xp += 100;
      next.missions[1] = { progress: 100, completed: true };
      writeProgress(next);
      return next;
    });
    notify("Mission 1 complete. Opening Mission 2...");
    window.setTimeout(() => navigate("/mission/2-next-token"), 500);
  }
  function checkChallenge() {
    if (drop.join("\0") === challengeTokens.join("\0")) {
      setChallengeResult("correct");
      setChallengeFeedback("Correct! +50 XP. Summary unlocked.");
      setReadSections((read) => ({ ...read, challenge: true }));
      notify("Correct! +50 XP. Scroll to the summary to finish.");
      return;
    }
    const feedback = getTokenOrderFeedback(drop, challengeTokens);
    setChallengeResult("wrong");
    setChallengeFeedback(feedback);
    notify(feedback);
  }
  function getTokenOrderFeedback(answer, expected) {
    if (answer.length < expected.length) {
      return `You still need ${expected.length - answer.length} more token${expected.length - answer.length === 1 ? "" : "s"}.`;
    }
    const firstWrong = answer.findIndex((token, index) => token !== expected[index]);
    if (firstWrong === -1) return "Correct! +50 XP. Summary unlocked.";
    if (firstWrong === 0) {
      return `The first token should be "${expected[0]}", but you placed "${answer[0]}".`;
    }
    if (firstWrong === expected.length - 1) {
      return `The final token should be "${expected[firstWrong]}", but you placed "${answer[firstWrong]}".`;
    }
    return `After "${expected[firstWrong - 1]}", the next token should be "${expected[firstWrong]}", but you placed "${answer[firstWrong]}".`;
  }
  function resetChallenge() {
    setSource(["ice", "cream", "I", "love", "chocolate"]);
    setDrop([]);
    setChallengeResult("");
    setChallengeFeedback("");
  }
  function saveReflection() {
    const text = reflection.trim() || "AI needs many examples of tokens to learn useful patterns.";
    setReflectionSaved(true);
    localStorage.setItem("mission1TokenReflection", text);
    saveLearningNote({
      id: "mission-1-training-stage",
      mission: "Mission 1",
      title: "Training Stage reflection",
      prompt: "If the AI only saw a few tokens, would it learn well?",
      note: text
    });
    notify("Saved to My Notes in Activity.");
  }
  function viewNotes() {
    localStorage.setItem("aiExplorerActivityTab", "My Notes");
    navigate("/activity");
  }
  return <MissionLayout mission={1} title="How does ChatGPT read?" subtitle={<>ChatGPT doesn’t read sentences like we do.<br />It breaks text into small pieces called <strong>tokens</strong>.</>} robot="reading" progress={progress} notify={notify}>
    <section className="lesson-main course-flow">
      <CourseSection id="m1-token" n="1" title="What is a token?" action={<button className="outline tiny-top" onClick={() => scrollToSection("token")}>Top ↑</button>}>
        <p>Imagine you cut a sentence into building blocks. Those blocks are tokens.</p>
        <div className="brick-sentence">{exampleTokens.map((word, i) => <span key={word} className={`token ${colors[i]}`}>{word}</span>)}</div>
        <div className="brick-row" aria-hidden="true">{colors.map((color) => <i className={color} key={color} />)}</div>
      </CourseSection>
      <CourseSection id="m1-see" n="2" title="See how it is tokenized" action={<button className="outline tiny-top" onClick={() => notify("A token can be a word, part of a word, or punctuation.")}><Icon name="bulb" />Hint</button>}>
        <p>Each word, or part of a word, becomes a token.</p>
        <div className="token-row course-token-row">{exampleTokens.map((t, i) => <span className={`token ${colors[i % colors.length]}`} key={t}>{t}</span>)}</div>
        <div className="why-token-box"><div><strong>Why?</strong><p>Computers understand numbers, not words. Tokens are easier for AI to process.</p></div><Mascot type="detective" /></div>
      </CourseSection>
      <CourseSection id="m1-try" n="3" title="Try it yourself!">
        <p>Type a sentence and see how it is tokenized.</p>
        <div className="input-row course-input-row"><input value={sentence} onChange={(e) => setSentence(e.target.value)} onKeyDown={(e) => e.key === "Enter" && split()} /><button className="primary" onClick={split}>Tokenize →</button></div>
        <div className="token-row course-token-row">{tokens.map((t, i) => <span className={`token ${colors[i % colors.length]}`} key={`${t}-${i}`}>{t}</span>)}</div>
        <div className="split-note"><p>Sometimes a word can be split into more than one token.</p><div className="split-example"><strong>unbelievable</strong><b>→</b><span>un</span><span>believ</span><span>able</span></div></div>
      </CourseSection>
      <CourseSection id="m1-training" n="4" title="Training Stage: AI learns from many tokens">
        <p>The model sees millions of tokens in different sentences. It learns patterns about how they fit together.</p>
        <div className="training-link-flow"><Concept icon="database" title="Millions of Tokens" text="Input" /><b>→</b><Concept icon="brain" title="Find Patterns" text="Learning" /><b>→</b><Concept icon="bulb" title="Understanding" text="Better AI" /></div>
        <div className="reflection-box"><strong><Icon name="bulb" />Think about it</strong><p>If the AI only saw a few tokens, would it learn well?</p><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Write your thoughts..." /><div className="reflection-actions"><button className="outline" onClick={saveReflection}>{reflectionSaved ? "Saved to My Notes" : "Save note"}</button>{reflectionSaved && <button className="light" onClick={viewNotes}>View in My Notes</button>}</div></div>
      </CourseSection>
      <CourseSection id="m1-challenge" n="5" title={<><Icon name="trophy" />Mini Challenge</>} action={<span className="section-pill">1 / 1</span>}>
        <p>Put these tokens in the correct order to make a sentence.</p>
        <div className="source-tokens" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const payload = readDragData(e); if (payload?.from === "drop") moveBack(payload.index); }}>{source.map((t, i) => <button draggable={challengeResult !== "correct"} disabled={challengeResult === "correct"} className={`token ${tokenClass(t)}`} onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("application/json", dragData("source", i)); }} onClick={() => challengeResult !== "correct" && moveToDrop(i)} key={`${t}-${i}`}>{t}</button>)}</div>
        <div className={`drop-zone ${drop.length ? "has-tokens" : ""}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (challengeResult === "correct") return; const payload = readDragData(e); if (payload?.from === "source") moveToDrop(payload.index); if (payload?.from === "drop") moveDropToEnd(payload.index); }}>{drop.length ? drop.map((t, i) => <button draggable={challengeResult !== "correct"} disabled={challengeResult === "correct"} onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("application/json", dragData("drop", i)); }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (challengeResult !== "correct") insertDragged(readDragData(e), i); }} onClick={() => challengeResult !== "correct" && moveBack(i)} className={`token ${tokenClass(t)}`} key={`${t}-${i}`}>{t}</button>) : <span>Drag tokens here in the right order...</span>}</div>
        {challengeResult && <div className={`challenge-message ${challengeResult}`}><Icon name={challengeResult === "correct" ? "check" : "alert"} />{challengeFeedback}</div>}
        {hintVisible && <p className="hint-line">Read the sentence from left to right.</p>}
        <div className="challenge-actions course-actions"><button className="primary" disabled={drop.length !== challengeTokens.length || challengeResult === "correct"} onClick={checkChallenge}>Check Answer</button><button className="outline" onClick={() => setHintVisible(true)}>Need a hint?</button><button className="outline" onClick={resetChallenge}>Reset</button></div>
      </CourseSection>
      <CourseSection id="m1-summary" n="6" title="Summary">
        <p>Great job! You’ve learned the first step of how ChatGPT understands text.</p>
        <div className="summary-grid"><Concept icon="check" title="Text is split into tokens" text="AI breaks text into small pieces." /><Concept icon="check" title="Tokens are numbers for the model" text="Computers work with numbers." /><Concept icon="check" title="AI learns patterns from tokens" text="This helps it understand better." /></div>
        <div className="summary-mascot"><Mascot type="pointing" /><strong>You’re doing great. Let’s keep exploring.</strong></div>
      </CourseSection>
    </section>
    <aside className="lesson-side page-timeline" aria-label="On this page">
      <div className="card timeline-card"><h2>On this page</h2><span className="timeline-rail" style={{ "--progress": `${(Math.max(0, sections.findIndex(([id]) => id === activeSection)) / (sections.length - 1)) * 100}%` }} />{sections.map(([id, label], index) => {
        const active = activeSection === id;
        const read = Boolean(readSections[id]);
        const needsWork = id === "challenge" && tryDone && challengeResult !== "correct";
        return <button key={id} className={`${active ? "active" : ""} ${read ? "read" : ""} ${needsWork ? "work" : ""}`} onClick={() => scrollToSection(id)}><span>{read && !active ? <Icon name="check" /> : index + 1}</span>{label}</button>;
      })}</div>
    </aside>
    <footer className="course-bottom-nav"><button className="outline" disabled>‹ Previous</button><span>{nextReady ? "Mission 1 complete. Mission 2 is ready." : "Scroll down, try tokenizing, then finish the challenge."}</span><button className="primary" disabled={!nextReady} onClick={completeMissionOne}>Next: Mission 2 →</button></footer>
  </MissionLayout>;
}

function CourseSection({ id, n, title, children, action }) {
  return <section id={id} className="card course-section"><div className="course-section-head"><h2><span>{n}</span>{title}</h2>{action}</div>{children}</section>;
}

function Step({ n, title, children }) {
  return <section className="card step-card"><h2><span>{n}</span>{title}</h2>{children}</section>;
}

function HowTokens({ sentence, tokens }) {
  return <section className="card how-card token-flow"><h2>How it works</h2><p>See how your sentence is processed.</p><Flow title="Your Sentence" icon="message" tone="blue">{sentence}</Flow><Flow title="Tokenisation" icon="grid" tone="green"><span className="flow-token-line">{tokens.map((t, i) => <span className={`flow-token ${["lav", "blue", "green", "yellow", "pink"][i % 5]}`} key={`${t}-${i}`}>{t}</span>)}</span><em>The sentence is split into tokens.</em></Flow><Flow title="Model Input" icon="puzzle" tone="orange"><span className="dots">{Array.from({ length: Math.max(5, Math.min(6, tokens.length + 1)) }).map((_, i) => <i key={i} />)}</span><em>These tokens are fed into the model one by one.</em></Flow></section>;
}

function Flow({ title, icon = "book", tone = "blue", children }) {
  return <div className={`flow-card ${tone}`}><span className="flow-icon"><Icon name={icon} /></span><span className="flow-copy">{typeof title === "string" ? <strong>{title}</strong> : title}<small>{children}</small></span></div>;
}

function QuickQuiz({ title = "Quick Check", questions, notify, onComplete, locked = false, lockText = "Complete the step above first." }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [page, setPage] = useState(0);
  const question = questions[page];
  const answered = questions.every((question) => answers[question.id]);
  const score = questions.filter((question) => answers[question.id] === question.answer).length;
  const complete = checked && score === questions.length;

  function checkAnswers() {
    setChecked(true);
    if (score === questions.length) {
      notify("Quick check complete. Nice reasoning.");
      onComplete?.();
    } else {
      notify("A couple of answers need another look.");
    }
  }

  return <div className={`quick-quiz ${locked ? "locked" : ""}`}>
    <div className="quick-head"><h3>{title}</h3>{!locked && <span>{page + 1} / {questions.length}</span>}</div>
    {locked ? <div className="challenge-lock"><Icon name="lock" />{lockText}</div> : <article className="quick-question" key={question.id}>
      <strong>{page + 1}. {question.prompt}</strong>
      <div className="quick-options">{question.options.map((option) => {
        const selected = answers[question.id] === option;
        const isCorrect = option === question.answer;
        return <button
          key={option}
          className={`${selected ? "selected" : ""} ${checked && selected && !isCorrect ? "wrong" : ""} ${checked && isCorrect ? "correct" : ""}`}
          onClick={() => { setAnswers((current) => ({ ...current, [question.id]: option })); setChecked(false); }}
        >{option}</button>;
      })}</div>
    </article>}
    {!locked && <div className="quick-actions">
      <button className="quiz-arrow" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>‹</button>
      <button className="quiz-arrow" disabled={page === questions.length - 1} onClick={() => setPage((current) => Math.min(questions.length - 1, current + 1))}>›</button>
      <button className="outline" disabled={!answered} onClick={checkAnswers}>{complete ? "All correct" : "Check all"}</button>
      {checked && <span>{score} / {questions.length} correct</span>}
    </div>}
  </div>;
}

function Mission2({ progress, setProgress, navigate, notify }) {
  const [temp, setTemp] = useState(.7);
  const [tempVersion, setTempVersion] = useState(0);
  const [observedToken, setObservedToken] = useState("");
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [challengeSource, setChallengeSource] = useState(["pizza", "cereal", "water", "homework"]);
  const [challengeDrop, setChallengeDrop] = useState([]);
  const [challengeResult, setChallengeResult] = useState("");
  const [challengeFeedback, setChallengeFeedback] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("concept");
  const [readSections, setReadSections] = useState({ concept: true });
  const sections = [
    ["concept", "What is next-token prediction?"],
    ["observe", "See it in action"],
    ["turn", "Your turn!"],
    ["probabilities", "Let's check the probabilities"],
    ["why", "Why probabilities?"],
    ["challenge", "Mini Challenge"],
    ["summary", "Quick Recap"]
  ];
  const observeOptions = [
    ["coat", 42, "This fits warm clothing."],
    ["computer", 18, "Possible as a word, but weak in this context."],
    ["pizza", 15, "A word the model knows, but it does not fit well."],
    ["question", 8, "Grammatically possible in other sentences."],
    ["...", 17, "Other small possibilities."]
  ];
  const turnOptions = ["mat", "moon", "car", "ice cream"];
  const turnProbabilities = { mat: 62, moon: 21, car: 10, "ice cream": 7 };
  const adjustedProbabilities = temperatureScale(turnProbabilities, temp);
  const challengeExpected = ["cereal", "pizza", "water", "homework"];
  const summaryReached = Boolean(readSections.summary);
  const nextReady = submitted && challengeResult === "correct" && summaryReached;
  React.useEffect(() => {
    const container = document.querySelector(".mission-2 .mission-content");
    if (!container) return undefined;
    const update = () => {
      let current = sections[0][0];
      const containerTop = container.getBoundingClientRect().top;
      sections.forEach(([id]) => {
        const node = document.getElementById(`m2-${id}`);
        if (node && node.getBoundingClientRect().top - containerTop < 190) current = id;
      });
      setActiveSection(current);
      setReadSections((read) => ({ ...read, [current]: true }));
    };
    update();
    container.addEventListener("scroll", update, { passive: true });
    return () => container.removeEventListener("scroll", update);
  }, []);
  function scrollToSection(id) {
    document.getElementById(`m2-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function markMission2(progressValue, completed = false) {
    setProgress((prev) => {
      const next = structuredClone(prev);
      if (completed && !next.missions[2].completed) next.xp += 100;
      next.missions[2] = { progress: Math.max(next.missions[2].progress || 0, progressValue), completed: completed || next.missions[2].completed };
      writeProgress(next);
      return next;
    });
  }
  function submitGuess() {
    if (!guess) return;
    setSubmitted(true);
    markMission2(45);
    notify("Guess saved. Now scroll down to compare the probabilities.");
  }
  function dragPayload(from, index) {
    return JSON.stringify({ from, index });
  }
  function readPayload(event) {
    try {
      return JSON.parse(event.dataTransfer.getData("application/json"));
    } catch {
      return null;
    }
  }
  function clearChallengeFeedback() {
    setChallengeResult("");
    setChallengeFeedback("");
  }
  function moveChallengeToDrop(index, position = challengeDrop.length) {
    const token = challengeSource[index];
    if (!token) return;
    clearChallengeFeedback();
    setChallengeSource((items) => items.filter((_, i) => i !== index));
    setChallengeDrop((items) => {
      const next = [...items];
      next.splice(Math.min(position, next.length), 0, token);
      return next;
    });
  }
  function moveChallengeBack(index) {
    const token = challengeDrop[index];
    if (!token) return;
    clearChallengeFeedback();
    setChallengeDrop((items) => items.filter((_, i) => i !== index));
    setChallengeSource((items) => [...items, token]);
  }
  function reorderChallenge(from, to) {
    if (from === to) return;
    clearChallengeFeedback();
    setChallengeDrop((items) => {
      const next = [...items];
      const [item] = next.splice(from, 1);
      if (item) next.splice(to, 0, item);
      return next;
    });
  }
  function insertChallenge(payload, to) {
    if (!payload) return;
    if (payload.from === "source") moveChallengeToDrop(payload.index, to);
    if (payload.from === "drop") reorderChallenge(payload.index, to);
  }
  function checkChallenge() {
    if (challengeDrop.join("\0") === challengeExpected.join("\0")) {
      setChallengeResult("correct");
      setChallengeFeedback("Good ranking. Cereal fits breakfast best, pizza could fit, water is possible but weaker, and homework does not fit the context.");
      markMission2(80);
      notify("Mini challenge complete. Scroll to the recap.");
      return;
    }
    const firstWrong = challengeDrop.findIndex((token, index) => token !== challengeExpected[index]);
    const expected = challengeExpected[firstWrong] || challengeExpected[0];
    const placed = challengeDrop[firstWrong] || "nothing";
    setChallengeResult("wrong");
    setChallengeFeedback(`Look at rank ${firstWrong + 1}: "${expected}" is more likely here than "${placed}".`);
    notify(`Rank ${firstWrong + 1} needs another look.`);
  }
  function resetChallenge() {
    setChallengeSource(["pizza", "cereal", "water", "homework"]);
    setChallengeDrop([]);
    setChallengeResult("");
    setChallengeFeedback("");
  }
  function finishMission() {
    if (!nextReady) {
      notify("Submit your guess, complete the mini challenge, and reach the recap first.");
      return;
    }
    markMission2(100, true);
    notify("Mission 2 complete. Opening Mission 3...");
    window.setTimeout(() => navigate("/mission/3-hallucination"), 500);
  }
  return <MissionLayout mission={2} title="Can you think like ChatGPT?" subtitle={<>ChatGPT predicts the next token.<br />It looks at the context and gives each possible next word a <strong>probability</strong>.</>} robot="detective" progress={progress} notify={notify}>
    <section className="lesson-main course-flow mission2-flow">
      <CourseSection id="m2-concept" n="1" title="What is next-token prediction?" action={<button className="outline tiny-top" onClick={() => scrollToSection("concept")}>Top ↑</button>}>
        <p>ChatGPT reads the text you give it, then looks at lots of possible next tokens and guesses what comes next.</p>
        <div className="next-token-diagram"><div><small>Context</small><strong>She wore a warm ____.</strong></div><b>→</b><Mascot type="detective" /><b>→</b><div><small>Next token</small><strong>?</strong></div></div>
        <div className="lesson-hint"><Icon name="bulb" />Think of it like a detective guessing the next clue.</div>
      </CourseSection>
      <CourseSection id="m2-observe" n="2" title="See it in action">
        <p>Here are some possible next tokens for the context below.</p>
        <div className="context-box compact-context"><small>Context:</small><strong>She wore a warm _____.</strong></div>
        <div className="token-prob-grid">{observeOptions.map(([token, probability, detail]) => <button key={token} className={`${observedToken === token ? "active" : ""}`} onClick={() => { setObservedToken(token); notify(`${token}: ${detail}`); }}><strong>{token}</strong><span>{(probability / 100).toFixed(2)}</span></button>)}</div>
        {observedToken && <div className="robot-note"><Mascot type="pointing" /><span><strong>Interesting...</strong>This token could appear, but the model still compares it with other options.</span></div>}
      </CourseSection>
      <CourseSection id="m2-turn" n="3" title="Your turn!">
        <p>Look at the context and choose your guess.</p>
        <div className="context-box compact-context"><small>Context:</small><strong>The cat sat on the _____.</strong></div>
        <div className="answer-grid mission2-choice-grid">{turnOptions.map((option) => <button key={option} className={guess === option ? "selected" : ""} disabled={submitted} onClick={() => setGuess(option)}>{option}</button>)}</div>
        <button className="primary" disabled={!guess || submitted} onClick={submitGuess}>{submitted ? "Guess submitted" : "Submit Guess"}</button>
        {submitted && <div className="section-complete"><Icon name="check" />Guess saved. Now check what the model scored.</div>}
      </CourseSection>
      <CourseSection id="m2-probabilities" n="4" title="Let's check the probabilities">
        <p>Here’s how the model scores each option. Probability is about likelihood, not simple right or wrong.</p>
        <div key={tempVersion} className={`probability-panel ${submitted ? "reveal" : "locked"}`}><div className="context-box compact-context"><small>Context:</small><strong>The cat sat on the _____.</strong></div>{Object.entries(adjustedProbabilities).map(([word, value], index) => <div className="mission2-prob-row" key={word}><strong>{word}</strong><span><i style={{ width: submitted ? `${value}%` : "0%", "--delay": `${index * 90}ms` }} /></span><b>{(value / 100).toFixed(2)}</b></div>)}{!submitted && <em>Submit your guess above to reveal the probability bars.</em>}{submitted && <em>Creativity changes how concentrated or spread out the probabilities become.</em>}<Mascot type="pointing" /></div>
      </CourseSection>
      <CourseSection id="m2-why" n="5" title="Why probabilities?">
        <p>Sometimes more than one word could fit. Probability helps the model choose the word that best matches the context.</p>
        <div className="probability-example clear-example">
          <div className="context-box compact-context"><small>Context:</small><strong>She drank a cup of _____.</strong></div>
          <div className="probability-compare">
            {[
              ["tea", 52, "Most likely", "People often drink tea from a cup."],
              ["coffee", 36, "Also possible", "Coffee also fits the same context."],
              ["water", 12, "Less likely here", "Water can fit, but the phrase is less common."]
            ].map(([word, score, label, reason]) => (
              <div className="compare-row" key={word}>
                <b>{word}</b>
                <span><i style={{ width: `${score}%` }} /></span>
                <strong>{score}%</strong>
                <em>{label}</em>
                <small>{reason}</small>
              </div>
            ))}
          </div>
          <div className="probability-takeaway"><Icon name="bulb" />Higher probability means “this fits the context better”, not “all other words are impossible”.</div>
        </div>
      </CourseSection>
      <CourseSection id="m2-challenge" n="6" title={<><Icon name="trophy" />Mini Challenge</>} action={<span className="section-pill">1 / 1</span>}>
        <p>Look at the context. Drag the options to order them from most likely to least likely.</p>
        <div className="context-box compact-context"><small>Context:</small><strong>I love _____ for breakfast.</strong></div>
        <div className="source-tokens" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const payload = readPayload(e); if (payload?.from === "drop") moveChallengeBack(payload.index); }}>{challengeSource.map((token, index) => <button key={`${token}-${index}`} draggable={challengeResult !== "correct"} disabled={challengeResult === "correct"} className={`token ${["yellow", "pink", "blue", "lav"][challengeExpected.indexOf(token)] || "blue"}`} onClick={() => challengeResult !== "correct" && moveChallengeToDrop(index)} onDragStart={(e) => e.dataTransfer.setData("application/json", dragPayload("source", index))}>{token}</button>)}</div>
        <div className={`drop-zone ${challengeDrop.length ? "has-tokens" : ""}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (challengeResult === "correct") return; const payload = readPayload(e); if (payload?.from === "source") moveChallengeToDrop(payload.index); if (payload?.from === "drop") reorderChallenge(payload.index, challengeDrop.length - 1); }}>{challengeDrop.length ? challengeDrop.map((token, index) => <button key={`${token}-${index}`} draggable={challengeResult !== "correct"} disabled={challengeResult === "correct"} className={`token ${["yellow", "pink", "blue", "lav"][challengeExpected.indexOf(token)] || "blue"}`} onClick={() => challengeResult !== "correct" && moveChallengeBack(index)} onDragStart={(e) => e.dataTransfer.setData("application/json", dragPayload("drop", index))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (challengeResult !== "correct") insertChallenge(readPayload(e), index); }}>{token}</button>) : <span>Drag here to order: most likely → least likely</span>}</div>
        {challengeResult && <div className={`challenge-message ${challengeResult}`}><Icon name={challengeResult === "correct" ? "check" : "alert"} />{challengeFeedback}</div>}
        {hintVisible && <p className="hint-line">Rank the option that best fits breakfast first, then the options that are only possible or do not fit.</p>}
        <div className="challenge-actions course-actions"><button className="primary" disabled={challengeDrop.length !== challengeExpected.length || challengeResult === "correct"} onClick={checkChallenge}>Check Answer</button><button className="outline" onClick={() => setHintVisible(true)}>Need a hint?</button><button className="outline" onClick={resetChallenge}>Reset</button></div>
      </CourseSection>
      <CourseSection id="m2-summary" n="7" title="Quick Recap">
        <p>Great job. You learned how ChatGPT predicts the next token.</p>
        <div className="summary-grid"><Concept icon="target" title="Looks at the context" text="Reads what came before." /><Concept icon="search" title="Considers many options" text="Checks lots of possible next tokens." /><Concept icon="chart" title="Uses probabilities" text="Chooses the most likely next token." /></div>
        <div className="summary-mascot"><Mascot type="pointing" /><strong>You’re learning how prediction works.</strong></div>
      </CourseSection>
    </section>
    <aside className="lesson-side page-timeline mission2-side" aria-label="On this page">
      <div className="card timeline-card"><h2>On this page</h2><span className="timeline-rail" style={{ "--progress": `${(Math.max(0, sections.findIndex(([id]) => id === activeSection)) / (sections.length - 1)) * 100}%` }} />{sections.map(([id, label], index) => {
        const active = activeSection === id;
        const read = Boolean(readSections[id]);
        const needsWork = read && !active && ((id === "turn" && !submitted) || (id === "challenge" && challengeResult !== "correct"));
        return <button key={id} className={`${active ? "active" : ""} ${read ? "read" : ""} ${needsWork ? "work" : ""}`} onClick={() => scrollToSection(id)}><span>{read && !active ? <Icon name="check" /> : index + 1}</span>{label}</button>;
      })}</div>
      <section className="card how-card mission2-how"><h2>How it works</h2><Flow title={<><strong>Context</strong><em>(what came before)</em></>} icon="target" tone="green">She wore a warm</Flow><Flow title="Next-token Prediction" icon="bolt" tone="blue">The model looks at many possible next tokens.</Flow><Flow title="Probabilities" icon="chart" tone="orange">Each token gets a probability score.</Flow><Flow title="Generation" icon="wand" tone="lav">The model usually picks the highest probability token.</Flow></section>
      <section className="card temp-card"><h2>Creativity<button className="tiny-info" onClick={() => notify("Creativity changes how safe or surprising the next-token choice feels.")}>i</button></h2><div className="temp-labels"><span>Lower = safer answers</span><span>Higher = more creative</span></div><div className="temp-control"><input type="range" min=".1" max="2" step=".1" value={temp} onChange={(e) => setTemp(Number(e.target.value))} /><output>{temp.toFixed(1)}</output></div><div className="try-box"><span className="try-icon"><Icon name="bulb" /></span><div><strong>Try it!</strong><p>Move the slider and click “Show again” to reanimate the probability bars.</p></div><button className="outline" onClick={() => { setTempVersion((version) => version + 1); notify("Probabilities updated. Lower creativity is more peaked; higher creativity is more spread out."); }}>Show again</button></div></section>
    </aside>
    <footer className="course-bottom-nav"><button className="outline" onClick={() => navigate("/mission/1-tokenisation")}>‹ Previous</button><span>{nextReady ? "Mission 2 complete. Mission 3 is ready." : "Follow the prediction steps, then finish the mini challenge."}</span><button className="primary" disabled={!nextReady} onClick={finishMission}>Next: Mission 3 →</button></footer>
  </MissionLayout>;
}

function temperatureScale(base, temp) {
  const power = .7 / Number(temp);
  const scaled = Object.entries(base).map(([word, value]) => [word, Math.pow(value / 100, power)]);
  const total = scaled.reduce((sum, [, value]) => sum + value, 0);
  const rounded = {};
  scaled.forEach(([word, value]) => rounded[word] = Math.max(1, Math.round((value / total) * 100)));
  const diff = 100 - Object.values(rounded).reduce((sum, value) => sum + value, 0);
  rounded[Object.keys(rounded)[0]] += diff;
  return rounded;
}

function Mission3({ progress, setProgress, navigate, notify }) {
  const saved = progress.missions[3] || { progress: 0, completed: false };
  const answer = "J.R.R. Tolkien";
  const [selected, setSelected] = useState(saved.progress >= 25 ? answer : "");
  const [submitted, setSubmitted] = useState(saved.progress >= 25);
  const [wrong, setWrong] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [libraryChoice, setLibraryChoice] = useState("");
  const [trickAnswer, setTrickAnswer] = useState("");
  const [trickSubmitted, setTrickSubmitted] = useState(saved.progress >= 55);
  const [cards, setCards] = useState(saved.completed ? [] : shuffleList(detectiveCards));
  const [likely, setLikely] = useState(saved.completed ? detectiveTrueFacts : []);
  const [hallucination, setHallucination] = useState(saved.completed ? detectiveFalseFacts : []);
  const [challengeDone, setChallengeDone] = useState(saved.completed);
  const [detectiveFeedback, setDetectiveFeedback] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [reflection, setReflection] = useState(() => localStorage.getItem("mission3HallucinationReflection") || "");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("predict");
  const [readSections, setReadSections] = useState({ predict: true });
  const sections = [
    ["predict", "What does ChatGPT predict?"],
    ["why", "See why it might be wrong"],
    ["training", "Not in the training data"],
    ["trick", "Try a tricky one!"],
    ["detective", "Hallucination Detective"],
    ["summary", "Summary"],
    ["reflect", "Reflect"]
  ];
  const choices = ["J.R.R. Tolkien", "C.S. Lewis", "George Orwell", "J.K. Rowling"];
  const trickChoices = ["Blue", "Green", "Purple", "Orange"];
  const trueFacts = detectiveTrueFacts;
  const falseFacts = detectiveFalseFacts;
  const summaryReached = Boolean(readSections.summary);
  const nextReady = submitted && trickSubmitted && challengeDone && summaryReached;
  React.useEffect(() => {
    const container = document.querySelector(".mission-3 .mission-content");
    if (!container) return undefined;
    const update = () => {
      let current = sections[0][0];
      const containerTop = container.getBoundingClientRect().top;
      sections.forEach(([id]) => {
        const node = document.getElementById(`m3-${id}`);
        if (node && node.getBoundingClientRect().top - containerTop < 190) current = id;
      });
      setActiveSection(current);
      setReadSections((read) => ({ ...read, [current]: true }));
    };
    update();
    container.addEventListener("scroll", update, { passive: true });
    return () => container.removeEventListener("scroll", update);
  }, []);
  function markProgress(progressValue, completed = false) {
    setProgress((prev) => {
      const next = structuredClone(prev);
      const alreadyDone = next.missions[3].completed;
      next.missions[3] = { progress: Math.max(next.missions[3].progress || 0, progressValue), completed: alreadyDone || completed };
      if (completed && !alreadyDone) next.xp += 100;
      writeProgress(next);
      return next;
    });
  }
  function scrollToSection(id) {
    document.getElementById(`m3-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function submitGuess() {
    if (!selected) return;
    if (selected !== answer) {
      setWrong(true);
      notify("Interesting guess. Try the answer most patterns point to.");
      return;
    }
    setWrong(false);
    setSubmitted(true);
    markProgress(25);
    notify("Correct. But how did ChatGPT know, and when might it fail?");
  }
  function dragPayload(from, index) {
    return JSON.stringify({ from, index });
  }
  function readPayload(event) {
    try { return JSON.parse(event.dataTransfer.getData("application/json")); } catch { return null; }
  }
  function removeFrom(from, index) {
    if (from === "cards") setCards((items) => items.filter((_, i) => i !== index));
    if (from === "likely") setLikely((items) => items.filter((_, i) => i !== index));
    if (from === "hallucination") setHallucination((items) => items.filter((_, i) => i !== index));
  }
  function valueFrom(from, index) {
    return { cards, likely, hallucination }[from]?.[index];
  }
  function dropInto(target, payload) {
    if (challengeDone) return;
    const value = valueFrom(payload?.from, payload?.index);
    if (!value) return;
    setDetectiveFeedback("");
    removeFrom(payload.from, payload.index);
    if (target === "likely") setLikely((items) => [...items, value]);
    if (target === "hallucination") setHallucination((items) => [...items, value]);
    if (target === "cards") setCards((items) => [...items, value]);
  }
  function checkChallenge() {
    const isSame = (a, b) => a.length === b.length && a.every((item) => b.includes(item));
    if (!isSame(likely, trueFacts) || !isSame(hallucination, falseFacts)) {
      setDetectiveFeedback("Some facts are mixed up. True facts can be checked in the real world; hallucinations sound possible but are false.");
      notify("Try again. Some true facts and hallucinations are mixed up.");
      return;
    }
    setChallengeDone(true);
    setDetectiveFeedback("Good detective work. You separated real facts from hallucinations.");
    markProgress(80);
    notify("Hallucination Detective complete. Scroll to the summary.");
  }
  function refreshDetectiveRound() {
    setChallengeDone(false);
    setCards(shuffleList(detectiveCards));
    setLikely([]);
    setHallucination([]);
    setDetectiveFeedback("");
    setHintVisible(false);
    notify("Detective case reset. Sort the cards again.");
  }
  function saveReflection() {
    const text = reflection.trim() || "I should double-check AI answers when the information is important, new, or hard to verify.";
    setReflection(text);
    setReflectionSaved(true);
    localStorage.setItem("mission3HallucinationReflection", text);
    saveLearningNote({
      id: "mission-3-verify-reflection",
      mission: "Mission 3",
      title: "Verification reflection",
      prompt: "When would you double-check an AI answer before trusting it?",
      note: text
    });
    notify("Saved to My Notes in Activity.");
  }
  function viewNotes() {
    localStorage.setItem("aiExplorerActivityTab", "My Notes");
    navigate("/activity");
  }
  function finishMission() {
    if (!nextReady) {
      notify("Finish the tricky question, detective challenge, and summary first.");
      return;
    }
    markProgress(100, true);
    notify("Mission 3 complete. Opening Mission 4...");
    window.setTimeout(() => navigate("/mission/4-context"), 500);
  }
  return <MissionLayout mission={3} title="Why does ChatGPT make mistakes?" subtitle={<>ChatGPT doesn’t always know the truth.<br />It predicts based on <strong>patterns, not facts</strong>.</>} robot="detective" progress={progress} notify={notify}>
    <section className="lesson-main course-flow mission3-flow">
      <section className="scenario-card investigation-scenario"><span>Scenario</span><div><strong>Q: Who wrote “The Lord of the Rings”?</strong><p>ChatGPT has to answer from patterns it learned before.</p></div><figure className="scenario-book"><img src="/assets/img/mission3-book.png" alt="Purple fantasy book illustration" /></figure></section>
      <CourseSection id="m3-predict" n="1" title="What does ChatGPT predict?">
        <p>It generates the most likely answer based on patterns.</p>
        <div className="answer-grid mission3-options">{choices.map((choice) => <button className={`${selected === choice ? "selected" : ""} ${wrong && selected === choice ? "wrong" : ""}`} disabled={submitted} onClick={() => { setSelected(choice); setWrong(false); }} key={choice}>{choice}{submitted && choice === answer && <Icon name="check" />}</button>)}</div>
        <button className="primary" disabled={!selected || submitted} onClick={submitGuess}>{submitted ? "Answered" : wrong ? "Try Again" : "Answer"}</button>
        {submitted && <div className="answer-feedback mission3-answer-feedback"><strong>Correct! But...</strong><p>How did ChatGPT know? It might not have known. It may have predicted the most likely answer from patterns.</p></div>}
      </CourseSection>
      <CourseSection id="m3-why" n="2" title="Here's why it might be wrong">
        <div className="why-chain interactive-why-chain">{[
          ["book", "Seen similar names", "The model saw many author names and book titles during training.", "It can connect names that often appear near the same topics."],
          ["message", "Pattern matching", "It predicts what usually comes next.", "ChatGPT does not understand like humans. It predicts likely tokens."],
          ["server", "No real knowledge", "It does not know facts it has not seen in training.", "If the fact was missing, private, or new, it has no direct memory of it."],
          ["alert", "Possible mistake", "It can confidently give a wrong answer.", "A sentence can sound smooth even when the fact is false."]
        ].map(([icon, title, text, detail], index) => <button key={title} className={`concept-card ${activeStep === index ? "open" : ""}`} onClick={() => setActiveStep(activeStep === index ? null : index)}><Icon name={icon} /><strong>{title}</strong><p>{activeStep === index ? detail : text}</p></button>)}</div>
        <div className="hallucination-note"><Icon name="info" />ChatGPT is very good at guessing, but guessing can sometimes be wrong.</div>
      </CourseSection>
      <CourseSection id="m3-training" n="3" title="Not everything is in the training data">
        <p>Imagine ChatGPT’s training data is a library. It can use what it has seen, but it cannot use facts outside that library.</p>
        <div className="library-lab"><div className="library-art"><span /><span /><span /><span /><Mascot type="training" /></div><div className="library-choices"><button className={libraryChoice === "inside" ? "active inside" : ""} onClick={() => { setLibraryChoice("inside"); notify("Inside the library: seen during training."); }}><strong>Inside the library</strong><small>Seen during training.</small></button><button className={libraryChoice === "outside" ? "active outside" : ""} onClick={() => { setLibraryChoice("outside"); notify("Outside the library: the AI has never seen this."); }}><strong>Outside the library</strong><small>New, private, or missing information.</small></button></div></div>
        <div className="hallucination-note"><Icon name="bulb" />If the answer is outside the library, the AI can only guess.</div>
      </CourseSection>
      <CourseSection id="m3-trick" n="4" title="Let's test a tricky one">
        <p>Choose the best answer. The trick is that ChatGPT might not know this.</p>
        <div className="context-box compact-context"><small>Question:</small><strong>What colour is the sky on planet <mark>Keplora</mark>?</strong></div>
        <div className="answer-grid mission3-options">{trickChoices.map((choice) => <button key={choice} className={trickAnswer === choice ? "selected" : ""} disabled={trickSubmitted} onClick={() => setTrickAnswer(choice)}>{choice}{trickSubmitted && trickAnswer === choice && <Icon name="check" />}</button>)}</div>
        <div className="trick-action-row">
          <button className="primary" disabled={!trickAnswer || trickSubmitted} onClick={() => { setTrickSubmitted(true); markProgress(55); notify("We made up Keplora. ChatGPT would still try to answer."); }}>Submit</button>
        </div>
        {trickSubmitted && <div className="challenge-message wrong trick-reveal"><Icon name="alert" /><span><strong>We made up Keplora.</strong> ChatGPT would still try to answer based on what sounds common.</span></div>}
      </CourseSection>
      <CourseSection id="m3-detective" n="5" title={<><Icon name="trophy" />Hallucination Detective</>} action={<span className="section-pill">1 / 1</span>}>
        <p>Drag the facts to the correct box.</p>
        <div className="claim-pool" onDragOver={(e) => e.preventDefault()} onDrop={(e) => dropInto("cards", readPayload(e))}>{cards.map((card, i) => <button draggable={!challengeDone} disabled={challengeDone} onDragStart={(e) => e.dataTransfer.setData("application/json", dragPayload("cards", i))} className={`claim-card c${i}`} key={card}>{card}</button>)}</div>
        {challengeDone && <div className="completed-round-note"><Icon name="check" />This round is complete. Use Reset to try the detective game again.</div>}
        <div className="drop-pair"><ClaimDrop disabled={challengeDone} title="Likely True" icon="check" tone="true" items={likely} from="likely" dragPayload={dragPayload} onDrop={(payload) => dropInto("likely", payload)} onMoveBack={(index) => !challengeDone && dropInto("cards", { from: "likely", index })} /><ClaimDrop disabled={challengeDone} title="Hallucination" icon="alert" tone="false" items={hallucination} from="hallucination" dragPayload={dragPayload} onDrop={(payload) => dropInto("hallucination", payload)} onMoveBack={(index) => !challengeDone && dropInto("cards", { from: "hallucination", index })} /></div>
        {detectiveFeedback && <div className={`challenge-message ${challengeDone ? "correct" : "wrong"}`}><Icon name={challengeDone ? "check" : "alert"} />{detectiveFeedback}</div>}
        {hintVisible && <p className="hint-line">A hallucination sounds like a fact, but it is not true.</p>}
        <div className="challenge-actions course-actions"><button className="primary" disabled={cards.length > 0 || challengeDone} onClick={checkChallenge}>Check Answer</button><button className="outline" onClick={() => setHintVisible(true)}>Need a hint?</button><button className="outline" onClick={refreshDetectiveRound}>{challengeDone ? "Reset & try again" : "Reset"}</button></div>
      </CourseSection>
      <CourseSection id="m3-summary" n="6" title="Summary: Why mistakes happen">
        <p>ChatGPT can make mistakes because it predicts from patterns, not guaranteed truth.</p>
        <div className="summary-grid"><Concept icon="brain" title="It predicts, not knows" text="It guesses the most likely answer." /><Concept icon="chart" title="It follows patterns" text="It matches what it has seen before." /><Concept icon="server" title="It lacks real-world grounding" text="It cannot experience or verify facts." /><Concept icon="alert" title="It can hallucinate" text="It may confidently say something false." /></div>
        <div className="summary-mascot"><Mascot type="idea" /><strong>Great detective. Always verify important information.</strong></div>
      </CourseSection>
      <CourseSection id="m3-reflect" n="7" title="Reflect">
        <div className="reflection-box"><strong><Icon name="bulb" />Think critically</strong><p>When would you double-check an AI answer before trusting it?</p><textarea value={reflection} onChange={(e) => { setReflection(e.target.value); setReflectionSaved(false); }} placeholder="Example: when it gives medical, legal, financial, or new information..." /><div className="reflection-actions"><button className="outline" onClick={saveReflection}>{reflectionSaved ? "Saved to My Notes" : "Save reflection"}</button>{reflectionSaved && <button className="light" onClick={viewNotes}>View in My Notes</button>}</div></div>
      </CourseSection>
    </section>
    <aside className="lesson-side page-timeline mission3-side-panel" aria-label="On this page">
      <div className="card timeline-card"><h2>On this page</h2><span className="timeline-rail" style={{ "--progress": `${(Math.max(0, sections.findIndex(([id]) => id === activeSection)) / (sections.length - 1)) * 100}%` }} />{sections.map(([id, label], index) => {
        const active = activeSection === id;
        const read = Boolean(readSections[id]);
        const needsWork = read && !active && ((id === "predict" && !submitted) || (id === "trick" && !trickSubmitted) || (id === "detective" && !challengeDone));
        return <button key={id} className={`${active ? "active" : ""} ${read ? "read" : ""} ${needsWork ? "work" : ""}`} onClick={() => scrollToSection(id)}><span>{read && !active ? <Icon name="check" /> : index + 1}</span>{label}</button>;
      })}</div>
      <section className="card how-card mission2-how"><h2>How it happens</h2>{[
        ["brain", "1. Looks at the question", "The model reads the input.", "blue", "It starts with the words in the prompt."],
        ["chart", "2. Predicts the next tokens", "It predicts word by word based on probability.", "green", "It scores likely next tokens."],
        ["alert", "3. Confident but wrong", "It can sound sure, even if incorrect.", "orange", "A smooth sentence can still be false."],
        ["ghost", "4. Hallucination", "It generates information not based on real facts.", "lav", "This is a plausible but false answer."]
      ].map(([icon, title, text, tone, detail], i) => <button className={`flow-card ${tone} ${activeStep === i ? "open" : ""}`} onClick={() => setActiveStep(activeStep === i ? null : i)} key={title}><span className="flow-icon"><Icon name={icon} /></span><span className="flow-copy"><strong>{title}</strong><small>{text}</small>{activeStep === i && <em>{detail}</em>}</span></button>)}</section>
      <section className="card did-you-know"><h2>Did you know?</h2><p>ChatGPT can sound very confident, even when it is wrong. That’s why verification matters.</p><Mascot type="idea" /></section>
    </aside>
    <footer className="course-bottom-nav"><button className="outline" onClick={() => navigate("/mission/2-next-token")}>‹ Previous</button><span>{nextReady ? "Mission 3 complete. Mission 4 is ready." : "Keep investigating. Finish the detective challenge and summary."}</span><button className="primary" disabled={!nextReady} onClick={finishMission}>Next: Mission 4 →</button></footer>
  </MissionLayout>;
}

function Concept({ icon, title, text }) {
  return <article className="concept-card"><Icon name={icon} /><strong>{title}</strong><p>{text}</p></article>;
}

function ClaimDrop({ title, icon, tone, items, from, dragPayload, onDrop, onMoveBack, disabled = false }) {
  return <div className={`claim-drop ${tone} ${disabled ? "disabled" : ""}`} onDragOver={(e) => !disabled && e.preventDefault()} onDrop={(e) => { if (disabled) return; e.preventDefault(); try { onDrop(JSON.parse(e.dataTransfer.getData("application/json"))); } catch { /* noop */ } }}><strong><Icon name={icon} />{title}</strong>{items.map((item, i) => <button draggable={!disabled} disabled={disabled} onClick={() => onMoveBack?.(i)} onDragStart={(e) => e.dataTransfer.setData("application/json", dragPayload(from, i))} className="claim-chip" title={disabled ? "Reset to try again" : "Click to move back, or drag to another box"} key={item}>{item}</button>)}</div>;
}

function Mission4({ progress, setProgress, navigate, notify }) {
  const saved = progress.missions[4] || { progress: 0, completed: false };
  const answer = "B. River Edge";
  const [selected, setSelected] = useState(saved.progress >= 45 ? answer : "");
  const [submitted, setSubmitted] = useState(saved.progress >= 45);
  const [wrong, setWrong] = useState(false);
  const [activeContext, setActiveContext] = useState(saved.progress >= 45 ? "b" : "");
  const [activeStep, setActiveStep] = useState(null);
  const meaningChallenges = [
    { word: "bank", sentence: "I sat near the bank and watched the river.", answer: "River Edge", options: ["River Edge", "Financial Institution"], hint: "river and near point to land beside water" },
    { word: "bank", sentence: "I opened a savings account at the bank.", answer: "Financial Institution", options: ["River Edge", "Financial Institution"], hint: "savings account points to money" },
    { word: "bat", sentence: "A bat flew out of the cave at night.", answer: "Flying Animal", options: ["Flying Animal", "Sports Equipment"], hint: "flew, cave, and night point to an animal" },
    { word: "bat", sentence: "He swung the bat and hit the ball.", answer: "Sports Equipment", options: ["Flying Animal", "Sports Equipment"], hint: "swung and ball point to sport" },
    { word: "light", sentence: "Please turn on the light before you read.", answer: "Lamp / Brightness", options: ["Lamp / Brightness", "Not Heavy"], hint: "turn on points to brightness" },
    { word: "light", sentence: "This school bag is light enough to carry.", answer: "Not Heavy", options: ["Lamp / Brightness", "Not Heavy"], hint: "bag and carry point to weight" },
    { word: "bark", sentence: "The dog began to bark loudly.", answer: "Dog Sound", options: ["Dog Sound", "Tree Covering"], hint: "dog and loudly point to sound" },
    { word: "bark", sentence: "The bark of the old tree was rough.", answer: "Tree Covering", options: ["Dog Sound", "Tree Covering"], hint: "tree and rough point to outer covering" },
    { word: "match", sentence: "She lit the candle with a match.", answer: "Small Fire Stick", options: ["Small Fire Stick", "Sports Game"], hint: "lit and candle point to fire" },
    { word: "match", sentence: "Our football match starts at three.", answer: "Sports Game", options: ["Small Fire Stick", "Sports Game"], hint: "football and starts point to a game" },
    { word: "seal", sentence: "The seal balanced a ball at the aquarium.", answer: "Sea Animal", options: ["Sea Animal", "Close Tightly"], hint: "aquarium points to an animal" },
    { word: "seal", sentence: "Seal the envelope before you post it.", answer: "Close Tightly", options: ["Sea Animal", "Close Tightly"], hint: "envelope and post point to closing something" }
  ];
  const [meaningIndex, setMeaningIndex] = useState(0);
  const [meaningAnswers, setMeaningAnswers] = useState({});
  const [meaningChecked, setMeaningChecked] = useState({});
  const currentMeaning = meaningChallenges[meaningIndex];
  const currentMeaningAnswer = meaningAnswers[meaningIndex] || "";
  const choices = ["A. Financial Institution", "B. River Edge", "C. Data Storage", "D. Long Bench"];

  function markProgress(value, completed = false) {
    setProgress((prev) => {
      const next = structuredClone(prev);
      const alreadyDone = next.missions[4].completed;
      next.missions[4] = { progress: Math.max(next.missions[4].progress || 0, value), completed: alreadyDone || completed };
      if (completed && !alreadyDone) next.xp += 100;
      writeProgress(next);
      return next;
    });
  }

  function submitAnswer() {
    if (!selected) return;
    if (selected !== answer) {
      setWrong(true);
      notify('Try again. Look at the word "river".');
      return;
    }
    setWrong(false);
    setSubmitted(true);
    setActiveContext("b");
    markProgress(55);
    notify("Correct. Context changed the meaning.");
  }

  function goNext() {
    if (!submitted) {
      notify("Complete this mission first.");
      return;
    }
    markProgress(100, true);
    navigate("/mission/5-training-data");
  }

  function chooseMeaningPage(nextIndex) {
    const safeIndex = (nextIndex + meaningChallenges.length) % meaningChallenges.length;
    setMeaningIndex(safeIndex);
  }

  function checkMeaningAnswer() {
    if (!currentMeaningAnswer) return notify("Choose one meaning first.");
    const correct = currentMeaningAnswer === currentMeaning.answer;
    setMeaningChecked((checked) => ({ ...checked, [meaningIndex]: correct ? "correct" : "wrong" }));
    notify(correct ? `Correct. "${currentMeaning.word}" means ${currentMeaning.answer} here.` : `Not quite. Hint: ${currentMeaning.hint}.`);
  }

  return <MissionLayout mission={4} title="Why does context matter?" subtitle={<>The meaning of a text can change completely<br />based on what comes before.</>} progress={progress} notify={notify}><section className="lesson-main mission4-main"><section className="scenario-card context-scenario"><span>Scenario</span><div><strong>Q: What does “bank” mean here?</strong><p>The river flooded the bank.</p></div><RiverIllustration /></section><Step n="1" title="Choose the most likely meaning based on the context."><div className="answer-grid context-options">{choices.map((choice) => <button className={`${selected === choice ? "selected" : ""} ${wrong && selected === choice ? "wrong" : ""}`} disabled={submitted} onClick={() => { setSelected(choice); setWrong(false); }} key={choice}>{choice}{submitted && choice === answer && <Icon name="check" />}</button>)}</div><button className="primary" disabled={!selected || submitted} onClick={submitAnswer}>{wrong ? "Try Again" : submitted ? "Correct" : "Submit Answer"}</button></Step>{submitted ? <Step n="2" title="See how the context changes the meaning."><div className="context-compare"><ContextCard id="a" active={activeContext === "a"} title="Context A" sentence={<>I <mark>deposited</mark> <mark>money</mark> at the bank.</>} result="Financial Institution" icon="🏦" onClick={() => { setActiveContext("a"); notify("These words suggest a bank for money."); }} /><span className="compare-arrow">→</span><ContextCard id="b" active={activeContext === "b"} title="Context B" sentence={<>The <mark>boat</mark> was <mark>tied</mark> to the bank.</>} result="River Edge" icon="🌳" onClick={() => { setActiveContext("b"); notify("These words suggest the edge of a river."); }} /></div><div className="context-explain">{activeContext === "a" ? "Deposited and money point to a financial institution." : "Boat and tied point to the side of a river."}</div></Step> : <section className="card step-card locked-step"><h2><span>2</span>See how the context changes the meaning.</h2><p>Choose the correct meaning first to unlock the comparison.</p></section>}<footer className="bottom-nav"><button className="outline" onClick={() => navigate("/mission/3-hallucination")}>‹ Previous</button><button className="primary" onClick={goNext}>Next ›</button></footer></section><aside className="lesson-side mission4-side"><section className="card how-card happens-card context-works"><h2>How context works</h2>{[
    ["brain", "1. Reads the context", "Looks at the words before the target word.", "blue", "ChatGPT looks at the words before the target word."],
    ["chart", "2. Updates meaning", "Uses context to update word meaning.", "green", "The same word can mean different things in different contexts."],
    ["user", "3. Predicts next", "Predicts the next tokens based on this meaning.", "orange", "The model uses context to predict the most likely next tokens."]
  ].map(([icon, title, text, tone, detail], i) => <button className={`flow-card ${tone} ${activeStep === i ? "open" : ""}`} onClick={() => setActiveStep(activeStep === i ? null : i)} key={title}><span className="flow-icon"><Icon name={icon === "user" ? "target" : icon} /></span><span className="flow-copy"><strong>{title}</strong><small>{text}</small>{activeStep === i && <em>{detail}</em>}</span></button>)}</section><section className="card playground-card meaning-practice-card"><h2><Icon name="question" />Try it!</h2><p>Read the sentence and choose what the bold word means.</p><div className="meaning-practice-panel"><div className="playground-challenge-head"><strong>{currentMeaning.word}</strong><small>{meaningIndex + 1} / {meaningChallenges.length}</small></div><div className="meaning-sentence">{currentMeaning.sentence.split(currentMeaning.word).map((part, index, parts) => <React.Fragment key={`${part}-${index}`}>{part}{index < parts.length - 1 && <mark>{currentMeaning.word}</mark>}</React.Fragment>)}</div><div className="meaning-choice-grid">{currentMeaning.options.map((option) => <button key={option} className={`${currentMeaningAnswer === option ? "selected" : ""} ${meaningChecked[meaningIndex] === "correct" && option === currentMeaning.answer ? "correct" : ""} ${meaningChecked[meaningIndex] === "wrong" && currentMeaningAnswer === option ? "wrong" : ""}`} onClick={() => { setMeaningAnswers((answers) => ({ ...answers, [meaningIndex]: option })); setMeaningChecked((checked) => ({ ...checked, [meaningIndex]: "" })); }}>{option}{meaningChecked[meaningIndex] === "correct" && option === currentMeaning.answer && <Icon name="check" />}</button>)}</div>{meaningChecked[meaningIndex] && <em className={meaningChecked[meaningIndex] === "correct" ? "correct" : "wrong"}>{meaningChecked[meaningIndex] === "correct" ? `Correct: context makes "${currentMeaning.word}" mean ${currentMeaning.answer}.` : `Hint: ${currentMeaning.hint}.`}</em>}<div className="playground-examples playground-pager meaning-pager"><button onClick={() => chooseMeaningPage(meaningIndex - 1)}>‹ Previous</button><button className="primary" disabled={!currentMeaningAnswer} onClick={checkMeaningAnswer}>Check</button><button onClick={() => chooseMeaningPage(meaningIndex + 1)}>Next question ›</button></div></div></section></aside></MissionLayout>;
}

function ContextCard({ title, sentence, result, icon, active, onClick }) {
  return <button className={`context-card ${active ? "active" : ""}`} onClick={onClick}><strong>{title}</strong><p>{sentence}</p><b>↓</b><span>{icon} Most likely: {result}</span></button>;
}

function TrainingFigure({ name, small = false }) {
  return <svg className={`training-figure ${small ? "small" : ""}`} viewBox="0 0 72 72" aria-hidden="true">
    <defs>
      <filter id={`soft-${name}`} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#405083" floodOpacity=".14" /></filter>
      <linearGradient id={`g-${name}`} x1="12" y1="8" x2="58" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#edf4ff" />
      </linearGradient>
    </defs>
    {name === "science" && <g filter={`url(#soft-${name})`}>
      <path d="M24 8h24v7H24z" fill="#d9f8df" />
      <path d="M30 14v18L17.5 55.5A6 6 0 0 0 22.8 64h26.4a6 6 0 0 0 5.3-8.5L42 32V14Z" fill="url(#g-science)" stroke="#25af55" strokeWidth="2.3" />
      <path d="M24 48h24l5.4 10.1A3 3 0 0 1 50.8 62H21.2a3 3 0 0 1-2.6-3.9Z" fill="#a6efb5" />
      <circle cx="35" cy="42" r="3.1" fill="#25af55" opacity=".9" /><circle cx="41.5" cy="54" r="2.2" fill="#fff" opacity=".8" />
      <path d="M27 14h18" stroke="#168d41" strokeWidth="3" strokeLinecap="round" />
    </g>}
    {name === "math" && <g filter={`url(#soft-${name})`}>
      <rect x="18" y="8" width="36" height="56" rx="8" fill="url(#g-math)" stroke="#2588e8" strokeWidth="2.3" />
      <rect x="24" y="15" width="24" height="12" rx="3" fill="#d9efff" stroke="#5db2f2" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}-${c}`} x={24 + c * 9} y={34 + r * 8} width="5" height="5" rx="1.3" fill={c === 2 && r === 2 ? "#5b48f4" : "#2588e8"} opacity={c === 2 && r === 2 ? ".9" : ".75"} />))}
      <path d="M29 21h14" stroke="#2588e8" strokeWidth="2.5" strokeLinecap="round" />
    </g>}
    {name === "stories" && <g filter={`url(#soft-${name})`}>
      <path d="M13 17c9-6 18-4 23 2 5-6 14-8 23-2v39c-9-5-18-4-23 2-5-6-14-7-23-2Z" fill="url(#g-stories)" stroke="#6651f2" strokeWidth="2.2" />
      <path d="M36 19v39" stroke="#9688ff" strokeWidth="2" />
      <path d="M20 28h10M20 36h9M43 28h10M43 36h8" stroke="#28a7d7" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M49 44l2.1 3.6 4-6" fill="none" stroke="#42b963" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="48" r="4" fill="#ffd15d" opacity=".95" />
    </g>}
    {name === "data" && <g filter={`url(#soft-${name})`}>
      <path d="M17 18c0-7 38-7 38 0v30c0 7-38 7-38 0Z" fill="url(#g-data)" stroke="#2588e8" strokeWidth="2.2" />
      <ellipse cx="36" cy="18" rx="19" ry="8" fill="#bfe6ff" stroke="#2588e8" strokeWidth="2.2" />
      <path d="M17 28c0 7 38 7 38 0M17 39c0 7 38 7 38 0" fill="none" stroke="#74bdf2" strokeWidth="2.2" />
      <circle cx="26" cy="29" r="2.4" fill="#6c57f5" /><circle cx="26" cy="40" r="2.4" fill="#6c57f5" /><circle cx="26" cy="51" r="2.4" fill="#6c57f5" />
    </g>}
    {name === "patterns" && <g filter={`url(#soft-${name})`}>
      <path d="M15 58h42" stroke="#25a84f" strokeWidth="4" strokeLinecap="round" />
      <rect x="20" y="35" width="7" height="18" rx="3" fill="#90e0a2" />
      <rect x="32.5" y="25" width="7" height="28" rx="3" fill="#49c66b" />
      <rect x="45" y="16" width="7" height="37" rx="3" fill="#25a84f" />
      <path d="M19 28c8 1 12-10 19-7 6 2 7-7 15-9" fill="none" stroke="#6b58ef" strokeWidth="3" strokeLinecap="round" />
      <circle cx="19" cy="28" r="3" fill="#6b58ef" /><circle cx="38" cy="21" r="3" fill="#6b58ef" /><circle cx="53" cy="12" r="3" fill="#6b58ef" />
    </g>}
    {name === "brain" && <g filter={`url(#soft-${name})`}>
      <path d="M28 14c-8 0-14 6-14 14 0 3.5 1.3 6.8 3.5 9.2A13 13 0 0 0 30 57h12a13 13 0 0 0 12.5-19.8A14 14 0 0 0 44 14c-3.5 0-6.6 1.3-9 3.4A13.8 13.8 0 0 0 28 14Z" fill="url(#g-brain)" stroke="#6b58ef" strokeWidth="2.4" />
      <path d="M35 18v39M24 30c5 0 7-4 11-4M48 30c-5 0-7-4-13-4M22 42c5 0 7 5 13 4M50 42c-5 0-8 5-15 4" fill="none" stroke="#9c8cff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="27" cy="31" r="3" fill="#2fc46a" /><circle cx="45" cy="31" r="3" fill="#2fc46a" /><circle cx="25" cy="45" r="3" fill="#2588e8" /><circle cx="47" cy="45" r="3" fill="#2588e8" />
    </g>}
    {name === "predict" && <g filter={`url(#soft-${name})`}>
      <circle cx="36" cy="20" r="9" fill="#ffd0a8" stroke="#f07b2c" strokeWidth="2" />
      <path d="M19 60c2.4-11 9.4-17 17-17s14.6 6 17 17" fill="#fff4ea" stroke="#f07b2c" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M36 30v13" stroke="#f07b2c" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 22h10M53 17v10" stroke="#6b58ef" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 20c4-8 12-12 20-12" fill="none" stroke="#9b8dff" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" />
    </g>}
  </svg>;
}

function FairnessArt({ type = "scale" }) {
  return <svg className={`fairness-art ${type}`} viewBox="0 0 140 110" aria-hidden="true">
    <defs>
      <linearGradient id={`fair-${type}`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#f1f5ff" />
      </linearGradient>
    </defs>
    {type === "scale" && <g>
      <path d="M70 16v68M42 28h56M70 28l-24 42M70 28l24 42" stroke="#f4a516" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 70h38c-2 12-10 18-19 18s-17-6-19-18ZM75 70h38c-2 12-10 18-19 18s-17-6-19-18Z" fill="#ffd778" stroke="#f4a516" strokeWidth="3" />
      <path d="M49 95h42M60 84h20" stroke="#6d57f5" strokeWidth="6" strokeLinecap="round" />
      <circle cx="70" cy="28" r="8" fill="#fff6cf" stroke="#f4a516" strokeWidth="4" />
    </g>}
    {type === "group" && <g>
      {[[40, "#76b7ff", "#ffd0a8"], [70, "#ffcb65", "#ffc391"], [100, "#74d59b", "#b77242"]].map(([x, shirt, skin]) => <g key={x}>
        <circle cx={x} cy="39" r="15" fill={skin} />
        <path d={`M${x - 22} 94c4-22 13-32 22-32s18 10 22 32`} fill={shirt} />
        <path d={`M${x - 13} 31c5-10 19-10 25 0v6c-9-3-18-3-25 0z`} fill="#162044" opacity=".9" />
      </g>)}
      <path d="M20 96h100" stroke="#dfe7f4" strokeWidth="5" strokeLinecap="round" />
      <path d="M104 12h24v44M128 12l-10 10M128 12l-10-8" stroke="#e9effb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M112 34l-16 30h32z" fill="none" stroke="#e9effb" strokeWidth="5" />
    </g>}
  </svg>;
}

function PersonBadge({ gender, percent }) {
  const female = gender === "female";
  return <span className={`person-badge ${gender}`}><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="25" r="16" fill={female ? "#ffc391" : "#b97842"} /><path d="M12 61c3-17 11-25 20-25s17 8 20 25" fill={female ? "#ffcc66" : "#69a9ff"} /><path d={female ? "M18 21c3-16 25-18 31 0 2 8-3 17-3 17-11-5-19-5-30 0 0 0-2-9 2-17Z" : "M17 24c3-15 25-18 31-3v7c-11-4-22-4-31 0Z"} fill={female ? "#b45a27" : "#121b39"} /></svg><strong>{percent}</strong></span>;
}

const trainingSets = {
  science: {
    label: "Science Facts",
    icon: "flask",
    tone: "green",
    question: "What is the boiling point of water?",
    facts: ["Water boils at 100°C", "Earth orbits the Sun", "Gravity pulls objects down"],
    examples: [
      ["Water boils at", "100°C"],
      ["Plants need", "Sunlight"],
      ["Earth orbits", "The Sun"],
      ["Fish live in", "Water"]
    ],
    patternRows: [
      ["What is H₂O?", "Water"],
      ["What planet do we live on?", "Earth"],
      ["What gas do plants breathe in?", "Carbon dioxide"],
      ["What is the hardest natural substance?", "Diamond"],
      ["What is the center of an atom?", "Nucleus"]
    ],
    predictionDemo: {
      prompt: "What is the largest planet in our solar system?",
      answer: "Jupiter",
      confidence: 80,
      explanation: "I think the answer is Jupiter! That's what I learned from similar examples."
    },
    morePredictions: [
      ["What gas do plants need to make food?", "CO₂", true],
      ["What is the boiling point of water?", "100°C", true],
      ["How many legs does a spider have?", "8", true],
      ["What is the fastest land animal?", "Cheetah", false],
      ["What is the smallest prime number?", "1", false]
    ],
    patternSummary: "Science facts connect real-world things with their correct facts.",
    before: { "80°C": 1, "90°C": 25, "100°C": 20, "120°C": 10 },
    after: { "80°C": 2, "90°C": 8, "100°C": 90, "120°C": 0 },
    note: "After adding Science Facts",
    prompt: "The model is more confident!"
  },
  math: {
    label: "Math Problems",
    icon: "calculator",
    tone: "blue",
    question: "What is 5 × 5?",
    facts: ["2 + 2 = 4", "5 × 5 = 25", "10 ÷ 2 = 5"],
    examples: [
      ["2 + 2", "4"],
      ["5 × 5", "25"],
      ["10 ÷ 2", "5"],
      ["3 × 4", "12"]
    ],
    patternRows: [
      ["What is 2 + 2?", "4"],
      ["What is 5 × 5?", "25"],
      ["What is 10 ÷ 2?", "5"],
      ["What is 3 × 4?", "12"],
      ["What is 9 - 6?", "3"]
    ],
    predictionDemo: {
      prompt: "What is 6 × 6?",
      answer: "36",
      confidence: 82,
      explanation: "I used the number patterns from the maths examples."
    },
    morePredictions: [
      ["What is 8 + 4?", "12", true],
      ["What is 7 × 3?", "21", true],
      ["What is 20 ÷ 5?", "4", true],
      ["What is 11 × 11?", "111", false],
      ["What is 0 ÷ 0?", "0", false]
    ],
    patternSummary: "Math examples connect problems with the correct result.",
    before: { "15": 12, "20": 18, "25": 32, "55": 8 },
    after: { "15": 1, "20": 6, "25": 92, "55": 1 },
    note: "After Adding Math Problems",
    prompt: "The model noticed the number pattern."
  },
  stories: {
    label: "Stories",
    icon: "storybook",
    tone: "lav",
    question: "What usually comes after “Once upon a...”?",
    facts: ["Once upon a time...", "The hero began a journey", "They lived happily ever after"],
    examples: [
      ["Once upon a", "time"],
      ["The hero began", "a journey"],
      ["The dragon guarded", "the treasure"],
      ["They lived happily", "ever after"]
    ],
    patternRows: [
      ["Once upon a...", "time"],
      ["The hero began...", "a journey"],
      ["The dragon guarded...", "the treasure"],
      ["They lived happily...", "ever after"],
      ["The story starts with...", "a character"]
    ],
    predictionDemo: {
      prompt: "Once upon a...",
      answer: "time",
      confidence: 86,
      explanation: "I learned this common story phrase from similar examples."
    },
    morePredictions: [
      ["Once upon a...", "time", true],
      ["They lived happily...", "ever after", true],
      ["The hero began...", "a journey", true],
      ["The villain opened...", "a sandwich", false],
      ["The story ended with...", "a calculator", false]
    ],
    patternSummary: "Story examples connect familiar openings with likely next words.",
    before: { "planet": 15, "time": 30, "sandwich": 8, "dragon": 18 },
    after: { "planet": 2, "time": 86, "sandwich": 1, "dragon": 11 },
    note: "After Adding Stories",
    prompt: "The model learned a common story pattern."
  }
};

function Mission5({ progress, setProgress, navigate, notify }) {
  const [dataType, setDataType] = useState(() => localStorage.getItem("aiExplorerMission5Dataset") || "science");
  const [activeQuality, setActiveQuality] = useState("good");
  const [reflection, setReflection] = useState(() => localStorage.getItem("aiExplorerMission5Reflection") || "");
  const data = trainingSets[dataType];
  const dataCards = [
    ["science", "Science Facts", "Information about the real world, like facts and observations."],
    ["math", "Math Problems", "Questions and solutions that help AI learn logical reasoning."],
    ["stories", "Stories", "Text written by people that helps AI understand language."]
  ];

  function markProgress(value) {
    setProgress((prev) => {
      const next = structuredClone(prev);
      next.missions[5] = { ...next.missions[5], progress: Math.max(next.missions[5].progress || 0, value), completed: next.missions[5].completed };
      writeProgress(next);
      return next;
    });
  }

  function chooseType(type) {
    setDataType(type);
    localStorage.setItem("aiExplorerMission5Dataset", type);
    markProgress(25);
    notify(`${trainingSets[type].label} selected as your training data.`);
  }

  function saveReflection(value) {
    setReflection(value);
    localStorage.setItem("aiExplorerMission5Reflection", value);
    markProgress(30);
  }

  function goNext() {
    if (!dataType) {
      notify("Choose a type of training data first.");
      return;
    }
    localStorage.setItem("aiExplorerMission5Dataset", dataType);
    localStorage.setItem("selectedDataset", dataType);
    markProgress(35);
    navigate("/mission/5/learn-patterns");
  }

  return <MissionLayout mission={5} headingPrefix="1." title="Get training data" eyebrow="Train your own AI 🧠" bubbleText={<>Garbage in,<br />Garbage out!</>} subtitle={<>AI learns from lots of examples.<br />The data you give it shapes what it learns.</>} robot="training" progress={progress} notify={notify}>
    <section className="lesson-main mission5-data-main">
      <section className="card training-definition-card">
        <div className="concept-title"><span className="question-orb">?</span><h2>What is training data?</h2></div>
        <div className="training-definition-grid">
          <p>Training data is a large collection of text, numbers, images, or other information that the AI uses to learn patterns and make predictions.</p>
          <div className="training-process-card">
            {[["data", "Examples", "(Data)"], ["patterns", "AI Learns", "(Patterns)"], ["predict", "Makes", "Predictions"]].map(([icon, title, detail], index) => <React.Fragment key={title}><div className="training-process-item"><TrainingFigure name={icon} /><strong>{title}</strong><small>{detail}</small></div>{index < 2 && <b className="process-arrow">→</b>}</React.Fragment>)}
          </div>
        </div>
      </section>

      <section className="card data-explorer-card">
        <h2>Explore different types of training data</h2>
        <p>Click on each card to see examples.</p>
        <div className="data-type-grid">
          {dataCards.map(([key, title, description]) => {
            const selected = dataType === key;
            return <button key={key} className={`data-type-card ${selected ? "selected" : ""}`} onClick={() => chooseType(key)}>
              {selected && <span className="selected-check"><Icon name="check" /></span>}
              <TrainingFigure name={key} />
              <strong>{title}</strong>
              <small>{description}</small>
              <em>{selected ? "Selected" : "Select"}</em>
            </button>;
          })}
        </div>
        <div className="dataset-examples" aria-live="polite">
          <strong>{data.label} examples</strong>
          <div>{data.facts.map((fact) => <span key={fact}>{fact}</span>)}</div>
        </div>
      </section>

      <footer className="mission5-footer">
        <button className="outline previous-large" onClick={() => navigate("/mission/4-context")}>‹ Previous</button>
        <div className="training-stepper" aria-label="Mission 5 steps">
          {["Get training data", "Learn patterns", "Make predictions"].map((label, index) => <span className={index === 0 ? "active" : ""} key={label}><b>{index + 1}</b><small>{label}</small></span>)}
        </div>
        <button className="primary next-large" onClick={goNext}>Next: Learn patterns ›</button>
      </footer>
    </section>

    <aside className="lesson-side mission5-data-side">
      <section className="card quality-card">
        <h2>Why does data quality matter?</h2>
        <p>The quality and diversity of data affect how well the AI performs.</p>
        <button className={`quality-row good ${activeQuality === "good" ? "open" : ""}`} onClick={() => setActiveQuality(activeQuality === "good" ? "" : "good")}>
          <span className="quality-mark">✓</span>
          <span><strong>Good data</strong><small>Diverse, accurate, and well-organised.</small>{activeQuality === "good" && <em>Good data gives the AI clear and useful examples to learn from.</em>}</span>
          <b>=</b>
          <span className="quality-face happy">☺<small>Better AI</small></span>
        </button>
        <button className={`quality-row bad ${activeQuality === "bad" ? "open" : ""}`} onClick={() => setActiveQuality(activeQuality === "bad" ? "" : "bad")}>
          <span className="quality-mark">×</span>
          <span><strong>Bad data</strong><small>Biased, incorrect, or limited data.</small>{activeQuality === "bad" && <em>If the data is wrong or too narrow, the AI may learn the wrong pattern.</em>}</span>
          <b>=</b>
          <span className="quality-face sad">☹<small>Poor AI</small></span>
        </button>
      </section>

      <section className="card think-card">
        <h2><span>💡</span>Think about it</h2>
        <p>What might happen if an AI only learns from one type of data?</p>
        <textarea value={reflection} onChange={(event) => saveReflection(event.target.value)} placeholder="Type your thought..." />
        {!reflection && <small>Hint: It may become good at one task, but weak at others.</small>}
      </section>
    </aside>
  </MissionLayout>;
}

function Mission5Patterns({ progress, setProgress, navigate, notify }) {
  const savedType = localStorage.getItem("aiExplorerMission5Dataset") || localStorage.getItem("selectedDataset") || "science";
  const dataType = trainingSets[savedType] ? savedType : "science";
  const data = trainingSets[dataType];
  const rows = (data.patternRows || data.examples).map(([input, output], index) => ({ id: `${dataType}-${index}`, input, output }));
  const answerOptions = useMemo(() => {
    const outputs = rows.map((row) => row.output);
    return outputs.map((_, index) => outputs[(index * 2 + 3) % outputs.length]);
  }, [dataType]);
  const [draggedAnswer, setDraggedAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [patternTestAnswer, setPatternTestAnswer] = useState("");
  const [patternTestResult, setPatternTestResult] = useState("");
  const [matches, setMatches] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("matchedPatterns") || "{}");
      return saved.dataset === dataType ? saved.matches || {} : {};
    } catch {
      return {};
    }
  });
  const [wrongTarget, setWrongTarget] = useState("");
  const [taught, setTaught] = useState(() => localStorage.getItem("aiExplorerMission5Taught") === dataType);
  const [reflectionAnswer, setReflectionAnswer] = useState(() => localStorage.getItem("reflectionAnswer") || "");
  const allMatched = rows.every((row) => matches[row.id] === row.output);
  const shownRows = rows.slice(0, 5);
  const datasetTabs = [
    ["science", "Science Facts", "flask"],
    ["math", "Math Problems", "calculator"],
    ["stories", "Stories", "storybook"]
  ];
  const patternTestExpected = Object.entries(data.after || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || rows[0]?.output || "";

  function markProgress(value) {
    setProgress((prev) => {
      const next = structuredClone(prev);
      next.missions[5] = { ...next.missions[5], progress: Math.max(next.missions[5].progress || 0, value), completed: next.missions[5].completed };
      writeProgress(next);
      return next;
    });
  }

  function tryMatch(example, answer) {
    if (!answer) return;
    if (answer !== example.output) {
      setWrongTarget(example.id);
      notify("Try again. Look carefully at the examples.");
      window.setTimeout(() => setWrongTarget(""), 700);
      return;
    }
    setMatches((prev) => {
      const nextMatches = { ...prev, [example.id]: answer };
      localStorage.setItem("matchedPatterns", JSON.stringify({ dataset: dataType, matches: nextMatches }));
      localStorage.setItem("selectedDataset", dataType);
      return nextMatches;
    });
    setSelectedAnswer("");
    setWrongTarget("");
    markProgress(55);
    notify("Great. That's a pattern.");
  }

  function teachAI() {
    if (!allMatched) {
      notify("Complete all matches first.");
      return;
    }
    setTaught(true);
    localStorage.setItem("aiExplorerMission5Taught", dataType);
    markProgress(75);
    notify("Pattern found. The AI can use this knowledge next.");
  }

  function chooseReflection(answer) {
    setReflectionAnswer(answer);
    localStorage.setItem("reflectionAnswer", answer);
    if (answer === "It may not learn enough") {
      markProgress(85);
      notify("Correct. AI needs many examples to recognise patterns.");
    } else {
      notify("Not quite. One example is usually not enough to learn a reliable pattern.");
    }
  }

  function goNext() {
    if (!allMatched) {
      notify("Complete all matches first.");
      return;
    }
    localStorage.setItem("selectedDataset", dataType);
    localStorage.setItem("matchedPatterns", JSON.stringify({ dataset: dataType, matches }));
    localStorage.setItem("reflectionAnswer", reflectionAnswer);
    markProgress(taught ? 90 : 82);
    navigate("/mission/5/make-predictions");
  }

  function checkPatternTest() {
    const clean = patternTestAnswer.trim().toLowerCase();
    if (!clean) {
      notify("Type an answer first.");
      return;
    }
    const expected = patternTestExpected.toLowerCase();
    const correct = clean === expected || clean.replace(/\s/g, "") === expected.replace(/\s/g, "");
    setPatternTestResult(correct ? "correct" : "wrong");
    notify(correct ? "Nice. Your AI used the learned pattern." : `Not quite. The learned pattern points to ${patternTestExpected}.`);
  }

  return <MissionLayout mission={5} headingPrefix="2." title="Learn patterns" eyebrow="Train your own AI 🧠" bubbleText={<>Let's see what<br />patterns your AI<br />can find! 🔍</>} subtitle={<>Now the AI looks at your data and finds patterns.<br />These patterns help it understand and answer similar questions.</>} robot="detective" progress={progress} notify={notify}>
    <section className="lesson-main mission5-pattern-main">
      <section className="card pattern-observe-card">
        <h2>Step 1: See the examples</h2>
        <p>These are the training examples you gave your AI.</p>
        <div className="pattern-tabs" role="group" aria-label="Training data type">
          {datasetTabs.map(([key, label, icon]) => <button key={key} className={dataType === key ? "active" : ""} onClick={() => notify(`${label} was selected on the previous page.`)}><Icon name={icon} />{label}</button>)}
        </div>
        <div className="example-table">
          <div><strong>Input (Question)</strong><strong>Output (Answer)</strong></div>
          {shownRows.map((row) => <button key={row.id} onClick={() => notify(`${row.input} connects with ${row.output}.`)}>
            <span>{row.input}</span><span>{row.output}</span>
          </button>)}
        </div>
        <button className="show-more-examples outline" onClick={() => notify("More examples help patterns become stronger.")}>Show more examples <span>⌄</span></button>
      </section>

      <section className="card pattern-match-card">
        <h2>Step 2: What pattern do you see?</h2>
        <p>Drag and drop the pieces to complete the pattern.</p>
        <div className="match-board">
          <div className="match-prompts">
            {shownRows.map((row) => {
              const done = matches[row.id] === row.output;
              return <div key={row.id} className={`match-row ${done ? "done" : ""} ${wrongTarget === row.id ? "wrong" : ""}`}>
                <span>{row.input}</span>
                <i>→</i>
                <button
                  className="drop-slot"
                  onClick={() => tryMatch(row, selectedAnswer)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    tryMatch(row, event.dataTransfer.getData("text/plain") || draggedAnswer);
                  }}
                >
                  {done ? matches[row.id] : ""}
                </button>
              </div>;
            })}
          </div>
          <div className="match-answers" aria-label="Answer choices">
            {answerOptions.map((answer) => {
              const used = Object.values(matches).includes(answer);
              return <button
                key={answer}
                draggable={!used}
                disabled={used}
                className={`${selectedAnswer === answer ? "selected" : ""} ${used ? "used" : ""}`}
                onClick={() => setSelectedAnswer(used ? "" : answer)}
                onDragStart={(event) => {
                  setDraggedAnswer(answer);
                  event.dataTransfer.setData("text/plain", answer);
                }}
              >
                {answer}
              </button>;
            })}
          </div>
        </div>
        {allMatched && <div className="pattern-success"><Icon name="check" /><strong>Great! 🎉</strong><span>Your AI found the pattern: It learns facts and their correct answers.</span></div>}
      </section>

      <footer className="mission5-footer">
        <button className="outline previous-large" onClick={() => navigate("/mission/5/get-training-data")}>‹ Previous</button>
        <div className="training-stepper" aria-label="Mission 5 steps">
          {["Get training data", "Learn patterns", "Make predictions"].map((label, index) => <span className={index < 2 ? "active" : ""} key={label}><b>{index === 0 ? "✓" : index + 1}</b><small>{label}</small></span>)}
        </div>
        <button className="primary next-large" disabled={!allMatched} onClick={goNext}>Next: Make Predictions ›</button>
      </footer>
    </section>

    <aside className="lesson-side mission5-pattern-side">
      <section className="card pattern-flow-card">
        <h2>What is a pattern?</h2>
        <p>A pattern is a rule or relationship that happens again and again.</p>
        <div className={`pattern-flow pattern-flow-horizontal ${allMatched ? "found" : ""}`}>
          <span><TrainingFigure name="data" /><strong>Examples</strong></span>
          <b>→</b>
          <span className="pattern-node"><TrainingFigure name="patterns" /><strong>Find Pattern</strong></span>
          <b>→</b>
          <span><TrainingFigure name="predict" /><strong>Predict</strong></span>
        </div>
      </section>

      <section className="card detective-note-card">
        <h2>Test your AI!</h2>
        <p>Let's see if your AI can use the pattern.</p>
        <div className="test-ai-card">
          <strong>Q: {data.question}</strong>
          <input value={patternTestAnswer} onChange={(event) => { setPatternTestAnswer(event.target.value); setPatternTestResult(""); }} placeholder="Type your answer..." />
          <button className="primary" onClick={checkPatternTest}>Check Answer</button>
          {patternTestResult && <small className={patternTestResult}>{patternTestResult === "correct" ? "Correct. The pattern worked." : `Try again. Expected: ${patternTestExpected}`}</small>}
        </div>
      </section>

      <section className="card pattern-help-card">
        <div>
          <h2><Icon name="bulb" />Think about it</h2>
          <p>If the AI sees more correct examples, its patterns will be stronger and its answers more accurate!</p>
        </div>
        <span className="think-face" aria-hidden="true">💡</span>
      </section>
    </aside>
  </MissionLayout>;
}

function PredictionChoices({ title, note, values, active, onPick, highlight }) {
  return <div className="prediction-choice-block"><strong>{title}</strong><small>{note}</small><div className="training-predictions">{Object.entries(values).map(([label, value]) => <button key={label} className={`${active === label ? "active" : ""} ${highlight === label ? "highlight" : ""}`} onClick={() => onPick(label)}><strong>{label}</strong><span>{value}%</span></button>)}</div></div>;
}

function Mission5Predictions({ progress, setProgress, navigate, notify }) {
  const savedType = localStorage.getItem("aiExplorerMission5Dataset") || localStorage.getItem("selectedDataset") || "science";
  const dataType = trainingSets[savedType] ? savedType : "science";
  const data = trainingSets[dataType];
  const [question, setQuestion] = useState(data.predictionDemo.prompt);
  const [checked, setChecked] = useState(true);
  const [marked, setMarked] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [extraTraining, setExtraTraining] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mission5ExtraTraining") || "[]");
    } catch {
      return [];
    }
  });
  const demo = data.predictionDemo;
  const [prediction, setPrediction] = useState(() => ({ answer: demo.answer, confidence: demo.confidence, explanation: demo.explanation, level: "high" }));

  function normalizeQuestion(value) {
    return value.toLowerCase().replace(/[^\w×÷+\-*/.\s]/g, "").replace(/\s+/g, " ").trim();
  }

  function parseArithmetic(value) {
    const text = value.toLowerCase().replace(/×/g, "x").replace(/÷/g, "/");
    const match = text.match(/(-?\d+(?:\.\d+)?)\s*(x|\*|\/|\+|-)\s*(-?\d+(?:\.\d+)?)/);
    if (!match) return null;
    const left = Number(match[1]);
    const op = match[2];
    const right = Number(match[3]);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
    if (op === "/" && right === 0) return { answer: "undefined", operation: "division by zero" };
    const valueOut = op === "x" || op === "*" ? left * right : op === "/" ? left / right : op === "+" ? left + right : left - right;
    return { answer: Number.isInteger(valueOut) ? String(valueOut) : String(Number(valueOut.toFixed(2))), operation: op === "x" || op === "*" ? "multiplication" : op === "/" ? "division" : op === "+" ? "addition" : "subtraction" };
  }

  function predictFromQuestion(value) {
    const normal = normalizeQuestion(value);
    const trained = extraTraining.find((item) => normalizeQuestion(item.question) === normal);
    if (trained) {
      return { answer: trained.answer, confidence: 94, explanation: "I learned this from the extra training example you added.", level: "high", trained: true };
    }
    const arithmetic = parseArithmetic(value);
    if (arithmetic) {
      return { answer: arithmetic.answer, confidence: dataType === "math" ? 90 : 72, explanation: `I recognised a ${arithmetic.operation} pattern and applied it to the new numbers.`, level: dataType === "math" ? "high" : "medium" };
    }
    const text = value.toLowerCase();
    const exact = data.morePredictions.find(([prompt]) => text.includes(prompt.toLowerCase().replace(/[?.…]/g, "").slice(0, 18)));
    if (exact) {
      return { answer: exact[1], confidence: exact[2] ? 86 : 42, explanation: exact[2] ? "I found a very similar pattern in the training examples." : "I found a weak pattern, but this might be a bad guess.", level: exact[2] ? "high" : "low" };
    }
    if (text.includes("largest planet") || text.includes("solar system")) return { answer: demo.answer, confidence: demo.confidence, explanation: demo.explanation, level: "high" };
    if (text.includes("water") || text.includes("boiling") || text.includes("plants") || text.includes("planet") || text.includes("story") || text.includes("once") || text.includes("multiply") || text.includes("what is")) {
      return { answer: demo.answer, confidence: 64, explanation: "This looks similar to my training data, so I can make a reasonable guess.", level: "medium" };
    }
    return { answer: "I'm not sure", confidence: 28, explanation: "This question does not look much like my training examples. I need more relevant data.", level: "low" };
  }

  function markProgress(value, completed = false) {
    setProgress((prev) => {
      const next = structuredClone(prev);
      const alreadyDone = next.missions[5].completed;
      next.missions[5] = { ...next.missions[5], progress: Math.max(next.missions[5].progress || 0, value), completed: alreadyDone || completed };
      if (completed && !alreadyDone) next.xp += 100;
      writeProgress(next);
      return next;
    });
  }

  function askAI() {
    const nextPrediction = predictFromQuestion(question);
    setPrediction(nextPrediction);
    setChecked(true);
    setCorrectAnswer("");
    markProgress(95);
    notify(nextPrediction.level === "low" ? "Low confidence: the question is outside the training pattern." : "Your AI used learned patterns to make a prediction.");
  }

  function addTrainingExample() {
    const cleanAnswer = correctAnswer.trim();
    if (!question.trim() || !cleanAnswer) {
      notify("Add the correct answer so the AI can learn from it.");
      return;
    }
    const nextTraining = [...extraTraining.filter((item) => normalizeQuestion(item.question) !== normalizeQuestion(question)), { question: question.trim(), answer: cleanAnswer, dataset: dataType }];
    setExtraTraining(nextTraining);
    localStorage.setItem("mission5ExtraTraining", JSON.stringify(nextTraining));
    const nextPrediction = { answer: cleanAnswer, confidence: 94, explanation: "I learned from your correction. The new training example changed my prediction.", level: "high", trained: true };
    setPrediction(nextPrediction);
    setChecked(true);
    setMarked("correct");
    setCorrectAnswer("");
    markProgress(99);
    notify("Training example added. The AI updated its prediction.");
  }

  function finishMission() {
    markProgress(100, true);
    notify("Mission 5 completed. Data Collector badge earned.");
    window.setTimeout(() => navigate("/mission/6-bias"), 500);
  }

  return <MissionLayout mission={5} headingPrefix="3." title="Make predictions" eyebrow="Train your own AI 🧠" bubbleText={<>Wow! Your AI is<br />making guesses<br />based on what<br />it learned! 🤖</>} subtitle={<>Now your AI is ready! Give it new examples<br />and see what it predicts.</>} robot="idea" progress={progress} notify={notify}>
    <section className="lesson-main mission5-predict-main">
      <section className="card predict-try-card">
        <h2>Try it yourself!</h2>
        <p>Type a new question similar to your training data.</p>
        <div className="ask-ai-box">
          <label>Ask your AI a question...</label>
          <div>
            <input value={question} onChange={(event) => { setQuestion(event.target.value); setChecked(false); setMarked(""); }} />
            <button className="primary" onClick={askAI}>Ask AI</button>
          </div>
        </div>

        <span className="prediction-label">Your AI predicts:</span>
        <div className={`prediction-result ${checked ? "show" : ""}`}>
          <div className={`prediction-answer ${prediction.level}`}>
            <strong>{checked ? prediction.answer : "Waiting..."}</strong>
            <small>{checked ? `${prediction.level[0].toUpperCase()}${prediction.level.slice(1)} confidence` : "Ask AI to see a prediction"}</small>
          </div>
          <RobotLogo />
          <p>{checked ? prediction.explanation : "I will compare your question with the patterns I learned."}</p>
          <div className="confidence-row">
            <span>How confident is your AI? <button onClick={() => notify("Confidence is how strongly the learned patterns point to one answer.")}>?</button></span>
            <div className="confidence-bars">{Array.from({ length: 6 }, (_, index) => <i key={index} className={checked && index < Math.round(prediction.confidence / 16.7) ? "filled" : ""} />)}</div>
            <strong>{checked ? `${prediction.confidence}%` : "0%"}</strong>
          </div>
        </div>

        <div className="correct-panel">
          <strong>Was it correct?</strong>
          <div>
            <button className={`correct-choice ${marked === "correct" ? "active" : ""}`} onClick={() => { setMarked("correct"); markProgress(98); }}><Icon name="check" />Correct!<small>Great job!</small></button>
            <button className={`wrong-choice ${marked === "wrong" ? "active" : ""}`} onClick={() => { setMarked("wrong"); notify("Mistakes can happen when the training data is limited or missing examples."); }}><Icon name="alert" />Not quite<small>Let's see why.</small></button>
          </div>
          {marked === "wrong" && <section className="retrain-panel">
            <strong>Train it with the correct answer</strong>
            <p>Add one more example. Then the AI will use this correction next time.</p>
            <div><input value={correctAnswer} onChange={(event) => setCorrectAnswer(event.target.value)} placeholder="Correct answer..." /><button className="primary" onClick={addTrainingExample}>Train AI</button></div>
          </section>}
        </div>
      </section>

      <section className="card more-predictions-card">
        <h2>More predictions</h2>
        <p>Test your AI with more questions.</p>
        <div className="prediction-list">
          {data.morePredictions.map(([prompt, answer, correct]) => <button className={correct ? "right" : "miss"} key={prompt} onClick={() => notify(correct ? "This prediction matches a strong learned pattern." : "This is a weak or misleading pattern. More relevant data would help.")}>
            <span>{prompt}</span>
            <strong>{answer}</strong>
            <Icon name={correct ? "check" : "alert"} />
          </button>)}
        </div>
        <button className="outline retry-predictions" onClick={() => { setChecked(false); setMarked(""); notify("Try another question in the box on the left."); }}>↻ Try more on your own</button>
      </section>

      <footer className="mission5-footer mission5-finish-footer">
        <button className="outline previous-large" onClick={() => navigate("/mission/5/learn-patterns")}>‹ Previous</button>
        <div className="training-stepper" aria-label="Mission 5 steps">
          {["Get training data", "Learn patterns", "Make predictions"].map((label, index) => <span className="active" key={label}><b>{index < 2 ? index + 1 : 3}</b><small>{label}</small></span>)}
        </div>
        <button className="primary next-large finish-mission-button" onClick={finishMission}>🏆 Finish Mission 🎉</button>
      </footer>
    </section>

    <aside className="lesson-side mission5-predict-side">
      <section className="card whats-happening-card">
        <h2>What’s happening?</h2>
        <p>Your AI looks at the patterns it learned and predicts the most likely answer.</p>
        <div className="prediction-flow-horizontal">
          <span><TrainingFigure name="data" /><strong>Learned Patterns</strong></span>
          <b>→</b>
          <span><Icon name="search" /><strong>Looks at New Input</strong></span>
          <b>→</b>
          <span><TrainingFigure name="predict" /><strong>Makes a Prediction</strong></span>
        </div>
      </section>

      <section className="card prediction-mistake-card">
        <h2>Why do predictions sometimes get it wrong?</h2>
        <p>If the training data is limited, biased, or missing examples, the AI can make mistakes.</p>
        <PredictionScatter />
        <div className="scatter-legend"><span><i />Training data</span><span><i />New question</span></div>
      </section>

      <section className="card predict-think-card">
        <div>
          <h2><Icon name="bulb" />Think about it</h2>
          <p>How could we improve our AI’s predictions?</p>
          <p>What kind of data would help it get better?</p>
        </div>
        <span aria-hidden="true">🤔</span>
      </section>
    </aside>
  </MissionLayout>;
}

function PredictionScatter() {
  return <svg className="prediction-scatter" viewBox="0 0 220 98" aria-hidden="true">
    <g fill="#8d72f6" opacity=".72">
      {[24, 43, 62, 82, 101, 122, 145, 164].map((x, i) => <circle key={`a-${x}`} cx={x} cy={26 + (i % 3) * 17} r="5" />)}
      {[35, 55, 78, 111, 137].map((x, i) => <circle key={`b-${x}`} cx={x} cy={64 + (i % 2) * 12} r="5" />)}
    </g>
    <ellipse cx="164" cy="52" rx="45" ry="22" fill="none" stroke="#d9e2f2" strokeWidth="2.5" transform="rotate(-18 164 52)" />
    <circle cx="172" cy="51" r="6" fill="#ef4d45" />
    <path d="M204 52h15M214 47l5 5-5 5" fill="none" stroke="#17203c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <text x="222" y="58" fill="#17203c" fontSize="18" fontWeight="900">?</text>
  </svg>;
}

function Mission6({ progress, setProgress, navigate, notify }) {
  const saved = progress.missions[6] || { progress: 0, completed: false };
  const [maleCount, setMaleCount] = useState(9);
  const [viewMode, setViewMode] = useState("people");
  const femaleCount = 10 - maleCount;
  const malePercent = maleCount * 10;
  const femalePercent = femaleCount * 10;
  const prediction = maleCount > femaleCount ? "Male" : femaleCount > maleCount ? "Female" : "Both equally";
  const answer = prediction === "Male" ? "A. Male" : prediction === "Female" ? "B. Female" : "C. Both equally";
  const [selected, setSelected] = useState(saved.progress >= 45 ? answer : "");
  const [submitted, setSubmitted] = useState(saved.progress >= 45);
  const [wrong, setWrong] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [activeSolution, setActiveSolution] = useState(null);
  const choices = ["A. Male", "B. Female", "C. Both equally", "D. It's impossible to know"];

  function markProgress(value, completed = false) {
    setProgress((prev) => {
      const next = structuredClone(prev);
      const alreadyDone = next.missions[6].completed;
      next.missions[6] = { progress: Math.max(next.missions[6].progress || 0, value), completed: alreadyDone || completed };
      if (completed && !alreadyDone) next.xp += 100;
      writeProgress(next);
      return next;
    });
  }

  function submitAnswer() {
    if (!selected) return;
    if (selected !== answer) {
      setWrong(true);
      notify("Try again. Look at the training data ratio.");
      return;
    }
    setWrong(false);
    setSubmitted(true);
    markProgress(80);
    notify("Correct. The model follows the training data pattern.");
  }

  function changeRatio(value) {
    setMaleCount(Number(value));
    setSelected("");
    setSubmitted(false);
    setWrong(false);
    markProgress(35);
  }

  function resetRatio() {
    changeRatio(9);
    notify("Training data reset to 90% male and 10% female.");
  }

  function completeMission() {
    if (!submitted) {
      notify("Complete the bias activity first.");
      return;
    }
    markProgress(100, true);
    notify("Mission 6 completed. Final Challenge unlocked.");
    window.setTimeout(() => navigate("/final-challenge"), 500);
  }

  return <MissionLayout mission={6} title="Can AI be biased?" subtitle={<>AI can reflect biases in its training data.<br />It’s important to understand and fix them.</>} progress={progress} notify={notify}><section className="lesson-main mission6-main"><section className="scenario-card bias-scenario interactive-bias-scenario"><span>Scenario</span><div className="bias-scenario-head"><div><strong>Q: Who is a doctor?</strong><p>This is the training data the AI has seen.</p></div><div className="bias-view-toggle" role="group" aria-label="Bias data view"><button className={viewMode === "people" ? "active" : ""} onClick={() => setViewMode("people")}><Icon name="person" />People view</button><button className={viewMode === "percentage" ? "active" : ""} onClick={() => setViewMode("percentage")}><Icon name="chart" />Percentage view</button></div></div><BiasTrainingBoard maleCount={maleCount} femaleCount={femaleCount} malePercent={malePercent} femalePercent={femalePercent} viewMode={viewMode} /><div className="ratio-control"><p>Adjust the data ratio <small>(total people = 10)</small></p><div className="ratio-line"><span><DoctorAvatar gender="male" mini />Male: {maleCount}</span><input aria-label="Adjust male doctor count" type="range" min="0" max="10" step="1" value={maleCount} onChange={(event) => changeRatio(event.target.value)} /><span><DoctorAvatar gender="female" mini />Female: {femaleCount}</span><button className="outline reset-ratio" onClick={resetRatio}>↻ Reset</button></div><div className="slider-scale">{Array.from({ length: 6 }, (_, i) => <i key={i}>{i * 2}</i>)}</div></div></section><Step n="1" title="What answer is the AI most likely to give?"><div className="bias-question-head"><p className="step-subcopy">Based on the training data above.</p><div className="prediction-strip"><small>Current prediction</small><strong className={prediction === "Female" ? "female" : prediction === "Both equally" ? "balanced" : ""}>{prediction}</strong><span>Male {malePercent}%</span><i /> <span>Female {femalePercent}%</span></div></div><div className="answer-grid bias-options">{choices.map((choice) => <button key={choice} disabled={submitted} onClick={() => { setSelected(choice); setWrong(false); }} className={`${selected === choice ? "selected" : ""} ${wrong && selected === choice ? "wrong" : ""}`}>{choice.replace(/^A\. |^B\. |^C\. |^D\. /, "")}{submitted && choice === answer && <Icon name="check" />}</button>)}</div>{submitted && <div className="answer-feedback"><strong>Correct!</strong><p>{prediction === "Both equally" ? "With balanced data, the AI has no strong reason to prefer one group." : <>Based on this data, the AI is most likely to say <b>{prediction}</b>.</>} It is still a prediction from patterns, not a guaranteed fact.</p></div>}<button className="primary" disabled={!selected || submitted} onClick={submitAnswer}>{wrong ? "Try Again" : submitted ? "Correct" : "Submit Answer"}</button></Step><footer className="bottom-nav"><button className="outline" onClick={() => navigate("/mission/5-training-data")}>‹ Previous</button><button className="primary" disabled={!submitted} onClick={completeMission}>Mission Complete 🎉</button></footer></section><aside className="lesson-side mission6-side"><section className="card how-card happens-card bias-flow"><h2>How bias happens</h2>{[
    ["data", "1. Data is not balanced", "Some groups are over-represented.", "blue", "Some groups appear more often in the data."],
    ["patterns", "2. Model learns bias", "The model learns patterns from the biased data.", "green", "The model learns patterns from the data."],
    ["alert", "3. Biased predictions", "It may give unfair or discriminatory results.", "orange", "Predictions may become unfair."]
  ].map(([icon, title, text, tone, detail], i) => <button className={`flow-card ${tone} ${activeStep === i ? "open" : ""}`} onClick={() => setActiveStep(activeStep === i ? null : i)} key={title}>{icon === "alert" ? <span className="flow-icon"><Icon name="alert" /></span> : <TrainingFigure name={icon} />}<span className="flow-copy"><strong>{title}</strong><small>{text}</small>{activeStep === i && <em>{detail}</em>}</span></button>)}</section><section className="card fairness-actions-card"><h2>What can we do?</h2><p>Use diverse data, test for bias, and build fairer AI systems.</p><FairnessArt type="group" /><div className="solution-list">{["Use diverse data", "Test for bias", "Build fairer AI systems"].map((item, i) => <button key={item} className={activeSolution === i ? "active" : ""} onClick={() => { setActiveSolution(activeSolution === i ? null : i); notify("Examples include more diverse datasets, human review, and bias testing."); }}><Icon name={i === 0 ? "person" : i === 1 ? "search" : "scale"} />{item}</button>)}</div>{activeSolution !== null && <small>Examples: more diverse datasets, human review, and bias testing.</small>}<QuickQuiz title="Bias Quick Check" notify={notify} locked={!submitted} lockText="Submit the bias prediction first." questions={[
    { id: "bias-cause", prompt: "Why did the AI prefer one group?", options: ["The data was unbalanced", "It checked real-world truth"], answer: "The data was unbalanced" },
    { id: "bias-fix", prompt: "A good way to reduce bias is...", options: ["Use more balanced data", "Hide the result"], answer: "Use more balanced data" }
  ]} /></section>{(submitted || saved.completed) && <section className="card great-work-card"><h2>Great job!</h2><p>You’ve learned how bias happens and how we can fix it.</p><strong><Icon name="star" className="star" />+100 XP</strong></section>}</aside></MissionLayout>;
}

function BiasTrainingBoard({ maleCount, femaleCount, malePercent, femalePercent, viewMode }) {
  return <div className="training-data-board">{viewMode === "people" ? <><section className="bias-group-panel male"><strong>Male doctors in training data</strong><div className="avatar-row">{Array.from({ length: maleCount }, (_, index) => <DoctorAvatar key={`m-${index}`} gender="male" />)}</div><p><span />{malePercent}% <small>({maleCount} out of 10)</small></p></section><section className="bias-group-panel female"><strong>Female doctors in training data</strong><div className="avatar-row">{Array.from({ length: femaleCount }, (_, index) => <DoctorAvatar key={`f-${index}`} gender="female" />)}</div><p><span />{femalePercent}% <small>({femaleCount} out of 10)</small></p></section></> : <section className="percentage-view"><div><strong>Male doctors</strong><span>{malePercent}%</span><i><b style={{ width: `${malePercent}%` }} /></i></div><div><strong>Female doctors</strong><span>{femalePercent}%</span><i><b style={{ width: `${femalePercent}%` }} /></i></div></section>}</div>;
}

function DoctorAvatar({ gender, mini = false }) {
  const isFemale = gender === "female";
  return <svg className={`doctor-avatar ${isFemale ? "female" : "male"} ${mini ? "mini" : ""}`} viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill={isFemale ? "#fff4dd" : "#eaf2ff"} /><path d="M9 42c2.8-7.2 8.2-10.8 15-10.8S36.2 34.8 39 42" fill={isFemale ? "#ffd36b" : "#3a86f6"} /><circle cx="24" cy="21" r="9.2" fill="#ffd2a4" /><path d={isFemale ? "M13.5 23c0-9.2 5.1-14.3 10.8-14.3S35 14 35 23v10.5c-2.7-1.3-5.3-2-7.8-2.2 2.8-1.4 4.5-4.2 4.5-7.3 0-3.1-1.6-5.7-4.2-7.1-4.4 3.2-8.4 3-11.8 1.3-1.3 1.5-2.2 3.6-2.2 4.8Z" : "M14.5 18.3c.7-5.5 4.5-9.2 9.9-9.2 5.8 0 9.4 3.3 9.8 8.8-3.3.3-6.7-.8-9.1-3.1-2.3 2.7-5.8 4-10.6 3.5Z"} fill={isFemale ? "#c5652f" : "#111b36"} /><circle cx="20.5" cy="22.3" r="1.5" fill="#111b36" /><circle cx="27.5" cy="22.3" r="1.5" fill="#111b36" /><path d="M20.8 27.1c2 1.6 4.3 1.6 6.4 0" fill="none" stroke="#111b36" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function BiasDataCard({ title, male, female, active, onClick }) {
  return <button className={`bias-data-card ${active ? "active" : ""}`} onClick={onClick}><strong>{title}</strong><div><PersonBadge gender="male" percent={male} /><PersonBadge gender="female" percent={female} /></div></button>;
}

function MissionLayout({ mission, title, subtitle, robot = "pointing", progress, notify, children, headingPrefix, eyebrow, bubbleText }) {
  return <div className={`mission-layout mission-${mission}`}><header className="mission-header"><button className="outline" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "/missions" }))}>‹ Back to Missions</button><div className="mission-mid"><strong>Mission {mission} of 6</strong><span className="mission-dots">{missionData.map((m) => <i className={m.id <= mission ? "filled" : ""} key={m.id} />)}</span></div><div className="mission-header-actions"><button className="status-pill" onClick={() => notify?.("XP shows your learning progress. Complete missions to earn more XP.")}><Icon name="star" className="star" />{progress?.xp ?? 1200} XP</button><button className="status-pill" onClick={() => notify?.(`You have learned for ${progress?.streak ?? 7} days in a row.`)}><Icon name="flame" className="flame" />{progress?.streak ?? 7} day streak</button><button className="icon-button" onClick={() => notify?.("Settings: text size, animation speed, sound, dark mode, reset progress.")}><Icon name="gear" /></button></div></header><section className="mission-content"><header className="mission-title"><div>{eyebrow && <span className="mission-eyebrow">{eyebrow}</span>}<h1>{headingPrefix ?? `${mission}.`} {title}</h1><p>{subtitle}</p></div>{bubbleText && <span className="mascot-bubble">{bubbleText}</span>}<Mascot type={robot} /></header><div className="lesson-grid">{children}</div></section></div>;
}

function PlaceholderPage({ route }) {
  return <div className="placeholder"><div className="card"><h1>{route.replace("/", "") || "Page"}</h1><p>This page is ready to build next. Progress and navigation already use the shared React system.</p></div></div>;
}

function App() {
  const [route, setRoute] = useState(() => window.location.pathname === "/" ? "/dashboard" : window.location.pathname);
  const [progress, setProgress] = useState(readProgress);
  const [toast, setToast] = useState("");
  function navigate(next) {
    if (next === "/") next = "/dashboard";
    setRoute(next);
    window.history.pushState({}, "", next);
  }
  function notify(message) {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(""), 2400);
  }
  function resetProgress() {
    const next = defaultProgress();
    writeProgress(next);
    setProgress(next);
    notify("Progress reset.");
  }
  React.useEffect(() => {
    const onPop = () => setRoute(window.location.pathname === "/" ? "/dashboard" : window.location.pathname);
    const onNavigate = (event) => navigate(event.detail);
    window.addEventListener("popstate", onPop);
    window.addEventListener("navigate", onNavigate);
    return () => { window.removeEventListener("popstate", onPop); window.removeEventListener("navigate", onNavigate); };
  }, []);
  let page;
  if (route === "/dashboard") page = <Dashboard progress={progress} navigate={navigate} notify={notify} />;
  else if (route === "/missions") page = <MissionsPage progress={progress} navigate={navigate} notify={notify} />;
  else if (route === "/progress") page = <ProgressPage progress={progress} navigate={navigate} notify={notify} />;
  else if (route === "/activity") page = <ActivityPage progress={progress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/1-tokenisation") page = <Mission1 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/2-next-token") page = <Mission2 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/3-hallucination") page = <Mission3 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/4-context") page = <Mission4 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/5-training-data" || route === "/mission/5/get-training-data") page = <Mission5 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/5/learn-patterns") page = <Mission5Patterns progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/5/make-predictions") page = <Mission5Predictions progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/6-bias") page = <Mission6 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else page = <PlaceholderPage route={route} />;
  return <Shell route={route} progress={progress} navigate={navigate} notify={notify} resetProgress={resetProgress}>{page}{toast && <div className="toast show">{toast}</div>}</Shell>;
}

createRoot(document.getElementById("root")).render(<App />);
