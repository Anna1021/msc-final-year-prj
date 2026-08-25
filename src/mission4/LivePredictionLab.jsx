import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle, ArrowRight, Check, ChevronLeft, ChevronRight,
  CircleDot, LoaderCircle, Pause, Play, Pointer, RefreshCw, RotateCcw
} from "lucide-react";
import useLivePredictionModel from "./useLivePredictionModel.js";
import { LESSON_4_HISTORY_GUIDE_FLOW, LESSON_4_LIVE_GUIDE_FLOW, useGuide } from "../guide/index.js";

const STARTER_IDS = ["cat", "weather", "dragon"];
const MAX_PROMPT_LENGTH = 120;
const TOKEN_LIMITS = [5, 10, 20, 50, 100];
const VISUAL_HOLD_MS = 550;
const TEACHING_SEED = 0x4c4c4d34;

const sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration));
const candidateLabel = (candidate, t) => candidate?.display_kind === "byte_fragment"
  ? t("mission4.live.lab.byteFragment", { id:candidate.token_id })
  : candidate?.display_token;

function CandidateBoard({ candidates = [], selectedId, reviewing, onLatest, t }) {
  const maximum = candidates[0]?.probability || 1;
  return <section className="l4-watch-candidates" data-guide-target="lesson4-predictions" aria-labelledby="l4-watch-candidate-title">
    <header><div><h3 id="l4-watch-candidate-title">{reviewing ? t("mission4.live.lab.reviewingStep", { step: reviewing }) : t("mission4.live.lab.candidateTitle")}</h3><p>{t("mission4.live.lab.candidateSubtitle")}</p></div>{reviewing && <button type="button" className="outline" onClick={onLatest}><ArrowRight />{t("mission4.live.lab.returnLatest")}</button>}</header>
    {candidates.length ? <ol>{candidates.map((candidate, index) => <li className={selectedId === candidate.token_id ? "is-selected" : ""} key={candidate.token_id}>
      <b>{index + 1}</b><span title={`${candidate.raw_token} · ID ${candidate.token_id}`}>{candidateLabel(candidate, t)}</span><i aria-hidden="true"><em style={{ width:`${(candidate.probability / maximum) * 100}%` }} /></i><strong>{(candidate.probability * 100).toFixed(1)}%</strong>{selectedId === candidate.token_id && <small><Check />{t("mission4.live.lab.selected")}</small>}
    </li>)}</ol> : <div className="l4-watch-empty"><CircleDot /><p>{t("mission4.live.lab.candidateEmpty")}</p></div>}
    <p className="l4-watch-top-five">{t("mission4.live.lab.topFive")}</p>
  </section>;
}

function CurrentContext({ text, latest, generated, maximum, contextRef, t }) {
  return <section className="l4-watch-context" aria-labelledby="l4-watch-context-title">
    <h3 id="l4-watch-context-title">{t("mission4.live.lab.currentContext")} <small>{t("mission4.live.lab.liveText")}</small></h3>
    <div ref={contextRef} className="l4-watch-context-text" aria-live="polite">
      {latest ? <>{latest.before}<mark aria-label={t("mission4.live.lab.latestToken", { token: latest.display })}>{latest.raw}</mark></> : text}
    </div>
    <span>{t("mission4.live.lab.tokensGenerated")} <b>{generated} / {maximum}</b></span>
  </section>;
}

