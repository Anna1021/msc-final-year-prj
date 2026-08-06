import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  Eye,
  GitBranch,
  Lightbulb,
  Link2,
  LockKeyhole,
  ScanSearch,
  Sparkles
} from "lucide-react";

function Question({ number, eyebrow, children }) {
  return <header className="l3-question"><span aria-hidden="true">{number}</span><div><small>{eyebrow}</small><h2>{children}</h2></div></header>;
}

function Takeaway({ children }) {
  return <div className="l3-takeaway" role="status"><span><Check size={19}/></span><p>{children}</p></div>;
}

function Bridge({ children }) {
  return <div className="l3-bridge"><span><ChevronRight size={19}/></span><p>{children}</p></div>;
}

function TokenStrip({ tokens, selected = [], useful = [], quiet = [], onPick, ariaLabel }) {
  return <div className="l3-token-strip" role={onPick ? "group" : undefined} aria-label={ariaLabel}>
    {tokens.map((token, index) => {
      const id = `${token.toLowerCase()}-${index}`;
      const chosen = selected.includes(id);
      const highlighted = useful.includes(id);
      const subdued = quiet.includes(id);
      return onPick ? <button type="button" aria-pressed={chosen} className={`${chosen ? "is-selected" : ""} ${highlighted ? "is-helpful" : ""} ${subdued ? "is-quieter" : ""}`} onClick={() => onPick(id)} key={id}><span>{token}</span>{chosen && <CircleDot aria-hidden="true"/>}</button> : <span className={`${highlighted ? "is-helpful" : ""} ${subdued ? "is-quieter" : ""}`} key={id}>{token}</span>;
    })}
  </div>;
}

const DOG_TOKENS = ["The", "tired", "dog", "slept", "beside", "the", "warm", "fire", "."];
const DOG_ANSWER = ["dog-2", "slept-3"];

export function Lesson3Page1({ active, t }) {
  const [selected, setSelected] = useState([]);
  const correct = DOG_ANSWER.every((id) => selected.includes(id)) && selected.length === DOG_ANSWER.length;
  function pick(id) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  return <section hidden={!active} className="lesson-3-page l3-page-one">
    <Question number="1" eyebrow={t("mission3.page1.eyebrow")}>{t("mission3.page1.question")}</Question>
    <p className="l3-intro">{t("mission3.page1.intro")}</p>
    <div className="l3-reading-light-scene">
      <div className="l3-window-label"><Eye size={18}/>{t("mission3.labels.contextWindow")}</div>
      <TokenStrip tokens={DOG_TOKENS} selected={selected} useful={correct ? DOG_ANSWER : []} quiet={correct ? ["the-0","tired-1","beside-4","the-5","warm-6","fire-7",".-8"] : []} onPick={pick} ariaLabel={t("mission3.page1.action")}/>
      <div className="l3-spotlight-beams" aria-hidden="true"><i/><i/></div>
      <div className="l3-target-question"><small>{t("mission3.page1.task")}</small><strong>{t("mission3.page1.target")}</strong><span>{correct ? t("mission3.page1.answer") : "?"}</span></div>
      <img src="/assets/img/mission3-robot-hallucination.png" alt="" aria-hidden="true"/>
      <p className="l3-analogy"><ScanSearch/>{t("mission3.page1.analogy")}</p>
    </div>
    <div className="l3-action-hint">{t("mission3.page1.action")}</div>
    {selected.length > 0 && !correct && <p className="l3-feedback" aria-live="polite">{t("mission3.page1.tryAgain")}</p>}
    {correct && <Takeaway>{t("mission3.page1.takeaway")}</Takeaway>}
    <Bridge>{t("mission3.page1.bridge")}</Bridge>
  </section>;
}

