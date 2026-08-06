import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  Flashlight,
  MoveRight,
  MousePointerClick,
  Plus,
  ScanLine,
} from "lucide-react";

const STORY_TOKENS = ["The", "small", "robot", "found", "a", "silver", "key", "under", "the", "bridge", "."];
const WINDOW_SIZE = 5;

function LessonQuestion({ number, label, children }) {
  return <header className="m2-reading-question">
    <span aria-hidden="true">{number}</span>
    <div><small>{label}</small><h2>{children}</h2></div>
  </header>;
}

function Takeaway({ children }) {
  return <div className="m2-reading-takeaway" role="status">
    <span><Check size={19} strokeWidth={2.2} /></span>
    <p>{children}</p>
  </div>;
}

function TokenRow({ tokens, start = 0, size = WINDOW_SIZE, labelled = false }) {
  return <div className="m2-reading-token-row" aria-label="A row of text tokens">
    {tokens.map((token, index) => {
      const visible = index >= start && index < start + size;
      return <span className={visible ? "is-visible" : "is-outside"} key={`${token}-${index}`}>
        {labelled && <small>{visible ? "inside" : "outside"}</small>}
        <b>{token}</b>
      </span>;
    })}
  </div>;
}

function ContextFrame({ start = 0, size = WINDOW_SIZE }) {
  return <div className="m2-reading-window-frame" style={{ "--window-start": start, "--window-size": size }} aria-hidden="true">
    <span><ScanLine size={18} />Context window</span>
  </div>;
}

