import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Cpu,
  Eye,
  GitBranch,
  Layers3,
  Lightbulb,
  MapPin,
  Network,
  Play,
  RefreshCw,
  ScanLine,
  Sparkles
} from "lucide-react";
import {
  LESSON_3_CONNECTIONS,
  LESSON_3_DOG_TOKENS,
  LESSON_3_POSITION_SENTENCES,
  LESSON_3_PROCESS_EXAMPLE
} from "./lesson3TeachingData.js";

const IDEA_ICONS = [Eye, Network, Layers3, Lightbulb];
const PAGE_ROBOTS = ["mission3-robot-hallucination.png", "mission-robot-pointing.png", "mission3-robot-hallucination.png", "mission-robot-pointing.png", "mission3-robot-hallucination.png", "mission-robot-reading.png"];

function PageHeading({ t, page }) {
  return <header className="l3-page-heading"><div><small>{t("mission3.shell.lessonCount")}</small><h1>{t(`mission3.page${page}.title`)}</h1><p>{t(`mission3.page${page}.subtitle`)}</p></div><img src={`/assets/img/${PAGE_ROBOTS[page - 1]}`} alt="" aria-hidden="true" /></header>;
}

function Takeaway({ children }) {
  return <div className="l3-takeaway" role="status"><span><Check size={18} /></span><p>{children}</p></div>;
}

function Bridge({ label, children }) {
  return <div className="l3-bridge"><small>{label}</small><ChevronRight size={17} /><p>{children}</p></div>;
}

function TechnicalVisual({ type }) {
  if (type === "attention") return <svg className="l3-tech-visual is-attention" viewBox="0 0 220 70" aria-hidden="true"><circle cx="24" cy="18" r="8" /><circle cx="24" cy="52" r="8" /><circle cx="195" cy="35" r="11" /><path className="strong" d="M34 18 C90 18 126 29 182 35" /><path className="light" d="M34 52 C92 52 132 42 182 35" /></svg>;
  if (type === "representation") return <div className="l3-tech-visual is-representation" aria-hidden="true"><span>“dog”</span><b>+</b><span>“tired”</span><b>+</b><span>“slept”</span><ArrowRight /><strong>updated</strong></div>;
  if (type === "position") return <div className="l3-tech-visual is-position" aria-hidden="true"><p><span>dog</span><ArrowRight /><span>chased</span><ArrowRight /><span>cat</span></p><p><span>cat</span><ArrowRight /><span>chased</span><ArrowRight /><span>dog</span></p></div>;
  if (type === "process") return <div className="l3-tech-visual is-process" aria-hidden="true">{[Eye, Network, Layers3, Sparkles].map((Icon, index) => <React.Fragment key={index}><span><Icon /></span>{index < 3 && <i />}</React.Fragment>)}</div>;
  return <div className="l3-tech-visual is-transformer" aria-hidden="true"><span>Tokens</span><ArrowRight /><strong>Transformer</strong><ArrowRight /><span>Updated</span></div>;
}

function TechnicalWord({ id, label, term, visual, children }) {
  const [open, setOpen] = useState(true);
  const panelId = `${id}-panel`;
  return <details className="l3-technical-word" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary aria-expanded={open} aria-controls={panelId}>
      <span><BookOpenCheck size={16} />{label}</span>
      <strong>{term}</strong>
      <ChevronDown className="l3-technical-chevron" aria-hidden="true" />
    </summary>
    <div id={panelId} className="l3-technical-panel"><p>{children}</p><TechnicalVisual type={visual} /></div>
  </details>;
}

function KeyIdeas({ t, page }) {
  return <section className="l3-key-ideas" aria-labelledby={`l3-page-${page}-ideas`}>
    <header><Lightbulb aria-hidden="true" /><div><h3 id={`l3-page-${page}-ideas`}>{t("mission3.sidebar.keyIdeas")}</h3><p>{t("mission3.sidebar.keyIdeasHint")}</p></div></header>
    <ul>{[1, 2, 3, 4].map((number, index) => {
      const Icon = IDEA_ICONS[index];
      return <li key={number}><span><Icon aria-hidden="true" /></span>{t(`mission3.sidebar.page${page}.idea${number}`)}</li>;
    })}</ul>
  </section>;
}

