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
assert.deepEqual(PAGED_MISSIONS[3].pages.map((page) => page[0]), ["transformer", "attention", "representation", "position", "process", "summary"]);
assert.match(course, /How does a language model connect words together\?[\s\S]*Connecting the Tokens/);
assert.match(app, /3-hallucination-paged"\) page = <Lesson3Paged/);

for (let page = 1; page <= 6; page += 1) assert.match(shell, new RegExp(`Lesson3Page${page} active=\\{currentPage===${page}\\}`));
assert.match(shell, /history\.pushState/);
assert.match(shell, /addEventListener\("popstate"/);
assert.doesNotMatch(shell, /canAdvance=/, "page navigation remains non-blocking");
assert.match(shell, /REQUIRED = \["connection-strengths","contextual-build","transformer-process","summary-visited"\]/);
assert.match(shell, /REQUIRED\.every[\s\S]*visited\.has\(pageCount\)/, "direct final-page access cannot complete the lesson");

assert.match(pages, /page1[\s\S]*Transformer|l3-transformer-stage[\s\S]*Transformer/, "Transformer is introduced on Page 1");
assert.match(pages, /TechnicalWord[\s\S]*term="Transformer"/, "Transformer has a native disclosure");
assert.doesNotMatch(pages, /Page1[\s\S]{0,3000}(?:check answer|tryAgain|correct answer)/i, "Page 1 is not a mandatory clue quiz");
assert.match(pages, /LESSON_3_DOG_TOKENS[\s\S]*l3-transformer-machine[\s\S]*Representation/, "Page 1 teaches visible Token information combination");
assert.match(pages, /flowStep[\s\S]*l3-context-signals[\s\S]*l3-p1-signal-lines/, "Page 1 reveals contextual information moving through the Transformer");
assert.match(pages, /descriptionInfo[\s\S]*actionInfo[\s\S]*lighterInfo/, "Page 1 explains what each teaching signal contributes");
assert.match(pages, /l3-flow-explanation[\s\S]*changedExplanation/, "Page 1 reveal ends with a child-friendly explanation");
assert.match(pages, /prefers-reduced-motion: reduce[\s\S]*setFlowStep\(3\)/, "Page 1 reduced motion reveals the final state directly");
assert.match(pages, /l3-strength-lines[\s\S]*is-strong[\s\S]*is-light/, "Page 2 uses line weight for unequal contributions");
assert.match(pages, /showConnections/, "Page 2 keeps the child-friendly connection demonstration");
assert.match(pages, /page=\{2\} term="Attention" visual="attention"/, "Attention is explained in the Page 2 learning sidebar");
assert.match(pages, /l3-connection-map[\s\S]*l3-source-token[\s\S]*l3-focus-token/, "Page 2 uses a target-centred Token connection map");
assert.doesNotMatch(pages, /l3-strength-sources/, "Page 2 no longer renders three dashboard-like source cards");
assert.match(pages, /strong[\s\S]*light/, "Page 2 names stronger and lighter contributions in text");
assert.doesNotMatch(pages + data, /(?:attention|connection)\s*(?:weight|score)?\s*[:=]\s*0?\.\d+/i, "no fake attention values");
assert.match(pages, /lesson1Link[\s\S]*l3-builder-grid[\s\S]*Representation/, "Page 3 links Lesson 1 representations to contextual updating");
assert.match(pages, /term=\{t\("mission3\.page3\.term"\)\}/, "contextual representation is disclosed");
assert.match(pages, /<small>Target Token<\/small><strong>“dog”<\/strong>/, "Page 3 clearly identifies the target as the Token named dog");
assert.match(data, /The", "dog", "chased", "the", "cat[\s\S]*The", "cat", "chased", "the", "dog/);
assert.match(pages, /PositionTrack[\s\S]*Position information|PositionTrack[\s\S]*page4\.term/);
assert.doesNotMatch(pages, /chooseActor|who-choices|tryAgain/, "Page 4 is not a grammar quiz");
assert.match(pages, /setStage\(4\)[\s\S]*stageLabels|l3-process-steps[\s\S]*Process the context|l3-process-steps[\s\S]*processContext/, "Page 5 runs a controlled staged process");
assert.match(pages, /l3-combine-layout[\s\S]*l3-combine-sources[\s\S]*l3-combine-connectors[\s\S]*l3-combine-target/, "Page 5 reserves separate source, connector and target regions");
assert.match(pages, /simplifiedDemo[\s\S]*page5\.accuracy/, "Page 5 carries an accuracy boundary");
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
assert.match(pages, /aria-pressed/);
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
assert.match(css, /l3-combine-layout\{display:grid;grid-template-columns:minmax\(220px,.8fr\) 72px minmax\(340px,1.4fr\)/, "Page 5 desktop connector column prevents overlap");
assert.match(css, /max-width:760px[\s\S]*l3-combine-layout\{grid-template-columns:1fr/, "Page 5 stacks vertically on narrow screens");
assert.match(css, /l3-combine-connectors svg\{display:none\}[\s\S]*content:"↓"/, "Page 5 uses a vertical connector on mobile");
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
