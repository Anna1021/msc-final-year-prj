import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowRight, BrainCircuit, ChevronDown, ChevronUp, CircleDot, FlaskConical, Hash, Languages, Layers3, LoaderCircle, MoreHorizontal, Play, RefreshCcw, RotateCcw, Search, ShieldCheck, Shuffle, Smile, Space, Sparkles, Type } from "lucide-react";
import { useI18n } from "../i18n/index.jsx";
import { tokenizeWithQwen, validateQwenTokenizerInput } from "../mission1/qwenTokenizer.js";
import TokenPieces from "../mission1/TokenPieces.jsx";
import presetSet from "./tokenLabPresetFixtures.json" with { type: "json" };
import TokenLabChallenge from "./TokenLabChallenge.jsx";
import { getTokenLabChallengeAvailability } from "./tokenLabChallenge.js";
import AiLabSpotlight from "./AiLabSpotlight.jsx";
import AiLabGuideButton from "./AiLabGuideButton.jsx";
import { stageTours } from "./spotlightSteps.js";
import { createAiLabTokenContract, readAiLabStage } from "./aiLabSession.js";
import NumbersStagePage from "./numbers/NumbersStagePage.jsx";
import ContextStagePage from "./context/ContextStagePage.jsx";
import PredictionStagePage from "./prediction/PredictionStagePage.jsx";
import CompareStagePage from "./compare/CompareStagePage.jsx";
import AiLabStickerGuide from "../playfulLearning/AiLabStickerGuide.jsx";
import AiLabVisualInstruction from "../playfulLearning/AiLabVisualInstruction.jsx";
import "./tokenLab.css";
import "./playfulLab.css";
import "./aiLabPlayfulStage1.css";

const featuredPresetIds = ["long-word", "punctuation", "emoji", "chinese", "spacing"];
const presetIcons = { "long-word": Type, punctuation: CircleDot, emoji: Smile, chinese: Languages, spacing: Space };

const labStages = [
  { id: "tokenize", status: "available", Icon: FlaskConical, routeOrStage: "tokenize" },
  { id: "numbers", status: "available", Icon: Hash, routeOrStage: "numbers" },
  { id: "context", status: "available", Icon: Layers3, routeOrStage: "context" },
  { id: "predict", status: "available", Icon: BrainCircuit, routeOrStage: "predict" },
  { id: "compare", status: "available", Icon: CircleDot, routeOrStage: "compare" }
];

const stageBridges = {
  tokenize: { next: "numbers", copyKey: "numbersStage.header.intro" },
  numbers: { next: "context", copyKey: "contextStage.bridge" },
  context: { next: "predict", copyKey: "predictionStage.header.intro" },
  predict: { next: "compare", copyKey: "compareStage.header.intro" }
};

function StageBridge({ activeStage, t, onSelect }) {
  const bridge = stageBridges[activeStage];
  if (!bridge) return null;
  return <aside className={`ai-lab-stage-bridge stage-${activeStage}`} aria-label={t(`tokenLab.flow.stages.${bridge.next}.title`)}><span><Sparkles size={18} strokeWidth={1.8}/><strong>{t(bridge.copyKey)}</strong></span><button type="button" onClick={() => onSelect(bridge.next)}>{t(`tokenLab.flow.stages.${bridge.next}.title`)}<ArrowRight size={17} strokeWidth={1.8}/></button></aside>;
}

function LabFlow({ activeStage, t, onSelect, compact = false }) {
  const activeIndex = labStages.findIndex((stage) => stage.id === activeStage);
  return <ol className="ai-lab-flow" data-tour-id={compact ? "ai-lab-compact-flow" : "ai-lab-flow"} aria-label={t("tokenLab.flow.label")}>{labStages.map((stage, index) => {
    const state = stage.status === "planned" ? "future" : activeStage === stage.id ? "active" : index < activeIndex ? "completed" : "available";
    const content = <><span className="ai-lab-step-number">{index + 1}</span><stage.Icon size={17} strokeWidth={1.8} /><span className="ai-lab-step-copy"><strong>{t(`tokenLab.flow.stages.${stage.id}.title`)}</strong><small>{t(`tokenLab.flow.stages.${stage.id}.hint`)}</small></span>{stage.status === "planned" ? <em>{t("tokenLab.flow.planned")}</em> : activeStage !== stage.id && <em className="ai-lab-open-label">{t("tokenLab.flow.open")}</em>}</>;
    return <li key={stage.id} className={`${state} stage-${stage.id}`}>{stage.status === "available" ? <button type="button" className="ai-lab-step" data-tour-id={`ai-lab-stage-${stage.id}`} aria-current={activeStage === stage.id ? "step" : undefined} onClick={() => onSelect(stage.routeOrStage)}>{content}</button> : <div className="ai-lab-step" aria-disabled="true" title={t("tokenLab.flow.plannedTooltip")}>{content}</div>}</li>;
  })}</ol>;
}

