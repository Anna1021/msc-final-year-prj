import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";
import {
  GENERIC_GUIDE_FLOW,
  LESSON_1_INTRO_GUIDE_FLOW,
  LESSON_1_PLAYGROUND_GUIDE_FLOW,
  LESSON_1_PLAYGROUND_RESULT_GUIDE_FLOW,
  LESSON_1_QUIZ_GUIDE_FLOW,
  LESSON_1_SUMMARY_GUIDE_FLOW,
  guideFlows,
  readGuideLocation,
  resolveGuideFlow
} from "../src/guide/guideFlows.js";
import { createGuideState, guideReducer, shouldAutoStartGuide } from "../src/guide/guideState.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [prototypeSource, playgroundSource, quizSource, shellSource, providerSource, panelSource, enSource, zhSource] = await Promise.all([
  read("../src/mission1/Mission1PagedPrototype.jsx"),
  read("../src/mission1/QwenTokenizerPlayground.jsx"),
  read("../src/mission1/Mission1PagedKnowledgeQuiz.jsx"),
  read("../src/mission1/MissionLessonShell.jsx"),
  read("../src/guide/GuideProvider.jsx"),
  read("../src/guide/GuidePanel.jsx"),
  read("../src/locales/en/guide.json"),
  read("../src/locales/zh/guide.json")
]);

await Promise.all([
  [prototypeSource, "src/mission1/Mission1PagedPrototype.jsx"],
  [playgroundSource, "src/mission1/QwenTokenizerPlayground.jsx"],
  [quizSource, "src/mission1/Mission1PagedKnowledgeQuiz.jsx"],
  [shellSource, "src/mission1/MissionLessonShell.jsx"],
  [providerSource, "src/guide/GuideProvider.jsx"],
  [panelSource, "src/guide/GuidePanel.jsx"]
].map(([source, filename]) => transformWithEsbuild(source, filename, { loader: "jsx", jsx: "automatic" })));

function lessonPage(page) {
  return readGuideLocation({ pathname: "/mission/1-tokenisation-paged", search: `?page=${page}` });
}

assert.equal(resolveGuideFlow(guideFlows, lessonPage(1)), LESSON_1_INTRO_GUIDE_FLOW);
assert.equal(resolveGuideFlow(guideFlows, lessonPage(2)), GENERIC_GUIDE_FLOW);
assert.equal(resolveGuideFlow(guideFlows, lessonPage(3)), GENERIC_GUIDE_FLOW);
assert.equal(resolveGuideFlow(guideFlows, lessonPage(4)), LESSON_1_PLAYGROUND_GUIDE_FLOW);
assert.equal(resolveGuideFlow(guideFlows, lessonPage(5)), LESSON_1_QUIZ_GUIDE_FLOW);
assert.equal(resolveGuideFlow(guideFlows, lessonPage(6)), LESSON_1_SUMMARY_GUIDE_FLOW);

assert.equal(LESSON_1_INTRO_GUIDE_FLOW.autoStart, true);
assert.equal(LESSON_1_PLAYGROUND_GUIDE_FLOW.autoStart, true);
assert.equal(LESSON_1_QUIZ_GUIDE_FLOW.autoStart, true);
assert.equal(GENERIC_GUIDE_FLOW.autoStart, false);
assert.equal(LESSON_1_SUMMARY_GUIDE_FLOW.autoStart, false);
assert.equal(LESSON_1_PLAYGROUND_RESULT_GUIDE_FLOW.autoStart, false, "result guidance cannot appear before a successful result trigger");

for (const flow of [LESSON_1_PLAYGROUND_GUIDE_FLOW, LESSON_1_QUIZ_GUIDE_FLOW]) {
  const unseen = createGuideState();
  assert.equal(shouldAutoStartGuide(flow, unseen), true);
  const seen = guideReducer(unseen, { type: "open", flowId: flow.id });
  const collapsed = guideReducer(seen, { type: "collapse" });
  assert.equal(shouldAutoStartGuide(flow, collapsed), false, `${flow.id} does not repeatedly auto-start once seen`);
  assert.equal(guideReducer(collapsed, { type: "open", flowId: flow.id }).stepIndex, 0, "Q can reopen the current page flow from its first step");
}

