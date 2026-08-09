import React,{useEffect,useRef,useState} from "react";
import {
  ArrowDown,ArrowRight,BookOpenCheck,Check,ChevronDown,CircleDot,
  Cpu,GitCompareArrows,Lightbulb,Network,Play,RefreshCw,Repeat2,
  SlidersHorizontal,Sparkles,Target
} from "lucide-react";
import {
  BEFORE_ADJUSTMENT,GENERATION_STEPS,GRADUAL_PATTERN_STATES,
  TRAINING_EXAMPLES,TRAINING_PROMPT,TRAINING_STEPS,TRAINING_TARGET
} from "./lesson5TeachingData.js";
import {
  MAX_TRAINING_STEPS,controlPositions,createTrainingState,predictionGap,
  runTrainingSteps,toProbabilityRows
} from "./lesson5TrainingMath.js";

const IDEA_ICONS=[Target,GitCompareArrows,SlidersHorizontal,Repeat2];
const PAGE_ROBOTS=["mission5-robot-training.png","mission-robot-pointing.png","mission5-robot-training.png","mission-robot-reading.png"];

function PageHeading({t,page}){return <header className="l5-new-heading"><div><small>{t("mission5.shell.lessonCount")}</small><h1>{t(`mission5.page${page}.title`)}</h1><p>{t(`mission5.page${page}.subtitle`)}</p></div><img src={`/assets/img/${PAGE_ROBOTS[page-1]}`} alt="" aria-hidden="true"/></header>}

function TechnicalWord({t,page,term,children}){const[open,setOpen]=useState(true);const id=`l5-page-${page}-technical`;return <details className="l5-new-technical" open={open} onToggle={event=>setOpen(event.currentTarget.open)}><summary aria-expanded={open} aria-controls={id}><span><BookOpenCheck/>{t("mission5.sidebar.technicalWord")}</span><strong>{term}</strong><ChevronDown aria-hidden="true"/></summary><div id={id}>{children}</div></details>}

function LearningSidebar({t,page,term,children,extra}){return <aside className="l5-new-sidebar" aria-label={t("mission5.sidebar.learningNotes")}><section className="l5-new-key-ideas"><header><Lightbulb/><div><h3>{t("mission5.sidebar.keyIdeas")}</h3><p>{t("mission5.sidebar.keyIdeasHint")}</p></div></header><ul>{[1,2,3,4].map((number,index)=>{const Icon=IDEA_ICONS[index];return <li key={number}><span><Icon/></span>{t(`mission5.sidebar.page${page}.idea${number}`)}</li>})}</ul></section>{term&&<TechnicalWord t={t} page={page} term={term}>{children}</TechnicalWord>}{extra}</aside>}

function LearningLayout({children,sidebar}){return <div className="l5-new-layout"><main className="l5-new-main">{children}</main>{sidebar}</div>}

function Probabilities({items,highlight="",label,initialItems=[]}){const maximum=Math.max(...items.map(item=>item.probability));return <div className="l5-new-probabilities" aria-label={label}>{items.map(item=>{const initial=initialItems.find(candidate=>candidate.token===item.token)?.probability;const delta=typeof initial==="number"?item.probability-initial:null;return <div className={item.token===highlight?"is-highlighted":""} key={item.token}><span>{item.token}</span><i aria-hidden="true"><b style={{width:`${(item.probability/maximum)*100}%`}}/></i><strong>{item.probability.toFixed(Number.isInteger(item.probability)?0:1)}%</strong>{delta!==null&&Math.abs(delta)>=.05&&<em>{delta>0?"↑":"↓"} {Math.abs(delta).toFixed(1)}</em>}</div>})}</div>}

function AccuracyNote({t,children}){return <p className="l5-new-accuracy"><CircleDot/>{children||t("mission5.labels.simulation")}</p>}
function Takeaway({children}){return <div className="l5-new-takeaway"><Check/><p>{children}</p></div>}

