import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Crown, Gauge, House, Layers3, Palette, PartyPopper, Play, RefreshCcw, Route, Search, Shuffle, Sparkles, Telescope, Undo2, UserRound, WalletCards } from "lucide-react";
import { composeContextResponse, contextScenarios } from "../tokenLab/context/contextLabData.js";
import { greedyTeachingExamples, predictionContinuationSets, predictionExamples, transformProbabilities, weightedChoice } from "../tokenLab/prediction/predictionData.js";
import { PageTransitionBridge, PlayfulDiscoveryPanel, PlayfulWorkbench } from "../pagedMissions/PlayfulMissionKit.jsx";

function Discovery({ children }) {
  return <PlayfulDiscoveryPanel>{children}</PlayfulDiscoveryPanel>;
}

function Bridge({ children }) {
  return <PageTransitionBridge label="Carry the clue forward">{children}</PageTransitionBridge>;
}

function GenerationBridge({ kind, label, children }) {
  return <aside className={`m2-generation-bridge is-${kind}`}><div className="m2-bridge-preview" aria-hidden="true"><span/><ArrowRight/><b/><ArrowRight/><i/></div><div><small>Next step</small><strong>{label}</strong><p>{children}</p></div></aside>;
}

function M2Scene({ kind, instruction, children }) {
  const scenes = { prompt:[Layers3,"Prompt-building workbench"], candidates:[Route,"Candidate race"], trials:[Shuffle,"Repeated-trial board"], temperature:[Gauge,"Chance-shaping control"], repeat:[Route,"Token story strip"], summary:[Search,"Mission discovery map"] };
  const [SceneIcon,label]=scenes[kind]||scenes.prompt;
  const robots={prompt:"/assets/img/mission5-robot-training.png",candidates:"/assets/img/missions-robot-target.png",trials:"/assets/img/mission5-robot-training.png",temperature:"/assets/img/mission-robot-pointing.png",repeat:"/assets/img/mission5-robot-training.png",summary:"/assets/img/mission-robot-reading.png"};
  return <PlayfulWorkbench variant="blue" label={label} instruction={instruction} robotSrc={robots[kind]} robotAlt="Guide robot demonstrating this activity" icon={SceneIcon} className={`m2-scene-shell m2-scene-shell--${kind}`}>{children}</PlayfulWorkbench>;
}

function CandidateBoard({ items, onPick, selected, mode="compact" }) {
  return <div className={`m2-candidate-board is-${mode}`} aria-label="Reviewed teaching candidates">{items.map((item,index) => <button key={item.token} type="button" disabled={!onPick} aria-pressed={selected === item.token} aria-label={`${item.token}, ${item.probability} percent teaching probability`} onClick={() => onPick?.(item.token)} className={`${selected === item.token ? "selected" : ""} candidate-${index+1}`} style={{"--chance":`${item.probability}%`}}><span className="m2-candidate-token"><strong>{item.token}</strong><small>{item.probability}%</small></span><span className="m2-candidate-lane" role="img" aria-label={`${item.probability} percent`}><i /></span></button>)}</div>;
}

