import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Eye,
  Layers3,
  Lightbulb,
  Network,
  Sparkles
} from "lucide-react";
import { analyseConnections, teachingTokenize } from "./lesson3ConnectionAnalysis.js";
import LessonSummaryPage from "../pagedMissions/LessonSummaryPage.jsx";

const IDEA_ICONS = [Eye, Network, Layers3, Lightbulb];
const localizedTokens = (t, key) => t(key).split("|");
const localizedPlaygroundSentences = (t) => ({
  A: {
    text: t("mission3.page5.presets.A.text"),
    tokens: localizedTokens(t, "mission3.page5.presets.A.tokens"),
    defaultFocusIndex: 7
  },
  B: {
    text: t("mission3.page5.presets.B.text"),
    tokens: localizedTokens(t, "mission3.page5.presets.B.tokens"),
    defaultFocusIndex: 1
  }
});
function PageSectionHeading({ number, label }) {
  return <header className="l3-page-section-heading"><span>{number}</span><small>{label}</small></header>;
}

function Takeaway({ children }) {
  return <div className="l3-takeaway" role="status"><span><Check size={18} /></span><p>{children}</p></div>;
}

function Bridge({ label, children }) {
  return <div className="l3-bridge"><small>{label}</small><ChevronRight size={17} /><p>{children}</p></div>;
}

function TechnicalVisual({ type, startLabel, endLabel }) {
  if (type === "connection") return <svg className="l3-tech-visual is-connection" viewBox="0 0 220 72" aria-hidden="true"><circle cx="28" cy="18" r="7" /><circle cx="28" cy="54" r="7" /><circle cx="192" cy="36" r="10" /><path d="M39 18 C88 18 128 31 177 36" /><path className="is-dashed" d="M39 54 C91 54 133 43 177 37" /></svg>;
  if (type === "attention") return <svg className="l3-tech-visual is-attention" viewBox="0 0 220 70" aria-hidden="true"><circle cx="24" cy="18" r="8" /><circle cx="24" cy="52" r="8" /><circle cx="195" cy="35" r="11" /><path className="strong" d="M34 18 C90 18 126 29 182 35" /><path className="light" d="M34 52 C92 52 132 42 182 35" /></svg>;
  if (type === "representation") return <div className="l3-tech-visual is-representation" aria-hidden="true"><span>“dog”</span><b>+</b><span>“tired”</span><b>+</b><span>“slept”</span><ArrowRight /><strong>updated</strong></div>;
  if (type === "position") return <div className="l3-tech-visual is-position" aria-hidden="true"><p><span>dog</span><ArrowRight /><span>chased</span><ArrowRight /><span>cat</span></p><p><span>cat</span><ArrowRight /><span>chased</span><ArrowRight /><span>dog</span></p></div>;
  if (type === "process") return <div className="l3-tech-visual is-process" aria-hidden="true">{[Eye, Network, Layers3, Sparkles].map((Icon, index) => <React.Fragment key={index}><span><Icon /></span>{index < 3 && <i />}</React.Fragment>)}</div>;
  return <div className="l3-tech-visual is-transformer" aria-hidden="true"><span>{startLabel}</span><ArrowRight /><strong>Transformer</strong><ArrowRight /><span>{endLabel}</span></div>;
}

function TechnicalWord({ id, label, term, visual, visualStart, visualEnd, note, children }) {
  const [open, setOpen] = useState(true);
  const panelId = `${id}-panel`;
  return <details className="l3-technical-word" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary aria-expanded={open} aria-controls={panelId}>
      <span><BookOpenCheck size={16} />{label}</span>
      <strong>{term}</strong>
      <ChevronDown className="l3-technical-chevron" aria-hidden="true" />
    </summary>
    <div id={panelId} className="l3-technical-panel"><p>{children}</p>{visual && <TechnicalVisual type={visual} startLabel={visualStart} endLabel={visualEnd} />}{note && <small className="l3-technical-note"><Lightbulb size={16} aria-hidden="true" />{note}</small>}</div>
  </details>;
}

function KeyIdeas({ t, page }) {
  return <section className="l3-key-ideas" aria-labelledby={`l3-page-${page}-ideas`}>
    <header><Lightbulb aria-hidden="true" /><div><h3 id={`l3-page-${page}-ideas`}>{t("mission3.sidebar.keyIdeas")}</h3><p>{t("mission3.sidebar.keyIdeasHint")}</p></div></header>
    <ul>{[1, 2, 3, 4].map((number, index) => {
      const Icon = IDEA_ICONS[index];
      return <li key={number}><span><Icon aria-hidden="true" /></span>{t(`mission3.sidebar.page${page}.idea${number}`)}</li>;
    })}</ul>
  </section>;
}

