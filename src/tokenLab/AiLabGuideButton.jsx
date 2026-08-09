import React from "react";
import { ArrowUpRight, CircleHelp } from "lucide-react";

export default function AiLabGuideButton({ compact = false, stage = "tokenize", disabled = false, attention = false, t, onStart, tourId }) {
  const label = compact ? t("tokenLab.tour.guide") : t("tokenLab.tour.replay");
  return <button type="button" className={`ai-lab-guide-button stage-${stage} ${compact ? "compact" : "hero"} ${attention ? "attention" : ""}`} data-tour-id={tourId} aria-label={t("tokenLab.tour.replay")} title={t("tokenLab.tour.replay")} disabled={disabled} onClick={() => { if (!disabled) onStart(); }}><CircleHelp size={compact ? 17 : 18} strokeWidth={1.8} /><span>{label}</span>{!compact && <ArrowUpRight className="ai-lab-guide-direction" size={15} strokeWidth={1.8} />}</button>;
}
