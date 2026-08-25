import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";
import {
  LESSON_3_CONTRIBUTIONS_GUIDE_FLOW,
  LESSON_3_INTRO_GUIDE_FLOW,
  LESSON_3_PLAYGROUND_GUIDE_FLOW,
  LESSON_3_POSITION_GUIDE_FLOW,
  LESSON_3_QUIZ_GUIDE_FLOW,
  LESSON_3_REPRESENTATION_GUIDE_FLOW,
  LESSON_3_SUMMARY_GUIDE_FLOW,
  guideFlows,
  readGuideLocation,
  resolveGuideFlow
} from "../src/guide/guideFlows.js";
import { createGuideState, guideReducer, shouldAutoStartGuide } from "../src/guide/guideState.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [pagesSource, pagedSource, providerSource, panelSource, enSource, zhSource] = await Promise.all([
  read("../src/mission3/Lesson3Pages.jsx"),
  read("../src/mission3/Lesson3Paged.jsx"),
  read("../src/guide/GuideProvider.jsx"),
  read("../src/guide/GuidePanel.jsx"),
  read("../src/locales/en/guide.json"),
  read("../src/locales/zh/guide.json")
]);

await Promise.all([
  [pagesSource, "src/mission3/Lesson3Pages.jsx"],
  [pagedSource, "src/mission3/Lesson3Paged.jsx"],
  [providerSource, "src/guide/GuideProvider.jsx"],
  [panelSource, "src/guide/GuidePanel.jsx"]
].map(([source, filename]) => transformWithEsbuild(source, filename, { loader: "jsx", jsx: "automatic" })));

function lessonPage(page) {
  return readGuideLocation({ pathname: "/mission/3-hallucination-paged", search: `?page=${page}` });
}