function LearningSidebar({ t, page, term, visual, label, children }) {
  return <aside className="l3-learning-sidebar" aria-label={t("mission3.sidebar.learningNotes")}>
    <KeyIdeas t={t} page={page} />
    <TechnicalWord id={`l3-page-${page}-technical`} label={label || t("mission3.labels.technicalWord")} term={term} visual={visual}>{children}</TechnicalWord>
  </aside>;
}

function SummarySidebar({ t }) {
  return <aside className="l3-learning-sidebar l3-summary-sidebar" aria-label={t("mission3.sidebar.learningNotes")}>
    <section className="l3-key-ideas" aria-labelledby="l3-recap-heading"><header><Check aria-hidden="true" /><div><h3 id="l3-recap-heading">{t("mission3.sidebar.recap")}</h3><p>{t("mission3.sidebar.recapHint")}</p></div></header><ul>{[1, 2, 3, 4].map((number, index) => { const Icon = IDEA_ICONS[index]; return <li key={number}><span><Icon aria-hidden="true" /></span>{t(`mission3.page7.point${number}`)}</li>; })}</ul></section>
    <section className="l3-up-next"><small>{t("mission3.page7.nextLabel")}</small><strong>{t("mission3.page7.nextTitle")}</strong><p>{t("mission3.page7.next")}</p></section>
  </aside>;
}

function LearningLayout({ children, sidebar }) {
  return <div className="l3-learning-layout"><div className="l3-learning-main">{children}</div>{sidebar}</div>;
}

function AccuracyNote({ children }) {
  return <p className="l3-accuracy-note"><CircleDot aria-hidden="true" />{children}</p>;
}

function TokenRow({ tokens, target = "", active = [], softActive = [], subdued = false, label }) {
  return <div className="l3-token-row" role="list" aria-label={label}>{tokens.map((token, index) => {
    const id = `${token.toLowerCase()}-${index}`;
    const isTarget = token.toLowerCase() === target.toLowerCase();
    const isActive = active.includes(token.toLowerCase());
    const isSoftActive = softActive.includes(token.toLowerCase());
    return <span role="listitem" className={`${isTarget ? "is-target" : ""} ${isActive ? "is-active" : ""} ${isSoftActive ? "is-soft-active" : ""} ${subdued && !isTarget && !isActive && !isSoftActive ? "is-subdued" : ""}`} key={id}><i aria-hidden="true" />{token}</span>;
  })}</div>;
}

function Representation({ activeCount = 0, updated = false, token = "dog", t }) {
  return <div className={`l3-representation ${updated ? "is-updated" : ""}`} aria-label={t("mission3.labels.simplifiedRepresentation")}>
    <div><small>{t("mission3.labels.simplifiedRepresentation")}</small><strong>{updated ? t("mission3.labels.updatedRepresentation", { token }) : t("mission3.labels.representationOfToken", { token })}</strong>{updated && <em>{t("mission3.labels.updatedIncludesContext")}</em>}</div>
    <div className="l3-representation-bars" aria-hidden="true">{[0, 1, 2, 3].map((bar) => <i className={bar < activeCount ? "is-lit" : ""} key={bar} />)}</div>
  </div>;
}

