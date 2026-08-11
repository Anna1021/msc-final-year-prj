import React from "react";
import { ArrowRight, BrainCircuit, Braces, CheckCircle2, Database, RotateCcw, Sparkles, Tag } from "lucide-react";

export function Mission1PagedSummaryPage({ active, complete, t, onTryAnother, onRestart, onMissions, onNextMission }) {
  const summarySteps = [
    { key:"textTokens", Icon:Braces, visual:<span className="mission-summary-mini-transform"><i>Text</i><ArrowRight/><b>token</b></span> },
    { key:"lookup", Icon:Tag, visual:<b className="mission-summary-mini-id">ID 305</b> },
    { key:"numbers", Icon:Database, visual:<span className="mission-summary-mini-values">+0.24 · −0.61 · …</span> },
    { key:"processing", Icon:BrainCircuit, visual:null }
  ];
  return <section id="m1-summary-paged" className="course-section mission-1-paged__lesson mission-paged-summary" data-lesson-page="6" hidden={!active}>
    <div className="mission-paged-page-heading"><div className="course-section-head"><h2><span>6</span>{t("mission1.sections.summary")}</h2></div><span className="mission-paged-heading-sticker" aria-hidden="true"><CheckCircle2 /><Sparkles /></span></div>
    <div className="mission-paged-summary-strip">{summarySteps.map(({key,Icon,visual}, index) => <React.Fragment key={key}><span><Icon size={23} strokeWidth={1.8} />{visual}<strong>{t(`mission1Learning.summary.${key}`)}</strong></span>{index < 3 && <ArrowRight aria-hidden="true" />}</React.Fragment>)}</div>
    <div className="mission-paged-summary-robot"><img src="/assets/img/mission-robot-reading.png" alt="" aria-hidden="true" /><div><strong>{complete ? t("missions.lesson1Complete") : t("missions.lesson1Incomplete")}</strong><p>{t("mission1.paged.summaryDiscovery")}</p></div></div>
    <div className="mission-paged-summary-actions"><button type="button" className="outline" onClick={onTryAnother}>{t("mission1.paged.tryAnother")}</button><button type="button" className="outline" onClick={onRestart}><RotateCcw size={17} strokeWidth={1.8} />{t("missions.restartLesson")}</button><button type="button" className="outline" onClick={onMissions}>{t("missions.returnToLessons")}</button><button type="button" className="primary mission-paged-next-mission" onClick={onNextMission}>{t("missions.nextLesson2")}<ArrowRight size={17} strokeWidth={1.8} /></button></div>
  </section>;
}