export function Lesson5NewPage1({active,t,onComplete}){
  const[revealed,setRevealed]=useState(false);
  function reveal(){setRevealed(true);onComplete?.()}
  return <section hidden={!active} className="l5-new-page l5-new-page-one"><LearningLayout sidebar={<LearningSidebar t={t} page={1} term={t("mission5.page1.term")}><p>{t("mission5.page1.technical")}</p></LearningSidebar>}>
    <PageHeading t={t} page={1}/>
    <div className="l5-new-lesson-bridge"><span>{t("mission5.page1.lesson4")}</span><ArrowRight/><strong>{t("mission5.page1.lesson5")}</strong></div>
    <section className={`l5-new-target-lab ${revealed?"is-revealed":""}`}>
      <header><span><Sparkles/>{t("mission5.page1.badge")}</span><p>{t("mission5.page1.intro")}</p></header>
      <div className="l5-new-training-sentence"><small>{t("mission5.page1.existingText")}</small><strong>{TRAINING_PROMPT} <mark>{revealed?TRAINING_TARGET:"?"}</mark></strong></div>
      <div className="l5-new-training-sequence">
        <section><small>{t("mission5.page1.step1")}</small><Probabilities items={BEFORE_ADJUSTMENT} highlight={revealed?TRAINING_TARGET:""} label={t("mission5.page1.prediction")}/></section>
        <ArrowRight/>
        <section className="l5-new-real-target"><small>{t("mission5.page1.step2")}</small><strong>{revealed?TRAINING_TARGET:"?"}</strong><span>{t(revealed?"mission5.page1.targetKnown":"mission5.page1.targetCovered")}</span></section>
      </div>
      {!revealed?<button type="button" className="primary l5-new-reveal" onClick={reveal}><Play/>{t("mission5.actions.reveal")}</button>:<div className="l5-new-comparison" role="status"><span>{t("mission5.page1.prediction")}: <b>ball 35%</b></span><GitCompareArrows/><span>{t("mission5.page1.realToken")}: <b>ball</b></span></div>}
      <AccuracyNote t={t}>{t("mission5.labels.reviewed")}</AccuracyNote>
    </section>
    {revealed&&<Takeaway>{t("mission5.page1.takeaway")}</Takeaway>}
  </LearningLayout></section>;
}

export function Lesson5NewPage2({active,t,onComplete}){
  const[training,setTraining]=useState(()=>createTrainingState());
  const completionAnnounced=useRef(false);
  const initial=createTrainingState();
  const initialRows=toProbabilityRows(initial);
  const currentRows=toProbabilityRows(training);
  const gap=predictionGap(training);
  const gapLabel=gap>.58?t("mission5.page2.gapLarge"):gap>.42?t("mission5.page2.gapMedium"):t("mission5.page2.gapSmaller");
  function run(count){
    setTraining(current=>runTrainingSteps(current,count));
    if(!completionAnnounced.current){completionAnnounced.current=true;onComplete?.()}
  }
  function reset(){setTraining(createTrainingState())}
  const technicalStatus=<section className="l5-new-live-math" aria-live="polite"><small>{t("mission5.page2.mathCheck")}</small><span>{t("mission5.page2.trainingStep",{step:training.step})}</span><span>{t("mission5.page2.lossValue",{value:training.loss.toFixed(3)})}</span></section>;
  return <section hidden={!active} className="l5-new-page l5-new-page-two"><LearningLayout sidebar={<LearningSidebar t={t} page={2} term={t("mission5.page2.term")} extra={technicalStatus}><p>{t("mission5.page2.technical")}</p><p>{t("mission5.page2.weight")}</p></LearningSidebar>}>
    <PageHeading t={t} page={2}/>
    <section className={`l5-new-adjustment-lab ${training.step>0?"is-adjusted":""}`}>
      <div className="l5-new-adjust-column is-start"><small>{t("mission5.page2.start")}</small><Probabilities items={initialRows} highlight={TRAINING_TARGET}/><span>{t("mission5.page2.realTarget")}: <b>{TRAINING_TARGET}</b></span></div>
      <section className="l5-new-control-board"><header><Cpu/><div><small>{t("mission5.page2.boardLabel")}</small><strong>{t("mission5.page2.boardTitle")}</strong></div></header><div>{controlPositions(training).map((position,index)=><i key={index} style={{"--position":`${position}%`,"--turn":`${(position-50)*.7}deg`}}><b/></i>)}</div><p>{t("mission5.page2.manyNumbers")}</p><div className="l5-new-training-step"><GitCompareArrows/><span>{t("mission5.page2.stepFlow")}</span></div></section>
      <div className="l5-new-adjust-column is-current"><small>{t("mission5.page2.now")}</small><strong className="l5-new-step-count">{t("mission5.page2.trainingStep",{step:training.step})}</strong><Probabilities items={currentRows} initialItems={initialRows} highlight={TRAINING_TARGET}/><span>{t("mission5.page2.oneExample")}</span></div>
      <section className="l5-new-gap" role="progressbar" aria-label={t("mission5.page2.gapLabel")} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Number((gap*100).toFixed(1))}><div><small>{t("mission5.page2.gapLabel")}</small><strong>{gapLabel}</strong></div><i aria-hidden="true"><b style={{width:`${gap*100}%`}}/></i><span>{(gap*100).toFixed(1)}%</span></section>
      <div className="l5-new-training-actions"><button type="button" className="primary" disabled={training.step>=MAX_TRAINING_STEPS} onClick={()=>run(1)}><SlidersHorizontal/>{t("mission5.actions.runOne")}</button><button type="button" className="outline" disabled={training.step>=MAX_TRAINING_STEPS} onClick={()=>run(5)}><Play/>{t("mission5.actions.runFive")}</button><button type="button" className="outline" disabled={training.step===0} onClick={reset}><RefreshCw/>{t("mission5.actions.resetTraining")}</button></div>
      <AccuracyNote t={t}>{t("mission5.labels.realOptimisation")}</AccuracyNote>
    </section>
    <Takeaway>{t("mission5.page2.takeaway")}</Takeaway>
  </LearningLayout></section>;
}

