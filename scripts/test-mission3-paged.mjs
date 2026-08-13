import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PAGED_MISSIONS } from "../src/pagedMissions/missionCurriculumData.js";
import { analyseConnections, teachingTokenize } from "../src/mission3/lesson3ConnectionAnalysis.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [shell, pages, data, css, app, course, mission2, mission4, mission5, quizCopy, sharedQuiz, sharedQuizTheme] = await Promise.all([
  read("../src/mission3/Lesson3Paged.jsx"),
  read("../src/mission3/Lesson3Pages.jsx"),
  read("../src/mission3/lesson3TeachingData.js"),
  read("../src/mission3/lesson3Paged.css"),
  read("../src/main.jsx"),
  read("../src/data/courseData.js"),
  read("../src/mission2/Mission2PagedPrototype.jsx"),
  read("../src/mission4/Lesson4Paged.jsx"),
  read("../src/mission5/Lesson5Paged.jsx"),
  read("../src/mission3/mission3QuizCopy.js"),
  read("../src/mission1/Mission1PagedKnowledgeQuiz.jsx"),
  read("../src/pagedMissions/lessonQuizTheme.css")
]);

assert.equal(PAGED_MISSIONS[3].topic, "Connecting the Tokens");
assert.equal(PAGED_MISSIONS[3].pages.length, 7);
assert.deepEqual(PAGED_MISSIONS[3].pages.map((page) => page[0]), ["connections", "attention", "representation", "position", "process", "quiz", "summary"]);
assert.match(course, /How does a language model connect words together\?[\s\S]*Connecting the Tokens/);
assert.match(app, /3-hallucination-paged"\) page = <Lesson3Paged/);
assert.match(app, /"\/mission\/3-hallucination-paged": \{ number: 3, total: 7/, "the global lesson header reports Page 6 of 7 and renders seven progress segments");

for (let page = 1; page <= 5; page += 1) assert.match(shell, new RegExp(`Lesson3Page${page} active=\\{currentPage===${page}\\}`));
assert.match(shell, /Mission1PagedKnowledgeQuiz active=\{currentPage===6\}/, "Page 6 reuses the shared Lesson 1 quiz framework");
assert.match(shell, /Lesson3Page7 active=\{currentPage===7\}/, "the existing summary moves to Page 7");
assert.match(shell, /import LessonPageHero from "\.\.\/pagedMissions\/LessonPageHero\.jsx"/);
assert.match(shell, /pageHero=\{<LessonPageHero lessonIndex=\{3\} lessonCount=\{5\} lessonProgressLabel=\{t\("common\.lesson\.progress",\{current:3,total:5\}\)\} lessonName=\{t\("mission3\.shell\.topic"\)\} title=\{t\(page\[1\]\)\} subtitle=\{t\(page\[2\]\)\}/, "all seven Lesson 3 routes render the shared page hero from the active page data");
assert.match(shell, /copy=\{\{\.\.\.quizCopy,quizTitle:quizCopy\.conceptCheckpoint\}\}[\s\S]*showTitle=\{false\}/, "Page 6 suppresses only the duplicate quiz title while retaining the shared quiz framework");
assert.match(sharedQuiz, /showCorrectAnswer=false,showTitle=true/, "the shared quiz keeps its title by default for other lessons");
assert.match(sharedQuiz, /<span>\{pageNumber\}<\/span>\{showTitle&&copy\.quizTitle\}/, "the shared quiz can hide only its title text while retaining the numbered badge");
assert.match(css, /\.lesson-3-paged \.lesson-page-hero__title-shell\{display:inline-block;width:fit-content;max-width:100%;border:2px solid var\(--lesson-hero-border,#c8bcf4\);border-radius:14px;padding:4px 10px 5px;background:rgba\(255,255,255,\.08\)\}/, "all Lesson 3 routes preserve the complete shared lavender title outline");
assert.doesNotMatch(css, /lesson-quiz-layout \.mission-paged-page-heading \.course-section-head h2>span\{display:none\}/, "the Lesson 3 quiz keeps its numbered badge visible");
assert.match(shell, /history\.pushState/);
assert.match(shell, /addEventListener\("popstate"/);
assert.doesNotMatch(shell, /canAdvance=/, "page navigation remains non-blocking");
assert.match(shell, /REQUIRED = \["connection-strengths","contextual-build","transformer-process","summary-visited"\]/);
assert.match(shell, /REQUIRED\.every[\s\S]*visited\.has\(pageCount\)/, "direct final-page access cannot complete the lesson");

assert.match(pages, /l3-context-connections-page[\s\S]*bridgeFromLesson2[\s\S]*bridgeForward/, "Page 1 bridges directly from Lesson 2 context to connections");
assert.doesNotMatch(pages.match(/export function Lesson3Page1[\s\S]*?export function Lesson3Page2/)?.[0] || "", /term="Transformer"|runTransformer|l3-transformer-stage/, "Page 1 no longer introduces the Transformer or its old activity");
assert.doesNotMatch(pages, /Page1[\s\S]{0,3000}(?:check answer|tryAgain|correct answer)/i, "Page 1 is not a mandatory clue quiz");
assert.match(pages, /localizedTokens\(t, "mission3\.page1\.exampleTokens"\)[\s\S]*l3-p1-token-row/, "Page 1 presents the locale-specific six-token sentence");
assert.match(pages, /l3-p1-context-bracket[\s\S]*availableContext/, "Page 1 visually reconnects the tokens to the available context");
assert.match(pages, /l3-p1-connection-map[\s\S]*marker id="l3-p1-arrow"[\s\S]*l3-p1-target/, "Page 1 uses SVG arrows into the target token");
assert.match(pages, /keywordTerm[\s\S]*keywordNote[\s\S]*keywordDefinition/, "Page 1 has one expandable Connection keyword card");
assert.match(pages, /l3-p1-key-idea[\s\S]*keyIdea/, "Page 1 ends with one focused key idea");
const page1Source = pages.match(/export function Lesson3Page1[\s\S]*?export function Lesson3Page2/)?.[0] || "";
assert.match(page1Source, /l3-p1-number">1<[\s\S]*l3-section-kicker/);
assert.ok(page1Source.indexOf("l3-p1-teaching-surface") < page1Source.indexOf("l3-p1-hero"), "Page 1 section header is inside the main teaching card");
assert.doesNotMatch(page1Source, /<h1/, "Page 1 leaves the only full page title to LessonPageHero");
assert.match(pages, /l3-p1-composition[\s\S]*l3-p1-teaching-surface[\s\S]*l3-p1-keyword-slot/, "Page 1 keeps the teaching surface and keyword together in one composition");
assert.doesNotMatch(page1Source, /l3-p1-surface-shape/, "Page 1 no longer renders the surrounding notched outline");
assert.match(css, /l3-p1-composition\{display:grid;grid-template-columns:minmax\(0,1fr\) 300px/, "Page 1 reserves a separate right column for the keyword card");
assert.match(css, /l3-p1-keyword-slot\{position:static;width:300px/, "the Page 1 keyword stays in normal layout flow and cannot overlap the teaching card");
assert.doesNotMatch(page1Source, /l3-p1-hero-art|mission3-robot-hallucination/, "Page 1 no longer renders a hero robot");
assert.doesNotMatch(page1Source, /nextTeaser|l3-p1-next-teaser/, "Page 1 no longer renders the teaser that crowded the notch");
assert.match(css, /l3-p1-composition::before,[\s\S]*l3-p1-composition::after\{display:none!important/, "Page 1 removes the duplicate outer decoration around the two cards");
assert.match(css, /l3-context-connections-page\{border:0\}/, "Page 1 removes the distracting outer page line");
assert.match(css, /l3-context-connections-page::after\{display:none\}/, "Page 1 removes the surrounding decorative ring");
assert.match(css, /l3-p1-explanation>\.l3-p1-context-visual\{[^}]*border:0/, "Page 1 removes the outline around the available-context visual");
assert.match(css, /--l3-p1-keyword-top:0px/, "Page 1 aligns the keyword card with the teaching surface top edge");
assert.match(page1Source, /l3-p1-explanation[\s\S]*l3-p1-token-row[\s\S]*l3-p1-context-bracket[\s\S]*l3-p1-flow/, "Page 1 places the token row below the opening explanation and keeps Available context attached beneath it");
assert.doesNotMatch(page1Source, /l3-p1-flow-copy[\s\S]*l3-p1-context-bracket/, "Page 1 does not move Available context into the later flow explanation");
assert.match(css, /l3-p1-keyword-slot \.l3-technical-word\[open\]\{height:var\(--l3-p1-keyword-expanded-height\)\}/, "the expanded keyword card is sized to the reserved notch without clipping");
assert.match(shell, /progressPageCount=\{progressPageCount\}/);
assert.match(shell, /const progressPageCount=7/);
const page2Source = pages.match(/export function Lesson3Page2[\s\S]*?export function Lesson3Page3/)?.[0] || "";
assert.match(page2Source, /l3-p2-number">2<[\s\S]*l3-section-kicker/);
assert.ok(page2Source.indexOf("l3-p2-teaching-surface") < page2Source.indexOf("l3-p2-hero"), "Page 2 section header is inside the main teaching card");
assert.doesNotMatch(page2Source, /<h1/, "Page 2 leaves the only full page title to LessonPageHero");
assert.match(page2Source, /l3-share-information-page[\s\S]*simpleTitle[\s\S]*l3-p2-token-visual/, "Page 2 uses the requested teaching-first composition");
assert.match(page2Source, /localizedTokens\(t, "mission3\.page1\.exampleTokens"\)[\s\S]*index === 3 \? "is-target"/, "Page 2 highlights the locale-specific token at position 4 as the target");
assert.match(page2Source, /marker id="l3-p2-arrow"[\s\S]*is-strong[\s\S]*is-medium[\s\S]*is-weak/, "Page 2 distinguishes stronger, medium and weaker illustrative contributions");
assert.equal((page2Source.match(/420 2[67]/g) || []).length, 5, "all five contribution arrows terminate at the opened target");
assert.match(page2Source, /legendTitle[\s\S]*legendStrong[\s\S]*legendMedium[\s\S]*legendWeak[\s\S]*callout/, "Page 2 explains the connection styles without numeric scores");
assert.match(page2Source, /step1Title[\s\S]*step2Title[\s\S]*step3Title[\s\S]*resultTitle/, "Page 2 presents the three-step mechanism and result in sequence");
assert.match(page2Source, /id="l3-page-2-attention"[\s\S]*attentionDefinition[\s\S]*id="l3-page-2-transformer"[\s\S]*transformerDefinition/, "Page 2 uses the shared expandable keyword component for Attention and Transformer");
assert.doesNotMatch(page2Source, /showConnections|l3-strength-sources|l3-connection-map/, "Page 2 removes the old interaction and dashboard-like connection map");
assert.doesNotMatch(pages + data, /(?:attention|connection)\s*(?:weight|score)?\s*[:=]\s*0?\.\d+/i, "no fake attention values");
const page3Source = pages.match(/export function Lesson3Page3[\s\S]*?function PositionComparison/)?.[0] || "";
assert.match(page3Source, /l3-p3-number">3<[\s\S]*l3-section-kicker/);
assert.ok(page3Source.indexOf("l3-p3-teaching-surface") < page3Source.indexOf("l3-p3-hero"), "Page 3 section header is inside the main teaching card");
assert.doesNotMatch(page3Source, /<h1/, "Page 3 leaves the only full page title to LessonPageHero");
assert.match(page3Source, /localizedTokens\(t, "mission3\.page3\.exampleTokens"\)/, "Page 3 uses the locale-specific ten-token sentence");
assert.match(page3Source, /index === 6 \? "is-focus"[\s\S]*index > 6 \? "is-unavailable"/, "Page 3 marks it at position 7 and prevents future positions from appearing available");
assert.match(page3Source, /l3-p3-context-status[\s\S]*availableContext[\s\S]*notAvailable/, "Page 3 distinguishes available positions 1–7 from unavailable positions 8–10");
assert.match(page3Source, /const sources = tokens\.slice\(0, 6\)/, "the contribution diagram only uses earlier positions, independent of language");
assert.equal((page3Source.match(/<path className="is-(?:strong|medium|weak|veryweak)"/g) || []).length, 6, "Page 3 draws six contribution arrows");
assert.equal((page3Source.match(/[C ]3(?:65|67|70|90|93|95) 118"/g) || []).length, 6, "all six paths stop at the edge of the it target instead of disappearing beneath it");
assert.match(css, /l3-p3-arrow-map>svg \.is-strong\{[^}]*marker-end:url\(#l3-p3-arrow-strong\)/, "strong contribution paths carry inward arrowheads");
assert.match(css, /l3-p3-arrow-map>svg \.is-medium\{[^}]*marker-end:url\(#l3-p3-arrow-medium\)/, "medium contribution paths carry inward arrowheads");
assert.match(css, /l3-p3-arrow-map>svg \.is-weak\{[^}]*marker-end:url\(#l3-p3-arrow-weak\)/, "weak contribution paths carry inward arrowheads");
assert.match(css, /l3-p3-arrow-map>svg \.is-veryweak\{[^}]*marker-end:url\(#l3-p3-arrow-weak\)/, "very weak contribution paths carry inward arrowheads");
assert.match(page3Source, /\["Strong","Medium","Weak","VeryWeak"\][\s\S]*mission3\.page3\.legend\$\{level\}/, "Page 3 includes the compact four-level contribution legend");
assert.match(page3Source, /keywordTerm[\s\S]*keywordNote[\s\S]*keywordDefinition[\s\S]*whyBody[\s\S]*nextTeaser/, "Page 3 includes Attention pattern, the simplified-visual disclaimer, why-it-matters and the next-page teaser");
assert.doesNotMatch(page3Source, /onClick|aria-pressed|fetch\(|probability|percent/i, "Page 3 remains a static teaching visual without fake measurements");
const page4Source = pages.match(/function PositionComparison[\s\S]*?function PlaygroundTokens/)?.[0] || "";
assert.match(page4Source, /l3-p4-number">4<[\s\S]*l3-section-kicker/);
assert.ok(page4Source.indexOf("l3-p4-teaching-surface") < page4Source.indexOf("l3-p4-hero"), "Page 4 section header is inside the main teaching card");
assert.doesNotMatch(page4Source, /<h1/, "Page 4 leaves the only full page title to LessonPageHero");
assert.match(page4Source, /mission3\.page4\.example\$\{variant\.toUpperCase\(\)\}Tokens/, "Page 4 compares two locale-specific six-token orders");
assert.match(page4Source, /dogPosition = variant === "a" \? 2 : 5[\s\S]*target = tokens\[dogPosition - 1\]/, "Page 4 identifies the comparison target by stable position rather than translated text");
assert.equal((page4Source.match(/<PositionComparison variant=/g) || []).length, 2, "Page 4 presents two equal comparison panels");
assert.match(page4Source, /l3-p4-token-row[\s\S]*l3-p4-connection-map[\s\S]*markerEnd/, "Page 4 shows token positions and inward relationship arrows");
assert.equal((page4Source.match(/ 78"/g) || []).length, 10, "both Page 4 diagrams stop all arrowheads above the focus-token card");
assert.match(page4Source, /\["Strong", "Medium", "Weak", "VeryWeak"\][\s\S]*mission3\.page4\.legend\$\{level\}/, "Page 4 includes the compact four-level connection legend");
assert.match(page4Source, /positionTerm[\s\S]*positionDefinition[\s\S]*positionalTerm[\s\S]*positionalDefinition/, "Page 4 includes Position and Positional information keyword cards");
assert.match(page4Source, /sameOrder[\s\S]*differentConnections[\s\S]*differentRepresentation/, "Page 4 closes with the requested order-to-representation chain");
assert.doesNotMatch(page4Source, /onClick|aria-pressed|chooseActor|who-choices|tryAgain/, "Page 4 remains a static teaching comparison");
assert.match(pages, /localizedPlaygroundSentences[\s\S]*selectedSentence[\s\S]*customText/, "Page 5 switches between localized presets and a custom sentence using real state");
assert.match(pages, /PageSectionHeading number="5" label=\{t\("mission3\.page5\.tryTitle"\)\}/, "Page 5 keeps a compact numbered activity lead-in below the shared hero");
const page5Source = pages.match(/export function Lesson3Page5[\s\S]*?export function Lesson3Page7/)?.[0] || "";
assert.ok(page5Source.indexOf("l3-p5-main") < page5Source.indexOf("PageSectionHeading"), "Page 5 section header is inside the interaction card");
assert.match(pages, /aria-pressed=\{index === focusIndex\}[\s\S]*chooseFocus/, "Page 5 makes every focus token keyboard-operable");
assert.match(pages, /analyseConnections[\s\S]*markerEnd="url\(#l3-p5-arrow\)"/, "Page 5 renders deterministic causal connections with inward SVG arrowheads");
assert.match(pages, /500 112/, "Page 5 arrows stop above the movable focus-token card");
assert.match(css, /l3-p5-custom\{grid-template-columns:minmax\(245px,\.72fr\) minmax\(420px,1\.8fr\)/, "Page 5 Step 4 keeps its copy and input action in a stable horizontal layout");
assert.match(css, /l3-p5-custom form\{display:grid;width:100%;min-width:0;grid-template-columns:minmax\(0,1fr\) max-content/, "Page 5 Step 4 gives the text input the available width without pushing it to the right");
assert.match(css, /l3-p5-custom form>label\{display:none\}/, "Page 5 Step 4 keeps the accessible label from becoming an unintended grid cell");
assert.match(pages, /teachingTokenize[\s\S]*setSelectedSentence\("custom"\)/, "Page 5 custom analysis updates the token and focus state");
assert.match(pages, /mission3\.activeUi\.focus/, "Page 5 localizes the active focus label");
assert.equal((pages.match(/mission3\.activeUi\.step/g) || []).length, 4, "Page 5 localizes all four step labels");
assert.match(pages, /visualStart=\{t\("mission3\.activeUi\.visualTokens"\)\}[\s\S]*visualEnd=\{t\("mission3\.activeUi\.visualUpdated"\)\}/, "the active Transformer diagram localizes its surrounding labels");
assert.match(pages, /setErrorType\("emptyError"\)[\s\S]*setErrorType\("longError"\)[\s\S]*t\(`mission3\.page5\.\$\{errorType\}`\)/, "Page 5 stores stable validation types and translates them at render time");
assert.doesNotMatch(pages, /setError\(t\(/, "Page 5 does not store translated validation text in state");
assert.match(pages, /simplifiedLabel[\s\S]*page5\.accuracy/, "Page 5 carries an accuracy boundary");

for (const text of ["今天我们去公园散步", "你好你吃了吗"]) {
  const tokens = teachingTokenize(text);
  const focusIndex = tokens.length - 1;
  const positions = tokens.map((_, index) => index + 1);
  const analysis = analyseConnections({ text, tokens, focusIndex });
  assert.ok(tokens.length > 1, `Chinese custom input creates multiple display units: ${text}`);
  assert.ok(tokens.every((token) => token.length > 0), `Chinese custom input has no empty labels: ${text}`);
  assert.deepEqual(positions, Array.from({ length: tokens.length }, (_, index) => index + 1), `Chinese custom input keeps stable positions: ${text}`);
  assert.equal(analysis.connectionPattern.length, focusIndex, `Chinese custom input creates connections to the selectable final focus item: ${text}`);
}

assert.match(pages, /export function Lesson3Page7[\s\S]*LessonSummaryPage[\s\S]*pageNumber="7"[\s\S]*mission3\.page7\.recap/, "Page 7 uses the shared summary scaffold and preserves the prediction-readiness recap");
for (const number of [1, 2, 3, 4]) assert.match(pages, new RegExp(`mission3\\.page7\\.idea${number}Title`), `Page 7 includes summary idea ${number}`);
assert.doesNotMatch(pages, /Lesson3Page7[\s\S]*SummarySidebar/, "Page 7 no longer places recap content in a competing white sidebar");
assert.doesNotMatch(pages, /<h1/, "Lesson 3 content pages do not duplicate the shared page title");
assert.match(shell, /hideNext=\{currentPage===6\}/, "the shell Next button is hidden while the quiz owns progression");
assert.match(shell, /onContinue=\{\(\)=>changePage\(7\)\}/, "finishing the checkpoint continues to Page 7");
assert.match(shell, /quizResult==="correct"/, "lesson completion requires successful quiz completion");
assert.match(quizCopy, /\[1, 2, 3, 4\]\.map/, "Lesson 3 supplies four questions to the shared quiz");
assert.match(quizCopy, /correct: \[0, 1, 0, 1\]\[number - 1\]/, "the four requested correct answers are configured");
assert.match(sharedQuiz, /questions\.length/, "the shared quiz derives all counts from its question data");
assert.match(sharedQuiz, /answerState==="incorrect"[\s\S]*onClick=\{retry\}/, "an incorrect answer exposes Try again and resets through the shared flow");
assert.match(shell, /skipAction=\{currentPage===6\?\{label:t\("mission3\.skipQuiz"\),onClick:\(\)=>changePage\(7\)\}:null\}/, "Lesson 3 keeps its existing quiz skip route");
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
assert.match(css, /Shared LessonPageHero owns the single page title[\s\S]*\.lesson-3-paged \.l3-p1-hero,[\s\S]*\.lesson-3-paged \.l3-p4-hero\{display:block;min-height:0;grid-template-columns:none\}/, "legacy Page 1–4 hero containers cannot override the compact section lead-ins");
assert.match(css, /Lesson 3 consistency repair:[\s\S]*\.lesson-3-paged \.lesson-3-page\{[\s\S]*background:transparent;[\s\S]*box-shadow:none/, "Lesson 3 keeps the course canvas continuous instead of painting a page-sized gradient patch");
assert.match(css, /l3-p1-teaching-surface,[\s\S]*l3-p5-main\{[\s\S]*border-radius:28px;[\s\S]*linear-gradient\(135deg,/, "Pages 1–5 place the retained pastel gradient on the main card");
assert.match(css, /section-header polish:[\s\S]*l3-page-representation \.mission-lesson-paged__content\{background:transparent\}/, "Page 3 removes the oversized gradient from the page canvas");
assert.match(css, /section-header polish:[\s\S]*l3-section-kicker\{margin:0 0 6px\}/, "Lesson 3 section kickers stay close to their short intro copy");
assert.match(css, /One section-header rhythm across Pages 1–7:[\s\S]*l3-page-section-heading\{margin-bottom:8px\}[\s\S]*mission-checkpoint-banner>div:first-child\{gap:6px\}/, "Pages 1–7 keep the kicker and intro tight while preserving space before content");
assert.match(css, /p:first-of-type\{[\s\S]*font-weight:700[\s\S]*p:last-of-type\{[\s\S]*font-weight:500/, "Lesson 3 card intros use semibold then regular hierarchy");
assert.match(css, /Page 6 keeps only its section-heading geometry; the shared Quiz theme owns its shell/, "Page 6 keeps only its content-specific heading geometry");
assert.doesNotMatch(css, /lesson-quiz-layout \.mission-knowledge-quiz\{/, "Lesson 3 no longer owns a competing quiz colour shell");
assert.match(sharedQuizTheme, /linear-gradient\(125deg,var\(--quiz-shell-from\),var\(--quiz-shell-mid\) 57%,var\(--quiz-shell-to\)\)/, "Page 6 receives the shared cool quiz shell");
assert.match(css, /lesson-quiz-layout \.mission-paged-page-heading \.course-section-head h2>span\{[\s\S]*width:58px;[\s\S]*height:58px/, "the Page 6 badge matches the normal Lesson 3 section badge size");

function leafPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? leafPaths(child, path) : [path];
  });
}
const locales = await Promise.all(["en", "zh", "fr", "de"].map(async (language) => JSON.parse(await read(`../src/locales/${language}/mission3.json`))));
const expected = leafPaths(locales[0]).sort();
for (const [index, locale] of locales.entries()) assert.deepEqual(leafPaths(locale).sort(), expected, `${["en", "zh", "fr", "de"][index]} Lesson 3 locale keys match`);
for (const [index, locale] of locales.entries()) {
  const language = ["en", "zh", "fr", "de"][index];
  assert.equal(locale.page1.exampleTokens.split("|").length, 6, `${language} Page 1 keeps six semantic token positions`);
  assert.equal(locale.page3.exampleTokens.split("|").length, 10, `${language} Page 3 keeps ten semantic token positions`);
  assert.equal(locale.page4.exampleATokens.split("|").length, 6, `${language} Page 4 example A keeps six positions`);
  assert.equal(locale.page4.exampleBTokens.split("|").length, 6, `${language} Page 4 example B keeps six positions`);
  assert.ok(locale.page5.presets.A.text && locale.page5.presets.B.text, `${language} Page 5 presets are localized`);
}

process.stdout.write("Lesson 3 Connecting the Tokens tests passed.\n");
