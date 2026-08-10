import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  Lightbulb,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Waves,
} from "lucide-react";
import useContextPlaygroundPredictions, {
  clampContextWindow,
  getAvailableContext,
  moveContextWindow,
  resizeContextWindow,
} from "./useContextPlaygroundPredictions.js";

const PLAYGROUND_WINDOW_SIZES = [5, 7, 10, 12];
const PLAYGROUND_DEFAULT_START = 7;
const PLAYGROUND_DEFAULT_SIZE = 7;

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

export function Mission2OpeningPage({ active, t, onComplete }) {
  const [choices, setChoices] = useState({ finance: null, river: null });

  function choose(context, option) {
    setChoices((current) => ({ ...current, [context]: option }));
    onComplete?.();
  }

  const examples = [
    { id: "finance", answer: "money", icon: Building2, sentenceKey: "sentenceA", prefixKey: "promptA", meaningKey: "meaningA", options: ["money", "river", "cat", "more"] },
    { id: "river", answer: "river", icon: Waves, sentenceKey: "sentenceB", prefixKey: "promptB", meaningKey: "meaningB", options: ["river", "money", "book", "more"] }
  ];

  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page m2-context-intro-page" data-lesson-page="1">
    <div className="m2-context-hero">
      <div>
        <LessonQuestion number="1" label={t("mission2.page1.eyebrow")}>{t("mission2.page1.question")}</LessonQuestion>
        <p className="m2-reading-intro">{t("mission2.page1.intro")}</p>
      </div>
      <div className="m2-context-hero-art" aria-hidden="true">
        <span className="is-gold" /><span className="is-blue" /><span className="is-green" /><span className="is-pink" />
        <img src="/assets/img/mission-robot-reading.png" alt="" />
        <b>?</b>
      </div>
    </div>

    <div className="m2-context-meaning-board">
      <div className="m2-context-principle">
        <span><Lightbulb aria-hidden="true" />{t("mission2.page1.sameWord")}</span>
        <p>{t("mission2.page1.definition")}</p>
      </div>
      <div className="m2-context-cases">
        {examples.map(({ id, icon: Icon, sentenceKey, meaningKey }) => <article className={`m2-context-case is-${id}`} key={id}>
          <strong><Icon aria-hidden="true" />{t(`mission2.page1.context${id === "finance" ? "A" : "B"}`)}</strong>
          <p className="m2-context-sentence">{t(`mission2.page1.${sentenceKey}Before`)} <mark>{t("mission2.page1.bank")}</mark> {t(`mission2.page1.${sentenceKey}After`)}</p>
          <ArrowRight aria-hidden="true" />
          <p className="m2-context-meaning">{t("mission2.page1.hereBank")} <span><Icon aria-hidden="true" />{t(`mission2.page1.${meaningKey}`)}</span></p>
        </article>)}
      </div>
      <div className="m2-context-takeaway"><Info aria-hidden="true" /><p><strong>{t("mission2.page1.takeawayLead")}</strong> {t("mission2.page1.takeaway")}</p></div>
    </div>

    <div className="m2-context-prompt-board">
      <div className="m2-context-prompt-intro"><span><Lightbulb aria-hidden="true" /></span><div><strong>{t("mission2.page1.thinkTitle")}</strong><p>{t("mission2.page1.thinkIntro")}</p></div></div>
      <div className="m2-context-mini-prompts">
        {examples.map(({ id, answer, prefixKey, options }) => {
          const choice = choices[id];
          const isCorrect = choice === answer;
          return <div className={`m2-context-mini-row is-${id} ${choice ? (isCorrect ? "has-correct-answer" : "has-wrong-answer") : ""}`} key={id}>
          <span>{t(`mission2.page1.context${id === "finance" ? "A" : "B"}`)}</span>
          <p>{t(`mission2.page1.${prefixKey}`)} <b aria-hidden="true">________</b></p>
          <ArrowRight aria-hidden="true" />
          <div className="m2-context-options" role="group" aria-label={t(`mission2.page1.${prefixKey}`)}>
            {options.map((option) => <button type="button" key={option} aria-pressed={choice === option} className={choice === option ? (isCorrect ? "is-correct" : "is-wrong") : ""} onClick={() => choose(id, option)}>{t(`mission2.page1.option${option[0].toUpperCase()}${option.slice(1)}`)}{choice === option && <span aria-hidden="true">{isCorrect ? "✓" : "×"}</span>}</button>)}
          </div>
          {choice && <p className="m2-context-choice-feedback" role="status">{t(`mission2.page1.${isCorrect ? "correctFeedback" : "wrongFeedback"}`)}</p>}
        </div>;})}
      </div>
    </div>
  </section>;
}

