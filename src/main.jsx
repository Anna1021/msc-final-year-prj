import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, BrainCircuit, Database, Globe2, Lightbulb, Scale, ShieldCheck, TrendingUp, Users, Wrench } from "lucide-react";
import "./styles.css";
import FinalChallenge from "./finalChallenge/FinalChallenge.jsx";
import LanguageSelector from "./components/LanguageSelector.jsx";
import { LanguageProvider, translateMission, useI18n } from "./i18n/index.jsx";

const STORAGE_KEY = "aiExplorerProgress";

const missionData = [
  { id: 1, title: "How does ChatGPT read?", short: "How does ChatGPT read?", desc: "Learn how text is broken into tokens.", route: "/mission/1-tokenisation", skill: "Tokens & Tokenisation", icon: "wand" },
  { id: 2, title: "Can you think like ChatGPT?", short: "Can you think like ChatGPT?", desc: "Predict the next token using probability.", route: "/mission/2-next-token", skill: "Next-token Prediction", icon: "bolt" },
  { id: 3, title: "Why does ChatGPT make mistakes?", short: "Why does ChatGPT make mistakes?", desc: "Discover hallucinations and probabilistic errors.", route: "/mission/3-hallucination", skill: "Probability & Sampling", icon: "question" },
  { id: 4, title: "Why does context matter?", short: "Why does context matter?", desc: "See how earlier words change the meaning.", route: "/mission/4-context", skill: "Context & Meaning", icon: "link" },
  { id: 5, title: "Train your own AI", short: "Train your own AI", desc: "Add training data and see how it changes the model.", route: "/mission/5-training-data", skill: "Training Data Influence", icon: "database" },
  { id: 6, title: "Can AI be biased?", short: "Can AI be biased?", desc: "Explore how bias in data leads to biased outputs.", route: "/mission/6-bias", skill: "Bias & Fairness", icon: "scale" }
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

function RobotAvatar({ pose = "pointing", size = "" }) {
  if (size === "small") return <RobotLogo />;
  const mascotType = {
    hero: "pointing",
    pointing: "pointing",
    reading: "reading",
    training: "training",
    detective: "detective",
    idea: "idea",
    missions: "missions",
    hallucination: "hallucination",
  }[pose] || "pointing";
  return <Mascot type={mascotType} />;
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
    return <span className={`mascot detective-mascot ${type === "idea" ? "idea-mascot safe-idea-mascot" : ""}`}><img src="/assets/img/mission-robot-pointing.png" alt="Friendly AI Explorer robot" />{type === "detective" ? <><span className="detective-lens" aria-hidden="true"><Icon name="search" /></span><span className="pattern-sparks" aria-hidden="true"><i /><i /><i /></span></> : <span className="idea-bulb" aria-hidden="true"><Icon name="bulb" /></span>}</span>;
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
  const { t } = useI18n();
  const completed = completedCount(progress);
  const progressPct = Math.round((completed / missionData.length) * 100);
  const nav = [
    ["dashboard", t("navigation.home"), "/dashboard", "home"],
    ["missions", t("navigation.missions"), "/missions", "target"],
    ["progress", t("navigation.progress"), "/progress", "chart"],
    ["about", t("navigation.about"), "/about", "info"]
  ];
  return <aside className="sidebar">
    <div className="logo" onClick={() => navigate("/dashboard")} role="button" tabIndex={0}>
      <RobotAvatar size="small" />
      <div><strong>AI Explorer</strong><small>{t("common.app.tagline")}</small></div>
    </div>
    <nav className="side-nav">{nav.map(([key, label, href, icon]) => <button key={key} className={routeGroup(route) === key ? "active" : ""} onClick={() => navigate(href)}><Icon name={icon} />{label}</button>)}</nav>
    <div className="sidebar-bottom">
      <div className="profile-card" onClick={() => navigate("/profile")} role="button" tabIndex={0}>
        <Avatar small />
        <div className="profile-copy"><strong>{t("common.profile.name")}</strong><em>{t("common.profile.level", { level: 3 })}</em></div>
        <span className="profile-progress-track"><span style={{ width: progressPct + "%" }} /></span>
        <small>{t("common.profile.missionsComplete", { completed, total: missionData.length })}</small>
      </div>
      <div className="tip-card"><h2>{t("common.profile.tipTitle")}</h2><p>{t("common.profile.tipCopy")}</p></div>
    </div>
  </aside>;
}

function routeGroup(route) {
  if (route === "/" || route === "/dashboard") return "dashboard";
  if (route === "/missions" || route.startsWith("/mission") || route === "/final-challenge") return "missions";
  if (route === "/activity" || route.startsWith("/progress")) return "progress";
  return route.replace("/", "") || "dashboard";
}

function TopBar({ route, progress, navigate, notify, resetProgress }) {
  const { t } = useI18n();
  const isMission = route.startsWith("/mission/") || route === "/final-challenge";
  const currentMission = missionData.find((m) => route.includes("/mission/" + m.id));
  return <header className="topbar">
    {isMission ? <button className="back" onClick={() => navigate("/missions")}>{t("common.topbar.backToMissions")}</button> : <span />}
    <div className="topbar-title">{isMission ? (route === "/final-challenge" ? t("missions.finalTitle") : t("missions.missionOf", { mission: currentMission?.id || "" })) : ""}</div>
    <div className="overall-progress">{isMission && missionData.map((m) => <span key={m.id} className={progress.missions[m.id].completed || currentMission?.id >= m.id ? "filled" : ""} />)}</div>
    <div className="top-actions"><LanguageSelector compact /><button className="icon-button" aria-label={t("common.topbar.settings")} onClick={() => notify(t("common.topbar.settings"))}><Icon name="gear" /></button><button className="avatar-button" aria-label="Profile" onClick={() => navigate("/profile")}>👤</button></div>
  </header>;
}

function Dashboard({ progress, navigate, notify }) {
  const { t } = useI18n();
  const completed = completedCount(progress);
  const current = missionData.find((m) => !progress.missions[m.id].completed) || missionData[missionData.length - 1];
  const currentMissionCopy = translateMission(current, t);
  const currentProgress = progress.missions[current.id]?.progress || 0;
  const notesCount = readLearningNotes().length;
  const missionsLeft = Math.max(0, missionData.length - completed);
  return <main className="dashboard-layout">
    <section className="main-column">
      <section className="welcome">
        <div><h1>{t("common.home.welcomeTitle")}</h1><p>{t("common.home.welcomeLead")}</p><p>{t("common.home.welcomeCopy")}</p></div>
        <div className="welcome-art"><MountainIllustration /><RobotAvatar pose="hero" /></div>
      </section>
      <section className="card continue-learning-card">
        <h2><StickerIcon name="book" tone="purple" className="tiny" />{t("common.home.continueLearning")}</h2>
        <div className="continue-inner">
          <div>
            <h3>{t("missions.missionLabel", { id: current.id })}: {currentMissionCopy.title}</h3>
            <p>{currentMissionCopy.desc}</p>
            <div className="bar-row"><span className="bar"><span style={{ width: currentProgress + "%" }} /></span><strong>{t("common.status.percentComplete", { percent: currentProgress })}</strong></div>
            <button className="primary" onClick={() => navigate(current.route)}>{t("common.home.continueMission")}</button>
          </div>
          <div className="orb"><RobotAvatar pose="idea" /></div>
        </div>
      </section>
      <LearningPath progress={progress} navigate={navigate} notify={notify} />
      <section className="card why-home-card">
        <h2>{t("common.home.whyTitle")}</h2>
        <div className="why-grid"><Why icon="shield" title={t("common.why.responsibleTitle")} text={t("common.why.responsibleText")} /><Why icon="search" title={t("common.why.criticalTitle")} text={t("common.why.criticalText")} /><Why icon="scale" title={t("common.why.biasTitle")} text={t("common.why.biasText")} /><Why icon="rocket" title={t("common.why.futureTitle")} text={t("common.why.futureText")} /></div>
      </section>
      <button className="card final-card" onClick={() => navigate("/final-challenge")}>
        <MountainIllustration />
        <span><strong>{t("common.home.finalTitle")}</strong><small>{t("common.home.finalCopy")}</small></span>
        <span className="primary">{t("common.home.seeFinalChallenge")}</span>
      </button>
    </section>
    <aside className="right-column">
      <section className="card goal-card"><h2><StickerIcon name="target" tone="purple" className="tiny" />{t("common.stats.todaysGoal")}</h2><div className="goal-box"><b>{t("common.stats.completeOneStep")}</b><span className="goal-progress"><span style={{ width: completed ? "100%" : "25%" }} /></span><span className="goal-check"><Icon name="check" /></span></div><p>{completed ? t("common.stats.alreadyProgress") : t("common.stats.startSmallActivity")}</p><PlantIllustration /></section>
      <section className="card stats-card"><h2><StickerIcon name="chart" tone="purple" className="tiny" />{t("common.stats.yourStats")}</h2><div className="stats-grid"><span><strong>{completed}</strong><small>{t("common.stats.missionCompleted")}</small></span><span><strong>{missionsLeft}</strong><small>{t("common.stats.missionsLeft")}</small></span><span><strong>{notesCount}</strong><small>{t("common.stats.savedNotes")}</small></span></div><button className="outline" onClick={() => navigate("/progress")}>{t("common.stats.viewProgress")}</button></section>
      <Activity progress={progress} />
      <section className="card help-card"><span className="help-bubble">...</span><div><h2>{t("common.help.needHelp")}</h2><p>{t("common.help.text")}</p><button className="light" onClick={() => navigate("/missions")}>{t("common.help.goToMissions")}</button></div></section>
    </aside>
  </main>;
}

function Why({ icon, title, text, tone = "purple" }) {
  return <button className="why-item"><StickerIcon name={icon} tone={tone} /><strong>{title}</strong><small>{text}</small></button>;
}

function isUnlocked(progress, id) {
  return id === 1 || progress.missions[id - 1]?.completed;
}

function PathStatus({ type, children }) {
  return <span className={`path-status ${type}`}>{children}</span>;
}

function LearningPath({ progress, navigate, notify, compact = false }) {
  const { t } = useI18n();
  const completed = completedCount(progress);
  return (
    <section className={`card learning-card ${compact ? "compact" : ""}`}>
      <h2><StickerIcon name="book" tone="purple" className="tiny" />{t("common.home.learningPath")}</h2>
      <div className="path-track">
        {missionData.map((baseMission) => {
          const m = translateMission(baseMission, t);
          const done = progress.missions[m.id].completed;
          const unlocked = isUnlocked(progress, m.id);
          const current = unlocked && !done;
          return <button key={m.id} className={`path-step ${done ? "done" : ""} ${current ? "current" : ""}`} onClick={() => unlocked ? navigate(m.route) : notify(t("missions.completePrevious", { mission: m.id - 1 }))}>
            <span className="path-node"><StickerIcon name={done ? "wand" : current ? m.icon : "lock"} tone={done ? "green" : current ? "blue" : "gray"} className="path-sticker" /></span>
            <strong>{m.id}</strong><small>{m.short}</small><PathStatus type={done ? "done" : current ? "current" : "locked"}>{done ? t("common.status.completed") : current ? t("common.status.inProgress") : t("common.status.locked")}</PathStatus>
          </button>;
        })}
        <button className="path-step" onClick={() => completed === 6 ? navigate("/final-challenge") : notify(t("missions.completeAllFirst"))}><span className="path-node final-node"><StickerIcon name="trophy" tone="gray" className="path-sticker" /></span><strong>{t("missions.finalChallenge")}</strong><small>{t("missions.finalShort")}</small><PathStatus type={completed === 6 ? "current" : "locked"}>{completed === 6 ? t("common.status.ready") : t("common.status.locked")}</PathStatus></button>
      </div>
    </section>
  );
}

function Activity({ progress }) {
  const { t } = useI18n();
  const items = [];
  missionData.forEach((m) => {
    const translated = translateMission(m, t);
    const state = progress.missions[m.id];
    if (state.completed) items.push(["check", t("common.activity.completedMission", { id: m.id }), translated.short, t("common.status.completed"), t("common.activity.today")]);
    else if (state.progress > 0) items.push(["wand", t("common.activity.startedMission", { id: m.id }), translated.short, t("common.status.inProgress"), t("common.activity.today")]);
  });
  if (!items.length) items.push(["wand", t("common.activity.readyMission"), translateMission(missionData[0], t).short, t("common.status.start"), t("common.activity.today")]);
  return <div className="card activity-card"><div className="activity-card-head"><h3><Icon name="clock" /> {t("common.activity.recent")}</h3><button className="activity-view-all" type="button">{t("common.activity.viewAll")}</button></div>{items.slice(0, 3).map((item, i) => <div className="activity-item" key={i}><Icon name={item[0]} /><span><b>{item[1]}</b><small>{item[2]}</small></span><em>{item[3]}<small>{item[4]}</small></em></div>)}</div>;
}

function ProgressPage({ progress, navigate, notify }) {
  const completed = completedCount(progress);
  const inProgress = missionData.filter((m) => !progress.missions[m.id].completed && progress.missions[m.id].progress > 0).length;
  const notes = readLearningNotes();
  const overall = Math.round((completed / missionData.length) * 100);
  const stats = [["check", completed, "Missions completed", "Finished learning paths"], ["rocket", inProgress, "In progress", "Started but not finished"], ["book", notes.length, "Saved notes", "Reflection answers"], ["target", overall + "%", "Overall progress", "Across all missions"]];
  return <main className="progress-page page-shell"><section className="progress-hero card"><div><p className="eyebrow">Learning Progress</p><h1>Track your AI Explorer journey</h1><p>See which missions are finished, which ones are still open, and where your saved reflections live.</p></div><div className="progress-ring" style={{ "--value": (overall * 3.6) + "deg" }}><span>{overall}%</span></div></section><section className="progress-stats">{stats.map(([icon, value, label, copy]) => <div className="card" key={label}><Icon name={icon} /><strong>{value}</strong><span>{label}</span><p>{copy}</p></div>)}</section><section className="progress-main card"><div className="section-heading"><div><p className="eyebrow">Mission status</p><h2>Learning path</h2></div><button onClick={() => navigate("/missions")}>Open Missions</button></div><div className="mission-progress-list">{missionData.map((mission) => <ProgressMissionRow key={mission.id} mission={mission} progress={progress} navigate={navigate} notify={notify} />)}</div></section><aside className="progress-aside"><ProgressActivity progress={progress} navigate={navigate} notify={notify} /><div className="card progress-notes-card"><h3>Learning notes</h3><p>Your reflection answers are saved here so they can be reviewed later.</p><button onClick={() => { localStorage.setItem("aiExplorerActivityTab", "Notes"); navigate("/activity"); }}>Open Notes</button></div></aside></main>;
}

function ProgressMissionRow({ mission, progress, navigate, notify }) {
  const state = progress.missions[mission.id];
  const label = state.completed ? "Completed" : state.progress > 0 ? "In progress" : "Not started";
  const statusClass = state.completed ? "complete" : state.progress > 0 ? "active" : "locked";
  return <article className="progress-mission-row"><div className="mission-row-icon"><Icon name={mission.icon} /></div><div className="mission-row-copy"><span>Mission {mission.id}</span><h3>{translateMission(mission, "title")}</h3><p>{translateMission(mission, "desc")}</p><div className="progress-line"><span style={{ width: (state.completed ? 100 : state.progress) + "%" }} /></div></div><div className="mission-row-actions"><span className={"mission-status " + statusClass}>{label}</span><button onClick={() => navigate(mission.route)}>{state.completed ? "Review" : "Continue"}</button></div></article>;
}

function ProgressActivity({ progress, navigate, notify }) {
  const activities = [];
  missionData.forEach((mission) => {
    const state = progress.missions[mission.id];
    if (state.completed) activities.unshift(["check", "Mission " + mission.id + " completed", translateMission(mission, "short"), "Done", mission.route, "Today"]);
    else if (state.progress > 0) activities.unshift(["wand", "Mission " + mission.id + " started", translateMission(mission, "short"), "In progress", mission.route, "Today"]);
  });
  if (!activities.length) activities.push(["wand", "Ready to start", "Begin Mission 1 to build your first concept.", "Start", "/mission/1-tokenisation", "Today"]);
  return <div className="card progress-activity"><div className="section-heading"><div><p className="eyebrow">Activity</p><h2>Recent learning</h2></div><button onClick={() => navigate("/activity")}>View all</button></div>{activities.slice(0, 5).map((item, index) => <button key={index} onClick={() => navigate(item[4])}><Icon name={item[0]} /><span><b>{item[1]}</b><small>{item[2]}</small></span><em>{item[3]}<small>{item[5]}</small></em></button>)}</div>;
}

function activityRecords(progress) {
  const missionRecords = missionData.flatMap((mission) => {
    const state = progress.missions[mission.id];
    if (state.completed) return [{ type: "Missions", title: "Completed Mission " + mission.id, detail: translateMission(mission, "title"), route: mission.route, time: "Today" }];
    if (state.progress > 0) return [{ type: "Missions", title: "Worked on Mission " + mission.id, detail: translateMission(mission, "title"), route: mission.route, time: "Today" }];
    return [];
  });
  const noteRecords = readLearningNotes().map((note) => ({ type: "Notes", title: note.title || "Saved reflection", detail: note.text || note.answer || "Reflection saved", route: "/activity", time: note.savedAt ? new Date(note.savedAt).toLocaleDateString() : "Saved" }));
  const fallback = [{ type: "System", title: "Learning path ready", detail: "Start Mission 1 when you are ready.", route: "/mission/1-tokenisation", time: "Today" }];
  return [...missionRecords, ...noteRecords, ...(missionRecords.length || noteRecords.length ? [] : fallback)].map((item, index) => ({ id: index + 1, ...item }));
}

function ActivityPage({ progress, navigate, notify }) {
  const [tab, setTab] = useState(() => localStorage.getItem("aiExplorerActivityTab") || "All");
  const records = useMemo(() => activityRecords(progress), [progress]);
  const tabs = ["All", "Missions", "Notes", "System"];
  const filtered = records.filter((item) => tab === "All" || item.type === tab);
  const notes = readLearningNotes();
  return <main className="activity-page page-shell"><section className="activity-hero card"><div><p className="eyebrow">Learning Activity</p><h1>Your recent work</h1><p>Review mission progress and saved reflections. This page is a simple learner record, not an assessment dashboard.</p></div><RobotAvatar pose="pointing" /></section><section className="activity-controls card"><div className="tabs-row">{tabs.map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => { setTab(item); localStorage.setItem("aiExplorerActivityTab", item); }}>{item}</button>)}</div><button onClick={() => notify("Activity records are saved on this device for the prototype.")}>How records work</button></section><section className="activity-table card"><div className="section-heading"><div><p className="eyebrow">Records</p><h2>{filtered.length} item{filtered.length === 1 ? "" : "s"}</h2></div><button onClick={() => navigate("/progress")}>View Progress</button></div><div className="activity-table-head"><span>Activity</span><span>Details</span><span>Time</span></div>{filtered.map((item) => <button className="activity-row" key={item.id} onClick={() => navigate(item.route)}><span><b>{item.title}</b><small>{item.type}</small></span><span>{item.detail}</span><span>{item.time}</span></button>)}</section><aside className="activity-aside"><div className="card"><h3>Saved notes</h3><p>{notes.length ? "Reflection prompts saved during missions appear here." : "No notes saved yet. Reflection prompts in missions will be saved here."}</p><button onClick={() => setTab("Notes")}>Show Notes</button></div><ActivityAside progress={progress} /></aside></main>;
}

