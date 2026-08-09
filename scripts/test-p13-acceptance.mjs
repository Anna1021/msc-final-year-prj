import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {missionData} from "../src/data/courseData.js";
import {PAGED_MISSIONS} from "../src/pagedMissions/missionCurriculumData.js";
const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const app=await read("../src/main.jsx");
const shell=await read("../src/mission1/MissionLessonShell.jsx");
const state=await read("../src/state/progress.js");
const lesson2=await read("../src/mission2/Mission2ContextPages.jsx");
const lesson3=await read("../src/mission3/Lesson3Pages.jsx");
const lesson4=await read("../src/mission4/Lesson4TeachingPages.jsx");
const lesson4Live=await read("../src/mission4/LivePredictionLab.jsx");
const lesson4ModelService=await read("../server/modelService.mjs");
const lesson5=await read("../src/mission5/Lesson5Pages.jsx");
const lesson5TrainingMath=await read("../src/mission5/lesson5TrainingMath.js");
const lessonShells=await Promise.all([
  "../src/mission2/Mission2PagedPrototype.jsx",
  "../src/mission3/Lesson3Paged.jsx",
  "../src/mission4/Lesson4Paged.jsx",
  "../src/mission5/Lesson5Paged.jsx"
].map(read));
assert.equal(missionData.length,5);
assert.deepEqual(missionData.map(item=>item.order),[1,2,3,4,5]);
assert.deepEqual(missionData.map(item=>item.skill),["Tokens & Numerical Representations","Reading Context","Connecting the Tokens","Predicting the Next Token","How the Model Learns"]);
for(const [route,component] of [["1-tokenisation-paged","Mission1PagedPrototype"],["2-prediction-paged","Mission2PagedPrototype"],["3-hallucination-paged","Lesson3Paged"],["4-training-data-paged","Lesson4Paged"],["5-bias-paged","Lesson5Paged"]])assert.match(app,new RegExp(`${route.replaceAll("-","\\-")}\"\\) page = <${component}`));
assert.doesNotMatch(app,/5-bias-paged"\) page = <PagedCurriculumMission/);
assert.equal(PAGED_MISSIONS[3].topic,"Connecting the Tokens");assert.equal(PAGED_MISSIONS[5].topic,"Predicting the Next Token");assert.equal(PAGED_MISSIONS[6].topic,"How the Model Learns to Predict");
assert.match(shell,/history|onPageChange/);assert.match(shell,/headingRef\.current\?\.focus/);assert.match(shell,/aria-valuenow=\{currentPage\}/);
assert.equal((lesson2.match(/<ReadingBridge>/g)||[]).length,5,"every non-final Lesson 2 page has a bridge");
assert.match(lesson2,/aria-valuetext/);assert.match(lesson2,/hidden=\{!active\}/);
assert.match(lesson5,/l5-new-target-lab[\s\S]*l5-new-control-board[\s\S]*l5-new-conveyor-lab[\s\S]*l5-new-two-paths/);
assert.match(lesson3,/l3-representation[\s\S]*is-updated/);assert.match(lesson4,/reviewedProbabilities/);assert.match(lesson4,/ProbabilityRows[\s\S]*LiveLabErrorBoundary[\s\S]*l4-new-quiz/);assert.match(lesson4Live,/generationMode[\s\S]*Auto[\s\S]*Step by step/);assert.match(lesson4ModelService,/AutoModelForCausalLM[\s\S]*output\.logits/);assert.match(lesson5,/BEFORE_ADJUSTMENT/);assert.match(lesson5,/runTrainingSteps/);assert.match(lesson5TrainingMath,/softmax[\s\S]*crossEntropy[\s\S]*applyTrainingStep/);assert.match(lesson5,/TRAINING_EXAMPLES/);assert.match(lesson5,/TRAINING_STEPS[\s\S]*GENERATION_STEPS|GENERATION_STEPS[\s\S]*TRAINING_STEPS/);
assert.match(state,/canAccessFinalChallenge/);assert.match(state,/completedCount/);assert.doesNotMatch(app,/missionId && !canAccessMission/);
assert.doesNotMatch(`${lesson2}\n${lesson3}\n${lesson4}\n${lesson5}`,/https?:\/\//);
for(const path of ["../src/mission2/mission2Paged.css","../src/mission3/lesson3Paged.css","../src/mission4/lesson4Paged.css","../src/mission5/lesson5Paged.css"]){const css=await read(path);assert.match(css,/prefers-reduced-motion/);assert.match(css,/overflow-x:hidden/)}
function paths(value,prefix=""){return Object.entries(value).flatMap(([key,child])=>{const next=prefix?`${prefix}.${key}`:key;return child&&typeof child==="object"?paths(child,next):[next]})}
for(const lesson of ["mission2","mission3","mission5"]){const locales=await Promise.all(["en","zh","fr","de"].map(lang=>read(`../src/locales/${lang}/${lesson}.json`).then(JSON.parse)));const expected=paths(locales[0]).sort();for(const locale of locales)assert.deepEqual(paths(locale).sort(),expected,`${lesson} locale keys match`)}
for(const language of ["en","zh","fr","de"]) JSON.parse(await read(`../src/locales/${language}/mission4.json`));
const en5=JSON.parse(await read("../src/locales/en/mission5.json"));assert.match(en5.page4.bridge,/Training changes.*Generation/i);assert.match(en5.page4.steps.adjust,/parameters/i);assert.match(en5.page4.steps.select,/Token/i);
assert.doesNotMatch(`${app}\n${lesson5}`,/StoryBuilder|story-builder/);assert.doesNotMatch(lesson5,/fetch\(|AutoModel|pipeline\(/);assert.doesNotMatch(lesson4Live,/api[_-]?key|Bearer\s/i);
const officialSummaries=`${lesson2}\n${lesson3}\n${lesson4}\n${lesson5}\n${lessonShells.join("\n")}`;
assert.doesNotMatch(officialSummaries,/>Next Lesson\s*</,"official summary actions use i18n rather than hard-coded English");
assert.doesNotMatch(officialSummaries,/You can continue now\.|You can explore the Final Challenge now\./,"official summary guidance uses i18n rather than hard-coded English");
assert.match(officialSummaries,/learningMode\.notice/);assert.match(officialSummaries,/mission5\.shell\.nextChallenge/);
process.stdout.write("Phase P13 five-Lesson acceptance checks passed.\n");
