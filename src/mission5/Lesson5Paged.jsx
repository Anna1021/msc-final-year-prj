import React,{useCallback,useEffect,useState} from "react";
import MissionLessonShell,{parseLessonPage} from "../mission1/MissionLessonShell.jsx";
import {useI18n} from "../i18n/index.jsx";
import {writeProgress} from "../state/progress.js";
import {Lesson5NewPage1,Lesson5NewPage2,Lesson5NewPage3,Lesson5NewPage4} from "./Lesson5Pages.jsx";
import "./lesson5Paged.css";

export const LESSON_5_PAGES=Object.freeze([
  ["origin","mission5.page1.title","mission5.page1.subtitle"],
  ["adjust","mission5.page2.title","mission5.page2.subtitle"],
  ["repeat","mission5.page3.title","mission5.page3.subtitle"],
  ["connect","mission5.page4.title","mission5.page4.subtitle"]
]);
const ROBOTS=["mission5-robot-training.png","mission-robot-pointing.png","mission5-robot-training.png","mission-robot-reading.png"];
const REQUIRED=["reveal-target","adjust-parameters","repeat-examples","connect-paths"];

export default function Lesson5Paged({setProgress,navigate,notify}){
  const{t}=useI18n();
  const pageCount=LESSON_5_PAGES.length;
  const initial=parseLessonPage(window.location.search,pageCount);
  const[currentPage,setCurrentPage]=useState(initial);
  const[visited,setVisited]=useState(()=>new Set([initial]));
  const[continued,setContinued]=useState(()=>new Set());
  const[activities,setActivities]=useState(()=>new Set());
  const mark=useCallback(key=>setActivities(current=>new Set(current).add(key)),[]);

  useEffect(()=>{const pop=()=>{const page=parseLessonPage(window.location.search,pageCount);setCurrentPage(page);setVisited(current=>new Set(current).add(page))};window.addEventListener("popstate",pop);return()=>window.removeEventListener("popstate",pop)},[pageCount]);
  function changePage(next){const safe=Math.min(pageCount,Math.max(1,next));const url=new URL(window.location.href);url.searchParams.set("page",String(safe));window.history.pushState({},"",`${url.pathname}${url.search}`);setCurrentPage(safe);setVisited(current=>new Set(current).add(safe));window.scrollTo({top:0,behavior:"smooth"})}

  const recommended=LESSON_5_PAGES.findIndex((_,index)=>!visited.has(index+1))+1;
  const recommendation={visible:recommended>0&&currentPage>recommended&&!continued.has(currentPage),message:t("learningMode.notice"),goLabel:t("learningMode.goRecommended"),continueLabel:t("learningMode.continueHere"),onGoRecommended:()=>changePage(recommended),onContinue:()=>setContinued(current=>new Set(current).add(currentPage))};
  const page=LESSON_5_PAGES[currentPage-1];
  const complete=REQUIRED.every(key=>activities.has(key))&&visited.has(pageCount);
  const labels={backToMissions:t("mission5.shell.backToLearn"),missionCount:t("mission5.shell.lessonCount"),topicLabel:t("mission5.shell.topic"),pageCount:t("mission5.shell.pageCount",{current:currentPage,total:pageCount}),back:t("mission5.shell.back"),next:t("mission5.shell.next"),prototypeEndAction:t("mission5.shell.incomplete"),prototypeLabel:t("mission5.shell.topic"),robotAlt:t("mission5.shell.robotAlt")};

  function continueToFinalChallenge(){
    if(complete){setProgress(previous=>{const next=structuredClone(previous);next.missions[6]={progress:100,completed:true};writeProgress(next);return next});notify?.(t("mission5.actions.completedNotice"))}
    navigate("/final-challenge");
  }

  return <MissionLessonShell currentPage={currentPage} pageCount={pageCount} onPageChange={changePage} onEnd={continueToFinalChallenge} onBackToMissions={()=>navigate("/missions")} title={t(page[1])} subtitle={t(page[2])} labels={{...labels,prototypeEndAction:t("mission5.shell.nextChallenge")}} recommendation={recommendation} rootClassName={`lesson-5-paged l5-new-root l5-page-${page[0]} paged-mission-playful playful-learning-scope`} robotImage={`/assets/img/${ROBOTS[currentPage-1]}`}>
    <Lesson5NewPage1 active={currentPage===1} t={t} onComplete={()=>mark("reveal-target")}/>
    <Lesson5NewPage2 active={currentPage===2} t={t} onComplete={()=>mark("adjust-parameters")}/>
    <Lesson5NewPage3 active={currentPage===3} t={t} onComplete={()=>mark("repeat-examples")}/>
    <Lesson5NewPage4 active={currentPage===4} t={t} onComplete={()=>mark("connect-paths")}/>
  </MissionLessonShell>;
}