function ActivityAside({ progress }) {
  const completed = completedCount(progress);
  const next = missionData.find((mission) => !progress.missions[mission.id].completed);
  return <div className="card activity-summary-card"><h3>Learning summary</h3><p>{completed} of {missionData.length} missions completed.</p>{next ? <p>Next up: Mission {next.id}, {translateMission(next, "short")}.</p> : <p>All missions are complete. The Final Challenge is ready.</p>}</div>;
}

function BiasDataCard({ title, male, female, active, onClick }) {
  return <button className={`bias-data-card ${active ? "active" : ""}`} onClick={onClick}><strong>{title}</strong><div><PersonBadge gender="male" percent={male} /><PersonBadge gender="female" percent={female} /></div></button>;
}

function MissionLayout({ mission, title, subtitle, robot = "pointing", progress, notify, children, headingPrefix, eyebrow, bubbleText }) {
  const { t } = useI18n();
  const missionInfo = missionData[mission - 1];
  return <main className={"mission-page mission-" + mission}><section className="mission-hero"><div><span className="pill">{eyebrow || "AI Explorer"}</span><h1>{headingPrefix || (mission + ".")} {title}</h1><p>{subtitle}</p></div><div className="hero-robot"><RobotAvatar pose={robot} />{bubbleText && <div className="speech-bubble">{bubbleText}</div>}</div></section><section className="mission-content-grid"><div className="mission-main">{children}</div><aside className="mission-side"><div className="info-card"><h3>{missionInfo?.skill || "Key idea"}</h3><p>{missionInfo?.desc}</p></div><div className="think-card"><Icon name="light" /><h3>Think about it</h3><p>What would you explain to a friend after this mission?</p></div></aside></section><div className="mission-footer"><button onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: mission > 1 ? missionData[mission - 2].route : "/missions" }))}>‹ Previous</button><span>{missionInfo?.skill}</span><button onClick={() => notify(t("common.missions.completeCurrent"))}>Continue →</button></div></main>;
}

