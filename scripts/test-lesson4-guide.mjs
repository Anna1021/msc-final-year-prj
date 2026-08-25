import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";
import {
  LESSON_4_HISTORY_GUIDE_FLOW,
  LESSON_4_LIVE_GUIDE_FLOW,
  LESSON_4_POSSIBILITIES_GUIDE_FLOW,
  LESSON_4_PROBABILITIES_GUIDE_FLOW,
  LESSON_4_QUIZ_GUIDE_FLOW,
  LESSON_4_SCORES_GUIDE_FLOW,
  LESSON_4_SUMMARY_GUIDE_FLOW,
  guideFlows,
  readGuideLocation,
  resolveGuideFlow
} from "../src/guide/guideFlows.js";
import { createGuideState, guideReducer, shouldAutoStartGuide } from "../src/guide/guideState.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [labSource, teachingSource, quizSource, providerSource, panelSource, cssSource, enSource, zhSource] = await Promise.all([
  read("../src/mission4/LivePredictionLab.jsx"),
  read("../src/mission4/Lesson4TeachingPages.jsx"),
  read("../src/mission1/Mission1PagedKnowledgeQuiz.jsx"),
  read("../src/guide/GuideProvider.jsx"),
  read("../src/guide/GuidePanel.jsx"),
  read("../src/mission4/lesson4Live.css"),
  read("../src/locales/en/guide.json"),
  read("../src/locales/zh/guide.json")
]);

await Promise.all([
  [labSource, "src/mission4/LivePredictionLab.jsx"],
  [teachingSource, "src/mission4/Lesson4TeachingPages.jsx"],
  [quizSource, "src/mission1/Mission1PagedKnowledgeQuiz.jsx"],
  [providerSource, "src/guide/GuideProvider.jsx"],
  [panelSource, "src/guide/GuidePanel.jsx"]
].map(([source, filename]) => transformWithEsbuild(source, filename, { loader: "jsx", jsx: "automatic" })));

function lessonPage(page) {
  return readGuideLocation({ pathname: "/mission/4-training-data-paged", search: `?page=${page}` });
}

const expectedFlows = [
  LESSON_4_POSSIBILITIES_GUIDE_FLOW,
  LESSON_4_SCORES_GUIDE_FLOW,
  LESSON_4_PROBABILITIES_GUIDE_FLOW,
  LESSON_4_LIVE_GUIDE_FLOW,
  LESSON_4_QUIZ_GUIDE_FLOW,
  LESSON_4_SUMMARY_GUIDE_FLOW
];
expectedFlows.forEach((flow, index) => assert.equal(resolveGuideFlow(guideFlows, lessonPage(index + 1)), flow));
assert.deepEqual(expectedFlows.map((flow) => flow.autoStart), [false, false, false, true, false, false], "only the real-model lab auto-starts");
assert.ok(expectedFlows.slice(0, 3).every((flow) => flow.steps.length <= 2), "reading pages keep short contextual helpers");

assert.equal(LESSON_4_POSSIBILITIES_GUIDE_FLOW.steps[1].targetId, "lesson4-technical-word");
assert.equal(LESSON_4_POSSIBILITIES_GUIDE_FLOW.steps[1].interactive, true);
assert.match(teachingSource, /guideTarget="lesson4-technical-word"/);
assert.match(teachingSource, /<details className="l4-new-technical" data-guide-target=\{guideTarget\} open=\{open\} onToggle=/, "the real Technical Word disclosure stays interactive");
assert.doesNotMatch(providerSource, /l4-new-technical|setTemperature|setGenerationMode|setMaxTokens|setPrompt/, "Guide infrastructure does not own Lesson 4 controls");

