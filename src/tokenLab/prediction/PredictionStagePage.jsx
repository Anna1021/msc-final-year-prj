import React, { useMemo, useState } from "react";
import { ArrowDown, Check, Gauge, Lightbulb, RefreshCcw, RotateCcw, Shuffle, Sparkles, Trophy, Undo2, WandSparkles } from "lucide-react";
import { useI18n } from "../../i18n/index.jsx";
import AiLabStickerGuide from "../../playfulLearning/AiLabStickerGuide.jsx";
import { getPredictionContinuationSets, getPredictionExamples, likelihood, transformProbabilities, weightedChoice } from "./predictionData.js";
import "./predictionStage.css";

export default function PredictionStagePage({ onCandidateSelected }) {
  const { language, t } = useI18n();
  const examples = getPredictionExamples(language);
  const continuationSets = getPredictionContinuationSets(language);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [recentRuns, setRecentRuns] = useState([]);
  const [contextIndex, setContextIndex] = useState(0);
  const [temperature, setTemperature] = useState(50);
  const [generated, setGenerated] = useState([]);
  const [pulse, setPulse] = useState(false);
  const [lastChoice, setLastChoice] = useState("");
  const [raceReplay, setRaceReplay] = useState(false);
  const example = examples[exampleIndex % examples.length];
  const context = example.contexts[contextIndex];
  const candidateSource = generated.length ? continuationSets[(generated.length - 1) % continuationSets.length] : context.candidates;
  const distribution = useMemo(() => transformProbabilities(candidateSource, temperature), [candidateSource, temperature]);
  const text = `${context.prompt}${generated.join("")}`;

  function choose(token, model = false) {
    if (generated.length >= 5) return;
    setGenerated((items) => [...items, token]);
    setLastChoice(t(model ? "predictionStage.feedback.model" : "predictionStage.feedback.you", { token: token.trim() || token }));
    setPulse(true);
    onCandidateSelected?.();
    window.setTimeout(() => setPulse(false), 450);
  }
  function reset() { setGenerated([]); setLastChoice(""); }
  function restart() { setExampleIndex(0); setContextIndex(0); setTemperature(50); reset(); }
  function runComparison() {
    const predictable = weightedChoice(transformProbabilities(candidateSource, 10));
    const varied = weightedChoice(transformProbabilities(candidateSource, 90));
    setRecentRuns((runs) => [...runs, { predictable, varied }].slice(-2));
  }
  function replayRace() { setPulse(false); setRaceReplay(false); requestAnimationFrame(() => { setPulse(true); setRaceReplay(true); window.setTimeout(() => setRaceReplay(false), 700); }); }
  function another() {
    setExampleIndex((index) => (index + 1) % examples.length);
    setContextIndex(0); setTemperature(50); reset();
  }

  return <section className="prediction-stage" aria-labelledby="prediction-stage-title">
    <header className="predict-hero" data-tour-id="predict-stage">
      <div className="predict-title">
        <AiLabStickerGuide src="/assets/img/missions-robot-target.png" className="predict-hero-robot" />
        <div><span>{t("predictionStage.header.term")}</span><h2 id="prediction-stage-title">{t("predictionStage.header.title")}</h2><p>{t("predictionStage.header.intro")}</p></div>
      </div>
      <button type="button" className="outline" data-tour-id="predict-reset" onClick={restart}><RotateCcw size={16} />{t("predictionStage.actions.restart")}</button>
    </header>

    <div className="predict-truth" data-tour-id="predict-truth"><Lightbulb size={17} /><strong>{t("predictionStage.truth.label")}</strong></div>

    <section className="predict-story" data-tour-id="predict-context">
      <div className="predict-story-heading"><span className="predict-step-badge">1</span><div><small>{t("predictionStage.story.clueEyebrow")}</small><h3>{t("predictionStage.context.title")}</h3></div></div>
      <div className="context-switch">{example.contexts.map((item, index) => <button type="button" className={index === contextIndex ? "active" : ""} aria-pressed={index === contextIndex} onClick={() => { setContextIndex(index); reset(); }} key={item.id}>{item.prompt} …</button>)}</div>
      <div className={`predict-sentence ${pulse ? "pulse" : ""}`}><span>{text}</span><i aria-hidden="true">▍</i><div className="generated-strip" data-tour-id="predict-generated-text"><small>{t("predictionStage.generated.count", { count: generated.length })}</small>{generated.map((token, index) => <b key={`${token}-${index}`}>{token.trim() || token}</b>)}</div></div>
      <ArrowDown className="predict-flow-arrow" aria-hidden="true" />
    </section>

    <section className={`predict-race ${raceReplay ? "replaying" : ""}`} data-tour-id="predict-candidates">
      <div className="predict-section-head"><div><span className="predict-step-badge">2</span><div><small>{t("predictionStage.story.raceEyebrow")}</small><h3>{t("predictionStage.candidates.title")}</h3></div></div><button type="button" data-tour-id="predict-replay" aria-pressed={raceReplay} onClick={replayRace}><RefreshCcw size={15} />{t("predictionStage.actions.replay")}</button></div>
      <div className="predict-race-layout">
        <div className="predict-candidate-grid" data-tour-id="predict-probability-bars">{distribution.map((item, index) => <button type="button" key={item.token} className={index === 0 ? "front-runner" : ""} disabled={generated.length >= 5} onClick={() => choose(item.token)}>
          <span className="candidate-place">{index === 0 ? <Trophy size={17} /> : index + 1}</span>
          <span className="candidate-copy"><b>{item.token.trim() || item.token}</b><small>{t(`predictionStage.likelihood.${likelihood(item.probability)}`)}</small></span>
          <span className="candidate-score"><strong>{item.probability}%</strong><i><em style={{ width: `${item.probability}%` }} /></i></span>
          <span className="candidate-pick"><Check size={15} />{t("predictionStage.story.pick")}</span>
        </button>)}</div>
        <aside className="predict-guess-guide"><AiLabStickerGuide src="/assets/img/mission-robot-pointing.png" className="predict-guess-robot" /><p>{t("predictionStage.candidates.barHelp")}</p></aside>
      </div>
    </section>

    <section className="predict-controls" data-tour-id="predict-choice">
      <div className="temperature" data-tour-id="predict-temperature"><div className="predict-control-title"><span className="predict-step-badge">3</span><Gauge size={21} /><span><small>{t("predictionStage.temperature.term")}</small><strong>{t("predictionStage.temperature.title")}</strong></span></div><input aria-label={t("predictionStage.temperature.term")} type="range" min="0" max="100" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /><div><b>{t("predictionStage.temperature.predictable")}</b><output>{temperature}</output><b>{t("predictionStage.temperature.varied")}</b></div><p>{t("predictionStage.temperature.help")}</p></div>
      <div className="choice-controls"><strong>{t("predictionStage.story.chooseTitle")}</strong><button type="button" className="primary" data-tour-id="predict-model-choice" disabled={generated.length >= 5} onClick={() => choose(weightedChoice(distribution), true)}><WandSparkles size={17} />{t("predictionStage.actions.modelChoose")}</button><button type="button" className="outline" disabled={!generated.length} onClick={() => { setGenerated((items) => items.slice(0, -1)); setLastChoice(""); }}><Undo2 size={16} />{t("predictionStage.actions.undo")}</button><button type="button" className="outline" onClick={reset}>{t("predictionStage.actions.startAgain")}</button><button type="button" className="outline" onClick={another}><Shuffle size={16} />{t("predictionStage.actions.another")}</button><small>{t("predictionStage.generated.max")}</small></div>
    </section>

    {lastChoice && <div className="choice-feedback" aria-live="polite"><Sparkles size={18} /><strong>{lastChoice}</strong><span>{t("predictionStage.story.continue")}</span></div>}

    <section className="mini-comparison" data-tour-id="predict-comparison"><div><small>{t("predictionStage.story.compareEyebrow")}</small><h3>{t("predictionStage.story.compareTitle")}</h3><p>{t("predictionStage.story.compareHelp")}</p></div><button type="button" className="outline" onClick={runComparison}><RefreshCcw size={15} />{t("predictionStage.actions.replay")}</button><div className="comparison-runs">{recentRuns.length ? recentRuns.map((run, index) => <article key={index}><span><small>{t("predictionStage.temperature.predictable")}</small><b>{run.predictable.trim() || run.predictable}</b></span><span><small>{t("predictionStage.temperature.varied")}</small><b>{run.varied.trim() || run.varied}</b></span></article>) : <p>{t("predictionStage.story.compareEmpty")}</p>}</div></section>

    <footer className="predict-takeaways"><article><Trophy size={18} /><strong>{t("predictionStage.truth.patterns")}</strong></article><article><Gauge size={18} /><span>{t("predictionStage.truth.chance")}</span></article><article><Lightbulb size={18} /><span>{t("predictionStage.truth.fluent")}</span></article></footer>
  </section>;
}
