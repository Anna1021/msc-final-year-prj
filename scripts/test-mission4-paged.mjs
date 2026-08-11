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
const [shell, pages, summaryPage, teachingData, quizCopy, sharedQuiz, lab, hook, modelService, server, modelConfig, css, pagedCss, app, course, state, viteConfig, devScript, packageSource, sharedQuizTheme] = await Promise.all([
  read("../src/mission4/Lesson4Paged.jsx"),
  read("../src/mission4/Lesson4TeachingPages.jsx"),
  read("../src/mission4/Lesson4Pages.jsx"),
  read("../src/mission4/lesson4TeachingData.js"),
  read("../src/mission4/mission4QuizCopy.js"),
  read("../src/mission1/Mission1PagedKnowledgeQuiz.jsx"),
  read("../src/mission4/LivePredictionLab.jsx"),
  read("../src/mission4/useLivePredictionModel.js"),
  read("../server/modelService.mjs"),
  read("../server/index.mjs"),
  read("../src/mission4/liveModelConfig.js"),
  read("../src/mission4/lesson4Live.css"),
  read("../src/mission4/lesson4Paged.css"),
  read("../src/main.jsx"),
  read("../src/data/courseData.js"),
  read("../src/state/progress.js"),
  read("../vite.config.js"),
  read("../scripts/dev.mjs"),
  read("../package.json"),
  read("../src/pagedMissions/lessonQuizTheme.css")
]);