export function Lesson3Page1({ active, t }) {
  const tokens = localizedTokens(t, "mission3.page1.exampleTokens");
  const connectionTokens = [
    [tokens[0], "is-one"], [tokens[2], "is-two"], [tokens[4], "is-three"],
    [tokens[1], "is-four"], [tokens[5], "is-five"]
  ];
  return <section hidden={!active} className="lesson-3-page l3-page-one l3-context-connections-page" data-lesson-page="1">
    <div className="l3-p1-composition">
      <article className="l3-p1-teaching-surface">
        <header className="l3-p1-hero">
          <div className="l3-p1-hero-copy"><span className="l3-p1-number">1</span><div><small className="l3-section-kicker">{t("mission3.page1.keywordTerm")}</small><p>{t("mission3.page1.bridgeFromLesson2")}</p><p>{t("mission3.page1.bridgeForward")}</p></div></div>
        </header>
        <header className="l3-p1-explanation"><h2>{t("mission3.page1.isolationTitle")}</h2><p>{t("mission3.page1.isolationBody")}</p><p>{t("mission3.page1.combineBody")}</p>
          <div className="l3-p1-example-copy"><span>{t("mission3.page1.exampleLabel")}</span><h3 id="l3-p1-example-heading">{t("mission3.page1.examplePrompt")}</h3><p>{t("mission3.page1.exampleHint")}</p></div>
          <div className="l3-p1-context-visual">
            <div className="l3-p1-token-row" role="list" aria-label={t("mission3.page1.tokenLabel")}>{tokens.map((token, index) => <span role="listitem" className={`is-tone-${index + 1}`} key={`${token}-${index}`}><strong>{token}</strong><small>{index + 1}</small></span>)}</div>
            <div className="l3-p1-context-bracket" aria-hidden="true"><i /><span>{t("mission3.page1.availableContext")}</span></div>
          </div>
        </header>
        <section className="l3-p1-flow" aria-labelledby="l3-p1-flow-heading">
          <div className="l3-p1-flow-copy"><h3 id="l3-p1-flow-heading">{t("mission3.page1.flowTitle")}</h3><p>{t("mission3.page1.flowBody")}</p></div>
          <div className="l3-p1-connection-map" role="img" aria-label={t("mission3.page1.connectionLabel")}>
            <svg viewBox="0 0 620 250" aria-hidden="true"><defs><marker id="l3-p1-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" /></marker></defs><path className="is-dashed" d="M92 76 C174 76 226 85 278 96" /><path d="M310 64 L310 91" /><path className="is-dashed" d="M528 76 C448 76 397 85 343 96" /><path className="is-dashed" d="M92 174 C174 174 226 166 278 155" /><path d="M528 174 C447 174 396 166 343 155" /></svg>
            {connectionTokens.map(([token, position]) => <span className={`l3-p1-source ${position}`} key={token}>{token}</span>)}
            <span className="l3-p1-target"><small>{t("mission3.page1.targetLabel")}</small><strong>{tokens[3]}</strong></span>
          </div>
        </section>
        <div className="l3-p1-key-idea"><span><Sparkles aria-hidden="true" /></span><div><strong>{t("mission3.page1.keyIdeaLabel")}</strong><p>{t("mission3.page1.keyIdea")}</p></div></div>
      </article>
      <aside className="l3-p1-keyword-slot" aria-label={t("mission3.sidebar.learningNotes")} data-guide-target="lesson3-keywords">
        <TechnicalWord id="l3-page-1-connection" label={t("mission3.page1.keywordLabel")} term={t("mission3.page1.keywordTerm")} visual="connection" note={t("mission3.page1.keywordNote")}>{t("mission3.page1.keywordDefinition")}</TechnicalWord>
      </aside>
    </div>
  </section>;
}