export function Mission2WindowPage({ active, t, onComplete }) {
  const [technicalOpen, setTechnicalOpen] = useState(true);
  const windowTokens = ["a", "curious", "little", "reader", "who", "loved", "to", "learn"];
  const outsideBefore = ["Once", "upon", "a", "time", "there"];
  const outsideAfter = ["new", "things", "every", "day"];

  function toggleKeyword(event) {
    setTechnicalOpen(event.currentTarget.open);
    onComplete?.();
  }

  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page m2-window-page" data-lesson-page="2">
    <div className="m2-window-page-heading">
      <div>
        <LessonQuestion number="2" label={t("mission2.page2.eyebrow")}>{t("mission2.page2.question")}</LessonQuestion>
        <p className="m2-reading-intro">{t("mission2.page2.introLead")}<br />{t("mission2.page2.intro")} <strong>{t("mission2.page2.term")}</strong>.</p>
      </div>
    </div>

    <div className="m2-context-composition">
      <div className="m2-context-teaching-surface">
        <svg className="m2-context-surface-shape" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
          <path d="M28 1 H720 V222 Q720 258 756 258 H972 Q999 258 999 286 V492 Q999 519 972 519 H28 Q1 519 1 492 V28 Q1 1 28 1 Z" />
        </svg>

        <div className="m2-context-main-intro"><h3>{t("mission2.page2.visualTitle")}</h3><p>{t("mission2.page2.visualIntro")}</p></div>

        <div className="m2-context-sequence-grid" aria-label={t("mission2.page2.sequenceLabel")}>
          <div className="m2-context-sequence-zone is-outside">
            <div className="m2-context-token-line"><i aria-hidden="true">…</i>{outsideBefore.map((token, index) => <span key={`${token}-${index}`}>{token}</span>)}</div>
            <small>{t("mission2.page2.outside")}</small>
          </div>
          <div className="m2-context-sequence-zone is-window">
            <div className="m2-context-window-frame"><strong>{t("mission2.page2.windowLabel")}</strong><div>{windowTokens.map((token, index) => <span className={`tone-${index}`} key={token}>{token}</span>)}</div></div>
            <small>{t("mission2.page2.inside")}</small>
          </div>
          <div className="m2-context-sequence-zone is-outside">
            <div className="m2-context-token-line">{outsideAfter.map((token) => <span key={token}>{token}</span>)}<i aria-hidden="true">…</i></div>
            <small>{t("mission2.page2.outside")}</small>
          </div>
        </div>

        <div className="m2-context-info-strip">
          <div className="m2-context-info-copy"><span><Lightbulb aria-hidden="true" /></span><p>{t("mission2.page2.takeaway")}</p></div>
          <div className="m2-context-mini-sequence" aria-hidden="true"><i>…</i><div className="is-outside">{Array.from({ length: 5 }, (_, index) => <span key={index} />)}</div><div className="is-window">{Array.from({ length: 7 }, (_, index) => <span className={`tone-${index}`} key={index} />)}</div><div className="is-outside">{Array.from({ length: 5 }, (_, index) => <span key={index} />)}</div><i>…</i></div>
        </div>
      </div>

      <div className="m2-context-keyword-slot">
        <details className="m2-context-keyword-card" open={technicalOpen} onToggle={toggleKeyword}>
          <summary aria-expanded={technicalOpen} aria-controls="mission2-context-window-definition"><span><ScanLine aria-hidden="true" />{t("mission2.page2.technicalWord")}</span><strong>{t("mission2.page2.term")}</strong><ChevronDown aria-hidden="true" /></summary>
          <div id="mission2-context-window-definition"><p>{t("mission2.page2.definition")}</p><p>{t("mission2.page2.differentSizes")}</p></div>
        </details>
      </div>
    </div>

    <div className="m2-window-size-overview">
      <div><h3>{t("mission2.page2.sizesTitle")}</h3><p>{t("mission2.page2.sizesIntro")}</p></div>
      {["small", "medium", "large"].map((size, sizeIndex) => <article key={size}>
        <strong>{t(`mission2.page2.${size}Window`)}</strong><small>{t(`mission2.page2.${size}Amount`)}</small>
        <div aria-hidden="true">{Array.from({ length: 11 }, (_, index) => <span className={index < [3, 7, 10][sizeIndex] ? "is-filled" : ""} key={index} />)}</div>
      </article>)}
    </div>
  </section>;
}