export function Lesson3Page2({ active, t, onComplete }) {
  const [task, setTask] = useState("sleeping");
  const [explored, setExplored] = useState(() => new Set(["sleeping"]));
  const taskData = task === "sleeping"
    ? { useful:DOG_ANSWER, target:t("mission3.page2.taskA"), answer:t("mission3.page2.answerA") }
    : { useful:["warm-6","fire-7"], target:t("mission3.page2.taskB"), answer:t("mission3.page2.answerB") };

  function choose(next) {
    setTask(next);
    setExplored((current) => {
      const updated = new Set(current).add(next);
      if (updated.size === 2) onComplete?.();
      return updated;
    });
  }

  return <section hidden={!active} className="lesson-3-page l3-page-two">
    <Question number="2" eyebrow={t("mission3.page2.eyebrow")}>{t("mission3.page2.question")}</Question>
    <p className="l3-intro">{t("mission3.page2.intro")}</p>
    <div className="l3-task-switch" role="tablist" aria-label={t("mission3.page2.switchLabel")}>
      <button type="button" role="tab" aria-selected={task === "sleeping"} onClick={() => choose("sleeping")}><span>A</span>{t("mission3.page2.taskA")}</button>
      <button type="button" role="tab" aria-selected={task === "warm"} onClick={() => choose("warm")}><span>B</span>{t("mission3.page2.taskB")}</button>
    </div>
    <div className={`l3-redirect-scene is-${task}`}>
      <img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true"/>
      <div className="l3-redirect-spotlight"><small>{taskData.target}</small><TokenStrip tokens={DOG_TOKENS} useful={taskData.useful} quiet={DOG_TOKENS.map((token,index)=>`${token.toLowerCase()}-${index}`).filter((id)=>!taskData.useful.includes(id))}/><strong><ArrowRight/>{taskData.answer}</strong></div>
    </div>
    <div className="l3-before-after"><span className={task === "sleeping" ? "is-active" : ""}>dog + slept</span><ArrowRight/><span className={task === "warm" ? "is-active" : ""}>warm + fire</span></div>
    <Takeaway>{t("mission3.page2.takeaway")}</Takeaway>
    <details className="l3-technical-note"><summary>{t("mission3.labels.modelNote")}</summary><p>{t("mission3.page2.modelNote")}</p></details>
    <Bridge>{t("mission3.page2.bridge")}</Bridge>
  </section>;
}

const COMBINED_CLUES = [
  { id:"coat", label:"coat" }, { id:"street", label:"street" }, { id:"cold", label:"cold" }
];

export function Lesson3Page3({ active, t, onComplete }) {
  const [revealed, setRevealed] = useState(0);
  const finished = revealed === COMBINED_CLUES.length;
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  function revealNext() {
    setRevealed((current) => {
      const next = Math.min(COMBINED_CLUES.length, current + 1);
      if (next === COMBINED_CLUES.length) onComplete?.();
      return next;
    });
  }

  function revealAll() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(COMBINED_CLUES.length); onComplete?.(); return;
    }
    COMBINED_CLUES.forEach((_, index) => timers.current.push(window.setTimeout(() => {
      setRevealed(index + 1);
      if (index === COMBINED_CLUES.length - 1) onComplete?.();
    }, index * 330)));
  }

  return <section hidden={!active} className="lesson-3-page l3-page-three">
    <Question number="3" eyebrow={t("mission3.page3.eyebrow")}>{t("mission3.page3.question")}</Question>
    <p className="l3-intro">{t("mission3.page3.intro")}</p>
    <div className="l3-detective-board">
      <p className="l3-board-sentence">Maya put on her <b>coat</b> because the <b>street</b> was <b>cold</b>.</p>
      <div className="l3-clue-pins">{COMBINED_CLUES.map((clue,index)=><button type="button" disabled={index > revealed} className={index < revealed ? "is-connected" : ""} onClick={revealNext} key={clue.id}><span>{index < revealed ? <Check/> : index + 1}</span><strong>{clue.label}</strong></button>)}</div>
      <div className="l3-thread-layer" aria-hidden="true">{COMBINED_CLUES.map((clue,index)=><i className={index < revealed ? "is-connected" : ""} key={clue.id}/>)}</div>
      <div className="l3-board-target"><small>{t("mission3.page3.targetLabel")}</small><strong>{t("mission3.page3.target")}</strong>{finished && <span>{t("mission3.page3.result")}</span>}</div>
      <img src="/assets/img/mission3-robot-hallucination.png" alt="" aria-hidden="true"/>
      <button type="button" className="primary l3-reveal-links" onClick={revealAll} disabled={finished}><Link2/>{finished ? t("mission3.actions.allConnected") : t("mission3.actions.revealLinks")}</button>
    </div>
    {finished && <Takeaway>{t("mission3.page3.takeaway")}</Takeaway>}
    <details className="l3-technical-note"><summary>{t("mission3.labels.technicalWord")}</summary><p>{t("mission3.page3.technicalNote")}</p></details>
    <Bridge>{t("mission3.page3.bridge")}</Bridge>
  </section>;
}

