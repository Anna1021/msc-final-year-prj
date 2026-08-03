import React from "react";
import { Blocks } from "lucide-react";
import TokenBuildingBlock from "./TokenBuildingBlock.jsx";

export default function PlayfulSceneBanner({ badge, sentenceLabel, sentence, blocks, metaphorLabel, note, imageSrc }) {
  return <div className="playful-scene-banner" data-tour-id="m1-intro-sentence">
    <div className="playful-scene-copy">
      <span className="playful-scene-badge"><Blocks size={17} strokeWidth={1.9} />{badge}</span>
      <small>{sentenceLabel}</small>
      <strong>{sentence}</strong>
      <div className="playful-block-row" aria-label={metaphorLabel}>{blocks.map((block, index) => <TokenBuildingBlock index={index} key={`${block}-${index}`}>{block}</TokenBuildingBlock>)}</div>
      <p className="playful-boundary-note"><span aria-hidden="true">i</span>{note}</p>
    </div>
    <div className="playful-scene-art" aria-hidden="true">
      <span className="playful-art-orbit orbit-one" /><span className="playful-art-orbit orbit-two" />
      <img src={imageSrc} alt="" />
      <span className="playful-floating-block block-one" /><span className="playful-floating-block block-two" />
    </div>
  </div>;
}