export function Lesson3Page2({ active, t, onComplete }) {
  useEffect(() => { if (active) onComplete?.(); }, [active, onComplete]);
  const tokens = localizedTokens(t, "mission3.page1.exampleTokens");
  return <section hidden={!active} className="lesson-3-page l3-page-two l3-share-information-page" data-lesson-page="2">
    <div className="l3-p2-layout">
      <article className="l3-p2-teaching-surface">
        <header className="l3-p2-hero">
          <div className="l3-p2-hero-copy"><span className="l3-p2-number">2</span><div><small className="l3-section-kicker">{t("mission3.page2.attentionTerm")}</small><p>{t("mission3.page2.heroLine1")}</p><p>{t("mission3.page2.heroLine2")}</p></div></div>
        </header>
        <section className="l3-p2-overview" aria-labelledby="l3-p2-simple-heading">
          <div className="l3-p2-overview-copy"><h2 id="l3-p2-simple-heading">{t("mission3.page2.simpleTitle")}</h2><p>{t("mission3.page2.simpleLine1")}</p><p>{t("mission3.page2.simpleLine2")}</p><p>{t("mission3.page2.simpleLine3")}</p></div>
          <div className="l3-p2-token-visual">
            <div className="l3-p2-token-row" role="list" aria-label={t("mission3.page2.tokenLabel")}>{tokens.map((token, index) => <span role="listitem" className={`${index === 3 ? "is-target" : ""} is-tone-${index + 1}`} key={`${token}-${index}`}><strong>{token}</strong><small>{index + 1}</small></span>)}</div>
            <svg className="l3-p2-contribution-arrows" viewBox="0 0 720 120" role="img" aria-label={t("mission3.page2.connectionLabel")}><defs><marker id="l3-p2-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" /></marker></defs><path className="is-strong" d="M58 18 C150 112 310 102 420 26" /><path className="is-medium" d="M180 18 C251 83 341 81 420 27" /><path className="is-weak" d="M300 18 C341 58 385 57 420 27" /><path className="is-medium" d="M540 18 C505 55 462 55 420 27" /><path className="is-weak" d="M660 18 C582 92 492 83 420 27" /></svg>
          </div>
        </section>
        <div className="l3-p2-visual-notes">
          <section className="l3-p2-legend" aria-label={t("mission3.page2.legendTitle")}><strong>{t("mission3.page2.legendTitle")}</strong><span><i className="is-strong" />{t("mission3.page2.legendStrong")}</span><span><i className="is-medium" />{t("mission3.page2.legendMedium")}</span><span><i className="is-weak" />{t("mission3.page2.legendWeak")}</span></section>
          <div className="l3-p2-callout"><Lightbulb aria-hidden="true" /><p>{t("mission3.page2.callout")}</p></div>
        </div>
        <section className="l3-p2-mechanism" aria-labelledby="l3-p2-mechanism-heading">
          <h2 id="l3-p2-mechanism-heading">{t("mission3.page2.mechanismTitle")}</h2>
          <div className="l3-p2-mechanism-flow">
            <article className="l3-p2-step"><strong>{t("mission3.page2.step1Title")}</strong><p>{t("mission3.page2.step1Body")}</p><div className="l3-p2-mini-tokens" aria-hidden="true">{[1,2,3,4,5,6].map((number)=><i className={`is-${number}`} key={number} />)}</div></article>
            <ArrowRight className="l3-p2-step-arrow" aria-hidden="true" />
            <article className="l3-p2-step"><strong>{t("mission3.page2.step2Title")}</strong><p>{t("mission3.page2.step2Body")}</p><div className="l3-p2-mini-contributions" aria-hidden="true">{[10,22,35,17,29,12].map((height,index)=><span key={index}><b style={{height:`${height}px`}} /><i className={`is-${index+1}`} /></span>)}</div></article>
            <ArrowRight className="l3-p2-step-arrow" aria-hidden="true" />
            <article className="l3-p2-step"><strong>{t("mission3.page2.step3Title")}</strong><p>{t("mission3.page2.step3Body")}</p><div className="l3-p2-mini-combine" aria-hidden="true"><span><i /><i /><i /><i /></span><ArrowDown /><b /></div></article>
            <ArrowRight className="l3-p2-step-arrow" aria-hidden="true" />
            <article className="l3-p2-result"><span><Sparkles aria-hidden="true" /></span><strong>{t("mission3.page2.resultTitle")}</strong><p>{t("mission3.page2.resultBody")}</p></article>
          </div>
        </section>
        <p className="l3-p2-accuracy"><CircleDot aria-hidden="true" />{t("mission3.page2.accuracy")}</p>
      </article>
      <aside className="l3-p2-aside" aria-label={t("mission3.sidebar.learningNotes")}>
        <TechnicalWord id="l3-page-2-attention" label={t("mission3.page2.keywordLabel")} term={t("mission3.page2.attentionTerm")} visual="attention" note={t("mission3.page2.attentionNote")}>{t("mission3.page2.attentionDefinition")}</TechnicalWord>
        <TechnicalWord id="l3-page-2-transformer" label={t("mission3.page2.keywordLabel")} term={t("mission3.page2.transformerTerm")} visual="transformer" visualStart={t("mission3.activeUi.visualTokens")} visualEnd={t("mission3.activeUi.visualUpdated")} note={t("mission3.page2.transformerNote")}>{t("mission3.page2.transformerDefinition")}</TechnicalWord>
        <div className="l3-p2-next-teaser"><img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true" /><p>{t("mission3.page2.nextTeaser")}</p></div>
      </aside>
    </div>
  </section>;
}