export function Mission2GrowingTextPage({ active, t, onComplete }) {
  useEffect(() => {
    if (active) onComplete?.();
  }, [active]);

  const contexts = [
    { id: "a", lead: "leadA", sentence: "sentenceA", candidates: [["hole", 58], ["house", 21], ["room", 9]] },
    { id: "b", lead: "leadB", sentence: "sentenceB", candidates: [["kitchen", 46], ["pantry", 24], ["fridge", 12]] }
  ];

  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page m2-context-matters-page" data-lesson-page="3">
    <div className="m2-context-matters-heading">
      <div><LessonQuestion number="3" label={t("mission2.page3.eyebrow")}>{t("mission2.page3.question")}</LessonQuestion><p className="m2-reading-intro">{t("mission2.page3.intro")}</p></div>
      <div className="m2-context-matters-art" aria-hidden="true"><span /><span /><span /><span /><img src="/assets/img/mission-robot-pointing.png" alt="" /><b>?</b></div>
    </div>

    <div className="m2-context-comparison-board">
      <div className="m2-context-comparison-intro"><Lightbulb aria-hidden="true" /><strong>{t("mission2.page3.compareTitle")}</strong><p>{t("mission2.page3.compareIntro")}</p><small>{t("mission2.page3.illustrative")}</small></div>
      <div className="m2-context-distribution-grid">
        {contexts.map((context) => <article className={`m2-context-distribution-card is-${context.id}`} key={context.id}>
          <span className="m2-context-label">{t(`mission2.page3.context${context.id.toUpperCase()}`)}</span>
          <p>{t(`mission2.page3.${context.lead}`)}</p><strong className="m2-context-shared-ending">{t(`mission2.page3.${context.sentence}`)}</strong>
          <ArrowRight aria-hidden="true" />
          <h3>{t("mission2.page3.predictions")}</h3>
          <div className="m2-prediction-bars">{context.candidates.map(([token, probability]) => <div key={token}><b>{token}</b><span aria-hidden="true"><i style={{ width: `${probability}%` }} /></span><strong>{probability}%</strong></div>)}</div>
          <p className="m2-context-likely"><Check aria-hidden="true" />{t(`mission2.page3.${context.id === "a" ? "likelyA" : "likelyB"}`)}</p>
        </article>)}
        <aside className="m2-context-explanation-sidebar">
          <section><h3><Info aria-hidden="true" />{t("mission2.page3.happeningTitle")}</h3><p>{t("mission2.page3.sameEnding")}</p><p>{t("mission2.page3.differentChances")}</p></section>
          <section className="m2-context-key-idea"><span>{t("mission2.page3.keyIdea")}</span><p>{t("mission2.page3.keyIdeaText")}</p><div aria-hidden="true"><i /><i /><i /><ArrowRight /><b>?</b></div></section>
        </aside>
      </div>
      <div className="m2-context-matters-summary"><Lightbulb aria-hidden="true" /><div><strong>{t("mission2.page3.summary")}</strong><p>{t("mission2.page3.summaryNote")}</p></div><img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true" /></div>
    </div>
  </section>;
}