function LearningSidebar({ t, page, term, visual, label, children }) {
  return <aside className="l3-learning-sidebar" aria-label={t("mission3.sidebar.learningNotes")}>
    <KeyIdeas t={t} page={page} />
    <TechnicalWord id={`l3-page-${page}-technical`} label={label || t("mission3.labels.technicalWord")} term={term} visual={visual}>{children}</TechnicalWord>
  </aside>;
}

function SummarySidebar({ t }) {
  return <aside className="l3-learning-sidebar l3-summary-sidebar" aria-label={t("mission3.sidebar.learningNotes")}>
    <section className="l3-key-ideas" aria-labelledby="l3-recap-heading"><header><Check aria-hidden="true" /><div><h3 id="l3-recap-heading">{t("mission3.sidebar.recap")}</h3><p>{t("mission3.sidebar.recapHint")}</p></div></header><ul>{[1, 2, 3, 4].map((number, index) => { const Icon = IDEA_ICONS[index]; return <li key={number}><span><Icon aria-hidden="true" /></span>{t(`mission3.page6.point${number}`)}</li>; })}</ul></section>
    <section className="l3-up-next"><small>{t("mission3.page6.nextLabel")}</small><strong>{t("mission3.page6.nextTitle")}</strong><p>{t("mission3.page6.next")}</p></section>
  </aside>;
}

function LearningLayout({ children, sidebar }) {
  return <div className="l3-learning-layout"><div className="l3-learning-main">{children}</div>{sidebar}</div>;
}

function AccuracyNote({ children }) {
  return <p className="l3-accuracy-note"><CircleDot aria-hidden="true" />{children}</p>;
}

function TokenRow({ tokens, target = "", active = [], softActive = [], subdued = false, label }) {
  return <div className="l3-token-row" role="list" aria-label={label}>{tokens.map((token, index) => {
    const id = `${token.toLowerCase()}-${index}`;
    const isTarget = token.toLowerCase() === target.toLowerCase();
    const isActive = active.includes(token.toLowerCase());
    const isSoftActive = softActive.includes(token.toLowerCase());
    return <span role="listitem" className={`${isTarget ? "is-target" : ""} ${isActive ? "is-active" : ""} ${isSoftActive ? "is-soft-active" : ""} ${subdued && !isTarget && !isActive && !isSoftActive ? "is-subdued" : ""}`} key={id}><i aria-hidden="true" />{token}</span>;
  })}</div>;
}

function Representation({ activeCount = 0, updated = false, token = "dog", t }) {
  return <div className={`l3-representation ${updated ? "is-updated" : ""}`} aria-label={t("mission3.labels.simplifiedRepresentation")}>
    <div><small>{t("mission3.labels.simplifiedRepresentation")}</small><strong>{updated ? t("mission3.labels.updatedRepresentation", { token }) : t("mission3.labels.representationOfToken", { token })}</strong>{updated && <em>{t("mission3.labels.updatedIncludesContext")}</em>}</div>
    <div className="l3-representation-bars" aria-hidden="true">{[0, 1, 2, 3].map((bar) => <i className={bar < activeCount ? "is-lit" : ""} key={bar} />)}</div>
  </div>;
}