export function Lesson3Page3({ active, t, onComplete }) {
  useEffect(() => { if (active) onComplete?.(); }, [active, onComplete]);
  const tokens = localizedTokens(t, "mission3.page3.exampleTokens");
  const sources = tokens.slice(0, 6);
  const target = tokens[6];
  return <section hidden={!active} className="lesson-3-page l3-page-three l3-contribution-page" data-lesson-page="3">
    <div className="l3-p3-composition">
      <article className="l3-p3-teaching-surface">
        <header className="l3-p3-hero">
          <div className="l3-p3-hero-copy"><span className="l3-p3-number">3</span><div><small className="l3-section-kicker">{t("mission3.page3.keywordTerm")}</small><p>{t("mission3.page3.heroLine1")}</p><p>{t("mission3.page3.heroLine2")}</p></div></div>
        </header>
        <section className="l3-p3-focus">
          <div><span>{t("mission3.page3.focusLabel")}</span><h2>{t("mission3.page3.focusTitle", { token: target })}</h2><p>{t("mission3.page3.focusBody", { token: target })}</p></div>
          <div className="l3-p3-explanation"><Lightbulb aria-hidden="true" /><p>{t("mission3.page3.explanationLine1")}<br /><strong>{t("mission3.page3.explanationEmphasis")}</strong> {t("mission3.page3.explanationLine2")}</p></div>
        </section>
        <section className="l3-p3-example" aria-labelledby="l3-p3-example-heading">
          <span>{t("mission3.page3.exampleLabel")}</span><h3 id="l3-p3-example-heading">{t("mission3.page3.sentenceLabel")}</h3>
          <div className="l3-p3-sentence-row" role="list" aria-label={t("mission3.page3.tokenRowLabel")}>{tokens.map((token, index) => <span role="listitem" className={`${index === 6 ? "is-focus" : ""} ${index > 6 ? "is-unavailable" : ""} is-tone-${(index % 6) + 1}`} key={`${token}-${index}`}><strong>{token}</strong><small>{index + 1}</small></span>)}</div>
          <div className="l3-p3-context-status" aria-hidden="true"><span className="is-available">{t("mission3.page3.availableContext")}</span><span className="is-unavailable">{t("mission3.page3.notAvailable")}</span></div>
        </section>
        <section className="l3-p3-diagram" aria-labelledby="l3-p3-diagram-heading">
          <h3 id="l3-p3-diagram-heading">{t("mission3.page3.diagramTitle")}</h3>
          <div className="l3-p3-diagram-grid">
            <aside className="l3-p3-legend" aria-label={t("mission3.page3.legendTitle")}><strong>{t("mission3.page3.legendTitle")}</strong>{["Strong","Medium","Weak","VeryWeak"].map((level) => <span key={level}><i className={`is-${level.toLowerCase()}`} />{t(`mission3.page3.legend${level}`)}</span>)}</aside>
            <div className="l3-p3-arrow-map" role="img" aria-label={t("mission3.page3.diagramLabel")}>
              <div className="l3-p3-source-row">{sources.map((token, index) => <span className={`is-tone-${index + 1}`} key={`${token}-${index}`}><strong>{token}</strong><small>{index + 1}</small></span>)}</div>
              <svg viewBox="0 0 760 190" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="l3-p3-arrow-strong" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" /></marker><marker id="l3-p3-arrow-medium" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" /></marker><marker id="l3-p3-arrow-weak" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" /></marker></defs><path className="is-veryweak" d="M62 20 C118 88 245 105 365 118" /><path className="is-strong" d="M190 20 C219 88 292 108 367 118" /><path className="is-medium" d="M316 20 C325 75 347 103 370 118" /><path className="is-weak" d="M444 20 C435 75 411 103 390 118" /><path className="is-strong" d="M570 20 C545 88 473 108 393 118" /><path className="is-veryweak" d="M698 20 C644 88 515 105 395 118" /></svg>
              <div className="l3-p3-target"><strong>{target}</strong><small>7</small><em>{t("mission3.page3.focusToken")}</em></div>
            </div>
          </div>
          <div className="l3-p3-diagram-note"><Lightbulb aria-hidden="true" /><p>{t("mission3.page3.explanationLine1")} <strong>{t("mission3.page3.explanationEmphasis")}</strong> {t("mission3.page3.explanationLine2")}</p><Sparkles aria-hidden="true" /></div>
        </section>
        <div className="l3-p3-summary"><span><Sparkles aria-hidden="true" /></span><div><strong>{t("mission3.page3.keyIdeaLabel")}</strong><p>{t("mission3.page3.keyIdeaLine1")} {t("mission3.page3.keyIdeaLine2")}</p></div></div>
      </article>
      <aside className="l3-p3-aside" aria-label={t("mission3.sidebar.learningNotes")}>
        <TechnicalWord id="l3-page-3-attention-pattern" label={t("mission3.page3.keywordLabel")} term={t("mission3.page3.keywordTerm")} note={t("mission3.page3.keywordNote")}>{t("mission3.page3.keywordDefinition")}</TechnicalWord>
        <section className="l3-p3-why"><span>{t("mission3.page3.whyLabel")}</span><div className="l3-p3-puzzle" aria-hidden="true"><i /><i /><i /><i /></div><p>{t("mission3.page3.whyBody")}</p></section>
        <div className="l3-p3-next-teaser"><img src="/assets/img/mission-robot-pointing.png" alt="" aria-hidden="true" /><p>{t("mission3.page3.nextTeaser")}</p></div>
      </aside>
    </div>
  </section>;
}

