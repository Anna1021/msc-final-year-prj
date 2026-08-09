import React from "react";
import { readableTokenPiece } from "./mission1Challenges.js";
import TokenBuildingBlock from "../playfulLearning/TokenBuildingBlock.jsx";

export default function TokenPieces({ groups, compact = false, technical = false, t, tourId, visualVariant = "default" }) {
  const verified = visualVariant === "verified";
  return <div className={`${verified ? "playful-verified-strip" : "m1-token-pieces"} ${compact ? "compact" : ""}`} data-tour-id={tourId}>
    {groups.map((group, index) => {
      const readable = readableTokenPiece(group.decodedPiece);
      if (verified) return <TokenBuildingBlock index={index} variant="verified" leadingSpace={readable.leadingSpace} leadingSpaceLabel={t("mission1.tokens.leadingSpace")} verifiedLabel={t("mission1.tokens.verifiedLabel")} punctuation={/^\p{P}+$/u.test(readable.text)} key={`${group.startIndex ?? index}-${group.ids.join("-")}`}>{readable.text}</TokenBuildingBlock>;
      return <span className="m1-token-piece" key={`${group.startIndex ?? index}-${group.ids.join("-")}`} title={technical ? group.rawPieces.join(" | ") : undefined}>
        {readable.leadingSpace && <small className="m1-space-marker" aria-label={t("mission1.tokens.leadingSpace")}>␠</small>}
        <b>{readable.text}</b>
        {group.tokenCount > 1 && <em>{t("mission1.tokens.groupCount", { count: group.tokenCount })}</em>}
      </span>;
    })}
  </div>;
}