const expectedFlows = [
  LESSON_3_INTRO_GUIDE_FLOW,
  LESSON_3_CONTRIBUTIONS_GUIDE_FLOW,
  LESSON_3_REPRESENTATION_GUIDE_FLOW,
  LESSON_3_POSITION_GUIDE_FLOW,
  LESSON_3_PLAYGROUND_GUIDE_FLOW,
  LESSON_3_QUIZ_GUIDE_FLOW,
  LESSON_3_SUMMARY_GUIDE_FLOW
];
expectedFlows.forEach((flow, index) => assert.equal(resolveGuideFlow(guideFlows, lessonPage(index + 1)), flow));
assert.deepEqual(expectedFlows.map((flow) => flow.autoStart), [true, false, false, false, true, false, false]);
assert.deepEqual(expectedFlows.map((flow) => flow.id), [
  "lesson3-intro",
  "lesson3-contributions",
  "lesson3-representation",
  "lesson3-position",
  "lesson3-playground",
  "reusable.quiz",
  "lesson3-summary"
]);
assert.ok(expectedFlows.filter((flow) => flow !== LESSON_3_QUIZ_GUIDE_FLOW).every((flow) => flow.id.startsWith("lesson3-")), "Lesson 3 page-specific Guides use stable semantic flow IDs");
assert.doesNotMatch(providerSource, /writeProgress|missions\[/, "Guide persistence remains separate from learner progress");

for (const flow of [LESSON_3_CONTRIBUTIONS_GUIDE_FLOW, LESSON_3_REPRESENTATION_GUIDE_FLOW, LESSON_3_POSITION_GUIDE_FLOW, LESSON_3_QUIZ_GUIDE_FLOW, LESSON_3_SUMMARY_GUIDE_FLOW]) {
  assert.equal(shouldAutoStartGuide(flow, createGuideState()), false, `${flow.id} remains available only when Q is opened manually`);
}

assert.equal(LESSON_3_INTRO_GUIDE_FLOW.steps.length, 2, "the first page introduces the lesson and the new Keywords behaviour once");
assert.equal(LESSON_3_INTRO_GUIDE_FLOW.steps[1].targetId, "lesson3-keywords");
assert.equal(LESSON_3_INTRO_GUIDE_FLOW.steps[1].interactive, true);
assert.match(pagesSource, /data-guide-target="lesson3-keywords"/);
assert.match(pagesSource, /<details className="l3-technical-word" open=\{open\} onToggle=\{\(event\) => setOpen\(event\.currentTarget\.open\)\}>/, "Keywords retain their real native disclosure interaction");
assert.doesNotMatch(providerSource, /setOpen\(|l3-technical-word|keyword/, "Guide does not own or alter keyword accordion state");

assert.equal(LESSON_3_PLAYGROUND_GUIDE_FLOW.steps.length, 4);
assert.deepEqual(LESSON_3_PLAYGROUND_GUIDE_FLOW.steps.map((step) => step.id), ["sentence-selector", "focus-tokens", "connections", "own-sentence"]);
assert.deepEqual(LESSON_3_PLAYGROUND_GUIDE_FLOW.steps.map((step) => step.targetId), [
  "lesson3-sentence-selector",
  "lesson3-focus-tokens",
  "lesson3-connections",
  "lesson3-own-sentence"
]);
assert.ok(LESSON_3_PLAYGROUND_GUIDE_FLOW.steps.every((step) => step.interactive), "all four real exploration areas remain usable through the spotlight");
for (const target of ["lesson3-sentence-selector", "lesson3-focus-tokens", "lesson3-connections", "lesson3-own-sentence", "lesson3-analyse"]) {
  assert.match(pagesSource, new RegExp(`data-guide-target=(?:"${target}"|\\{guideTarget\\})`), `${target} has a stable semantic target`);
}

assert.match(pagesSource, /onClick=\{\(\) => chooseSentence\(id\)\}/, "Sentence A/B selectors remain interactive");
assert.match(pagesSource, /onClick=\{\(\) => onFocus\?\.\(index\)\}/, "focus-token buttons remain interactive");
assert.match(pagesSource, /value=\{customText\} onChange=\{\(event\) => setCustomText\(event\.target\.value\)\}/, "own-sentence input remains editable");
assert.match(pagesSource, /<form onSubmit=\{analyseCustom\} data-guide-target="lesson3-own-sentence">/, "Analyse keeps the existing form submission path");
assert.match(pagesSource, /const analyseCustom = \(event\) => \{ event\.preventDefault\(\);/, "custom analysis logic remains functional");
assert.match(pagesSource, /setCustomSentence\(\{ text, tokens, defaultFocusIndex \}\); setSelectedSentence\("custom"\);/, "successful custom analysis updates the existing visualisation in place");

const en = JSON.parse(enSource);
const zh = JSON.parse(zhSource);
const enDisclaimer = en.lesson3.playground.connections.body;
const zhDisclaimer = zh.lesson3.playground.connections.body;
assert.match(enDisclaimer, /simplified teaching representation/i);
assert.match(enDisclaimer, /not real model attention weights/i);
assert.match(zhDisclaimer, /简化的教学/);
assert.match(zhDisclaimer, /并不是模型真实的注意力权重/);
assert.doesNotMatch(enDisclaimer.replace(/not real model attention weights/i, ""), /real (?:model )?attention weights/i, "Guide never presents illustrative lines as measured model attention");

function keys(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? keys(child, path) : [path];
  }).sort();
}
assert.deepEqual(keys(en), keys(zh), "Guide locales retain exact EN/ZH parity");

let state = guideReducer(createGuideState(), { type: "open", flowId: LESSON_3_PLAYGROUND_GUIDE_FLOW.id });
state = guideReducer(state, { type: "next", lastStepIndex: LESSON_3_PLAYGROUND_GUIDE_FLOW.steps.length - 1 });
assert.equal(state.stepIndex, 1);
assert.match(panelSource, /t\(step\.titleKey\)/);
assert.match(panelSource, /t\(step\.bodyKey\)/);
assert.equal(state.stepIndex, 1, "language switching only changes rendered translations and does not reset the current Guide step");
assert.doesNotMatch(providerSource, /setSelectedSentence|setFocusIndex|setCustomText|setCustomSentence/, "Guide state does not reset Lesson 3 interaction state");

for (const flow of [LESSON_3_INTRO_GUIDE_FLOW, LESSON_3_PLAYGROUND_GUIDE_FLOW]) {
  const unseen = createGuideState();
  assert.equal(shouldAutoStartGuide(flow, unseen), true);
  const seen = guideReducer(unseen, { type: "open", flowId: flow.id });
  assert.equal(shouldAutoStartGuide(flow, guideReducer(seen, { type: "collapse" })), false, `${flow.id} auto-starts only once`);
}

process.stdout.write("Lesson 3 Guide regression tests passed.\n");
