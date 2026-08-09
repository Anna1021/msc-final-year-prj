import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PAGED_MISSIONS } from "../src/pagedMissions/missionCurriculumData.js";
import {
  chooseTokenId,
  createCandidateView,
  probabilityDistribution,
  visualiseToken
} from "../src/mission4/livePredictionMath.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [shell, pages, lab, hook, modelService, server, modelConfig, css, app, course, state, viteConfig, devScript, packageSource] = await Promise.all([
  read("../src/mission4/Lesson4Paged.jsx"),
  read("../src/mission4/Lesson4TeachingPages.jsx"),
  read("../src/mission4/LivePredictionLab.jsx"),
  read("../src/mission4/useLivePredictionModel.js"),
  read("../server/modelService.mjs"),
  read("../server/index.mjs"),
  read("../src/mission4/liveModelConfig.js"),
  read("../src/mission4/lesson4Live.css"),
  read("../src/main.jsx"),
  read("../src/data/courseData.js"),
  read("../src/state/progress.js"),
  read("../vite.config.js"),
  read("../scripts/dev.mjs"),
  read("../package.json")
]);

assert.equal(PAGED_MISSIONS[5].topic, "Predicting the Next Token");
assert.equal(PAGED_MISSIONS[5].pages.length, 4);
assert.deepEqual(PAGED_MISSIONS[5].pages.map((page) => page[0]), ["predict", "choose", "live", "check"]);
assert.match(course, /id:\s*5[^\n]*How does a language model choose what comes next\?[\s\S]*Predicting the Next Token/);
assert.match(app, /4-training-data-paged"\) page = <Lesson4Paged/);

for (let page = 1; page <= 4; page += 1) {
  assert.match(shell, new RegExp(`Lesson4NewPage${page} active=\\{currentPage===${page}\\}`), `Page ${page} is mounted directly`);
}
assert.match(shell, /history\.pushState/);
assert.match(shell, /addEventListener\("popstate"/);
assert.doesNotMatch(shell, /canAdvance=/);
assert.match(shell, /REQUIRED=\["probabilities","selection","live","quiz"\]/);
assert.match(shell, /visited\.has\(pageCount\)/, "direct Page 4 access cannot complete Lesson 4");
assert.match(shell, /nextLesson/);

assert.match(pages, /l4-new-prediction-story[\s\S]*l4-new-candidate-preview[\s\S]*ProbabilityRows/, "Page 1 combines candidates, scores and probabilities");
assert.doesNotMatch(pages, /Select at least two continuations|selected\.length\s*>?=\s*2/i, "the old English continuation task is gone");
assert.match(pages, /ProbabilityRows selected=\{selected\}[\s\S]*l4-new-mode-switch[\s\S]*runSelection/, "Page 2 keeps the full distribution visible during selection");
assert.match(pages, /setAppended\(true\)[\s\S]*l4-new-appended-context/, "Page 2 appends the selected Token to context");
assert.match(pages, /function append\(\)[\s\S]*setAppended\(true\);[\s\S]*onComplete/, "Page 2 records required evidence only after append");
assert.match(pages, /Reviewed teaching probabilities|reviewedProbabilities/);
assert.match(pages, /LiveLabErrorBoundary[\s\S]*LivePredictionLab/, "Page 3 isolates Live Lab render failures");
assert.match(pages, /answer === "updated-context"/, "Page 4 has one focused mechanism check");
assert.match(pages, /ORDER_STEPS\.map[\s\S]*l4-new-final-loop|l4-new-final-loop[\s\S]*ORDER_STEPS\.map/, "Page 4 reveals the final loop");
assert.doesNotMatch(pages, /live Qwen|Qwen predicted|real Qwen probabilities/i);

assert.match(lab, /l4-watch-input/);
assert.doesNotMatch(lab, />Text beginning</, "the prompt has no visible Text beginning label");
assert.match(lab, /aria-label="Text beginning"/, "the prompt keeps an accessible name");
assert.match(lab, /DEFAULT_PROMPT = "The little robot opened the"/);
assert.match(lab, /STARTERS = \["The cat sat on the", "Today the weather feels", "A dragon found a"\]/);
assert.match(lab, /MAX_PROMPT_LENGTH = 120/);
assert.match(lab, /TOKEN_LIMITS = \[5, 10, 20, 50, 100\]/);
assert.match(lab, /useState\(20\)/, "default generation limit is 20");
assert.match(lab, /useState\("auto"\)/, "Auto is the default generation mode");
assert.match(lab, /generationMode === "auto"/);
assert.match(lab, /Step by step/);
assert.match(lab, /pauseRequestedRef/);
assert.match(lab, /runState === "paused" \? "Resume"/);
assert.match(lab, /runState === "complete" \? "Run again"/);
assert.match(lab, /if \(runState === "running"\) pause\(\)[\s\S]*setGenerationMode/, "switching modes pauses Auto without resetting");
assert.match(lab, /before \+ prediction\.selected\.raw_token/);
assert.match(lab, /Top 5 shown\. Many other Tokens/);
assert.match(lab, /Generation history/);
assert.match(lab, /steps\.map\(step =>/, "all history steps are retained rather than slicing to five");
assert.match(lab, /scrollTo\(\{ left:historyRef\.current\.scrollWidth/, "new history steps auto-position the recent cards");
assert.match(lab, /setReviewStep\(step\)/);
assert.match(lab, /Return to latest/);
assert.match(lab, /nextSteps\.length >= 2/);
assert.match(lab, /outcome\.prediction\?\.is_eos[\s\S]*setRunState\("complete"\)[\s\S]*break/, "Auto generation stops on EOS");
assert.doesNotMatch(lab, /if \(!reviewStep\) setReviewStep\(null\)/, "An in-flight Auto response cannot force a learner out of history review");
assert.match(lab, /onReview=\{step => \{ if \(runState === "running"\) pause\(\); setReviewStep\(step\); \}\}/, "Reviewing an earlier step pauses Auto and keeps that step selected");
assert.match(lab, /outcome\.limit[\s\S]*setRunState\("limit"\)/, "Auto generation stops at Max Tokens");
assert.match(lab, /l4-watch-context-text[\s\S]*aria-live="polite"/);
assert.match(lab, /<mark aria-label=\{`Latest generated Token:/);
assert.doesNotMatch(lab, /<textarea|Token trail|Your text so far/i);
assert.match(lab, /aria-valuetext/);
assert.match(lab, /aria-live="polite"/);
assert.match(lab, /model\.cancel/);
assert.doesNotMatch(lab, /Prepare model|Add and predict again|chooseOneToken|appendTokenId/);
assert.doesNotMatch(lab, /CAT_CANDIDATES|hard.?coded|fake fallback|promptMappings?/i, "the Live page contains no prediction fixtures or prompt map");
assert.doesNotMatch(lab, /api[_-]?key|Bearer\s/i, "the UI contains no API secret");

assert.match(modelService, /AutoModelForCausalLM/);
assert.match(modelService, /output\.logits/);
assert.match(modelService, /sequenceLength - 1/);
assert.match(modelService, /probabilityDistribution\(logits, temperature\)/);
assert.match(modelService, /topCandidateProbabilities\(probabilities, topK\)/);
assert.match(modelService, /inferenceQueue/);
assert.match(modelService, /modelLoadCount/);
assert.doesNotMatch(modelService, /The little robot|Today the weather|A dragon|CAT_CANDIDATES|fallbackCandidates/i, "the backend contains no prompt-specific prediction mapping or fake fallback");
assert.match(server, /POST[\s\S]*\/api\/next-token/);
assert.match(server, /X-Content-Type-Options/);
assert.match(server, /MAX_BODY_BYTES/);
assert.match(modelConfig, /SmolLM2-135M-Instruct-ONNX/);
assert.match(modelConfig, /b8a5c0f183b78c55955a5364f610c36668b5e681/);
assert.match(modelConfig, /Apache-2\.0/);
assert.match(hook, /fetch\("\/api\/next-token"/);
assert.match(hook, /AbortController/);
assert.match(hook, /X-AI-Explorer-Session/);
assert.match(hook, /cancel[\s\S]*sessionRef\.current = getSessionId\(\)/, "reset cancellation rotates the browser session so stale server work cannot block a new run");
assert.match(hook, /Live model request cancelled/);
assert.match(hook, /fetch\("\/api\/health"/, "a recovered local service clears a stale error state");
assert.match(hook, /\[Lesson4Prediction\]/, "failed requests log developer diagnostics without exposing details in the learner UI");
assert.match(viteConfig, /port:\s*5182/);
assert.match(viteConfig, /"\/api"[\s\S]*target:\s*"http:\/\/127\.0\.0\.1:8787"/, "Vite proxies the same-origin API path to the local model service");
assert.match(devScript, /server\/index\.mjs/);
assert.match(devScript, /dev:frontend/);
assert.equal(JSON.parse(packageSource).scripts.dev, "node scripts/dev.mjs", "one dev command starts frontend and backend");
assert.match(lab, /model\.status === "error"[\s\S]*role="alert"/, "model errors remain local");
assert.match(lab, /function retryPrediction\(\)[\s\S]*model\.retry\(\)[\s\S]*(runAuto|runOneStep)/, "model errors are retryable in one action");
assert.match(lab, /function clearGeneration[\s\S]*setSteps\(\[\]\)/, "Lab reset clears prediction state");
assert.match(lab, /const busy = model\.status === "predicting"/);
assert.match(lab, /if \(autoLoopRef\.current \|\| model\.status === "predicting"\) return/, "overlapping automatic runs are disabled");

const logits = Float32Array.from([0, 1, 2, 3, 4, -1]);
const normal = probabilityDistribution(logits, 1);
const cool = probabilityDistribution(logits, 0.3);
const warm = probabilityDistribution(logits, 1.4);
assert.ok(Math.abs(Array.from(normal).reduce((sum, value) => sum + value, 0) - 1) < 1e-9);
assert.ok(cool[4] > normal[4] && normal[4] > warm[4], "temperature changes the real distribution mathematically");
assert.equal(chooseTokenId(normal, "greedy"), 4);
assert.equal(chooseTokenId(Float64Array.from([0.2, 0.3, 0.5]), "sampling", () => 0.25), 1);
const view = createCandidateView(logits, { 4: " the", 3: ".", 2: "ing", 1: "\n", 0: "x" }, 1, 5);
assert.equal(view.candidates.length, 5);
assert.ok(view.otherProbability > 0, "unshown vocabulary probability is preserved as Other Tokens");
assert.equal(visualiseToken(" the"), "␠the");
assert.equal(visualiseToken("\n"), "↵ newline");

assert.match(css, /^\.mission-lesson-paged\.lesson-4-paged/m);
assert.match(css, /\.lesson-4-live-lab/);
assert.match(css, /overflow-x:\s*hidden/);
for (const width of [1179, 760, 520, 375]) assert.match(css, new RegExp(`max-width:\\s*${width}px`));
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /l4-watch-history\{width:min\(100%,780px\)/, "desktop history viewport shows about five 138px cards");
assert.match(css, /l4-watch-history-track\{[^}]*overflow-x:auto/, "history is the intentional horizontal scroller");
assert.match(css, /l4-watch-prompt label\{[^}]*linear-gradient\(90deg/, "the prompt uses the approved multicolour edge");
assert.match(state, /canAccessFinalChallenge/);

const english = JSON.parse(await read("../src/locales/en/mission4.json"));
for (const key of ["badge", "modelBoundary", "temperatureTechnical", "errorHelp", "retry"]) {
  assert.equal(typeof english.live[key], "string", `English live copy includes ${key}`);
}
for (const language of ["zh", "fr", "de"]) JSON.parse(await read(`../src/locales/${language}/mission4.json`));

process.stdout.write("Lesson 4 teaching and real Live Next Token Lab tests passed.\n");
