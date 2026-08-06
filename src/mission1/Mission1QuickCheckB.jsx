import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RefreshCcw, RotateCcw, XCircle } from "lucide-react";
import { getMission1ChallengePool, isCorrectChallengeOrder, readableTokenPiece, shuffleChallengePieces } from "./mission1Challenges.js";

function PieceLabel({ piece, t }) {
  const readable = readableTokenPiece(piece.decodedPiece);
  return <>{readable.leadingSpace && <small aria-label={t("mission1.tokens.leadingSpace")}>␠</small>}<b>{readable.text}</b></>;
}

export default function Mission1QuickCheckB({ language, t, onComplete, onResultChange, resetKey, visualVariant = "default" }) {
  const pool = useMemo(() => getMission1ChallengePool(language), [language]);
  const [fixtureIndex, setFixtureIndex] = useState(0);
  const fixture = pool[fixtureIndex % pool.length];
  const [source, setSource] = useState(() => shuffleChallengePieces(fixture));
  const [answer, setAnswer] = useState([]);
  const [result, setResult] = useState("idle");

  function reset(fixtureValue = fixture) {
    setSource(shuffleChallengePieces(fixtureValue));
    setAnswer([]);
    setResult("idle");
  }

  useEffect(() => {
    setFixtureIndex(0);
    reset(pool[0]);
  }, [language, resetKey]);

  useEffect(() => {
    reset(fixture);
  }, [fixture]);

  useEffect(() => {
    onResultChange?.(result);
  }, [onResultChange, result]);

  function addPiece(index) {
    const piece = source[index];
    if (!piece) return;
    setSource((items) => items.filter((_, itemIndex) => itemIndex !== index));
    setAnswer((items) => [...items, piece]);
    setResult("idle");
  }

  function removePiece(index) {
    const piece = answer[index];
    if (!piece) return;
    setAnswer((items) => items.filter((_, itemIndex) => itemIndex !== index));
    setSource((items) => [...items, piece]);
    setResult("idle");
  }

  function move(index, offset) {
    const target = index + offset;
    if (target < 0 || target >= answer.length) return;
    setAnswer((items) => {
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResult("idle");
  }

  function check() {
    if (answer.length !== fixture.count) return;
    const next = isCorrectChallengeOrder(answer) ? "correct" : "incorrect";
    setResult(next);
    if (next === "correct") onComplete?.();
  }

  function newChallenge() {
    const nextIndex = (fixtureIndex + 1) % pool.length;
    setFixtureIndex(nextIndex);
    if (nextIndex === fixtureIndex) reset(pool[nextIndex]);
  }

  function readDrag(event) {
    try { return JSON.parse(event.dataTransfer.getData("application/json")); } catch { return null; }
  }

  function dropAt(event, targetIndex) {
    event.preventDefault();
    const payload = readDrag(event);
    if (!payload) return;
    if (payload.area === "source") {
      const piece = source[payload.index];
      if (!piece) return;
      setSource((items) => items.filter((_, index) => index !== payload.index));
      setAnswer((items) => { const next = [...items]; next.splice(targetIndex, 0, piece); return next; });
    } else {
      setAnswer((items) => { const next = [...items]; const [piece] = next.splice(payload.index, 1); if (piece) next.splice(targetIndex, 0, piece); return next; });
    }
    setResult("idle");
  }

  return <div className="m1-order-challenge" data-tour-id="m1-quick-check-b">
    <div className="m1-challenge-sentence"><small>{t("mission1.checkB.originalSentence")}</small><strong>{fixture.text}</strong><span>{t("mission1.checkB.tokenCount", { count: fixture.count })}</span></div>
    <p>{t("mission1.checkB.instructions")}</p>
    {visualVariant === "paged" && <strong className="mission-paged-tray-label">{t("mission1.checkB.availablePieces")}</strong>}
    <div className="m1-piece-bank" aria-label={t("mission1.checkB.availablePieces")} onDragOver={(event) => event.preventDefault()}>{source.map((piece, index) => <button type="button" draggable key={piece.id} onDragStart={(event) => event.dataTransfer.setData("application/json", JSON.stringify({ area: "source", index }))} onClick={() => addPiece(index)}><PieceLabel piece={piece} t={t} /></button>)}</div>
    {visualVariant === "paged" && <strong className="mission-paged-tray-label">{t("mission1.checkB.answerZone")}</strong>}
    <div className={`m1-answer-zone ${answer.length ? "has-pieces" : ""}`} aria-label={t("mission1.checkB.answerZone")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropAt(event, answer.length)}>
      {!answer.length && <span>{t("mission1.checkB.answerPlaceholder")}</span>}
      {answer.map((piece, index) => <div className="m1-answer-piece" key={piece.id} draggable onDragStart={(event) => event.dataTransfer.setData("application/json", JSON.stringify({ area: "answer", index }))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.stopPropagation(); dropAt(event, index); }}><button type="button" className="m1-piece-main" onClick={() => removePiece(index)} title={t("mission1.checkB.removePiece")}><PieceLabel piece={piece} t={t} /></button><span className="m1-piece-controls"><button type="button" disabled={index === 0} aria-label={t("mission1.checkB.moveLeft")} onClick={() => move(index, -1)}><ArrowLeft size={14} strokeWidth={1.8} /></button><button type="button" disabled={index === answer.length - 1} aria-label={t("mission1.checkB.moveRight")} onClick={() => move(index, 1)}><ArrowRight size={14} strokeWidth={1.8} /></button></span></div>)}
    </div>
    <p className="m1-keyboard-help">{t("mission1.checkB.keyboardHelp")}</p>
    {result !== "idle" && <div className={`m1-inline-message ${result}`} role="status">{result === "correct" ? <CheckCircle2 size={19} strokeWidth={1.8} /> : <XCircle size={19} strokeWidth={1.8} />}{t(`mission1.checkB.feedback.${result}`)}</div>}
    {result === "correct" && visualVariant === "paged" && <div className="mission-paged-reconstruction" role="status"><span>{t("mission1Learning.separatePieces")}</span><ArrowRight size={19} strokeWidth={1.8} /><strong>{fixture.text}</strong><CheckCircle2 size={21} strokeWidth={1.8} /></div>}
    <div className="m1-check-actions"><button type="button" className="primary" disabled={answer.length !== fixture.count} onClick={check}>{t("mission1.actions.check")}</button><button type="button" className="outline" onClick={() => reset()}><RotateCcw size={17} strokeWidth={1.8} />{result === "incorrect" ? t("mission1.actions.retry") : t("mission1.actions.reset")}</button><button type="button" className="outline" onClick={newChallenge}><RefreshCcw size={17} strokeWidth={1.8} />{t("mission1.actions.newChallenge")}</button></div>
  </div>;
}
