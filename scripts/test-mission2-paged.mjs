import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  getAvailableContext,
  getContextPredictions,
  moveContextWindow,
  resizeContextWindow,
} from "../src/mission2/useContextPlaygroundPredictions.js";

const prototypeSource = await readFile(new URL("../src/mission2/Mission2PagedPrototype.jsx", import.meta.url), "utf8");
const shellSource = await readFile(new URL("../src/mission1/MissionLessonShell.jsx", import.meta.url), "utf8");
const pagesSource = await readFile(new URL("../src/mission2/Mission2ContextPages.jsx", import.meta.url), "utf8");
const playgroundModelSource = await readFile(new URL("../src/mission2/useContextPlaygroundPredictions.js", import.meta.url), "utf8");
const quizCopySource = await readFile(new URL("../src/mission2/mission2QuizCopy.js", import.meta.url), "utf8");
const sharedQuizSource = await readFile(new URL("../src/mission1/Mission1PagedKnowledgeQuiz.jsx", import.meta.url), "utf8");
const sharedQuizCss = await readFile(new URL("../src/mission1/mission1Paged.css", import.meta.url), "utf8");
const sharedQuizTheme = await readFile(new URL("../src/pagedMissions/lessonQuizTheme.css", import.meta.url), "utf8");
const css = await readFile(new URL("../src/mission2/mission2Paged.css", import.meta.url), "utf8");
const appSource = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const courseSource = await readFile(new URL("../src/data/courseData.js", import.meta.url), "utf8");
const fallbackSource = await readFile(new URL("./create-spa-route-fallbacks.mjs", import.meta.url), "utf8");

