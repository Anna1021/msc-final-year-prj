import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";
import {
  GENERIC_GUIDE_FLOW,
  LESSON_2_CONTEXT_COMPARISON_GUIDE_FLOW,
  LESSON_2_CONTEXT_LIMIT_GUIDE_FLOW,
  LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW,
  LESSON_2_CONTEXT_WINDOW_GUIDE_FLOW,
  LESSON_2_QUIZ_GUIDE_FLOW,
  LESSON_2_SUMMARY_GUIDE_FLOW,
  LESSON_2_WARMUP_GUIDE_FLOW,
  guideFlows,
  readGuideLocation,
  resolveGuideFlow
} from "../src/guide/guideFlows.js";
import { createGuideState, guideReducer, shouldAutoStartGuide } from "../src/guide/guideState.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [contextSource, prototypeSource, quizSource, providerSource, panelSource, cssSource, enSource, zhSource] = await Promise.all([
  read("../src/mission2/Mission2ContextPages.jsx"),
  read("../src/mission2/Mission2PagedPrototype.jsx"),
  read("../src/mission1/Mission1PagedKnowledgeQuiz.jsx"),
  read("../src/guide/GuideProvider.jsx"),
  read("../src/guide/GuidePanel.jsx"),
  read("../src/mission2/mission2Paged.css"),
  read("../src/locales/en/guide.json"),
  read("../src/locales/zh/guide.json")
]);

await Promise.all([
  [contextSource, "src/mission2/Mission2ContextPages.jsx"],
  [prototypeSource, "src/mission2/Mission2PagedPrototype.jsx"],
  [quizSource, "src/mission1/Mission1PagedKnowledgeQuiz.jsx"],
  [providerSource, "src/guide/GuideProvider.jsx"],
  [panelSource, "src/guide/GuidePanel.jsx"]
].map(([source, filename]) => transformWithEsbuild(source, filename, { loader: "jsx", jsx: "automatic" })));

function lessonPage(page) {
  return readGuideLocation({ pathname: "/mission/2-prediction-paged", search: `?page=${page}` });
}

const expectedFlows = [
  LESSON_2_WARMUP_GUIDE_FLOW,
  LESSON_2_CONTEXT_WINDOW_GUIDE_FLOW,
  LESSON_2_CONTEXT_COMPARISON_GUIDE_FLOW,
  LESSON_2_CONTEXT_LIMIT_GUIDE_FLOW,
  LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW,
  LESSON_2_QUIZ_GUIDE_FLOW,
  LESSON_2_SUMMARY_GUIDE_FLOW
];
expectedFlows.forEach((flow, index) => assert.equal(resolveGuideFlow(guideFlows, lessonPage(index + 1)), flow));
assert.deepEqual(expectedFlows.map((flow) => flow.autoStart), [true, false, false, false, true, false, false]);
assert.deepEqual(
  expectedFlows.map((flow) => flow.id),
  ["lesson2-warmup", "lesson2-context-window", "lesson2-context-comparison", "lesson2-context-limit", "lesson2-context-playground", "reusable.quiz", "lesson2-summary"]
);

assert.equal(GENERIC_GUIDE_FLOW.steps[0].titleKey, "guide.generic.title");
assert.notEqual(GENERIC_GUIDE_FLOW.steps[0].titleKey, "guide.common.needHand");
assert.match(panelSource, /stepCount > 1[\s\S]*guide\.common\.eyebrow/);

assert.equal(LESSON_2_WARMUP_GUIDE_FLOW.steps.length, 1);
assert.equal(LESSON_2_WARMUP_GUIDE_FLOW.steps[0].targetId, "lesson2-think-about-it");
assert.equal(LESSON_2_WARMUP_GUIDE_FLOW.steps[0].interactive, true);
assert.match(contextSource, /className="m2-context-prompt-board" data-guide-target="lesson2-think-about-it"/);
assert.match(contextSource, /onClick=\{\(\) => choose\(id, option\)\}/, "warm-up answers remain the real clickable controls");
assert.doesNotMatch(providerSource, /setChoices|choose\(|correctFeedback|wrongFeedback/, "Guide does not enter Lesson 2 warm-up state");

for (const flow of [LESSON_2_CONTEXT_WINDOW_GUIDE_FLOW, LESSON_2_CONTEXT_COMPARISON_GUIDE_FLOW, LESSON_2_CONTEXT_LIMIT_GUIDE_FLOW, LESSON_2_SUMMARY_GUIDE_FLOW]) {
  assert.equal(flow.autoStart, false);
  assert.equal(shouldAutoStartGuide(flow, createGuideState()), false);
  assert.equal(guideReducer(createGuideState(), { type: "open", flowId: flow.id }).activeFlowId, flow.id, "manual Q opens the page-aware helper");
}

assert.equal(LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW.steps.length, 4);
assert.deepEqual(LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW.steps.map((step) => step.id), ["drag-window", "controls", "window-size", "result"]);
assert.deepEqual(LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW.steps.map((step) => step.targetId), [
  "lesson2-context-window-drag",
  "lesson2-context-controls",
  "lesson2-context-size",
  "lesson2-context-result"
]);
assert.deepEqual(LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW.steps[0].spotlightPadding, { top: 52, right: 24, bottom: 10, left: 10 }, "the drag-step spotlight includes the animated hand above the real window");
for (const target of ["lesson2-context-window-drag", "lesson2-context-controls", "lesson2-context-size", "lesson2-context-result"]) {
  assert.match(contextSource, new RegExp(`data-guide-target="${target}"`));
}
assert.ok(LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW.steps.slice(0, 3).every((step) => step.interactive));
assert.match(contextSource, /onPointerDown=\{startDrag\}[\s\S]*onPointerMove=\{continueDrag\}[\s\S]*onPointerUp=\{endDrag\}/, "the spotlight target remains the real draggable window");
assert.match(contextSource, /Math\.round\(\(event\.clientX - dragRef\.current\.pointerX\) \/ 56\)/, "existing drag calculation is unchanged");
assert.doesNotMatch(contextSource, /GripHorizontal|m2-playground-drag-handle/, "no permanent drag-handle block covers token text");
assert.match(contextSource, /<HandGrab \/>/, "the cue uses a true grab gesture icon rather than a pointing emoji");
assert.doesNotMatch(contextSource, /👇|☝|👉/);
assert.match(cssSource, /\.m2-playground-window\{[^}]*cursor:grab/);
assert.match(cssSource, /\.m2-playground-window\.is-dragging\{cursor:grabbing\}/);
assert.match(cssSource, /\.m2-playground-window:hover\{[^}]*border-color:[^}]*box-shadow:/);
assert.doesNotMatch(cssSource, /\.m2-playground-drag-handle/, "the removed permanent handle has no leftover styling");
assert.match(cssSource, /\.m2-playground-drag-cue\{[^}]*pointer-events:none[^}]*animation:m2-guide-drag-hand 2\.25s ease-in-out infinite/);

