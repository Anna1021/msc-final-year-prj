import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpenCheck,
  ChevronDown,
  CircleDot,
  GitBranch,
  Lightbulb,
  ListFilter,
  RefreshCw,
  Repeat2,
  Sparkles,
  Target
} from "lucide-react";
import { SCORE_PROBABILITY_CANDIDATES } from "./lesson4TeachingData.js";
import LivePredictionLab from "./LivePredictionLab.jsx";
import Mission1PagedKnowledgeQuiz from "../mission1/Mission1PagedKnowledgeQuiz.jsx";
import { createMission4QuizCopy } from "./mission4QuizCopy.js";

const IDEA_ICONS = [GitBranch, ListFilter, Target, Repeat2];
const ORDER_STEPS = ["compare", "choose", "add", "repeat"];
const candidateLabel = (t, id) => t(`mission4.teachingCandidates.${id}`);

function TechnicalWord({ t, page, term, children, visual, guideTarget }) {
  const [open, setOpen] = useState(true);
  const id = `l4-page-${page}-technical`;
  return <details className="l4-new-technical" data-guide-target={guideTarget} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary aria-expanded={open} aria-controls={id}><span><BookOpenCheck />{t("mission4.sidebar.technicalWord")}</span><strong>{term}</strong><ChevronDown /></summary>
    <div id={id}><p>{children}</p>{visual}</div>
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

export function Lesson4ScorePage({ active, t, onComplete }) {
  const completionRecorded = useRef(false);
  useEffect(() => {
    if (active && !completionRecorded.current) {
      completionRecorded.current = true;
      onComplete?.();
    }
  }, [active, onComplete]);
  const scoreVisual = <div className="l4-score-key-visual" aria-hidden="true"><i /><i /><i /><i /><i /></div>;
  const sidebar = <aside className="l4-new-sidebar l4-score-sidebar" aria-label={t("mission4.sidebar.learningNotes")}>
    <TechnicalWord t={t} page={2} term={t("mission4.scorePage.term")} visual={scoreVisual}>{t("mission4.scorePage.technical")}</TechnicalWord>
    <section className="l4-score-source"><header><span>?</span><h3>{t("mission4.scorePage.sourceTitle")}</h3></header><p>{t("mission4.scorePage.sourceCopy")}</p><p>{t("mission4.scorePage.sourceCompare")}</p><div className="l4-score-source-flow" aria-hidden="true"><span>{t("mission4.scorePage.processedShort")}</span><b>+</b><span>{t("mission4.scorePage.patternsShort")}</span><ArrowDown /><strong>{t("mission4.scorePage.scoresShort")}</strong></div><small>{t("mission4.scorePage.noCalculation")}</small></section>
  </aside>;
  return <section hidden={!active} className="l4-new-page l4-score-page"><LearningLayout sidebar={sidebar}>
    <header className="l4-score-heading"><span className="l4-score-number">2</span><div><small className="l4-section-kicker">{t("mission4.scorePage.possible")}</small><p>{t("mission4.scorePage.intro1")}</p><p>{t("mission4.scorePage.intro2Before")} <strong>{t("mission4.scorePage.termLower")}</strong> {t("mission4.scorePage.intro2After")}</p></div></header>
    <article className="l4-score-card">
      <section className="l4-score-context"><h2>{t("mission4.scorePage.prompt")}</h2><div>{t("mission4.scorePage.promptTokens").split("|").map((token, index) => <span className={`tone-${["purple", "pink", "blue", "green", "purple"][index]}`} key={token + index}>{token}</span>)}</div></section>
      <div className="l4-score-rule" />
      <h3>{t("mission4.scorePage.possible")}</h3>
      <div className="l4-score-comparison">
        <div className="l4-score-rows">{SCORE_PROBABILITY_CANDIDATES.slice(0, -1).map((item) => <div className={`l4-score-row tone-${item.tone}`} key={item.token}><span>{candidateLabel(t, item.token)}</span><i aria-hidden="true"><b style={{ width: `${item.scoreWidth}%` }} /></i></div>)}<div className="l4-score-more">…</div></div>
        <div className="l4-score-guide" aria-label={`${t("mission4.scorePage.higher")} / ${t("mission4.scorePage.lower")}`}><span>{t("mission4.scorePage.higher")}</span><i /><span>{t("mission4.scorePage.lower")}</span></div>
        <aside className="l4-score-explanation"><Sparkles /><p><strong>{t("mission4.scorePage.different")}</strong><span>{t("mission4.scorePage.higherMeans")}</span><small>{t("mission4.scorePage.notProbability")}</small></p></aside>
      </div>
      <footer>{t("mission4.scorePage.illustrative")}</footer>
    </article>
  </LearningLayout></section>;
}

function ProcessedRepresentation({ label }) {
  return <div className="l4-p1-representation" aria-label={label}>
    <span /><span /><span className="wide" /><span /><span />
    <span /><span className="wide" /><span /><span /><span />
    <span /><span /><span /><span className="wide" /><span />
  </div>;
}

export function Lesson4NewPage1({ active, t }) {
  const predictionVisual = <div className="l4-p1-orb" aria-hidden="true"><span>?</span><i /><i /></div>;
  const sidebar = <aside className="l4-new-sidebar l4-p1-sidebar" aria-label={t("mission4.sidebar.learningNotes")}>
    <TechnicalWord t={t} page={1} term={t("mission4.page1.term")} visual={predictionVisual} guideTarget="lesson4-technical-word">{t("mission4.page1.technical")}</TechnicalWord>
    <section className="l4-p1-think"><BookOpenCheck /><div><h3>{t("mission4.page1.thinkTitle")}</h3><p>{t("mission4.page1.thinkCopy")}</p><strong>{t("mission4.page1.thinkNext")}</strong></div></section>
  </aside>;
  return <section hidden={!active} className="l4-new-page l4-p1-page"><LearningLayout sidebar={sidebar}>
    <header className="l4-p1-heading"><span className="l4-p1-number">1</span><div><small className="l4-section-kicker">{t("mission4.page1.term")}</small><p>{t("mission4.page1.bridgeLine1")}</p><p>{t("mission4.page1.bridgeLine2")}</p><strong>{t("mission4.page1.bridgeEmphasis")}</strong></div></header>
    <article className="l4-p1-card">
      <div className="l4-p1-flow">
        <section><h2>{t("mission4.page1.processed")}</h2><p>{t("mission4.page1.processedCopy")}</p></section>
        <ProcessedRepresentation label={t("mission4.page1.processedVisualLabel")} />
        <ArrowRight className="l4-p1-arrow" aria-hidden="true" />
        <div className="l4-p1-question" aria-hidden="true">?</div>
        <section><h2>{t("mission4.page1.whatNext")}</h2><p>{t("mission4.page1.whatNextCopy")}</p></section>
      </div>
      <div className="l4-p1-takeaway"><Lightbulb /><p><strong>{t("mission4.page1.keyIdea1")}</strong><span>{t("mission4.page1.keyIdea2")}</span></p></div>
    </article>
  </LearningLayout></section>;
}

export function Lesson4NewPage2({ active, t, onComplete }) {
  const completionRecorded = useRef(false);
  useEffect(() => {
    if (active && !completionRecorded.current) {
      completionRecorded.current = true;
      onComplete?.();
    }
  }, [active, onComplete]);
  const sidebar = <aside className="l4-new-sidebar l4-probability-sidebar" aria-label={t("mission4.sidebar.learningNotes")}>
    <TechnicalWord t={t} page={3} term={t("mission4.probabilityPage.term")} visual={<ProbabilityKeywordVisual />}>{t("mission4.probabilityPage.technical")}</TechnicalWord>
    <section className="l4-probability-why"><header><CircleDot /><h3>{t("mission4.probabilityPage.whyTitle")}</h3></header><p>{t("mission4.probabilityPage.whyCopy1")}</p><p>{t("mission4.probabilityPage.whyCopy2")}</p><strong>{t("mission4.probabilityPage.whyRemember")}</strong></section>
  </aside>;
  return <section hidden={!active} className="l4-new-page l4-probability-page"><LearningLayout sidebar={sidebar}>
    <header className="l4-probability-heading"><span className="l4-probability-number">3</span><div><small className="l4-section-kicker">{t("mission4.probabilityPage.term")}</small><p>{t("mission4.probabilityPage.intro1")}</p><p>{t("mission4.probabilityPage.intro2Before")} <strong>{t("mission4.probabilityPage.termLower")}</strong> {t("mission4.probabilityPage.intro2After")}</p></div></header>
    <article className="l4-probability-card">
      <div className="l4-probability-comparison">
        <section><header><h2>{t("mission4.probabilityPage.scoresTitle")}</h2><small>{t("mission4.probabilityPage.scoresNote")}</small></header><ProbabilityScoreRows t={t} /></section>
        <ArrowRight className="l4-probability-arrow" aria-hidden="true" />
        <section className="l4-probability-list"><header><h2>{t("mission4.probabilityPage.probabilitiesTitle")}</h2><small>{t("mission4.probabilityPage.probabilitiesNote")}</small></header><ProbabilityChanceRows t={t} /><aside>{t("mission4.probabilityPage.total")}</aside></section>
      </div>
      <footer><div><Sparkles /><div><h3>{t("mission4.probabilityPage.guaranteeTitle")}</h3><p>{t("mission4.probabilityPage.guaranteeLine1")}</p><p>{t("mission4.probabilityPage.guaranteeLine2")}</p><p>{t("mission4.probabilityPage.guaranteeLine3")}</p></div></div><ProbabilityChoiceVisual t={t} /></footer>
      <small className="l4-probability-illustrative">{t("mission4.probabilityPage.illustrative")}</small>
    </article>
  </LearningLayout></section>;
}

function ProbabilityScoreRows({ t }) {
  return <div className="l4-probability-rows">{SCORE_PROBABILITY_CANDIDATES.map((item) => <div className={`tone-${item.tone}`} key={item.token}><span>{candidateLabel(t, item.token)}</span><i aria-hidden="true"><b style={{ width: `${item.scoreWidth}%` }} /></i></div>)}</div>;
}

function ProbabilityChanceRows({ t }) {
  return <div className="l4-probability-rows l4-probability-chance-rows">{SCORE_PROBABILITY_CANDIDATES.map((item) => <div className={`tone-${item.tone}`} key={item.token}><span>{candidateLabel(t, item.token)}</span><i aria-hidden="true"><b style={{ width: `${item.probability / 46 * 100}%` }} /></i><strong>{item.probability}%</strong></div>)}</div>;
}

function ProbabilityKeywordVisual() {
  return <div className="l4-probability-key-visual" aria-hidden="true"><b>%</b><i /><i /><i /><i /><i /></div>;
}

function ProbabilityChoiceVisual({ t }) {
  return <div className="l4-probability-choice-visual" aria-hidden="true">{SCORE_PROBABILITY_CANDIDATES.slice(0, 4).map((item) => <span className={`tone-${item.tone}`} key={item.token}><b>{item.probability}%</b>{candidateLabel(t, item.token)}</span>)}<i>?</i></div>;
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
    <header className="l4-live-section-heading"><span className="l4-score-number">4</span><small className="l4-section-kicker">{t("mission4.live.badge")}</small></header>
    <LiveLabErrorBoundary t={t} onComplete={onComplete} />
  </LearningLayout></section>;
}

export function Lesson4NewPage4({ active, t, onComplete, onContinue }) {
  const quizCopy = createMission4QuizCopy(t);
  return <Mission1PagedKnowledgeQuiz
    active={active}
    copy={{ ...quizCopy, quizTitle: quizCopy.conceptCheckpoint }}
    resetKey={active}
    onResultChange={(result) => { if (result === "correct") onComplete?.(); }}
    onContinue={onContinue}
    pageNumber={5}
    lessonClassName="lesson-4-paged__lesson"
    guideTarget="lesson-quiz"
    showLesson1Visuals={false}
    showCorrectAnswer
  />;
}