export function Mission2PromptPage({ active, t, onComplete }) {
  const scenario = contextScenarios[0];
  const [selected, setSelected] = useState([]);
  const response = composeContextResponse(t, scenario, selected);
  function toggle(id) {
    setSelected((value) => value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
    onComplete?.();
  }
  const detailIcons={age:UserRound,guests:PartyPopper,indoors:House,budget:WalletCards,anime:Sparkles,blue:Palette,saturn:Telescope};
  return <section hidden={!active} className="mission-2-paged__lesson m2-workbench" data-visual-scene="request-workbench"><M2Scene kind="prompt" instruction="Choose details and watch them join the request."><div className="m2-request-workbench"><div className="m2-prompt-compare"><article><small>Vague request</small><strong>Help me plan a party.</strong></article><ArrowRight /><article className="is-built"><small>Clearer request</small><strong>Help me plan a party{selected.length ? ` with ${selected.join(", ")}` : "…"}</strong><div className="m2-selected-details">{selected.map((id)=><span key={id}>{id}</span>)}</div></article></div><div className="m2-detail-tray" role="group" aria-label="Details to add">{scenario.details.map((item) => {const Icon=detailIcons[item.id]||Sparkles;return <button type="button" aria-pressed={selected.includes(item.id)} key={item.id} onClick={() => toggle(item.id)} className={selected.includes(item.id) ? `selected kind-${item.category}` : ""}><Icon/><strong>{item.id}</strong>{selected.includes(item.id) && <small>{item.category === "useful" ? "useful detail" : item.category === "extra" ? "changes style" : "less useful"}</small>}</button>})}</div><div className="m2-live-response" aria-live="polite"><small>Reviewed local response</small><p>{response}</p></div></div>{selected.length > 1 && <Discovery>Useful context makes the request more specific. More detail is not automatically better.</Discovery>}</M2Scene><Bridge>Next, use the text so far to compare possible next tokens.</Bridge></section>;
}

export function Mission2CandidatesPage({ active, onSelection }) {
  const [context, setContext] = useState(0);
  const example = predictionExamples[0].contexts[context];
  const distribution = example.candidates.map(([token, probability]) => ({ token, probability }));
  const [selected, setSelected] = useState("");
  return <section hidden={!active} className="mission-2-paged__lesson" data-visual-scene="candidate-race"><M2Scene kind="candidates" instruction="Change the text so far and watch the token race rearrange."><div className="m2-context-tabs" role="tablist" aria-label="Choose the text so far">{predictionExamples[0].contexts.map((item, index) => <button type="button" role="tab" aria-selected={context === index} key={item.id} className={context === index ? "selected" : ""} onClick={() => { setContext(index); setSelected(""); }}>{item.prompt}</button>)}</div><div className="m2-race-stage"><div className="m2-story-start"><small>Current text</small><strong>{example.prompt}</strong></div><CandidateBoard mode="race" items={distribution} selected={selected} onPick={(token) => { setSelected(token); onSelection?.(); }} /><span className="m2-teaching-badge">Reviewed teaching probabilities — not Qwen output</span></div>{selected && <Discovery>Several tokens could come next. This teaching example gives them different chances.</Discovery>}</M2Scene><GenerationBridge kind="selection" label="Candidate → selection gate → token slot">You have seen the candidates. Next, watch one become the next token.</GenerationBridge></section>;
}

export function Mission2TrialsPage({ active, language="en", onSelection }) {
  const timers=useRef([]);
  const example=greedyTeachingExamples[language]||greedyTeachingExamples.en;
  const base=example.candidates.map(([token,probability])=>({token,probability}));
  const highest=base.reduce((best,item)=>item.probability>best.probability?item:best,base[0]);
  const [phase,setPhase]=useState("ready");
  const [history,setHistory]=useState([]);
  function clearTimers(){timers.current.forEach((timer)=>window.clearTimeout(timer));timers.current=[];}
  function predict(){clearTimers();setPhase("candidates");onSelection?.();const finish=()=>setPhase("selected");if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches){finish();return}timers.current.push(window.setTimeout(finish,650));}
  function runSampling(){const reviewedPoints=[.05,.18,.34,.49,.58,.73,.86,.96];setHistory(reviewedPoints.map((point)=>weightedChoice(base,()=>point)));}
  useEffect(()=>()=>clearTimers(),[]);
  const selected=phase==="selected"?highest.token:"";
  return <section hidden={!active} className="mission-2-paged__lesson" data-visual-scene="greedy-token-machine"><M2Scene kind="trials" instruction="Start with one reviewed prompt and watch the highest-chance token click into place."><div className={`m2-greedy-machine phase-${phase}`}><div className="m2-greedy-prompt"><small>Reviewed teaching prompt</small><div><span>{example.prompt}</span>{selected?<b>{selected}</b>:<em>next token</em>}</div></div><button type="button" className="m2-predict-control" onClick={predict} disabled={phase==="candidates"}><span><Play/></span><strong>{phase==="candidates"?"Comparing candidates…":"Predict next token"}</strong><small>Highest-chance mode</small></button>{phase!=="ready"&&<div className="m2-greedy-candidates"><CandidateBoard items={base} selected={selected}/>{phase==="selected"&&<span className="m2-highest-marker"><Crown/>Highest chance</span>}</div>}<div className="m2-greedy-path" aria-live="polite">{phase==="ready"?<span>Press Predict next token to reveal all four candidates.</span>:phase==="candidates"?<span>Several tokens are possible. Their reviewed chances are being compared.</span>:<span><strong>{highest.token.trim()}</strong> had the highest teaching probability, so this simple mode added it to the text.</span>}</div></div>{phase==="selected"&&<><Discovery>In highest-chance mode, the candidate with the largest probability is selected. Technical word: greedy decoding.</Discovery><p className="m2-greedy-note">Real language models do not always have to choose the highest-probability token. Next, you will spread the chances out.</p><details className="m2-sampling-extra"><summary>Optional: try the same prompt several times</summary><p>Sampling mode can choose different candidates according to their chances. It is separate from highest-chance mode.</p><button type="button" className="outline" onClick={runSampling}>Run 8 reviewed sampling choices</button><div className="m2-run-history" aria-live="polite">{history.map((token,index)=><span key={`${token}-${index}`}>{token}</span>)}</div></details></>} </M2Scene><GenerationBridge kind="spread" label="Strongest chance → spread-out chances">This mode chose the strongest candidate. What changes when the chances spread out?</GenerationBridge></section>;
}

