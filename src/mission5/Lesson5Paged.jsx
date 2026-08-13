import React,{useCallback,useEffect,useState} from "react";
import MissionLessonShell,{parseLessonPage} from "../mission1/MissionLessonShell.jsx";
import Mission1PagedKnowledgeQuiz from "../mission1/Mission1PagedKnowledgeQuiz.jsx";
import {useI18n} from "../i18n/index.jsx";
import {writeProgress} from "../state/progress.js";
import LessonPageHero from "../pagedMissions/LessonPageHero.jsx";
import {Lesson5NewPage1,Lesson5NewPage2,Lesson5NewPage3,Lesson5NewPage4,Lesson5NewPage5,Lesson5NewPage6,Lesson5NewPage8} from "./Lesson5Pages.jsx";
import {createMission5QuizCopy} from "./mission5QuizCopy.js";
import "../mission1/mission1Paged.css";
import "./lesson5Paged.css";

export const LESSON_5_PAGES=Object.freeze([
  ["origin","mission5.page1.title","mission5.page1.subtitle"],
  ["adjust","mission5.navigation.page2Title","mission5.navigation.page2Subtitle"],
  ["repeat","mission5.navigation.page3Title","mission5.navigation.page3Subtitle"],
  ["connect","mission5.navigation.page4Title","mission5.navigation.page4Subtitle"],
  ["try","mission5.navigation.page5Title","mission5.navigation.page5Subtitle"],
  ["response","mission5.navigation.page6Title","mission5.navigation.page6Subtitle"],
  ["quiz","mission5.navigation.page7Title","mission5.navigation.page7Subtitle"],
  ["summary","mission5.navigation.page8Title","mission5.navigation.page8Subtitle"]
]);
const ROBOTS=["mission5-robot-training.png","mission-robot-pointing.png","mission5-robot-training.png","mission-robot-reading.png","mission-robot-pointing.png","mission5-robot-training.png","mission5-robot-training.png","mission-robot-reading.png"];
const REQUIRED=["reveal-target","adjust-parameters","repeat-examples","connect-paths"];