export function Lesson3Page1({ active, t }) {
  const [flowStep, setFlowStep] = useState(0);
  const [running, setRunning] = useState(false);
  const flowTimerRef = useRef(null);
  const processed = flowStep >= 3;
  useEffect(() => () => window.clearTimeout(flowTimerRef.current), []);
  useEffect(() => {
    if (!running) return undefined;
    if (flowStep >= 3) { setRunning(false); return undefined; }
    flowTimerRef.current = window.setTimeout(() => setFlowStep((current) => current + 1), 520);
    return () => window.clearTimeout(flowTimerRef.current);
  }, [running, flowStep]);
  function showInformationFlow() {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setFlowStep(3); setRunning(false); return; }
    setFlowStep(1); setRunning(true);
  }
  return <section hidden={!active} className="lesson-3-page l3-page-one"><LearningLayout sidebar={<LearningSidebar t={t} page={1} term="Transformer" visual="transformer">{t("mission3.page1.technical")}</LearningSidebar>}>
    <PageHeading t={t} page={1} />
    <div className={`l3-transformer-stage ${processed ? "is-processed" : ""}`}>
      <div className="l3-stage-label"><ScanLine size={18} />{t("mission3.labels.insideContext")}</div>
      <TokenRow tokens={LESSON_3_DOG_TOKENS} target="dog" active={[flowStep >= 1 ? "tired" : "", flowStep >= 2 ? "slept" : ""]} softActive={flowStep >= 3 ? ["beside"] : []} label={t("mission3.page1.tokenLabel")} />
      <div className="l3-transformer-machine"><div className="l3-machine-input"><small>{t("mission3.page1.before")}</small><Representation t={t} activeCount={1} /></div><ArrowRight aria-hidden="true" /><div className="l3-machine-core"><div className="l3-context-signals" aria-hidden="true"><span className={flowStep >= 1 ? "is-active is-description" : ""}>tired<small>{flowStep >= 1 ? t("mission3.page1.descriptionInfo") : ""}</small></span><span className={flowStep >= 2 ? "is-active is-action" : ""}>slept<small>{flowStep >= 2 ? t("mission3.page1.actionInfo") : ""}</small></span><span className={flowStep >= 3 ? "is-active is-light" : ""}>beside<small>{flowStep >= 3 ? t("mission3.page1.lighterInfo") : ""}</small></span></div><svg className="l3-p1-signal-lines" viewBox="0 0 240 84" aria-hidden="true"><path className={flowStep >= 1 ? "is-active is-description" : ""} d="M36 10 C42 42 82 50 120 74" /><path className={flowStep >= 2 ? "is-active is-action" : ""} d="M120 10 V74" /><path className={flowStep >= 3 ? "is-active is-light" : ""} d="M204 10 C196 42 158 50 120 74" /></svg><Network aria-hidden="true" /><strong>Transformer</strong><small>{t("mission3.page1.machineAction")}</small></div><ArrowRight aria-hidden="true" /><div className="l3-machine-output"><small>{t("mission3.page1.after")}</small><Representation t={t} activeCount={Math.min(4, flowStep + 1)} updated={processed} /></div></div>
      {!processed && <button type="button" className="primary l3-run-transformer" onClick={showInformationFlow} disabled={running}><Play size={18} />{t("mission3.actions.runTransformer")}</button>}
      {flowStep > 0 && <div className="l3-flow-explanation" aria-live="polite"><strong>{processed ? t("mission3.page1.whatChanged") : t("mission3.page1.flowingNow")}</strong><p>{processed ? t("mission3.page1.changedExplanation") : t(`mission3.page1.step${flowStep}`)}</p>{processed && <span><i /><ArrowRight /><i className="is-updated" /></span>}</div>}
      <p className="l3-literal-note">{t("mission3.page1.literalNote")}</p>
    </div>
    <AccuracyNote>{t("mission3.labels.simplifiedNotNumbers")}</AccuracyNote><Takeaway>{t("mission3.page1.takeaway")}</Takeaway><Bridge label={t("mission3.shell.next")}>{t("mission3.page1.bridge")}</Bridge>
  </LearningLayout></section>;
}

