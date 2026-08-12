import React, { Fragment, useMemo, useState } from "react";
import { AlertCircle, ArrowDown, ArrowLeftRight, ArrowRight, BrainCircuit, Check, CircleDot, Hash, Layers3, LoaderCircle, Play, RefreshCcw, RotateCcw, ScanSearch, Shuffle, Sparkles, Type } from "lucide-react";
import { tokenizeWithQwen, validateQwenTokenizerInput } from "../../mission1/qwenTokenizer.js";
import { useI18n } from "../../i18n/index.jsx";
import AiLabStickerGuide from "../../playfulLearning/AiLabStickerGuide.jsx";
import { changedTokenIndexes, getComparePairs, getDefaultCompareInputs, swapPairSides } from "./compareData.js";
import "./compareStage.css";

const layers = ["text", "tokens", "context", "prediction"];
const layerIcons = { text: Type, tokens: Hash, context: Layers3, prediction: BrainCircuit };

function HighlightedText({ text, highlights }) {
  if (!highlights.length) return text;
  const pattern = new RegExp(`(${highlights.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(pattern).map((part, index) => highlights.some((item) => item.toLowerCase() === part.toLowerCase()) ? <mark key={`${part}-${index}`}>{part}</mark> : <Fragment key={`${part}-${index}`}>{part}</Fragment>);
}

function InputCard({ side, text, highlights, custom, onChange, t }) {
  return <article className={`compare-input-card side-${side.toLowerCase()}`}>
    <header><span>{t("compareStage.inputs.label", { side })}</span><small>{text.length} / 200</small></header>
    {custom ? <textarea aria-label={t("compareStage.inputs.label", { side })} maxLength={200} value={text} onChange={(event) => onChange(event.target.value)} /> : <p><HighlightedText text={text} highlights={highlights} /></p>}
    <div>{highlights.length ? highlights.map((word) => <span key={word}><Check size={13} />{word}</span>) : <span><CircleDot size={13} />{t("compareStage.inputs.baseline")}</span>}</div>
  </article>;
}

function TokenStrip({ result, changed, side, t }) {
  return <article className={`compare-token-side side-${side.toLowerCase()}`}><header><span>{t("compareStage.inputs.label", { side })}</span><strong>{t("compareStage.tokens.count", { count: result.count })}</strong></header><div>{result.visualGroups.map((group, index) => <span key={`${group.startIndex}-${group.ids.join("-")}`} className={changed[index] ? "changed" : "same"}><b>{group.decodedPiece || "␠"}</b><small>ID {group.ids.join("+")}</small>{changed[index] && <em>{t("compareStage.tokens.changed")}</em>}</span>)}</div></article>;
}

function PredictionRace({ candidates, side, t }) {
  return <article className={`compare-prediction-side side-${side.toLowerCase()}`}><header>{t("compareStage.inputs.label", { side })}</header>{candidates.map(([token, probability], index) => <div key={token}><span><b>{token.trim() || token}</b><small>{probability}%</small></span><i><em style={{ width: `${probability}%` }} /></i>{index === 0 && <strong><Sparkles size={13} />{t("compareStage.prediction.frontRunner")}</strong>}</div>)}</article>;
}

export default function CompareStagePage({ transientContract, onRunComparison, onNavigateStage }) {
  const { language, t } = useI18n();
  const pairs = getComparePairs(language);
  const [pairIndex, setPairIndex] = useState(0);
  const [swapped, setSwapped] = useState(false);
  const [custom, setCustom] = useState(false);
  const [customInputs, setCustomInputs] = useState(() => {
    const defaults = getDefaultCompareInputs(language);
    return [transientContract?.input || defaults[0], defaults[1]];
  });
  const [results, setResults] = useState(null);
  const [layer, setLayer] = useState("text");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [replaying, setReplaying] = useState(false);
  const basePair = pairs[pairIndex];
  const pair = useMemo(() => swapped ? swapPairSides(basePair) : basePair, [basePair, swapped]);
  const inputs = custom ? customInputs : pair.inputs;
  const availableLayers = custom ? ["text", "tokens"] : layers;

  function clearRun(nextLayer = "text") { setResults(null); setLayer(nextLayer); setStatus("idle"); setError(""); }
  async function runComparison() {
    const validations = inputs.map((input) => validateQwenTokenizerInput(input));
    if (validations.some(Boolean)) { setError(t(validations.includes("empty") ? "compareStage.errors.empty" : "compareStage.errors.invalid")); return; }
    setStatus("loading"); setError("");
    try {
      const nextResults = await Promise.all(inputs.map((input) => tokenizeWithQwen(input)));
      setResults(nextResults); setStatus("ready"); setLayer("tokens"); onRunComparison?.();
    } catch { setStatus("error"); setError(t("compareStage.errors.load")); }
  }
  function choosePair(index) { setPairIndex(index); setSwapped(false); setCustom(false); clearRun(); }
  function swapSides() {
    if (custom) setCustomInputs(([a, b]) => [b, a]); else setSwapped((value) => !value);
    if (results) setResults(([a, b]) => [b, a]);
    setReplaying(false); requestAnimationFrame(() => setReplaying(true));
  }
  function another() { choosePair((pairIndex + 1) % pairs.length); }
  function restart() { const defaults = getDefaultCompareInputs(language); setPairIndex(0); setSwapped(false); setCustom(false); setCustomInputs([transientContract?.input || defaults[0], defaults[1]]); clearRun(); }
  function replay() { setReplaying(false); requestAnimationFrame(() => setReplaying(true)); }
  function startCustom() { setCustom(true); setSwapped(false); clearRun(); }
  function moveLayerTab(event) {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key) || !results) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const index = availableLayers.indexOf(layer);
    const next = availableLayers[(index + direction + availableLayers.length) % availableLayers.length];
    setLayer(next);
    window.requestAnimationFrame(() => document.getElementById(`compare-tab-${next}`)?.focus());
  }

  const tokenChanges = results ? [changedTokenIndexes(results[0].visualGroups, results[1].visualGroups), changedTokenIndexes(results[1].visualGroups, results[0].visualGroups)] : null;
  const discoveryKey = custom ? "custom" : pair.id;

  return <section className={`compare-stage ${replaying ? "replaying" : ""}`} aria-labelledby="compare-stage-title">
    <header className="compare-hero" data-tour-id="compare-stage"><AiLabStickerGuide src="/assets/img/mission3-robot-hallucination.png" className="compare-hero-robot" /><div><span>{t("compareStage.header.term")}</span><h2 id="compare-stage-title">{t("compareStage.header.title")}</h2><p>{t("compareStage.header.intro")}</p></div><button type="button" className="outline" data-tour-id="compare-reset" onClick={restart}><RotateCcw size={16} />{t("compareStage.actions.restart")}</button></header>

    <nav className="compare-categories" aria-label={t("compareStage.categories.label")}>{pairs.map((item, index) => <button type="button" key={item.id} aria-pressed={!custom && pairIndex === index} className={!custom && pairIndex === index ? "active" : ""} onClick={() => choosePair(index)}><span>{index + 1}</span><strong>{t(`compareStage.categories.${item.id}.title`)}</strong><small>{t(`compareStage.categories.${item.id}.hint`)}</small></button>)}<button type="button" aria-pressed={custom} className={custom ? "active custom" : "custom"} onClick={startCustom}><Type size={18} /><strong>{t("compareStage.custom.title")}</strong><small>{t("compareStage.custom.hint")}</small></button></nav>

    <section className="compare-desk" data-tour-id="compare-inputs"><div className="compare-desk-head"><div><small>{t("compareStage.workspace.eyebrow")}</small><h3>{custom ? t("compareStage.custom.title") : t(`compareStage.categories.${pair.id}.title`)}</h3></div><div className="compare-source-notes">{custom && transientContract && <span>{t("numbersStage.notice.transient")}</span>}{language !== "en" && !custom && <span>{t("compareStage.workspace.english")}</span>}</div></div><div className="compare-input-grid"><InputCard side="A" text={inputs[0]} highlights={custom ? [] : pair.highlights[0]} custom={custom} onChange={(value) => { setCustomInputs(([a, b]) => [value, b]); clearRun(); }} t={t} /><div className="compare-divider"><AiLabStickerGuide src="/assets/img/mission-robot-pointing.png" className="compare-desk-robot" /><ArrowLeftRight size={20} /><span>{t("compareStage.workspace.comparedWith")}</span></div><InputCard side="B" text={inputs[1]} highlights={custom ? [] : pair.highlights[1]} custom={custom} onChange={(value) => { setCustomInputs(([a, b]) => [a, value]); clearRun(); }} t={t} /></div><div className="compare-desk-actions"><button type="button" className="primary" data-tour-id="compare-run" disabled={status === "loading"} onClick={runComparison}>{status === "loading" ? <LoaderCircle className="compare-spinner" size={18} /> : <Play size={18} />}{t(status === "loading" ? "compareStage.actions.running" : results ? "compareStage.actions.runAgain" : "compareStage.actions.run")}</button><button type="button" className="outline" onClick={swapSides}><ArrowLeftRight size={17} />{t("compareStage.actions.swap")}</button><button type="button" className="outline" onClick={another}><Shuffle size={17} />{t("compareStage.actions.another")}</button><button type="button" className="outline" disabled={!results} onClick={replay}><RefreshCcw size={17} />{t("compareStage.actions.replay")}</button></div>{error && <p className="compare-error" role="alert"><AlertCircle size={17} />{error}</p>}</section>

    <section className="compare-investigation" aria-live="polite"><div className="compare-layer-tabs" data-tour-id="compare-layer-tabs" role="tablist" aria-label={t("compareStage.layers.label")} onKeyDown={moveLayerTab}>{layers.map((item) => { const Icon = layerIcons[item]; const disabled = !results || !availableLayers.includes(item); return <button id={`compare-tab-${item}`} type="button" role="tab" aria-selected={layer === item} aria-controls={`compare-panel-${item}`} tabIndex={layer === item ? 0 : -1} disabled={disabled} className={layer === item ? "active" : ""} onClick={() => setLayer(item)} key={item}><Icon size={18} /><span>{t(`compareStage.layers.${item}`)}</span>{!availableLayers.includes(item) && custom && <small>{t("compareStage.layers.reviewedOnly")}</small>}</button>; })}</div>
      {!results ? <div className="compare-ready"><ScanSearch size={30} /><strong>{t("compareStage.workspace.readyTitle")}</strong><p>{t("compareStage.workspace.readyBody")}</p><ArrowDown /></div> : <div id={`compare-panel-${layer}`} role="tabpanel" className={`compare-layer-panel layer-${layer}`}>
        {layer === "text" && <div className="compare-text-result"><InputCard side="A" text={inputs[0]} highlights={custom ? [] : pair.highlights[0]} t={t} /><InputCard side="B" text={inputs[1]} highlights={custom ? [] : pair.highlights[1]} t={t} /></div>}
        {layer === "tokens" && <div className="compare-token-result" data-tour-id="compare-tokens"><div className="compare-real-label"><Check size={15} /><strong>{t("compareStage.boundary.real")}</strong><span>{t("compareStage.boundary.realTokens")}</span></div><div><TokenStrip side="A" result={results[0]} changed={tokenChanges[0]} t={t} /><TokenStrip side="B" result={results[1]} changed={tokenChanges[1]} t={t} /></div></div>}
        {layer === "context" && !custom && <div className="compare-context-result"><div className="compare-teaching-label"><Layers3 size={16} /><strong>{t("compareStage.boundary.teaching")}</strong><span>{t("compareStage.boundary.contextNote")}</span></div><div>{pair.contextClues.map((clues, side) => <article className={`side-${side ? "b" : "a"}`} key={side}><header>{t("compareStage.inputs.label", { side: side ? "B" : "A" })}</header><div>{clues.map((clue) => <span key={clue}>{clue}</span>)}</div><ArrowDown /><p>{t(`compareStage.discoveries.${pair.id}.context${side ? "B" : "A"}`)}</p></article>)}</div></div>}
        {layer === "prediction" && !custom && <div className="compare-prediction-result" data-tour-id="compare-context-prediction"><div className="compare-teaching-label"><BrainCircuit size={16} /><strong>{t("compareStage.boundary.teaching")}</strong><span>{t("compareStage.boundary.probabilityNote")}</span></div><div><PredictionRace side="A" candidates={pair.predictions[0]} t={t} /><PredictionRace side="B" candidates={pair.predictions[1]} t={t} /></div></div>}
        <div className="compare-discovery" data-tour-id="compare-discovery"><Sparkles size={21} /><div><small>{t("compareStage.discovery.label")}</small><strong>{t(`compareStage.discoveries.${discoveryKey}.${layer}`)}</strong></div></div>
      </div>}
    </section>

    <aside className="compare-truth"><ScanSearch size={20} /><div><strong>{t("compareStage.boundary.title")}</strong><p>{t("compareStage.boundary.summary")}</p></div><span>{t("compareStage.boundary.notLoaded")}</span></aside>

    <section className="compare-journey"><div><small>{t("compareStage.journey.eyebrow")}</small><h3>{t("compareStage.journey.title")}</h3></div><ol>{[Type, Hash, CircleDot, Layers3, BrainCircuit].map((Icon, index) => <li key={index}><Icon size={20} /><span>{t(`compareStage.journey.steps.${["text", "tokens", "ids", "context", "prediction"][index]}`)}</span>{index < 4 && <ArrowRight />}</li>)}</ol><div className="compare-cascade"><RefreshCcw size={19} /><strong>{t("compareStage.journey.change")}</strong><ArrowRight /><span>{t("compareStage.journey.effect")}</span></div><nav><button type="button" onClick={() => onNavigateStage("tokenize")}>{t("compareStage.journey.links.tokenize")}</button><button type="button" onClick={() => onNavigateStage("context")}>{t("compareStage.journey.links.context")}</button><button type="button" onClick={() => onNavigateStage("predict")}>{t("compareStage.journey.links.predict")}</button><button type="button" onClick={restart}>{t("compareStage.journey.links.restart")}</button></nav></section>
  </section>;
}
