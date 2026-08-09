import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle, ArrowRight, Check, ChevronLeft, ChevronRight,
  CircleDot, LoaderCircle, Pause, Play, RefreshCw, RotateCcw
} from "lucide-react";
import useLivePredictionModel from "./useLivePredictionModel.js";

const DEFAULT_PROMPT = "The little robot opened the";
const STARTERS = ["The cat sat on the", "Today the weather feels", "A dragon found a"];
const MAX_PROMPT_LENGTH = 120;
const TOKEN_LIMITS = [5, 10, 20, 50, 100];
const VISUAL_HOLD_MS = 550;

const sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration));

function CandidateBoard({ candidates = [], selectedId, reviewing, onLatest }) {
  const maximum = candidates[0]?.probability || 1;
  return <section className="l4-watch-candidates" aria-labelledby="l4-watch-candidate-title">
    <header><div><h3 id="l4-watch-candidate-title">{reviewing ? `Reviewing Step ${reviewing}` : "What could come next?"}</h3><p>Top predictions from the real model</p></div>{reviewing && <button type="button" className="outline" onClick={onLatest}><ArrowRight />Return to latest</button>}</header>
    {candidates.length ? <ol>{candidates.map((candidate, index) => <li className={selectedId === candidate.token_id ? "is-selected" : ""} key={candidate.token_id}>
      <b>{index + 1}</b><span title={candidate.raw_token}>{candidate.display_token}</span><i aria-hidden="true"><em style={{ width:`${(candidate.probability / maximum) * 100}%` }} /></i><strong>{(candidate.probability * 100).toFixed(1)}%</strong>{selectedId === candidate.token_id && <small><Check />selected</small>}
    </li>)}</ol> : <div className="l4-watch-empty"><CircleDot /><p>Run the model to see five real next-Token probabilities.</p></div>}
    <p className="l4-watch-top-five">Top 5 shown. Many other Tokens may also have smaller probabilities.</p>
  </section>;
}

function CurrentContext({ text, latest, generated, maximum, contextRef }) {
  return <section className="l4-watch-context" aria-labelledby="l4-watch-context-title">
    <h3 id="l4-watch-context-title">Current context <small>(live text)</small></h3>
    <div ref={contextRef} className="l4-watch-context-text" aria-live="polite">
      {latest ? <>{latest.before}<mark aria-label={`Latest generated Token: ${latest.display}`}>{latest.raw}</mark></> : text}
    </div>
    <span>Tokens generated: <b>{generated} / {maximum}</b></span>
  </section>;
}

function History({ steps, reviewStep, onReview, scrollerRef }) {
  function scroll(direction) { scrollerRef.current?.scrollBy({ left:direction * 460, behavior:"smooth" }); }
  return <section className="l4-watch-history" aria-labelledby="l4-watch-history-title">
    <header><div><h3 id="l4-watch-history-title">Generation history</h3><p>Showing the most recent 5 steps. Scroll to review earlier steps.</p></div><div><button type="button" aria-label="Scroll history left" onClick={() => scroll(-1)}><ChevronLeft /></button><button type="button" aria-label="Scroll history right" onClick={() => scroll(1)}><ChevronRight /></button></div></header>
    <div ref={scrollerRef} className="l4-watch-history-track" tabIndex="0" aria-label="Generated Token history">
      {steps.length ? steps.map(step => <button type="button" className={`${reviewStep === step.step ? "is-reviewing" : ""} ${step.step === steps.length ? "is-latest" : ""}`} onClick={() => onReview(step.step)} key={step.step}><small>Step {step.step}</small><strong>{step.selected.display_token}</strong><span>{(step.selected.probability * 100).toFixed(1)}%</span></button>) : <p>Your generated Tokens will appear here one step at a time.</p>}
    </div>
  </section>;
}

