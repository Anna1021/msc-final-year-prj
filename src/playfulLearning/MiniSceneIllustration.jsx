import React from "react";
import { Search } from "lucide-react";

export default function MiniSceneIllustration({ imageSrc }) {
  return <div className="playful-mini-scene" aria-hidden="true">
    <span className="playful-search-lens"><Search size={38} strokeWidth={1.8} /></span>
    <img src={imageSrc} alt="" />
    <span className="playful-clue-dot clue-one" /><span className="playful-clue-dot clue-two" />
  </div>;
}