assert.match(contextSource, /guide\.expanded[\s\S]*guide\.activeFlowId === LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW\.id[\s\S]*guide\.currentStep\?\.id === "drag-window"[\s\S]*!isDragging/);
assert.match(contextSource, /function startDrag\(event\) \{[\s\S]*setIsDragging\(true\)/, "actual dragging hides the cue immediately");
assert.doesNotMatch(contextSource, /setTimeout|setInterval/, "the cue lifecycle is state-driven, not timer-driven");
assert.match(contextSource, /\{showDragCue && <span className="m2-playground-drag-cue" aria-hidden="true">/);
assert.match(cssSource, /@keyframes m2-guide-drag-hand/);
assert.match(cssSource, /infinite/, "the cue loops for the entire relevant Guide step");

let state = guideReducer(createGuideState(), { type: "open", flowId: LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW.id });
assert.equal(state.expanded, true);
assert.equal(state.stepIndex, 0);
state = guideReducer(state, { type: "next", lastStepIndex: 3 });
assert.equal(state.stepIndex, 1, "Next leaves the drag-cue step");
state = guideReducer(state, { type: "back" });
assert.equal(state.stepIndex, 0, "Back preserves semantic Guide navigation");
assert.equal(guideReducer(state, { type: "collapse" }).expanded, false);
assert.equal(guideReducer(state, { type: "skip" }).expanded, false);
assert.equal(guideReducer(state, { type: "location-changed", keepFlow: false }).activeFlowId, null);

assert.equal(LESSON_2_QUIZ_GUIDE_FLOW.steps.length, 1);
assert.equal(LESSON_2_QUIZ_GUIDE_FLOW.steps[0].targetId, "lesson-quiz");
assert.match(prototypeSource, /guideTarget="lesson-quiz"/);
assert.match(quizSource, /data-guide-target=\{guideTarget\}/, "the shared quiz still supports Lesson 1's existing spotlight target");
assert.doesNotMatch(providerSource, /setSelected|setQuizResult|setWindowStart|setWindowSize|retry\(/, "Guide state remains separate from lesson, quiz, and prediction state");

for (const flow of [LESSON_2_WARMUP_GUIDE_FLOW, LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW]) {
  const unseen = createGuideState();
  assert.equal(shouldAutoStartGuide(flow, unseen), true);
  const seen = guideReducer(unseen, { type: "open", flowId: flow.id });
  const closed = guideReducer(seen, { type: "collapse" });
  assert.equal(shouldAutoStartGuide(flow, closed), false, `${flow.id} only auto-starts once`);
}

const en = JSON.parse(enSource);
const zh = JSON.parse(zhSource);
function keys(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? keys(child, path) : [path];
  }).sort();
}
assert.deepEqual(keys(en), keys(zh), "Guide locales retain exact EN/ZH parity");
assert.equal(en.common.eyebrow, "Q GUIDE");
assert.equal(zh.common.eyebrow, "小Q指引");
assert.equal(en.generic.title, "Explore this page");
assert.equal(zh.generic.title, "浏览这一页");
assert.notEqual(en.common.eyebrow, en.generic.title);
assert.notEqual(zh.common.eyebrow, zh.generic.title);

const localeIndependentState = guideReducer(
  guideReducer(createGuideState(), { type: "open", flowId: LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW.id }),
  { type: "next", lastStepIndex: 3 }
);
assert.equal(localeIndependentState.stepIndex, 1, "language text is not stored in Guide step state");
assert.match(panelSource, /t\(step\.titleKey\)/);
assert.match(panelSource, /t\(step\.bodyKey\)/);

process.stdout.write("Lesson 2 Guide regression tests passed.\n");