function ContextTrack({ active, children, start = 0, size = WINDOW_SIZE }) {
  const trackRef = useRef(null);

  useEffect(() => {
    if (!active || !trackRef.current) return undefined;
    const track = trackRef.current;
    const frame = track.querySelector(".m2-reading-window-frame");
    if (!frame) return undefined;

    const frameLeft = frame.offsetLeft;
    const centredLeft = frameLeft - Math.max(0, (track.clientWidth - frame.offsetWidth) / 2);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const animationFrame = window.requestAnimationFrame(() => {
      track.scrollTo({ left: Math.max(0, centredLeft), behavior: reducedMotion ? "auto" : "smooth" });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [active, start, size]);

  return <div className="m2-window-track" ref={trackRef}>{children}</div>;
}

function ReadingBridge({ children }) {
  return <div className="m2-reading-bridge"><MoveRight size={22} /><p>{children}</p></div>;
}

export function Mission2OpeningPage({ active, t, onComplete }) {
  const [position, setPosition] = useState(0);
  const max = STORY_TOKENS.length - WINDOW_SIZE;

  function move(amount) {
    setPosition((current) => Math.max(0, Math.min(max, current + amount)));
    onComplete?.();
  }

  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page" data-lesson-page="1">
    <LessonQuestion number="1" label={t("mission2.page1.eyebrow")}>{t("mission2.page1.question")}</LessonQuestion>
    <p className="m2-reading-intro">{t("mission2.page1.intro")}</p>
    <div className="m2-flashlight-scene">
      <div className="m2-book-strip" aria-hidden="true"><BookOpen /><span>{t("mission2.page1.bookLabel")}</span></div>
      <ArrowRight className="m2-scene-arrow" />
      <div className="m2-flashlight-stage">
        <Flashlight className="m2-flashlight" aria-hidden="true" />
        <ContextTrack active={active} start={position}>
          <TokenRow tokens={STORY_TOKENS} start={position} />
          <ContextFrame start={position} />
        </ContextTrack>
      </div>
    </div>
    <div className="m2-reading-explanation">
      <img src="/assets/img/mission-robot-reading.png" alt="A robot reading a small lit part of a long story." />
      <p>{t("mission2.page1.analogy")}</p>
    </div>
    <div className="m2-window-controls" role="group" aria-label={t("mission2.page1.controlsLabel") }>
      <button type="button" onClick={() => move(-1)} disabled={position === 0}><ChevronLeft />{t("mission2.actions.moveLeft")}</button>
      <span>{t("mission2.page1.position", { current: position + 1, total: max + 1 })}</span>
      <button type="button" onClick={() => move(1)} disabled={position === max}>{t("mission2.actions.moveRight")}<ChevronRight /></button>
    </div>
    <Takeaway>{t("mission2.page1.takeaway")}</Takeaway>
    <ReadingBridge>{t("mission2.page1.bridge")}</ReadingBridge>
  </section>;
}

export function Mission2WindowPage({ active, t, onComplete }) {
  const [revealed, setRevealed] = useState(false);

  function reveal() {
    setRevealed(true);
    onComplete?.();
  }

  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page" data-lesson-page="2">
    <LessonQuestion number="2" label={t("mission2.page2.eyebrow")}>{t("mission2.page2.question")}</LessonQuestion>
    <p className="m2-reading-intro">{t("mission2.page2.intro")}</p>
    <div className={`m2-window-definition ${revealed ? "is-revealed" : ""}`}>
      <ContextTrack active={active} start={2} size={4}>
        <TokenRow tokens={STORY_TOKENS.slice(0, 8)} start={2} size={4} labelled={revealed} />
        <ContextFrame start={2} size={4} />
      </ContextTrack>
      <div className="m2-window-legend">
        <span><Eye size={18} />{t("mission2.page2.inside")}</span>
        <span><EyeOff size={18} />{t("mission2.page2.outside")}</span>
      </div>
      <button type="button" className="primary m2-reveal-window" onClick={reveal} disabled={revealed}>
        <ScanLine />{revealed ? t("mission2.actions.revealed") : t("mission2.actions.showBoundary")}
      </button>
    </div>
    <div className="m2-simple-definition"><strong>{t("mission2.page2.term")}</strong><p>{t("mission2.page2.definition")}</p></div>
    {revealed && <Takeaway>{t("mission2.page2.takeaway")}</Takeaway>}
    <ReadingBridge>{t("mission2.page2.bridge")}</ReadingBridge>
  </section>;
}

export function Mission2GrowingTextPage({ active, t, onComplete }) {
  const [count, setCount] = useState(WINDOW_SIZE);
  const shown = STORY_TOKENS.slice(0, count);
  const start = Math.max(0, shown.length - WINDOW_SIZE);
  const finished = count === STORY_TOKENS.length;

  function addToken() {
    if (finished) return;
    setCount((current) => current + 1);
    onComplete?.();
  }

  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page" data-lesson-page="3">
    <LessonQuestion number="3" label={t("mission2.page3.eyebrow")}>{t("mission2.page3.question")}</LessonQuestion>
    <p className="m2-reading-intro">{t("mission2.page3.intro")}</p>
    <div className="m2-growing-window-scene">
      <div className="m2-growing-status"><span>{t("mission2.page3.textSoFar")}</span><strong>{count} {t("mission2.labels.tokens")}</strong></div>
      <ContextTrack active={active} start={start}>
        <TokenRow tokens={shown} start={start} />
        <ContextFrame start={start} />
      </ContextTrack>
      <button type="button" className="primary" onClick={addToken} disabled={finished}><Plus />{finished ? t("mission2.actions.storyComplete") : t("mission2.actions.addToken")}</button>
      <p className="m2-live-observation" aria-live="polite">{count === WINDOW_SIZE ? t("mission2.page3.waiting") : finished ? t("mission2.page3.finished") : t("mission2.page3.moved")}</p>
    </div>
    <div className="m2-whiteboard-analogy"><img src="/assets/img/mission-robot-pointing.png" alt="A robot points to a whiteboard with limited space." /><div><strong>{t("mission2.page3.analogyTitle")}</strong><p>{t("mission2.page3.analogy")}</p></div></div>
    {count > WINDOW_SIZE && <Takeaway>{t("mission2.page3.takeaway")}</Takeaway>}
    <ReadingBridge>{t("mission2.page3.bridge")}</ReadingBridge>
  </section>;
}

export function Mission2OutsidePage({ active, t, onComplete }) {
  const [choice, setChoice] = useState("");
  const options = useMemo(() => [
    { id: "inside", label: t("mission2.page4.optionInside"), correct: true },
    { id: "outside", label: t("mission2.page4.optionOutside"), correct: false }
  ], [t]);

  function choose(option) {
    setChoice(option.id);
    if (option.correct) onComplete?.();
  }

  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page" data-lesson-page="4">
    <LessonQuestion number="4" label={t("mission2.page4.eyebrow")}>{t("mission2.page4.question")}</LessonQuestion>
    <p className="m2-reading-intro">{t("mission2.page4.intro")}</p>
    <div className="m2-quiz-banner">
      <span aria-hidden="true"><CircleHelp size={30} strokeWidth={2.4} /></span>
      <div><small>{t("mission2.page4.quizLabel")}</small><strong>{t("mission2.page4.quizInstruction")}</strong></div>
    </div>
    <div className="m2-clue-window-scene">
      <div className="m2-clue-sentence">
        <span className="is-outside"><small>{t("mission2.labels.outsideWindow")}</small>The picnic was beside the river.</span>
        <span className="is-visible"><small>{t("mission2.labels.insideWindow")}</small>They sat on the bank.</span>
      </div>
      <div className="m2-question-card"><CircleHelp className="m2-question-mark" aria-hidden="true" /><small>{t("mission2.page4.questionLabel")}</small><strong>{t("mission2.page4.ask")}</strong><span>bank = ?</span></div>
      <div className={`m2-answer-prompt ${choice ? "is-answered" : ""}`}><MousePointerClick size={20} /><strong>{t(choice ? "mission2.page4.answerChecked" : "mission2.page4.chooseAnswer")}</strong></div>
      <div className="m2-clue-options" role="group" aria-label={t("mission2.page4.ask")}>{options.map((option, index) => <button type="button" className={choice === option.id ? (option.correct ? "is-correct" : "is-wrong") : ""} onClick={() => choose(option)} key={option.id}><span className="m2-choice-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option.label}</span>{choice === option.id && (option.correct ? <Check /> : <span aria-hidden="true">×</span>)}</button>)}</div>
      {choice && <p className="m2-choice-feedback" aria-live="polite">{choice === "inside" ? t("mission2.page4.correct") : t("mission2.page4.tryAgain")}</p>}
    </div>
    {choice === "inside" && <Takeaway>{t("mission2.page4.takeaway")}</Takeaway>}
    <ReadingBridge>{t("mission2.page4.bridge")}</ReadingBridge>
  </section>;
}

export function Mission2SizePage({ active, t, onComplete }) {
  const [size, setSize] = useState(3);
  const maxSize = 7;

  function changeSize(event) {
    setSize(Number(event.target.value));
    onComplete?.();
  }

  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page" data-lesson-page="5">
    <LessonQuestion number="5" label={t("mission2.page5.eyebrow")}>{t("mission2.page5.question")}</LessonQuestion>
    <p className="m2-reading-intro">{t("mission2.page5.intro")}</p>
    <div className="m2-size-lab">
      <label htmlFor="context-size"><span>{t("mission2.page5.slider")}</span><strong>{size} {t("mission2.labels.tokens")}</strong></label>
      <input id="context-size" type="range" min="3" max={maxSize} value={size} aria-valuetext={t("mission2.page5.valueText", { visible: size, outside: STORY_TOKENS.length - size })} onChange={changeSize} />
      <ContextTrack active={active} start={Math.max(0, STORY_TOKENS.length - size)} size={size}>
        <TokenRow tokens={STORY_TOKENS} start={Math.max(0, STORY_TOKENS.length - size)} size={size} />
        <ContextFrame start={Math.max(0, STORY_TOKENS.length - size)} size={size} />
      </ContextTrack>
      <div className="m2-size-comparison"><span><Eye size={18} /><strong>{size}</strong>{t("mission2.page5.visible")}</span><span><EyeOff size={18} /><strong>{STORY_TOKENS.length - size}</strong>{t("mission2.page5.outside")}</span></div>
    </div>
    <div className="m2-reading-explanation"><img src="/assets/img/mission-robot-reading.png" alt="A robot compares a small and a large reading window." /><p>{t("mission2.page5.explanation")}</p></div>
    <Takeaway>{t("mission2.page5.takeaway")}</Takeaway>
    <ReadingBridge>{t("mission2.page5.bridge")}</ReadingBridge>
  </section>;
}

export function Mission2SummaryPage({ active, t, complete, onComplete }) {
  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page" data-lesson-page="6">
    <LessonQuestion number="6" label={t("mission2.page6.eyebrow")}>{t("mission2.page6.question")}</LessonQuestion>
    <p className="m2-reading-intro">{t("mission2.page6.intro")}</p>
    <div className="m2-context-journey">
      <article><span>1</span><BookOpen /><strong>{t("mission2.page6.step1")}</strong><small>{t("mission2.page6.step1Note")}</small></article><ArrowRight />
      <article><span>2</span><ScanLine /><strong>{t("mission2.page6.step2")}</strong><small>{t("mission2.page6.step2Note")}</small></article><ArrowRight />
      <article><span>3</span><Eye /><strong>{t("mission2.page6.step3")}</strong><small>{t("mission2.page6.step3Note")}</small></article>
    </div>
    <div className="m2-discovery-list"><h3>{t("mission2.page6.discovered")}</h3><p><Check />{t("mission2.page6.point1")}</p><p><Check />{t("mission2.page6.point2")}</p><p><Check />{t("mission2.page6.point3")}</p></div>
    <div className="m2-next-lesson"><img src="/assets/img/mission-robot-pointing.png" alt="A robot shines a light on helpful words." /><div><small>{t("mission2.page6.nextLabel")}</small><strong>{t("mission2.page6.nextTitle")}</strong><p>{t("mission2.page6.next")}</p></div></div>
    <button type="button" className="primary m2-complete-lesson" disabled={!complete} onClick={onComplete}>{complete ? t("mission2.actions.complete") : t("mission2.actions.incomplete")}</button>
  </section>;
}
