import React,{useEffect,useMemo,useRef,useState}from"react";
import{ArrowLeft,ArrowRight,BookOpen,BrainCircuit,Calculator,Check,ChevronDown,ChevronUp,CircleHelp,Database,DoorOpen,Eye,EyeOff,GraduationCap,Layers3,Play,RotateCcw,Send,ShieldCheck,Sparkles,Tag}from"lucide-react";
import{useI18n}from"../../i18n/index.jsx";
import{readableTokenPiece}from"../../mission1/mission1Challenges.js";
import{tokenizeWithQwen,validateQwenTokenizerInput}from"../../mission1/qwenTokenizer.js";
import AiLabStickerGuide from"../../playfulLearning/AiLabStickerGuide.jsx";
import{createAiLabTokenContract,getDefaultNumbersContract}from"../aiLabSession.js";
import presetSet from"../tokenLabPresetFixtures.json"with{type:"json"};
import{toyEmbeddingData}from"./toyEmbeddingData.js";
import"./numbersStage.css";

const EXAMPLE_ROWS=["A","B","C"];

function TokenLabel({token,t}){
  const readable=readableTokenPiece(token.decodedPiece);
  return <span>{readable.leadingSpace&&<small aria-label={t("mission1.tokens.leadingSpace")}>␠</small>}<b>{readable.text}</b></span>;
}

function SelectedIdentity({piece,t,compact=false}){
  return <div className={`numbers-selected-identity ${compact?"compact":""}`}>
    <span><small>{t("numbersStage.identity.token")}</small><strong>{piece?<TokenLabel token={piece} t={t}/>:"—"}</strong></span>
    <ArrowRight aria-hidden="true"/>
    <span><small>{t("numbersStage.identity.realId")}</small><strong>{piece?.id??"—"}</strong></span>
  </div>;
}

