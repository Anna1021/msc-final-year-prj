import React,{useEffect,useRef,useState}from"react";
import{
  ArrowRight,Banknote,Bird,BrainCircuit,CakeSlice,Check,CircleHelp,CloudRain,
  Dumbbell,Eye,Flower2,Gamepad2,Gem,House,LampDesk,Laptop,Lightbulb,MousePointer2,
  Music2,PartyPopper,Play,RefreshCcw,RotateCcw,Search,Shuffle,Sparkles,Sun,Telescope,
  Trees,Users,Waves,WalletCards
}from"lucide-react";
import{useI18n}from"../../i18n/index.jsx";
import AiLabStickerGuide from"../../playfulLearning/AiLabStickerGuide.jsx";
import{composeContextResponse,contextScenarios,contextWordExamples}from"./contextLabData.js";
import"./contextStage.css";

const senseIcons={
  money:[Banknote,WalletCards],river:[Waves,Trees],animal:[Bird,Trees],sport:[Dumbbell,Gamepad2],
  game:[Gamepad2,Users],fire:[Sparkles,LampDesk],weight:[WalletCards,Dumbbell],lamp:[LampDesk,Sun],
  ocean:[Waves,Sun],greeting:[Users,Sparkles],jewellery:[Gem,Sparkles],sound:[Music2,Laptop],
  computer:[MousePointer2,Laptop],season:[Flower2,Sun],coil:[RotateCcw,Dumbbell]
};
const detailIcons={age:CakeSlice,guests:Users,indoors:House,budget:WalletCards,anime:Sparkles,blue:PartyPopper,saturn:Telescope,friends:Users,outdoors:Trees,rain:CloudRain,photos:Sparkles};

function Sentence({example,sense,step,active}){
  const words=[...sense.contextWords,example.target],pattern=new RegExp(`(${words.join("|")})`,"gi");
  let clueIndex=0;
  return <p>{sense.sentence.split(pattern).map((part,index)=>{
    const lower=part.toLowerCase();
    if(lower===example.target)return <mark className={`target ${active&&step>=3?"on":""}`} key={index}>{part}</mark>;
    if(sense.contextWords.includes(lower)){const order=clueIndex++;return <mark style={{"--clue-order":order}} className={`clue ${active&&step>=order+1?"on":""}`} key={index}>{part}</mark>;}
    return <React.Fragment key={index}>{part}</React.Fragment>;
  })}</p>;
}
function SceneMotif({senseId}){const[Primary,Secondary]=senseIcons[senseId]||[Sparkles,CircleHelp];return <span className={`context-scene-motif sense-${senseId}`} aria-hidden="true"><Primary/><i/><Secondary/></span>;}
function DetailIcon({id,size=18}){const Icon=detailIcons[id]||CircleHelp;return <Icon size={size} strokeWidth={1.8}/>;}