function LegacyFinalChallenge({ progress, setProgress, navigate, notify }) {
  const { t } = useI18n();
  const rooms = [
    { id: "token", title: "Tokeniser", subtitle: "The Token Door", crystal: "#9b6cff", power: "Tokenisation", icon: "Aa", memory: "The door now understands that text is split into tokens." },
    { id: "prediction", title: "Predictor", subtitle: "Next-Word Machine", crystal: "#ffbf3d", power: "Prediction", icon: "⚡", memory: "The machine can choose the next token from context." },
    { id: "mistake", title: "Mistake Detector", subtitle: "False-Clue Hall", crystal: "#ff5a70", power: "Mistake Detector", icon: "!", memory: "The robot remembers that AI can sound confident and still be wrong." },
    { id: "context", title: "Context Finder", subtitle: "The Blurry Telescope", crystal: "#38c47f", power: "Context", icon: "◈", memory: "More useful context makes the answer clearer." },
    { id: "training", title: "Trainer", subtitle: "Pattern Engine", crystal: "#3a8bff", power: "Training Data", icon: "▣", memory: "The engine learns patterns from examples, not magic answers." },
    { id: "bias", title: "Bias Checker", subtitle: "Fairness Scale", crystal: "#a855f7", power: "Fair AI", icon: "⚖", memory: "Balanced data can help reduce biased predictions." }
  ];
  const [started, setStarted] = useState(false);
  const [roomIndex, setRoomIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [crystals, setCrystals] = useState({});
  const [roomState, setRoomState] = useState({ tokenSplit: false, tokenCount: "", gear: "", reliable: "", contextChips: [], trainingData: [], biasCount: 9, inspected: {}, mistakeSorted: {}, predictionTemp: 55 });
  const current = rooms[Math.min(roomIndex, rooms.length - 1)];
  const completed = rooms.filter((room) => crystals[room.id]).length;
  const allDone = completed === rooms.length;
  const showEscape = started && allDone && roomIndex >= rooms.length;

  function patchRoomState(patch) {
    setRoomState((state) => ({ ...state, ...patch }));
  }
  function markInspected(id) {
    patchRoomState({ inspected: { ...roomState.inspected, [id]: true } });
    setStep(1);
  }
  function unlockRoom(message) {
    setCrystals((state) => ({ ...state, [current.id]: true }));
    setStep(2);
    notify(message || current.power + " crystal unlocked.");
  }
  function enterNextRoom() {
    if (roomIndex === rooms.length - 1) {
      setRoomIndex(rooms.length);
      setStep(0);
      return;
    }
    setRoomIndex((index) => index + 1);
    setStep(0);
  }
  function finishChallenge() {
    if (!allDone) {
      notify("Collect all six crystals first.");
      return;
    }
    setProgress((prev) => {
      const next = structuredClone(prev);
      next.finalChallengeCompleted = true;
      writeProgress(next);
      return next;
    });
    notify("Escape complete. Progress saved.");
    navigate("/progress");
  }
  function chooseTokenCount(count) {
    patchRoomState({ tokenCount: count });
    if (count === "5") unlockRoom("Token crystal unlocked. The door can read the sentence now.");
    else notify("Not quite. Count each piece after splitting the sentence.");
  }
  function chooseGear(gear) {
    patchRoomState({ gear });
    if (gear === "umbrella") unlockRoom("Prediction crystal unlocked. That word fits the rainy context.");
    else notify("Try another gear. Which word usually comes after rainy weather?");
  }
  function chooseReliable(clue) {
    patchRoomState({ reliable: clue });
    if (clue === "Water freezes at 0°C.") unlockRoom("Mistake crystal unlocked. You found the reliable clue.");
    else notify("That clue sounds suspicious. Look for the one fact we can verify.");
  }
  function toggleContextChip(chip) {
    const exists = roomState.contextChips.includes(chip);
    const contextChips = exists ? roomState.contextChips.filter((item) => item !== chip) : [...roomState.contextChips, chip];
    patchRoomState({ contextChips });
    if (contextChips.length >= 3 && !crystals.context) window.setTimeout(() => unlockRoom("Context crystal unlocked. The answer is clear enough now."), 260);
  }
  function toggleTrainingData(item) {
    const exists = roomState.trainingData.includes(item);
    const trainingData = exists ? roomState.trainingData.filter((entry) => entry !== item) : [...roomState.trainingData, item];
    patchRoomState({ trainingData });
    if (trainingData.length >= 3 && !crystals.training) window.setTimeout(() => unlockRoom("Training crystal unlocked. The engine found repeated examples."), 260);
  }
  function changeBias(value) {
    const biasCount = Number(value);
    patchRoomState({ biasCount });
    if (biasCount === 5 && !crystals.bias) window.setTimeout(() => unlockRoom("Bias crystal unlocked. The scale is balanced."), 300);
  }
  function resetCurrentRoom() {
    if (current.id === "token") patchRoomState({ tokenSplit: false, tokenCount: "" });
    if (current.id === "prediction") patchRoomState({ gear: "", predictionTemp: 55 });
    if (current.id === "mistake") patchRoomState({ reliable: "" });
    if (current.id === "context") patchRoomState({ contextChips: [] });
    if (current.id === "training") patchRoomState({ trainingData: [] });
    if (current.id === "bias") patchRoomState({ biasCount: 9 });
    setCrystals((state) => {
      const next = { ...state };
      delete next[current.id];
      return next;
    });
    setStep(0);
  }

  function renderRoomScene() {
    if (current.id === "token") return <div className="escape-puzzle token-puzzle">
      {step === 0 && <><div className="escape-door token-door"><span>□□□□□</span><b>Locked</b></div><div className="room-sentence">I love chocolate ice cream</div><p>The first crystal is trapped in a door that cannot read a full sentence.</p><button className="primary" onClick={() => markInspected("token")}>Inspect Door</button></>}
      {step === 1 && <><div className="room-sentence split-source">I love chocolate ice cream</div><button className="outline split-button" onClick={() => patchRoomState({ tokenSplit: true })}>Split into tokens</button>{roomState.tokenSplit && <div className="flying-token-row">{["I", "love", "chocolate", "ice", "cream"].map((token) => <span key={token}>{token}</span>)}</div>}<p>How many tokens did the lock receive?</p><div className="escape-choice-row">{["4", "5", "6", "7"].map((count) => <button key={count} className={roomState.tokenCount === count ? "selected" : ""} onClick={() => chooseTokenCount(count)}>{count}</button>)}</div></>}
      {step === 2 && <CrystalReward room={current} text="The Token Door opens. The first crystal flies into the robot." onNext={enterNextRoom} final={false} />}
    </div>;
    if (current.id === "prediction") return <div className="escape-puzzle predictor-puzzle">
      {step === 0 && <><div className="prediction-machine"><span>The weather is very ____</span><i /></div><p>This machine predicts the next word. It needs the gear that best fits the context.</p><button className="primary" onClick={() => setStep(1)}>Power the Machine</button></>}
      {step === 1 && <><div className="prediction-machine active"><span>The weather is very ____</span><i style={{ "--spin": roomState.predictionTemp + "deg" }} /></div><label className="temperature-control">Prediction speed <input type="range" min="0" max="100" value={roomState.predictionTemp} onChange={(event) => patchRoomState({ predictionTemp: Number(event.target.value) })} /></label><div className="escape-choice-row gear-row">{["sunny", "banana", "car", "elephant", "umbrella"].map((gear) => <button key={gear} className={roomState.gear === gear ? "selected" : ""} onClick={() => chooseGear(gear)}>{gear}</button>)}</div></>}
      {step === 2 && <CrystalReward room={current} text="The prediction machine starts. The next-token crystal is restored." onNext={enterNextRoom} final={false} />}
    </div>;
    if (current.id === "mistake") return <div className="escape-puzzle mistake-puzzle">
      {step === 0 && <><div className="fake-paper-wall">{["Cats can fly.", "The Moon is made of cheese.", "Water freezes at 0°C.", "Trees eat pizza."].map((paper) => <span key={paper}>{paper}</span>)}</div><p>This room is full of fake clues. Only one paper is reliable.</p><button className="primary" onClick={() => setStep(1)}>Search the Papers</button></>}
      {step === 1 && <><p>Pick the reliable clue.</p><div className="paper-choice-grid">{["Cats can fly.", "The Moon is made of cheese.", "Water freezes at 0°C.", "Trees eat pizza."].map((clue) => <button key={clue} className={roomState.reliable === clue ? "selected" : ""} onClick={() => chooseReliable(clue)}>{clue}</button>)}</div></>}
      {step === 2 && <CrystalReward room={current} text="The fake papers fade away. The mistake detector crystal is yours." onNext={enterNextRoom} final={false} />}
    </div>;
    if (current.id === "context") {
      const clarity = Math.min(100, 25 + roomState.contextChips.length * 24);
      return <div className="escape-puzzle context-puzzle">
        {step === 0 && <><div className="blurry-answer">Maybe wear something nice?</div><p>The answer is blurry because the robot has almost no context.</p><button className="primary" onClick={() => setStep(1)}>Use the Context Telescope</button></>}
        {step === 1 && <><div className="focus-meter"><span style={{ width: clarity + "%" }} /> <b>{clarity}% clear</b></div><div className="blurry-answer" style={{ filter: "blur(" + Math.max(0, 5 - roomState.contextChips.length) + "px)" }}>{roomState.contextChips.length >= 3 ? "Wear a waterproof formal jacket and comfortable shoes for the Edinburgh wedding." : "Maybe wear a jacket."}</div><div className="context-chip-grid">{["Weather: rainy", "Location: Edinburgh", "Event: wedding", "Style: comfortable", "Time: morning"].map((chip) => <button key={chip} className={roomState.contextChips.includes(chip) ? "selected" : ""} onClick={() => toggleContextChip(chip)}>{chip}</button>)}</div></>}
        {step === 2 && <CrystalReward room={current} text="The telescope focuses. Context power has been restored." onNext={enterNextRoom} final={false} />}
      </div>;
    }
    if (current.id === "training") return <div className="escape-puzzle training-puzzle">
      {step === 0 && <><div className="training-engine"><span>Knowledge 0%</span><i /></div><p>The training engine is empty. Feed it different examples so it can find patterns.</p><button className="primary" onClick={() => setStep(1)}>Start Trainer</button></>}
      {step === 1 && <><div className="training-engine active"><span>Knowledge {Math.min(100, roomState.trainingData.length * 34)}%</span><i style={{ height: Math.min(100, roomState.trainingData.length * 34) + "%" }} /></div><div className="data-feed-grid">{["Science facts", "Story sentences", "Math examples", "Question-answer pairs"].map((item) => <button key={item} className={roomState.trainingData.includes(item) ? "selected" : ""} onClick={() => toggleTrainingData(item)}>{item}</button>)}</div></>}
      {step === 2 && <CrystalReward room={current} text="The engine learned from repeated examples. Training crystal restored." onNext={enterNextRoom} final={false} />}
    </div>;
    const female = 10 - roomState.biasCount;
    return <div className="escape-puzzle bias-puzzle">
      {step === 0 && <><div className="bias-scale-scene"><div className="scale-pan heavy">9</div><div className="scale-bar tilted" /><div className="scale-pan light">1</div></div><p>The fairness scale is tilted because the AI saw mostly one kind of person.</p><button className="primary" onClick={() => setStep(1)}>Balance the Scale</button></>}
      {step === 1 && <><div className="bias-scale-scene"><div className="scale-pan">{roomState.biasCount}</div><div className={roomState.biasCount === 5 ? "scale-bar balanced" : "scale-bar tilted"} /><div className="scale-pan">{female}</div></div><label className="temperature-control">Male examples: {roomState.biasCount} · Female examples: {female}<input type="range" min="0" max="10" step="1" value={roomState.biasCount} onChange={(event) => changeBias(event.target.value)} /></label><p>Move the data toward 5 and 5.</p></>}
      {step === 2 && <CrystalReward room={current} text="The scale balances. The fair-AI crystal is restored." onNext={enterNextRoom} final={true} />}
    </div>;
  }

  return <div className="final-challenge-page final-escape-page">
    <header className="mission-header final-header"><button className="outline" onClick={() => navigate("/missions")}>{t("common.topbar.backToMissions")}</button><div className="mission-mid"><strong>{t("escapeRoom.pageTitle")}</strong><span className="mission-dots">{rooms.map((room) => <i key={room.id} className={crystals[room.id] ? "filled" : ""} />)}</span></div><div className="mission-header-actions"><LanguageSelector compact /><button className="icon-button" aria-label={t("common.topbar.settings")} onClick={() => notify(t("escapeRoom.tips"))}><Icon name="gear" /></button></div></header>
    <main className="final-escape-shell">
      {!started ? <section className="escape-map-board">
        <div className="escape-map-hero"><span className="mission-eyebrow">Final Boss</span><h1>AI Literacy Escape Room</h1><p>Six locked rooms. Six AI powers. Help the robot collect every crystal and open the exit.</p><button className="primary" onClick={() => setStarted(true)}>Enter Room 1 →</button></div>
        <div className="escape-map-grid"><article className="map-room-card large" style={{ "--room": rooms[0].crystal }}><span>ROOM 1</span><h2>Tokeniser</h2><p>Break the sentence into tokens to open the first door.</p><div className="map-door"><b>□□□□□</b></div><div className="map-token-strip"><i>I</i><i>love</i><i>chocolate</i><i>ice</i><i>cream</i></div></article>{rooms.slice(1).map((room, index) => <article key={room.id} className={"map-room-card small room-preview-" + room.id} style={{ "--room": room.crystal }}><span>ROOM {index + 2}</span><h3>{room.title}</h3><p>{room.subtitle}</p><strong>{room.icon}</strong></article>)}</div>
        <div className="escape-map-path">{rooms.map((room, index) => <span key={room.id} style={{ "--room": room.crystal }}><b>{index + 1}</b>{index < rooms.length - 1 && <i />}</span>)}<em>EXIT</em></div>
        <div className="escape-map-reward"><div>{rooms.map((room) => <span key={room.id} style={{ "--crystal": room.crystal }}>◆</span>)}</div><p>Collect all 6 crystals to restore the AI brain.</p><Mascot type="idea" /></div>
      </section> : showEscape ? <section className="escape-complete-card"><Mascot type="idea" /><div><span className="mission-eyebrow">Escape Complete</span><h1>The AI Brain has been restored.</h1><p>You escaped by using tokens, prediction, hallucination checking, context, training data, and bias fixing.</p><div className="final-score"><strong>6 / 6 Crystals</strong><span>AI Explorer complete</span></div><div className="final-result-actions"><button className="primary" onClick={finishChallenge}>View My Results →</button><button className="outline" onClick={() => navigate("/dashboard")}>Back Home</button></div></div></section> : <section className="escape-room-stage">
        <article className={"escape-room-card room-" + current.id + (crystals[current.id] ? " solved" : "")} style={{ "--room": current.crystal }}>
          <span className="room-torch left" /><span className="room-torch right" /><span className="room-crystal-badge">◆</span><span className="room-floor-glow" />
          <div className="room-top"><div><span>ROOM {roomIndex + 1}</span><h1>{current.title}</h1><p>{current.subtitle}</p></div><div className="room-step-dots">{[0, 1, 2].map((item) => <i key={item} className={item <= step ? "active" : ""} />)}</div><button className="outline small" onClick={resetCurrentRoom}>Reset Room</button></div>
          <div className="room-play-area"><div className="room-mascot"><Mascot type={current.id === "mistake" ? "detective" : current.id === "training" ? "reading" : "idea"} /><span className="speech-bubble">{step === 0 ? "Observe the room first." : step === 1 ? "Use what you learned." : "Crystal restored!"}</span></div>{renderRoomScene()}</div>
        </article>
        <aside className="escape-side-panel"><section className="card final-progress-card"><h2>Crystals</h2><div className="progress-ring" style={{ "--angle": (completed / rooms.length * 360) + "deg" }}><strong>{completed} / 6</strong><small>Collected</small></div></section><section className="card escape-timeline"><h2>Rooms</h2>{rooms.map((room, index) => <button key={room.id} className={(crystals[room.id] ? "done " : "") + (index === roomIndex ? "active" : "")} onClick={() => { if (index <= completed) { setRoomIndex(index); setStep(crystals[room.id] ? 2 : 0); } }}><span style={{ "--crystal": room.crystal }}>{crystals[room.id] ? "◆" : index + 1}</span><strong>{room.power}</strong></button>)}</section></aside>
      </section>}
    </main>
  </div>;
}

function CrystalReward({ room, text, onNext, final }) {
  return <div className="crystal-reward"><div className="big-crystal" style={{ "--crystal": room.crystal }}>◆</div><h2>{room.power} Crystal</h2><p>{text}</p><div className="memory-restored"><Icon name="check" /><span>{room.memory}</span></div><button className="primary" onClick={onNext}>{final ? "Open the Exit →" : "Enter Next Room →"}</button></div>;
}

function Shell({ route, progress, navigate, notify, resetProgress, children }) {
  return <div className="app-shell">
    <Sidebar route={route} progress={progress} navigate={navigate} />
    <div className="main-shell">
      <TopBar route={route} progress={progress} navigate={navigate} notify={notify} resetProgress={resetProgress} />
      {children}
    </div>
  </div>;
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
  else if (route === "/final-challenge") page = <FinalChallenge progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else page = <PlaceholderPage route={route} />;
  return <Shell route={route} progress={progress} navigate={navigate} notify={notify} resetProgress={resetProgress}>{page}{toast && <div className="toast show">{toast}</div>}</Shell>;
}

createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