assert.equal(PAGED_MISSIONS[5].topic, "Predicting the Next Token");
assert.equal(PAGED_MISSIONS[5].pages.length, 6);
assert.deepEqual(PAGED_MISSIONS[5].pages.map((page) => page[0]), ["predict", "scores", "probabilities", "live", "check", "summary"]);
assert.match(course, /id:\s*5[^\n]*How does a language model choose what comes next\?[\s\S]*Predicting the Next Token/);
assert.match(app, /4-training-data-paged"\) page = <Lesson4Paged/);

assert.match(shell, /Lesson4NewPage1 active=\{currentPage===1\}/);
assert.match(shell, /Lesson4ScorePage active=\{currentPage===2\}/);
assert.match(shell, /Lesson4NewPage2 active=\{currentPage===3\}/);
assert.match(shell, /Lesson4NewPage3 active=\{currentPage===4\}/, "the real-model lab remains mounted as Page 4");
assert.match(shell, /Lesson4NewPage4 active=\{currentPage===5\}/);
assert.match(shell, /lesson-quiz-layout/);
assert.match(shell, /onContinue=\{\(\)=>changePage\(6\)\}/, "quiz completion advances to Page 6");
assert.match(shell, /Lesson4Page6 active=\{currentPage===6\}/);
assert.match(shell, /import LessonPageHero from "\.\.\/pagedMissions\/LessonPageHero\.jsx"/);
assert.match(shell, /pageHero=\{<LessonPageHero[\s\S]*lessonIndex=\{4\}[\s\S]*lessonCount=\{5\}[\s\S]*lessonName=\{t\("mission4\.shell\.topic"\)\}[\s\S]*title=\{t\(page\[1\]\)\}[\s\S]*subtitle=\{t\(page\[2\]\)\}/, "all six Lesson 4 routes use the shared Hero and fixed Lesson 4 metadata");
assert.match(shell, /history\.pushState/);
assert.match(shell, /addEventListener\("popstate"/);
assert.doesNotMatch(shell, /canAdvance=/);
assert.match(shell, /REQUIRED=\["scores","probabilities","live","quiz"\]/);
assert.match(shell, /visited\.has\(pageCount\)/, "direct Page 6 access cannot complete Lesson 4");
assert.match(shell, /nextLesson/);

assert.match(pages, /l4-p1-page[\s\S]*ProcessedRepresentation[\s\S]*l4-p1-question/, "Page 1 bridges processed context to prediction without revealing candidates");
assert.match(pages, /Lesson4ScorePage[\s\S]*l4-score-card[\s\S]*l4-score-row/, "Page 2 compares candidate Tokens with internal score bars");
assert.match(teachingData, /token: "book"[\s\S]*token: "door"[\s\S]*token: "box"[\s\S]*token: "window"[\s\S]*token: "banana"/, "Pages 2 and 3 share the requested illustrative candidates");
assert.doesNotMatch(pages.match(/export function Lesson4ScorePage[\s\S]*?\n}\n\nfunction ProcessedRepresentation/)?.[0] ?? "", /CAT_CANDIDATES|ProbabilityRows|chooseByChance|temperature|logits/i, "Page 2 remains a static score comparison rather than a probability or decoding activity");
assert.doesNotMatch(pages, /Select at least two continuations|selected\.length\s*>?=\s*2/i, "the old English continuation task is gone");
const probabilityPage = pages.match(/export function Lesson4NewPage2[\s\S]*?\n}\n\nfunction ProbabilityScoreRows/)?.[0] ?? "";
assert.match(probabilityPage, /l4-probability-card[\s\S]*ProbabilityScoreRows[\s\S]*ProbabilityChanceRows/, "Page 3 compares internal scores with probabilities");
assert.match(probabilityPage, /ProbabilityKeywordVisual[\s\S]*whyTitle[\s\S]*guaranteeTitle/, "Page 3 includes the probability definition and learner explanation");
assert.doesNotMatch(probabilityPage, /sampling|greedy|temperature|softmax|logits/i, "Page 3 is a non-interactive probability teaching page");
assert.match(teachingData, /probability: 46[\s\S]*probability: 27[\s\S]*probability: 15[\s\S]*probability: 8[\s\S]*probability: 3[\s\S]*probability: 1/, "Page 3 probabilities total 100%");
assert.match(pages, /LiveLabErrorBoundary[\s\S]*LivePredictionLab/, "Page 4 isolates Live Lab render failures");
assert.match(pages, /Mission1PagedKnowledgeQuiz[\s\S]*createMission4QuizCopy/, "Page 5 reuses the established Lesson 1 quiz component");
assert.match(pages, /quizTitle: quizCopy\.conceptCheckpoint/, "Page 5 keeps Concept checkpoint as its short in-card heading");
assert.match(pages, /pageNumber=\{5\}[\s\S]*showLesson1Visuals=\{false\}[\s\S]*showCorrectAnswer/, "Page 5 remains a four-question quiz without Lesson 1 content-specific visuals");
assert.doesNotMatch(pages, /showDecoration=\{false\}/, "Page 5 now uses the same existing question-mark and mascot decoration as every quiz");
assert.match(sharedQuizTheme, /mission-checkpoint-decoration strong[\s\S]*mission-checkpoint-clipboard/, "Lesson 4 receives the shared deep-purple decorative treatment");
assert.doesNotMatch(pages, /<h1/, "Lesson 4 teaching pages leave the only H1 to the shared Hero");
assert.match(pages, /l4-p1-number">1[\s\S]*l4-section-kicker/, "Page 1 keeps its number badge and a short kicker");
assert.match(pages, /l4-score-number">2[\s\S]*l4-section-kicker/, "Page 2 keeps its number badge and a short kicker");
assert.match(pages, /l4-probability-number">3[\s\S]*l4-section-kicker/, "Page 3 keeps its number badge and a short kicker");
assert.match(pages, /l4-live-section-heading[\s\S]*l4-score-number">4[\s\S]*l4-section-kicker/, "Page 4 keeps a number badge and short live-lab kicker outside the model controls");
assert.match(pagedCss, /Pages 1–3: the section lead-in[\s\S]*\.l4-new-main\{[\s\S]*border-radius:28px;[\s\S]*linear-gradient\(135deg/, "Pages 1–3 place their section lead-in and teaching content in one pastel main card");
assert.match(pagedCss, /l4-p1-heading,.l4-score-heading,.l4-probability-heading[\s\S]*l4-section-kicker\{margin:0 0 6px\}/, "Pages 1–3 use a compact kicker-to-intro gap");
assert.match(pagedCss, /p:first-of-type\{[^}]*font-weight:700\}[\s\S]*p:last-of-type\{[^}]*font-weight:500\}/, "Pages 1–3 use semibold then regular intro hierarchy");
assert.match(summaryPage, /Lesson4Page6[\s\S]*LessonSummaryPage[\s\S]*pageNumber="6"[\s\S]*mission4\.page6\.nuance/, "Page 6 uses the shared summary scaffold and keeps the probability nuance");
for (const number of [1, 2, 3, 4]) assert.match(summaryPage, new RegExp(`mission4\\.page6\\.idea${number}Title`), `Page 6 includes summary idea ${number}`);
assert.doesNotMatch(summaryPage, /Lesson4Page6[\s\S]*l4-complete/, "Page 6 relies on the fixed lesson navigation instead of adding a duplicate CTA");
assert.match(quizCopy, /correct:\s*\[1,\s*2,\s*1,\s*2\]/, "Lesson 4 answers are B, C, B, C");
assert.doesNotMatch(quizCopy, /sampling|greedy|top-k|top-p|softmax|logits/i, "the quiz does not introduce decoding jargon");
assert.match(sharedQuiz, /showCorrectAnswer=false[\s\S]*correctAnswerLabel/, "Lesson 4 can reveal the correct answer after an incorrect choice without changing other quizzes");
assert.doesNotMatch(pages, /live Qwen|Qwen predicted|real Qwen probabilities/i);

assert.match(lab, /l4-watch-input/);
assert.doesNotMatch(lab, />Text beginning</, "the prompt has no visible Text beginning label");
assert.match(lab, /aria-label=\{t\("mission4\.live\.lab\.textBeginning"\)\}/, "the prompt keeps a localized accessible name");
assert.match(lab, /DEFAULT_PROMPT = "The little robot opened the"/);
assert.match(lab, /STARTERS = \["The cat sat on the", "Today the weather feels", "A dragon found a"\]/);
assert.match(lab, /MAX_PROMPT_LENGTH = 120/);
assert.match(lab, /TOKEN_LIMITS = \[5, 10, 20, 50, 100\]/);
assert.match(lab, /useState\(20\)/, "default generation limit is 20");
assert.match(lab, /useState\("auto"\)/, "Auto is the default generation mode");
assert.match(lab, /generationMode === "auto"/);
assert.match(lab, /mission4\.live\.lab\.stepByStep/);
assert.match(lab, /pauseRequestedRef/);
assert.match(lab, /runState === "paused" \? "resume"/);
assert.match(lab, /runState === "complete" \? "runAgain"/);
assert.match(lab, /if \(runState === "running"\) pause\(\)[\s\S]*setGenerationMode/, "switching modes pauses Auto without resetting");
assert.match(lab, /before \+ prediction\.selected\.raw_token/);
assert.match(lab, /mission4\.live\.lab\.topFive/);
assert.match(lab, /mission4\.live\.lab\.historyTitle/);
assert.match(lab, /steps\.map\(step =>/, "all history steps are retained rather than slicing to five");
assert.match(lab, /scrollTo\(\{ left:historyRef\.current\.scrollWidth/, "new history steps auto-position the recent cards");
assert.match(lab, /setReviewStep\(step\)/);
assert.match(lab, /mission4\.live\.lab\.returnLatest/);
assert.match(lab, /setMessage\(\{ key:"stepMessage", params:\{ step:step\.step, token:prediction\.selected\.display_token \} \}\)/, "dynamic status stores a stable key and interpolation parameters");
assert.match(lab, /message \? t\(`mission4\.live\.lab\.\$\{message\.key\}`/, "dynamic status is translated during render so language changes remain reactive");
assert.match(lab, /nextSteps\.length >= 2/);
assert.match(lab, /outcome\.prediction\?\.is_eos[\s\S]*setRunState\("complete"\)[\s\S]*break/, "Auto generation stops on EOS");
assert.doesNotMatch(lab, /if \(!reviewStep\) setReviewStep\(null\)/, "An in-flight Auto response cannot force a learner out of history review");
assert.match(lab, /onReview=\{step => \{ if \(runState === "running"\) pause\(\); setReviewStep\(step\); \}\}/, "Reviewing an earlier step pauses Auto and keeps that step selected");
assert.match(lab, /outcome\.limit[\s\S]*setRunState\("limit"\)/, "Auto generation stops at Max Tokens");
assert.match(lab, /l4-watch-context-text[\s\S]*aria-live="polite"/);
assert.match(lab, /<mark aria-label=\{t\("mission4\.live\.lab\.latestToken"/);
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
assert.match(pagedCss, /\.lesson-4-paged\.lesson-quiz-layout \.lesson-page-hero\{display:grid!important\}/, "the Lesson 4 quiz restores only its scoped shared Hero");
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
assert.equal(english.page6.eyebrow, "Summary", "Page 6 uses the requested short summary kicker");
assert.equal(english.quiz.q1B, "The model currently considers the token a better fit for the context");
assert.equal(english.quiz.q2C, "This token is more likely to be chosen than options with lower probabilities");
assert.equal(english.quiz.q3B, "The token is added to the context, and the model predicts again");
assert.equal(english.quiz.q4C, "How focused or varied the model's next-token choices can be");

process.stdout.write("Lesson 4 teaching and real Live Next Token Lab tests passed.\n");