function MeaningExperiment({t,language,onSceneSelected=()=>{}}){
  const[exampleIndex,setExampleIndex]=useState(0),[senseIndex,setSenseIndex]=useState(null),[step,setStep]=useState(0),[playing,setPlaying]=useState(false),[whyOpen,setWhyOpen]=useState(false);
  const timers=useRef([]),example=contextWordExamples[exampleIndex],sense=senseIndex===null?null:example.senses[senseIndex];
  function clear(){timers.current.forEach(window.clearTimeout);timers.current=[];}
  function play(nextSense){
    clear();setSenseIndex(nextSense);setWhyOpen(false);onSceneSelected();
    const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if(reduced){setStep(4);setPlaying(false);return;}
    setStep(0);setPlaying(true);
    [330,690,1080,1480].forEach((delay,index)=>timers.current.push(window.setTimeout(()=>setStep(index+1),delay)));
    timers.current.push(window.setTimeout(()=>setPlaying(false),1900));
  }
  useEffect(()=>()=>clear(),[]);
  function another(){clear();setExampleIndex(index=>(index+1)%contextWordExamples.length);setSenseIndex(null);setStep(0);setPlaying(false);setWhyOpen(false);}

  return <section className="context-workspace meaning-workspace">
    <div className="context-word-head"><div><small>{t("contextStage.meaning.mystery")}</small><strong data-tour-id="context-target-word">{example.target}</strong>{language!=="en"&&<em>{t("contextStage.meaning.englishNote")}</em>}</div><button type="button" className="context-discovery-control" data-tour-id="context-another-word" onClick={another}><Shuffle size={17}/><span>{t("contextStage.actions.anotherExample")}</span></button></div>
    <p className="experiment-instruction">{t("contextStage.meaning.instruction")}</p>
    <div className="context-scene-options" data-tour-id="context-sentence-options">{example.senses.map((item,index)=>{
      const active=senseIndex===index,quiet=senseIndex!==null&&!active;
      return <button type="button" key={item.id} className={`context-scene-card ${active?"active":""} ${quiet?"quiet":""}`} aria-pressed={active} onClick={()=>play(index)}>
        <span className="context-scene-label">{t("contextStage.meaning.scene",{letter:String.fromCharCode(65+index)})}</span><SceneMotif senseId={item.id}/><span className="context-scene-copy"><Sentence example={example} sense={item} step={active?step:0} active={active}/></span><span className="context-scene-choice">{active?<Check/>:String.fromCharCode(65+index)}</span>
      </button>;
    })}</div>
    {!sense&&<div className="context-scene-prompt"><Search/><strong>{t("contextStage.meaning.choosePrompt")}</strong><span>{example.target}</span></div>}
    {sense&&<div className={`context-investigation-board step-${step}`} data-tour-id="context-highlight-words" aria-live="polite">
      <AiLabStickerGuide src="/assets/img/mission-robot-pointing.png" className="context-investigator" hiddenOnMobile/>
      <div className="context-clue-board"><small>{t("contextStage.meaning.clues")}</small><em>{t("contextStage.meaning.contextLabel")}</em><span>{sense.contextWords.map((word,index)=><b key={word} style={{"--clue-order":index}} className={step>=index+1?"on":""}>{word}</b>)}</span></div>
      <ArrowRight aria-hidden="true"/><div className={`context-target-node ${step>=3?"on":""}`}><small>{t("contextStage.meaning.word")}</small><strong>{example.target}</strong></div>
      <ArrowRight aria-hidden="true"/><div className={`context-meaning-card ${step>=4?"on":""}`} data-tour-id="context-meaning-card"><small>{t("contextStage.meaning.likely")}</small><strong>{step>=4?t(`contextStage.examples.${example.id}.${sense.id}.meaning`):t("contextStage.meaning.hiddenMeaning")}</strong></div>
    </div>}
    {sense&&<p className={`context-explanation ${step>=4?"visible":""}`}>{step>=4?t(`contextStage.examples.${example.id}.${sense.id}.explanation`):t("contextStage.meaning.watching")}</p>}
    {sense&&<div className="context-meaning-actions"><button type="button" className="primary context-replay" data-tour-id="context-replay" disabled={playing} onClick={()=>play(senseIndex)}><Play size={16}/>{t(playing?"contextStage.actions.playing":"contextStage.actions.watchAgain")}</button><button type="button" className="context-why-toggle" aria-expanded={whyOpen} onClick={()=>setWhyOpen(open=>!open)}><CircleHelp size={16}/>{t("contextStage.meaning.whyTitle")}</button></div>}
    {whyOpen&&<aside className="context-why-panel"><p>{t("contextStage.meaning.whyBody")}</p><p>{t("contextStage.meaning.patterns")}</p><small>{t("contextStage.meaning.notHuman")}</small></aside>}
    {sense&&step>=4&&<section className="context-meaning-takeaway" data-tour-id="context-meaning-takeaway"><div><span>{t("contextStage.meaning.clues")}</span><b>{sense.contextWords.join(" + ")}</b></div><strong>+</strong><div><span>{t("contextStage.meaning.sameWord")}</span><b>{example.target}</b></div><ArrowRight/><div><span>{t("contextStage.meaning.likely")}</span><b>{t(`contextStage.examples.${example.id}.${sense.id}.meaning`)}</b></div><p>{t("contextStage.meaning.takeaway")}</p></section>}
  </section>;
}