export default function Lesson5Paged({setProgress,navigate,notify}){
  const{t}=useI18n();
  const pageCount=LESSON_5_PAGES.length;
  const initial=parseLessonPage(window.location.search,pageCount);
  const[currentPage,setCurrentPage]=useState(initial);
  const[visited,setVisited]=useState(()=>new Set([initial]));
  const[continued,setContinued]=useState(()=>new Set());
  const[activities,setActivities]=useState(()=>new Set());
  const[quizResult,setQuizResult]=useState("idle");
  const mark=useCallback(key=>setActivities(current=>new Set(current).add(key)),[]);
  const quizCopy=createMission5QuizCopy(t);

  useEffect(()=>{const pop=()=>{const page=parseLessonPage(window.location.search,pageCount);setCurrentPage(page);setVisited(current=>new Set(current).add(page))};window.addEventListener("popstate",pop);return()=>window.removeEventListener("popstate",pop)},[pageCount]);
  function changePage(next){const safe=Math.min(pageCount,Math.max(1,next));const url=new URL(window.location.href);url.searchParams.set("page",String(safe));window.history.pushState({},"",`${url.pathname}${url.search}`);setCurrentPage(safe);setVisited(current=>new Set(current).add(safe))}

  const recommended=LESSON_5_PAGES.findIndex((_,index)=>!visited.has(index+1))+1;
  const recommendation={visible:recommended>0&&currentPage>recommended&&!continued.has(currentPage),message:t("learningMode.notice"),goLabel:t("learningMode.goRecommended"),continueLabel:t("learningMode.continueHere"),onGoRecommended:()=>changePage(recommended),onContinue:()=>setContinued(current=>new Set(current).add(currentPage))};
  const page=LESSON_5_PAGES[currentPage-1];
  const subtitleText=t(page[2]);
  const subtitleBreak=currentPage===1?Math.max(subtitleText.indexOf(":"),subtitleText.indexOf("：")):currentPage===2?Math.max(subtitleText.indexOf("."),subtitleText.indexOf("。")):currentPage===3?Math.max(subtitleText.indexOf(","),subtitleText.indexOf("，")):currentPage===5?Math.max(subtitleText.indexOf("."),subtitleText.indexOf("。")):-1;
  const pageSubtitle=subtitleBreak>=0?<>{subtitleText.slice(0,subtitleBreak+1)}<br/>{subtitleText.slice(subtitleBreak+1).trim()}</>:subtitleText;
  const complete=REQUIRED.every(key=>activities.has(key))&&quizResult==="correct"&&visited.has(pageCount);
  const labels={backToMissions:t("mission5.shell.backToLearn"),missionCount:t("mission5.shell.lessonCount"),topicLabel:t("mission5.shell.topic"),pageCount:t("mission5.shell.pageCount",{current:currentPage,total:pageCount}),back:t("mission5.shell.back"),next:t("mission5.shell.next"),prototypeEndAction:t("mission5.shell.incomplete"),prototypeLabel:t("mission5.shell.topic"),navigationLabel:t("common.lesson.navigationLabel"),robotAlt:t("mission5.shell.robotAlt")};

  function continueToFinalChallenge(){
    if(complete){setProgress(previous=>{const next=structuredClone(previous);next.missions[6]={progress:100,completed:true};writeProgress(next);return next});notify?.(t("mission5.actions.completedNotice"))}
    navigate("/final-challenge");
  }

  // Rebuilt Lesson 5 pages use the shared Hero, retain a numbered in-card kicker, and never repeat the full page title.
  const pageHero=<LessonPageHero lessonIndex={5} lessonCount={5} lessonProgressLabel={t("common.lesson.progress",{current:5,total:5})} lessonName={t("mission5.shell.topic")} title={t(page[1])} subtitle={pageSubtitle} illustration={`/assets/img/${ROBOTS[currentPage-1]}`} illustrationAlt={labels.robotAlt} headingId={`lesson-5-page-${currentPage}-title`}/>;

  return <MissionLessonShell currentPage={currentPage} pageCount={pageCount} onPageChange={changePage} onEnd={continueToFinalChallenge} onBackToMissions={()=>navigate("/missions")} title={t(page[1])} subtitle={pageSubtitle} labels={{...labels,prototypeEndAction:t("mission5.shell.nextChallenge")}} recommendation={recommendation} hideNext={currentPage===7} skipAction={currentPage===7?{label:t("mission5.skipQuiz"),onClick:()=>changePage(8)}:null} rootClassName={`lesson-5-paged l5-new-root l5-page-${page[0]} paged-mission-playful playful-learning-scope ${currentPage===7?"mission-1-paged mission-2-paged lesson-quiz-layout":""}`} robotImage={`/assets/img/${ROBOTS[currentPage-1]}`} pageHero={pageHero}>
    <Lesson5NewPage1 active={currentPage===1} t={t} onComplete={()=>mark("reveal-target")}/>
    <Lesson5NewPage2 active={currentPage===2} t={t} onComplete={()=>mark("adjust-parameters")}/>
    <Lesson5NewPage3 active={currentPage===3} t={t} onComplete={()=>mark("repeat-examples")}/>
    <Lesson5NewPage4 active={currentPage===4} t={t} onComplete={()=>mark("connect-paths")}/>
    <Lesson5NewPage5 active={currentPage===5} t={t}/>
    <Lesson5NewPage6 active={currentPage===6} t={t} onOpenLab={()=>navigate("/mission/4-training-data-paged?page=4")}/>
    <Mission1PagedKnowledgeQuiz active={currentPage===7} copy={quizCopy} resetKey={0} onResultChange={setQuizResult} onContinue={()=>changePage(8)} pageNumber={7} lessonClassName="lesson-5-paged__lesson" showLesson1Visuals={false}/>
    <Lesson5NewPage8 active={currentPage===8} t={t} complete={complete}/>
  </MissionLessonShell>;
}