function History({ steps, reviewStep, onReview, scrollerRef, t }) {
  function scroll(direction) { scrollerRef.current?.scrollBy({ left:direction * 460, behavior:"smooth" }); }
  return <section className="l4-watch-history" data-guide-target="lesson4-history" aria-labelledby="l4-watch-history-title">
    <header><div><h3 id="l4-watch-history-title">{t("mission4.live.lab.historyTitle")}</h3><p>{t("mission4.live.lab.historySubtitle")}</p></div><div data-guide-target="lesson4-history-navigation"><button type="button" aria-label={t("mission4.live.lab.scrollLeft")} title={t("mission4.live.lab.scrollLeft")} onClick={() => scroll(-1)}><ChevronLeft /></button><button type="button" aria-label={t("mission4.live.lab.scrollRight")} title={t("mission4.live.lab.scrollRight")} onClick={() => scroll(1)}><ChevronRight /></button></div></header>
    <div ref={scrollerRef} className="l4-watch-history-track" tabIndex="0" aria-label={t("mission4.live.lab.historyAria")}>
      {steps.length ? steps.map(step => <button type="button" className={`${reviewStep === step.step ? "is-reviewing" : ""} ${step.step === steps.length ? "is-latest" : ""}`} onClick={() => onReview(step.step)} key={step.step}><small>{t("mission4.live.lab.step", { step: step.step })}</small><strong>{candidateLabel(step.selected, t)}</strong><span>{(step.selected.probability * 100).toFixed(1)}%</span></button>) : <p>{t("mission4.live.lab.historyEmpty")}</p>}
    </div>
  </section>;
}