function PositionComparison({ variant, t }) {
  const tokens = localizedTokens(t, `mission3.page4.example${variant.toUpperCase()}Tokens`);
  const dogPosition = variant === "a" ? 2 : 5;
  const target = tokens[dogPosition - 1];
  const paths = variant === "a" ? ["M54 12 C77 48 130 68 202 78", "M142 12 C155 45 179 64 204 78", "M230 12 C230 43 221 64 208 78", "M318 12 C299 47 263 67 214 78", "M406 12 C361 49 299 70 218 78"] : ["M54 12 C90 49 145 69 234 78", "M142 12 C165 47 198 66 236 78", "M230 12 C235 47 239 66 240 78", "M318 12 C297 48 273 67 245 78", "M406 12 C361 50 305 70 249 78"];
  return <article className={`l3-p4-example is-${variant}`}>
    <header><span>{t(`mission3.page4.example${variant.toUpperCase()}`)}</span><h3>“{tokens.join(" ")}”</h3></header>
    <div className="l3-p4-token-row" role="list" aria-label={t(`mission3.page4.tokenRow${variant.toUpperCase()}`)}>{tokens.map((token, index) => <span role="listitem" className={index === dogPosition - 1 ? "is-dog" : `is-tone-${index + 1}`} key={`${token}-${index}`}><strong>{token}</strong><small>{index + 1}</small></span>)}</div>
    <h4>{t("mission3.page4.connectionsFor", { token: target, position: dogPosition })}</h4>
    <div className="l3-p4-connection-map" role="img" aria-label={t(`mission3.page4.connectionDiagram${variant.toUpperCase()}`, { token: target })}><div className="l3-p4-source-row">{tokens.filter((_, index) => index !== dogPosition - 1).map((token, index) => <span key={`${token}-${index}`}>{token}</span>)}</div><svg viewBox="0 0 460 132" aria-hidden="true"><defs><marker id={`l3-p4-arrow-${variant}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" /></marker></defs>{paths.map((path, index) => <path className={`is-strength-${index + 1}`} d={path} markerEnd={`url(#l3-p4-arrow-${variant})`} key={path} />)}</svg><span className="l3-p4-focus">{target}<small>{dogPosition}</small></span></div>
  </article>;
}

export function Lesson3Page4({ active, t }) {
  return <section hidden={!active} className="lesson-3-page l3-page-four l3-position-matters-page" data-lesson-page="4">
    <div className="l3-p4-layout"><article className="l3-p4-teaching-surface">
      <header className="l3-p4-hero"><div className="l3-p4-hero-copy"><span className="l3-p4-number">4</span><div><small className="l3-section-kicker">{t("mission3.page4.positionTerm")}</small><p>{t("mission3.page4.heroLine1")}</p><p>{t("mission3.page4.heroLine2")}</p></div></div></header>
      <header className="l3-p4-intro"><div><h2><Lightbulb />{t("mission3.page4.whyTitle")}</h2><p>{t("mission3.page4.whyLine1")}</p><p>{t("mission3.page4.whyLine2")}</p></div><aside><Lightbulb /><p>{t("mission3.page4.positionCallout")}</p></aside></header>
      <div className="l3-p4-examples"><PositionComparison variant="a" t={t} /><PositionComparison variant="b" t={t} /></div>
      <footer className="l3-p4-summary"><div className="l3-p4-legend" aria-label={t("mission3.page4.legendTitle")}>{["Strong", "Medium", "Weak", "VeryWeak"].map((level) => <span className={`is-${level.toLowerCase()}`} key={level}><i />{t(`mission3.page4.legend${level}`)}</span>)}</div><div className="l3-p4-chain"><Sparkles /><span>{t("mission3.page4.sameOrder")}</span><ArrowRight /><strong>{t("mission3.page4.differentConnections")}</strong><ArrowRight /><strong>{t("mission3.page4.differentRepresentation")}</strong></div></footer>
      <p className="l3-p4-accuracy"><CircleDot />{t("mission3.page4.accuracy")}</p>
    </article><aside className="l3-p4-aside" aria-label={t("mission3.sidebar.learningNotes")}><div className="l3-p4-keywords"><small>{t("mission3.page4.keywordsLabel")}</small><TechnicalWord id="l3-page-4-position" label={t("mission3.page4.keywordLabel")} term={t("mission3.page4.positionTerm")}>{t("mission3.page4.positionDefinition")}</TechnicalWord><TechnicalWord id="l3-page-4-positional" label={t("mission3.page4.keywordLabel")} term={t("mission3.page4.positionalTerm")}>{t("mission3.page4.positionalDefinition")}</TechnicalWord></div><section className="l3-p4-why"><small>{t("mission3.page4.whyLabel")}</small><div aria-hidden="true"><Network /></div><p>{t("mission3.page4.whyBody")}</p></section></aside></div>
  </section>;
}

function PlaygroundTokens({ tokens, focusIndex, onFocus, label, focusLabel, compact = false, guideTarget }) {
  return <div className={`l3-p5-tokens ${compact ? "is-compact" : ""}`} role={compact ? "list" : "group"} aria-label={label} data-guide-target={guideTarget}>{tokens.map((token, index) => compact ? <span role="listitem" className={`is-tone-${(index % 6) + 1} ${index === focusIndex ? "is-focus" : ""}`} key={`${token}-${index}`}><strong>{token}</strong><small>{index + 1}</small></span> : <button type="button" aria-pressed={index === focusIndex} className={`is-tone-${(index % 6) + 1} ${index === focusIndex ? "is-focus" : ""}`} onClick={() => onFocus?.(index)} key={`${token}-${index}`}><strong>{token}</strong><small>{index + 1}</small>{index === focusIndex && <em>{focusLabel}</em>}</button>)}</div>;
}

function ConnectionPlayground({ tokens, text, focusIndex, t }) {
  const analysis = analyseConnections({ text, tokens, focusIndex });
  const focus = tokens[focusIndex];
  const count = Math.max(analysis.connectionPattern.length, 1);
  return <div className="l3-p5-connection-layout" data-guide-target="lesson3-connections">
    <aside className="l3-p5-legend" aria-label={t("mission3.page5.legendTitle")}><strong>{t("mission3.page5.legendTitle")}</strong>{["strong", "medium", "weak", "veryWeak"].map((level) => <span key={level}><i className={`is-${level.toLowerCase()}`} />{t(`mission3.page5.legend${level[0].toUpperCase()}${level.slice(1)}`)}</span>)}</aside>
    <div className="l3-p5-map" role="img" aria-label={t("mission3.page5.diagramLabel", { token: focus })}>
      <div className="l3-p5-source-row">{analysis.connectionPattern.map(({ tokenIndex }) => <span className={`is-tone-${(tokenIndex % 6) + 1}`} key={tokenIndex}>{tokens[tokenIndex]}<small>{tokenIndex + 1}</small></span>)}</div>
      {analysis.connectionPattern.length > 0 ? <svg viewBox="0 0 1000 170" aria-hidden="true"><defs><marker id="l3-p5-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" /></marker></defs>{analysis.connectionPattern.map(({ tokenIndex, level }, index) => { const x = 65 + (870 * (index + .5)) / count; const curve = 66 + Math.abs(500 - x) * .07; return <path className={`is-${level.toLowerCase()}`} d={`M${x} 14 C${x} ${curve} 500 ${curve} 500 112`} markerEnd="url(#l3-p5-arrow)" key={tokenIndex} />; })}</svg> : <p>{t("mission3.page5.noEarlierContext")}</p>}
      <span className="l3-p5-map-focus"><strong>{focus}</strong><small>{focusIndex + 1}</small></span>
      <em>{t("mission3.page5.simplifiedLabel")}</em>
    </div>
    <aside className="l3-p5-observation"><strong>{t("mission3.page5.noticeTitle")}</strong><p>{t("mission3.page5.notice1")}</p><p>{t("mission3.page5.notice2")}</p><p>{t("mission3.page5.notice3")}</p></aside>
  </div>;
}

export function Lesson3Page5({ active, t, onComplete }) {
  const presets = localizedPlaygroundSentences(t);
  const [selectedSentence, setSelectedSentence] = useState("A");
  const [customText, setCustomText] = useState("");
  const [customSentence, setCustomSentence] = useState(null);
  const [focusIndex, setFocusIndex] = useState(7);
  const [errorType, setErrorType] = useState("");
  const current = selectedSentence === "custom" ? customSentence : presets[selectedSentence];
  const chooseSentence = (id) => { const next = presets[id]; setSelectedSentence(id); setFocusIndex(next.defaultFocusIndex); setErrorType(""); onComplete?.(); };
  const chooseFocus = (index) => { setFocusIndex(index); onComplete?.(); };
  const analyseCustom = (event) => { event.preventDefault(); const text = customText.trim(); const tokens = teachingTokenize(text); if (!text) { setErrorType("emptyError"); return; } if (tokens.length > 16) { setErrorType("longError"); return; } const defaultFocusIndex = Math.max(0, tokens.length - 1); setCustomSentence({ text, tokens, defaultFocusIndex }); setSelectedSentence("custom"); setFocusIndex(defaultFocusIndex); setErrorType(""); onComplete?.(); };
  return <section hidden={!active} className="lesson-3-page l3-page-five l3-p5-playground" data-lesson-page="5">
    <div className="l3-p5-layout"><main className="l3-p5-main">
      <PageSectionHeading number="5" label={t("mission3.page5.tryTitle")} />
      <section className="l3-p5-step l3-p5-sentences" aria-labelledby="l3-p5-step1"><header><span>{t("mission3.activeUi.step", { number: 1 })}</span><h2 id="l3-p5-step1">{t("mission3.page5.chooseSentence")}</h2></header><div data-guide-target="lesson3-sentence-selector">{["A", "B"].map((id) => { const sentence = presets[id]; return <button type="button" className={`l3-p5-sentence ${selectedSentence === id ? "is-selected" : ""}`} aria-pressed={selectedSentence === id} onClick={() => chooseSentence(id)} key={id}><small>{t(`mission3.page5.sentence${id}`)}</small><strong>“{sentence.text}”</strong><PlaygroundTokens tokens={sentence.tokens} focusIndex={sentence.defaultFocusIndex} compact label={t("mission3.page5.sentenceTokens", { sentence: id })} />{selectedSentence === id && <Check aria-hidden="true" />}</button>; })}</div></section>
      <section className="l3-p5-step l3-p5-focus-step" aria-labelledby="l3-p5-step2"><header><span>{t("mission3.activeUi.step", { number: 2 })}</span><div><h2 id="l3-p5-step2">{t("mission3.page5.chooseFocus")}</h2><p>{t("mission3.page5.chooseFocusHint")}</p></div></header><div className="l3-p5-focus-content"><PlaygroundTokens tokens={current.tokens} focusIndex={focusIndex} onFocus={chooseFocus} label={t("mission3.page5.focusTokens")} focusLabel={t("mission3.activeUi.focus")} guideTarget="lesson3-focus-tokens" /><aside aria-live="polite"><small>{t("mission3.page5.currentFocus")}</small><strong>{current.tokens[focusIndex]}</strong><span>{t("mission3.page5.position", { position: focusIndex + 1 })}</span><CircleDot aria-hidden="true" /></aside></div></section>
      <section className="l3-p5-step l3-p5-connections" aria-labelledby="l3-p5-step3"><header><span>{t("mission3.activeUi.step", { number: 3 })}</span><h2 id="l3-p5-step3">{t("mission3.page5.connectionsTo", { token: current.tokens[focusIndex] })}</h2></header><ConnectionPlayground tokens={current.tokens} text={current.text} focusIndex={focusIndex} t={t} /><p className="l3-p5-accuracy"><CircleDot />{t("mission3.page5.accuracy")}</p></section>
      <section className="l3-p5-step l3-p5-custom" aria-labelledby="l3-p5-step4"><header><span>{t("mission3.activeUi.step", { number: 4 })}</span><div><h2 id="l3-p5-step4">{t("mission3.page5.customTitle")}</h2><p>{t("mission3.page5.customHint")}</p></div></header><form onSubmit={analyseCustom} data-guide-target="lesson3-own-sentence"><label htmlFor="l3-p5-custom-input" className="sr-only">{t("mission3.page5.customTitle")}</label><input id="l3-p5-custom-input" value={customText} onChange={(event) => setCustomText(event.target.value)} placeholder={t("mission3.page5.customPlaceholder")} maxLength={180} /><button type="submit" data-guide-target="lesson3-analyse">{t("mission3.page5.analyse")}<ArrowRight /></button></form>{errorType && <p className="l3-p5-error" role="alert">{t(`mission3.page5.${errorType}`)}</p>}</section>
    </main><aside className="l3-p5-aside" aria-label={t("mission3.sidebar.learningNotes")}><div className="l3-p5-keywords"><small>{t("mission3.page5.keywordsLabel")}</small><TechnicalWord id="l3-page-5-position" label={t("mission3.page5.keywordLabel")} term={t("mission3.page4.positionTerm")}>{t("mission3.page4.positionDefinition")}</TechnicalWord><TechnicalWord id="l3-page-5-positional" label={t("mission3.page5.keywordLabel")} term={t("mission3.page4.positionalTerm")}>{t("mission3.page4.positionalDefinition")}</TechnicalWord></div><section className="l3-p5-why"><small>{t("mission3.page5.whyLabel")}</small><Network aria-hidden="true" /><p>{t("mission3.page5.whyBody")}</p></section><section className="l3-p5-try"><Sparkles /><strong>{t("mission3.page5.tryTitle")}</strong><p>{t("mission3.page5.tryBody")}</p></section></aside></div>
  </section>;
}

export function Lesson3Page7({ active, t, complete, onVisit }) {
  useEffect(() => { if (active) onVisit?.(); }, [active, onVisit]);
  const ideas = [
    { Icon: Eye, title: t("mission3.page7.idea1Title"), copy: t("mission3.page7.idea1Copy") },
    { Icon: Network, title: t("mission3.page7.idea2Title"), copy: t("mission3.page7.idea2Copy") },
    { Icon: Sparkles, title: t("mission3.page7.idea3Title"), copy: t("mission3.page7.idea3Copy") },
    { Icon: Layers3, title: t("mission3.page7.idea4Title"), copy: t("mission3.page7.idea4Copy") }
  ];
  return <LessonSummaryPage active={active} pageNumber="7" kicker={t("mission3.page7.eyebrow")} ideas={ideas} recap={t("mission3.page7.recap")} nextLabel={t("mission3.page7.nextLabel")} nextTitle={t("mission3.page7.nextTitle")} nextCopy={t("mission3.page7.next")} advisory={!complete ? t("learningMode.notice") : ""} />;
}