export function Lesson3Page2({ active, t, onComplete }) {
  const [revealed, setRevealed] = useState(false);
  function reveal() { setRevealed(true); onComplete?.(); }
  return <section hidden={!active} className="lesson-3-page l3-page-two"><LearningLayout sidebar={<LearningSidebar t={t} page={2} term="Attention" visual="attention">{t("mission3.page2.technical")}</LearningSidebar>}>
    <PageHeading t={t} page={2} />
    <div className="l3-page-link"><span>{t("mission3.page2.lastPage")}</span><ArrowRight /><strong>{t("mission3.page2.now")}</strong></div>
    <div className={`l3-strength-stage ${revealed ? "is-revealed" : ""}`}>
      <p className="l3-strength-question">{t("mission3.page2.diagramQuestion")}</p>
      <div className="l3-connection-map" role="group" aria-label={t("mission3.page2.connectionLabel")}>
        <svg className="l3-strength-lines" viewBox="0 0 720 330" aria-hidden="true"><path className="is-strong is-tired" d="M160 72 C235 105 285 145 350 190" /><path className="is-strong is-slept" d="M560 72 C485 105 435 145 370 190" /><path className="is-light is-beside" d="M150 272 C230 250 285 225 350 205" /></svg>
        {LESSON_3_CONNECTIONS.map((connection) => <article className={`l3-source-token is-${connection.id} is-${connection.strength}`} key={connection.id}><strong>“{connection.label}”</strong>{revealed && <small>{t(`mission3.page2.${connection.strength}`)}</small>}</article>)}
        <div className="l3-focus-token"><small>{t("mission3.page2.targetLabel")}</small><strong>“dog”</strong></div>
        {revealed && <div className="l3-connection-why" aria-live="polite"><strong>{t("mission3.page2.why")}</strong><p>{t("mission3.page2.whyExplanation")}</p></div>}
      </div>
      {revealed ? <p className="l3-process-status"><Check />{t("mission3.actions.connectionsShown")}</p> : <button type="button" className="primary l3-show-connections" onClick={reveal}><GitBranch size={18} />{t("mission3.actions.showConnections")}</button>}
    </div>
    {revealed && <Takeaway>{t("mission3.page2.takeaway")}</Takeaway>}<AccuracyNote>{t("mission3.page2.accuracy")}</AccuracyNote><Bridge label={t("mission3.shell.next")}>{t("mission3.page2.bridge")}</Bridge>
  </LearningLayout></section>;
}

export function Lesson3Page3({ active, t, onComplete }) {
  const [connections, setConnections] = useState([]);
  const complete = connections.length === LESSON_3_CONNECTIONS.length;
  function toggle(id) { setConnections((current) => { if (current.includes(id)) return current; const next = [...current, id]; if (next.length === LESSON_3_CONNECTIONS.length) onComplete?.(); return next; }); }
  return <section hidden={!active} className="lesson-3-page l3-page-three"><LearningLayout sidebar={<LearningSidebar t={t} page={3} term={t("mission3.page3.term")} visual="representation">{t("mission3.page3.technical")}</LearningSidebar>}>
    <PageHeading t={t} page={3} />
    <div className="l3-builder-stage"><div className="l3-builder-copy"><span>{t("mission3.page3.lesson1Link")}</span><ArrowRight /><strong>{t("mission3.page3.now")}</strong></div><div className="l3-builder-grid"><div className="l3-connection-controls" role="group" aria-label={t("mission3.page3.controlsLabel")}>{LESSON_3_CONNECTIONS.map((connection, index) => <button type="button" aria-pressed={connections.includes(connection.id)} onClick={() => toggle(connection.id)} key={connection.id}><span>{connections.includes(connection.id) ? <Check /> : index + 1}</span><strong>Token “{connection.label}”</strong><small>{t("mission3.page3.addInformation")}</small></button>)}</div><div className="l3-information-flow" aria-live="polite"><div className="l3-flow-target"><small>Target Token</small><strong>“dog”</strong></div><div className="l3-flow-arrows" aria-hidden="true">{LESSON_3_CONNECTIONS.map((connection) => <i className={connections.includes(connection.id) ? "is-active" : ""} key={connection.id}><span /></i>)}</div><Representation t={t} activeCount={Math.max(1, connections.length + 1)} updated={connections.length > 0} /></div></div><p className="l3-builder-status" aria-live="polite">{complete ? t("mission3.page3.complete") : t("mission3.page3.progress", { current: connections.length, total: LESSON_3_CONNECTIONS.length })}</p></div>
    <AccuracyNote>{t("mission3.labels.simplifiedNotNumbers")}</AccuracyNote>{complete && <Takeaway>{t("mission3.page3.takeaway")}</Takeaway>}<Bridge label={t("mission3.shell.next")}>{t("mission3.page3.bridge")}</Bridge>
  </LearningLayout></section>;
}