function BuilderExperiment({t,onUsefulSelected=()=>{},onUnrelatedSelected=()=>{}}){
  const[scenarioIndex,setScenarioIndex]=useState(0),[selected,setSelected]=useState([]),[flash,setFlash]=useState(false),[highlighted,setHighlighted]=useState(null);
  const scenarioHeading=useRef(null),scenario=contextScenarios[scenarioIndex],after=composeContextResponse(t,scenario,selected),base=t(`contextStage.scenarios.${scenario.id}.responses.base`);
  const selectedDetails=selected.map(id=>scenario.details.find(item=>item.id===id));
  const highlightedDetail=scenario.details.find(item=>item.id===highlighted);
  const highlightedChanges=highlightedDetail?composeContextResponse(t,scenario,selected)!==composeContextResponse(t,scenario,selected.filter(id=>id!==highlighted)):false;
  const highlightedEffect=highlightedDetail?.category==="useful"&&!highlightedChanges?"usefulPending":highlightedDetail?.category;
  function toggle(detail){
    const adding=!selected.includes(detail.id);
    setSelected(items=>adding?[...items,detail.id]:items.filter(id=>id!==detail.id));setHighlighted(adding?detail.id:null);setFlash(false);
    const nextSelected=adding?[...selected,detail.id]:selected.filter(id=>id!==detail.id);
    if(adding&&detail.category==="useful"&&composeContextResponse(t,scenario,nextSelected)!==composeContextResponse(t,scenario,selected))onUsefulSelected();if(adding&&detail.category==="unrelated")onUnrelatedSelected();
    window.requestAnimationFrame(()=>setFlash(true));
  }
  function another(){setScenarioIndex(value=>(value+1)%contextScenarios.length);setSelected([]);setHighlighted(null);setFlash(false);window.requestAnimationFrame(()=>scenarioHeading.current?.focus());}
  function reset(){setSelected([]);setHighlighted(null);setFlash(false);}
  return <section className="context-workspace builder-workspace" data-tour-id="context-builder">
    <div className="builder-head"><div><small>{t("contextStage.builder.activityBoard")}</small><h3 ref={scenarioHeading} tabIndex="-1">{t(`contextStage.scenarios.${scenario.id}.question`)}</h3></div><button type="button" className="context-discovery-control" onClick={another}><Shuffle size={17}/>{t("contextStage.actions.anotherScenario")}</button></div>
    <p className="experiment-instruction">{t("contextStage.builder.instruction")}</p>
    <div className="context-builder-scene">
      <div className="context-vague-request" data-tour-id="context-vague-request"><AiLabStickerGuide src="/assets/img/mission-robot-reading.png" className="context-builder-robot" hiddenOnMobile/><div><small>{t("contextStage.builder.original")}</small><strong>{t(`contextStage.scenarios.${scenario.id}.question`)}</strong><p>{t("contextStage.builder.robotUnsure")}</p></div></div>
      <ArrowRight aria-hidden="true"/>
      <div className="context-prompt-tray"><span><PartyPopper size={18}/>{t("contextStage.builder.promptTray")}</span><strong>{t(`contextStage.scenarios.${scenario.id}.question`)}</strong><div>{selectedDetails.length?selectedDetails.map(detail=><button type="button" key={detail.id} className={detail.category} onClick={()=>setHighlighted(detail.id)}><DetailIcon id={detail.id}/><span>{t(`contextStage.scenarios.${scenario.id}.details.${detail.id}`)}</span></button>):<p>{t("contextStage.builder.emptyTray")}</p>}</div></div>
    </div>
    <div className="detail-panel" data-tour-id="context-detail-cards"><strong>{t("contextStage.builder.addDetails")}</strong><div>{scenario.details.map(detail=>{
      const active=selected.includes(detail.id);
      return <button type="button" key={detail.id} className={active?`selected ${detail.category}`:""} aria-pressed={active} onClick={()=>toggle(detail)}><DetailIcon id={detail.id}/><span>{t(`contextStage.scenarios.${scenario.id}.details.${detail.id}`)}</span>{active&&<small className={detail.category}><Check/>{t(`contextStage.feedback.${detail.category}`)}</small>}</button>;
    })}</div></div>
    {highlighted&&<div className={`context-cause-link ${highlightedDetail?.category}`} aria-live="polite"><span><DetailIcon id={highlighted}/>{t(`contextStage.scenarios.${scenario.id}.details.${highlighted}`)}</span><ArrowRight/><strong>{t(`contextStage.builder.effects.${highlightedEffect}`)}</strong></div>}
    <div className="context-response-compare" data-tour-id="context-response-preview">
      <article className="context-response-before"><span>{t("contextStage.builder.before")}</span><BrainCircuit size={22}/><p>{base}</p></article><ArrowRight aria-hidden="true"/>
      <article className={`context-response-after ${flash?"updated":""}`} aria-live="polite"><span>{t("contextStage.builder.after")}</span><Sparkles size={22}/><p>{after}</p><div>{selectedDetails.map(detail=><button type="button" key={detail.id} className={`${detail.category} ${highlighted===detail.id?"highlighted":""}`} onClick={()=>setHighlighted(detail.id)}><DetailIcon id={detail.id}/><small>{t(`contextStage.feedback.${detail.category}`)}</small></button>)}</div></article>
    </div>
    <p className="context-demo-label">{t("contextStage.builder.demo")}</p>
    <section className="context-builder-discovery" data-tour-id="context-builder-discovery"><div className="useful"><Lightbulb/><strong>{t("contextStage.feedback.useful")}</strong><span>{t("contextStage.builder.discoveries.useful")}</span></div><div className="extra"><Sparkles/><strong>{t("contextStage.feedback.extra")}</strong><span>{t("contextStage.builder.discoveries.extra")}</span></div><div className="unrelated"><CircleHelp/><strong>{t("contextStage.feedback.unrelated")}</strong><span>{t("contextStage.builder.discoveries.unrelated")}</span></div><p>{t("contextStage.builder.finalDiscovery")}</p><small>{t("contextStage.safeguards.canStillFail")}</small></section>
    <button type="button" className="outline builder-reset" onClick={reset}><RotateCcw size={16}/>{t("contextStage.actions.resetDetails")}</button>
  </section>;
}