export default function LivePredictionLab({ t, onSuccessfulPrediction }) {
  const model = useLivePredictionModel();
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [currentText, setCurrentText] = useState(DEFAULT_PROMPT);
  const [steps, setSteps] = useState([]);
  const [temperature, setTemperature] = useState(1);
  const [generationMode, setGenerationMode] = useState("auto");
  const [maxTokens, setMaxTokens] = useState(20);
  const [runState, setRunState] = useState("idle");
  const [latestHighlight, setLatestHighlight] = useState(null);
  const [reviewStep, setReviewStep] = useState(null);
  const [message, setMessage] = useState("");
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

  function pause() {
    pauseRequestedRef.current = true;
    setRunState("paused");
    setMessage("Generation paused. The current context and history are preserved.");
  }

  function clearGeneration(nextPrompt = prompt) {
    runIdRef.current += 1;
    pauseRequestedRef.current = true;
    model.cancel();
    currentTextRef.current = nextPrompt;
    stepsRef.current = [];
    setCurrentText(nextPrompt);
    setSteps([]);
    setLatestHighlight(null);
    setReviewStep(null);
    setRunState("idle");
    setMessage("");
    completionRef.current = false;
  }

  function chooseStarter(starter) { setPrompt(starter); clearGeneration(starter); }
  function updatePrompt(value) { setPrompt(value); clearGeneration(value); }

  async function performOne(runId) {
    if (stepsRef.current.length >= maxTokensRef.current) return { limit:true };
    const before = currentTextRef.current;
    const started = performance.now();
    const prediction = await model.predict({ text:before, temperature:temperatureRef.current, mode:"greedy", top_k:5 });
    if (runId !== runIdRef.current) return { stale:true };
    const after = before + prediction.selected.raw_token;
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
    stepsRef.current = nextSteps;
    setCurrentText(after);
    setSteps(nextSteps);
    setLatestHighlight({ before, raw:prediction.selected.raw_token, display:prediction.selected.display_token });
    setMessage(`Step ${step.step}: selected ${prediction.selected.display_token}. The updated text is now the next context.`);
    if (nextSteps.length >= 2 && !completionRef.current) { completionRef.current = true; onSuccessfulPrediction?.(); }
    return { prediction, elapsed:performance.now() - started, limit:nextSteps.length >= maxTokensRef.current };
  }

  async function runAuto({ again = false } = {}) {
    if (autoLoopRef.current || model.status === "predicting") return;
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
        if (outcome.prediction?.is_eos) { setRunState("complete"); setMessage("The model produced its end-of-text Token."); break; }
        if (outcome.limit) { setRunState("limit"); setMessage(`Generation paused at the ${maxTokensRef.current}-Token limit.`); break; }
        await sleep(Math.max(0, VISUAL_HOLD_MS - (outcome.elapsed || 0)));
      }
    } catch (failure) {
      if (failure.message !== "Live model request cancelled.") { setRunState("error"); setMessage(failure.message); }
    } finally {
      autoLoopRef.current = false;
      if (pauseRequestedRef.current && runId === runIdRef.current) setRunState("paused");
    }
  }

  async function runOneStep() {
    if (model.status === "predicting" || stepsRef.current.length >= maxTokensRef.current) return;
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
      if (failure.message !== "Live model request cancelled.") { setRunState("error"); setMessage(failure.message); }
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
    if (runState === "limit" && stepsRef.current.length < next) { setRunState("paused"); setMessage(`Limit raised to ${next}. You can resume from the current context.`); }
  }

  function retryPrediction() {
    model.retry();
    setRunState(stepsRef.current.length ? "paused" : "idle");
    setMessage("");
    if (generationMode === "auto") runAuto();
    else runOneStep();
  }

  const viewed = reviewStep ? steps.find(step => step.step === reviewStep) : steps.at(-1);
  const busy = model.status === "predicting";
  const canRun = prompt.trim() && prompt.length <= MAX_PROMPT_LENGTH && !busy;
  const autoLabel = runState === "running" ? "Pause" : runState === "paused" ? "Resume" : runState === "complete" ? "Run again" : runState === "limit" ? "Continue" : "Run";

  return <div className="lesson-4-live-lab l4-watch-lab">
    <div className="l4-watch-prompt-panel">
      <section className="l4-watch-prompt"><label htmlFor="l4-watch-input"><input id="l4-watch-input" aria-label="Text beginning" value={prompt} maxLength={MAX_PROMPT_LENGTH} disabled={steps.length > 0 || runState === "running"} onChange={event => updatePrompt(event.target.value)} /><small>{prompt.length} / {MAX_PROMPT_LENGTH}</small></label><button type="button" className="primary" disabled={runState !== "running" && (!canRun || (runState === "limit" && steps.length >= maxTokens))} onClick={() => generationMode === "auto" ? (runState === "running" ? pause() : runAuto({ again:runState === "complete" })) : runOneStep()}>{runState === "running" ? <Pause /> : busy ? <LoaderCircle className="is-spinning" /> : generationMode === "step" ? <ArrowRight /> : <Play />}{generationMode === "auto" ? autoLabel : "Predict next Token"}</button></section>
      <div className="l4-watch-examples"><span>Try an example:</span>{STARTERS.map(starter => <button type="button" disabled={runState === "running"} onClick={() => chooseStarter(starter)} key={starter}>{starter}</button>)}<button type="button" className="l4-watch-reset" onClick={() => clearGeneration(prompt)}><RotateCcw />Reset</button></div>
    </div>
    <section className="l4-watch-controls">
      <fieldset><legend>Generation mode</legend><div><button type="button" aria-pressed={generationMode === "auto"} onClick={() => switchMode("auto")}><Play />Auto <small>recommended</small></button><button type="button" aria-pressed={generationMode === "step"} onClick={() => switchMode("step")}><CircleDot />Step by step</button></div></fieldset>
      <label>Max Tokens<select value={maxTokens} onChange={event => changeLimit(event.target.value)}>{TOKEN_LIMITS.map(limit => <option value={limit} key={limit}>{limit} Tokens</option>)}</select></label>
      <span className={`l4-watch-run-status is-${runState}`}><i />{busy ? "Predicting…" : runState === "running" ? "Generating…" : runState === "paused" ? "Paused" : runState === "limit" ? "Token limit reached" : runState === "complete" ? "Generation complete" : "Ready"}</span>
    </section>
    {model.status === "error" && <div className="l4-watch-error" role="alert"><AlertCircle /><div><strong>The model couldn't respond just now.</strong><p>Please try the prediction again.</p></div><button type="button" onClick={retryPrediction}><RefreshCw />Try again</button></div>}
    <div className="l4-watch-workspace">
      <CurrentContext text={currentText} latest={latestHighlight} generated={steps.length} maximum={maxTokens} contextRef={contextRef} />
      <div className="l4-watch-next"><CandidateBoard candidates={viewed?.candidates} selectedId={viewed?.selected.token_id} reviewing={reviewStep} onLatest={() => setReviewStep(null)} />
        <section className="l4-watch-temperature"><label htmlFor="l4-watch-temperature"><strong>Temperature</strong><output>{temperature.toFixed(1)}</output></label><input id="l4-watch-temperature" type="range" min="0.4" max="1.6" step="0.1" value={temperature} onChange={event => setTemperature(Number(event.target.value))} aria-valuetext={`Temperature ${temperature.toFixed(1)}. ${temperature < .8 ? "The strongest choices stand out more." : temperature > 1.2 ? "More choices get noticeable chances." : "Balanced probability spread."}`} /><div><span>More focused</span><span>More spread out</span></div><p>Applies to the next real prediction.</p></section>
      </div>
    </div>
    <History steps={steps} reviewStep={reviewStep} onReview={step => { if (runState === "running") pause(); setReviewStep(step); }} scrollerRef={historyRef} />
    <p className="l4-live-announcement" aria-live="polite">{message}</p>
  </div>;
}
