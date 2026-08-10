import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PAGED_MISSIONS } from "../src/pagedMissions/missionCurriculumData.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [shell, pages, data, css, app, course, mission2, mission4, mission5] = await Promise.all([
  read("../src/mission3/Lesson3Paged.jsx"),
  read("../src/mission3/Lesson3Pages.jsx"),
  read("../src/mission3/lesson3TeachingData.js"),
  read("../src/mission3/lesson3Paged.css"),
  read("../src/main.jsx"),
  read("../src/data/courseData.js"),
  read("../src/mission2/Mission2PagedPrototype.jsx"),
  read("../src/mission4/Lesson4Paged.jsx"),
  read("../src/mission5/Lesson5Paged.jsx")
]);

assert.equal(PAGED_MISSIONS[3].topic, "Connecting the Tokens");
assert.equal(PAGED_MISSIONS[3].pages.length, 6);
assert.deepEqual(PAGED_MISSIONS[3].pages.map((page) => page[0]), ["connections", "attention", "representation", "position", "process", "summary"]);
assert.match(course, /How does a language model connect words together\?[\s\S]*Connecting the Tokens/);
assert.match(app, /3-hallucination-paged"\) page = <Lesson3Paged/);

for (let page = 1; page <= 6; page += 1) assert.match(shell, new RegExp(`Lesson3Page${page} active=\\{currentPage===${page}\\}`));
assert.match(shell, /history\.pushState/);
assert.match(shell, /addEventListener\("popstate"/);
assert.doesNotMatch(shell, /canAdvance=/, "page navigation remains non-blocking");
assert.match(shell, /REQUIRED = \["connection-strengths","contextual-build","transformer-process","summary-visited"\]/);
assert.match(shell, /REQUIRED\.every[\s\S]*visited\.has\(pageCount\)/, "direct final-page access cannot complete the lesson");

assert.match(pages, /l3-context-connections-page[\s\S]*bridgeFromLesson2[\s\S]*bridgeForward/, "Page 1 bridges directly from Lesson 2 context to connections");
assert.doesNotMatch(pages.match(/export function Lesson3Page1[\s\S]*?export function Lesson3Page2/)?.[0] || "", /term="Transformer"|runTransformer|l3-transformer-stage/, "Page 1 no longer introduces the Transformer or its old activity");
assert.doesNotMatch(pages, /Page1[\s\S]{0,3000}(?:check answer|tryAgain|correct answer)/i, "Page 1 is not a mandatory clue quiz");
assert.match(pages, /\["The", "little", "reader", "opened", "the", "book"\][\s\S]*l3-p1-token-row/, "Page 1 presents the requested six-token sentence");
assert.match(pages, /l3-p1-context-bracket[\s\S]*availableContext/, "Page 1 visually reconnects the tokens to the available context");
assert.match(pages, /l3-p1-connection-map[\s\S]*marker id="l3-p1-arrow"[\s\S]*l3-p1-target/, "Page 1 uses SVG arrows into the target token");
assert.match(pages, /keywordTerm[\s\S]*keywordNote[\s\S]*keywordDefinition/, "Page 1 has one expandable Connection keyword card");
assert.match(pages, /l3-p1-key-idea[\s\S]*keyIdea/, "Page 1 ends with one focused key idea");
assert.match(pages, /l3-p1-composition[\s\S]*l3-p1-teaching-surface[\s\S]*l3-p1-keyword-slot/, "Page 1 uses one cohesive teaching composition with an embedded keyword slot");
assert.match(pages, /l3-p1-surface-shape[\s\S]*Q872 296 902 296/, "Page 1 draws a tall rounded fold sized for the expanded keyword card");
assert.match(css, /l3-p1-surface-shape path\{fill:/, "the rounded teaching-card silhouette is rendered as SVG, not a screenshot");
assert.match(css, /l3-p1-keyword-slot\{position:absolute/, "the Page 1 keyword is independent of the main card flow on desktop");
const page1Source = pages.match(/export function Lesson3Page1[\s\S]*?export function Lesson3Page2/)?.[0] || "";
assert.doesNotMatch(page1Source, /l3-p1-hero-art|mission3-robot-hallucination/, "Page 1 no longer renders a hero robot");
assert.doesNotMatch(page1Source, /nextTeaser|l3-p1-next-teaser/, "Page 1 no longer renders the teaser that crowded the notch");
assert.match(css, /--l3-p1-notch-height:296px[\s\S]*grid-template-rows:var\(--l3-p1-notch-height\)/, "Page 1 reserves the full notch height before the token example");
assert.match(css, /l3-p1-keyword-slot \.l3-technical-word\[open\]\{height:var\(--l3-p1-keyword-expanded-height\)\}/, "the expanded keyword card is sized to the reserved notch without clipping");
assert.match(shell, /progressPageCount=\{progressPageCount\}/);
assert.match(shell, /const progressPageCount=7/);
const page2Source = pages.match(/export function Lesson3Page2[\s\S]*?export function Lesson3Page3/)?.[0] || "";
assert.match(page2Source, /l3-share-information-page[\s\S]*simpleTitle[\s\S]*l3-p2-token-visual/, "Page 2 uses the requested teaching-first composition");
assert.match(page2Source, /\["The", "little", "reader", "opened", "the", "book"\][\s\S]*index === 3 \? "is-target"/, "Page 2 highlights opened at position 4 as the target token");
assert.match(page2Source, /marker id="l3-p2-arrow"[\s\S]*is-strong[\s\S]*is-medium[\s\S]*is-weak/, "Page 2 distinguishes stronger, medium and weaker illustrative contributions");
assert.equal((page2Source.match(/420 2[67]/g) || []).length, 5, "all five contribution arrows terminate at the opened target");
assert.match(page2Source, /legendTitle[\s\S]*legendStrong[\s\S]*legendMedium[\s\S]*legendWeak[\s\S]*callout/, "Page 2 explains the connection styles without numeric scores");
assert.match(page2Source, /step1Title[\s\S]*step2Title[\s\S]*step3Title[\s\S]*resultTitle/, "Page 2 presents the three-step mechanism and result in sequence");
assert.match(page2Source, /id="l3-page-2-attention"[\s\S]*attentionDefinition[\s\S]*id="l3-page-2-transformer"[\s\S]*transformerDefinition/, "Page 2 uses the shared expandable keyword component for Attention and Transformer");
assert.doesNotMatch(page2Source, /showConnections|l3-strength-sources|l3-connection-map/, "Page 2 removes the old interaction and dashboard-like connection map");
assert.doesNotMatch(pages + data, /(?:attention|connection)\s*(?:weight|score)?\s*[:=]\s*0?\.\d+/i, "no fake attention values");
const page3Source = pages.match(/export function Lesson3Page3[\s\S]*?function PositionComparison/)?.[0] || "";
assert.match(page3Source, /\["The", "dog", "chased", "the", "ball", "because", "it", "was", "tired", "\."\]/, "Page 3 uses the requested ten-token sentence");
assert.match(page3Source, /index === 6 \? "is-focus"[\s\S]*index > 6 \? "is-unavailable"/, "Page 3 marks it at position 7 and prevents future positions from appearing available");
assert.match(page3Source, /l3-p3-context-status[\s\S]*availableContext[\s\S]*notAvailable/, "Page 3 distinguishes available positions 1–7 from unavailable positions 8–10");
assert.match(page3Source, /const sources = \["The", "dog", "chased", "the", "ball", "because"\]/, "the contribution diagram only uses earlier positions");
assert.equal((page3Source.match(/<path className="is-(?:strong|medium|weak|veryweak)"/g) || []).length, 6, "Page 3 draws six contribution arrows");
assert.equal((page3Source.match(/[C ]3(?:68|69|71|88|90|91) 158"/g) || []).length, 6, "all six paths terminate beside the it target");
assert.match(css, /l3-p3-arrow-map>svg \.is-strong\{[^}]*marker-end:url\(#l3-p3-arrow-strong\)/, "strong contribution paths carry inward arrowheads");
assert.match(css, /l3-p3-arrow-map>svg \.is-medium\{[^}]*marker-end:url\(#l3-p3-arrow-medium\)/, "medium contribution paths carry inward arrowheads");
assert.match(css, /l3-p3-arrow-map>svg \.is-weak\{[^}]*marker-end:url\(#l3-p3-arrow-weak\)/, "weak contribution paths carry inward arrowheads");
assert.match(css, /l3-p3-arrow-map>svg \.is-veryweak\{[^}]*marker-end:url\(#l3-p3-arrow-weak\)/, "very weak contribution paths carry inward arrowheads");
assert.match(page3Source, /\["Strong","Medium","Weak","VeryWeak"\][\s\S]*mission3\.page3\.legend\$\{level\}/, "Page 3 includes the compact four-level contribution legend");
assert.match(page3Source, /keywordTerm[\s\S]*keywordNote[\s\S]*keywordDefinition[\s\S]*whyBody[\s\S]*nextTeaser/, "Page 3 includes Attention pattern, the simplified-visual disclaimer, why-it-matters and the next-page teaser");
assert.doesNotMatch(page3Source, /onClick|aria-pressed|fetch\(|probability|percent/i, "Page 3 remains a static teaching visual without fake measurements");
const page4Source = pages.match(/function PositionComparison[\s\S]*?function PlaygroundTokens/)?.[0] || "";
assert.match(data, /\["The", "dog", "chased", "the", "ball", "\."\][\s\S]*\["The", "ball", "chased", "the", "dog", "\."\]/, "Page 4 compares the same six tokens in two orders");
assert.match(page4Source, /dogPosition = variant === "a" \? 2 : 5/, "Page 4 identifies dog at positions 2 and 5");
assert.equal((page4Source.match(/<PositionComparison variant=/g) || []).length, 2, "Page 4 presents two equal comparison panels");
assert.match(page4Source, /l3-p4-token-row[\s\S]*l3-p4-connection-map[\s\S]*markerEnd/, "Page 4 shows token positions and inward relationship arrows");
assert.match(page4Source, /\["Strong", "Medium", "Weak", "VeryWeak"\][\s\S]*mission3\.page4\.legend\$\{level\}/, "Page 4 includes the compact four-level connection legend");
assert.match(page4Source, /positionTerm[\s\S]*positionDefinition[\s\S]*positionalTerm[\s\S]*positionalDefinition/, "Page 4 includes Position and Positional information keyword cards");
assert.match(page4Source, /sameOrder[\s\S]*differentConnections[\s\S]*differentRepresentation/, "Page 4 closes with the requested order-to-representation chain");
assert.doesNotMatch(page4Source, /onClick|aria-pressed|chooseActor|who-choices|tryAgain/, "Page 4 remains a static teaching comparison");
assert.match(pages, /selectedSentence[\s\S]*LESSON_3_PLAYGROUND_SENTENCES[\s\S]*customSentence/, "Page 5 switches between two examples and a custom sentence using real state");
assert.match(pages, /aria-pressed=\{index === focusIndex\}[\s\S]*chooseFocus/, "Page 5 makes every focus token keyboard-operable");
assert.match(pages, /analyseConnections[\s\S]*markerEnd="url\(#l3-p5-arrow\)"/, "Page 5 renders deterministic causal connections with inward SVG arrowheads");
assert.match(pages, /teachingTokenize[\s\S]*setSelectedSentence\("custom"\)/, "Page 5 custom analysis updates the token and focus state");
assert.match(pages, /simplifiedLabel[\s\S]*page5\.accuracy/, "Page 5 carries an accuracy boundary");
assert.match(pages, /l3-final-pipeline[\s\S]*is-gate[\s\S]*l3-prediction-gate/, "Page 6 ends at prediction readiness");
assert.doesNotMatch(pages, /softmax|candidate probabilities|decoding rule/i, "Lesson 4 probability mechanics stay out of Lesson 3");

assert.match(mission2, /prototypeEndAction: t\("mission2\.shell\.nextLesson"\)/);
assert.match(shell, /prototypeEndAction:t\("mission3\.shell\.nextLesson"\)/);
assert.match(mission4, /prototypeEndAction:t\("mission4\.shell\.nextLesson"\)/);
assert.match(mission5, /prototypeEndAction:t\("mission5\.shell\.nextChallenge"\)/);

assert.match(pages, /<details className="l3-technical-word"/);
assert.match(pages, /<summary aria-expanded=\{open\} aria-controls=\{panelId\}>/);
assert.match(pages, /l3-technical-chevron/);
assert.match(pages, /l3-learning-layout[\s\S]*l3-learning-main/);
assert.match(pages, /<aside className="l3-learning-sidebar/);
assert.match(pages, /l3-key-ideas/);
assert.match(pages, /l3-takeaway/);
assert.doesNotMatch(pages, /l3-floating|floating-rail|icon-rail/i, "Lesson 3 does not add another floating rail");
assert.match(pages, /aria-live="polite"/);
assert.doesNotMatch(pages, /fetch\(|axios|https?:\/\//, "no APIs or external assets");
assert.match(css, /^\.mission-lesson-paged\.lesson-3-paged/m);
assert.match(css, /max-width:375px/);
assert.match(css, /overflow-x:hidden/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /stroke-width:13[\s\S]*stroke-width:4/, "connection strength is not colour-only");
assert.match(css, /grid-template-columns:minmax\(0,1fr\) minmax\(280px,310px\)/, "desktop uses a main learning area and a restrained sidebar");
assert.match(css, /max-width:980px[\s\S]*l3-learning-layout\{grid-template-columns:1fr\}/, "the learning sidebar stacks below the main stage");
assert.match(css, /l3-learning-sidebar\{position:sticky;top:88px/, "the desktop sidebar stays naturally visible");
assert.doesNotMatch(css, /l3-learning-sidebar[^}]*overflow-y\s*:\s*(?:auto|scroll)/, "the learning sidebar never creates nested scrolling");
assert.match(css, /l3-p5-layout\{display:grid;grid-template-columns:minmax\(0,3\.35fr\) minmax\(230px,1fr\)/, "Page 5 uses the compact playground and reminder-sidebar composition");
assert.match(css, /max-width:620px[\s\S]*l3-p5-connection-layout\{grid-template-columns:1fr/, "Page 5 stacks the interactive connection regions on narrow screens");
assert.match(css, /l3-page-three \.l3-information-flow\{grid-template-columns:130px 72px minmax\(0,1fr\)/, "Page 3 reserves a real connector column");
assert.match(css, /l3-page-three \.l3-flow-arrows\{position:static/, "Page 3 arrows do not overlay either card");
assert.match(css, /l3-page-three \.l3-information-flow>\.l3-representation\{grid-column:3/, "Page 3 representation stays in its own grid column");

function leafPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? leafPaths(child, path) : [path];
  });
}
const locales = await Promise.all(["en", "zh", "fr", "de"].map(async (language) => JSON.parse(await read(`../src/locales/${language}/mission3.json`))));
const expected = leafPaths(locales[0]).sort();
for (const [index, locale] of locales.entries()) assert.deepEqual(leafPaths(locale).sort(), expected, `${["en", "zh", "fr", "de"][index]} Lesson 3 locale keys match`);

process.stdout.write("Lesson 3 Connecting the Tokens tests passed.\n");