function OrderTrack({ tokens, answer, selected, onPick, label, t }) {
  return <article className="l3-order-track"><small>{label}</small><div className="l3-position-slots">{tokens.map((token,index)=><span key={`${token}-${index}`}><i>{index+1}</i><b>{token}</b></span>)}</div><div className="l3-action-arrow"><span className="actor">{tokens[1]}</span><ArrowRight/><span>{t("mission3.page4.chases")}</span><ArrowRight/><span>{tokens[3]}</span></div><div className="l3-who-choices" role="group" aria-label={t("mission3.page4.chooseActor")}>{["dog","cat"].map((choice)=><button type="button" aria-pressed={selected === choice} className={selected === choice ? (choice === answer ? "is-correct" : "is-gentle-wrong") : ""} onClick={() => onPick(choice)} key={choice}>{choice}</button>)}</div></article>;
}

export function Lesson3Page4({ active, t }) {
  const [answers, setAnswers] = useState({ a:"", b:"" });
  const complete = answers.a === "dog" && answers.b === "cat";
  return <section hidden={!active} className="lesson-3-page l3-page-four">
    <Question number="4" eyebrow={t("mission3.page4.eyebrow")}>{t("mission3.page4.question")}</Question>
    <p className="l3-intro">{t("mission3.page4.intro")}</p>
    <div className="l3-order-comparison">
      <OrderTrack label={t("mission3.page4.sentenceA")} tokens={["The","dog","chased","cat"]} answer="dog" selected={answers.a} onPick={(choice)=>setAnswers((current)=>({...current,a:choice}))} t={t}/>
      <div className="l3-swap-marker"><img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true"/><span>{t("mission3.page4.sameWords")}</span></div>
      <OrderTrack label={t("mission3.page4.sentenceB")} tokens={["The","cat","chased","dog"]} answer="cat" selected={answers.b} onPick={(choice)=>setAnswers((current)=>({...current,b:choice}))} t={t}/>
    </div>
    {(answers.a || answers.b) && !complete && <p className="l3-feedback" aria-live="polite">{t("mission3.page4.tryAgain")}</p>}
    {complete && <Takeaway>{t("mission3.page4.takeaway")}</Takeaway>}
    <Bridge>{t("mission3.page4.bridge")}</Bridge>
  </section>;
}

const CLUE_EXAMPLES = [
  { id:"nest", sentence:["The","bird","built","a","nest","high","in","the","tree","."], promptKey:"exampleA", expected:["high-5","tree-8"], explanationKey:"explanationA" },
  { id:"rain", sentence:["Leo","packed","an","umbrella","because","dark clouds","covered","the","sky","."], promptKey:"exampleB", expected:["umbrella-3","dark clouds-5"], explanationKey:"explanationB" }
];

