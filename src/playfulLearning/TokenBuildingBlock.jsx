import React from "react";
import { CheckCircle2 } from "lucide-react";

const TONES = ["purple", "blue", "green", "yellow", "pink"];

export default function TokenBuildingBlock({ children, index = 0, variant = "metaphor", leadingSpace = false, leadingSpaceLabel = "Leading space", verifiedLabel = "Verified token", punctuation = false }) {
  const verified = variant === "verified";
  return <span className={`playful-token-block is-${variant} tone-${TONES[index % TONES.length]} ${punctuation ? "is-punctuation" : ""}`}>
    {verified && <span className="playful-verified-mark" title={verifiedLabel} aria-label={verifiedLabel}><CheckCircle2 size={13} strokeWidth={2.2} /></span>}
    {leadingSpace && <small className="playful-space-marker" aria-label={leadingSpaceLabel}>␠</small>}
    <b>{children}</b>
  </span>;
}
