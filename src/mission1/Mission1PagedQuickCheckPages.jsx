import React from "react";
import { Blocks, CheckCircle2, HelpCircle, Puzzle, Sparkles } from "lucide-react";
import Mission1QuickCheckA from "./Mission1QuickCheckA.jsx";
import Mission1QuickCheckB from "./Mission1QuickCheckB.jsx";

export function Mission1PagedConceptCheckPage({ active, t, onResultChange, resetKey }) {
  return <section id="m1-concept-check-paged" className="course-section mission-1-paged__lesson mission-paged-concept-check" data-lesson-page="4" hidden={!active}>
    <div className="mission-paged-page-heading"><div className="course-section-head"><h2><span>4</span>{t("mission1.paged.checkIdea")}</h2></div><span className="mission-paged-heading-sticker" aria-hidden="true"><HelpCircle /><Sparkles /></span></div>
    <div className="mission-paged-scene-intro"><div><span><HelpCircle size={17} strokeWidth={1.8} />{t("mission1.paged.conceptCheckpoint")}</span><p>{t("mission1.paged.conceptInstruction")}</p></div><img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true" /></div>
    <Mission1QuickCheckA t={t} resetKey={resetKey} visualVariant="paged" onResultChange={onResultChange} />
  </section>;
}

export function Mission1PagedRebuildPage({ active, language, t, result, onResultChange, resetKey }) {
  return <section id="m1-rebuild-paged" className="course-section mission-1-paged__lesson mission-paged-rebuild-scene" data-lesson-page="5" hidden={!active}>
    <div className="mission-paged-page-heading"><div className="course-section-head"><h2><span>5</span>{t("mission1.paged.rebuildTokens")}</h2></div><span className="mission-paged-heading-sticker" aria-hidden="true"><Puzzle /><Blocks /></span></div>
    <div className="mission-paged-scene-intro mission-paged-scene-intro--rebuild"><div><span><Blocks size={17} strokeWidth={1.8} />{t("mission1.paged.realPiecesLabel")}</span><p>{t("mission1.checkB.instructions")}</p></div><img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true" /></div>
    <Mission1QuickCheckB language={language} t={t} resetKey={resetKey} visualVariant="paged" onResultChange={onResultChange} />
    {result === "correct" && <div className="mission-paged-discovery" role="status"><CheckCircle2 size={20} strokeWidth={1.8} /><div><strong>{t("mission1.paged.rebuildSuccess")}</strong><span>{t("mission1.paged.orderMatters")}</span></div></div>}
  </section>;
}
