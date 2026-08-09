import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Check,
  ChevronDown,
  CircleDot,
  GitBranch,
  Lightbulb,
  ListFilter,
  Play,
  RefreshCw,
  Repeat2,
  Sparkles,
  Target
} from "lucide-react";
import { CAT_CANDIDATES, CAT_PROMPT } from "./lesson4TeachingData.js";
import LivePredictionLab from "./LivePredictionLab.jsx";

const IDEA_ICONS = [GitBranch, ListFilter, Target, Repeat2];
const PAGE_ROBOTS = ["missions-robot-target.png", "mission-robot-pointing.png", "mission5-robot-training.png", "missions-robot-target.png"];
const ORDER_STEPS = ["compare", "choose", "add", "repeat"];

function PageHeading({ t, page }) {
  return <header className="l4-new-heading"><div><small>{t("mission4.shell.lessonCount")}</small><h1>{t(`mission4.page${page}.title`)}</h1><p>{t(`mission4.page${page}.subtitle`)}</p></div><img src={`/assets/img/${PAGE_ROBOTS[page - 1]}`} alt="" aria-hidden="true" /></header>;
}

function TechnicalWord({ t, page, term, children }) {
  const [open, setOpen] = useState(true);
  const id = `l4-page-${page}-technical`;
  return <details className="l4-new-technical" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary aria-expanded={open} aria-controls={id}><span><BookOpenCheck />{t("mission4.sidebar.technicalWord")}</span><strong>{term}</strong><ChevronDown /></summary>
    <div id={id}><p>{children}</p></div>
  </details>;
}

function LearningSidebar({ t, page, term, children, extra }) {
  return <aside className="l4-new-sidebar" aria-label={t("mission4.sidebar.learningNotes")}>
    <section className="l4-new-key-ideas"><header><Lightbulb /><div><h3>{t("mission4.sidebar.keyIdeas")}</h3><p>{t("mission4.sidebar.keyIdeasHint")}</p></div></header><ul>{[1, 2, 3, 4].map((number, index) => { const Icon = IDEA_ICONS[index]; return <li key={number}><span><Icon /></span>{t(`mission4.sidebar.page${page}.idea${number}`)}</li>; })}</ul></section>
    {term && <TechnicalWord t={t} page={page} term={term}>{children}</TechnicalWord>}
    {extra}
  </aside>;
}

function LearningLayout({ children, sidebar }) {
  return <div className="l4-new-layout"><main className="l4-new-main">{children}</main>{sidebar}</div>;
}

function Prompt({ suffix = "___" }) {
  return <div className="l4-new-prompt"><small>Processed context</small><strong>{CAT_PROMPT} <em>{suffix}</em></strong></div>;
}

function ProbabilityRows({ selected = "", interactive = false, onSelect }) {
  const maximum = Math.max(...CAT_CANDIDATES.map((item) => item.probability));
  return <div className="l4-new-distribution" role={interactive ? "group" : undefined} aria-label={interactive ? "Candidate Token probabilities" : undefined}>{CAT_CANDIDATES.map((item) => <button type="button" disabled={!interactive} aria-pressed={interactive ? selected === item.token : undefined} className={`tone-${item.tone} ${selected === item.token ? "is-selected" : ""}`} onClick={() => onSelect?.(item.token)} key={item.token}><span>{item.token}</span><i aria-hidden="true"><b style={{ width: `${(item.probability / maximum) * 100}%` }} /></i><strong>{item.probability}%</strong></button>)}</div>;
}

function TeachingLabel({ t }) {
  return <p className="l4-new-teaching-label"><CircleDot />{t("mission4.labels.reviewedProbabilities")}</p>;
}

function Takeaway({ children }) {
  return <div className="l4-new-takeaway"><Check /><p>{children}</p></div>;
}

