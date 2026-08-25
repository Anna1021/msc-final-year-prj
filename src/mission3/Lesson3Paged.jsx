import React, { useCallback, useEffect, useState } from "react";
import MissionLessonShell, { parseLessonPage } from "../mission1/MissionLessonShell.jsx";
import Mission1PagedKnowledgeQuiz from "../mission1/Mission1PagedKnowledgeQuiz.jsx";
import LessonPageHero from "../pagedMissions/LessonPageHero.jsx";
import { useI18n } from "../i18n/index.jsx";
import { writeProgress } from "../state/progress.js";
import { Lesson3Page1, Lesson3Page2, Lesson3Page3, Lesson3Page4, Lesson3Page5, Lesson3Page7 } from "./Lesson3Pages.jsx";
import { createMission3QuizCopy } from "./mission3QuizCopy.js";
import "../mission1/mission1Paged.css";
import "./lesson3Paged.css";

export const LESSON_3_PAGES = Object.freeze([
  ["connections","mission3.page1.title","mission3.page1.subtitle"],
  ["attention","mission3.page2.title","mission3.page2.subtitle"],
  ["representation","mission3.page3.title","mission3.page3.subtitle"],
  ["position","mission3.page4.title","mission3.page4.subtitle"],
  ["process","mission3.page5.title","mission3.page5.subtitle"],
  ["quiz","mission3.page6.title","mission3.page6.subtitle"],
  ["summary","mission3.page7.title","mission3.page7.subtitle"]
]);

const ROBOTS = ["mission3-robot-hallucination.png","mission-robot-pointing.png","mission3-robot-hallucination.png","mission-robot-pointing.png","mission3-robot-hallucination.png","mission-robot-pointing.png","mission-robot-reading.png"];
const REQUIRED = ["connection-strengths","contextual-build","transformer-process","summary-visited"];

export default function Lesson3Paged({ setProgress, navigate, notify }) {
  const { t } = useI18n();
  const pageCount = LESSON_3_PAGES.length;
  const initial = parseLessonPage(window.location.search, pageCount);
  const [currentPage,setCurrentPage] = useState(initial);
  const [visited,setVisited] = useState(()=>new Set([initial]));
  const [continued,setContinued] = useState(()=>new Set());
  const [activities,setActivities] = useState(()=>new Set());
  const [quizResult,setQuizResult] = useState("idle");
  const quizCopy = createMission3QuizCopy(t);
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
  }

  const recommended=LESSON_3_PAGES.findIndex((_,index)=>!visited.has(index+1))+1;
  const recommendation={visible:recommended>0&&currentPage>recommended&&!continued.has(currentPage),message:t("learningMode.notice"),goLabel:t("learningMode.goRecommended"),continueLabel:t("learningMode.continueHere"),onGoRecommended:()=>changePage(recommended),onContinue:()=>setContinued((current)=>new Set(current).add(currentPage))};
  const page=LESSON_3_PAGES[currentPage-1];
  const complete=REQUIRED.every((key)=>activities.has(key))&&quizResult==="correct"&&visited.has(pageCount);
  const progressPageCount=7;
  const labels={backToMissions:t("mission3.shell.backToLearn"),missionCount:t("mission3.shell.lessonCount"),topicLabel:t("mission3.shell.topic"),pageCount:t("mission3.shell.pageCount",{current:currentPage,total:progressPageCount}),back:t("mission3.shell.back"),next:t("mission3.shell.next"),prototypeEndAction:t("mission3.shell.incomplete"),prototypeLabel:t("mission3.shell.topic"),navigationLabel:t("common.lesson.navigationLabel"),robotAlt:t("mission3.shell.robotAlt")};

  function continueToNextLesson() {
    if (complete) {
      setProgress((previous)=>{const next=structuredClone(previous);next.missions[3]={progress:100,completed:true};writeProgress(next);return next;});
      notify?.(t("mission3.actions.completedNotice"));
    }
    navigate("/mission/4-training-data-paged");
  }

  return <MissionLessonShell currentPage={currentPage} pageCount={pageCount} progressPageCount={progressPageCount} onPageChange={changePage} onEnd={continueToNextLesson} onBackToMissions={()=>navigate("/missions")} title={t(page[1])} subtitle={t(page[2])} labels={{...labels, prototypeEndAction:t("mission3.shell.nextLesson")}} recommendation={recommendation} hideNext={currentPage===6} skipAction={currentPage===6?{label:t("mission3.skipQuiz"),onClick:()=>changePage(7)}:null} rootClassName={`lesson-3-paged l3-page-${page[0]} paged-mission-playful playful-learning-scope ${currentPage===6?"mission-2-paged mission-2-reading-context m2-reading-page-6 lesson-quiz-layout":""}`} robotImage={`/assets/img/${ROBOTS[currentPage-1]}`} pageHero={<LessonPageHero lessonIndex={3} lessonCount={5} lessonProgressLabel={t("common.lesson.progress",{current:3,total:5})} lessonName={t("mission3.shell.topic")} title={t(page[1])} subtitle={t(page[2])} illustration={`/assets/img/${ROBOTS[currentPage-1]}`} illustrationAlt={labels.robotAlt} headingId={`lesson-3-page-${currentPage}-title`}/>}>
    <Lesson3Page1 active={currentPage===1} t={t}/>
    <Lesson3Page2 active={currentPage===2} t={t} onComplete={markConnectionStrengths}/>
    <Lesson3Page3 active={currentPage===3} t={t} onComplete={markContextualBuild}/>
    <Lesson3Page4 active={currentPage===4} t={t}/>
    <Lesson3Page5 active={currentPage===5} t={t} onComplete={markTransformerProcess}/>
    <Mission1PagedKnowledgeQuiz active={currentPage===6} copy={{...quizCopy,quizTitle:quizCopy.conceptCheckpoint}} resetKey={0} onResultChange={setQuizResult} onContinue={()=>changePage(7)} pageNumber={6} lessonClassName="mission-3-paged__lesson" showLesson1Visuals={false} showTitle={false} guideTarget="lesson-quiz"/>
    <Lesson3Page7 active={currentPage===7} t={t} complete={complete} onVisit={markSummaryVisited}/>
  </MissionLessonShell>;
}