function ExperimentSelector({id,tourId,active,onClick,t}){
  const meaning=id==="meaning";
  return <button id={`context-tab-${id}`} type="button" role="tab" aria-controls="context-panel" aria-selected={active} tabIndex={active?0:-1} className={`context-experiment-selector ${active?"active":""}`} data-tour-id={tourId} onClick={onClick}>
    <span className="context-selector-art" aria-hidden="true">{meaning?<><span><Trees/></span><b>bat</b><span><Gamepad2/></span><Search/></>:<><AiLabStickerGuide src="/assets/img/mission-robot-reading.png" className="context-selector-robot"/><span><CakeSlice/><Users/><WalletCards/></span></>}</span>
    <span><strong>{t(`contextStage.entrances.${id}.title`)}</strong><small>{t(`contextStage.entrances.${id}.body`)}</small></span><ArrowRight/>
  </button>;
}

export default function ContextStagePage({onSceneSelected=()=>{},onBuilderOpened=()=>{},onUsefulSelected=()=>{},onUnrelatedSelected=()=>{}}){
  const{language,t}=useI18n();
  const[experiment,setExperiment]=useState("meaning"),[resetKey,setResetKey]=useState(0);
  function restart(){setExperiment("meaning");setResetKey(value=>value+1);}
  function selectExperiment(next){setExperiment(next);if(next==="builder")onBuilderOpened();}
  function moveTab(event){if(!["ArrowLeft","ArrowRight"].includes(event.key))return;event.preventDefault();const next=experiment==="meaning"?"builder":"meaning";selectExperiment(next);window.requestAnimationFrame(()=>document.getElementById(`context-tab-${next}`)?.focus());}
  return <section className="context-stage" aria-labelledby="context-stage-title">
    <header className="context-stage-header" data-tour-id="context-stage-hero"><div className="context-hero-scenes" aria-hidden="true"><span><Trees/></span><b>clues</b><span><Search/></span></div><div className="context-title"><div><span>{t("contextStage.header.term")}</span><h2 id="context-stage-title">{t("contextStage.header.title")}</h2><p>{t("contextStage.header.intro")}</p></div></div><AiLabStickerGuide src="/assets/img/mission-robot-pointing.png" className="context-header-robot"/><button type="button" className="outline" data-tour-id="context-reset" onClick={restart}><RefreshCcw size={16}/>{t("contextStage.actions.resetDetails")}</button></header>
    <div className="context-bridge"><Eye size={18}/><span>{t("contextStage.bridge")}</span></div>
    <div className="context-tabs" data-tour-id="context-experiment-tabs" role="tablist" onKeyDown={moveTab}><ExperimentSelector id="meaning" tourId="context-experiment-meaning" active={experiment==="meaning"} onClick={()=>selectExperiment("meaning")} t={t}/><ExperimentSelector id="builder" tourId="context-experiment-builder" active={experiment==="builder"} onClick={()=>selectExperiment("builder")} t={t}/></div>
    <div id="context-panel" className="context-tab-panel" role="tabpanel" aria-labelledby={`context-tab-${experiment}`}>{experiment==="meaning"?<MeaningExperiment key={`meaning-${resetKey}`} t={t} language={language} onSceneSelected={onSceneSelected}/>:<BuilderExperiment key={`builder-${resetKey}`} t={t} onUsefulSelected={onUsefulSelected} onUnrelatedSelected={onUnrelatedSelected}/>}</div>
    <footer className="context-safeguard"><strong>{t("contextStage.safeguards.simple")}</strong><span>{t("contextStage.safeguards.noGuarantee")}</span></footer>
  </section>;
}