for (const target of ["lesson1-examples", "m1-token-input", "m1-tokenize", "m1-token-result", "lesson1-technical-details"]) {
  assert.match(playgroundSource, new RegExp(`data-guide-target=\"${target}\"`), `${target} resolves on the real tokenizer playground`);
}
assert.match(playgroundSource, /\{result && <div className="m1-token-result"[^>]*data-guide-target="m1-token-result"/, "the result target does not exist before tokenization returns a result");
assert.match(playgroundSource, /data-guide-target="m1-tokenize"[\s\S]*onClick=\{runTokenizer\}/, "the guide targets the real Tokenize button");
assert.match(playgroundSource, /data-guide-target="lesson1-technical-details"[\s\S]*onClick=\{\(\) => setTechnicalOpen/, "the technical-details target remains the real toggle");
assert.doesNotMatch(playgroundSource, /useGuide|openGuide|guideReducer/, "the tokenizer component remains independent from Guide state");
assert.match(prototypeSource, /onSuccessfulRun=\{handleSuccessfulPlaygroundRun\}/);
assert.match(prototypeSource, /setPlaygroundComplete\(true\)[\s\S]*requestAnimationFrame\(\(\) => guide\.openGuide\(resultFlowId\)\)/, "successful tokenization opens result guidance after the result render is scheduled");

assert.match(prototypeSource, /data-guide-target="lesson1-learning-area"/);
assert.match(quizSource, /data-guide-target=\{guideTarget\}/);
assert.match(quizSource, /data-guide-target=\{guideCheckTarget\}[\s\S]*onClick=\{checkAnswer\}/, "the real Check answer button remains interactive");
assert.match(prototypeSource, /guideTarget="lesson1-quiz" guideCheckTarget="lesson1-quiz-check"/);
assert.match(shellSource, /data-guide-target=\{skipAction\.guideTarget \|\| undefined\}[\s\S]*onClick=\{skipAction\.onClick\}/, "the real Skip quiz navigation remains interactive");
assert.match(prototypeSource, /guideTarget:"lesson1-quiz-skip"/);
assert.doesNotMatch(quizSource, /useGuide|openGuide|guideReducer/, "Guide does not enter quiz answer, score, retry, or completion state");
assert.doesNotMatch(providerSource, /setSelected|setQuizResult|setProgress|setPlaygroundComplete/, "shared Guide state remains separate from lesson state");
assert.ok(
  providerSource.indexOf('dispatch({ type: "location-changed"') < providerSource.indexOf("shouldAutoStartGuide(autoFlow, state)"),
  "old-page cleanup runs before the new page auto-start so it cannot collapse the newly opened Guide"
);

assert.ok(LESSON_1_PLAYGROUND_GUIDE_FLOW.steps.every((step) => step.interactive), "all Page 4 real controls remain interactive while spotlighted");
assert.ok(LESSON_1_QUIZ_GUIDE_FLOW.steps.every((step) => step.interactive), "all quiz guide targets remain interactive while spotlighted");
assert.equal(LESSON_1_PLAYGROUND_RESULT_GUIDE_FLOW.steps.at(-1).interactive, true);

const languageSwitchState = guideReducer(createGuideState(), { type: "open", flowId: LESSON_1_PLAYGROUND_GUIDE_FLOW.id });
const secondStepState = guideReducer(languageSwitchState, { type: "next", lastStepIndex: 2 });
assert.equal(secondStepState.stepIndex, 1, "current Guide step is semantic state independent of locale text");
assert.match(panelSource, /t\(step\.titleKey\)/);
assert.match(panelSource, /t\(step\.bodyKey\)/);

const en = JSON.parse(enSource);
const zh = JSON.parse(zhSource);
assert.deepEqual(Object.keys(en.lesson1), Object.keys(zh.lesson1), "Lesson 1 Guide has EN/ZH section parity");
assert.equal(en.lesson1.intro.title, "Start learning");
assert.equal(zh.lesson1.intro.title, "开始学习");
assert.equal(en.lesson1.summary.title, "Lesson summary");
assert.equal(zh.lesson1.summary.title, "课程总结");
assert.doesNotMatch(JSON.stringify(en.lesson1), /Xiao Q/i);

process.stdout.write("Lesson 1 Guide regression tests passed.\n");
