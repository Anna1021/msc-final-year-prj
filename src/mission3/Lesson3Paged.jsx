import React, { useCallback, useEffect, useState } from "react";
import MissionLessonShell, { parseLessonPage } from "../mission1/MissionLessonShell.jsx";
import { useI18n } from "../i18n/index.jsx";
import { writeProgress } from "../state/progress.js";
import { Lesson3Page1, Lesson3Page2, Lesson3Page3, Lesson3Page4, Lesson3Page5, Lesson3Page6 } from "./Lesson3Pages.jsx";
import "./lesson3Paged.css";

export const LESSON_3_PAGES = Object.freeze([
  ["transformer","mission3.page1.title","mission3.page1.subtitle"],
  ["attention","mission3.page2.title","mission3.page2.subtitle"],
  ["representation","mission3.page3.title","mission3.page3.subtitle"],
  ["position","mission3.page4.title","mission3.page4.subtitle"],
  ["process","mission3.page5.title","mission3.page5.subtitle"],
  ["summary","mission3.page6.title","mission3.page6.subtitle"]
]);

const ROBOTS = ["mission3-robot-hallucination.png","mission-robot-pointing.png","mission3-robot-hallucination.png","mission-robot-pointing.png","mission3-robot-hallucination.png","mission-robot-reading.png"];
const REQUIRED = ["connection-strengths","contextual-build","transformer-process","summary-visited"];

export default function Lesson3Paged({ setProgress, navigate, notify }) {
  const { t } = useI18n();
  const pageCount = LESSON_3_PAGES.length;
  const initial = parseLessonPage(window.location.search, pageCount);
  const [currentPage,setCurrentPage] = useState(initial);
  const [visited,setVisited] = useState(()=>new Set([initial]));
  const [continued,setContinued] = useState(()=>new Set());
  const [activities,setActivities] = useState(()=>new Set());
  const mark = useCallback((key)=>setActivities((current)=>new Set(current).add(key)),[]);
  const markConnectionStrengths = useCallback(()=>mark("connection-strengths"),[mark]);
  const markContextualBuild = useCallback(()=>mark("contextual-build"),[mark]);
  const markTransformerProcess = useCallback(()=>mark("transformer-process"),[mark]);
  const markSummaryVisited = useCallback(()=>mark("summary-visited"),[mark]);

  useEffect(()=>{
    const pop=()=>{const next=parseLessonPage(window.location.search,pageCount);setCurrentPage(next);setVisited((current)=>new Set(current).add(next));};
    window.addEventListener("popstate",pop); return()=>window.removeEventListener("popstate",pop);
  },[pageCount]);

  function changePage(next) {
    const safe=Math.min(pageCount,Math.max(1,next));
    const url=new URL(window.location.href);url.searchParams.set("page",String(safe));
    window.history.pushState({},"",`${url.pathname}${url.search}`);
    setCurrentPage(safe);setVisited((current)=>new Set(current).add(safe));
    window.scrollTo({top:0,behavior:"smooth"});
  }

  const recommended=LESSON_3_PAGES.findIndex((_,index)=>!visited.has(index+1))+1;
  const recommendation={visible:recommended>0&&currentPage>recommended&&!continued.has(currentPage),message:t("learningMode.notice"),goLabel:t("learningMode.goRecommended"),continueLabel:t("learningMode.continueHere"),onGoRecommended:()=>changePage(recommended),onContinue:()=>setContinued((current)=>new Set(current).add(currentPage))};
  const page=LESSON_3_PAGES[currentPage-1];
  const complete=REQUIRED.every((key)=>activities.has(key))&&visited.has(pageCount);
  const labels={backToMissions:t("mission3.shell.backToLearn"),missionCount:t("mission3.shell.lessonCount"),topicLabel:t("mission3.shell.topic"),pageCount:t("mission3.shell.pageCount",{current:currentPage,total:pageCount}),back:t("mission3.shell.back"),next:t("mission3.shell.next"),prototypeEndAction:t("mission3.shell.incomplete"),prototypeLabel:t("mission3.shell.topic"),robotAlt:t("mission3.shell.robotAlt")};

  function continueToNextLesson() {
    if (complete) {
      setProgress((previous)=>{const next=structuredClone(previous);next.missions[3]={progress:100,completed:true};writeProgress(next);return next;});
      notify?.(t("mission3.actions.completedNotice"));
    }
    navigate("/mission/4-training-data-paged");
  }

  return <MissionLessonShell currentPage={currentPage} pageCount={pageCount} onPageChange={changePage} onEnd={continueToNextLesson} onBackToMissions={()=>navigate("/missions")} title={t(page[1])} subtitle={t(page[2])} labels={{...labels, prototypeEndAction:t("mission3.shell.nextLesson")}} recommendation={recommendation} rootClassName={`lesson-3-paged l3-page-${page[0]} paged-mission-playful playful-learning-scope`} robotImage={`/assets/img/${ROBOTS[currentPage-1]}`}>
    <Lesson3Page1 active={currentPage===1} t={t}/>
    <Lesson3Page2 active={currentPage===2} t={t} onComplete={markConnectionStrengths}/>
    <Lesson3Page3 active={currentPage===3} t={t} onComplete={markContextualBuild}/>
    <Lesson3Page4 active={currentPage===4} t={t}/>
    <Lesson3Page5 active={currentPage===5} t={t} onComplete={markTransformerProcess}/>
    <Lesson3Page6 active={currentPage===6} t={t} complete={complete} onVisit={markSummaryVisited}/>
  </MissionLessonShell>;
}