assert.equal(LESSON_4_LIVE_GUIDE_FLOW.steps.length, 7);
assert.equal(LESSON_4_LIVE_GUIDE_FLOW.autoStartStepIndex, 2, "auto-start skips repeated preset and input tips while manual Q retains the full custom flow");
assert.deepEqual(LESSON_4_LIVE_GUIDE_FLOW.steps.map((step) => step.id), [
  "preset-examples", "custom-input", "character-limit", "run", "generation-mode", "max-tokens", "temperature"
]);
assert.deepEqual(LESSON_4_LIVE_GUIDE_FLOW.steps.map((step) => step.targetId), [
  "lesson4-preset-examples", "lesson4-input", "lesson4-character-counter", "lesson4-run", "lesson4-generation-mode", "lesson4-max-tokens", "lesson4-temperature"
]);
for (const target of [
  "lesson4-preset-examples", "lesson4-input", "lesson4-character-counter", "lesson4-run", "lesson4-generation-mode", "lesson4-max-tokens", "lesson4-temperature", "lesson4-predictions", "lesson4-history", "lesson4-history-navigation"
]) {
  assert.match(labSource, new RegExp(`data-guide-target="${target}"`), `${target} has a stable semantic target`);
}
assert.ok(LESSON_4_LIVE_GUIDE_FLOW.steps.filter((step) => step.id !== "character-limit").every((step) => step.interactive), "real Page 4 controls remain usable through their spotlights");

assert.match(labSource, /onClick=\{\(\) => chooseStarter\(starter\)\}/, "presets keep their existing action");
assert.match(labSource, /value=\{prompt\} maxLength=\{MAX_PROMPT_LENGTH\} onChange=\{event => updatePrompt\(event\.target\.value\)\}/, "input remains editable with its real character limit");
assert.equal(120, Number(labSource.match(/const MAX_PROMPT_LENGTH = (\d+)/)?.[1]));
assert.match(labSource, /data-guide-target="lesson4-run"[\s\S]*onClick=\{runDraft\}/, "Run keeps the real generation handler");
assert.match(labSource, /data-guide-target="lesson4-generation-mode"[\s\S]*switchMode\("auto"\)[\s\S]*switchMode\("step"\)/, "both generation modes keep their real handlers");
assert.match(labSource, /data-guide-target="lesson4-max-tokens"[\s\S]*onChange=\{event => changeLimit\(event\.target\.value\)\}/, "Max Tokens keeps its real handler");
assert.match(labSource, /data-guide-target="lesson4-temperature"[\s\S]*onChange=\{event => setTemperature\(Number\(event\.target\.value\)\)\}/, "Temperature keeps its real handler");
assert.match(labSource, /temperature:temperatureRef\.current,[\s\S]*mode:"sampling"/, "Guide copy matches production temperature-scaled sampling");
assert.doesNotMatch(providerSource, /runDraft|performOne|clearGeneration|switchMode|changeLimit/, "Guide never triggers or resets generation");

assert.equal(LESSON_4_HISTORY_GUIDE_FLOW.autoStart, false);
assert.deepEqual(LESSON_4_HISTORY_GUIDE_FLOW.steps.map((step) => step.targetId), ["lesson4-history", "lesson4-history-navigation"]);
assert.match(labSource, /steps\.length < 2 \|\| guide\.expanded \|\| historyAlreadySeen/, "history guidance waits for genuine generated history and a closed initial guide");
assert.match(labSource, /guide\.openGuide\(LESSON_4_HISTORY_GUIDE_FLOW\.id\)/, "history guidance uses the existing auxiliary flow");
assert.match(labSource, /scrollBy\(\{ left:direction \* 460, behavior:"smooth" \}\)/, "history arrows keep their existing navigation");
assert.match(labSource, /title=\{t\("mission4\.live\.lab\.scrollLeft"\)\}/);
assert.match(cssSource, /\.l4-watch-history header button:hover\{[^}]*border-color:[^}]*background:[^}]*box-shadow:/, "history arrows receive only a small hover affordance");

