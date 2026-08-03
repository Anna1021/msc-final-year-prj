import React, { useEffect, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

const OPTIONS = ["paragraph", "piece", "word", "picture"];

export default function Mission1QuickCheckA({ t, onComplete, resetKey }) {
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("idle");

  useEffect(() => {
    setSelected("");
    setResult("idle");
  }, [resetKey]);

  function check() {
    if (!selected) return;
    const next = selected === "piece" ? "correct" : "incorrect";
    setResult(next);
    if (next === "correct") onComplete?.();
  }

  return <div className="m1-quick-check" data-tour-id="m1-quick-check-a">
    <p className="m1-question">{t("mission1.checkA.question")}</p>
    <div className="m1-answer-list" role="radiogroup" aria-label={t("mission1.checkA.question")}>
      {OPTIONS.map((option, index) => <button type="button" role="radio" aria-checked={selected === option} className={selected === option ? "selected" : ""} key={option} onClick={() => { setSelected(option); setResult("idle"); }}><span>{String.fromCharCode(65 + index)}</span>{t(`mission1.checkA.options.${option}`)}</button>)}
    </div>
    <div className="m1-check-actions"><button type="button" className="primary" disabled={!selected} onClick={check}>{t("mission1.actions.check")}</button><button type="button" className="outline" onClick={() => { setSelected(""); setResult("idle"); }}><RotateCcw size={17} strokeWidth={1.8} />{t("mission1.actions.retry")}</button></div>
    {result !== "idle" && <div className={`m1-inline-message ${result}`} role="status">{result === "correct" ? <CheckCircle2 size={19} strokeWidth={1.8} /> : <XCircle size={19} strokeWidth={1.8} />}{t(`mission1.checkA.feedback.${result}.${selected}`)}</div>}
  </div>;
}