export function Lesson4NewPage1({ active, t, onComplete }) {
  const [revealed, setRevealed] = useState(false);
  function reveal() { setRevealed(true); onComplete?.(); }
  return <section hidden={!active} className="l4-new-page l4-new-page-one"><LearningLayout sidebar={<LearningSidebar t={t} page={1} term={t("mission4.page1.term")}>{t("mission4.page1.technical")}</LearningSidebar>}>
    <PageHeading t={t} page={1} />
    <div className={`l4-new-prediction-story ${revealed ? "is-revealed" : ""}`}>
      <div className="l4-new-flow-label"><span>{t("mission4.page1.processed")}</span><ArrowRight /><span>{t("mission4.page1.candidates")}</span><ArrowRight /><span>{t("mission4.page1.scores")}</span><ArrowRight /><strong>{t("mission4.page1.probabilities")}</strong></div>
      <Prompt />
      <section className="l4-new-candidate-preview" aria-label={t("mission4.page1.possible")}>{CAT_CANDIDATES.map((item) => <span className={`tone-${item.tone}`} key={item.token}>{item.token}</span>)}</section>
      {!revealed ? <button type="button" className="primary l4-new-reveal" onClick={reveal}><BarChart3 />{t("mission4.actions.showScores")}</button> : <ProbabilityRows />}
      <TeachingLabel t={t} />
    </div>
    <Takeaway>{t("mission4.page1.takeaway")}</Takeaway>
  </LearningLayout></section>;
}

function chooseByChance() {
  const threshold = Math.random() * 100;
  let total = 0;
  for (const candidate of CAT_CANDIDATES) {
    total += candidate.probability;
    if (threshold <= total) return candidate.token;
  }
  return CAT_CANDIDATES.at(-1).token;
}

export function Lesson4NewPage2({ active, t, onComplete }) {
  const [mode, setMode] = useState("greedy");
  const [selected, setSelected] = useState("");
  const [appended, setAppended] = useState(false);
  function changeMode(next) { setMode(next); setSelected(""); setAppended(false); }
  function runSelection() {
    const token = mode === "greedy" ? CAT_CANDIDATES.reduce((best, item) => item.probability > best.probability ? item : best).token : chooseByChance();
    setSelected(token);
    setAppended(false);
  }
  function append() {
    if (!selected) return;
    setAppended(true);
    onComplete?.();
  }
  return <section hidden={!active} className="l4-new-page l4-new-page-two"><LearningLayout sidebar={<LearningSidebar t={t} page={2} term={t("mission4.page2.term")}>{t("mission4.page2.technical")}</LearningSidebar>}>
    <PageHeading t={t} page={2} />
    <div className="l4-new-selection-machine">
      <Prompt />
      <ProbabilityRows selected={selected} />
      <div className="l4-new-mode-switch" role="group" aria-label={t("mission4.page2.modeLabel")}><button type="button" aria-pressed={mode === "greedy"} onClick={() => changeMode("greedy")}><Target /><strong>{t("mission4.live.mostLikely")}</strong><small>{t("mission4.live.greedyTerm")}</small></button><button type="button" aria-pressed={mode === "sampling"} onClick={() => changeMode("sampling")}><CircleDot /><strong>{t("mission4.live.chanceBased")}</strong><small>{t("mission4.live.samplingTerm")}</small></button></div>
      <button type="button" className="primary l4-new-run-selection" onClick={runSelection}><Play />{t("mission4.page2.runSelection")}</button>
      {selected && <section className="l4-new-selected-token" aria-live="polite"><small>{t("mission4.page2.selectedToken")}</small><strong>{selected}</strong><p>{t(mode === "greedy" ? "mission4.page2.greedyExplanation" : "mission4.page2.samplingExplanation")}</p>{!appended && <button type="button" className="primary" onClick={append}>{t("mission4.page2.addToken")} <ArrowDown /></button>}</section>}
      {appended && <section className="l4-new-appended-context" aria-live="polite"><small>{t("mission4.page2.updatedContext")}</small><strong>{CAT_PROMPT} {selected} <em>___</em></strong><p>{t("mission4.page2.predictAgain")}</p></section>}
      <TeachingLabel t={t} />
    </div>
    <Takeaway>{t("mission4.page2.takeaway")}</Takeaway>
  </LearningLayout></section>;
}

class LiveLabErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null, retryKey: 0 }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error("Lesson 4 Live Lab render failure", error); }
  retry = () => this.setState((current) => ({ error: null, retryKey: current.retryKey + 1 }));
  render() {
    if (this.state.error) return <div className="l4-live-boundary-error" role="alert"><CircleDot /><div><strong>{this.props.t("mission4.live.errorTitle")}</strong><p>{this.props.t("mission4.live.errorHelp")}</p></div><button type="button" className="outline" onClick={this.retry}><RefreshCw />{this.props.t("mission4.live.retry")}</button></div>;
    return <LivePredictionLab key={this.state.retryKey} t={this.props.t} onSuccessfulPrediction={this.props.onComplete} />;
  }
}

export function Lesson4NewPage3({ active, t, onComplete }) {
  const modelNote = <section className="l4-new-model-note"><strong>{t("mission4.live.modelBoundaryTitle")}</strong><p>{t("mission4.live.modelBoundary")}</p></section>;
  return <section hidden={!active} className="l4-new-page l4-new-page-three"><LearningLayout sidebar={<LearningSidebar t={t} page={3} term={t("mission4.live.temperatureTerm")} extra={modelNote}>{t("mission4.live.temperatureTechnical")}</LearningSidebar>}>
    <PageHeading t={t} page={3} />
    <LiveLabErrorBoundary t={t} onComplete={onComplete} />
  </LearningLayout></section>;
}

function QuizChoice({ selected, children, onClick }) {
  return <button type="button" aria-pressed={selected} onClick={onClick}>{children}</button>;
}

export function Lesson4NewPage4({ active, t, onComplete }) {
  const [answer, setAnswer] = useState("");
  const complete = answer === "updated-context";
  const announcedRef = useRef(false);
  useEffect(() => { if (complete && !announcedRef.current) { announcedRef.current = true; onComplete?.(); } }, [complete, onComplete]);
  function resetQuiz() { setAnswer(""); announcedRef.current = false; }
  return <section hidden={!active} className="l4-new-page l4-new-page-four"><LearningLayout sidebar={<LearningSidebar t={t} page={4} term="">{null}</LearningSidebar>}>
    <PageHeading t={t} page={4} />
    <div className="l4-new-quiz">
      <header><span><BookOpenCheck />{t("mission4.page4.badge")}</span><h2>{t("mission4.page4.heading")}</h2><p>{t("mission4.page4.intro")}</p></header>
      <section><strong>{t("mission4.page4.afterAdded")}</strong><div role="group" aria-label={t("mission4.page4.afterAdded")}><QuizChoice selected={answer === "planned"} onClick={() => setAnswer("planned")}>{t("mission4.page4.answerPlanned")}</QuizChoice><QuizChoice selected={answer === "updated-context"} onClick={() => setAnswer("updated-context")}>{t("mission4.page4.answerContext")}</QuizChoice><QuizChoice selected={answer === "training"} onClick={() => setAnswer("training")}>{t("mission4.page4.answerTraining")}</QuizChoice></div></section>
      {complete && <div className="l4-new-final-loop" role="status"><div>{ORDER_STEPS.map((step, index) => <React.Fragment key={step}><span>{t(`mission4.page4.${step}`)}</span>{index < ORDER_STEPS.length - 1 ? <ArrowRight /> : <Repeat2 />}</React.Fragment>)}</div><strong>{t("mission4.page4.discovery")}</strong></div>}
      {!complete && answer && <p className="l4-new-quiz-guidance" aria-live="polite">{t("mission4.page4.guidance")}</p>}
      <button type="button" className="outline l4-new-quiz-reset" onClick={resetQuiz}><RefreshCw />{t("mission4.page4.restart")}</button>
    </div>
  </LearningLayout></section>;
}