function PositionTrack({ label, tokens, t }) {
  const subject = tokens[1]; const object = tokens[4];
  return <article className="l3-position-track"><small>{label}</small><div className="l3-position-tokens">{tokens.map((token, index) => <span className={`is-${token.toLowerCase()}`} key={`${token}-${index}`}><i>{index + 1}</i><b>{token}</b></span>)}</div><div className="l3-position-relation"><strong>“{subject}”</strong><ArrowRight /><span>{t("mission3.page4.chases")}</span><ArrowRight /><strong>“{object}”</strong></div></article>;
}

export function Lesson3Page4({ active, t }) {
  const [sentence, setSentence] = useState("a"); const tokens = LESSON_3_POSITION_SENTENCES[sentence];
  return <section hidden={!active} className="lesson-3-page l3-page-four"><LearningLayout sidebar={<LearningSidebar t={t} page={4} term={t("mission3.page4.term")} visual="position">{t("mission3.page4.technical")}</LearningSidebar>}>
    <PageHeading t={t} page={4} />
    <div className="l3-position-stage"><div className="l3-position-toggle" role="group" aria-label={t("mission3.page4.toggleLabel")}><button type="button" aria-pressed={sentence === "a"} onClick={() => setSentence("a")}>{t("mission3.page4.sentenceA")}</button><button type="button" aria-pressed={sentence === "b"} onClick={() => setSentence("b")}>{t("mission3.page4.sentenceB")}</button></div><PositionTrack label={sentence === "a" ? t("mission3.page4.sentenceA") : t("mission3.page4.sentenceB")} tokens={tokens} t={t} /><p className="l3-swap-explanation" aria-live="polite"><MapPin />{sentence === "a" ? t("mission3.page4.resultA") : t("mission3.page4.resultB")}</p></div>
    <Takeaway>{t("mission3.page4.takeaway")}</Takeaway><Bridge label={t("mission3.shell.next")}>{t("mission3.page4.bridge")}</Bridge>
  </LearningLayout></section>;
}

