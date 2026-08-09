import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowDown, ChevronDown, ChevronUp, FlaskConical, LoaderCircle, Play, RefreshCcw, RotateCcw } from "lucide-react";
import { QWEN_TOKENIZER, tokenizeWithQwen, validateQwenTokenizerInput } from "./qwenTokenizer.js";
import TokenPieces from "./TokenPieces.jsx";

const PRESETS = {
  en: ["Robots can misunderstand tokenisation.", "AI reads multilingual text differently!", "Spaces, emojis 🤖, and punctuation!"],
  zh: ["你好，AI Explorer！", "机器人也会把文字拆成 token。", "AI 会怎样读取标点？"],
  fr: ["Bonjour, petit robot!", "L’IA découpe le texte.", "Les tokens peuvent surprendre !"],
  de: ["Der Roboter lernt schnell.", "KI zerlegt Text in Tokens.", "Wie liest ein Modell Satzzeichen?"]
};

export default function QwenTokenizerPlayground({ language, t, onSuccessfulRun, exploreIndex, resetKey, visualVariant = "default", showModelNote = true }) {
  const presets = useMemo(() => PRESETS[language] || PRESETS.en, [language]);
  const [input, setInput] = useState(presets[0]);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [technicalOpen, setTechnicalOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    setInput(presets[0]);
    setResult(null);
    setError("");
    setStatus("idle");
    setTechnicalOpen(true);
  }, [language, resetKey, presets]);

  useEffect(() => {
    if (!exploreIndex) return;
    setInput(presets[exploreIndex % presets.length]);
    setResult(null);
    setError("");
    setStatus("idle");
    setTechnicalOpen(true);
  }, [exploreIndex, presets]);

  async function runTokenizer() {
    const validation = validateQwenTokenizerInput(input);
    if (validation === "empty") {
      setStatus("validation-error");
      setError(t("mission1.playground.emptyError"));
      return;
    }
    if (validation) {
      setStatus("validation-error");
      setError(t("mission1.playground.lengthError"));
      return;
    }
    setError("");
    setStatus(loaded ? "tokenizing" : "loading-tokenizer");
    try {
      const next = await tokenizeWithQwen(input);
      if (next.decoded !== input) throw new Error("Tokenizer round-trip validation failed.");
      setLoaded(true);
      setResult(next);
      setStatus("success");
      onSuccessfulRun?.(next);
    } catch {
      setStatus("load-error");
      setError(t("mission1.playground.loadError"));
    }
  }

  function restartActivity() {
    setInput("");
    setResult(null);
    setError("");
    setStatus("ready");
    setTechnicalOpen(true);
  }

  useEffect(() => {
    if (!result || visualVariant !== "paged") return;
    const resultNode = resultRef.current;
    const scrollContainer = resultNode?.closest(".mission-lesson-paged");
    if (!resultNode || !scrollContainer) return;
    const resultRect = resultNode.getBoundingClientRect();
    const safeBottom = window.innerHeight - 110;
    if (resultRect.top >= 90 && resultRect.bottom <= safeBottom) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    resultNode.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
  }, [result, visualVariant]);

  const busy = status === "loading-tokenizer" || status === "tokenizing";
  return <div className={`m1-playground ${visualVariant === "paged" ? "m1-playground--paged" : ""}`.trim()}>
    <div className="m1-playground-scene" aria-hidden="true"><FlaskConical size={22} strokeWidth={1.8} /><img src={visualVariant === "paged" ? "/assets/img/mission-robot-pointing.png" : "/assets/img/mission-robot-reading.png"} alt="" /></div>
    {showModelNote && <div className="m1-model-note"><span>{t("mission1.playground.modelLabel")}</span><strong>{QWEN_TOKENIZER.checkpoint}</strong></div>}
    <div className="m1-preset-row" aria-label={t("mission1.playground.presetsLabel")}>
      {presets.map((preset, index) => <button type="button" className={`m1-preset ${visualVariant === "paged" && input === preset ? "is-selected" : ""}`.trim()} aria-pressed={visualVariant === "paged" ? input === preset : undefined} key={preset} onClick={() => { setInput(preset); setResult(null); setStatus("ready"); }}><Play size={15} strokeWidth={1.8} />{visualVariant === "paged" ? <span><small>{t("mission1.playground.preset", { number: index + 1 })}</small><strong>{preset}</strong></span> : t("mission1.playground.preset", { number: index + 1 })}</button>)}
    </div>
    <label className="m1-input-label" htmlFor="m1-tokenizer-input"><strong>{t("mission1.playground.inputLabel")}</strong><span>{input.length} / 200</span></label>
    <textarea id="m1-tokenizer-input" data-tour-id="m1-token-input" maxLength={200} value={input} placeholder={t("mission1.playground.placeholder")} onChange={(event) => { setInput(event.target.value); setError(""); if (status === "validation-error") setStatus("ready"); }} />
    <div className="m1-playground-actions">
      <button type="button" className="primary" data-tour-id="m1-tokenize" disabled={busy} onClick={runTokenizer}>{busy ? <LoaderCircle className="m1-spinner" size={18} strokeWidth={1.8} /> : <Play size={18} strokeWidth={1.8} />}{status === "loading-tokenizer" ? t("mission1.playground.loading") : status === "tokenizing" ? t("mission1.playground.tokenizing") : t("mission1.playground.tokenize")}</button>
      {status === "load-error" && <button type="button" className="outline" onClick={runTokenizer}><RefreshCcw size={17} strokeWidth={1.8} />{t("mission1.actions.retry")}</button>}
      <button type="button" className="outline" onClick={restartActivity}><RotateCcw size={17} strokeWidth={1.8} />{t("mission1.actions.restartActivity")}</button>
    </div>
    {error && <div className="m1-inline-message error" role="alert"><AlertCircle size={18} strokeWidth={1.8} />{error}</div>}
    {result && <div className="m1-token-result" data-tour-id="m1-token-result" ref={resultRef} aria-live="polite">
      <div className="m1-result-heading"><div><small>{t("mission1.playground.originalText")}</small><strong>{result.text}</strong></div><div data-tour-id="m1-token-count"><strong>{result.count}</strong><small>{t("mission1.playground.totalTokens")}</small></div></div>
      {visualVariant === "paged" && <div className="m1-result-transform" aria-hidden="true"><span>{t("mission1.paged.writeStep")}</span><ArrowDown size={19} strokeWidth={1.8} /><span>{t("mission1.paged.discoverStep")}</span></div>}
      <TokenPieces groups={result.visualGroups} visualVariant={visualVariant === "paged" ? "verified" : "default"} t={t} />
      <p className="m1-space-legend"><span>␠</span>{t("mission1.tokens.spaceLegend")}</p>
      {visualVariant === "paged" && <p className="m1-playground-discovery"><strong>{t("mission1.paged.discoveryCount", { count: result.count })}</strong><span>{t("mission1.paged.discoveryNotice")}</span><em>{t("mission1Learning.changeDiscovery")}</em></p>}
      <button type="button" className="m1-technical-toggle" aria-expanded={technicalOpen} aria-controls="mission1-tokenizer-technical-details" onClick={() => setTechnicalOpen((open) => !open)}>{technicalOpen ? <ChevronUp size={17} strokeWidth={1.8} /> : <ChevronDown size={17} strokeWidth={1.8} />}{technicalOpen ? t("mission1.playground.hideTechnical") : t("mission1.playground.showTechnical")}</button>
      {technicalOpen && <div id="mission1-tokenizer-technical-details" className="m1-technical-details"><p>{t("mission1.playground.technicalOptional")}</p>{result.pieces.map((piece) => <code key={`${piece.index}-${piece.id}`}><span>#{piece.index + 1}</span><b>{piece.rawPiece}</b><small>ID {piece.id}</small></code>)}</div>}
    </div>}
  </div>;
}
