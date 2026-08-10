import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [prototype, idPages, playgroundPage, playground, client, quiz, quizCopy, finalPages, shell, css] = await Promise.all([
  read("../src/mission1/Mission1PagedPrototype.jsx"), read("../src/mission1/Mission1PagedIdJourneyPages.jsx"),
  read("../src/mission1/Mission1PagedPlaygroundPage.jsx"), read("../src/mission1/QwenTokenizerPlayground.jsx"),
  read("../src/mission1/liveTokenizerClient.js"), read("../src/mission1/Mission1PagedKnowledgeQuiz.jsx"), read("../src/mission1/lesson1JourneyCopy.js"),
  read("../src/mission1/Mission1PagedFinalPages.jsx"), read("../src/mission1/MissionLessonShell.jsx"), read("../src/mission1/mission1Paged.css")
]);

assert.match(prototype,/intro[\s\S]*demo[\s\S]*id-journey[\s\S]*playground[\s\S]*knowledge-check[\s\S]*summary/);
assert.match(idPages,/data-lesson-page="3"[\s\S]*ID 305[\s\S]*VALUES\.map/);
assert.match(idPages,/lesson1-open-book\.png/);
assert.match(idPages,/mission-journey-card-body/);
assert.match(idPages,/0\.12[\s\S]*−0\.87[\s\S]*1\.35[\s\S]*−1\.02/);
assert.match(prototype,/Mission1PagedPlaygroundPage active=\{currentPage === 4\}/);
assert.match(playgroundPage,/data-lesson-page="4"/);
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
assert.match(shell,/history|currentPage \+ 1|currentPage - 1/);
assert.match(css,/mission-number-journey-flow/);
assert.match(css,/mission-journey-card-body/);
assert.match(css,/article>small[\s\S]*justify-content:flex-start/);
assert.match(css,/mission-checkpoint-layout[\s\S]*mission-checkpoint-options/);
assert.match(css,/m1-preset:nth-child\(2\)[\s\S]*#e4edff[\s\S]*m1-preset:nth-child\(3\)[\s\S]*#dcf6eb/);
assert.match(css,/m1-playground--paged textarea[\s\S]*#fff0f7[\s\S]*#f3edff[\s\S]*#eaf6ff/);
assert.match(css,/mission-checkpoint-sidebar>button[\s\S]*:disabled[\s\S]*:focus-visible/);
assert.match(css,/max-width:820px/);
assert.match(css,/max-width:820px[\s\S]*grid-template-columns:repeat\(3/);
assert.doesNotMatch(css,/mission-checkpoint-sidebar\{display:none\}/);
assert.match(css,/max-width:980px/);
assert.match(css,/max-width:620px/);
assert.doesNotMatch(css,/(^|[},]\s*)\.(card|button|token|robot|main-column|right-column)(?=[\s,{:.#])/m);

process.stdout.write("Mission 1 paged journey tests passed.\n");