export function Lesson5NewPage3({active,t,onComplete}){
  const[processed,setProcessed]=useState(0);
  const completed=processed===TRAINING_EXAMPLES.length;
  const announced=useRef(false);
  useEffect(()=>{if(completed&&!announced.current){announced.current=true;onComplete?.()}},[completed,onComplete]);
  function next(){setProcessed(current=>Math.min(TRAINING_EXAMPLES.length,current+1))}
  function restart(){setProcessed(0);announced.current=false}
  const current=TRAINING_EXAMPLES[Math.min(processed,TRAINING_EXAMPLES.length-1)];
  return <section hidden={!active} className="l5-new-page l5-new-page-three"><LearningLayout sidebar={<LearningSidebar t={t} page={3} term={t("mission5.page3.term")}><p>{t("mission5.page3.technical")}</p></LearningSidebar>}>
    <PageHeading t={t} page={3}/>
    <section className="l5-new-conveyor-lab">
      <div className="l5-new-conveyor-status"><strong>{t("mission5.page3.progress",{current:processed,total:TRAINING_EXAMPLES.length})}</strong><div>{TRAINING_EXAMPLES.map((_,index)=><span className={index<processed?"is-complete":index===processed?"is-current":""} key={index}>{index+1}</span>)}</div></div>
      <div className="l5-new-conveyor-stage">
        <article className="l5-new-example-ticket"><small>{t("mission5.page3.trainingExample")}</small><p>{current.context} <mark>→ {current.target}</mark></p></article>
        <div className="l5-new-mini-loop">{["predict","reveal","compare","adjust"].map((step,index)=><React.Fragment key={step}><span>{t(`mission5.page3.${step}`)}</span>{index<3&&<ArrowRight/>}</React.Fragment>)}</div>
        <section className="l5-new-pattern-meter"><small>{t("mission5.page3.patternCheck")}</small><p>{TRAINING_PROMPT} ___</p><Probabilities items={GRADUAL_PATTERN_STATES[processed]} highlight="ball"/></section>
      </div>
      <div className="l5-new-conveyor-actions">{!completed?<button type="button" className="primary" onClick={next}><Play/>{t("mission5.actions.nextExample")}</button>:<div role="status"><Check/>{t("mission5.page3.allProcessed")}</div>}<button type="button" className="outline" onClick={restart}><RefreshCw/>{t("mission5.actions.restart")}</button></div>
      <AccuracyNote t={t}>{t("mission5.labels.controlled")}</AccuracyNote>
    </section>
    <Takeaway>{t("mission5.page3.takeaway")}</Takeaway>
  </LearningLayout></section>;
}

function ProcessColumn({t,type,steps}){return <section className={`l5-new-process-column is-${type}`}><header><small>{t(`mission5.page4.${type}When`)}</small><h2>{t(`mission5.page4.${type}`)}</h2></header><div>{steps.map((step,index)=><React.Fragment key={step}><span>{t(`mission5.page4.steps.${step}`)}</span>{index<steps.length-1&&<ArrowDown/>}</React.Fragment>)}</div></section>}

export function Lesson5NewPage4({active,t,onComplete}){
  const[connected,setConnected]=useState(false);
  function connect(){setConnected(true);onComplete?.()}
  return <section hidden={!active} className="l5-new-page l5-new-page-four"><LearningLayout sidebar={<LearningSidebar t={t} page={4} term={t("mission5.page4.term")}><p>{t("mission5.page4.technical")}</p></LearningSidebar>}>
    <PageHeading t={t} page={4}/>
    <section className={`l5-new-two-paths ${connected?"is-connected":""}`}>
      <ProcessColumn t={t} type="training" steps={TRAINING_STEPS}/>
      <div className="l5-new-parameter-bridge"><Network/><strong>{t("mission5.page4.learnedParameters")}</strong><p>{t("mission5.page4.bridge")}</p>{!connected?<button type="button" className="primary" onClick={connect}><Sparkles/>{t("mission5.actions.connect")}</button>:<Check aria-label={t("mission5.page4.connected")}/>}</div>
      <ProcessColumn t={t} type="generation" steps={GENERATION_STEPS}/>
    </section>
    <div className="l5-new-course-path" aria-label={t("mission5.page4.coursePath")}>{["tokens","context","transformer","prediction","training"].map((step,index)=><React.Fragment key={step}><span>{t(`mission5.page4.course.${step}`)}</span>{index<4&&<ArrowRight/>}</React.Fragment>)}</div>
    <section className="l5-new-discoveries"><header><Check/><h2>{t("mission5.page4.discovered")}</h2></header>{[1,2,3].map(number=><p key={number}>{t(`mission5.page4.point${number}`)}</p>)}</section>
  </LearningLayout></section>;
}