export default function LivePredictionLab({ t, onSuccessfulPrediction }) {
  const model = useLivePredictionModel();
  const guide = useGuide();
  const defaultPrompt = t("mission4.live.lab.defaultPrompt");
  const starters = STARTER_IDS.map((id) => ({ id, text:t(`mission4.live.lab.starters.${id}`) }));
  const starterSignature = starters.map((starter) => starter.text).join("\u0000");
  const [prompt, setPrompt] = useState(() => defaultPrompt);
  const [currentText, setCurrentText] = useState(() => defaultPrompt);
  const [steps, setSteps] = useState([]);
  const [temperature, setTemperature] = useState(1);
  const [generationMode, setGenerationMode] = useState("auto");
  const [maxTokens, setMaxTokens] = useState(20);
  const [runState, setRunState] = useState("idle");
  const [latestHighlight, setLatestHighlight] = useState(null);
  const [reviewStep, setReviewStep] = useState(null);
  const [message, setMessage] = useState(null);
  const currentTextRef = useRef(currentText);
  const stepsRef = useRef(steps);
  const maxTokensRef = useRef(maxTokens);
  const temperatureRef = useRef(temperature);
  const pauseRequestedRef = useRef(false);
  const runIdRef = useRef(0);
  const autoLoopRef = useRef(false);
  const completionRef = useRef(false);
  const contextRef = useRef(null);
  const historyRef = useRef(null);
  const promptSourceRef = useRef("default");
  const promptLockedRef = useRef(false);
  const tokenIdsRef = useRef(null);
  const appliedPromptRef = useRef(defaultPrompt);
  const historyGuideScheduledRef = useRef(false);

  currentTextRef.current = currentText;
  stepsRef.current = steps;
  maxTokensRef.current = maxTokens;
  temperatureRef.current = temperature;

  useEffect(() => {
    if (!latestHighlight) return undefined;
    const timer = setTimeout(() => setLatestHighlight(null), 650);
    return () => clearTimeout(timer);
  }, [latestHighlight]);
  useEffect(() => { if (contextRef.current) contextRef.current.scrollTop = contextRef.current.scrollHeight; }, [currentText]);
  useEffect(() => { if (historyRef.current) historyRef.current.scrollTo({ left:historyRef.current.scrollWidth, behavior:"smooth" }); }, [steps.length]);
  useEffect(() => () => { runIdRef.current += 1; pauseRequestedRef.current = true; }, []);
  useEffect(() => {
    if (promptLockedRef.current) return;
    const source = promptSourceRef.current;
    const localizedPrompt = source === "default" ? defaultPrompt : starters.find((starter) => starter.id === source)?.text;
    if (!localizedPrompt || localizedPrompt === currentTextRef.current) return;
    setPrompt(localizedPrompt);
    setCurrentText(localizedPrompt);
    currentTextRef.current = localizedPrompt;
    appliedPromptRef.current = localizedPrompt;
  }, [defaultPrompt, starterSignature]);
  useEffect(() => {
    const historyAlreadySeen = guide.seenFlowIds.includes(LESSON_4_HISTORY_GUIDE_FLOW.id)
      || guide.completedFlowIds.includes(LESSON_4_HISTORY_GUIDE_FLOW.id);
    if (steps.length < 2 || guide.expanded || historyAlreadySeen || historyGuideScheduledRef.current) return undefined;
    historyGuideScheduledRef.current = true;
    const frame = window.requestAnimationFrame(() => guide.openGuide(LESSON_4_HISTORY_GUIDE_FLOW.id));
    return () => window.cancelAnimationFrame(frame);
  }, [guide.completedFlowIds, guide.expanded, guide.openGuide, guide.seenFlowIds, steps.length]);

  function pause() {
    pauseRequestedRef.current = true;
    setRunState("paused");
    setMessage({ key:"pausedMessage" });
  }

  function clearGeneration(nextPrompt = prompt) {
    runIdRef.current += 1;
    pauseRequestedRef.current = true;
    model.cancel();
    currentTextRef.current = nextPrompt;
    stepsRef.current = [];
    tokenIdsRef.current = null;
    appliedPromptRef.current = nextPrompt;
    setCurrentText(nextPrompt);
    setSteps([]);
    setLatestHighlight(null);
    setReviewStep(null);
    setRunState("idle");
    setMessage(null);
    completionRef.current = false;
  }

  function chooseStarter(starter) {
    promptSourceRef.current = starter.id;
    promptLockedRef.current = false;
    setPrompt(starter.text);
  }
  function updatePrompt(value) {
    promptSourceRef.current = "user";
    promptLockedRef.current = true;
    setPrompt(value);
  }

  function runDraft() {
    const nextPrompt = prompt;
    const replacing = nextPrompt !== appliedPromptRef.current;
    if (!replacing && runState === "running") {
      pause();
      return;
    }
    if (replacing) clearGeneration(nextPrompt);
    const start = () => generationMode === "auto"
      ? runAuto({ again:!replacing && runState === "complete" })
      : runOneStep();
    if (replacing && (runState === "running" || model.status === "predicting")) {
      const startWhenStopped = () => autoLoopRef.current
        ? window.setTimeout(startWhenStopped, 16)
        : start();
      window.setTimeout(startWhenStopped, 16);
    } else {
      start();
    }
  }

  async function performOne(runId) {
    promptLockedRef.current = true;
    if (stepsRef.current.length >= maxTokensRef.current) return { limit:true };
    const before = currentTextRef.current;
    const started = performance.now();
    const prediction = await model.predict({
      text:before,
      input_token_ids:tokenIdsRef.current,
      temperature:temperatureRef.current,
      mode:"sampling",
      seed:TEACHING_SEED,
      sample_index:stepsRef.current.length,
      top_k:5
    });
    if (runId !== runIdRef.current) return { stale:true };
    const after = prediction.next_decoded_text;
    const selectedLabel = candidateLabel(prediction.selected, t);
    const step = {
      step:stepsRef.current.length + 1,
      contextBefore:before,
      candidates:prediction.candidates,
      selected:prediction.selected,
      contextAfter:after,
      temperature:prediction.temperature,
      isEos:prediction.is_eos
    };
    const nextSteps = [...stepsRef.current, step];
    currentTextRef.current = after;
    tokenIdsRef.current = prediction.next_input_token_ids;
    stepsRef.current = nextSteps;
    setCurrentText(after);
    setSteps(nextSteps);
    setLatestHighlight(prediction.selected.decoded_contribution ? { before, raw:prediction.selected.decoded_contribution, display:selectedLabel } : null);
    setMessage({ key:"stepMessage", params:{ step:step.step, token:selectedLabel } });
    if (nextSteps.length >= 2 && !completionRef.current) { completionRef.current = true; onSuccessfulPrediction?.(); }
    return { prediction, elapsed:performance.now() - started, limit:nextSteps.length >= maxTokensRef.current };
  }

  async function runAuto({ again = false } = {}) {
    if (autoLoopRef.current) return;
    if (again) clearGeneration(prompt);
    const runId = ++runIdRef.current;
    pauseRequestedRef.current = false;
    autoLoopRef.current = true;
    setRunState("running");
    setReviewStep(null);
    try {
      while (!pauseRequestedRef.current && runId === runIdRef.current) {
        const outcome = await performOne(runId);
        if (outcome.stale) break;
        if (outcome.prediction?.is_eos) { setRunState("complete"); setMessage({ key:"endMessage" }); break; }
        if (outcome.limit) { setRunState("limit"); setMessage({ key:"limitMessage", params:{ limit:maxTokensRef.current } }); break; }
        await sleep(Math.max(0, VISUAL_HOLD_MS - (outcome.elapsed || 0)));
      }
    } catch (failure) {
      if (failure.message !== "Live model request cancelled.") { setRunState("error"); setMessage({ key:"errorMessage" }); }
    } finally {
      autoLoopRef.current = false;
      if (pauseRequestedRef.current && runId === runIdRef.current) setRunState("paused");
    }
  }

  async function runOneStep() {
    if (stepsRef.current.length >= maxTokensRef.current) return;
    const runId = ++runIdRef.current;
    pauseRequestedRef.current = true;
    setRunState("running");
    setReviewStep(null);
    try {
      const outcome = await performOne(runId);
      if (outcome.prediction?.is_eos) setRunState("complete");
      else if (outcome.limit) setRunState("limit");
      else setRunState("paused");
    } catch (failure) {
      if (failure.message !== "Live model request cancelled.") { setRunState("error"); setMessage({ key:"errorMessage" }); }
    }
  }

  function switchMode(mode) {
    if (runState === "running") pause();
    setGenerationMode(mode);
  }
  function changeLimit(value) {
    const next = Number(value);
    setMaxTokens(next);
    maxTokensRef.current = next;
    if (runState === "limit" && stepsRef.current.length < next) { setRunState("paused"); setMessage({ key:"limitRaisedMessage", params:{ limit:next } }); }
  }

  function retryPrediction() {
    model.retry();
    setRunState(stepsRef.current.length ? "paused" : "idle");
    setMessage(null);
    if (generationMode === "auto") runAuto();
    else runOneStep();
  }

  const viewed = reviewStep ? steps.find(step => step.step === reviewStep) : steps.at(-1);
  const busy = model.status === "predicting";
  const draftChanged = prompt !== appliedPromptRef.current;
  const canRun = prompt.trim()
    && prompt.length <= MAX_PROMPT_LENGTH
    && (!busy || draftChanged || (generationMode === "auto" && runState === "running"));
  const autoLabel = t(`mission4.live.lab.${runState === "running" && !draftChanged ? "pause" : draftChanged ? "run" : runState === "paused" ? "resume" : runState === "complete" ? "runAgain" : runState === "limit" ? "continue" : "run"}`);
  const statusKey = busy ? "predicting" : runState === "running" ? "generating" : runState === "paused" ? "paused" : runState === "limit" ? "limitReached" : runState === "complete" ? "generationComplete" : "ready";
  const temperatureDescription = t(`mission4.live.lab.${temperature < .8 ? "temperatureFocused" : temperature > 1.2 ? "temperatureSpread" : "temperatureBalanced"}`);
  const showCounterCue = guide.expanded
    && guide.activeFlowId === LESSON_4_LIVE_GUIDE_FLOW.id
    && guide.currentStep?.id === "character-limit";

  return <div className="lesson-4-live-lab l4-watch-lab">
    <div className="l4-watch-prompt-panel">
      <section className="l4-watch-prompt"><label htmlFor="l4-watch-input"><input id="l4-watch-input" data-guide-target="lesson4-input" aria-label={t("mission4.live.lab.textBeginning")} value={prompt} maxLength={MAX_PROMPT_LENGTH} onChange={event => updatePrompt(event.target.value)} /><small data-guide-target="lesson4-character-counter">{showCounterCue && <span className="l4-watch-counter-cue" aria-hidden="true"><Pointer /></span>}{prompt.length} / {MAX_PROMPT_LENGTH}</small></label><button type="button" className="primary" data-guide-target="lesson4-run" disabled={!canRun || (!draftChanged && runState !== "running" && runState === "limit" && steps.length >= maxTokens)} onClick={runDraft}>{runState === "running" && !draftChanged ? <Pause /> : busy && !draftChanged ? <LoaderCircle className="is-spinning" /> : generationMode === "step" ? <ArrowRight /> : <Play />}{generationMode === "auto" ? autoLabel : t("mission4.live.lab.predictNext")}</button></section>
      <div className="l4-watch-examples" data-guide-target="lesson4-preset-examples"><span>{t("mission4.live.lab.tryExample")}</span>{starters.map(starter => <button type="button" onClick={() => chooseStarter(starter)} key={starter.id}>{starter.text}</button>)}<button type="button" className="l4-watch-reset" onClick={() => clearGeneration(prompt)}><RotateCcw />{t("mission4.live.lab.reset")}</button></div>
    </div>
    <section className="l4-watch-controls">
      <fieldset data-guide-target="lesson4-generation-mode"><legend>{t("mission4.live.lab.generationMode")}</legend><div><button type="button" aria-pressed={generationMode === "auto"} onClick={() => switchMode("auto")}><Play />{t("mission4.live.lab.auto")} <small>{t("mission4.live.lab.recommended")}</small></button><button type="button" aria-pressed={generationMode === "step"} onClick={() => switchMode("step")}><CircleDot />{t("mission4.live.lab.stepByStep")}</button></div></fieldset>
      <label data-guide-target="lesson4-max-tokens">{t("mission4.live.lab.maxTokens")}<select value={maxTokens} onChange={event => changeLimit(event.target.value)}>{TOKEN_LIMITS.map(limit => <option value={limit} key={limit}>{t("mission4.live.lab.tokenOption", { count:limit })}</option>)}</select></label>
      <span className={`l4-watch-run-status is-${runState}`}><i />{t(`mission4.live.lab.${statusKey}`)}</span>
    </section>
    {model.status === "error" && <div className="l4-watch-error" role="alert"><AlertCircle /><div><strong>{t("mission4.live.lab.modelErrorTitle")}</strong><p>{t("mission4.live.lab.modelErrorBody")}</p></div><button type="button" onClick={retryPrediction}><RefreshCw />{t("mission4.live.lab.tryAgain")}</button></div>}
    <div className="l4-watch-workspace">
      <CurrentContext text={currentText} latest={latestHighlight} generated={steps.length} maximum={maxTokens} contextRef={contextRef} t={t} />
      <div className="l4-watch-next"><CandidateBoard candidates={viewed?.candidates} selectedId={viewed?.selected.token_id} reviewing={reviewStep} onLatest={() => setReviewStep(null)} t={t} />
        <section className="l4-watch-temperature" data-guide-target="lesson4-temperature"><label htmlFor="l4-watch-temperature"><strong>{t("mission4.live.lab.temperature")}</strong><output>{temperature.toFixed(1)}</output></label><input id="l4-watch-temperature" type="range" min="0.4" max="1.6" step="0.1" value={temperature} style={{ "--temperature-position":`${((temperature - .4) / 1.2) * 100}%` }} onChange={event => setTemperature(Number(event.target.value))} aria-valuetext={t("mission4.live.lab.temperatureAria", { value:temperature.toFixed(1), description:temperatureDescription })} /><div><span>{t("mission4.live.lab.moreFocused")}</span><span>{t("mission4.live.lab.moreSpread")}</span></div><p>{t("mission4.live.lab.temperatureApplies")}</p></section>
      </div>
    </div>
    <History steps={steps} reviewStep={reviewStep} onReview={step => { if (runState === "running") pause(); setReviewStep(step); }} scrollerRef={historyRef} t={t} />
    <p className="l4-live-announcement" aria-live="polite">{message ? t(`mission4.live.lab.${message.key}`, message.params) : ""}</p>
  </div>;
}
