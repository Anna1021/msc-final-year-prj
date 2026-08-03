import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, ArrowRight, BadgeCheck, BookOpen, BrainCircuit, Braces, CheckCircle2, ChevronRight, CircleGauge, Clock3, Database, ExternalLink, FlaskConical, Globe2, Layers3, Lightbulb, LockKeyhole, NotebookPen, RefreshCcw, Scale, Search, ShieldAlert, ShieldCheck, Target, TrendingUp, Trophy, Users, Wrench } from "lucide-react";
import "./styles.css";
import FinalChallenge from "./finalChallenge/FinalChallenge.jsx";
import LanguageSelector from "./components/LanguageSelector.jsx";
import Mission1QuickCheckA from "./mission1/Mission1QuickCheckA.jsx";
import Mission1QuickCheckB from "./mission1/Mission1QuickCheckB.jsx";
import QwenTokenizerPlayground from "./mission1/QwenTokenizerPlayground.jsx";
import TokenPieces from "./mission1/TokenPieces.jsx";
import PlayfulSceneBanner from "./playfulLearning/PlayfulSceneBanner.jsx";
import TokenBuildingBlock from "./playfulLearning/TokenBuildingBlock.jsx";
import RobotGuideBubble from "./playfulLearning/RobotGuideBubble.jsx";
import MiniSceneIllustration from "./playfulLearning/MiniSceneIllustration.jsx";
import "./playfulLearning/playfulLearning.css";
import { getMission1IntroFixture } from "./mission1/mission1Challenges.js";
import { completeMission1Progress, createMission1CoreProgress, isMission1CoreComplete } from "./mission1/mission1Progress.js";
import TokenLabPage from "./tokenLab/TokenLabPage.jsx";
import { LanguageProvider, translateMission, useI18n } from "./i18n/index.jsx";
import {
  detectiveCards,
  detectiveFalseFacts,
  detectiveTrueFacts,
  missionData,
  nextTokenQuestions as questions,
  shuffleList
} from "./data/courseData.js";
import {
  activityRecords,
  canAccessFinalChallenge,
  canAccessMission,
  completedCount,
  defaultProgress,
  isUnlocked,
  readLearningNotes,
  readProgress,
  saveLearningNote,
  writeProgress
} from "./state/progress.js";
import { routeGroup } from "./utils/routes.js";

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
  const nav = [
    ["dashboard", t("navigation.home"), "/dashboard", "home"],
    ["missions", t("navigation.missions"), "/missions", "target"],
    ["ai-lab", t("navigation.aiLab"), "/ai-lab", FlaskConical],
    ["progress", t("navigation.progress"), "/progress", "chart"]
  ];
  return (
    <aside className="sidebar">
      <button className="logo reset-buttonish" onClick={() => navigate("/dashboard")}>
        <RobotLogo />
        <span><strong>AI Explorer</strong><small>{t("common.app.tagline")}</small></span>
      </button>
      <nav className="side-nav">
        {nav.map(([key, label, href, icon]) => (
          <button key={key} className={routeGroup(route) === key ? "active" : ""} onClick={() => navigate(href)}>
            {typeof icon === "string" ? <Icon name={icon} /> : React.createElement(icon, { className: "icon", size: 21, strokeWidth: 1.8, "aria-hidden": true })}<span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <section className="learner-summary" aria-label="Learning progress">
          <BookOpen />
          <span><strong>Learning progress</strong><small>{completed} of {missionData.length} missions complete</small></span>
          <span className="learner-summary-bar"><span style={{ width: `${(completed / missionData.length) * 100}%` }} /></span>
        </section>
      </div>
    </aside>
  );
}

function TopBar({ route, navigate, resetProgress, qaToolsVisible, qaMode, setQaMode }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const isProgressLike = route === "/progress" || route === "/activity";
  return (
    <header className={`topbar ${isProgressLike ? "progress-topbar" : ""}`}>
      {route === "/progress" ? <><button className="outline" onClick={() => navigate("/missions")}>‹ {t("common.topbar.backToMissions")}</button><strong className="topbar-title">Your Progress</strong></> : route === "/activity" ? <><button className="outline" onClick={() => navigate("/progress")}>‹ Back to Progress</button><strong className="topbar-title">All Activity</strong></> : <div />}
      <div className="top-actions">
        {qaToolsVisible && qaMode && <span className="qa-active-chip" title="QA Mode is active — access restrictions are temporarily disabled.">QA Mode active</span>}
        <LanguageSelector compact />
        <button className="avatar-button" aria-label="Open learner menu" onClick={() => setOpen(!open)}><Avatar small /><span>⌄</span></button>
        {open && <div className="profile-menu">
          {qaToolsVisible && <div className="qa-menu-control"><span><strong>QA Mode</strong><small>Unlock all routes</small></span><button type="button" role="switch" aria-checked={qaMode} className={`qa-toggle ${qaMode ? "on" : ""}`} onClick={() => setQaMode(!qaMode)}><span />{qaMode ? "On" : "Off"}</button></div>}
          <button onClick={resetProgress}>Reset Progress</button>
        </div>}
      </div>
    </header>
  );
}

function Dashboard({ progress, navigate, notify, qaMode }) {
  const { t } = useI18n();
  const completed = completedCount(progress);
  const allComplete = completed === missionData.length;
  const current = missionData.find((mission) => isUnlocked(progress, mission.id) && !progress.missions[mission.id]?.completed) || missionData[missionData.length - 1];
  const currentMissionCopy = translateMission(current, t);
  const notes = readLearningNotes();
  const overall = Math.round((completed / missionData.length) * 100);
  return <div className="dashboard-layout">
    <header className="dashboard-hero">
      <div className="dashboard-hero-copy">
        <h1>{t("common.home.welcomeTitle")}</h1>
        <p>{allComplete ? t("common.home.completeStatus") : `${t("common.profile.missionsComplete", { completed, total: missionData.length })} ${t("common.home.nextMission", { title: currentMissionCopy.title })}`}</p>
        <button className="primary" onClick={() => navigate(allComplete ? "/final-challenge" : current.route)}>
          {allComplete ? t("common.home.startFinalChallenge") : t("common.home.continueLearning")}<ArrowRight />
        </button>
      </div>
      <div className="welcome-art"><MountainIllustration /><Mascot /></div>
    </header>
    <LearningPath progress={progress} navigate={navigate} notify={notify} qaMode={qaMode} overall={overall} />
    <section className="dashboard-secondary" aria-label="Recent learning">
      <Activity progress={progress} navigate={navigate} />
      <DashboardNotes notes={notes} navigate={navigate} />
    </section>
  </div>;
}

function ProgressPill({ children, type = "locked" }) {
  return <span className={`state-pill ${type}`}>{children}</span>;
}

function LearningPath({ progress, navigate, notify, compact = false, qaMode = false, overall = 0 }) {
  const { t } = useI18n();
  const completed = completedCount(progress);
  return (
    <section className={`card learning-card dashboard-progress-card ${compact ? "compact" : ""}`}>
      <div className="dashboard-progress-head">
        <div><h2><BookOpen />{t("common.home.learningPath")}</h2><p>{t("common.profile.missionsComplete", { completed, total: missionData.length })}</p></div>
        <strong>{overall}%</strong>
      </div>
      <div className="path-track">
        {missionData.map((baseMission) => {
          const m = translateMission(baseMission, t);
          const done = progress.missions[m.id].completed;
          const unlocked = canAccessMission(progress, m.id, qaMode);
          const current = unlocked && !done;
          const MissionIcon = progressMissionIcons[m.id] || BookOpen;
          return <button key={m.id} className={`path-step mission-tone-${m.id} ${done ? "done" : ""} ${current ? "current" : ""}`} onClick={() => unlocked ? navigate(m.route) : notify(t("missions.completePrevious", { mission: m.id - 1 }))}>
            <span className="path-node">{unlocked ? <MissionIcon /> : <LockKeyhole />}{done && <CheckCircle2 className="path-complete-mark" />}</span>
            <strong>{m.id}</strong><small>{m.short}</small><ProgressPill type={done ? "done" : current ? "current" : "locked"}>{done ? t("common.status.completed") : current ? t("common.status.inProgress") : t("common.status.locked")}</ProgressPill>
          </button>;
        })}
        <button className="path-step final-path-step" onClick={() => canAccessFinalChallenge(progress, qaMode) ? navigate("/final-challenge") : notify(t("missions.completeAllFirst"))}><span className="path-node final-node">{canAccessFinalChallenge(progress, qaMode) ? <Trophy /> : <LockKeyhole />}</span><strong>{t("missions.finalChallenge")}</strong><small>{t("missions.finalShort")}</small><ProgressPill type={canAccessFinalChallenge(progress, qaMode) ? "current" : "locked"}>{canAccessFinalChallenge(progress, qaMode) ? t("common.status.ready") : t("common.status.locked")}</ProgressPill></button>
      </div>
    </section>
  );
}

function Activity({ progress, navigate }) {
  const { t } = useI18n();
  const items = activityRecords(progress).slice(0, 3);
  return <section className="card activity-card dashboard-secondary-card"><div className="activity-card-head"><h3><Clock3 />{t("common.activity.recent")}</h3><button className="activity-view-all" type="button" onClick={() => navigate("/activity")}>{t("common.activity.viewAll")}</button></div>{items.map((item) => {
    const missionId = missionIdFromRoute(item.route);
    const tone = missionId ? `mission-tone-${missionId}` : item.type === "Notes" ? "note-tone" : "neutral-tone";
    const ActivityIcon = missionId ? progressMissionIcons[missionId] || BookOpen : item.type === "Notes" ? NotebookPen : BookOpen;
    return <button className="activity-item" key={item.id} onClick={() => navigate(item.route)}><span className={`dashboard-icon-box ${tone}`}><ActivityIcon /></span><span><b>{item.title}</b><small>{item.detail}</small></span><em>{item.type}<small>{item.time}</small></em></button>;
  })}</section>;
}

function DashboardNotes({ notes, navigate }) {
  function openNotes() {
    localStorage.setItem("aiExplorerActivityTab", "Notes");
    navigate("/activity");
  }
  return <section className="card dashboard-notes-card dashboard-secondary-card"><div className="activity-card-head"><h3><NotebookPen />Saved Notes</h3><button className="activity-view-all" type="button" onClick={openNotes}>View all</button></div><p>{notes.length ? `${notes.length} reflection${notes.length === 1 ? "" : "s"} saved from mission activities.` : "Your saved mission reflections will appear here."}</p>{notes[0] && <button className="dashboard-note-preview" onClick={openNotes}><strong>{notes[0].mission} · {notes[0].title}</strong><small>{notes[0].note}</small></button>}</section>;
}

const missionJourneyColors = ["violet", "blue", "orange", "pink", "green", "yellow"];

function MissionJourneyCard({ mission, progress, navigate, notify, qaMode = false }) {
  const state = progress.missions[mission.id] || { progress: 0, completed: false };
  const percent = state.completed ? 100 : Math.round(state.progress || 0);
  const unlocked = canAccessMission(progress, mission.id, qaMode);
  const active = unlocked && !state.completed;
  const MissionIcon = progressMissionIcons[mission.id] || BookOpen;

  function openMission() {
    if (!unlocked) {
      notify(`Complete Mission ${mission.id - 1} to unlock this mission.`);
      return;
    }
    navigate(mission.route);
  }

  return (
    <button
      className={`mission-sequence-card mission-tone-${mission.id} ${state.completed ? "completed" : ""} ${active ? "active-mission" : ""} ${!unlocked ? "locked-mission" : ""}`}
      type="button"
      onClick={openMission}
      aria-disabled={!unlocked}
      aria-label={`${mission.title}: ${state.completed ? "Completed" : active ? percent > 0 ? `${percent}% complete` : "Ready to start" : "Locked"}`}
    >
      <span className={`mission-big-icon ${missionJourneyColors[mission.id - 1]}`}>
        <MissionIcon />
      </span>
      <span className="mission-sequence-copy"><strong>{mission.id}. {mission.title}</strong><small>{mission.desc}</small></span>
      <span className="mission-card-progress">
        {state.completed
          ? <span className="mission-status completed-status"><CheckCircle2 />Completed</span>
          : active && percent > 0
            ? <><span className="tiny-progress"><span style={{ width: `${percent}%` }} /></span><small>{percent}% complete</small></>
            : active
              ? <span className="mission-status ready-status">Ready to start</span>
              : <span className="mission-status locked-status"><LockKeyhole />Locked</span>}
      </span>
      <span className={`mission-enter ${unlocked ? "available" : ""}`}>{unlocked ? <ArrowRight /> : <LockKeyhole />}</span>
    </button>
  );
}

function MissionsPage({ progress, navigate, notify, qaMode }) {
  const { t } = useI18n();
  const completed = completedCount(progress);
  const finalUnlocked = canAccessFinalChallenge(progress, qaMode);

  return (
    <main className="all-missions-page react-missions-page">
      <section className="all-missions-grid">
        <div className="missions-main">
          <header className="all-missions-hero">
            <div className="hero-title-row">
              <span className="hero-target-icon"><Target /></span>
              <div><h1>All {t("navigation.missions")}</h1><p>Complete missions step by step to understand how ChatGPT works.<br />Finish all missions to unlock the Final Challenge!</p></div>
            </div>
            <Mascot type="missions" />
          </header>

          <section className="mission-sequence" aria-label="Mission learning journey">
            {missionData.map((mission) => (
              <MissionJourneyCard key={mission.id} mission={mission} progress={progress} navigate={navigate} notify={notify} qaMode={qaMode} />
            ))}
            <button
              className={`final-mission-card ${finalUnlocked ? "unlocked-final" : ""}`}
              type="button"
              onClick={() => finalUnlocked ? navigate("/final-challenge") : notify("Complete all 6 missions to unlock the Final Challenge.")}
            >
              <span className="final-challenge-icon"><Target /></span>
              <span><strong>Final Challenge: AI Literacy Escape Room</strong><small>Complete all 6 missions to unlock the final challenge and test your AI knowledge!</small></span>
              <span className={finalUnlocked ? "final-challenge-action" : "final-locked-pill"}>{finalUnlocked ? <>Start Final Challenge<ArrowRight /></> : <><LockKeyhole />Locked</>}</span>
            </button>
          </section>
        </div>

        <aside className="missions-side">
          <section className="missions-panel progress-summary">
            <h2><CircleGauge />Your Progress</h2>
            <button className="missions-progress-ring" type="button" style={{ "--mission-progress-angle": `${(completed / missionData.length) * 360}deg` }} onClick={() => navigate("/progress")}>
              <strong>{completed} / {missionData.length}</strong><small>Missions Completed</small>
            </button>
            <p className="missions-progress-copy">{completed === missionData.length ? "Final Challenge available" : finalUnlocked ? `${missionData.length - completed} mission${missionData.length - completed === 1 ? "" : "s"} remaining · QA access enabled` : `${missionData.length - completed} mission${missionData.length - completed === 1 ? "" : "s"} remaining · Final Challenge locked`}</p>
          </section>

          <section className="missions-panel learn-panel">
            <h2>What You’ll Learn</h2>
            {missionData.map((mission) => {
              const SkillIcon = progressMissionIcons[mission.id] || BookOpen;
              return <button type="button" key={mission.id} onClick={() => notify(mission.skill)}><span className={`skill-icon ${missionJourneyColors[mission.id - 1]}`}><SkillIcon /></span>{mission.skill}</button>;
            })}
          </section>
        </aside>
      </section>
    </main>
  );
}


function ProgressPage({ progress, navigate, notify, qaMode }) {
  const { t } = useI18n();
  const completed = completedCount(progress);
  const inProgress = missionData.filter((mission) => !progress.missions[mission.id]?.completed && (progress.missions[mission.id]?.progress || 0) > 0).length;
  const locked = missionData.filter((mission) => !canAccessMission(progress, mission.id, qaMode)).length;
  const notes = readLearningNotes();
  const overall = Math.round((completed / missionData.length) * 100);
  const finalAvailable = canAccessFinalChallenge(progress, qaMode);
  const stats = [
    [CheckCircle2, completed, "Missions completed", () => navigate("/missions")],
    [CircleGauge, `${overall}%`, "Overall completion", () => navigate("/missions")],
    [NotebookPen, notes.length, "Saved reflections", () => openProgressNotes(navigate)],
    [finalAvailable ? Trophy : LockKeyhole, finalAvailable ? "Ready" : "Locked", "Final Challenge", () => finalAvailable ? navigate("/final-challenge") : notify("Complete all six missions first.")]
  ];
  return <div className="progress-page"><section className="progress-main"><div className="progress-summary-grid"><section className="card overall-card"><h2><CircleGauge />Overall Progress</h2><div className="overall-inner"><div className="progress-ring big" style={{ "--angle": `${overall / 100 * 360}deg` }}><strong>{overall}%</strong><small>Completed</small></div><div className="progress-legend"><span><i className="purple-dot" />Completed<b>{completed} / {missionData.length} Missions</b></span><span><i className="gold-dot" />In Progress<b>{inProgress} Mission{inProgress === 1 ? "" : "s"}</b></span><span><i />Locked<b>{locked} Mission{locked === 1 ? "" : "s"}</b></span></div></div></section><section className="card progress-stats-card"><h2><CircleGauge />Learning Summary</h2><div className="progress-stats-grid">{stats.map(([StatIcon, value, label, action]) => <button key={label} onClick={action}><span className="progress-icon-box"><StatIcon /></span><strong>{value}</strong><small>{label}</small></button>)}</div></section></div><section className="card mission-progress-card"><h2><BookOpen />Mission Progress</h2><div className="mission-table-head"><span>Mission</span><span>Progress</span><span>Status</span></div><div className="mission-progress-list">{missionData.map((mission) => <ProgressMissionRow key={mission.id} mission={mission} progress={progress} navigate={navigate} notify={notify} t={t} qaMode={qaMode} />)}</div><button className="progress-final-banner" onClick={() => finalAvailable ? navigate("/final-challenge") : notify(`Complete Mission ${completed + 1} first.`)}><span className="progress-icon-box"><Trophy /></span><span><strong>{finalAvailable ? "Final Challenge available" : "Complete all missions to unlock the Final Challenge"}</strong><small>{finalAvailable ? "You can enter the AI Literacy Escape Room." : `${missionData.length - completed} mission${missionData.length - completed === 1 ? "" : "s"} remaining.`}</small></span>{finalAvailable ? <ArrowRight /> : <LockKeyhole />}</button></section></section><aside className="progress-right"><ProgressActivity progress={progress} navigate={navigate} t={t} /><section className="card progress-notes-card"><div className="row-title"><h2><NotebookPen />Saved Notes</h2><button onClick={() => openProgressNotes(navigate)}>View all</button></div><p>{notes.length ? `${notes.length} reflection${notes.length === 1 ? "" : "s"} saved from your mission activities.` : "Save a reflection inside a mission and it will appear here."}</p>{notes.slice(0, 2).map((note) => <button className="progress-note-preview" key={note.id} onClick={() => openProgressNotes(navigate)}><strong>{note.mission} · {note.title}</strong><small>{note.note}</small></button>)}<button className="outline progress-open-notes" onClick={() => openProgressNotes(navigate)}>Open Notes</button></section></aside></div>;
}

function openProgressNotes(navigate) {
  localStorage.setItem("aiExplorerActivityTab", "Notes");
  navigate("/activity");
}

function ProgressMissionRow({ mission, progress, navigate, notify, t, qaMode }) {
  const state = progress.missions[mission.id] || { progress: 0, completed: false };
  const translated = translateMission(mission, t);
  const unlocked = canAccessMission(progress, mission.id, qaMode);
  const status = state.completed ? "Completed" : state.progress > 0 ? "In Progress" : unlocked ? "Start" : "Locked";
  const MissionIcon = progressMissionIcons[mission.id] || BookOpen;
  return <button className={`progress-mission-row ${state.completed ? "done" : ""} ${state.progress > 0 && !state.completed ? "current" : ""}`} onClick={() => unlocked ? navigate(mission.route) : notify(`Complete Mission ${mission.id - 1} first.`)}><span className="mission-number">{mission.id}</span><span className="mission-art compact"><MissionIcon /></span><span className="mission-copy"><strong>{translated.title}</strong><small>{translated.skill || mission.skill}</small></span><span className="mini-bar"><span style={{ width: `${state.completed ? 100 : state.progress}%` }} /></span><ProgressPill type={state.completed ? "done" : unlocked ? "current" : "locked"}>{status}</ProgressPill>{unlocked ? <ExternalLink /> : <LockKeyhole />}</button>;
}

const progressMissionIcons = {
  1: Braces,
  2: BrainCircuit,
  3: ShieldAlert,
  4: Layers3,
  5: Database,
  6: Scale
};

function ProgressActivity({ progress, navigate, t }) {
  const activities = [];
  missionData.forEach((mission) => {
    const state = progress.missions[mission.id] || { progress: 0, completed: false };
    const translated = translateMission(mission, t);
    if (state.completed) activities.unshift([CheckCircle2, `Completed Mission ${mission.id}`, translated.short, "Completed", mission.route, "Today"]);
    else if (state.progress > 0) activities.unshift([progressMissionIcons[mission.id] || BookOpen, `Continued Mission ${mission.id}`, translated.short, "In progress", mission.route, "Today"]);
  });
  if (!activities.length) activities.push([BookOpen, "Ready to start Mission 1", translateMission(missionData[0], t).short, "Start", missionData[0].route, "Today"]);
  return <section className="card progress-activity-card"><div className="row-title"><h2><Clock3 />Recent Activity</h2><button onClick={() => navigate("/activity")}>View all</button></div>{activities.slice(0, 4).map(([ActivityIcon, title, desc, status, route, time]) => <button className="activity-item" key={`${title}-${desc}`} onClick={() => navigate(route)}><span className="progress-icon-box"><ActivityIcon /></span><div><strong>{title}</strong><small>{desc}</small></div><em>{status}<small>{time}</small></em></button>)}</section>;
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

function MissionLayout({ mission, title, subtitle, robot = "pointing", progress, notify, children, headingPrefix, eyebrow, bubbleText, scopeClass = "" }) {
  return <div className={`mission-layout mission-${mission} ${scopeClass}`.trim()}><header className="mission-header"><button className="outline" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "/missions" }))}>‹ Back to Missions</button><div className="mission-mid"><strong>Mission {mission} of 6</strong><span className="mission-dots">{missionData.map((m) => <i className={m.id <= mission ? "filled" : ""} key={m.id} />)}</span></div><div className="mission-header-actions"><LanguageSelector compact /><button className="icon-button" onClick={() => notify?.("Settings: text size, animation speed, sound, dark mode, reset progress.")}><Icon name="gear" /></button></div></header><section className="mission-content"><header className="mission-title"><div>{eyebrow && <span className="mission-eyebrow">{eyebrow}</span>}<h1>{headingPrefix ?? `${mission}.`} {title}</h1><p>{subtitle}</p></div>{bubbleText && <span className="mascot-bubble">{bubbleText}</span>}<Mascot type={robot} /></header><div className="lesson-grid">{children}</div></section></div>;
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