export function Mission2TemperaturePage({ active, language="en" }) {
  const [temperature, setTemperature] = useState(50);
  const example=greedyTeachingExamples[language]||greedyTeachingExamples.en;
  const distribution = transformProbabilities(example.candidates, temperature);
  return <section hidden={!active} className="mission-2-paged__lesson" data-visual-scene="temperature-spread"><M2Scene kind="temperature" instruction="Move the control and watch the same candidates gather or spread."><div className="m2-spread-stage"><div className="m2-temperature"><strong>More predictable</strong><input aria-label="Predictable or varied" aria-valuetext={`${temperature}: ${temperature < 40 ? "more concentrated" : temperature > 60 ? "more spread out" : "balanced"}`} type="range" min="0" max="100" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /><strong>More varied</strong><small>Technical word: temperature</small></div><div className="m2-temperature-prompt"><small>Same reviewed prompt</small><strong>{example.prompt}</strong></div><div className={`m2-chance-cluster ${temperature < 40 ? "is-tight" : temperature > 60 ? "is-wide" : ""}`} aria-hidden="true">{distribution.map((item,index)=><i key={item.token} className={`piece-${index+1}`}><span>{item.token}</span></i>)}</div><CandidateBoard items={distribution}/></div><Discovery>Lower temperature makes the strongest candidates more dominant. Higher temperature spreads the chances more widely.</Discovery><p className="m2-temperature-note">This changes a distribution. It does not make the model more intelligent or creative like a person.</p></M2Scene><GenerationBridge kind="repeat" label="Prompt + selected token → updated prompt → new candidates">Whichever token is selected joins the text. Then prediction starts again.</GenerationBridge></section>;
}

export function Mission2RepeatPage({ active, onCycle }) {
  const starts = ["A student opened the", "After school we"];
  const [start, setStart] = useState(0);
  const [tokens, setTokens] = useState([]);
  const round = Math.min(tokens.length, predictionContinuationSets.length - 1);
  const distribution = predictionContinuationSets[round].map(([token, probability]) => ({ token, probability }));
  function add(token) { setTokens((value) => [...value, token]); onCycle?.(); }
  function restart() { setTokens([]); }
  return <section hidden={!active} className="mission-2-paged__lesson" data-visual-scene="token-story-strip"><M2Scene kind="repeat" instruction="Choose a reviewed starter, add one token, then predict from the updated text."><div className="m2-starter-switch" role="group" aria-label="Choose a reviewed story starter">{starts.map((text,index)=><button type="button" aria-pressed={start===index} className={start===index?"is-selected":""} key={text} onClick={()=>{setStart(index);restart()}}>{text}</button>)}</div><div className="m2-story-progress" aria-label={`Generated ${Math.min(tokens.length,5)} of 5`}>{Array.from({length:5},(_,index)=><i key={index} className={index<tokens.length?"is-filled":""}/>) }<strong>Generated {Math.min(tokens.length,5)} of 5</strong></div><div className="m2-growing-strip" aria-live="polite"><span>{starts[start]}</span>{tokens.map((token, index) => <b key={`${token}-${index}`}>{token}</b>)}<em>next token</em></div><div className="m2-waiting-candidates"><small>Reviewed teaching candidates for the updated text</small><CandidateBoard items={distribution} onPick={add}/></div><div className="m2-repeat-actions"><button className="primary" onClick={() => add(weightedChoice(distribution))}>Let the teaching model choose</button><button className="outline" disabled={!tokens.length} onClick={() => setTokens((value) => value.slice(0, -1))}><Undo2/>Undo</button><button className="outline" onClick={restart}><RefreshCcw/>Restart</button><button className="outline" onClick={() => { setStart((value) => (value + 1) % starts.length); restart(); }}>Try another prompt</button></div><span className="m2-teaching-badge">Controlled reviewed candidate tree — not Qwen generation</span>{tokens.length > 0 && <Discovery>Each selected token becomes part of the context. Then the teaching model predicts again.</Discovery>}</M2Scene><Bridge>The final page reconnects every step: clues, chances, selection and repetition.</Bridge></section>;
}

export function Mission2SummaryPage({ active, complete, onComplete }) {
  const chain = [[Search,"Earlier clues","river"],[Layers3,"Likely meaning","river bank"],[Route,"Possible tokens","toast · bread"],[Gauge,"Different chances","55% · 25%"],[Check,"Select one","toast"],[RefreshCcw,"Add and repeat","next?"]];
  return <section hidden={!active} className="mission-2-paged__lesson" data-visual-scene="mission-journey-map"><M2Scene kind="summary" instruction="Follow the stepping path from earlier clues to repeated generation."><div className="m2-journey-map">{chain.map(([Icon,label,example],index)=><React.Fragment key={label}><article><span><Icon/></span><strong>{label}</strong><small>{example}</small></article>{index<chain.length-1&&<ArrowRight/>}</React.Fragment>)}</div><div className="m2-summary-cards"><article><Search/><strong>Context provides clues.</strong><span>Earlier words make some meanings fit better.</span></article><article><Gauge/><strong>Tokens get different chances.</strong><span>A higher chance is not a guarantee.</span></article><article><RefreshCcw/><strong>Generation repeats.</strong><span>One selected token joins the text each time.</span></article></div><div className="m2-summary-robot-note"><img src="/assets/img/mission-robot-reading.png" alt="A robot presents an accuracy reminder."/><p><strong>Accuracy reminder</strong>The model uses learned patterns. It does not inspect a dictionary or think like a person.</p></div><p className="m2-next-mission">Fluent prediction can sound convincing. Next, investigate why fluent text is not proof that a claim is true.</p><button className="primary" disabled={!complete} onClick={onComplete}>{complete ? "Complete Mission 2" : "Complete the key activities first"}</button></M2Scene></section>;
}