assert.match(labSource, /guide\.activeFlowId === LESSON_4_LIVE_GUIDE_FLOW\.id[\s\S]*guide\.currentStep\?\.id === "character-limit"/, "counter cue is driven by the active semantic Guide step");
assert.match(labSource, /\{showCounterCue && <span className="l4-watch-counter-cue" aria-hidden="true"><Pointer \/><\/span>\}/);
assert.match(cssSource, /\.l4-watch-counter-cue\{[^}]*pointer-events:none[^}]*animation:l4-guide-counter-pointer 1\.8s ease-in-out infinite/);
assert.doesNotMatch(labSource, /setTimeout\([^)]*showCounterCue|setInterval\([^)]*showCounterCue/, "counter cue has no auto-timeout");
assert.deepEqual(LESSON_4_LIVE_GUIDE_FLOW.steps[2].spotlightPadding, { top: 38, right: 10, bottom: 10, left: 10 }, "counter spotlight includes the cue above the actual counter");

let cueState = guideReducer(createGuideState(), { type: "open", flowId: LESSON_4_LIVE_GUIDE_FLOW.id });
cueState = guideReducer(cueState, { type: "next", lastStepIndex: 6 });
cueState = guideReducer(cueState, { type: "next", lastStepIndex: 6 });
assert.equal(cueState.stepIndex, 2, "counter cue step is reachable and remains active without a timer");
assert.equal(guideReducer(cueState, { type: "next", lastStepIndex: 6 }).stepIndex, 3, "Next removes the cue step");
assert.equal(guideReducer(cueState, { type: "back" }).stepIndex, 1, "Back removes the cue step");
assert.equal(guideReducer(cueState, { type: "collapse" }).expanded, false, "Close hides the cue");
assert.equal(guideReducer(cueState, { type: "skip" }).expanded, false, "Skip hides the cue");
assert.equal(guideReducer(cueState, { type: "location-changed", keepFlow: false }).activeFlowId, null, "route changes remove the cue flow");

assert.equal(LESSON_4_QUIZ_GUIDE_FLOW.steps.length, 1);
assert.equal(LESSON_4_QUIZ_GUIDE_FLOW.steps[0].targetId, "lesson-quiz");
assert.match(teachingSource, /guideTarget="lesson-quiz"/);
assert.match(quizSource, /data-guide-target=\{guideTarget\}/, "shared quiz accepts the Lesson 4 target without changing quiz state");

const en = JSON.parse(enSource);
const zh = JSON.parse(zhSource);
function keys(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? keys(child, path) : [path];
  }).sort();
}
assert.deepEqual(keys(en), keys(zh), "Guide locales retain exact EN/ZH parity");
assert.match(en.lesson4.live.counter.body, /120 characters/);
assert.doesNotMatch(en.lesson4.live.counter.body, /120 tokens/i);
assert.match(en.lesson4.live.temperature.body, /samples from this changed distribution/);
assert.match(zh.lesson4.live.temperature.body, /采样/);

const stateAtTemperature = guideReducer(
  guideReducer(createGuideState(), { type: "open", flowId: LESSON_4_LIVE_GUIDE_FLOW.id }),
  { type: "go-to", stepIndex: 6 }
);
assert.equal(stateAtTemperature.stepIndex, 6);
assert.match(panelSource, /t\(step\.titleKey\)/);
assert.match(panelSource, /t\(step\.bodyKey\)/);
assert.equal(stateAtTemperature.stepIndex, 6, "language switching changes rendered copy without resetting Guide state");

for (const flow of [LESSON_4_LIVE_GUIDE_FLOW]) {
  const unseen = createGuideState();
  assert.equal(shouldAutoStartGuide(flow, unseen), true);
  const seen = guideReducer(unseen, { type: "open", flowId: flow.id });
  assert.equal(shouldAutoStartGuide(flow, guideReducer(seen, { type: "collapse" })), false, `${flow.id} auto-starts once`);
}

process.stdout.write("Lesson 4 Guide regression tests passed.\n");