export function Mission2OutsidePage({ active, t, onComplete }) {
  const [sizesOpen, setSizesOpen] = useState(false);
  const allTokens = t("mission2.page4.sequenceTokens").split(" ");
  const insideStart = 5;
  const insideEnd = 14;

  useEffect(() => {
    if (active) onComplete?.();
  }, [active]);

  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page m2-too-long-page" data-lesson-page="4">
    <div className="m2-too-long-heading">
      <div><LessonQuestion number="4" label={t("mission2.page4.eyebrow")}>{t("mission2.page4.question")}</LessonQuestion><p className="m2-reading-intro">{t("mission2.page4.introLead")}<br />{t("mission2.page4.intro")}</p></div>
      <div className="m2-too-long-art" aria-hidden="true"><span /><span /><span /><span /><img src="/assets/img/mission-robot-pointing.png" alt="" /><b>!</b></div>
    </div>

    <div className="m2-too-long-mini-card">
      <div><span><Info aria-hidden="true" /></span><p>{t("mission2.page4.topInfo")}</p></div>
      <div className="m2-limit-mini-visual" aria-hidden="true"><i>…</i>{Array.from({ length: 18 }, (_, index) => <span className={index >= 5 && index <= 12 ? `is-inside tone-${index - 5}` : ""} key={index} />)}<i>…</i><strong>{t("mission2.page4.windowLabel")}</strong></div>
    </div>

    <div className="m2-too-long-teaching-card">
      <header><h3>{t("mission2.page4.visualTitle")}</h3><p>{t("mission2.page4.visualIntro")}</p></header>
      <div className="m2-long-sequence" aria-label={t("mission2.page4.sequenceLabel")}><i aria-hidden="true">…</i>{allTokens.map((token, index) => <span className={index >= insideStart && index < insideEnd ? `is-inside tone-${index - insideStart}` : "is-outside"} key={`${token}-${index}`}>{token}</span>)}<i aria-hidden="true">…</i><strong style={{ "--inside-start": insideStart, "--inside-count": insideEnd - insideStart }}>{t("mission2.page4.insideFrame")}</strong></div>
      <div className="m2-long-sequence-labels"><span>{t("mission2.page4.outsideLabel")}<small>{t("mission2.page4.outsideNote")}</small></span><strong>{t("mission2.page4.insideLabel")}<small>{t("mission2.page4.insideNote")}</small></strong><span>{t("mission2.page4.outsideLabel")}<small>{t("mission2.page4.outsideNote")}</small></span></div>

      <div className="m2-context-limit-flow">
        {["sequence", "window", "model", "probabilities"].map((step, index) => <React.Fragment key={step}>
          <article className={`is-${step}`}><h4>{t(`mission2.page4.${step}Title`)}</h4><p>{t(`mission2.page4.${step}Note`)}</p>
            {step === "sequence" && <div className="m2-flow-token-strip" aria-hidden="true">{Array.from({ length: 10 }, (_, tokenIndex) => <i key={tokenIndex} />)}</div>}
            {step === "window" && <div className="m2-flow-token-strip is-colour" aria-hidden="true">{Array.from({ length: 8 }, (_, tokenIndex) => <i key={tokenIndex} />)}</div>}
            {step === "model" && <div className="m2-abstract-model" aria-hidden="true"><i /><i /><i /><i /><b>LLM</b></div>}
            {step === "probabilities" && <div className="m2-flow-probabilities" aria-hidden="true">{[84,58,42,29,18].map((height, barIndex) => <i style={{ height: `${height}%` }} key={barIndex} />)}</div>}
          </article>{index < 3 && <ArrowRight className="m2-flow-arrow" aria-hidden="true" />}
        </React.Fragment>)}
      </div>
    </div>

    <details className="m2-context-size-strip" open={sizesOpen} onToggle={(event) => setSizesOpen(event.currentTarget.open)}>
      <summary><span><Info aria-hidden="true" /></span><div><strong>{t("mission2.page4.sizesTitle")}</strong><p>{t("mission2.page4.sizesNote")}</p></div><b>{t("mission2.page4.sizesAction")}<ChevronDown aria-hidden="true" /></b></summary>
      <p>{t("mission2.page4.sizesExpanded")}</p>
    </details>
  </section>;
}

