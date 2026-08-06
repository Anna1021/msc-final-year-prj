import React from "react";
import { ArrowDown, Blocks, FileText, FlaskConical, Sparkles } from "lucide-react";
import QwenTokenizerPlayground from "./QwenTokenizerPlayground.jsx";

export default function Mission1PagedPlaygroundPage({ active, language, t, exploreIndex, resetKey, onSuccessfulRun }) {
  return <section id="m1-playground-paged" className="course-section mission-1-paged__lesson mission-1-paged__playground-page" data-lesson-page="3" hidden={!active}>
    <div className="mission-paged-page-heading"><div className="course-section-head"><h2><span>3</span>{t("mission1.sections.playground")}</h2></div><p>{t("mission1.playground.intro")}</p><span className="mission-paged-heading-sticker" aria-hidden="true"><FlaskConical /><Sparkles /></span></div>
    <div className="mission-1-paged__experiment-flow" aria-label={t("mission1.paged.experimentFlowLabel")}>
      <span><FileText size={20} strokeWidth={1.8} />{t("mission1.paged.writeStep")}</span><ArrowDown size={18} strokeWidth={1.8} /><span><FlaskConical size={20} strokeWidth={1.8} />{t("mission1.playground.tokenize")}</span><ArrowDown size={18} strokeWidth={1.8} /><span><Blocks size={20} strokeWidth={1.8} />{t("mission1.paged.discoverStep")}</span>
    </div>
    <QwenTokenizerPlayground language={language} t={t} visualVariant="paged" showModelNote={false} exploreIndex={exploreIndex} resetKey={resetKey} onSuccessfulRun={onSuccessfulRun} />
  </section>;
}
