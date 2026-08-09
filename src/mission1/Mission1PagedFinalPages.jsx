import React, { useState } from "react";
import { ArrowRight, Blocks, BrainCircuit, Braces, CheckCircle2, ChevronDown, Database, Hash, RotateCcw, Sparkles, Tag } from "lucide-react";

const teachingValues = ["+0.24", "−0.61", "+0.08", "…"];

export function Mission1PagedNumbersPage({ active, t }) {
  const [lookupStep, setLookupStep] = useState(0);
  const [technicalOpen, setTechnicalOpen] = useState(true);
  function advanceLookup() { setLookupStep((step) => Math.min(3, step + 1)); }
  return <section id="m1-numbers-paged" className="course-section mission-1-paged__lesson mission-paged-numbers" data-lesson-page="6" hidden={!active}>
    <div className="mission-paged-page-heading"><div className="course-section-head"><h2><span>6</span>{t("mission1.paged.numbersTitle")}</h2></div><span className="mission-paged-heading-sticker" aria-hidden="true"><Hash /><Database /></span></div>
    <div className="mission-paged-number-intro"><img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true" /><p>{t("mission1.paged.numbersIntro")}</p></div>
    <div className={`mission-paged-number-flow lookup-step-${lookupStep}`} aria-live="polite">
      <button type="button" className="mission-paged-number-tokens" onClick={advanceLookup}><Blocks size={24} strokeWidth={1.8} /><strong>{t("mission1Learning.tokenPiece")}</strong><span><b>robot</b></span><small>{t("mission1Learning.tokenPiece")}</small></button>
      <ArrowRight aria-hidden="true" />
      <button type="button" disabled={lookupStep < 1} className="mission-paged-id-tag" onClick={advanceLookup}><Tag size={24} strokeWidth={1.8} /><strong>{t("mission1Learning.idLabel")}</strong><span className="mission-paged-teaching-badge">{t("mission1Learning.teachingExample")}</span><b>{lookupStep >= 1 ? "ID 305" : "ID ?"}</b><small>{t("mission1Learning.idOnlyLabel")}</small></button>
      <ArrowRight aria-hidden="true" />
      <button type="button" disabled={lookupStep < 2} className="mission-paged-number-drawer" onClick={advanceLookup}><img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true" /><Database size={24} strokeWidth={1.8} /><strong>{t("mission1Learning.lookupRow")}</strong><small className="mission-paged-teaching-badge">{t("mission1Learning.notQwenValues")}</small><span className="mission-paged-drawer-label">{t("mission1Learning.lookupRow")}</span><div>{teachingValues.map((value) => <i key={value}>{lookupStep >= 2 ? value : "?"}</i>)}</div></button>
      <ArrowRight aria-hidden="true" />
      <div className="mission-paged-number-use"><BrainCircuit size={24} strokeWidth={1.8} /><strong>{t("mission1.paged.laterCalculations")}</strong><small>{t("mission1Learning.combineRepresentations")}</small></div>
    </div>
    {lookupStep >= 3 && <div className="mission-paged-discovery" role="status"><CheckCircle2 size={20} strokeWidth={1.8} /><div><strong>{t("mission1Learning.idOnlyLabel")}</strong><span>{t("mission1Learning.combineRepresentations")}</span></div></div>}
    <div className="mission-paged-accuracy-note"><Hash size={19} strokeWidth={1.8} /><div><strong>{t("mission1Learning.numbersBoundaryTitle")}</strong><p>{t("mission1Learning.numbersAccuracy")}</p><details open={technicalOpen} onToggle={(event) => setTechnicalOpen(event.currentTarget.open)}><summary aria-expanded={technicalOpen} aria-controls="mission1-embedding-definition">{t("mission1Learning.technicalWord")}<ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" /></summary><div id="mission1-embedding-definition"><span>{t("mission1.paged.embeddingSecondary")}</span><p>{t("mission1Learning.embeddingExplanation")}</p></div></details></div></div>
  </section>;
}

export function Mission1PagedSummaryPage({ active, complete, t, onTryAnother, onRestart, onMissions, onNextMission }) {
  const summarySteps = [
    { key:"textTokens", Icon:Braces, visual:<span className="mission-summary-mini-transform"><i>Text</i><ArrowRight/><b>token</b></span> },
    { key:"lookup", Icon:Tag, visual:<b className="mission-summary-mini-id">ID 305</b> },
    { key:"numbers", Icon:Database, visual:<span className="mission-summary-mini-values">+0.24 · −0.61 · …</span> },
    { key:"processing", Icon:BrainCircuit, visual:null }
  ];
  return <section id="m1-summary-paged" className="course-section mission-1-paged__lesson mission-paged-summary" data-lesson-page="7" hidden={!active}>
    <div className="mission-paged-page-heading"><div className="course-section-head"><h2><span>7</span>{t("missions.lessonSummary")}</h2></div><span className="mission-paged-heading-sticker" aria-hidden="true"><CheckCircle2 /><Sparkles /></span></div>
    <div className="mission-paged-summary-strip">{summarySteps.map(({key,Icon,visual}, index) => <React.Fragment key={key}><span><Icon size={23} strokeWidth={1.8} />{visual}<strong>{t(`mission1Learning.summary.${key}`)}</strong></span>{index < 3 && <ArrowRight aria-hidden="true" />}</React.Fragment>)}</div>
    <div className="mission-paged-summary-robot"><img src="/assets/img/mission-robot-reading.png" alt="" aria-hidden="true" /><div><strong>{complete ? t("missions.lesson1Complete") : t("missions.lesson1Incomplete")}</strong><p>{t("mission1.paged.summaryDiscovery")}</p></div></div>
    <div className="mission-paged-summary-actions"><button type="button" className="outline" onClick={onTryAnother}>{t("mission1.paged.tryAnother")}</button><button type="button" className="outline" onClick={onRestart}><RotateCcw size={17} strokeWidth={1.8} />{t("missions.restartLesson")}</button><button type="button" className="outline" onClick={onMissions}>{t("missions.returnToLessons")}</button><button type="button" className="primary mission-paged-next-mission" onClick={onNextMission}>{t("missions.nextLesson2")}<ArrowRight size={17} strokeWidth={1.8} /></button></div>
  </section>;
}