assert.match(prototypeSource, /MISSION_2_PAGED_PAGES[\s\S]*context-basics[\s\S]*window[\s\S]*moving-window[\s\S]*outside[\s\S]*window-size[\s\S]*checkpoint[\s\S]*summary/, "all seven Reading Context pages are configured");
assert.match(prototypeSource, /MissionLessonShell/, "shared paged lesson shell is reused");
assert.match(prototypeSource, /import LessonPageHero from "\.\.\/pagedMissions\/LessonPageHero\.jsx"/, "Lesson 2 imports the shared page hero");
assert.match(prototypeSource, /pageHero=\{<LessonPageHero[\s\S]*lessonIndex=\{2\}[\s\S]*lessonCount=\{5\}[\s\S]*lessonName=\{t\("mission2\.shell\.topic"\)\}/, "all Lesson 2 pages render the shared hero with the fixed Lesson 2 metadata");
assert.match(prototypeSource, /title=\{t\(page\.titleKey\)\}[\s\S]*subtitle=\{heroSubtitle\}/, "the shared hero follows the active page title and subtitle");
assert.match(shellSource, /pageHero \? React\.cloneElement\(pageHero, \{ ref: headingRef \}\) : <header className="mission-lesson-paged__title">/, "the opt-in shared Hero replaces rather than duplicates the legacy H1 and retains page-change focus");
assert.match(prototypeSource, /currentPage === 2 \? t\("mission2\.page2\.introLead"\)/, "Page 2 uses the existing concise context-window subtitle");
assert.match(prototypeSource, /mission-2-reading-context/, "Lesson 2 uses its own scoped visual language");
for (const [component, page] of [
  ["Mission2OpeningPage", 1], ["Mission2WindowPage", 2], ["Mission2GrowingTextPage", 3],
  ["Mission2OutsidePage", 4], ["Mission2SizePage", 5], ["Mission2SummaryPage", 7]
]) assert.match(prototypeSource, new RegExp(`${component} active=\\{currentPage === ${page}\\}`), `${component} is mounted on Page ${page}`);
assert.doesNotMatch(prototypeSource, /canAdvance=/, "Lesson pages remain directly accessible without a page lock");
assert.match(prototypeSource, /recommendation[\s\S]*continueHere/, "skipping ahead uses the shared non-blocking recommendation notice");
assert.match(prototypeSource, /history\.pushState/, "page changes create browser history entries");
assert.match(prototypeSource, /addEventListener\("popstate"/, "Back and Forward restore query pages");
assert.match(prototypeSource, /REQUIRED_ACTIVITIES[\s\S]*move-window[\s\S]*show-boundary[\s\S]*grow-text[\s\S]*visible-clue[\s\S]*resize-window/, "completion still requires meaningful activities");
assert.match(prototypeSource, /quizResult === "correct"[\s\S]*visitedPages\.has\(7\)/, "the Lesson cannot complete before the checkpoint and final page");
assert.match(prototypeSource, /Mission1PagedKnowledgeQuiz active=\{currentPage === 6\}[\s\S]*pageNumber=\{6\}[\s\S]*showLesson1Visuals=\{false\}/, "Page 6 directly reuses the Lesson 1 checkpoint framework");
assert.match(prototypeSource, /pageQuizCopy = \{ \.\.\.quizCopy, quizTitle: quizCopy\.conceptCheckpoint \}/, "Page 6 keeps the short concept-checkpoint kicker instead of repeating the Hero title");
assert.match(prototypeSource, /hideNext=\{currentPage === 6\}/, "the Lesson-level Next control is hidden while the checkpoint is active");
assert.match(quizCopySource, /checkpointQuestions:[\s\S]*\[1, 2, 3, 4\][\s\S]*correct: \[1, 0, 1, 1\]/, "Lesson 2 config supplies four mechanism questions and their correct answers");
assert.match(sharedQuizSource, /questions\.length[\s\S]*answerState==="incorrect"[\s\S]*retry[\s\S]*finishCheckpoint/, "the shared framework derives its count and retains retry and finish behavior");
assert.match(sharedQuizCss, /mission-lesson-paged:is\(\.mission-1-paged,\.mission-2-paged\)[\s\S]*mission-checkpoint-options/, "Lessons 1 and 2 use the same checkpoint CSS");
assert.match(prototypeSource, /currentPage === 6 \? "lesson-quiz-layout" : ""/, "Lesson 2 explicitly opts its checkpoint route into the shared quiz visual system");
assert.match(sharedQuizTheme, /mission-checkpoint-layout\{[\s\S]*grid-template-columns:clamp\(220px,17vw,250px\) minmax\(0,1fr\)/, "the wide shared canvas keeps the Lesson 2 progress rail compact");

assert.match(pagesSource, /m2-context-meaning-board[\s\S]*m2-context-cases/, "Page 1 compares the same word in two contexts");
assert.match(pagesSource, /LessonQuestion number="1" label=\{t\("mission2\.page1\.eyebrow"\)\} \/>/, "Page 1 keeps its numbered kicker without repeating the full title");
for (const key of ["sentenceA", "sentenceB", "meaningA", "meaningB"]) assert.match(pagesSource, new RegExp(key), `Page 1 uses ${key} context copy`);
assert.match(pagesSource, /m2-context-mini-prompts[\s\S]*role="group"[\s\S]*aria-pressed/, "Page 1 includes a lightweight accessible prediction exploration");
assert.match(pagesSource, /is-correct[\s\S]*is-wrong[\s\S]*m2-context-choice-feedback[\s\S]*role="status"/, "Page 1 reports correct and incorrect choices accessibly");
assert.doesNotMatch(pagesSource, /Flashlight|m2-flashlight-scene/, "Page 1 no longer uses the flashlight-first metaphor");
assert.match(pagesSource, /import[\s\S]*ChevronDown[\s\S]*from "lucide-react"/, "every rendered Lesson 2 icon, including the technical-details chevron, is imported");
assert.match(pagesSource, /m2-context-window-frame[\s\S]*m2-playground-window/, "the thin context-boundary visual language is reused across teaching and playground pages");
assert.match(pagesSource, /LessonQuestion number="2" label=\{t\("mission2\.page2\.eyebrow"\)\} \/>/, "Page 2 keeps its numbered kicker without repeating the full title");
assert.match(pagesSource, /m2-context-sequence-grid[\s\S]*m2-context-sequence-zone is-outside[\s\S]*m2-context-sequence-zone is-window[\s\S]*m2-context-window-frame/, "Page 2 aligns outside and inside regions in a structural three-column diagram");
assert.match(pagesSource, /m2-context-mini-sequence[\s\S]*is-outside[\s\S]*is-window[\s\S]*tone-/, "Page 2 info strip includes a meaningful multicolour miniature context window");
assert.match(pagesSource, /details className="m2-context-keyword-card"[\s\S]*technicalOpen/, "Page 2 provides a stable collapsible keyword definition in a reserved grid column");
assert.match(pagesSource, /m2-context-surface-shape[\s\S]*<path d=/, "Page 2 uses a responsive SVG card shape for its stepped teaching surface");
assert.match(pagesSource, /m2-window-size-overview[\s\S]*\["small", "medium", "large"\]/, "Page 2 compares illustrative window capacities without product specifications");
assert.match(css, /m2-playground-token-track\{[^}]*overflow-x:auto/, "the interactive token track remains locally scrollable on narrow screens");
assert.match(pagesSource, /hole[\s\S]*kitchen[\s\S]*m2-context-distribution-grid[\s\S]*m2-prediction-bars/, "Page 3 compares two illustrative next-token distributions");
assert.match(pagesSource, /LessonQuestion number="3" label=\{t\("mission2\.page3\.eyebrow"\)\} \/>/, "Page 3 keeps its numbered kicker without repeating the full title");
assert.match(pagesSource, /m2-context-explanation-sidebar[\s\S]*m2-context-key-idea[\s\S]*m2-context-matters-summary/, "Page 3 explains why changed context changes predictions");
assert.match(pagesSource, /m2-too-long-mini-card[\s\S]*m2-limit-mini-visual/, "Page 4 opens with a miniature long-sequence context visual");
assert.match(pagesSource, /LessonQuestion number="4" label=\{t\("mission2\.page4\.eyebrow"\)\} \/>/, "Page 4 keeps its numbered kicker without repeating the full title");
assert.match(pagesSource, /m2-long-sequence[\s\S]*is-inside[\s\S]*is-outside[\s\S]*m2-long-sequence-labels/, "Page 4 clearly separates available and outside tokens");
assert.match(pagesSource, /\["sequence", "window", "model", "probabilities"\][\s\S]*m2-abstract-model[\s\S]*m2-flow-probabilities/, "Page 4 connects the context limit to an abstract LLM and probability distribution");
assert.match(pagesSource, /details className="m2-context-size-strip"[\s\S]*sizesExpanded/, "Page 4 provides a lightweight expandable context-size explanation");
assert.match(pagesSource, /PLAYGROUND_WINDOW_SIZES = \[5, 7, 10, 12\][\s\S]*windowStart[\s\S]*windowSize/, "Page 5 has explicit movable and resizable context-window state");
assert.match(pagesSource, /LessonQuestion number="5" label=\{t\("mission2\.page5\.eyebrow"\)\} \/>/, "Page 5 keeps its numbered interactive kicker without repeating the full title");
assert.match(pagesSource, /moveWindow\(-1\)[\s\S]*moveWindow\(1\)[\s\S]*resetWindow/, "Page 5 supports moving left, moving right and resetting");
assert.match(pagesSource, /availableTokens[\s\S]*useContextPlaygroundPredictions[\s\S]*m2-playground-predictions/, "Page 5 keeps the available-token list and model output synchronized");
assert.match(pagesSource, /aria-pressed=\{windowSize === size\}/, "Page 5 size controls expose their selected state accessibly");
assert.match(pagesSource, /onPointerDown=\{startDrag\}[\s\S]*onPointerMove=\{continueDrag\}/, "Page 5 offers pointer dragging as an enhancement while retaining buttons");
assert.match(playgroundModelSource, /fetch\("\/api\/next-token"[\s\S]*top_k: 5/, "Page 5 uses the existing real next-token API");
assert.match(playgroundModelSource, /AbortController[\s\S]*requestRef[\s\S]*sessionRef/, "Page 5 cancels stale model requests safely");
assert.doesNotMatch(playgroundModelSource, /Math\.random/, "Page 5 does not fabricate random predictions");
assert.match(pagesSource, /Finding Helpful Clues|page7\.nextTitle/, "the final page follows the checkpoint and leads to the next lesson");
assert.match(pagesSource, /Mission2SummaryPage[\s\S]*LessonSummaryPage[\s\S]*pageNumber="7"[\s\S]*mission2\.page7\.eyebrow/, "Page 7 uses the shared summary scaffold with its numbered kicker");
for (const number of [1, 2, 3, 4]) assert.match(pagesSource, new RegExp(`mission2\\.page7\\.idea${number}Title`), `Page 7 includes summary idea ${number}`);
assert.doesNotMatch(pagesSource, /Mission2SummaryPage[\s\S]*?<h1/, "Page 7 leaves its only H1 to the shared Page Hero");
assert.doesNotMatch(pagesSource, /temperature|sampling|hallucination|bias/i, "Reading Context does not introduce unrelated later-course concepts");
assert.match(pagesSource, /details className="m2-context-size-strip"[\s\S]*summary/, "Page 4 uses an accessible native disclosure for optional detail");
assert.match(pagesSource, /role="group"/, "interactive controls expose grouped semantics");

assert.match(css, /mission-2-reading-context/, "new CSS is scoped to Lesson 2");
assert.match(css, /m2-reading-page-6 \.lesson-page-hero\{display:grid!important\}/, "Lesson 2 Page 6 keeps the shared Hero visible without changing the global quiz rule");
assert.match(css, /grid-auto-columns:var\(--token-size\)/, "tokens and the context frame share one sizing system");
assert.match(css, /--window-start\) \* var\(--token-unit\)/, "context-frame position follows the token grid coordinates");
assert.doesNotMatch(css, /^(?:\.card|\.button|\.panel|\.robot|\.scene|\.token|\.progress|section|img)(?:\s|\{|\.|#|:)/m, "no new unscoped generic CSS selectors exist");
for (const width of [820, 620]) assert.match(css, new RegExp(`max-width:${width}px`), `${width}px Reading Context breakpoint exists`);
assert.match(css, /prefers-reduced-motion:reduce/, "reduced motion is respected");
assert.match(css, /m2-context-cases\{display:grid;grid-template-columns:1fr 1fr/, "Page 1 contexts sit side by side on desktop");
assert.match(css, /max-width:760px[\s\S]*m2-context-cases\{grid-template-columns:1fr\}/, "Page 1 contexts stack responsively");
assert.match(pagesSource, /m2-context-composition[\s\S]*m2-context-teaching-surface[\s\S]*m2-context-keyword-slot[\s\S]*m2-context-keyword-card/, "Page 2 separates the fixed teaching surface from its keyword overlay slot");
assert.match(css, /m2-context-keyword-slot\{position:absolute;[^}]*top:var\(--keyword-top\);right:var\(--keyword-right\);width:var\(--keyword-width\);height:var\(--keyword-expanded-height\)/, "Page 2 keyword expansion cannot participate in document flow");
assert.match(css, /m2-context-teaching-surface\{position:relative;display:grid;grid-template-rows:220px auto auto;[^}]*min-height:500px/, "Page 2 reserves stable teaching geometry for the expanded keyword card");
assert.match(css, /m2-context-sequence-grid\{[^}]*grid-template-columns:minmax\(205px,1fr\) auto minmax\(190px,1fr\)/, "Page 2 desktop token diagram uses three aligned columns");
assert.match(css, /m2-context-mini-sequence \.tone-0[\s\S]*tone-2[\s\S]*tone-4/, "Page 2 miniature window progresses from lavender to blue to green");
assert.match(css, /m2-playground-surface\{display:grid[\s\S]*background:rgba\(255,255,255,\.95\)/, "Page 5 uses a distinct near-white teaching surface");
assert.match(css, /m2-playground-window\{[^}]*border:1\.75px solid #7153dc/, "Page 5 reuses the thin context-window frame language");
assert.match(css, /m2-playground-predictions li:nth-child\(5\) i/, "Page 5 renders five distinct prediction bar colours");
assert.match(css, /max-width:980px[\s\S]*m2-playground-results\{grid-template-columns:1fr\}/, "Page 5 result panels stack responsively");
assert.match(css, /m2-context-limit-flow\{display:grid;grid-template-columns:/, "Page 4 uses a responsive four-stage mechanism flow");
assert.match(css, /m2-flow-probabilities i:nth-child\(5\)/, "Page 4 renders a multicolour probability distribution without a generic trend icon");
assert.match(css, /m2-context-distribution-grid\{display:grid;grid-template-columns:[^}]+/, "Page 3 uses a three-column comparison layout on desktop");
assert.match(css, /m2-prediction-bars i\{display:block;height:100%;border-radius:inherit\}/, "Page 3 uses custom rounded probability bars");
assert.match(css, /Pages 1–3: badge, kicker and intro[\s\S]*grid-template-columns:54px minmax\(0,1fr\)[\s\S]*m2-reading-question\{display:contents\}/, "Pages 1–3 keep the badge, kicker and intro in one compact grid group");
assert.match(css, /m2-reading-intro\{[\s\S]*grid-column:2;[\s\S]*margin:6px 0 0/, "Pages 1–3 use a six-pixel kicker-to-intro gap");

assert.match(appSource, /\/mission\/2-prediction-paged/, "existing safe route remains registered");
assert.match(fallbackSource, /mission\/2-prediction-paged/, "direct-load fallback remains generated");
assert.match(courseSource, /route:\s*"\/mission\/2-prediction-paged"/, "course route remains stable during the Lesson-only rewrite");

function leafPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? leafPaths(child, path) : [path];
  });
}
const locales = await Promise.all(["en", "zh", "fr", "de"].map(async (language) => JSON.parse(await readFile(new URL(`../src/locales/${language}/mission2.json`, import.meta.url), "utf8"))));
const expectedKeys = leafPaths(locales[0]).sort();
for (const [index, locale] of locales.entries()) assert.deepEqual(leafPaths(locale).sort(), expectedKeys, `${["en", "zh", "fr", "de"][index]} Lesson 2 locale keys match`);
assert.equal(Object.keys(locales[0].page6).filter((key) => /^q\dPrompt$/.test(key)).length, 4, "Lesson 2 checkpoint has four translated questions");
assert.equal(locales[0].page1.title, "What is context?", "Page 1 is titled around context itself");
assert.doesNotMatch(JSON.stringify(locales.map((locale) => locale.page1)), /flashlight|Taschenlampe|lampe|手电筒/i, "the removed flashlight metaphor does not remain in Page 1 copy");
for (const [index, locale] of locales.entries()) {
  const language = ["en", "zh", "fr", "de"][index];
  assert.ok(locale.page1.englishExampleLabel, `${language} labels its locale-specific ambiguity fixture`);
  assert.ok(locale.page2.windowTokens.split("|").length >= 6, `${language} Page 2 provides a complete locale-specific context sequence`);
  assert.ok(locale.page4.sequenceTokens.trim().split(/\s+/).length >= 18, `${language} Page 4 provides a complete localized long sequence`);
  assert.ok(Object.values(locale.page3.candidates).every(Boolean), `${language} Page 3 candidate labels are localized`);
}
assert.equal(new Set(locales.map((locale) => locale.page2.windowTokens)).size, 4, "Lesson 2 context examples differ by locale");
assert.equal(locales[0].page1.bank, "bank", "English keeps the original bank ambiguity example");
assert.match(`${locales[0].page1.sentenceABefore} ${locales[0].page1.bank} ${locales[0].page1.sentenceAAfter}`, /bank.*deposit/i);
assert.doesNotMatch(Object.values(locales[1].page1).join(" "), /\bbank\b/i, "Chinese does not depend on the English bank ambiguity");
for (const expected of ["苹果", "水果", "科技公司"]) assert.match(JSON.stringify(locales[1].page1), new RegExp(expected), `Chinese Page 1 includes ${expected}`);
assert.match(prototypeSource, /const \{ language, t \} = useI18n\(\)/, "Lesson 2 selects locale-specific teaching fixtures semantically");
assert.match(prototypeSource, /Mission2OpeningPage active=\{currentPage === 1\} language=\{language\}/, "Lesson 2 passes the runtime locale without using display strings as logic");

const playgroundTokens = "Once upon a time there was a curious little reader who loved to learn new things every day in a far away land".split(" ");
assert.equal(moveContextWindow(7, 7, playgroundTokens.length, -1), 6, "Move left shifts the context start by one token");
assert.equal(moveContextWindow(7, 7, playgroundTokens.length, 1), 8, "Move right shifts the context start by one token");
assert.deepEqual(resizeContextWindow(18, 12, playgroundTokens.length), { start:11, size:12 }, "Size 12 clamps the window without losing its requested size");
assert.equal(getAvailableContext(playgroundTokens, 7, 5).length, 5, "Size 5 exposes exactly five available tokens");
assert.equal(getAvailableContext(playgroundTokens, 7, 12).length, 12, "Size 12 exposes exactly twelve available tokens");
assert.deepEqual(getAvailableContext(playgroundTokens, 7, 7), ["curious", "little", "reader", "who", "loved", "to", "learn"], "Reset state restores the intended seven-token context");

const originalFetch = globalThis.fetch;
let capturedPredictionRequest;
globalThis.fetch = async (url, options) => {
  capturedPredictionRequest = { url, options };
  return { ok:true, json:async () => ({ candidates:[{ token_id:1, raw_token:" story", display_token:"␠story", probability:.2 }] }) };
};
const requestedCandidates = await getContextPredictions({ tokens:["curious", "reader"], sessionId:"mission2-test" });
globalThis.fetch = originalFetch;
assert.equal(capturedPredictionRequest.url, "/api/next-token", "the playground calls the existing prediction endpoint");
assert.equal(JSON.parse(capturedPredictionRequest.options.body).text, "curious reader", "only the currently available context is sent to the model");
assert.equal(requestedCandidates[0].display_token, "␠story", "real candidate data is returned to the UI adapter unchanged");

process.stdout.write("Lesson 2 Reading Context tests passed.\n");