export function Lesson3Page5({ active, t, onComplete }) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const example = CLUE_EXAMPLES[exampleIndex];
  const correct = checked && example.expected.every((id)=>selected.includes(id)) && selected.length === example.expected.length;
  function pick(id) { setChecked(false); setSelected((current)=>current.includes(id)?current.filter((item)=>item!==id):[...current,id]); }
  function check() { setChecked(true); if(example.expected.every((id)=>selected.includes(id))&&selected.length===example.expected.length) onComplete?.(); }
  function nextExample() { setExampleIndex((current)=>(current+1)%CLUE_EXAMPLES.length); setSelected([]); setChecked(false); }
  return <section hidden={!active} className="lesson-3-page l3-page-five">
    <Question number="5" eyebrow={t("mission3.page5.eyebrow")}>{t("mission3.page5.question")}</Question>
    <p className="l3-intro">{t("mission3.page5.intro")}</p>
    <div className="l3-clue-workbench">
      <div className="l3-example-tabs"><span>{t("mission3.page5.example",{current:exampleIndex+1,total:CLUE_EXAMPLES.length})}</span><button type="button" onClick={nextExample}>{t("mission3.actions.anotherExample")}<ChevronRight/></button></div>
      <div className="l3-task-card"><Lightbulb/><strong>{t(`mission3.page5.${example.promptKey}`)}</strong></div>
      <TokenStrip tokens={example.sentence} selected={selected} useful={correct ? example.expected : []} onPick={pick} ariaLabel={t("mission3.page5.selectLabel")}/>
      <div className="l3-selected-path"><small>{t("mission3.page5.yourClues")}</small><div>{selected.length ? selected.map((id)=><span key={id}><CircleDot/>{id.replace(/-\d+$/,"")}</span>) : <em>{t("mission3.page5.noneSelected")}</em>}</div><ArrowRight/><strong>{t("mission3.page5.target")}</strong></div>
      <button type="button" className="primary l3-check-clues" onClick={check} disabled={!selected.length}><Check/>{t("mission3.actions.checkClues")}</button>
      {checked && <div className={`l3-check-result ${correct ? "is-correct" : "is-retry"}`} aria-live="polite"><strong>{correct ? t("mission3.page5.goodTitle") : t("mission3.page5.retryTitle")}</strong><p>{correct ? t(`mission3.page5.${example.explanationKey}`) : t("mission3.page5.retry")}</p></div>}
      <img src="/assets/img/mission3-robot-hallucination.png" alt="" aria-hidden="true"/>
    </div>
    <p className="l3-boundary-note">{t("mission3.page5.boundary")}</p>
    {correct && <Takeaway>{t("mission3.page5.takeaway")}</Takeaway>}
    <Bridge>{t("mission3.page5.bridge")}</Bridge>
  </section>;
}

export function Lesson3Page6({ active, t, complete, onComplete }) {
  const steps = [
    [Eye,"window","context"], [ScanSearch,"clues","helpful"], [GitBranch,"combine","relationships"], [Sparkles,"updated","representation"], [LockKeyhole,"next","prediction"]
  ];
  return <section hidden={!active} className="lesson-3-page l3-page-six">
    <Question number="6" eyebrow={t("mission3.page6.eyebrow")}>{t("mission3.page6.question")}</Question>
    <p className="l3-intro">{t("mission3.page6.intro")}</p>
    <div className="l3-discovery-route">{steps.map(([Icon,key,className],index)=><React.Fragment key={key}><article className={`is-${className}`}><span>{index+1}</span><Icon/><strong>{t(`mission3.page6.${key}`)}</strong><small>{t(`mission3.page6.${key}Note`)}</small></article>{index<steps.length-1&&<ArrowRight/>}</React.Fragment>)}</div>
    <div className="l3-summary-points"><h3>{t("mission3.page6.discovered")}</h3>{[1,2,3,4,5].map((number)=><p key={number}><Check/>{t(`mission3.page6.point${number}`)}</p>)}</div>
    <div className="l3-accuracy-map"><img src="/assets/img/mission-robot-reading.png" alt="" aria-hidden="true"/><p><strong>{t("mission3.page6.accuracyTitle")}</strong>{t("mission3.page6.accuracy")}</p></div>
    <div className="l3-next-gate"><span><LockKeyhole/></span><div><small>{t("mission3.page6.nextLabel")}</small><strong>{t("mission3.page6.nextTitle")}</strong><p>{t("mission3.page6.next")}</p></div></div>
    <button type="button" className="primary l3-complete" disabled={!complete} onClick={onComplete}>{complete ? t("mission3.actions.complete") : t("mission3.actions.incomplete")}</button>
  </section>;
}