export function Lesson3Page5({ active, t, onComplete }) {
  const [targetIndex, setTargetIndex] = useState(0); const [stage, setStage] = useState(0); const [running, setRunning] = useState(false); const timerRef = useRef(null); const target = LESSON_3_PROCESS_EXAMPLE.targets[targetIndex];
  const stageLabels = useMemo(() => [1, 2, 3, 4].map((number) => t(`mission3.page5.step${number}`)), [t]);
  const sourceTokens = target === "key" ? ["robot", "picked", "red"] : ["robot", "picked", "key"];
  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  useEffect(() => { if (!running) return undefined; if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setStage(4); setRunning(false); onComplete?.(); return undefined; } if (stage >= 4) { setRunning(false); onComplete?.(); return undefined; } timerRef.current = window.setTimeout(() => setStage((current) => current + 1), 620); return () => window.clearTimeout(timerRef.current); }, [running, stage, onComplete]);
  function run() { setStage(0); setRunning(true); } function replay() { setStage(0); setRunning(false); window.clearTimeout(timerRef.current); } function nextTarget() { setTargetIndex((current) => (current + 1) % LESSON_3_PROCESS_EXAMPLE.targets.length); replay(); }
  return <section hidden={!active} className="lesson-3-page l3-page-five"><LearningLayout sidebar={<LearningSidebar t={t} page={5} label={t("mission3.sidebar.puttingTogether")} term={t("mission3.page5.question")} visual="process">{t("mission3.page5.technical")}</LearningSidebar>}>
    <PageHeading t={t} page={5} />
    <div className={`l3-process-stage stage-${stage}`}>
      <div className="l3-demo-label"><Cpu />{t("mission3.labels.simplifiedDemo")}</div>
      <TokenRow tokens={LESSON_3_PROCESS_EXAMPLE.tokens} target={target} active={stage >= 2 ? sourceTokens : []} subdued={stage >= 1} label={t("mission3.page5.tokenLabel")} />
      <div className="l3-process-progress" aria-label={t("mission3.page5.progressLabel")}>{stageLabels.map((label, index) => <span className={stage >= index + 1 ? "is-active" : ""} key={label}><i>{stage >= index + 1 ? <Check /> : index + 1}</i>{label}</span>)}</div>
      <div className="l3-combine-layout">
        <div className="l3-combine-sources">{sourceTokens.map((token, index) => <article className={stage >= 1 ? "is-active" : ""} key={token}><strong>Token “{token}”</strong>{stage >= 3 && <small>{t(`mission3.page5.source${index + 1}`)}</small>}</article>)}</div>
        <div className="l3-combine-connectors" aria-hidden="true"><svg viewBox="0 0 72 240"><path className={stage >= 2 ? "is-active" : ""} d="M0 40 C35 40 35 120 72 120" /><path className={stage >= 2 ? "is-active" : ""} d="M0 120 H72" /><path className={stage >= 2 ? "is-active" : ""} d="M0 200 C35 200 35 120 72 120" /></svg></div>
        <div className="l3-combine-target"><div className="l3-process-target"><small>{t("mission3.page5.targetLabel")}</small><strong>“{target}”</strong></div><Representation t={t} token={target} activeCount={Math.max(1, stage)} updated={stage >= 4} /><p aria-live="polite">{stage >= 4 ? t("mission3.page5.ready") : stage > 0 ? t(`mission3.page5.step${stage}`) : t("mission3.page5.waiting")}</p></div>
      </div>
      <div className="l3-process-actions"><button type="button" className="primary" onClick={run} disabled={running}><Play />{t("mission3.actions.processContext")}</button><button type="button" onClick={replay}><RefreshCw />{t("mission3.actions.replay")}</button><button type="button" onClick={nextTarget}><CircleDot />{t("mission3.actions.anotherTarget")}</button></div>
    </div>
    <AccuracyNote>{t("mission3.page5.accuracy")}</AccuracyNote>{stage >= 4 && <Takeaway>{t("mission3.page5.takeaway")}</Takeaway>}<Bridge label={t("mission3.shell.next")}>{t("mission3.page5.bridge")}</Bridge>
  </LearningLayout></section>;
}

export function Lesson3Page6({ active, t, complete, onVisit }) {
  useEffect(() => { if (active) onVisit?.(); }, [active, onVisit]);
  const stages = [[Eye, "context"], [Network, "connections"], [Layers3, "updated"], [Sparkles, "prediction"]];
  return <section hidden={!active} className="lesson-3-page l3-page-six"><LearningLayout sidebar={<SummarySidebar t={t} />}>
    <PageHeading t={t} page={6} />
    <div className="l3-final-pipeline">{stages.map(([Icon, key], index) => <React.Fragment key={key}><article className={key === "prediction" ? "is-gate" : ""}><span>{index + 1}</span><Icon /><strong>{t(`mission3.page6.${key}`)}</strong><small>{t(`mission3.page6.${key}Note`)}</small></article>{index < stages.length - 1 && <ArrowRight aria-hidden="true" />}</React.Fragment>)}</div>
    <div className="l3-prediction-gate"><span><Sparkles /></span><div><small>{t("mission3.page6.nextLabel")}</small><strong>{t("mission3.page6.nextTitle")}</strong><p>{t("mission3.page6.next")}</p></div><ArrowDown aria-hidden="true" /></div>{!complete && <p className="lesson-summary-advisory">{t("learningMode.notice")}</p>}
  </LearningLayout></section>;
}
