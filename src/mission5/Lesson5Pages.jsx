import React,{useEffect,useState} from "react";
import {
  ArrowDown,ArrowRight,BarChart3,BookOpenCheck,Check,CircleDot,
  FlaskConical,GripVertical,Info,Lightbulb,MessageSquare,Network,Plus,RefreshCcw,
  RotateCcw,Settings,Sparkles,Target,Trash2,TrendingUp,UserRound,Zap
} from "lucide-react";
import {
  AVAILABLE_TRAINING_EXAMPLES,STARTER_TRAINING_EXAMPLES,TOY_LOCATIONS,
  calculateToyPrediction,predictionDeltas
} from "./lesson5ToyTraining.js";
import LessonSummaryPage from "../pagedMissions/LessonSummaryPage.jsx";

function LearningLayout({children,sidebar}){return <div className="l5-new-layout"><main className="l5-new-main">{children}</main>{sidebar}</div>}

function Probabilities({items,highlight="",label,initialItems=[]}){const maximum=Math.max(...items.map(item=>item.probability));return <div className="l5-new-probabilities" aria-label={label}>{items.map(item=>{const initial=initialItems.find(candidate=>candidate.token===item.token)?.probability;const delta=typeof initial==="number"?item.probability-initial:null;return <div className={item.token===highlight?"is-highlighted":""} key={item.token}><span>{item.token}</span><i aria-hidden="true"><b style={{width:`${(item.probability/maximum)*100}%`}}/></i><strong>{item.probability.toFixed(Number.isInteger(item.probability)?0:1)}%</strong>{delta!==null&&Math.abs(delta)>=.05&&<em>{delta>0?"↑":"↓"} {Math.abs(delta).toFixed(1)}</em>}</div>})}</div>}

function AccuracyNote({t,children}){return <p className="l5-new-accuracy"><CircleDot/>{children||t("mission5.labels.simulation")}</p>}
function Takeaway({children}){return <div className="l5-new-takeaway"><Check/><p>{children}</p></div>}

const PAGE_2_EXAMPLE_IDS=Object.freeze(["opened","picked","student","together"]);
const PAGE_2_CANDIDATES=Object.freeze([{id:"read",value:46},{id:"write",value:27},{id:"sleep",value:15},{id:"close",value:8},{id:"other",value:4}]);
const PAGE_3_EXAMPLES=Object.freeze([
  ["she","opened","the","book","and","began","to","read","period"],
  ["he","picked","up","the","book","and","started","to","read","period"],
  ["they","opened","their","books","to","read","together","period"]
]);
const PAGE_3_INPUT=Object.freeze(["she","opened","her","new","book","and","began","to"]);
const PAGE_3_PREDICTIONS=Object.freeze([{id:"read",value:62},{id:"write",value:18},{id:"sleep",value:12},{id:"run",value:8}]);