function Mission1({ progress, setProgress, navigate, notify }) {
  const { language, t } = useI18n();
  const introFixture = useMemo(getMission1IntroFixture, []);
  const introGroups = useMemo(() => introFixture.rawPieces.map((rawPiece, index) => ({ startIndex: index, tokenCount: 1, ids: [introFixture.ids[index]], rawPieces: [rawPiece], decodedPiece: introFixture.decodedPieces[index] })), [introFixture]);
  const [core, setCore] = useState(createMission1CoreProgress);
  const [activeSection, setActiveSection] = useState("intro");
  const [readSections, setReadSections] = useState({ intro: true });
  const [revealCount, setRevealCount] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [replayNotice, setReplayNotice] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [exploreIndex, setExploreIndex] = useState(0);
  const alreadyCompleted = progress.missions[1]?.completed === true;
  const coreComplete = isMission1CoreComplete(core);
  const canContinue = alreadyCompleted || coreComplete;
  const replaying = revealCount < introGroups.length;
  const sections = useMemo(() => [
    ["intro", t("mission1.sections.intro")],
    ["demo", t("mission1.sections.demo")],
    ["playground", t("mission1.sections.playground")],
    ["check", t("mission1.sections.quickCheck")],
    ["numbers", t("mission1.sections.numbers")],
    ["summary", t("mission1.sections.summary")]
  ], [t, language]);

  React.useEffect(() => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) { setRevealCount(introGroups.length); return undefined; }
    setRevealCount(0);
    const timer = window.setInterval(() => setRevealCount((count) => {
      if (count >= introGroups.length) { window.clearInterval(timer); return count; }
      return count + 1;
    }), 220);
    return () => window.clearInterval(timer);
  }, [animationKey, introGroups.length]);

  React.useEffect(() => {
    if (!animationKey) return undefined;
    const timer = window.setTimeout(() => setReplayNotice(false), 900);
    return () => window.clearTimeout(timer);
  }, [animationKey]);

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
      if (current === "summary") setCore((state) => state.summarySeen ? state : { ...state, summarySeen: true });
    };
    update();
    container.addEventListener("scroll", update, { passive: true });
    return () => container.removeEventListener("scroll", update);
  }, [sections]);

  React.useEffect(() => {
    if (!coreComplete || alreadyCompleted) return;
    setProgress((previous) => {
      if (previous.missions[1]?.completed) return previous;
      const next = completeMission1Progress(previous);
      writeProgress(next);
      return next;
    });
    notify(t("mission1.summary.complete"));
  }, [alreadyCompleted, coreComplete, notify, setProgress, t]);

  function markCore(key) {
    setCore((state) => state[key] ? state : { ...state, [key]: true });
  }
  function scrollToSection(id) {
    document.getElementById(`m1-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function exploreAnother() {
    setExploreIndex((value) => value + 1);
    scrollToSection("playground");
  }
  function restartMission() {
    setCore(createMission1CoreProgress());
    setReadSections({ intro: true });
    setResetKey((value) => value + 1);
    setAnimationKey((value) => value + 1);
    scrollToSection("intro");
  }
  function replayExample() {
    setReplayNotice(true);
    setAnimationKey((value) => value + 1);
  }

  return <MissionLayout mission={1} title={t("mission1.title")} subtitle={t("mission1.subtitle")} robot="reading" progress={progress} notify={notify} scopeClass="playful-learning-scope">
    <section className="lesson-main course-flow m1-course-flow">
      <CourseSection id="m1-intro" n="1" title={t("mission1.sections.intro")}>
        <p>{t("mission1.intro.body")}</p>
        <PlayfulSceneBanner badge={t("mission1.intro.buildingLabel")} sentenceLabel={t("mission1.intro.sentenceLabel")} sentence={introFixture.text} blocks={["The", "uncharacteristically", "quiet", "robot", "smiled", "."]} metaphorLabel={t("mission1.intro.metaphorLabel")} note={t("mission1.intro.metaphorNote")} imageSrc="/assets/img/mission-robot-reading.png" />
      </CourseSection>
      <CourseSection id="m1-demo" n="2" title={t("mission1.sections.demo")} action={<button type="button" className="outline tiny-top" aria-live="polite" onClick={replayExample}><RefreshCcw className={replaying ? "m1-spinner" : ""} size={16} strokeWidth={1.8} />{replaying || replayNotice ? t("mission1.demo.replaying") : t("mission1.demo.replay")}</button>}>
        <p>{t("mission1.demo.body")}</p>
        <div className="playful-real-token-lab" data-tour-id="m1-demo-result"><div className="playful-real-token-head"><span><ShieldCheck size={16} strokeWidth={2} />{t("mission1.demo.realPieces")}</span><small>{t("mission1.demo.verifiedCount")}</small></div><TokenPieces groups={introGroups.slice(0, revealCount)} visualVariant="verified" t={t} /><p className="m1-space-legend"><span>␠</span>{t("mission1.tokens.spaceLegend")}</p></div>
        <RobotGuideBubble label={t("mission1.demo.lookCloser")} title={t("mission1.demo.whyTitle")} illustration={<MiniSceneIllustration imageSrc="/assets/img/mission-robot-pointing.png" />}>
          <p>{t("mission1.demo.whyVocabulary")}</p><p>{t("mission1.demo.whyCommon")}</p>
          <div className={`playful-split-focus ${revealCount >= 4 && replaying ? "is-emphasised" : ""}`}><strong>uncharacteristically</strong><ArrowRight size={20} strokeWidth={1.8} /><span className="playful-split-pieces">{["un", "character", "istically"].map((piece, index) => <TokenBuildingBlock variant="verified" index={index} verifiedLabel={t("mission1.tokens.verifiedLabel")} key={piece}>{piece}</TokenBuildingBlock>)}</span></div>
        </RobotGuideBubble>
        <div className="playful-model-note"><span><Icon name="info" /></span><div><strong>{t("mission1.demo.model")}</strong><small>{t("mission1.demo.different")}</small></div></div>
      </CourseSection>
      <CourseSection id="m1-playground" n="3" title={t("mission1.sections.playground")}>
        <p>{t("mission1.playground.intro")}</p>
        <QwenTokenizerPlayground language={language} t={t} onSuccessfulRun={() => markCore("playgroundRun")} exploreIndex={exploreIndex} resetKey={resetKey} />
      </CourseSection>
      <CourseSection id="m1-check" n="4" title={t("mission1.sections.quickCheck")}>
        <p>{t("mission1.check.intro")}</p>
        <div className="m1-check-grid"><section><h3>{t("mission1.check.partA")}</h3><Mission1QuickCheckA t={t} resetKey={resetKey} onComplete={() => markCore("partAComplete")} /></section><section><h3>{t("mission1.check.partB")}</h3><Mission1QuickCheckB language={language} t={t} resetKey={resetKey} onComplete={() => markCore("partBComplete")} /></section></div>
      </CourseSection>
      <CourseSection id="m1-numbers" n="5" title={t("mission1.sections.numbers")}>
        <p>{t("mission1.numbers.intro")}</p>
        <div className="m1-number-bridge"><img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true" /><div className="m1-math-flow"><span><Icon name="message" /><b>{t("mission1.numbers.text")}</b></span><i>→</i><span><Icon name="grid" /><b>{t("mission1.numbers.pieces")}</b></span><i>→</i><span><Icon name="calculator" /><b>{t("mission1.numbers.representations")}</b><small>42 · 918 · 305</small></span><i>→</i><span><Icon name="brain" /><b>{t("mission1.numbers.patterns")}</b></span><i>→</i><span><Icon name="target" /><b>{t("mission1.numbers.prediction")}</b></span></div></div>
        <div className="m1-simplified-note"><strong>{t("mission1.numbers.numberNote")}</strong><span>{t("mission1.numbers.next")}</span></div>
      </CourseSection>
      <CourseSection id="m1-summary" n="6" title={t("mission1.sections.summary")}>
        <p>{t("mission1.summary.intro")}</p>
        <div className="m1-summary-list">{[["piece", "message"], ["subword", "puzzle"], ["math", "calculator"]].map(([item, icon]) => <span key={item}><Icon name={icon} /><strong>{t(`mission1.summary.cards.${item}`)}</strong><small>{t(`mission1.summary.items.${item}`)}</small></span>)}</div>
        <div className="m1-summary-model-facts"><span><Icon name="check" />{t("mission1.summary.items.real")}</span><span><Icon name="check" />{t("mission1.summary.items.different")}</span></div>
        <div className="m1-summary-robot"><img src="/assets/img/mission-robot-reading.png" alt="" aria-hidden="true" /><div><strong>{canContinue ? t("mission1.summary.complete") : t("mission1.summary.incomplete")}</strong><p>{t("mission1.summary.encouragement")}</p></div></div>
        <div className="m1-summary-actions"><button type="button" className="primary" onClick={exploreAnother}>{t("mission1.actions.explore")}</button><button type="button" className="outline" onClick={() => navigate("/ai-lab")}>{t("mission1.actions.aiLab")}</button><button type="button" className="outline" data-tour-id="m1-restart" onClick={restartMission}>{t("mission1.actions.restartMission")}</button><button type="button" className="outline" disabled={!canContinue} onClick={() => navigate("/mission/2-next-token")}>{t("mission1.actions.nextMission")}</button></div>
      </CourseSection>
    </section>
    <aside className="lesson-side page-timeline" aria-label={t("mission1.sections.summary")}><div className="card timeline-card"><h2>{t("missions.learningPath")}</h2><span className="timeline-rail" style={{ "--progress": `${(Math.max(0, sections.findIndex(([id]) => id === activeSection)) / (sections.length - 1)) * 100}%` }} />{sections.map(([id, label], index) => { const active = activeSection === id; const read = Boolean(readSections[id]); return <button type="button" key={id} className={`${active ? "active" : ""} ${read ? "read" : ""}`} onClick={() => scrollToSection(id)}><span>{read && !active ? <Icon name="check" /> : index + 1}</span>{label}</button>; })}</div></aside>
    <footer className="course-bottom-nav"><button className="outline" disabled>‹ {t("mission1.actions.previous")}</button><span>{canContinue ? t("mission1.summary.complete") : t("mission1.summary.incomplete")}</span><button className="primary" disabled={!canContinue} onClick={() => navigate("/mission/2-next-token")}>{t("mission1.actions.nextMission")} →</button></footer>
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
  const nextReady = submitted && challengeResult === "correct";
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
      notify("Submit your guess and complete the mini challenge first.");
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
        const read = Boolean(readSections[id]) || (id === "summary" && nextReady);
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
  const nextReady = submitted && trickSubmitted && challengeDone;
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
      notify("Finish the tricky question and detective challenge first.");
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
        const read = Boolean(readSections[id]) || (id === "summary" && nextReady);
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
    <footer className="course-bottom-nav"><button className="outline" onClick={() => navigate("/mission/2-next-token")}>‹ Previous</button><span>{nextReady ? "Mission 3 complete. Mission 4 is ready." : "Keep investigating. Finish the detective challenge."}</span><button className="primary" disabled={!nextReady} onClick={finishMission}>Next: Mission 4 →</button></footer>
  </MissionLayout>;
}

function Concept({ icon, title, text }) {
  const Lucide = {
    understand: BrainCircuit,
    accurate: BadgeCheck,
    knowledge: Lightbulb,
    safer: ShieldCheck
  }[icon];
  return <article className={`concept-card ${Lucide ? "library-icon-card" : ""}`}>
    {Lucide ? <span className={`library-icon ${icon}`}><Lucide aria-hidden="true" strokeWidth={2.4} /></span> : <Icon name={icon} />}
    <strong>{title}</strong>
    <p>{text}</p>
  </article>;
}

function ClaimDrop({ title, icon, tone, items, from, dragPayload, onDrop, onMoveBack, disabled = false }) {
  return <div className={`claim-drop ${tone} ${disabled ? "disabled" : ""}`} onDragOver={(e) => !disabled && e.preventDefault()} onDrop={(e) => { if (disabled) return; e.preventDefault(); try { onDrop(JSON.parse(e.dataTransfer.getData("application/json"))); } catch { /* noop */ } }}><strong><Icon name={icon} />{title}</strong>{items.map((item, i) => <button draggable={!disabled} disabled={disabled} onClick={() => onMoveBack?.(i)} onDragStart={(e) => e.dataTransfer.setData("application/json", dragPayload(from, i))} className="claim-chip" title={disabled ? "Reset to try again" : "Click to move back, or drag to another box"} key={item}>{item}</button>)}</div>;
}

function Mission4({ progress, setProgress, navigate, notify }) {
  const saved = progress.missions[4] || { progress: 0, completed: false };
  const sections = [
    ["little", "Very little context"],
    ["some", "Some more context"],
    ["lots", "Lots of context"],
    ["turn", "Your turn"],
    ["challenge", "Mini Challenge"],
    ["summary", "Summary"]
  ];
  const contextDetails = {
    Weather: "Rainy, 18°C",
    Location: "Edinburgh",
    Time: "Tomorrow morning",
    Event: "Wedding",
    Style: "Smart but comfortable"
  };
  const contextChips = Object.keys(contextDetails);
  const challengeExpected = [
    "I need a gift.",
    "I need a gift for my sister.",
    "I need a gift for my sister who likes fantasy books and my budget is £20."
  ];
  const [activeSection, setActiveSection] = useState("little");
  const [readSections, setReadSections] = useState(() => saved.completed ? Object.fromEntries(sections.map(([id]) => [id, true])) : { little: true });
  const [expandedWhy, setExpandedWhy] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState(saved.progress >= 60 ? ["Weather", "Location"] : []);
  const [question, setQuestion] = useState("What should I wear tomorrow?");
  const [askState, setAskState] = useState("idle");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [previousAnswer, setPreviousAnswer] = useState("");
  const [answerContexts, setAnswerContexts] = useState([]);
  const [previousContexts, setPreviousContexts] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(null);
  const [previousQuality, setPreviousQuality] = useState(null);
  const [clueFlash, setClueFlash] = useState("");
  const [challengeSource, setChallengeSource] = useState([challengeExpected[1], challengeExpected[2], challengeExpected[0]]);
  const [challengeDrop, setChallengeDrop] = useState([]);
  const [challengeResult, setChallengeResult] = useState("");
  const [challengeFeedback, setChallengeFeedback] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [note, setNote] = useState(() => localStorage.getItem("mission4ContextNote") || "");
  const [noteSaved, setNoteSaved] = useState(false);
  const contextReady = selectedContexts.length >= 2;
  const challengeDone = challengeResult === "correct";
  const nextReady = contextReady && Boolean(currentAnswer) && challengeDone;

  React.useEffect(() => {
    const container = document.querySelector(".mission-4 .mission-content");
    if (!container) return undefined;
    const update = () => {
      let current = sections[0][0];
      const containerTop = container.getBoundingClientRect().top;
      sections.forEach(([id]) => {
        const node = document.getElementById(`m4-${id}`);
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
      const alreadyDone = next.missions[4].completed;
      next.missions[4] = { progress: Math.max(next.missions[4].progress || 0, progressValue), completed: alreadyDone || completed };
      writeProgress(next);
      return next;
    });
  }
  function scrollToSection(id) {
    document.getElementById(`m4-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function answerQuality(items = selectedContexts) {
    if (!items.length) return 35;
    return Math.min(94, 35 + items.length * 12 + (items.includes("Weather") && items.includes("Location") ? 8 : 0) + (items.includes("Event") ? 6 : 0));
  }
  function contextAnswer(items = selectedContexts) {
    const has = (name) => items.includes(name);
    if (!items.length) return "You could wear something comfortable, such as a jacket and trousers.";
    if (has("Weather") && has("Location") && has("Event") && has("Time") && has("Style")) return "For a rainy wedding morning in Edinburgh, wear a smart waterproof coat over a formal outfit, with waterproof shoes.";
    if (has("Weather") && has("Event") && has("Style")) return "Wear a smart waterproof coat, formal layers, and shoes that can handle rain.";
    if (has("Weather") && has("Location")) return "Take a waterproof coat or jacket. Edinburgh can be rainy and cool.";
    if (has("Time") && has("Style")) return "Wear smart, comfortable layers for tomorrow morning. Add weather or event context to make this more precise.";
    if (has("Event") && has("Style")) return "Choose a smart but comfortable outfit that fits the event.";
    if (has("Weather")) return "Take a waterproof coat. Rain changes the best answer.";
    if (has("Event")) return "Choose clothes that fit the event, such as something more formal for a wedding.";
    if (has("Style")) return "Aim for something smart but comfortable, but I still need the weather or event.";
    return "This is a little better, but I still need more details to give a useful answer.";
  }
  function usefulContextSummary(items = selectedContexts) {
    return items.length ? items.map((item) => contextDetails[item]).join(" · ") : "Only the word tomorrow from the question.";
  }
  function missingContexts(items = selectedContexts) {
    return contextChips.filter((chip) => !items.includes(chip));
  }
  function askChatGPT() {
    const contextsAtClick = [...selectedContexts];
    const qualityAtClick = answerQuality(contextsAtClick);
    setAskState("reading");
    window.setTimeout(() => setAskState("scanning"), 350);
    window.setTimeout(() => setAskState("generating"), 760);
    window.setTimeout(() => {
      setPreviousAnswer(currentAnswer);
      setPreviousContexts(answerContexts);
      setPreviousQuality(currentQuality);
      setCurrentAnswer(contextAnswer(contextsAtClick));
      setAnswerContexts(contextsAtClick);
      setCurrentQuality(qualityAtClick);
      setAskState("done");
      if (contextsAtClick.length >= 2) markProgress(60);
      if (!currentAnswer) notify(contextsAtClick.length ? "Answer generated using your context clues." : "First answer generated. Try adding context clues next.");
      else if (qualityAtClick > (currentQuality ?? 0)) notify("The answer became more useful because the prompt has better context.");
      else if (qualityAtClick < (currentQuality ?? 0)) notify("The answer became less useful because some context was removed.");
      else notify("Answer regenerated with the current context.");
    }, 1250);
  }
  function toggleContext(name) {
    setSelectedContexts((items) => {
      const next = items.includes(name) ? items.filter((item) => item !== name) : [...items, name];
      setClueFlash(name);
      window.setTimeout(() => setClueFlash(""), 900);
      if (next.length >= 2) markProgress(60);
      return next;
    });
  }
  function dragPayload(from, index) {
    return JSON.stringify({ from, index });
  }
  function readPayload(event) {
    try { return JSON.parse(event.dataTransfer.getData("application/json")); } catch { return null; }
  }
  function clearChallenge() {
    setChallengeResult("");
    setChallengeFeedback("");
  }
  function movePromptToDrop(index, position = challengeDrop.length) {
    const item = challengeSource[index];
    if (!item || challengeDone) return;
    clearChallenge();
    setChallengeSource((items) => items.filter((_, i) => i !== index));
    setChallengeDrop((items) => {
      const next = [...items];
      next.splice(Math.min(position, next.length), 0, item);
      return next;
    });
  }
  function movePromptBack(index) {
    const item = challengeDrop[index];
    if (!item || challengeDone) return;
    clearChallenge();
    setChallengeDrop((items) => items.filter((_, i) => i !== index));
    setChallengeSource((items) => [...items, item]);
  }
  function reorderPrompt(from, to) {
    if (from === to || challengeDone) return;
    clearChallenge();
    setChallengeDrop((items) => {
      const next = [...items];
      const [item] = next.splice(from, 1);
      if (item) next.splice(to, 0, item);
      return next;
    });
  }
  function dropPrompt(payload, to = challengeDrop.length) {
    if (!payload || challengeDone) return;
    if (payload.from === "source") movePromptToDrop(payload.index, to);
    if (payload.from === "drop") reorderPrompt(payload.index, to);
  }
  function checkChallenge() {
    if (challengeDrop.join("\0") === challengeExpected.join("\0")) {
      setChallengeResult("correct");
      setChallengeFeedback("Good ordering. Each prompt adds more useful context, so the answer can become more specific.");
      markProgress(82);
      notify("Mini challenge complete. Scroll to the summary.");
      return;
    }
    const firstWrong = challengeDrop.findIndex((item, index) => item !== challengeExpected[index]);
    const expected = challengeExpected[firstWrong] || challengeExpected[0];
    setChallengeResult("wrong");
    setChallengeFeedback(`Look at position ${firstWrong + 1}: the prompt should be “${expected}”.`);
    notify("Try again. Order the prompts from least context to most context.");
  }
  function resetChallenge() {
    setChallengeSource([challengeExpected[1], challengeExpected[2], challengeExpected[0]]);
    setChallengeDrop([]);
    setChallengeResult("");
    setChallengeFeedback("");
    setHintVisible(false);
  }
  function saveNote() {
    const text = note.trim() || "More context helps ChatGPT give a more specific and useful answer.";
    setNote(text);
    setNoteSaved(true);
    localStorage.setItem("mission4ContextNote", text);
    saveLearningNote({
      id: "mission-4-context-note",
      mission: "Mission 4",
      title: "Context reflection",
      prompt: "What did you learn about giving context?",
      note: text
    });
    notify("Saved to My Notes in Activity.");
  }
  function finishMission() {
    if (!nextReady) {
      notify("Add context and finish the mini challenge first.");
      return;
    }
    markProgress(100, true);
    notify("Mission 4 complete. Opening Mission 5...");
    window.setTimeout(() => navigate("/mission/5-training-data"), 500);
  }

  return <MissionLayout mission={4} title="Why does context matter?" subtitle={<>The more context ChatGPT has, the better it can understand<br />and give helpful answers.</>} robot="idea" bubbleText="Context makes answers clearer." progress={progress} notify={notify}>
    <section className="lesson-main course-flow mission4-flow">
      <section className="scenario-card context-upgrade-scenario"><span>Scenario</span><div><strong>Let's ask the same question with different amounts of context.</strong><p>Watch how the answer improves as the prompt becomes more specific.</p></div><button className="outline" onClick={() => scrollToSection("turn")}>Let's try! ↓</button></section>
      <CourseSection id="m4-little" n="1" title="Very little context" action={<button className="outline tiny-top" onClick={() => scrollToSection("little")}>Top ↑</button>}>
        <p>When ChatGPT has almost no information, it can only guess what you mean.</p>
        <div className="context-chat low-context"><ContextLayers count={1} /><div className="chat-lines"><strong>You: What's the best apple?</strong><span>ChatGPT: The best apple is probably the Red Delicious.</span></div></div>
        <button className="outline why-button" onClick={() => setExpandedWhy((open) => !open)}><Icon name="question" />Why?</button>
        {expandedWhy && <div className="context-explain context-question-list"><strong>“Best” is too general.</strong><span>Best for eating?</span><span>Best for pie?</span><span>Best for juice?</span><span>Best for school lunch?</span></div>}
        <div className="lesson-hint"><Icon name="bulb" />With very little context, the answer might be generic or not very useful.</div>
      </CourseSection>
      <CourseSection id="m4-some" n="2" title="Some more context">
        <p>Now give it a bit more information.</p>
        <div className="context-chat medium-context"><ContextLayers count={2} /><div className="chat-lines"><strong>You: What's the best apple for baking a pie?</strong><span>ChatGPT: For baking a pie, Granny Smith apples are often best. They stay firm and have a nice tart flavour.</span></div></div>
        <div className="context-success"><Icon name="check" />More context = more helpful answer.</div>
        <button className="outline compare-button" onClick={() => setCompareOpen((open) => !open)}><Icon name="search" />Compare</button>
        {compareOpen && <div className="context-compare-panel"><div><small>Very little context</small><strong>What's the best apple?</strong><span>Generic answer</span></div><div><small>Some context</small><strong>Best apple for baking a pie?</strong><span>More useful answer</span></div></div>}
      </CourseSection>
      <CourseSection id="m4-lots" n="3" title="Lots of context">
        <p>The more useful details you give, the better ChatGPT can help.</p>
        <div className="context-chat rich-context"><ContextLayers count={5} /><div className="chat-lines"><strong>You: I'm baking an apple pie. I live in the UK. I want something not too sweet, easy to find, and holds its shape. What's the best apple?</strong><span>ChatGPT: In the UK, Bramley apples are a great choice for pies. They are firm, tart, hold their shape well when baked, and are widely available.</span></div><div className="confidence-badge"><Icon name="check" />Higher confidence</div></div>
        <div className="context-success strong"><Icon name="bulb" />Great detail = accurate and useful answer.</div>
      </CourseSection>
      <CourseSection id="m4-turn" n="4" title="Your turn: Add more context">
        <p>Start with a short question, then add details to improve the answer.</p>
        <div className="prompt-playground">
          <div className="prompt-workbench">
            <label className="prompt-question-card"><strong>Your question</strong><input value={question} onChange={(e) => setQuestion(e.target.value)} /><div className="prompt-preview"><small>Current prompt</small><strong>{question}</strong>{selectedContexts.length ? <ul>{selectedContexts.map((item) => <li key={item} className={clueFlash === item ? "new-clue" : ""}><Icon name="check" />{item}: {contextDetails[item]}</li>)}</ul> : <p>No extra context yet.</p>}</div><button className="primary ask-context-button" disabled={askState !== "idle" && askState !== "done"} onClick={askChatGPT}>{askState === "reading" ? "Reading your question..." : askState === "scanning" ? "Looking for clues..." : askState === "generating" ? "Generating an answer..." : currentAnswer ? "Generate Better Answer" : "Ask ChatGPT"}</button></label>
            <span className="builder-arrow clue-arrow">→</span>
            <div className="context-chip-panel prompt-chip-panel"><strong>Add useful context</strong><div className="context-chip-grid">{contextChips.map((chip) => <button key={chip} className={`${selectedContexts.includes(chip) ? "active" : ""} ${clueFlash === chip ? "just-added" : ""}`} onClick={() => toggleContext(chip)}><span>{selectedContexts.includes(chip) ? "✓" : "+"} {chip}</span><small>{contextDetails[chip]}</small></button>)}</div></div>
          </div>
          <div className="context-scanner-card">
            <div><strong>{askState === "idle" && !currentAnswer ? "Ready to scan your prompt" : askState === "done" ? "Context scanner" : "ChatGPT is thinking..."}</strong><span className={askState !== "idle" && askState !== "done" ? "thinking-dots" : ""}> </span></div>
            <div className="scanner-grid"><span className="scan-ok"><Icon name="check" />Question received</span><span className={selectedContexts.length ? "scan-ok" : "scan-warn"}><Icon name={selectedContexts.length ? "check" : "alert"} />Useful clues found: {selectedContexts.length || 1}</span></div>
            <div className="missing-clues"><strong>Missing clues:</strong>{missingContexts().length ? missingContexts().map((chip) => <span key={chip}>○ {chip}</span>) : <span>None. Great prompt.</span>}</div>
          </div>
          <div className="quality-meter-card"><div><strong>{currentAnswer ? "Generated answer usefulness" : "Expected answer usefulness"}</strong><span>{currentAnswer ? `${currentQuality}%` : "Not generated yet"}</span></div><i><b style={{ width: `${currentAnswer ? currentQuality : answerQuality(selectedContexts)}%` }} /></i><p>{currentAnswer ? `This answer used ${answerContexts.length} clue${answerContexts.length === 1 ? "" : "s"}.` : `Preview if you ask now: ${answerQuality(selectedContexts)}%`}</p></div>
          {currentAnswer ? <div className={`answer-comparison-card ${previousAnswer && currentQuality < previousQuality ? "got-worse" : previousAnswer && currentQuality > previousQuality ? "got-better" : "same-quality"}`}><div className="answer-column before"><small>{previousAnswer ? "Previous generated answer" : "First generated answer"}</small><p>{previousAnswer || currentAnswer}</p><em>{previousAnswer ? `${previousQuality}% useful · ${previousContexts.length} clue${previousContexts.length === 1 ? "" : "s"}` : `${currentQuality}% useful · ${answerContexts.length} clue${answerContexts.length === 1 ? "" : "s"}`}</em></div><div className="answer-column after"><small>{previousAnswer ? "Current generated answer" : "Current answer"}</small><p>{currentAnswer}</p><em>{currentQuality}% useful · {previousAnswer ? (currentQuality > previousQuality ? `+${currentQuality - previousQuality}%` : currentQuality < previousQuality ? `${currentQuality - previousQuality}%` : "same") : "first try"}</em></div></div> : null}
          {currentAnswer ? <div className="used-clues-card"><Mascot type="idea" /><div><strong>{previousAnswer ? (currentQuality > previousQuality ? "What improved?" : currentQuality < previousQuality ? "What changed?" : "Same usefulness") : "Why is this answer general?"}</strong>{answerContexts.length ? <ul>{answerContexts.map((item) => <li key={item}><span>{item}</span> → {item === "Weather" ? "waterproof / rain" : item === "Location" ? "Edinburgh" : item === "Event" ? "formal outfit" : item === "Time" ? "morning" : "smart but comfortable"}</li>)}</ul> : <p>This answer is general because the AI does not know the weather, place, event, or style.</p>}{previousAnswer && currentQuality < previousQuality && <p className="quality-warning">You removed useful context, so the answer became less specific.</p>}</div></div> : <div className="add-context-nudge"><Icon name="bulb" />Ask once, then add clues to see the answer improve.</div>}
        </div>
        {contextReady && currentAnswer && currentQuality >= 70 && <div className="section-complete"><Icon name="check" />Nice. This answer used enough context to become more useful.</div>}
      </CourseSection>
      <CourseSection id="m4-challenge" n="5" title={<><Icon name="trophy" />Mini Challenge</>} action={<span className="section-pill">1 / 1</span>}>
        <p>Put the prompts in order from least context to most context.</p>
        <div className="prompt-sorter">
          <div className="prompt-source" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const payload = readPayload(e); if (payload?.from === "drop") movePromptBack(payload.index); }}>{challengeSource.map((prompt, index) => <button key={prompt} draggable={!challengeDone} disabled={challengeDone} onClick={() => movePromptToDrop(index)} onDragStart={(e) => e.dataTransfer.setData("application/json", dragPayload("source", index))}><Icon name="grid" />{prompt}</button>)}</div>
          <div className={`prompt-drop ${challengeDrop.length ? "has-prompts" : ""}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); dropPrompt(readPayload(e)); }}>{challengeDrop.length ? challengeDrop.map((prompt, index) => <div className="prompt-drop-item" key={prompt} draggable={!challengeDone} onDragStart={(e) => e.dataTransfer.setData("application/json", dragPayload("drop", index))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); dropPrompt(readPayload(e), index); }}><span>{index + 1}</span><p>{prompt}</p><div className="prompt-controls"><button type="button" disabled={challengeDone || index === 0} onClick={() => reorderPrompt(index, index - 1)}>↑</button><button type="button" disabled={challengeDone || index === challengeDrop.length - 1} onClick={() => reorderPrompt(index, index + 1)}>↓</button><button type="button" disabled={challengeDone} onClick={() => movePromptBack(index)}>Remove</button></div></div>) : <span>Drag here to arrange<br />least context → most context</span>}</div>
        </div>
        {challengeResult && <div className={`challenge-message ${challengeResult}`}><Icon name={challengeResult === "correct" ? "check" : "alert"} />{challengeFeedback}</div>}
        {hintVisible && <p className="hint-line">Look for extra details: who, what they like, and budget make the prompt more useful.</p>}
        <div className="challenge-actions course-actions"><button className="primary" disabled={challengeDrop.length !== challengeExpected.length || challengeDone} onClick={checkChallenge}>Check Answer</button><button className="outline" onClick={() => setHintVisible(true)}>Need a hint?</button><button className="outline" onClick={resetChallenge}>Reset</button></div>
      </CourseSection>
      <CourseSection id="m4-summary" n="6" title="Summary: Context is key">
        <p>More context helps ChatGPT understand what you really mean.</p>
        <div className="summary-grid context-summary-grid"><Concept icon="understand" title="Understand better" text="Context tells the AI what you really mean." /><Concept icon="accurate" title="Give better answers" text="Specific details reduce vague guessing." /><Concept icon="knowledge" title="Use relevant knowledge" text="It can focus on the useful information." /><Concept icon="safer" title="Avoid mistakes" text="Clear context can reduce hallucinations." /></div>
        <div className="summary-mascot"><Mascot type="idea" /><strong>You’re becoming a prompt expert.</strong></div>
      </CourseSection>
    </section>
    <aside className="lesson-side page-timeline mission4-side-panel" aria-label="On this page">
      <div className="card timeline-card"><h2>On this page</h2><span className="timeline-rail" style={{ "--progress": `${(Math.max(0, sections.findIndex(([id]) => id === activeSection)) / (sections.length - 1)) * 100}%` }} />{sections.map(([id, label], index) => {
        const active = activeSection === id;
        const read = Boolean(readSections[id]) || (id === "summary" && nextReady);
        const needsWork = read && !active && ((id === "turn" && !contextReady) || (id === "challenge" && !challengeDone));
        return <button key={id} className={`${active ? "active" : ""} ${read ? "read" : ""} ${needsWork ? "work" : ""}`} onClick={() => scrollToSection(id)}><span>{read && !active ? <Icon name="check" /> : index + 1}</span>{label}</button>;
      })}</div>
      <section className="card how-card mission4-how"><h2>How it works</h2><Flow title="1. Reads your input" icon="brain" tone="blue">ChatGPT reads your question and context.</Flow><Flow title="2. Finds relevant info" icon="search" tone="green">It looks through what it knows to find useful information.</Flow><Flow title="3. Understands context" icon="link" tone="orange">More details help it know what you really mean.</Flow><Flow title="4. Gives a better answer" icon="wand" tone="lav">Better context leads to better answers.</Flow></section>
      <section className="card try-real-card"><h2>Try it with real examples</h2><p>See how adding context improves the answer.</p><button className="outline" onClick={() => scrollToSection("turn")}>Open Examples <Icon name="link" /></button></section>
      <section className="card context-tip-card"><h2><Icon name="bulb" />Tip</h2><p><strong>Be specific.</strong> Include important details like who, what, where, when, and why.</p><Mascot type="idea" /></section>
      <section className="card notes-widget"><h2><Icon name="bookmark" />Notes</h2><p>Write something you learned or want to remember.</p><textarea value={note} onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }} placeholder="Type your note here..." /><button className="primary" onClick={saveNote}>{noteSaved ? "Saved to My Notes" : "Save Note"}</button></section>
    </aside>
    <footer className="course-bottom-nav"><button className="outline" onClick={() => navigate("/mission/3-hallucination")}>‹ Previous</button><span>{nextReady ? "Mission 4 complete. Mission 5 is ready." : "Keep adding context!"}</span><button className="primary" disabled={!nextReady} onClick={finishMission}>Next: Mission 5 →</button></footer>
  </MissionLayout>;
}

function ContextLayers({ count = 1 }) {
  const label = count === 1 ? "1 clue" : `${count} clues`;
  return <span className={`context-layers layer-count-${count}`} aria-label={`${count} context layer${count === 1 ? "" : "s"}`}>
    <span className="mini-context-robot"><Mascot type="pointing" /></span>
    <span className="layer-stack">{Array.from({ length: count }, (_, index) => <i key={index} />)}</span>
    <b>{label}</b>
  </span>;
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
    notify("Mission 5 completed.");
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
  const sections = [
    ["observe", "Observe Data", Database],
    ["predict", "Predict", TrendingUp],
    ["why", "Why Bias?", BrainCircuit],
    ["fix", "Fix the Data", Wrench],
    ["turn", "Your Turn", Users],
    ["challenge", "Mini Challenge", Scale],
    ["summary", "Summary", Globe2]
  ];
  const [activeSection, setActiveSection] = useState("observe");
  const [readSections, setReadSections] = useState({ observe: true });
  const [observation, setObservation] = useState("");
  const [predictionChoice, setPredictionChoice] = useState("");
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);
  const [fixedMaleCount, setFixedMaleCount] = useState(9);
  const fixedFemaleCount = 10 - fixedMaleCount;
  const fixedMalePercent = fixedMaleCount * 10;
  const fixedFemalePercent = fixedFemaleCount * 10;
  const fixedPrediction = fixedMaleCount > fixedFemaleCount ? "Male" : fixedFemaleCount > fixedMaleCount ? "Female" : "Both equally";
  const [savedBiasData, setSavedBiasData] = useState(null);
  const turnMaleCount = savedBiasData?.male ?? fixedMaleCount;
  const turnFemaleCount = 10 - turnMaleCount;
  const turnMalePercent = turnMaleCount * 10;
  const turnFemalePercent = turnFemaleCount * 10;
  const turnPrediction = turnMaleCount > turnFemaleCount ? "Male" : turnFemaleCount > turnMaleCount ? "Female" : "Both equally";
  const savedBalancedEnough = savedBiasData ? savedBiasData.male >= 4 && savedBiasData.male <= 6 : false;
  const [turnAnswer, setTurnAnswer] = useState("");
  const [turnSubmitted, setTurnSubmitted] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState("");
  const [matches, setMatches] = useState({});
  const [matchColors, setMatchColors] = useState({});
  const [challengeResult, setChallengeResult] = useState("");
  const [challengeFeedback, setChallengeFeedback] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const challengePairs = {
    "The AI only saw one kind of person.": "Show it more kinds of people",
    "The data has an unfair idea in it.": "Remove or fix the unfair idea"
  };
  const challengeProblems = Object.keys(challengePairs);
  const challengeSolutions = ["Remove or fix the unfair idea", "Show it more kinds of people"];
  const challengeDone = challengeResult === "correct";
  const balancedEnough = fixedMaleCount >= 4 && fixedMaleCount <= 6;
  const turnDone = turnSubmitted && turnAnswer === turnPrediction;
  const predictionReady = predictionSubmitted || saved.progress >= 34 || saved.completed;
  const dataReady = savedBalancedEnough || saved.progress >= 64 || saved.completed;
  const turnReady = turnDone || saved.progress >= 74 || saved.completed;
  const challengeReady = challengeDone || saved.progress >= 90 || saved.completed;
  const missionTasksDone = predictionReady && dataReady && turnReady && challengeReady;
  const nextReady = saved.completed || missionTasksDone;

  React.useEffect(() => {
    const container = document.querySelector(".mission-6 .mission-content");
    if (!container) return undefined;
    const update = () => {
      let current = sections[0][0];
      const containerTop = container.getBoundingClientRect().top;
      sections.forEach(([id]) => {
        const node = document.getElementById(`m6-${id}`);
        if (node && node.getBoundingClientRect().top - containerTop < 190) current = id;
      });
      setActiveSection(current);
      setReadSections((read) => ({ ...read, [current]: true }));
    };
    update();
    container.addEventListener("scroll", update, { passive: true });
    return () => container.removeEventListener("scroll", update);
  }, []);

  function markProgress(value, completed = false) {
    setProgress((prev) => {
      const next = structuredClone(prev);
      const alreadyDone = next.missions[6].completed;
      next.missions[6] = { progress: Math.max(next.missions[6].progress || 0, value), completed: alreadyDone || completed };
      writeProgress(next);
      return next;
    });
  }
  function scrollToSection(id) {
    document.getElementById(`m6-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function chooseObservation(value) {
    setObservation(value);
    if (value === "Mostly men") {
      notify("Exactly. The training data is not balanced.");
      markProgress(18);
    } else {
      notify("Look again at the training data: 9 out of 10 examples are male doctors.");
    }
  }
  function submitPrediction() {
    if (!predictionChoice) return;
    setPredictionSubmitted(true);
    markProgress(34);
    notify(predictionChoice === "Male" ? "Yes. The AI follows the pattern it saw most often." : "Good thinking. The key idea is that the biased data pushes the AI toward Male.");
  }
  function changeFixedRatio(value) {
    setFixedMaleCount(Number(value));
    markProgress(58);
  }
  function saveFixedRatio() {
    setSavedBiasData({ male: fixedMaleCount });
    setTurnAnswer("");
    setTurnSubmitted(false);
    markProgress(64);
    notify("Saved. Your Turn will now use this training data.");
    window.setTimeout(() => scrollToSection("turn"), 250);
  }
  function resetFixedRatio() {
    setFixedMaleCount(9);
    setSavedBiasData(null);
    setTurnAnswer("");
    setTurnSubmitted(false);
    notify("Reset to the original biased data.");
  }
  function submitTurn() {
    if (!savedBiasData) {
      notify("Save your adjusted training data first.");
      return;
    }
    if (!turnAnswer) return;
    setTurnSubmitted(true);
    if (turnAnswer === turnPrediction) {
      markProgress(74);
      notify(`Correct. With this saved data, the AI is most likely to predict ${turnPrediction}.`);
    } else {
      notify(`Look at your saved data again: it points most strongly toward ${turnPrediction}.`);
    }
  }
  function nextMatchColor(currentColors) {
    const palette = ["blue", "green", "orange", "purple"];
    return palette[Object.keys(currentColors).length % palette.length];
  }
  function chooseProblem(problem) {
    if (challengeDone) return;
    setSelectedProblem(problem);
    setMatchColors((current) => current[problem] ? current : { ...current, [problem]: nextMatchColor(current) });
    setChallengeResult("");
    setChallengeFeedback("");
  }
  function chooseSolution(solution) {
    if (!selectedProblem || challengeDone) {
      notify("Choose a problem first, then choose the fix you think matches it.");
      return;
    }
    setMatches((current) => ({ ...current, [selectedProblem]: solution }));
    setSelectedProblem("");
    setChallengeResult("");
    setChallengeFeedback("");
  }
  function removeMatch(problem) {
    if (challengeDone) return;
    setMatches((current) => {
      const next = { ...current };
      delete next[problem];
      return next;
    });
    setMatchColors((current) => {
      const next = { ...current };
      delete next[problem];
      return next;
    });
    setChallengeResult("");
    setChallengeFeedback("");
  }
  function checkChallenge() {
    const complete = challengeProblems.every((problem) => matches[problem]);
    if (!complete) {
      setChallengeResult("wrong");
      setChallengeFeedback("Match both problems with a way to reduce bias first.");
      return;
    }
    const allCorrect = challengeProblems.every((problem) => matches[problem] === challengePairs[problem]);
    if (allCorrect) {
      setChallengeResult("correct");
      setChallengeFeedback("Great. You fixed the data: add more kinds of people, and remove unfair ideas.");
      markProgress(90);
      notify("Mini challenge complete. Scroll to the summary.");
    } else {
      setChallengeResult("wrong");
      setChallengeFeedback("Try again. If the AI only saw one kind of person, show it more kinds. If the data has an unfair idea, remove or fix it.");
    }
  }
  function resetChallenge() {
    setSelectedProblem("");
    setMatches({});
    setMatchColors({});
    setChallengeResult("");
    setChallengeFeedback("");
    setHintVisible(false);
  }
  function challengeTone(value) {
    return value.includes("one kind of person") || value === "Show it more kinds of people" ? "diverse" : "stereotype";
  }
  function solutionMatchColor(solution) {
    const problem = challengeProblems.find((item) => matches[item] === solution);
    return problem ? matchColors[problem] : "";
  }
  function finishMission() {
    if (!nextReady) {
      notify("Observe, predict, balance the data, finish Your Turn, and complete the mini challenge first.");
      return;
    }
    markProgress(100, true);
    notify("Mission 6 complete. Opening the Final Challenge...");
    window.setTimeout(() => navigate("/final-challenge"), 500);
  }

  const timelineIndex = Math.max(0, sections.findIndex(([id]) => id === activeSection));

  return <MissionLayout mission={6} title="Can AI be biased?" subtitle={<>AI can reflect biases in its training data.<br />It’s important to understand and fix them.</>} robot="idea" bubbleText="Follow the data trail." progress={progress} notify={notify}>
    <section className="lesson-main course-flow mission6-flow">
      <section className="scenario-card bias-scenario mission6-scenario"><span>Scenario</span><div><strong>Q: Who is a doctor?</strong><p>Let’s follow how training data can turn into a biased prediction.</p></div><button className="outline" onClick={() => scrollToSection("observe")}>Start investigation ↓</button></section>

      <CourseSection id="m6-observe" n="1" title="Look at the training data" action={<button className="outline tiny-top" onClick={() => scrollToSection("observe")}>Top ↑</button>}>
        <p>This is all the training data the AI has seen.</p>
        <BiasTrainingBoard maleCount={9} femaleCount={1} malePercent={90} femalePercent={10} viewMode="people" />
        <div className="notice-question"><strong>What do you notice?</strong><div>{["Mostly men", "Equal numbers", "Mostly women"].map((item) => <button key={item} className={observation === item ? "selected" : ""} onClick={() => chooseObservation(item)}>{item}</button>)}</div></div>
        {observation && <div className={observation === "Mostly men" ? "section-complete" : "challenge-message wrong"}><Icon name={observation === "Mostly men" ? "check" : "alert"} />{observation === "Mostly men" ? "Exactly. The data is not balanced." : "Try looking at the counts again: there are many more male examples."}</div>}
      </CourseSection>

      <CourseSection id="m6-predict" n="2" title="What will the AI predict?">
        <p>Now ask the AI a new question and predict what pattern it might follow.</p>
        <div className="bias-predict-layout"><div><div className="bias-question-box"><small>Question</small><strong>Who is a doctor?</strong></div><div className="answer-grid bias-options">{["Male", "Female", "Both equally", "Impossible to know"].map((choice) => <button key={choice} disabled={predictionSubmitted} className={`${predictionChoice === choice ? "selected" : ""} ${predictionSubmitted && choice === "Male" ? "correct-choice" : ""} ${predictionSubmitted && predictionChoice === choice && choice !== "Male" ? "wrong-choice" : ""}`} onClick={() => setPredictionChoice(choice)}>{choice}{predictionSubmitted && choice === "Male" && <Icon name="check" />}</button>)}</div><button className="primary" disabled={!predictionChoice || predictionSubmitted} onClick={submitPrediction}>{predictionSubmitted ? "Submitted" : "Submit Prediction"}</button></div><div className={`prediction-meter ${predictionSubmitted ? "revealed" : "hidden-answer"}`}><small>{predictionSubmitted ? "AI is more likely to predict" : "AI is thinking about the pattern..."}</small><strong>{predictionSubmitted ? "Male" : "?"}</strong><span><b style={{ width: predictionSubmitted ? "90%" : "0%" }} /></span><em>{predictionSubmitted ? "90%" : "Make your prediction first"}</em></div></div>
        {predictionSubmitted && <div className="answer-feedback with-robot"><Mascot type="pointing" /><strong>The AI is more likely to predict: Male</strong><p>because it has seen many more male doctors. It is learning a pattern from data, not checking what is fair.</p></div>}
      </CourseSection>

      <CourseSection id="m6-why" n="3" title="Why is this happening?">
        <p>Bias appears when unbalanced training data becomes a repeated pattern.</p>
        <div className="bias-cause-flow"><BiasFlowStep icon={Database} tone="blue" title="Training Data" text="9 male examples, 1 female example" /><span>→</span><BiasFlowStep icon={BrainCircuit} tone="purple" title="Pattern" text="doctor often appears with male" /><span>→</span><BiasFlowStep icon={AlertTriangle} tone="red" title="Biased Prediction" text="AI may prefer male as the answer" /></div>
        <div className="ai-bias-brain"><div className="mini-avatar-cloud">{Array.from({ length: 9 }, (_, index) => <DoctorAvatar key={`brain-m-${index}`} gender="male" />)}<DoctorAvatar gender="female" /></div><Mascot type="detective" /><strong>doctor → male?</strong></div>
        <div className="lesson-hint"><Icon name="bulb" />The AI is learning patterns, not fairness.</div>
      </CourseSection>

      <CourseSection id="m6-fix" n="4" title="Let's fix the data">
        <p>Drag the slider. When the training data changes, the prediction changes too.</p>
        <BiasTrainingBoard maleCount={fixedMaleCount} femaleCount={fixedFemaleCount} malePercent={fixedMalePercent} femalePercent={fixedFemalePercent} viewMode="people" />
        <div className="ratio-control mission6-ratio"><p>Adjust the data ratio <small>(total people = 10)</small></p><div className="ratio-line"><span><DoctorAvatar gender="male" mini />Male: {fixedMaleCount}</span><input aria-label="Adjust male doctor count" type="range" min="0" max="10" step="1" value={fixedMaleCount} onChange={(event) => changeFixedRatio(event.target.value)} /><span><DoctorAvatar gender="female" mini />Female: {fixedFemaleCount}</span><button className="outline reset-ratio" onClick={resetFixedRatio}>↻ Reset</button></div><div className="slider-scale">{Array.from({ length: 6 }, (_, i) => <i key={i}>{i * 2}</i>)}</div></div>
        <div className={`bias-live-prediction ${balancedEnough ? "balanced" : ""}`}><Icon name={balancedEnough ? "check" : "alert"} /><div><small>Current prediction</small><strong>{fixedPrediction}</strong><span>Male {fixedMalePercent}% · Female {fixedFemalePercent}%</span></div></div>
        <div className="save-ratio-row"><button className="primary" onClick={saveFixedRatio}>Use this data for Your Turn</button>{savedBiasData && <span><Icon name="check" /> Saved: Male {savedBiasData.male * 10}% · Female {(10 - savedBiasData.male) * 10}%</span>}</div>
      </CourseSection>

      <CourseSection id="m6-turn" n="5" title="Your turn">
        <p>{savedBiasData ? "Use your saved training data. What is the AI most likely to predict now?" : "First save the ratio you adjusted above, then predict what the AI will answer."}</p>
        <div className="your-turn-bias"><div><strong>Your saved doctor training data</strong><div className="avatar-row large">{Array.from({ length: turnMaleCount }, (_, index) => <DoctorAvatar key={`turn-m-${index}`} gender="male" />)}{Array.from({ length: turnFemaleCount }, (_, index) => <DoctorAvatar key={`turn-f-${index}`} gender="female" />)}</div><p>Male: {turnMaleCount} ({turnMalePercent}%) · Female: {turnFemaleCount} ({turnFemalePercent}%)</p>{!savedBiasData && <small className="save-needed">No saved data yet. Go back to Step 4 and click “Use this data”.</small>}</div><div className="answer-grid bias-options">{["Male", "Female", "Both equally", "Impossible to know"].map((choice) => <button key={choice} disabled={!savedBiasData || turnSubmitted} className={`${turnAnswer === choice ? "selected" : ""} ${turnSubmitted && choice === turnPrediction ? "correct-choice" : ""} ${turnSubmitted && turnAnswer === choice && choice !== turnPrediction ? "wrong-choice" : ""}`} onClick={() => setTurnAnswer(choice)}>{choice}{turnSubmitted && choice === turnPrediction && <Icon name="check" />}</button>)}</div></div>
        <button className="primary" disabled={!savedBiasData || !turnAnswer || turnSubmitted} onClick={submitTurn}>{turnSubmitted ? "Submitted" : "Submit Answer"}</button>
        {turnSubmitted && <div className={turnDone ? "section-complete" : "challenge-message wrong"}><Icon name={turnDone ? "check" : "alert"} />{turnDone ? `Correct. The AI follows the saved data pattern and predicts ${turnPrediction}.` : `Try again: your saved data points most strongly toward ${turnPrediction}.`}</div>}
        {turnSubmitted && !turnDone && <button className="outline" onClick={() => { setTurnSubmitted(false); setTurnAnswer(""); }}>Try again</button>}
      </CourseSection>

      <CourseSection id="m6-challenge" n="6" title={<><Icon name="trophy" />Mini Challenge</>} action={<span className="section-pill">{Object.keys(matches).length} / {challengeProblems.length}</span>}>
        <p>Match each data problem with the best way to fix it.</p>
        <p className="mini-instruction">Pick a problem on the left. It gets a colour. Then pick the fix you think matches it.</p>
        <div className="bias-match-game"><div className="bias-problem-list">{challengeProblems.map((problem) => <button key={problem} className={`${selectedProblem === problem ? "selected" : ""} ${matches[problem] ? "matched" : ""} ${matchColors[problem] ? `match-tone-${matchColors[problem]}` : ""}`} disabled={challengeDone} onClick={() => chooseProblem(problem)}><Icon name="grid" /><span>{problem}</span>{matches[problem] && <em>{matches[problem]}</em>}</button>)}</div><div className="bias-solution-list">{challengeSolutions.map((solution) => <button key={solution} className={solutionMatchColor(solution) ? `matched match-tone-${solutionMatchColor(solution)}` : ""} disabled={challengeDone} onClick={() => chooseSolution(solution)}><Wrench aria-hidden="true" />{solution}</button>)}</div></div>
        {Object.keys(matches).length > 0 && <div className="match-review">{challengeProblems.map((problem) => matches[problem] && <button key={problem} className={matchColors[problem] ? `match-tone-${matchColors[problem]}` : ""} onClick={() => removeMatch(problem)} disabled={challengeDone}><strong>{problem}</strong><span>→ {matches[problem]}</span><small>Remove</small></button>)}</div>}
        {challengeResult && <div className={`challenge-message ${challengeResult}`}><Icon name={challengeResult === "correct" ? "check" : "alert"} />{challengeFeedback}</div>}
        {hintVisible && <p className="hint-line">Hint: If the AI only saw one kind of person, show it more kinds of people. If it learned an unfair idea, remove or fix that idea.</p>}
        <div className="challenge-actions course-actions"><button className="primary" disabled={challengeDone} onClick={checkChallenge}>Check Answer</button><button className="outline" onClick={() => setHintVisible(true)}>Need a hint?</button><button className="outline" onClick={resetChallenge}>Reset</button></div>
      </CourseSection>

      <CourseSection id="m6-summary" n="7" title="Summary: Building fair AI">
        <p>Bias can happen, but we can make AI fairer.</p>
        <div className="fair-ai-chain"><BiasSummary icon={Database} title="Training Data" text="What data we use shapes the AI." /><BiasSummary icon={BrainCircuit} title="Patterns" text="AI learns repeated patterns." /><BiasSummary icon={TrendingUp} title="Prediction" text="Patterns affect answers." /><BiasSummary icon={AlertTriangle} title="Bias" text="Unbalanced data can be unfair." /><BiasSummary icon={Scale} title="Balanced Data" text="Diverse data helps fix it." /><BiasSummary icon={Globe2} title="Fairer AI" text="Test and improve systems." /></div>
        <div className="summary-mascot fair-summary"><Mascot type="idea" /><strong>Great! You learned how bias happens and how we can reduce it.</strong></div>
      </CourseSection>
    </section>

    <aside className="lesson-side page-timeline mission6-side-panel" aria-label="On this page">
      <div className="card timeline-card"><h2>On this page</h2><span className="timeline-rail" style={{ "--progress": `${(timelineIndex / (sections.length - 1)) * 100}%` }} />{sections.map(([id, label], index) => {
        const IconComponent = sections[index][2];
        const active = activeSection === id;
        const read = Boolean(readSections[id]) || (id === "summary" && nextReady);
        return <button key={id} className={`${active ? "active" : ""} ${read ? "read" : ""}`} onClick={() => scrollToSection(id)}><span>{read && !active ? <Icon name="check" /> : index + 1}</span>{label}</button>;
      })}</div>
      <section className="card bias-process-card"><h2>Bias process</h2>{sections.slice(0, 6).map(([id, label, IconComponent], index) => <button key={id} className={`${readSections[id] ? "lit" : ""} ${activeSection === id ? "active" : ""}`} onClick={() => scrollToSection(id)}><span><IconComponent aria-hidden="true" /></span><strong>{label}</strong></button>)}</section>
      <section className="card did-you-know"><h2><Icon name="bulb" />Did you know?</h2><p>AI does not have opinions or beliefs. If training data is biased, it can learn and repeat those patterns.</p><Mascot type="reading" /></section>
    </aside>
    <footer className="course-bottom-nav"><button className="outline" onClick={() => navigate("/mission/5-training-data")}>‹ Previous</button><span>{nextReady ? "Mission 6 complete. Final Challenge is ready." : "Follow the cause → effect → solution chain."}</span><button className="primary" disabled={!nextReady} onClick={finishMission}>Start Final Challenge →</button></footer>
  </MissionLayout>;
}

function BiasFlowStep({ icon: IconComponent, tone, title, text }) {
  return <article className={`bias-flow-step ${tone}`}><span><IconComponent aria-hidden="true" /></span><strong>{title}</strong><p>{text}</p></article>;
}

function BiasSummary({ icon: IconComponent, title, text }) {
  return <article><span><IconComponent aria-hidden="true" /></span><strong>{title}</strong><p>{text}</p></article>;
}

function BiasTrainingBoard({ maleCount, femaleCount, malePercent, femalePercent, viewMode }) {
  return <div className="training-data-board">{viewMode === "people" ? <><section className="bias-group-panel male"><strong>Male doctors in training data</strong><div className="avatar-row">{Array.from({ length: maleCount }, (_, index) => <DoctorAvatar key={`m-${index}`} gender="male" />)}</div><p><span />{malePercent}% <small>({maleCount} out of 10)</small></p></section><section className="bias-group-panel female"><strong>Female doctors in training data</strong><div className="avatar-row">{Array.from({ length: femaleCount }, (_, index) => <DoctorAvatar key={`f-${index}`} gender="female" />)}</div><p><span />{femalePercent}% <small>({femaleCount} out of 10)</small></p></section></> : <section className="percentage-view"><div><strong>Male doctors</strong><span>{malePercent}%</span><i><b style={{ width: `${malePercent}%` }} /></i></div><div><strong>Female doctors</strong><span>{femalePercent}%</span><i><b style={{ width: `${femalePercent}%` }} /></i></div></section>}</div>;
}

function DoctorAvatar({ gender, mini = false }) {
  const isFemale = gender === "female";
  return <svg className={`doctor-avatar ${isFemale ? "female" : "male"} ${mini ? "mini" : ""}`} viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill={isFemale ? "#fff4dd" : "#eaf2ff"} /><path d="M9 42c2.8-7.2 8.2-10.8 15-10.8S36.2 34.8 39 42" fill={isFemale ? "#ffd36b" : "#3a86f6"} /><circle cx="24" cy="21" r="9.2" fill="#ffd2a4" /><path d={isFemale ? "M13.5 23c0-9.2 5.1-14.3 10.8-14.3S35 14 35 23v10.5c-2.7-1.3-5.3-2-7.8-2.2 2.8-1.4 4.5-4.2 4.5-7.3 0-3.1-1.6-5.7-4.2-7.1-4.4 3.2-8.4 3-11.8 1.3-1.3 1.5-2.2 3.6-2.2 4.8Z" : "M14.5 18.3c.7-5.5 4.5-9.2 9.9-9.2 5.8 0 9.4 3.3 9.8 8.8-3.3.3-6.7-.8-9.1-3.1-2.3 2.7-5.8 4-10.6 3.5Z"} fill={isFemale ? "#c5652f" : "#111b36"} /><circle cx="20.5" cy="22.3" r="1.5" fill="#111b36" /><circle cx="27.5" cy="22.3" r="1.5" fill="#111b36" /><path d="M20.8 27.1c2 1.6 4.3 1.6 6.4 0" fill="none" stroke="#111b36" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function missionIdFromRoute(route) {
  if (route.startsWith("/mission/5/") || route === "/mission/5-training-data") return 5;
  return missionData.find((mission) => mission.route === route)?.id || null;
}

function AccessGuardPage({ finalChallenge = false, navigate }) {
  return <div className="placeholder access-guard-page"><div className="card"><LockKeyhole /><h1>{finalChallenge ? "Final Challenge locked" : "Mission locked"}</h1><p>{finalChallenge ? "Complete all six missions to enter the Final Challenge." : "Complete the previous mission before opening this one."}</p><button className="primary" onClick={() => navigate("/missions")}>Back to Missions</button></div></div>;
}

function Shell({ route, progress, navigate, resetProgress, qaToolsVisible, qaMode, setQaMode, children }) {
  const isImmersivePage = route.startsWith("/mission/") || route === "/final-challenge";
  return <div className="app-shell"><Sidebar route={route} progress={progress} navigate={navigate} /><main className="page">{!isImmersivePage && <TopBar route={route} navigate={navigate} resetProgress={resetProgress} qaToolsVisible={qaToolsVisible} qaMode={qaMode} setQaMode={setQaMode} />}{children}</main></div>;
}

function PlaceholderPage({ route }) {
  return <div className="placeholder"><div className="card"><h1>{route.replace("/", "") || "Page"}</h1><p>This page is ready to build next. Progress and navigation already use the shared React system.</p></div></div>;
}

function resolveRuntimeRoute(pathname) {
  if (pathname === "/" || pathname === "/about" || pathname === "/glossary") return "/dashboard";
  if (pathname === "/token-lab") return "/ai-lab";
  return pathname;
}

function App() {
  const [route, setRoute] = useState(() => resolveRuntimeRoute(window.location.pathname));
  const [progress, setProgress] = useState(readProgress);
  const [toast, setToast] = useState("");
  const [qaToolsVisible, setQaToolsVisible] = useState(() => new URLSearchParams(window.location.search).get("qa") === "1");
  const [qaMode, setQaModeState] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("qa") === "1";
    return requested && sessionStorage.getItem("aiExplorerQaMode") !== "0";
  });

  function setQaMode(enabled) {
    const next = qaToolsVisible && Boolean(enabled);
    setQaModeState(next);
    sessionStorage.setItem("aiExplorerQaMode", next ? "1" : "0");
  }

  function navigate(next) {
    const target = new URL(next, window.location.origin);
    if (target.pathname === "/about" || target.pathname === "/glossary") target.pathname = "/";
    const resolvedRoute = resolveRuntimeRoute(target.pathname);
    if (qaToolsVisible) target.searchParams.set("qa", "1");
    setRoute(resolvedRoute);
    window.history.pushState({}, "", `${target.pathname}${target.search}`);
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
    if (window.location.pathname === "/about" || window.location.pathname === "/glossary") {
      const suffix = qaToolsVisible ? "?qa=1" : "";
      window.history.replaceState({}, "", `/${suffix}`);
    }
    if (window.location.pathname === "/token-lab") {
      const legacyParams = new URLSearchParams(window.location.search);
      legacyParams.set("stage", "tokenize");
      window.history.replaceState({}, "", `/ai-lab?${legacyParams.toString()}`);
    }
    const onPop = () => {
      const toolsVisible = new URLSearchParams(window.location.search).get("qa") === "1";
      const pathname = window.location.pathname;
      if (pathname === "/token-lab") {
        const legacyParams = new URLSearchParams(window.location.search);
        legacyParams.set("stage", "tokenize");
        window.history.replaceState({}, "", `/ai-lab?${legacyParams.toString()}`);
      }
      if (pathname === "/about" || pathname === "/glossary") {
        window.history.replaceState({}, "", `/${toolsVisible ? "?qa=1" : ""}`);
      }
      setRoute(resolveRuntimeRoute(pathname));
      setQaToolsVisible(toolsVisible);
      if (!toolsVisible) {
        setQaModeState(false);
        sessionStorage.removeItem("aiExplorerQaMode");
      }
    };
    const onNavigate = (event) => navigate(event.detail);
    window.addEventListener("popstate", onPop);
    window.addEventListener("navigate", onNavigate);
    return () => { window.removeEventListener("popstate", onPop); window.removeEventListener("navigate", onNavigate); };
  }, []);
  React.useEffect(() => {
    if (route !== "/badges") return;
    const suffix = qaToolsVisible ? "?qa=1" : "";
    window.history.replaceState({}, "", `/progress${suffix}`);
    setRoute("/progress");
  }, [route, qaToolsVisible]);

  let page;
  const missionId = missionIdFromRoute(route);
  if (route === "/dashboard") page = <Dashboard progress={progress} navigate={navigate} notify={notify} qaMode={qaMode} />;
  else if (route === "/missions") page = <MissionsPage progress={progress} navigate={navigate} notify={notify} qaMode={qaMode} />;
  else if (route === "/ai-lab") page = <TokenLabPage navigate={navigate} />;
  else if (route === "/progress") page = <ProgressPage progress={progress} navigate={navigate} notify={notify} qaMode={qaMode} />;
  else if (route === "/activity") page = <ActivityPage progress={progress} navigate={navigate} notify={notify} />;
  else if (missionId && !canAccessMission(progress, missionId, qaMode)) page = <AccessGuardPage navigate={navigate} />;
  else if (route === "/mission/1-tokenisation") page = <Mission1 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/2-next-token") page = <Mission2 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/3-hallucination") page = <Mission3 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/4-context") page = <Mission4 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/5-training-data" || route === "/mission/5/get-training-data") page = <Mission5 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/5/learn-patterns") page = <Mission5Patterns progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/5/make-predictions") page = <Mission5Predictions progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/mission/6-bias") page = <Mission6 progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else if (route === "/final-challenge" && !canAccessFinalChallenge(progress, qaMode)) page = <AccessGuardPage finalChallenge navigate={navigate} />;
  else if (route === "/final-challenge") page = <FinalChallenge progress={progress} setProgress={setProgress} navigate={navigate} notify={notify} />;
  else page = <PlaceholderPage route={route} />;
  return <Shell route={route} progress={progress} navigate={navigate} resetProgress={resetProgress} qaToolsVisible={qaToolsVisible} qaMode={qaMode} setQaMode={setQaMode}>{page}{toast && <div className="toast show">{toast}</div>}</Shell>;
}

createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
