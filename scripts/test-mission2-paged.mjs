import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const prototypeSource = await readFile(new URL("../src/mission2/Mission2PagedPrototype.jsx", import.meta.url), "utf8");
const pagesSource = await readFile(new URL("../src/mission2/Mission2ContextPages.jsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/mission2/mission2Paged.css", import.meta.url), "utf8");
const appSource = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const courseSource = await readFile(new URL("../src/data/courseData.js", import.meta.url), "utf8");
const fallbackSource = await readFile(new URL("./create-spa-route-fallbacks.mjs", import.meta.url), "utf8");

assert.match(prototypeSource, /MISSION_2_PAGED_PAGES[\s\S]*flashlight[\s\S]*window[\s\S]*moving-window[\s\S]*outside[\s\S]*window-size[\s\S]*summary/, "all six Reading Context pages are configured");
assert.match(prototypeSource, /MissionLessonShell/, "shared paged lesson shell is reused");
assert.match(prototypeSource, /mission-2-reading-context/, "Lesson 2 uses its own scoped visual language");
for (const [component, page] of [
  ["Mission2OpeningPage", 1], ["Mission2WindowPage", 2], ["Mission2GrowingTextPage", 3],
  ["Mission2OutsidePage", 4], ["Mission2SizePage", 5], ["Mission2SummaryPage", 6]
]) assert.match(prototypeSource, new RegExp(`${component} active=\\{currentPage === ${page}\\}`), `${component} is mounted on Page ${page}`);
assert.doesNotMatch(prototypeSource, /canAdvance=/, "Lesson pages remain directly accessible without a page lock");
assert.match(prototypeSource, /recommendation[\s\S]*continueHere/, "skipping ahead uses the shared non-blocking recommendation notice");
assert.match(prototypeSource, /history\.pushState/, "page changes create browser history entries");
assert.match(prototypeSource, /addEventListener\("popstate"/, "Back and Forward restore query pages");
assert.match(prototypeSource, /REQUIRED_ACTIVITIES[\s\S]*move-window[\s\S]*show-boundary[\s\S]*grow-text[\s\S]*visible-clue[\s\S]*resize-window/, "completion still requires meaningful activities");
assert.match(prototypeSource, /visitedPages\.has\(6\)/, "opening the final page alone cannot complete the Lesson");

assert.match(pagesSource, /Can the model see|mission2\.page1\.question/, "Page 1 starts from the learner question");
assert.match(pagesSource, /Flashlight/, "Page 1 uses the flashlight analogy as an explanatory visual");
assert.match(pagesSource, /ContextFrame/, "the context boundary is represented consistently");
assert.match(pagesSource, /function ContextTrack[\s\S]*scrollTo/, "context tracks keep the active window visible on narrow screens");
assert.match(pagesSource, /addToken[\s\S]*setCount/, "Page 3 demonstrates the moving window by adding tokens");
assert.match(pagesSource, /outsideWindow[\s\S]*insideWindow/, "Page 4 clearly separates visible and unavailable clues");
assert.match(pagesSource, /m2-quiz-banner[\s\S]*CircleHelp/, "Page 4 announces the switch into answer mode");
assert.match(pagesSource, /m2-choice-letter[\s\S]*String\.fromCharCode/, "Page 4 presents recognisable lettered answer choices");
assert.match(pagesSource, /page4\.chooseAnswer/, "Page 4 prompts the learner to choose an answer");
assert.match(pagesSource, /page4\.answerChecked/, "Page 4 changes its instruction after an answer is selected");
assert.match(pagesSource, /id="context-size"[\s\S]*type="range"/, "Page 5 compares context-window sizes");
assert.match(pagesSource, /Real models can have|page5\.explanation/, "the teaching visual is bounded against real model behaviour");
assert.match(pagesSource, /Finding Helpful Clues|page6\.nextTitle/, "the final page leads to attention without teaching prediction early");
assert.doesNotMatch(pagesSource, /temperature|probabilit|sampling|hallucination|bias/i, "Reading Context does not introduce later-course concepts");
assert.match(pagesSource, /aria-live="polite"/, "changing observations are announced accessibly");
assert.match(pagesSource, /role="group"/, "interactive controls expose grouped semantics");

assert.match(css, /mission-2-reading-context/, "new CSS is scoped to Lesson 2");
assert.match(css, /grid-auto-columns:var\(--token-size\)/, "tokens and the context frame share one sizing system");
assert.match(css, /--window-start\) \* var\(--token-unit\)/, "context-frame position follows the token grid coordinates");
assert.doesNotMatch(css, /^(?:\.card|\.button|\.panel|\.robot|\.scene|\.token|\.progress|section|img)(?:\s|\{|\.|#|:)/m, "no new unscoped generic CSS selectors exist");
for (const width of [820, 620]) assert.match(css, new RegExp(`max-width:${width}px`), `${width}px Reading Context breakpoint exists`);
assert.match(css, /prefers-reduced-motion:reduce/, "reduced motion is respected");

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

process.stdout.write("Lesson 2 Reading Context tests passed.\n");