function ExampleStackVisual(){return <span className="l5-page-one-illustration l5-page-one-document-stack" aria-hidden="true"><i/><i/><i/><i/></span>}
function PatternNetworkVisual(){return <svg className="l5-page-one-illustration l5-page-one-pattern-network" viewBox="0 0 110 92" aria-hidden="true"><defs><radialGradient id="l5-network-core"><stop stopColor="#a88af2"/><stop offset="1" stopColor="#7252d8"/></radialGradient><filter id="l5-network-glow"><feGaussianBlur stdDeviation="2.2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g className="network-lines"><path d="M18 48 42 22 72 18 94 42 82 72 48 78 18 48Z"/><path d="M42 22 48 78M72 18 18 48M94 42 48 78M42 22 82 72"/></g><g className="network-nodes" filter="url(#l5-network-glow)"><circle cx="18" cy="48" r="6"/><circle cx="42" cy="22" r="7"/><circle cx="72" cy="18" r="6"/><circle cx="94" cy="42" r="7"/><circle cx="82" cy="72" r="6"/><circle cx="48" cy="78" r="7"/><circle className="network-core" cx="57" cy="48" r="12" fill="url(#l5-network-core)"/></g></svg>}
function PatternOrbVisual({label}){return <span className="l5-page-one-illustration l5-page-one-pattern-orb" role="img" aria-label={label}><i className="orb-core"><b/><b/><b/><b/></i><i className="orb-neck"/><i className="orb-base"/></span>}
function PredictionBarsVisual(){return <span className="l5-page-one-illustration l5-page-one-prediction-bars" aria-hidden="true"><i/><i/><i/><i/><b/></span>}

export function Lesson5NewPage1({active,t,onComplete}){
  useEffect(()=>{if(active)onComplete?.()},[active,onComplete]);
  const examples=PAGE_2_EXAMPLE_IDS.map((id)=><React.Fragment key={id}>{t(`mission5.page2.examples.${id}.line1`)}<br/>{t(`mission5.page2.examples.${id}.line2Before`)}<mark>{t(`mission5.page2.examples.${id}.focus`)}</mark>{t(`mission5.page2.examples.${id}.line2After`)}</React.Fragment>);
  const flow=[
    {label:t("mission5.page1.step1"),visual:<ExampleStackVisual/>},
    {label:t("mission5.page1.step2"),visual:<PatternNetworkVisual/>},
    {label:t("mission5.page1.prediction"),visual:<PatternOrbVisual label={t("mission5.page1.patternOrbAria")}/>},
    {label:t("mission5.page1.realToken"),visual:<PredictionBarsVisual/>}
  ];
  const keyword=<aside className="l5-page-one-keyword" aria-label={t("mission5.page1.term")}><header><small>{t("mission5.page2.keywordLabel")}</small><Lightbulb/></header><div className="l5-page-one-key-icon"><BookOpenCheck/></div><h2>{t("mission5.page1.term")}</h2><p>{t("mission5.page1.technical")}</p><div className="l5-page-one-keyword-note"><small>{t("mission5.page1.rememberLabel")}</small><p>{t("mission5.page1.targetCovered")}</p></div><div className="l5-page-one-keyword-decoration" aria-hidden="true"><i/><i/><i/></div><img src="/assets/img/mission5-robot-training.png" alt="" aria-hidden="true"/></aside>;
  return <section hidden={!active} className="l5-new-page l5-new-page-one"><LearningLayout sidebar={keyword}>
    <section className="l5-page-one-short-answer"><div className="l5-page-one-answer-copy"><span className="l5-page-number-badge">1</span><div><h2>{t("mission5.page1.badge")}</h2><p>{t("mission5.page1.intro")}</p></div></div><div className="l5-page-one-flow" aria-label={t("mission5.page1.flowAria")}>{flow.map((item,index)=><React.Fragment key={item.label}><div className="l5-page-one-flow-step">{item.visual}<strong>{item.label}</strong></div>{index<flow.length-1&&<ArrowRight className="l5-page-one-flow-arrow" aria-hidden="true"/>}</React.Fragment>)}</div></section>
    <section className="l5-page-one-think"><h2>{t("mission5.page1.existingText")}</h2><p>{t("mission5.page1.lesson4")}</p><p>{t("mission5.page1.lesson5")}</p><p>{t("mission5.page1.targetCovered")}</p><div className="l5-page-one-examples"><strong>{t("mission5.page1.targetKnown")}</strong><div>{examples.map((example,index)=><article key={index}>{example}</article>)}<b aria-hidden="true">…</b></div></div><ArrowDown className="l5-page-one-down" aria-hidden="true"/><div className="l5-page-one-takeaway"><CircleDot/><p>{t("mission5.page1.takeaway")}</p></div></section>
  </LearningLayout></section>;
}

export function Lesson5NewPage2({active,t,onComplete}){
  useEffect(()=>{if(active)onComplete?.()},[active,onComplete]);
  const keyword=<aside className="l5-page-two-keyword" aria-label={t("mission5.page2.term")}><header><small>{t("mission5.page2.keywordLabel")}</small><Sparkles/></header><div className="l5-page-two-key-icon"><Lightbulb/></div><h2>{t("mission5.page2.term")}</h2><p>{t("mission5.page2.definition")}</p><div className="l5-page-two-key-decoration" aria-hidden="true"><i/><i/><i/></div><img src="/assets/img/mission5-robot-training.png" alt="" aria-hidden="true"/></aside>;
  return <section hidden={!active} className="l5-new-page l5-new-page-two"><LearningLayout sidebar={keyword}>
    <section className="l5-page-two-card"><header className="l5-page-two-intro"><span className="l5-page-number-badge">2</span><div><h2>{t("mission5.page2.introTitle")}</h2><p>{t("mission5.page2.introBody")}</p></div></header><div className="l5-page-two-examples">{PAGE_2_EXAMPLE_IDS.map((id)=><article key={id}>{t(`mission5.page2.examples.${id}.line1`)}<br/>{t(`mission5.page2.examples.${id}.line2Before`)}<mark>{t(`mission5.page2.examples.${id}.focus`)}</mark>{t(`mission5.page2.examples.${id}.line2After`)}</article>)}<b aria-hidden="true">…</b></div><div className="l5-page-two-explain"><div className="l5-page-two-pattern-copy"><span><Target/></span><p>{t("mission5.page2.patternCopy")}</p></div><ArrowRight aria-hidden="true"/><section className="l5-page-two-chart"><header><strong>{t("mission5.page2.chartTitle")}</strong><BookOpenCheck/></header>{PAGE_2_CANDIDATES.map(({id,value},index)=><div className={`is-bar-${index+1}`} key={id}><span>{t(`mission5.page2.candidates.${id}`)}</span><i><b style={{width:`${(value/70)*100}%`}}/></i><em>{value}%</em></div>)}<footer><span>{t("mission5.page2.lessLikely")}</span><i aria-hidden="true"><b/></i><span>{t("mission5.page2.moreLikely")}</span></footer></section></div><div className="l5-page-two-takeaway"><Info/><p><strong>{t("mission5.page2.takeawayTitle")}</strong><span>{t("mission5.page2.takeawayBody")}</span></p><div aria-hidden="true"><i/><i/><i/><i/></div></div></section>
  </LearningLayout></section>;
}

export function Lesson5NewPage3({active,t,onComplete}){
  useEffect(()=>{if(active)onComplete?.()},[active,onComplete]);
  const token=(id)=>t(`mission5.page3.tokens.${id}`);
  const keyword=<aside className="l5-page-three-keyword" aria-label={t("mission5.page3.term")}><header><small>{t("mission5.page3.keywordLabel")}</small><Sparkles/></header><div className="l5-page-three-key-icon"><Network/></div><h2>{t("mission5.page3.term")}</h2><p>{t("mission5.page3.definition")}</p><div className="l5-page-three-key-decoration" aria-hidden="true"><i/><i/><i/><i/></div><img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true"/></aside>;
  return <section hidden={!active} className="l5-new-page l5-new-page-three"><LearningLayout sidebar={keyword}>
    <section className="l5-page-three-card"><header className="l5-page-three-intro"><span className="l5-page-number-badge">3</span><div><h2>{t("mission5.page3.introTitle")}</h2><p>{t("mission5.page3.introLine1")}<br/>{t("mission5.page3.introLine2")}</p></div></header><div className="l5-page-three-flow" aria-label={t("mission5.page3.flowAria")}><section className="l5-page-three-stage is-examples"><h3>{t("mission5.page3.stage1Title")}</h3><div>{PAGE_3_EXAMPLES.map((example,index)=><article key={index}>{example.filter((tokenId)=>token(tokenId)).map((tokenId,tokenIndex)=><span className={tokenId==="read"?"is-read":""} key={`${tokenId}-${tokenIndex}`}>{token(tokenId)}</span>)}</article>)}</div><strong aria-hidden="true">…</strong><p>{t("mission5.page3.moreExamples")}</p></section><ArrowRight className="l5-page-three-arrow" aria-hidden="true"/><section className="l5-page-three-stage is-pattern"><h3>{t("mission5.page3.stage2Title")}</h3><svg viewBox="0 0 250 180" role="img" aria-label={t("mission5.page3.patternAria")}><g className="pattern-lines"><line x1="125" y1="90" x2="45" y2="35"/><line x1="125" y1="90" x2="202" y2="45"/><line x1="125" y1="90" x2="30" y2="104"/><line x1="125" y1="90" x2="220" y2="105"/><line x1="125" y1="90" x2="65" y2="150"/><line x1="125" y1="90" x2="190" y2="150"/></g><g className="pattern-nodes"><circle cx="45" cy="35" r="11"/><circle cx="202" cy="45" r="11"/><circle cx="30" cy="104" r="11"/><circle cx="220" cy="105" r="11"/><circle cx="65" cy="150" r="11"/><circle cx="190" cy="150" r="11"/><circle className="pattern-core" cx="125" cy="90" r="32"/><text x="125" y="96" textAnchor="middle">{token("read")}</text></g></svg><p>{t("mission5.page3.patternLine1",{token:token("read")})}<br/>{t("mission5.page3.patternLine2")}</p><div className="l5-page-three-pattern-chips"><span>{token("book")}</span><span>{token("opened")}</span><span>{token("began")}</span><b>…</b></div></section><ArrowRight className="l5-page-three-arrow" aria-hidden="true"/><section className="l5-page-three-stage is-prediction"><h3>{t("mission5.page3.stage3Title")}</h3><p>{t("mission5.page3.stage3Line1")}<br/>{t("mission5.page3.stage3Line2")}</p><div className="l5-page-three-new-input"><small>{t("mission5.page3.newInput")}</small><div>{PAGE_3_INPUT.map((tokenId,index)=><span key={`${tokenId}-${index}`}>{token(tokenId)}</span>)}<span className="is-blank" aria-label={t("mission5.page3.missingToken")}>___</span></div></div><ArrowDown aria-hidden="true"/><div className="l5-page-three-prediction"><header><strong>{t("mission5.page3.predictionTitle")}</strong><small>{t("mission5.page3.illustrative")}</small></header>{PAGE_3_PREDICTIONS.map(({id,value},index)=><div className={`is-prediction-${index+1}`} key={id}><span>{token(id)}</span><i><b style={{width:`${value}%`}}/></i><em>{value}%</em></div>)}</div></section></div><div className="l5-page-three-takeaway"><Info/><p><strong>{t("mission5.page3.takeawayTitle")}</strong><span>{t("mission5.page3.takeawayBody")}</span></p><div aria-hidden="true"><i/><i/><i/><i/></div></div></section>
  </LearningLayout></section>;
}

function Page4ProbabilityBars({items,label,t}){return <div className="l5-page-four-probabilities" aria-label={label}>{items.map(([token,value],index)=><div className={`is-tone-${index+1}`} key={token}><span>{t(`mission5.page4.candidates.${token}`)}</span><i aria-hidden="true"><b style={{width:`${value}%`}}/></i><strong>{value}%</strong></div>)}</div>}

function Page4AdjustmentVisual({label}){return <div className="l5-page-four-adjustment-visual" role="img" aria-label={label}><svg viewBox="0 0 210 170" aria-hidden="true"><defs><linearGradient id="l5-page-four-orbit" x1="0" x2="1"><stop stopColor="#8b6ff0"/><stop offset="1" stopColor="#67a9eb"/></linearGradient><marker id="l5-page-four-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z"/></marker></defs><path d="M44 105A66 66 0 0 1 154 54"/><path d="M166 69A66 66 0 0 1 58 124"/><circle cx="39" cy="111" r="5"/><circle cx="171" cy="63" r="5"/></svg><span><Settings/></span><i/><i/><i/></div>}

function Page4PatternVisual(){return <svg className="l5-page-four-pattern-visual" viewBox="0 0 180 78" aria-hidden="true"><g><path d="M17 43 54 18 91 39 126 15 163 42M54 18 67 64 91 39 116 65 163 42M17 43 67 64M126 15 116 65"/></g><g><circle cx="17" cy="43" r="6"/><circle cx="54" cy="18" r="7"/><circle cx="67" cy="64" r="6"/><circle cx="91" cy="39" r="11"/><circle cx="126" cy="15" r="6"/><circle cx="116" cy="65" r="7"/><circle cx="163" cy="42" r="7"/></g></svg>}

export function Lesson5NewPage4({active,t,onComplete}){
  useEffect(()=>{if(active)onComplete?.()},[active,onComplete]);
  const before=[["book",30],["door",40],["box",20],["other",10]];
  const after=[["book",65],["door",15],["box",10],["other",10]];
  const keyword=<aside className="l5-page-four-keyword" aria-label={t("mission5.page4.term")}><header><small>{t("mission5.page4.keyword")}</small><Sparkles/></header><div className="l5-page-four-key-icon"><Settings/></div><h2>{t("mission5.page4.term")}</h2><p>{t("mission5.page4.definition")}</p><p>{t("mission5.page4.parameterChange")}</p><div className="l5-page-four-key-decoration" aria-hidden="true"><i/><i/><i/></div></aside>;
  return <section hidden={!active} className="l5-new-page l5-new-page-four"><LearningLayout sidebar={keyword}>
    <section className="l5-page-four-card">
      <header className="l5-page-four-intro"><span className="l5-page-number-badge">4</span><div><h2>{t("mission5.page4.kicker")}</h2><p>{t("mission5.page4.intro")}</p><p>{t("mission5.page4.repeatIntro")}</p></div></header>
      <small className="l5-page-four-illustrative">{t("mission5.page4.illustrative")}</small>
      <div className="l5-page-four-flow">
        <section className="l5-page-four-stage is-before"><h3>{t("mission5.page4.beforeTitle")}</h3><p>{t("mission5.page4.beforeBody")}</p><Page4ProbabilityBars items={before} label={t("mission5.page4.beforeTitle")} t={t}/><div className="l5-page-four-note is-before-note"><CircleDot/><span>{t("mission5.page4.beforeNote")}</span></div></section>
        <ArrowRight className="l5-page-four-flow-arrow" aria-hidden="true"/>
        <section className="l5-page-four-stage is-adjustment"><h3>{t("mission5.page4.adjustmentTitle")}</h3><Page4AdjustmentVisual label={t("mission5.page4.adjustmentVisual")}/><p>{t("mission5.page4.adjustmentBody")}</p><strong>{t("mission5.page4.smallChange")}</strong></section>
        <ArrowRight className="l5-page-four-flow-arrow" aria-hidden="true"/>
        <section className="l5-page-four-stage is-after"><h3>{t("mission5.page4.afterTitle")}</h3><p>{t("mission5.page4.afterBody")}</p><Page4ProbabilityBars items={after} label={t("mission5.page4.afterTitle")} t={t}/><div className="l5-page-four-note is-after-note"><Check/><span>{t("mission5.page4.afterNote")}</span></div></section>
      </div>
      <section className="l5-page-four-takeaway"><Info/><div><h3>{t("mission5.page4.takeawayTitle")}</h3><p>{t("mission5.page4.takeawayOne")}</p><p>{t("mission5.page4.takeawayMany")}</p><p>{t("mission5.page4.takeawayOverTime")}</p></div><div className="l5-page-four-repetition-visual" aria-hidden="true"><Settings/><ArrowRight/><Settings/><ArrowRight/><Settings/><ArrowRight/><Page4PatternVisual/></div></section>
    </section>
  </LearningLayout></section>;
}

function ToyLocationVisual({location}) {
  if (location === "forest") return <svg viewBox="0 0 120 86" aria-hidden="true"><rect className="ground" x="8" y="70" width="104" height="8" rx="4"/><g className="trees"><path d="M23 68 39 39 55 68Z"/><path d="M49 68 68 27 87 68Z"/><path d="M75 68 92 37 109 68Z"/><path d="M27 53 39 30 51 53ZM57 45 68 19 79 45ZM81 53 92 29 103 53Z"/></g><g className="trunks"><rect x="36" y="65" width="6" height="10"/><rect x="65" y="63" width="7" height="12"/><rect x="89" y="64" width="6" height="11"/></g></svg>;
  if (location === "castle") return <svg viewBox="0 0 120 86" aria-hidden="true"><path className="castle-base" d="M27 36h66v39H27z"/><path className="castle-tower" d="M19 30h25v45H19zM76 30h25v45H76z"/><path className="castle-roof" d="m16 30 15-18 15 18Zm58 0 15-18 15 18Z"/><path className="castle-door" d="M51 75V57c0-12 18-12 18 0v18Z"/><rect className="castle-window" x="27" y="42" width="8" height="10" rx="3"/><rect className="castle-window" x="85" y="42" width="8" height="10" rx="3"/><path className="castle-flag" d="M31 12V3m0 0 13 5-13 5M89 12V3m0 0 13 5-13 5"/></svg>;
  return <svg viewBox="0 0 120 86" aria-hidden="true"><path className="cave-rock" d="M8 74C10 36 30 12 60 10c31 2 50 27 52 64Z"/><path className="cave-mouth" d="M35 74c1-27 11-42 25-42s25 15 26 42Z"/><path className="cave-lines" d="M20 58 35 50m-5-24 14 10m47 17 14 7M78 27l-9 12"/></svg>;
}

function toyExampleText(example,t) {
  const path=`mission5.page5.examples.${example.id}`;
  return `${t(`${path}.before`)}${t(`${path}.location`)}${t(`${path}.after`)}`;
}

function HighlightedToyExample({example,t}) {
  const path=`mission5.page5.examples.${example.id}`;
  return <>{t(`${path}.before`)}<mark>{t(`${path}.location`)}</mark>{t(`${path}.after`)}</>;
}

function ToyPredictionBars({prediction,t}) {
  return <div className="l5-page-five-predictions" aria-label={t("mission5.page5.predictionAria")}>{TOY_LOCATIONS.map((location)=><div className={`is-${location}`} key={location}><ToyLocationVisual location={location}/><span>{t(`mission5.page5.locations.${location}`)}</span><i aria-hidden="true"><b style={{width:`${prediction[location]}%`}}/></i><strong>{prediction[location]}%</strong></div>)}</div>;
}

export function Lesson5NewPage5({active,t}){
  const[addedIds,setAddedIds]=useState([]);
  const[chooserOpen,setChooserOpen]=useState(false);
  const[latestChange,setLatestChange]=useState(null);
  const prediction=calculateToyPrediction(addedIds);
  const addedExamples=addedIds.map((id)=>AVAILABLE_TRAINING_EXAMPLES.find((example)=>example.id===id)).filter(Boolean);
  const availableExamples=AVAILABLE_TRAINING_EXAMPLES.filter((example)=>!addedIds.includes(example.id));

  function addExample(id){
    const example=AVAILABLE_TRAINING_EXAMPLES.find((candidate)=>candidate.id===id);
    if(!example||addedIds.includes(id))return;
    const nextIds=[...addedIds,id];
    const nextPrediction=calculateToyPrediction(nextIds);
    setAddedIds(nextIds);
    setLatestChange({action:"added",example,deltas:predictionDeltas(prediction,nextPrediction)});
    setChooserOpen(false);
  }

  function removeExample(id){
    const example=AVAILABLE_TRAINING_EXAMPLES.find((candidate)=>candidate.id===id);
    const nextIds=addedIds.filter((exampleId)=>exampleId!==id);
    const nextPrediction=calculateToyPrediction(nextIds);
    setAddedIds(nextIds);
    setLatestChange(example?{action:"removed",example,deltas:predictionDeltas(prediction,nextPrediction)}:null);
  }

  function resetSimulation(){setAddedIds([]);setLatestChange(null);setChooserOpen(false)}

  const sidebar=<aside className="l5-page-five-sidebar" aria-label={t("mission5.page5.sidebarAria")}><section className="l5-page-five-how"><header><Lightbulb/><h2>{t("mission5.page5.howTitle")}</h2></header><ol><li><Plus/><span>{t("mission5.page5.how1")}</span></li><li><Network/><span>{t("mission5.page5.how2")}</span></li><li><BarChart3/><span>{t("mission5.page5.how3")}</span></li><li><Sparkles/><span>{t("mission5.page5.how4")}</span></li></ol></section><section className="l5-page-five-disclaimer"><Info/><div><h2>{t("mission5.page5.simulationTitle")}</h2><p>{t("mission5.page5.simulationBody")}</p><p>{t("mission5.page5.simulationBoundary")}</p></div></section></aside>;

  return <section hidden={!active} className="l5-new-page l5-new-page-five"><LearningLayout sidebar={sidebar}>
    <section className="l5-page-five-card">
      <header className="l5-page-five-intro"><span className="l5-page-number-badge">5</span><div><h2>{t("mission5.page5.kicker")}</h2><p>{t("mission5.page5.intro")}</p></div></header>
      <div className="l5-page-five-stages">
        <section className="l5-page-five-stage is-examples"><header><h3>{t("mission5.page5.stage1")}</h3><p>{t("mission5.page5.stage1Body")}</p></header><div className="l5-page-five-example-list">{[...STARTER_TRAINING_EXAMPLES,...addedExamples].map((example)=><article className={example.starter?"is-starter":"is-added"} key={example.id}><GripVertical aria-hidden="true"/><p><HighlightedToyExample example={example} t={t}/></p>{example.starter?<small>{t("mission5.page5.starter")}</small>:<button type="button" onClick={()=>removeExample(example.id)} aria-label={t("mission5.page5.removeExample",{example:toyExampleText(example,t)})}><Trash2/></button>}</article>)}</div><div className="l5-page-five-add"><button type="button" className="l5-page-five-add-button" aria-expanded={chooserOpen} onClick={()=>setChooserOpen((open)=>!open)} disabled={availableExamples.length===0}><Plus/>{t("mission5.page5.addExample")}</button>{chooserOpen&&<div className="l5-page-five-chooser"><strong>{t("mission5.page5.chooseExample")}</strong>{availableExamples.map((example)=><button type="button" onClick={()=>addExample(example.id)} key={example.id}><span><HighlightedToyExample example={example} t={t}/></span><Plus/></button>)}</div>}</div><div className="l5-page-five-reset-row"><button type="button" onClick={resetSimulation} disabled={addedIds.length===0}><RotateCcw/>{t("mission5.page5.reset")}</button></div><section className="l5-page-five-world"><header><h3>{t("mission5.page5.worldTitle")}</h3><p>{t("mission5.page5.worldBody")}</p></header><div>{TOY_LOCATIONS.map((location)=><figure className={`is-${location}`} key={location}><ToyLocationVisual location={location}/><figcaption>{t(`mission5.page5.locations.${location}`)}</figcaption></figure>)}</div></section></section>
        <ArrowRight className="l5-page-five-column-arrow" aria-hidden="true"/>
        <section className="l5-page-five-stage is-prediction"><header><h3>{t("mission5.page5.stage2")}</h3><p>{t("mission5.page5.stage2Body")}</p></header><div className="l5-page-five-test-sentence">{t("mission5.page5.testPrompt")} <strong>___</strong></div><header className="l5-page-five-prediction-heading"><h3>{t("mission5.page5.stage3")}</h3><p>{t("mission5.page5.stage3Body")}</p></header><ToyPredictionBars prediction={prediction} t={t}/><div className="l5-page-five-pattern-note"><TrendingUp/><p>{addedIds.length===0?t("mission5.page5.initialPattern"):t("mission5.page5.currentPattern",{location:t(`mission5.page5.locations.${latestChange?.example.location||"cave"}`)})}</p></div></section>
        <ArrowRight className="l5-page-five-column-arrow" aria-hidden="true"/>
        <section className="l5-page-five-stage is-change" aria-live="polite"><header><h3>{t("mission5.page5.stage4")}</h3><p>{t("mission5.page5.stage4Body")}</p></header>{!latestChange?<div className="l5-page-five-empty-change"><Sparkles/><p>{t("mission5.page5.emptyChange")}</p></div>:<div className="l5-page-five-latest"><small>{t("mission5.page5.latestChange")}</small><strong>{toyExampleText(latestChange.example,t)}</strong><p>{latestChange.action==="added"?t("mission5.page5.addedFeedback",{location:t(`mission5.page5.locations.${latestChange.example.location}`)}):t("mission5.page5.removedFeedback",{location:t(`mission5.page5.locations.${latestChange.example.location}`)})}</p><div>{TOY_LOCATIONS.map((location)=>{const delta=latestChange.deltas[location];return <span className={`is-${location} ${delta>0?"is-up":delta<0?"is-down":"is-same"}`} key={location}>{t(`mission5.page5.locations.${location}`)}<b>{delta>0?"↑":delta<0?"↓":"—"} {delta===0?"":Math.abs(delta)}%</b></span>})}</div></div>}</section>
      </div>
    </section>
  </LearningLayout></section>;
}

const PAGE_6_FIRST_CANDIDATES=Object.freeze([
  {id:"because",value:42},{id:"the",value:21},{id:"it",value:12},{id:"well",value:8},{id:"i",value:5}
]);
const PAGE_6_NEXT_CANDIDATES=Object.freeze([
  {id:"sunlight",value:31},{id:"light",value:24},{id:"the",value:18},{id:"a",value:9},{id:"this",value:6}
]);
const PAGE_6_GROWTH_IDS=Object.freeze(["prompt","because","sunlight","is","scattered"]);

function Page6ProbabilityBars({items,t,label}){
  return <div className="l5-page-six-probabilities" aria-label={label}>{items.map(({id,value},index)=><div className={`is-tone-${index+1}`} key={id}><span>{t(`mission5.page6.candidates.${id}`)}</span><i aria-hidden="true"><b style={{width:`${(value/items[0].value)*100}%`}}/></i><strong>{value}%</strong></div>)}</div>;
}

export function Lesson5NewPage6({active,t,onOpenLab}){
  const support=[
    {Icon:Network,id:"patterns"},
    {Icon:MessageSquare,id:"context"},
    {Icon:Zap,id:"prediction"}
  ];
  const step=(number,id,content)=><section className={`l5-page-six-step is-${id}`}><header><span>{number}</span><h3>{t(`mission5.page6.steps.${id}.title`)}</h3></header>{content}<p>{t(`mission5.page6.steps.${id}.body`)}</p></section>;
  return <section hidden={!active} className="l5-new-page l5-new-page-six"><div className="l5-page-six-layout">
    <main className="l5-page-six-card">
      <header className="l5-page-six-intro"><span className="l5-page-number-badge">6</span><div><h2>{t("mission5.page6.kicker")}</h2><p>{t("mission5.page6.intro")}</p></div></header>
      <section className="l5-page-six-teaching" aria-label={t("mission5.page6.flowAria")}>
        <div className="l5-page-six-steps">
          {step(1,"prompt",<div className="l5-page-six-prompt"><strong>{t("mission5.page6.example.prompt")}</strong><UserRound aria-hidden="true"/></div>)}
          <ArrowRight className="l5-page-six-arrow" aria-hidden="true"/>
          {step(2,"predict",<><Page6ProbabilityBars items={PAGE_6_FIRST_CANDIDATES} t={t} label={t("mission5.page6.steps.predict.distributionAria")}/><div className="l5-page-six-selected"><small>{t("mission5.page6.selected")}</small><strong>{t("mission5.page6.candidates.because")}</strong></div><p className="l5-page-six-illustrative">{t("mission5.page6.illustrative")}</p></>)}
          <ArrowRight className="l5-page-six-arrow" aria-hidden="true"/>
          {step(3,"append",<div className="l5-page-six-context"><span>{t("mission5.page6.example.prompt")}</span><strong>{t("mission5.page6.candidates.because")}</strong><Plus aria-hidden="true"/></div>)}
          <ArrowRight className="l5-page-six-arrow" aria-hidden="true"/>
          {step(4,"repeat",<><Page6ProbabilityBars items={PAGE_6_NEXT_CANDIDATES} t={t} label={t("mission5.page6.steps.repeat.distributionAria")}/><div className="l5-page-six-loop"><RefreshCcw aria-hidden="true"/><span>{t("mission5.page6.loop")}</span></div><p className="l5-page-six-illustrative">{t("mission5.page6.illustrative")}</p></>)}
        </div>
        <section className="l5-page-six-growth" aria-label={t("mission5.page6.growthAria")}><h2><Sparkles aria-hidden="true"/>{t("mission5.page6.growthTitle")}</h2><div className="l5-page-six-growth-row">{PAGE_6_GROWTH_IDS.map((id,index)=><React.Fragment key={id}><article><p>{t("mission5.page6.example.prompt")}</p>{id!=="prompt"&&<strong>{t(`mission5.page6.growth.${id}`)}</strong>}</article>{index<PAGE_6_GROWTH_IDS.length-1&&<ArrowRight aria-hidden="true"/>}</React.Fragment>)}<b aria-hidden="true">…</b><ArrowRight aria-hidden="true"/><article className="is-final"><small>{t("mission5.page6.finalLabel")}</small><p>{t("mission5.page6.example.prompt")}</p><strong>{t("mission5.page6.example.fullResponse")}</strong></article></div><p className="l5-page-six-final-note">{t("mission5.page6.finalNote")}</p></section>
      </section>
    </main>
    <aside className="l5-page-six-sidebar" aria-label={t("mission5.page6.sidebarAria")}><section><h2>{t("mission5.page6.sidebarTitle")}</h2>{support.map(({Icon,id})=><article key={id}><Icon aria-hidden="true"/><div><h3>{t(`mission5.page6.support.${id}.title`)}</h3><p>{t(`mission5.page6.support.${id}.body`)}</p></div></article>)}</section><section className="l5-page-six-lab"><FlaskConical aria-hidden="true"/><div><h2>{t("mission5.page6.labTitle")}</h2><p>{t("mission5.page6.labBody")}</p><button type="button" onClick={onOpenLab}>{t("mission5.page6.labAction")}<ArrowRight aria-hidden="true"/></button></div></section></aside>
  </div></section>;
}

export function Lesson5NewPage8({active,t,complete}){
  const ideas=[
    {Icon:BookOpenCheck,title:t("mission5.page8.idea1Title"),copy:t("mission5.page8.idea1Copy")},
    {Icon:Settings,title:t("mission5.page8.idea2Title"),copy:t("mission5.page8.idea2Copy")},
    {Icon:Network,title:t("mission5.page8.idea3Title"),copy:t("mission5.page8.idea3Copy")},
    {Icon:TrendingUp,title:t("mission5.page8.idea4Title"),copy:t("mission5.page8.idea4Copy")}
  ];
  return <LessonSummaryPage active={active} pageNumber="8" kicker={t("mission5.page8.eyebrow")} ideas={ideas} recap={t("mission5.page8.recap")} nuance={t("mission5.page8.nuance")} nextLabel={t("mission5.page8.nextLabel")} nextTitle={t("mission5.page8.nextTitle")} nextCopy={t("mission5.page8.next")} advisory={!complete?t("learningMode.notice"):""}/>;
}