export default function NumbersStagePage({
  transientContract,
  onBackToTokenize,
  onTokenSelected=()=>{},
  onAddressFollowed=()=>{},
  onTeachingOpened=()=>{},
  onNumbersRevealed=()=>{},
  onBridgeShown=()=>{}
}){
  const{t}=useI18n(),defaultContract=useMemo(getDefaultNumbersContract,[]);
  const[contract,setContract]=useState(()=>transientContract||defaultContract);
  const[usingTransient,setUsingTransient]=useState(Boolean(transientContract));
  const[selectedToken,setSelectedToken]=useState(null);
  const[lookupComplete,setLookupComplete]=useState(false);
  const[teachingOpen,setTeachingOpen]=useState(false);
  const[selectedExample,setSelectedExample]=useState(0);
  const[numbersVisible,setNumbersVisible]=useState(false);
  const[revealedCount,setRevealedCount]=useState(0);
  const[bridgeVisible,setBridgeVisible]=useState(false);
  const[lookupPulse,setLookupPulse]=useState(false);
  const[sentenceOpen,setSentenceOpen]=useState(false);
  const[sentence,setSentence]=useState(contract.input);
  const[status,setStatus]=useState("idle");
  const[error,setError]=useState("");
  const[tableOpen,setTableOpen]=useState(false);
  const[technicalOpen,setTechnicalOpen]=useState(false);
  const pulseTimer=useRef(null),revealTimers=useRef([]),realRef=useRef(null),teachingRef=useRef(null),bridgeRef=useRef(null);
  const selectedPiece=selectedToken===null?null:contract.pieces[selectedToken];
  const selectedToy=toyEmbeddingData[selectedExample]||toyEmbeddingData[0];
  const bridgeStart=Math.max(0,Math.min(selectedToken??0,Math.max(0,contract.pieces.length-4)));
  const bridgePieces=contract.pieces.slice(bridgeStart,bridgeStart+4).map((piece,offset)=>({piece,index:bridgeStart+offset}));

  function clearRevealTimers(){revealTimers.current.forEach(timer=>window.clearTimeout(timer));revealTimers.current=[];}
  useEffect(()=>()=>{window.clearTimeout(pulseTimer.current);clearRevealTimers();},[]);

  function resetJourney(nextContract=contract){
    clearRevealTimers();
    setSelectedToken(null);setLookupComplete(false);setTeachingOpen(false);setSelectedExample(0);
    setNumbersVisible(false);setRevealedCount(0);setBridgeVisible(false);setLookupPulse(false);
    setTableOpen(false);setError("");setSentence(nextContract.input);
  }
  function restart(){setContract(defaultContract);setUsingTransient(false);resetJourney(defaultContract);setSentenceOpen(false);setStatus("idle");setTechnicalOpen(false);}
  function chooseRealToken(index){
    clearRevealTimers();setSelectedToken(index);setLookupComplete(false);setTeachingOpen(false);setSelectedExample(0);
    setNumbersVisible(false);setRevealedCount(0);setBridgeVisible(false);setLookupPulse(false);onTokenSelected();
  }
  function followLabel(){
    if(!selectedPiece)return;
    setLookupComplete(true);setTeachingOpen(false);setNumbersVisible(false);setRevealedCount(0);setBridgeVisible(false);setLookupPulse(true);onAddressFollowed();
    window.clearTimeout(pulseTimer.current);pulseTimer.current=window.setTimeout(()=>setLookupPulse(false),650);
  }
  function openTeachingExample(){
    if(!lookupComplete)return;
    setTeachingOpen(true);setNumbersVisible(false);setRevealedCount(0);setBridgeVisible(false);onTeachingOpened();
    window.requestAnimationFrame(()=>teachingRef.current?.scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"nearest"}));
  }
  function chooseExample(index){clearRevealTimers();setSelectedExample(index);setNumbersVisible(false);setRevealedCount(0);setBridgeVisible(false);setLookupPulse(false);}
  function hideNumbers(){clearRevealTimers();setNumbersVisible(false);setRevealedCount(0);setBridgeVisible(false);setLookupPulse(false);}
  function revealNumbers(){
    if(!teachingOpen)return;
    clearRevealTimers();setNumbersVisible(true);setRevealedCount(0);setBridgeVisible(false);setLookupPulse(true);
    window.clearTimeout(pulseTimer.current);pulseTimer.current=window.setTimeout(()=>setLookupPulse(false),650);
    const total=selectedToy.toyVector.length,reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if(reduced){setRevealedCount(total);onNumbersRevealed();return;}
    selectedToy.toyVector.forEach((_,index)=>{
      const timer=window.setTimeout(()=>{setRevealedCount(index+1);if(index===total-1)onNumbersRevealed();},180+(index*420));
      revealTimers.current.push(timer);
    });
  }
  function replayLookup(){if(!teachingOpen)return;hideNumbers();window.requestAnimationFrame(revealNumbers);}
  function showBridge(){
    if(revealedCount!==selectedToy.toyVector.length)return;
    setBridgeVisible(true);onBridgeShown();
    window.requestAnimationFrame(()=>bridgeRef.current?.scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"nearest"}));
  }
  function backToTokens(){resetJourney(contract);window.requestAnimationFrame(()=>realRef.current?.scrollIntoView({behavior:"smooth",block:"nearest"}));}
  function choosePreset(id){const preset=presetSet.presets.find(item=>item.id===id);if(preset){setSentence(preset.text);setError("");}}
  async function generate(){
    const validation=validateQwenTokenizerInput(sentence,120);
    if(validation==="empty"){setError(t("numbersStage.errors.empty"));return;}
    if(validation){setError(t("numbersStage.errors.tooLong"));return;}
    setError("");setStatus("loading");
    try{const result=await tokenizeWithQwen(sentence),next=createAiLabTokenContract(result);setContract(next);setUsingTransient(false);resetJourney(next);setSentenceOpen(false);setStatus("idle");}
    catch{setStatus("idle");setError(t("numbersStage.errors.load"));}
  }

  return <section className="numbers-stage" aria-labelledby="numbers-stage-title">
    <header className="numbers-stage-header" data-tour-id="ai-lab-numbers-stage">
      <div className="numbers-stage-title"><div><span>{t("numbersStage.header.term")}</span><h2 id="numbers-stage-title">{t("numbersStage.header.title")}</h2><p>{t("numbersStage.header.intro")}</p></div></div>
      <AiLabStickerGuide src="/assets/img/missions-robot-target.png" className="numbers-header-robot" hiddenOnMobile/>
      <div className="numbers-header-actions"><button type="button" className="outline" onClick={onBackToTokenize}><ArrowLeft size={17}/>{t("numbersStage.actions.back")}</button><button type="button" className="outline" data-tour-id="ai-lab-numbers-restart" onClick={restart}><RotateCcw size={17}/>{t("numbersStage.actions.restart")}</button></div>
    </header>

    <div className="numbers-example-notice"><ShieldCheck size={17}/><span>{t(usingTransient?"numbersStage.notice.transient":"numbersStage.notice.default")}</span><button type="button" onClick={()=>{setSentence(contract.input);setSentenceOpen(open=>!open);}}>{t("numbersStage.actions.anotherSentence")}</button></div>
    {sentenceOpen&&<section className="numbers-sentence-control" data-tour-id="numbers-sentence-control"><div><label htmlFor="numbers-sentence">{t("numbersStage.sentence.label")}</label><span>{sentence.length} / 120</span></div><textarea id="numbers-sentence" maxLength={120} value={sentence} placeholder={t("numbersStage.sentence.placeholder")} onChange={event=>{setSentence(event.target.value);setError("");}}/><div className="numbers-preset-row" aria-label={t("numbersStage.sentence.presets")}><button type="button" onClick={()=>choosePreset("everyday")}>{t("numbersStage.sentence.everyday")}</button><button type="button" onClick={()=>choosePreset("long-word")}>{t("numbersStage.sentence.longWords")}</button><button type="button" onClick={()=>choosePreset("punctuation")}>{t("numbersStage.sentence.punctuation")}</button></div><div className="numbers-control-actions"><button type="button" className="primary" disabled={status==="loading"} onClick={generate}><Send size={16}/>{t(status==="loading"?"numbersStage.actions.loading":"numbersStage.actions.generate")}</button><button type="button" className="outline" onClick={()=>{setSentenceOpen(false);setError("");}}>{t("numbersStage.actions.cancel")}</button></div>{error&&<p className="numbers-error" role="alert">{error}</p>}</section>}

    <div className="numbers-story-map" aria-label={t("numbersStage.core.label")}><span><b>1</b>{t("numbersStage.core.pick")}</span><ArrowRight/><span><b>2</b>{t("numbersStage.core.lookup")}</span><ArrowRight/><span><b>3</b>{t("numbersStage.core.learnedRow")}</span><ArrowRight/><span><b>4</b>{t("numbersStage.core.use")}</span></div>

    <div className="numbers-workspace">
      <section ref={realRef} className="numbers-real-journey numbers-scene" data-tour-id="ai-lab-numbers-token-cards">
        <div className="numbers-scene-number" aria-hidden="true">1</div>
        <div className="numbers-region-heading"><h3>{t("numbersStage.real.title")}</h3><p>{t("numbersStage.real.instruction")}</p></div>
        <div className="numbers-token-workbench"><AiLabStickerGuide src="/assets/img/mission-robot-pointing.png" className="numbers-token-robot" hiddenOnMobile/><div><div className="numbers-sentence"><small>{t("numbersStage.real.sentence")}</small><strong>{contract.input}</strong></div><div className="numbers-token-row" data-tour-id="numbers-token-row">{contract.pieces.map((piece,index)=><button type="button" key={`${piece.index}-${piece.id}`} className={selectedToken===index?"selected":""} data-tour-id={selectedToken===index?"numbers-selected-token":undefined} aria-pressed={selectedToken===index} onClick={()=>chooseRealToken(index)}><TokenLabel token={piece} t={t}/></button>)}</div></div></div>
        <div className={`numbers-id-card ${selectedPiece?"visible":""}`} data-tour-id="ai-lab-numbers-selected-id" aria-live="polite"><div><small>{t("numbersStage.real.selected")}</small><strong>{selectedPiece?<TokenLabel token={selectedPiece} t={t}/>:t("numbersStage.real.choosePrompt")}</strong></div><ArrowRight/><div><small>{t("numbersStage.real.itsId")}</small><strong>{selectedPiece?.id??"—"}</strong></div></div>
        {selectedPiece&&<p className="numbers-id-discovery"><Tag size={18}/><span><strong>{t("numbersStage.real.labelTitle")}</strong>{t("numbersStage.real.labelMeaning")}</span></p>}
      </section>

      <section className={`numbers-address-journey numbers-scene ${selectedPiece?"ready":""} ${lookupPulse?"pulse":""}`} data-tour-id="ai-lab-numbers-lookup">
        <div className="numbers-scene-number" aria-hidden="true">2</div>
        <div className="numbers-region-heading"><h3>{t("numbersStage.lookup.title")}</h3><p>{t("numbersStage.lookup.intro")}</p></div>
        <SelectedIdentity piece={selectedPiece} t={t} compact/>
        <div className="numbers-lookup-analogy"><div><Tag/><strong>{t("numbersStage.lookup.label",{id:selectedPiece?.id??"—"})}</strong></div><ArrowRight/><div><Database/><strong>{t("numbersStage.lookup.position",{id:selectedPiece?.id??"—"})}</strong></div></div>
        <p className="numbers-picture-caption"><CircleHelp size={16}/>{t("numbersStage.lookup.picture")}</p>
        <p className="numbers-truth-note"><ShieldCheck size={17}/>{t("numbersStage.lookup.truth")}</p>
        <button type="button" className="primary numbers-follow-button" data-tour-id="ai-lab-numbers-follow-address" disabled={!selectedPiece} onClick={followLabel}><Play size={17}/>{lookupComplete?t("numbersStage.actions.replayTransition"):t("numbersStage.actions.follow")}</button>
        {lookupComplete&&<p className="numbers-discovery"><Sparkles size={18}/>{t("numbersStage.lookup.discovery",{id:selectedPiece.id})}</p>}
      </section>

      <section className={`numbers-training-scene numbers-scene ${lookupComplete?"ready":"waiting"}`} data-tour-id="ai-lab-numbers-training">
        <div className="numbers-scene-number" aria-hidden="true">3</div>
        <div className="numbers-region-heading"><h3>{t("numbersStage.training.title")}</h3><p>{t("numbersStage.training.intro")}</p></div>
        <SelectedIdentity piece={selectedPiece} t={t} compact/>
        <div className="numbers-training-flow" aria-label={t("numbersStage.training.flowLabel")}>
          <div><BookOpen/><strong>{t("numbersStage.training.examples")}</strong><small>{t("numbersStage.training.examplesCaption")}</small></div><ArrowRight/>
          <div><GraduationCap/><strong>{t("numbersStage.training.adjust")}</strong><small>{t("numbersStage.training.adjustCaption")}</small></div><ArrowRight/>
          <div><Database/><strong>{t("numbersStage.training.table")}</strong><small>{t("numbersStage.training.tableCaption")}</small></div>
        </div>
        <div className="numbers-not-calculated"><Calculator/><span><strong>{t("numbersStage.training.notCalculatedTitle",{id:selectedPiece?.id??"—"})}</strong>{t("numbersStage.training.notCalculatedBody")}</span></div>
      </section>

      <section className={`numbers-real-unavailable numbers-scene ${lookupComplete?"ready":"waiting"}`} data-tour-id="ai-lab-numbers-real-unavailable">
        <div className="numbers-scene-number" aria-hidden="true">4</div>
        <div className="numbers-region-heading"><h3>{t("numbersStage.realRow.title")}</h3><p>{t("numbersStage.realRow.intro",{id:selectedPiece?.id??"—"})}</p></div>
        <SelectedIdentity piece={selectedPiece} t={t} compact/>
        <div className="numbers-truth-break"><div className="real"><ShieldCheck/><span><b>{t("numbersStage.realRow.realLabel")}</b><strong>{t("numbersStage.realRow.realLookup",{id:selectedPiece?.id??"—"})}</strong><small>{t("numbersStage.realRow.weights")}</small></span></div><div className="curtain"><EyeOff/><strong>{t("numbersStage.realRow.notLoaded")}</strong><small>{t("numbersStage.realRow.tokenizerOnly")}</small></div><div className="teaching"><Layers3/><span><b>{t("numbersStage.realRow.teachingLabel")}</b><strong>{t("numbersStage.realRow.teachingTitle")}</strong><small>{t("numbersStage.realRow.teachingBody")}</small></span></div></div>
        <button type="button" className="primary numbers-open-teaching" data-tour-id="ai-lab-numbers-open-teaching" disabled={!lookupComplete} onClick={openTeachingExample}><DoorOpen size={17}/>{t("numbersStage.actions.openTeaching")}</button>
      </section>

      <section ref={teachingRef} className={`numbers-toy-sandbox numbers-scene ${teachingOpen?"ready":"waiting"} ${lookupPulse?"pulse":""}`} data-tour-id="ai-lab-numbers-drawer">
        <div className="numbers-scene-number" aria-hidden="true">5</div>
        <div className="numbers-region-heading"><span data-tour-id="numbers-accuracy-label">{t("numbersStage.toy.label")}</span><h3>{t("numbersStage.toy.title")}</h3><p>{t("numbersStage.toy.intro")}</p></div>
        <div className="numbers-teaching-identity"><SelectedIdentity piece={selectedPiece} t={t} compact/><span><EyeOff/>{t("numbersStage.toy.notRealRow",{id:selectedPiece?.id??"—"})}</span></div>
        <div className="numbers-drawer-scene"><AiLabStickerGuide src="/assets/img/mission-robot-reading.png" className="numbers-drawer-robot" hiddenOnMobile/><div className={`numbers-drawer ${teachingOpen?"selected":""} ${numbersVisible?"open":""}`}><div className="numbers-drawer-label"><Layers3 size={23}/><span>{t("numbersStage.toy.rowName",{row:EXAMPLE_ROWS[selectedExample]})}</span></div><div className="numbers-block-tray" data-tour-id="ai-lab-numbers-number-blocks"><small>{t("numbersStage.toy.oneRow")}</small><div className="numbers-block-row" aria-live="polite">{numbersVisible?selectedToy.toyVector.slice(0,revealedCount).map((value,index)=><span key={index}>{value}</span>):<p>{teachingOpen?t("numbersStage.toy.closed"):t("numbersStage.toy.waiting")}</p>}</div></div></div></div>
        {numbersVisible&&revealedCount>0&&<p className={`numbers-discovery step-${revealedCount}`}><Sparkles size={18}/>{t(revealedCount<2?"numbersStage.toy.revealSteps.first":revealedCount<3?"numbersStage.toy.revealSteps.second":"numbersStage.toy.revealSteps.complete")}</p>}
        {teachingOpen&&<><div className="numbers-example-selectors" aria-label={t("numbersStage.toy.chooseExample")}>{EXAMPLE_ROWS.map((row,index)=><button type="button" key={row} className={selectedExample===index?"selected":""} aria-pressed={selectedExample===index} onClick={()=>chooseExample(index)}>{t("numbersStage.toy.rowName",{row})}</button>)}</div><div className="numbers-toy-actions"><button type="button" className="primary" data-tour-id="ai-lab-numbers-reveal-row" onClick={numbersVisible?hideNumbers:revealNumbers}>{numbersVisible?<EyeOff size={16}/>:<Eye size={16}/>} {t(numbersVisible?"numbersStage.actions.hideNumbers":"numbersStage.actions.reveal")}</button><button type="button" className="outline" onClick={replayLookup}><RotateCcw size={16}/>{t("numbersStage.actions.replayLookup")}</button><button type="button" className="outline" onClick={backToTokens}><ArrowLeft size={16}/>{t("numbersStage.actions.chooseAnotherToken")}</button></div><button type="button" className="numbers-table-toggle" aria-expanded={tableOpen} onClick={()=>setTableOpen(open=>!open)}>{tableOpen?<ChevronUp size={17}/>:<ChevronDown size={17}/>} {t("numbersStage.actions.fullTable")}</button>{tableOpen&&<div className="numbers-toy-table" data-tour-id="numbers-toy-table" role="table" aria-label={t("numbersStage.toy.tableLabel")}><div role="row" className="head"><span role="columnheader">{t("numbersStage.toy.exampleRow")}</span><span>d1</span><span>d2</span><span>d3</span></div>{toyEmbeddingData.map((item,index)=><button type="button" role="row" key={EXAMPLE_ROWS[index]} className={selectedExample===index?"selected":""} data-tour-id={selectedExample===index?"numbers-selected-row":undefined} onClick={()=>chooseExample(index)}><span>{t("numbersStage.toy.rowName",{row:EXAMPLE_ROWS[index]})}</span>{item.toyVector.map((value,valueIndex)=><span key={valueIndex}>{value}</span>)}</button>)}</div>}</>}
        {revealedCount===selectedToy.toyVector.length&&<div className="numbers-whole-row" data-tour-id="ai-lab-numbers-whole-row"><Layers3/><div><strong>{t("numbersStage.toy.wholeRowTitle")}</strong><p>{t("numbersStage.toy.wholeRowBody")}</p><small>{t("numbersStage.toy.noSingleMeaning")}</small></div></div>}
      </section>

      <section ref={bridgeRef} className={`numbers-next-use numbers-scene ${revealedCount===selectedToy.toyVector.length?"ready":"waiting"}`} data-tour-id="ai-lab-numbers-next-use">
        <div className="numbers-scene-number" aria-hidden="true">6</div>
        <div className="numbers-region-heading"><h3>{t("numbersStage.nextUse.title")}</h3><p>{t("numbersStage.nextUse.intro")}</p></div>
        <div className="numbers-id-row-compare"><div><Tag/><strong>{t("numbersStage.nextUse.idOnly")}</strong><b>{selectedPiece?.id??"—"}</b><p>{t("numbersStage.nextUse.idJob")}</p><small>{t("numbersStage.nextUse.idLimit")}</small></div><div><Layers3/><strong>{t("numbersStage.nextUse.numberRow")}</strong><b>[−0.1, 0.6, 0.3, …]</b><p>{t("numbersStage.nextUse.rowJob")}</p><small>{t("numbersStage.nextUse.rowTruth")}</small></div></div>
        <button type="button" className="primary numbers-show-bridge" data-tour-id="ai-lab-numbers-show-bridge" disabled={revealedCount!==selectedToy.toyVector.length} onClick={showBridge}><BrainCircuit size={17}/>{t("numbersStage.actions.seeNext")}</button>
        {bridgeVisible&&<div className="numbers-context-bridge" aria-live="polite"><div className="numbers-context-inputs">{bridgePieces.map(({piece,index})=><div key={`${piece.id}-${index}`} className={index===selectedToken?"selected":""}><TokenLabel token={piece} t={t}/><span>[ · · · ]</span></div>)}</div><ArrowRight/><div className="numbers-calculation"><BrainCircuit/><strong>{t("numbersStage.nextUse.calculations")}</strong><small>{t("numbersStage.nextUse.contextChanges")}</small></div><ArrowRight/><div className="numbers-next-choices"><strong>{t("numbersStage.nextUse.choices")}</strong><span>{t("numbersStage.nextUse.choice1")}</span><span>{t("numbersStage.nextUse.choice2")}</span><span>{t("numbersStage.nextUse.choice3")}</span><small>{t("numbersStage.nextUse.conceptOnly")}</small></div></div>}
        {bridgeVisible&&<p className="numbers-discovery"><Sparkles size={18}/>{t("numbersStage.nextUse.discovery")}</p>}
      </section>
    </div>

    {bridgeVisible&&<section className="numbers-achievement" data-tour-id="ai-lab-numbers-summary"><div><Sparkles size={20}/><h3>{t("numbersStage.summary.title")}</h3></div><ol><li><span><Tag/></span>{t("numbersStage.summary.id")}</li><li><span><Database/></span>{t("numbersStage.summary.row")}</li><li><span><GraduationCap/></span>{t("numbersStage.summary.training")}</li><li><span><BrainCircuit/></span>{t("numbersStage.summary.context")}</li></ol><p><ArrowRight/>{t("numbersStage.summary.next")}</p></section>}

    <button type="button" className="numbers-learn-toggle" aria-expanded={technicalOpen} onClick={()=>setTechnicalOpen(open=>!open)}>{technicalOpen?<ChevronUp size={17}/>:<CircleHelp size={17}/>} {t("numbersStage.technical.title")}</button>
    {technicalOpen&&<section className="numbers-technical-panel"><p>{t("numbersStage.technical.intro")}</p><dl><div><dt>{t("numbersStage.technical.tokenId.term")}</dt><dd>{t("numbersStage.technical.tokenId.definition")}</dd></div><div><dt>{t("numbersStage.technical.vector.term")}</dt><dd>{t("numbersStage.technical.vector.definition")}</dd></div><div><dt>{t("numbersStage.technical.matrix.term")}</dt><dd>{t("numbersStage.technical.matrix.definition")}</dd></div><div><dt>{t("numbersStage.technical.weights.term")}</dt><dd>{t("numbersStage.technical.weights.definition")}</dd></div><div><dt>{t("numbersStage.technical.training.term")}</dt><dd>{t("numbersStage.technical.training.definition")}</dd></div><div><dt>{t("numbersStage.technical.dimensions.term")}</dt><dd>{t("numbersStage.technical.dimensions.definition")}</dd></div></dl><p>{t("numbersStage.technical.truth")}</p><footer><span>{contract.tokenizer.checkpoint}</span><span>{contract.tokenizer.revision}</span></footer></section>}
  </section>;
}
