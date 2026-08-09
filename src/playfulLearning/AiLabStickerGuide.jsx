import React from "react";

export default function AiLabStickerGuide({ src, className = "", hiddenOnMobile = false }) {
  return <div className={`ai-lab-sticker-guide ${hiddenOnMobile ? "is-low-priority" : ""} ${className}`.trim()} aria-hidden="true"><span className="ai-lab-sticker-glow" /><img src={src} alt="" /></div>;
}