function AiLabShellHeader({ activeStage, t, onSelect, onReplay, tourActive, guideAttention, guideAvailable }) {
  if (activeStage === "tokenize") return <>
    <header className="token-lab-top ai-lab-full-hero">
      <div className="token-lab-hero"><div><span className="token-lab-eyebrow"><FlaskConical size={18} strokeWidth={1.8} />{t("tokenLab.hero.eyebrow")}</span><h1>{t("tokenLab.hero.title")}</h1><p>{t("tokenLab.hero.intro")}</p><AiLabGuideButton disabled={tourActive||!guideAvailable} attention={!tourActive&&guideAttention} t={t} onStart={onReplay} tourId="ai-lab-replay-guide" /></div><AiLabStickerGuide className="ai-lab-welcome-sticker" src="/assets/img/mission-robot-pointing.png" hiddenOnMobile /></div>
    </header>
    <nav className="ai-lab-sticky-flow"><LabFlow activeStage={activeStage} t={t} onSelect={onSelect} /></nav>
  </>;

  return <header className={`ai-lab-compact-header stage-${activeStage}`}>
    <div className="ai-lab-compact-identity"><FlaskConical size={18} strokeWidth={1.8} /><span><strong>{t("tokenLab.hero.eyebrow")}</strong><small>{t(`tokenLab.flow.stages.${activeStage}.title`)}</small></span></div>
    <nav><LabFlow compact activeStage={activeStage} t={t} onSelect={onSelect} /></nav>
    <AiLabGuideButton compact stage={activeStage} disabled={tourActive||!guideAvailable} t={t} onStart={onReplay} tourId="ai-lab-replay-guide" />
  </header>;
}

