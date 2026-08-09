import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Undo2, XCircle } from "lucide-react";
import { readableTokenPiece } from "../mission1/mission1Challenges.js";
import { createTokenLabChallengePieces, isTokenLabChallengeCorrect } from "./tokenLabChallenge.js";

function Label({ piece, t }) {
  const readable = readableTokenPiece(piece.decodedPiece);
  return <>{readable.leadingSpace && <small aria-label={t("tokenLab.tokens.leadingSpace")}>␠</small>}<b>{readable.text}</b>{piece.tokenCount > 1 && <em>{t("tokenLab.tokens.groupCount", { count: piece.tokenCount })}</em>}</>;
}

export default function TokenLabChallenge({ result, t, onClose }) {
  const [source, setSource] = useState(() => createTokenLabChallengePieces(result));
  const [answer, setAnswer] = useState([]);
  const [status, setStatus] = useState("idle");

  function reset() {
    setSource(createTokenLabChallengePieces(result));
    setAnswer([]);
    setStatus("idle");
  }
  useEffect(reset, [result]);

  function add(index) {
    const piece = source[index];
    if (!piece) return;
    setSource((items) => items.filter((_, itemIndex) => itemIndex !== index));
    setAnswer((items) => [...items, piece]);
    setStatus("idle");
  }
  function remove(index) {
    const piece = answer[index];
    if (!piece) return;
    setAnswer((items) => items.filter((_, itemIndex) => itemIndex !== index));
    setSource((items) => [...items, piece]);
    setStatus("idle");
  }
  function move(index, offset) {
    const target = index + offset;
    if (target < 0 || target >= answer.length) return;
    setAnswer((items) => { const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; return next; });
    setStatus("idle");
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
    setStatus("idle");
  }
  function check() {
    setStatus(isTokenLabChallengeCorrect(answer, result.visualGroups.length) ? "correct" : "incorrect");
  }

  return <section className="token-lab-card token-lab-challenge token-lab-scroll-target" aria-labelledby="token-lab-challenge-title">
    <div className="token-lab-section-head"><div><span>{t("tokenLab.challenge.eyebrow")}</span><h2 id="token-lab-challenge-title">{t("tokenLab.challenge.title")}</h2></div><button type="button" className="outline" onClick={onClose}><Undo2 size={17} strokeWidth={1.8} />{t("tokenLab.challenge.return")}</button></div>
    <div className="token-lab-original"><small>{t("tokenLab.challenge.original")}</small><strong>{result.text}</strong><span>{t("tokenLab.challenge.groupCount", { count: result.visualGroups.length })}</span></div>
    <p>{t("tokenLab.challenge.instructions")}</p>
    <div className="token-lab-piece-bank" aria-label={t("tokenLab.challenge.available")} onDragOver={(event) => event.preventDefault()}>{source.map((piece, index) => <button type="button" draggable key={piece.id} onDragStart={(event) => event.dataTransfer.setData("application/json", JSON.stringify({ area: "source", index }))} onClick={() => add(index)}><Label piece={piece} t={t} /></button>)}</div>
    <div className={`token-lab-answer ${answer.length ? "has-pieces" : ""}`} aria-label={t("tokenLab.challenge.answer")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropAt(event, answer.length)}>
      {!answer.length && <span>{t("tokenLab.challenge.placeholder")}</span>}
      {answer.map((piece, index) => <div className="token-lab-answer-piece" draggable key={piece.id} onDragStart={(event) => event.dataTransfer.setData("application/json", JSON.stringify({ area: "answer", index }))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.stopPropagation(); dropAt(event, index); }}><button type="button" className="token-lab-piece" onClick={() => remove(index)} title={t("tokenLab.challenge.remove")}><Label piece={piece} t={t} /></button><span><button type="button" disabled={index === 0} aria-label={t("tokenLab.challenge.left")} onClick={() => move(index, -1)}><ArrowLeft size={14} strokeWidth={1.8} /></button><button type="button" disabled={index === answer.length - 1} aria-label={t("tokenLab.challenge.right")} onClick={() => move(index, 1)}><ArrowRight size={14} strokeWidth={1.8} /></button></span></div>)}
    </div>
    <p className="token-lab-keyboard-help">{t("tokenLab.challenge.keyboard")}</p>
    <div aria-live="polite">{status !== "idle" && <div className={`token-lab-message ${status}`}>{status === "correct" ? <CheckCircle2 size={19} strokeWidth={1.8} /> : <XCircle size={19} strokeWidth={1.8} />}{t(`tokenLab.challenge.feedback.${status}`)}</div>}</div>
    <div className="token-lab-actions"><button type="button" className="primary" disabled={answer.length !== result.visualGroups.length} onClick={check}>{t("tokenLab.actions.check")}</button><button type="button" className="outline" onClick={reset}><RotateCcw size={17} strokeWidth={1.8} />{status === "incorrect" ? t("tokenLab.actions.retry") : t("tokenLab.actions.reset")}</button></div>
  </section>;
}