export function Mission2SizePage({ active, t, onComplete }) {
  const sequenceText = t("mission2.page5.sequenceTokens");
  const allTokens = useMemo(() => sequenceText.split(" "), [sequenceText]);
  const [windowStart, setWindowStart] = useState(PLAYGROUND_DEFAULT_START);
  const [windowSize, setWindowSize] = useState(PLAYGROUND_DEFAULT_SIZE);
  const dragRef = useRef(null);
  const safeStart = clampContextWindow(windowStart, windowSize, allTokens.length);
  const availableTokens = useMemo(() => getAvailableContext(allTokens, safeStart, windowSize), [allTokens, safeStart, windowSize]);
  const predictions = useContextPlaygroundPredictions(availableTokens, active);

  function moveWindow(direction) {
    setWindowStart((current) => moveContextWindow(current, windowSize, allTokens.length, direction));
    onComplete?.();
  }
  function resizeWindow(nextSize) {
    const nextWindow = resizeContextWindow(safeStart, nextSize, allTokens.length);
    setWindowSize(nextWindow.size);
    setWindowStart(nextWindow.start);
    onComplete?.();
  }
  function resetWindow() {
    setWindowSize(PLAYGROUND_DEFAULT_SIZE);
    setWindowStart(clampContextWindow(PLAYGROUND_DEFAULT_START, PLAYGROUND_DEFAULT_SIZE, allTokens.length));
    onComplete?.();
  }
  function startDrag(event) {
    dragRef.current = { pointerX: event.clientX, windowStart: safeStart };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function continueDrag(event) {
    if (!dragRef.current) return;
    const tokenDelta = Math.round((event.clientX - dragRef.current.pointerX) / 56);
    setWindowStart(clampContextWindow(dragRef.current.windowStart + tokenDelta, windowSize, allTokens.length));
  }
  function endDrag() {
    if (dragRef.current) onComplete?.();
    dragRef.current = null;
  }
  const leadingTokens = allTokens.slice(0, safeStart);
  const trailingTokens = allTokens.slice(safeStart + windowSize);
  const maximumProbability = predictions.candidates[0]?.probability || 1;

  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page m2-context-playground" data-lesson-page="5">
    <div className="m2-playground-heading">
      <div><LessonQuestion number="5" label={t("mission2.page5.eyebrow")}>{t("mission2.page5.question")}</LessonQuestion><p className="m2-reading-intro">{t("mission2.page5.introLead")}<br />{t("mission2.page5.intro")}</p></div>
      <div className="m2-playground-guide" aria-hidden="true"><span /><span /><span /><img src="/assets/img/mission-robot-pointing.png" alt="" /><p>{t("mission2.page5.guide")}</p></div>
    </div>

    <div className="m2-playground-surface">
      <section className="m2-playground-sequence" aria-labelledby="m2-playground-step1">
        <header><span>1</span><div><h3 id="m2-playground-step1">{t("mission2.page5.step1Title")}</h3><p>{t("mission2.page5.step1Note")}</p></div></header>
        <div className="m2-playground-token-track" aria-label={t("mission2.page5.sequenceLabel")}>
          <i aria-hidden="true">…</i>
          {leadingTokens.length > 0 && <div className="m2-playground-track-zone is-outside"><div>{leadingTokens.map((token, index) => <span key={`before-${token}-${index}`}>{token}</span>)}</div><p>{t("mission2.page5.outsideLabel")}<small>{t("mission2.page5.outsideNote")}</small></p></div>}
          <div className="m2-playground-track-zone is-window-zone">
            <div className="m2-playground-window" onPointerDown={startDrag} onPointerMove={continueDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
              <strong>{t("mission2.page5.windowLabel")}</strong><div>{availableTokens.map((token, index) => <span className={`tone-${index % 8}`} key={`inside-${token}-${index}`}>{token}</span>)}</div>
            </div>
            <p>{t("mission2.page5.insideLabel")}<small>{t("mission2.page5.insideNote")}</small></p>
          </div>
          {trailingTokens.length > 0 && <div className="m2-playground-track-zone is-outside"><div>{trailingTokens.map((token, index) => <span key={`after-${token}-${index}`}>{token}</span>)}</div><p>{t("mission2.page5.outsideLabel")}<small>{t("mission2.page5.outsideNote")}</small></p></div>}
          <i aria-hidden="true">…</i>
        </div>
      </section>

      <section className="m2-playground-controls" aria-labelledby="m2-playground-step2">
        <header><span>2</span><div><h3 id="m2-playground-step2">{t("mission2.page5.step2Title")}</h3><p>{t("mission2.page5.step2Note")}</p></div></header>
        <div className="m2-playground-move-buttons"><button type="button" disabled={safeStart === 0} onClick={() => moveWindow(-1)}><ChevronLeft />{t("mission2.page5.moveLeft")}</button><button type="button" disabled={safeStart >= allTokens.length - windowSize} onClick={() => moveWindow(1)}>{t("mission2.page5.moveRight")}<ChevronRight /></button><button type="button" onClick={resetWindow}><RotateCcw />{t("mission2.page5.reset")}</button></div>
        <fieldset><legend>{t("mission2.page5.windowSize")}</legend>{PLAYGROUND_WINDOW_SIZES.map((size) => <button type="button" aria-pressed={windowSize === size} className={windowSize === size ? "is-active" : ""} onClick={() => resizeWindow(size)} key={size}>{size}</button>)}</fieldset>
      </section>

      <section className="m2-playground-results" aria-labelledby="m2-playground-step3">
        <header><span>3</span><h3 id="m2-playground-step3">{t("mission2.page5.step3Title")}</h3></header>
        <article className="m2-playground-available"><h4>{t("mission2.page5.availableTitle")}</h4><p>{t("mission2.page5.availableNote")}</p><div aria-live="polite">{availableTokens.map((token, index) => <span className={`tone-${index % 8}`} key={`${token}-${index}`}>{token}</span>)}</div></article>
        <article className="m2-playground-predictions"><div><h4>{t("mission2.page5.predictionsTitle")}</h4><p>{t("mission2.page5.predictionsNote")}</p><small>{t("mission2.page5.realModelLabel")}</small></div>
          {predictions.status === "loading" && <p className="m2-playground-loading" role="status"><LoaderCircle />{t("mission2.page5.loading")}</p>}
          {predictions.status === "error" && <div className="m2-playground-error" role="alert"><AlertCircle /><span>{t("mission2.page5.error")}</span><button type="button" onClick={predictions.retry}><RefreshCw />{t("mission2.page5.retry")}</button></div>}
          {predictions.status === "ready" && <ol aria-live="polite">{predictions.candidates.map((candidate, index) => <li key={candidate.token_id}><b title={candidate.raw_token}>{candidate.display_token}</b><span><i style={{ width: `${(candidate.probability / maximumProbability) * 100}%` }} /></span><strong>{(candidate.probability * 100).toFixed(1)}%</strong></li>)}</ol>}
          <div className="m2-playground-orb" aria-hidden="true"><i /><i /><i /></div>
        </article>
      </section>
    </div>

    <div className="m2-playground-summary"><Info /><p><strong>{t("mission2.page5.summaryLead")}</strong>{t("mission2.page5.summary")}</p></div>
  </section>;
}

export function Mission2SummaryPage({ active, t, complete, onContinue }) {
  return <section hidden={!active} className="mission-2-paged__lesson m2-reading-page" data-lesson-page="7">
    <LessonQuestion number="7" label={t("mission2.page7.eyebrow")}>{t("mission2.page7.question")}</LessonQuestion>
    <p className="m2-reading-intro">{t("mission2.page7.intro")}</p>
    <div className="m2-context-journey">
      <article><span>1</span><BookOpen /><strong>{t("mission2.page7.step1")}</strong><small>{t("mission2.page7.step1Note")}</small></article><ArrowRight />
      <article><span>2</span><ScanLine /><strong>{t("mission2.page7.step2")}</strong><small>{t("mission2.page7.step2Note")}</small></article><ArrowRight />
      <article><span>3</span><Eye /><strong>{t("mission2.page7.step3")}</strong><small>{t("mission2.page7.step3Note")}</small></article>
    </div>
    <div className="m2-discovery-list"><h3>{t("mission2.page7.discovered")}</h3><p><Check />{t("mission2.page7.point1")}</p><p><Check />{t("mission2.page7.point2")}</p><p><Check />{t("mission2.page7.point3")}</p></div>
    <div className="m2-next-lesson"><img src="/assets/img/mission-robot-pointing.png" alt="A robot shines a light on helpful words." /><div><small>{t("mission2.page7.nextLabel")}</small><strong>{t("mission2.page7.nextTitle")}</strong><p>{t("mission2.page7.next")}</p></div></div>
    {!complete && <p className="lesson-summary-advisory">{t("learningMode.notice")}</p>}
    <button type="button" className="primary m2-complete-lesson" onClick={onContinue}>{t("mission2.shell.next")} <ArrowRight /></button>
  </section>;
}