export default function TokenLabPage({ navigate }) {
  const { language, t } = useI18n();
  const [activeStage, setActiveStage] = useState(readAiLabStage);
  const [transientContract, setTransientContract] = useState(null);
  const orderedPresets = useMemo(() => [...presetSet.presets].sort((a, b) => Number(b.language === language) - Number(a.language === language)), [language]);
  const [input, setInput] = useState(orderedPresets[0].text);
  const [presetId, setPresetId] = useState(orderedPresets[0].id);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [tourStage,setTourStage]=useState(()=>stageTours[activeStage]?activeStage:null);
  const [tourActive,setTourActive]=useState(()=>Boolean(stageTours[activeStage]&&localStorage.getItem(stageTours[activeStage].storageKey)!=="true"));
  const [tourStep, setTourStep] = useState(0);
  const [guideAttention, setGuideAttention] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const pageRef = useRef(null);
  const inputRef = useRef(null);
  const availability = getTokenLabChallengeAvailability(result);
  const groupCount = result?.visualGroups?.length || 0;
  const busy = status === "loading" || status === "tokenizing";
  const featuredPresets = featuredPresetIds.map((id) => orderedPresets.find((preset) => preset.id === id)).filter(Boolean);
  const morePresets = orderedPresets.filter((preset) => !featuredPresetIds.includes(preset.id));

  useEffect(() => {
    const onPopState = () => setActiveStage(readAiLabStage());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(()=>{
    const config=stageTours[activeStage];
    if(!config){setTourStage(null);setTourActive(false);return;}
    setTourStage(activeStage);setTourStep(0);setTourActive(localStorage.getItem(config.storageKey)!=="true");
  },[activeStage]);

  function selectStage(stage) {
    const nextStage = ["numbers", "context", "predict", "compare"].includes(stage) ? stage : "tokenize";
    if (nextStage === activeStage) return;
    const target = new URL(window.location.href);
    target.pathname = "/ai-lab";
    target.searchParams.set("stage", nextStage);
    window.history.pushState({}, "", `${target.pathname}${target.search}`);
    setActiveStage(nextStage);
    pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToTarget(target, { force = false, focus = false } = {}) {
    if (!target) return;
    const rootRect = pageRef.current?.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const visibleTop = (rootRect?.top || 0) + 66;
    const visibleBottom = rootRect?.bottom || window.innerHeight;
    if (force || targetRect.top < visibleTop || targetRect.bottom > visibleBottom) target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focus) window.setTimeout(() => target.querySelector("textarea")?.focus({ preventScroll: true }), 350);
  }

  function fillPreset(preset) {
    setInput(preset.text); setPresetId(preset.id); setResult(null); setChallengeOpen(false); setTechnicalOpen(false); setWhyOpen(false); setError(""); setStatus("ready");
  }
  function focusInput() {
    scrollToTarget(inputRef.current, { force: true, focus: true });
  }
  async function run() {
    const validation = validateQwenTokenizerInput(input);
    if (validation === "empty") { setStatus("validation-error"); setError(t("tokenLab.errors.empty")); return; }
    if (validation) { setStatus("validation-error"); setError(t("tokenLab.errors.tooLong")); return; }
    setError(""); setChallengeOpen(false); setStatus(loaded ? "tokenizing" : "loading");
    try {
      const next = await tokenizeWithQwen(input);
      if (next.decoded !== input) throw new Error("Tokenizer round-trip failed.");
      const firstResult = !result;
      setLoaded(true); setResult(next); setStatus("success");
      setTransientContract(createAiLabTokenContract(next));
      if (firstResult && !tourActive) window.requestAnimationFrame(() => window.requestAnimationFrame(() => scrollToTarget(pageRef.current?.querySelector('[data-tour-id="ai-lab-token-result"]'))));
    } catch { setStatus("load-error"); setError(t("tokenLab.errors.load")); }
  }
  function tryAnother() {
    const current = orderedPresets.findIndex((preset) => preset.id === presetId);
    fillPreset(orderedPresets[(current + 1 + orderedPresets.length) % orderedPresets.length]); focusInput();
  }
  function trySuitable() {
    const suitable = orderedPresets.filter((preset) => preset.visualGroupCount >= 4 && preset.visualGroupCount <= 12 && preset.id !== presetId);
    fillPreset(suitable[0] || orderedPresets.find((preset) => preset.visualGroupCount >= 4 && preset.visualGroupCount <= 12));
    focusInput();
  }
  function restart() {
    setInput(""); setPresetId(""); setResult(null); setStatus("idle"); setError(""); setTechnicalOpen(false); setWhyOpen(false); setChallengeOpen(false); focusInput();
  }
  const availabilityKey = availability === "too-short" ? "tooShort" : availability === "too-long" ? "tooLong" : "unavailable";

  useEffect(() => {
    if (challengeOpen) window.requestAnimationFrame(() => scrollToTarget(pageRef.current?.querySelector(".token-lab-challenge")));
  }, [challengeOpen]);

  useEffect(() => {
    if (tourActive && tourStage === "tokenize" && tourStep === 3 && result) setTourStep(4);
  }, [result, tourActive, tourStage, tourStep]);

  function closeTour() {
    const config=stageTours[tourStage];if(config)localStorage.setItem(config.storageKey,"true");
    setTourActive(false);
  }
  function replayCurrentTour() {
    const config=stageTours[activeStage];if(!config||tourActive)return;
    setGuideAttention(false);
    if(activeStage==="tokenize")setChallengeOpen(false);setTourStage(activeStage);setTourStep(0);setTourActive(true);
    window.requestAnimationFrame(() => pageRef.current?.scrollTo({ top: 0, behavior: "smooth" }));
  }
  function completeTourAction(action){
    const config=stageTours[tourStage],step=config?.steps[tourStep];
    if(tourActive&&tourStage===activeStage&&step?.id===action&&step.waitsForAction)setTourStep(index=>Math.min(index+1,config.steps.length-1));
  }

  return <main className="token-lab-page playful-learning-scope page-shell" ref={pageRef}>
    <AiLabShellHeader activeStage={activeStage} t={t} onSelect={selectStage} onReplay={replayCurrentTour} tourActive={tourActive} guideAttention={guideAttention} guideAvailable={Boolean(stageTours[activeStage])} />
    {activeStage === "numbers" ? <NumbersStagePage transientContract={transientContract} onBackToTokenize={() => selectStage("tokenize")} onTokenSelected={()=>completeTourAction("pick")} onAddressFollowed={()=>completeTourAction("follow")} onTeachingOpened={()=>completeTourAction("open")} onNumbersRevealed={()=>completeTourAction("drawer")} onBridgeShown={()=>completeTourAction("bridge")} /> : activeStage === "context" ? <ContextStagePage onSceneSelected={()=>completeTourAction("scene")} onBuilderOpened={()=>completeTourAction("builder")} onUsefulSelected={()=>completeTourAction("useful")} onUnrelatedSelected={()=>completeTourAction("unrelated")} /> : activeStage === "predict" ? <PredictionStagePage /> : activeStage === "compare" ? <CompareStagePage transientContract={transientContract} onRunComparison={()=>completeTourAction("run")} onNavigateStage={selectStage} /> : <>
    <section className="token-lab-card token-lab-experiment" ref={inputRef}><div className="token-lab-section-head"><div><span>{t("tokenLab.experiment.eyebrow")}</span><h2>{t("tokenLab.experiment.title")}</h2><p>{t("tokenLab.experiment.intro")}</p></div><button type="button" className="outline" data-tour-id="ai-lab-restart" onClick={restart}><RotateCcw size={17} strokeWidth={1.8} />{t("tokenLab.actions.restartLab")}</button></div>
      <div className="ai-lab-example-shelf"><div className="ai-lab-shelf-head"><strong>{t("tokenLab.presets.label")}</strong><button type="button" aria-expanded={examplesOpen} onClick={() => setExamplesOpen((open) => !open)}><MoreHorizontal size={17} />{t("tokenLab.presets.more")}</button></div><div className="token-lab-presets" aria-label={t("tokenLab.presets.label")}>{featuredPresets.map((preset) => { const PresetIcon = presetIcons[preset.id] || Type; return <button type="button" key={preset.id} className={preset.id === presetId ? "active" : ""} onClick={() => fillPreset(preset)}><PresetIcon size={17} strokeWidth={1.8} /><span>{t(`tokenLab.presets.categories.${preset.category}`)}</span></button>; })}</div>{examplesOpen && <div className="token-lab-more-presets">{morePresets.map((preset) => <button type="button" key={preset.id} className={preset.id === presetId ? "active" : ""} onClick={() => fillPreset(preset)}>{t(`tokenLab.presets.categories.${preset.category}`)}</button>)}</div>}</div>
      <div className="ai-lab-input-scene"><AiLabStickerGuide src="/assets/img/mission-robot-reading.png" className="ai-lab-input-sticker" hiddenOnMobile /><div><label htmlFor="token-lab-input"><strong>{t("tokenLab.experiment.inputLabel")}</strong><span>{input.length} / 200</span></label><textarea id="token-lab-input" data-tour-id="ai-lab-token-input" maxLength={200} value={input} placeholder={t("tokenLab.experiment.placeholder")} onChange={(event) => { setInput(event.target.value); setPresetId(""); setError(""); }} /><span className="ai-lab-privacy" title={t("tokenLab.experiment.privacyFull")}><ShieldCheck size={15} strokeWidth={1.9} />{t("tokenLab.experiment.privacyShort")}</span></div></div>
      <div className="token-lab-actions"><button type="button" className="primary" data-tour-id="ai-lab-tokenize-button" disabled={busy} onClick={run}>{busy ? <LoaderCircle className="token-lab-spinner" size={18} strokeWidth={1.8} /> : <Play size={18} strokeWidth={1.8} />}{status === "loading" ? t("tokenLab.actions.loading") : status === "tokenizing" ? t("tokenLab.actions.tokenizing") : result ? t("tokenLab.actions.runAgain") : t("tokenLab.actions.tokenize")}</button>{status === "load-error" && <button type="button" className="outline" onClick={run}><RefreshCcw size={17} strokeWidth={1.8} />{t("tokenLab.actions.retry")}</button>}<button type="button" className="outline" onClick={tryAnother}><Shuffle size={17} strokeWidth={1.8} />{t("tokenLab.actions.tryExample")}</button></div>
      <div aria-live="polite">{error && <div className="token-lab-message error"><AlertCircle size={18} strokeWidth={1.8} />{error}</div>}</div>
    </section>
    {result && !challengeOpen && <section className="token-lab-card token-lab-result" data-tour-id="ai-lab-token-result"><div className="token-lab-section-head"><div><span>{t("tokenLab.result.eyebrow")}</span><h2>{t("tokenLab.result.became", { count: result.count })}</h2></div><div className="token-lab-count" data-tour-id="ai-lab-token-count"><strong>{result.count}</strong><small>{t("tokenLab.result.total")}</small></div></div><div className="token-lab-original"><small>{t("tokenLab.result.original")}</small><strong>{result.text}</strong></div><div className="ai-lab-result-scene"><div><TokenPieces groups={result.visualGroups} t={t} /><p className="token-lab-space" data-tour-id="ai-lab-space-marker"><b>␠</b>{t("tokenLab.tokens.spaceShort")}</p></div><AiLabStickerGuide src="/assets/img/mission-robot-pointing.png" className="ai-lab-result-sticker" /></div><div className="ai-lab-discovery"><Search size={20} strokeWidth={1.8} /><strong>{t("tokenLab.result.discovery")}</strong></div>
      <div className="token-lab-learn-more"><button type="button" aria-expanded={whyOpen} data-tour-id="ai-lab-why-split" onClick={() => setWhyOpen((open) => !open)}>{whyOpen ? <ChevronUp /> : <ChevronDown />}<span>{t("tokenLab.result.whyTitle")}</span></button>{whyOpen && <div><AiLabVisualInstruction items={[{ Icon: Layers3, text: t("tokenLab.result.whyStep1"), example: "text pieces" }, { Icon: ShieldCheck, text: t("tokenLab.result.whyStep2"), example: "reader" }, { Icon: Type, text: t("tokenLab.result.whyStep3"), example: "un · usual" }]} /><p className="ai-lab-model-difference">{t("tokenLab.result.different")}</p></div>}
        <button type="button" aria-expanded={technicalOpen} onClick={() => setTechnicalOpen((open) => !open)}>{technicalOpen ? <ChevronUp /> : <ChevronDown />}<span>{technicalOpen ? t("tokenLab.result.hideTechnical") : t("tokenLab.result.showTechnical")}</span></button>{technicalOpen && <div className="token-lab-technical"><p>{t("tokenLab.result.technicalNote")}</p>{result.pieces.map((piece) => <code key={`${piece.index}-${piece.id}`}><span>#{piece.index + 1}</span><b>{piece.rawPiece}</b><small>ID {piece.id}</small></code>)}</div>}
      </div>
      <div className={`token-lab-build ${availability !== "available" ? "unavailable" : ""}`} data-tour-id="ai-lab-challenge-status"><AiLabStickerGuide src="/assets/img/mission-robot-reading.png" className="ai-lab-challenge-sticker" hiddenOnMobile /><div><strong>{availability === "available" ? t("tokenLab.challenge.readyTitle") : t("tokenLab.challenge.buildTitle")}</strong><p>{availability === "available" ? t("tokenLab.challenge.readyIntro") : t(`tokenLab.challenge.status.${availabilityKey}`, { count: groupCount })}</p></div><div><button type="button" className="primary token-lab-build-button" disabled={availability !== "available"} aria-disabled={availability !== "available"} onClick={() => setChallengeOpen(true)}><Sparkles size={18} strokeWidth={1.8} />{availability === "available" ? t("tokenLab.challenge.start") : t(`tokenLab.challenge.buttons.${availabilityKey}`)}</button>{availability !== "available" && <button type="button" className="outline" onClick={trySuitable}><Shuffle size={17} strokeWidth={1.8} />{t("tokenLab.challenge.trySuitable")}</button>}</div></div>
    </section>}
    {result && challengeOpen && <TokenLabChallenge result={result} t={t} onClose={() => setChallengeOpen(false)} />}
    <section className="token-lab-notice"><strong>{t("tokenLab.notice.tryNext")}</strong><div className="token-lab-suggestions">{["long-word", "emoji", "chinese"].map((id) => { const preset = presetSet.presets.find((item) => item.id === id); return <button type="button" key={id} onClick={() => { fillPreset(preset); focusInput(); }}>{t(`tokenLab.notice.suggestions.${id.replace("-", "")}`)}</button>; })}</div><button type="button" className="token-lab-mission-link" onClick={() => navigate("/mission/1-tokenisation-paged")}>{t("tokenLab.notice.missionLink")}</button></section>
    </>}
    <StageBridge activeStage={activeStage} t={t} onSelect={selectStage}/>
    <AiLabSpotlight active={tourActive} stepIndex={tourStep} steps={stageTours[tourStage]?.steps} t={t} onNext={()=>setTourStep(step=>Math.min(step+1,(stageTours[tourStage]?.steps.length||1)-1))} onPrevious={()=>setTourStep(step=>Math.max(0,step-1))} onSkip={closeTour} onFinish={closeTour}/>
  </main>;
}
