import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getLesson1JourneyCopy } from "../src/mission1/lesson1JourneyCopy.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [prototype, idPages, playgroundPage, playground, client, quiz, quizCopy, finalPages, shell, css, quizTheme, app] = await Promise.all([
  read("../src/mission1/Mission1PagedPrototype.jsx"), read("../src/mission1/Mission1PagedIdJourneyPages.jsx"),
  read("../src/mission1/Mission1PagedPlaygroundPage.jsx"), read("../src/mission1/QwenTokenizerPlayground.jsx"),
  read("../src/mission1/liveTokenizerClient.js"), read("../src/mission1/Mission1PagedKnowledgeQuiz.jsx"), read("../src/mission1/lesson1JourneyCopy.js"),
  read("../src/mission1/Mission1PagedFinalPages.jsx"), read("../src/mission1/MissionLessonShell.jsx"), read("../src/mission1/mission1Paged.css"),
  read("../src/pagedMissions/lessonQuizTheme.css"), read("../src/main.jsx")
]);

assert.match(prototype,/intro[\s\S]*demo[\s\S]*id-journey[\s\S]*playground[\s\S]*knowledge-check[\s\S]*summary/);
assert.match(prototype,/import LessonPageHero from "\.\.\/pagedMissions\/LessonPageHero\.jsx"/);
assert.match(prototype,/pageHero=\{<LessonPageHero[\s\S]*lessonIndex=\{1\}[\s\S]*lessonCount=\{5\}[\s\S]*lessonName=\{t\("mission1\.paged\.tokenisation"\)\}/);
assert.match(prototype,/pageQuizCopy = \{ \.\.\.journeyCopy, quizTitle: journeyCopy\.conceptCheckpoint \}/);
assert.match(prototype,/getMission1IntroFixture\(language\)/, "the verified intro fixture follows the active locale");
assert.match(prototype,/那只[\s\S]*小[\s\S]*猫[\s\S]*安静[\s\S]*坐在[\s\S]*窗[\s\S]*边/, "Chinese page 1 uses a Chinese token-building example");
assert.match(prototype,/人工智能[\s\S]*人工[\s\S]*智能/, "Chinese page 1 compares two plausible segmentations without English");
assert.match(prototype,/focusText: "小猫"[\s\S]*focusPieces: \["小", "猫"\]/, "Chinese page 2 explains a real split from the verified fixture");
assert.match(prototype,/<h2><span>1<\/span>\{t\("mission1\.intro\.buildingLabel"\)\}<\/h2>/);
assert.match(prototype,/<h2><span>2<\/span>\{t\("mission1\.demo\.realPieces"\)\}<\/h2>[\s\S]*onClick=\{replayExample\}/);
assert.match(idPages,/data-lesson-page="3"[\s\S]*copy\.tokenId[\s\S]*VALUES\.map/);
assert.match(quizCopy,/sampleToken: "猫"[\s\S]*tokenId: "100472"/, "Chinese ID journey continues the verified cat token example");
assert.match(idPages,/<h2><span>3<\/span>\{copy\.idTitle\}<\/h2>/);
assert.match(idPages,/lesson1-open-book\.png/);
assert.match(idPages,/mission-journey-card-body/);
assert.match(idPages,/0\.12[\s\S]*−0\.87[\s\S]*1\.35[\s\S]*−1\.02/);
assert.match(prototype,/Mission1PagedPlaygroundPage active=\{currentPage === 4\}/);
assert.match(playgroundPage,/data-lesson-page="4"/);
assert.match(playgroundPage,/<h2><span>4<\/span>\{t\("mission1\.paged\.experimentFlowLabel"\)\}<\/h2>/);
assert.match(playground,/tokenizeWithLiveModel\(input\)/);
assert.match(client,/endpoint:"\/api\/tokenize"/);
assert.match(quiz,/pageNumber=5[\s\S]*data-lesson-page=\{pageNumber\}/);
assert.match(quiz,/role="status"/);
assert.match(quiz,/currentQuestion[\s\S]*selected[\s\S]*answerState[\s\S]*completed/);
assert.match(quiz,/role="radiogroup"[\s\S]*role="radio"[\s\S]*aria-checked/);
assert.match(quiz,/answerState==="incorrect"[\s\S]*retry/);
assert.match(quiz,/latestQuestion[\s\S]*responses[\s\S]*showQuestion/);
assert.match(quiz,/mission-checkpoint-sidebar[\s\S]*<button[\s\S]*aria-current[\s\S]*disabled=\{locked\}/);
assert.match(quiz,/reviewing[\s\S]*returnToLatest/);
assert.match(quiz,/misunderstanding[\s\S]*mis[\s\S]*under[\s\S]*standing/);
assert.match(quiz,/showLesson1Visuals=true[\s\S]*showLesson1Visuals&&currentQuestion===1/, "Lesson 1 keeps its existing question visuals when using the shared framework");
assert.doesNotMatch(quiz,/unbelievable|Tokenizer A|Tokenizer B/);
assert.match(quizCopy,/33865 · 7995 · 10070/);
assert.match(quiz,/finishCheckpoint[\s\S]*nextQuestion/);
assert.match(quiz,/mission-checkpoint-complete[\s\S]*onContinue/);
assert.match(prototype,/hideNext=\{currentPage === 5\}/);
assert.match(shell,/!hideNext && <button/);
assert.match(prototype,/playgroundComplete && quizResult === "correct"/);
assert.match(prototype,/currentPage !== 6 \|\| !coreComplete/);
assert.doesNotMatch(finalPages,/Mission1PagedNumbersPage|lookupStep|embeddingSecondary/);
assert.match(finalPages,/data-lesson-page="6"/);
assert.match(finalPages,/mission-summary-mini-id[\s\S]*\{idLabel\}/, "the summary reuses the locale-specific token ID example");
assert.match(finalPages,/<h2><span>6<\/span>\{t\("mission1\.sections\.summary"\)\}<\/h2>/);
assert.match(shell,/history|currentPage \+ 1|currentPage - 1/);
assert.match(css,/mission-number-journey-flow/);
assert.match(css,/mission-journey-card-body/);
assert.match(css,/article>small[\s\S]*justify-content:flex-start/);
assert.match(css,/mission-checkpoint-layout[\s\S]*mission-checkpoint-options/);
assert.match(css,/mission-1-paged\.lesson-quiz-layout \.lesson-page-hero\{display:grid!important\}/);
assert.match(css,/m1-preset:nth-child\(2\)[\s\S]*#e4edff[\s\S]*m1-preset:nth-child\(3\)[\s\S]*#dcf6eb/);
assert.match(css,/m1-playground--paged textarea[\s\S]*#fff0f7[\s\S]*#f3edff[\s\S]*#eaf6ff/);
assert.match(css,/mission-checkpoint-sidebar>button[\s\S]*:disabled[\s\S]*:focus-visible/);
assert.match(css,/max-width:820px/);
assert.match(css,/max-width:820px[\s\S]*grid-template-columns:repeat\(3/);
assert.doesNotMatch(css,/mission-checkpoint-sidebar\{display:none\}/);
assert.match(css,/max-width:980px/);
assert.match(css,/max-width:620px/);
assert.match(app,/import "\.\/pagedMissions\/lessonQuizTheme\.css"/,"the app loads one shared Lesson 1–5 quiz theme after lesson styles");
assert.match(quizTheme,/--quiz-max-width:1500px/,"the shared theme preserves the wide quiz canvas");
assert.match(quizTheme,/mission-knowledge-quiz::before\{[\s\S]*content:none[\s\S]*mission-checkpoint-banner::after\{[\s\S]*content:none/,"the shared outer and intro purple aura layers are disabled");
assert.doesNotMatch(quizTheme,/--quiz-glow-blue|--quiz-glow-violet|0 0 52px rgba\(113,82,218/,"the shared quiz theme no longer defines an oversized violet bloom");
assert.match(quizTheme,/mission-checkpoint-clipboard\{[\s\S]*box-shadow:0 10px 18px rgba\(48,62,105,\.15\)/,"the decorative clipboard keeps a subtle cool shadow");
assert.doesNotMatch(quizTheme,/linear-gradient\([^\n]*#f9e7f7|rgba\(255,220,242/,"the shared outer and intro theme has no large pink wash");
assert.doesNotMatch(css,/(^|[},]\s*)\.(card|button|token|robot|main-column|right-column)(?=[\s,{:.#])/m);

const quizCopies = ["en", "zh", "fr", "de"].map(getLesson1JourneyCopy);
for (const [index, copy] of quizCopies.entries()) {
  const language = ["en", "zh", "fr", "de"][index];
  assert.equal(copy.checkpointQuestions.length, 3, `${language} keeps all three quiz questions`);
  assert.deepEqual(copy.checkpointQuestions.map((question) => question.options.length), [4, 4, 4], `${language} localizes all quiz options`);
  assert.deepEqual(copy.checkpointQuestions.map((question) => question.correct), [1, 1, 2], `${language} preserves answer identity`);
  assert.ok(copy.checkpointQuestions.every((question) => question.correctFeedback && question.incorrectFeedback), `${language} localizes quiz feedback`);
}
assert.notEqual(quizCopies[0].checkpointQuestions[0].prompt, quizCopies[1].checkpointQuestions[0].prompt, "Chinese quiz copy does not inherit English prompts");
assert.notEqual(quizCopies[0].checkpointQuestions[0].prompt, quizCopies[2].checkpointQuestions[0].prompt, "French quiz copy does not inherit English prompts");
assert.notEqual(quizCopies[0].checkpointQuestions[0].prompt, quizCopies[3].checkpointQuestions[0].prompt, "German quiz copy does not inherit English prompts");
assert.doesNotMatch(quiz, /key=\{language\}|key=\{locale\}/, "locale changes do not remount or reset the quiz");

process.stdout.write("Mission 1 paged journey tests passed.\n");
