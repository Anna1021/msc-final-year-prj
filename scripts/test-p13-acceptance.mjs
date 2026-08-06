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
const lesson4=await read("../src/mission4/Lesson4Pages.jsx");
const lesson5=await read("../src/mission5/Lesson5Pages.jsx");
assert.equal(missionData.length,5);
assert.deepEqual(missionData.map(item=>item.order),[1,2,3,4,5]);
assert.deepEqual(missionData.map(item=>item.skill),["Tokens & Numerical Representations","Reading Context","Finding Helpful Clues","Predicting the Next Token","Learning from Training Examples"]);
for(const [route,component] of [["1-tokenisation-paged","Mission1PagedPrototype"],["2-prediction-paged","Mission2PagedPrototype"],["3-hallucination-paged","Lesson3Paged"],["4-training-data-paged","Lesson4Paged"],["5-bias-paged","Lesson5Paged"]])assert.match(app,new RegExp(`${route.replaceAll("-","\\-")}\"\\) page = <${component}`));
assert.doesNotMatch(app,/5-bias-paged"\) page = <PagedCurriculumMission/);
assert.equal(PAGED_MISSIONS[3].topic,"Finding Helpful Clues");assert.equal(PAGED_MISSIONS[5].topic,"Predicting the Next Token");assert.equal(PAGED_MISSIONS[6].topic,"Learning from Training Examples");
assert.match(shell,/history|onPageChange/);assert.match(shell,/headingRef\.current\?\.focus/);assert.match(shell,/aria-valuenow=\{currentPage\}/);
assert.equal((lesson2.match(/<ReadingBridge>/g)||[]).length,5,"every non-final Lesson 2 page has a bridge");
assert.match(lesson2,/aria-valuetext/);assert.match(lesson2,/hidden=\{!active\}/);
for(const source of [lesson3,lesson4,lesson5])assert.equal((source.match(/<Bridge>/g)||[]).length,5,"every non-final page has a conceptual bridge");
assert.match(lesson3,/updated representation|updated","representation/);assert.match(lesson4,/reviewedProbabilities/);assert.match(lesson4,/highestMode[\s\S]*chanceMode/);assert.match(lesson5,/TARGET_COMPARISONS/);assert.match(lesson5,/ADJUSTMENT/);assert.match(lesson5,/EXAMPLE_GROUPS/);assert.match(lesson5,/aria-pressed=\{answers/);
assert.match(state,/canAccessFinalChallenge/);assert.match(state,/completedCount/);assert.doesNotMatch(app,/missionId && !canAccessMission/);
assert.doesNotMatch(`${lesson2}\n${lesson3}\n${lesson4}\n${lesson5}`,/https?:\/\//);
for(const path of ["../src/mission2/mission2Paged.css","../src/mission3/lesson3Paged.css","../src/mission4/lesson4Paged.css","../src/mission5/lesson5Paged.css"]){const css=await read(path);assert.match(css,/prefers-reduced-motion/);assert.match(css,/overflow-x:hidden/)}
function paths(value,prefix=""){return Object.entries(value).flatMap(([key,child])=>{const next=prefix?`${prefix}.${key}`:key;return child&&typeof child==="object"?paths(child,next):[next]})}
for(const lesson of ["mission2","mission3","mission4","mission5"]){const locales=await Promise.all(["en","zh","fr","de"].map(lang=>read(`../src/locales/${lang}/${lesson}.json`).then(JSON.parse)));const expected=paths(locales[0]).sort();for(const locale of locales)assert.deepEqual(paths(locale).sort(),expected,`${lesson} locale keys match`)}
const en5=JSON.parse(await read("../src/locales/en/mission5.json"));assert.match(en5.page6.trainingFlow,/examples.*tokens.*prediction.*correction.*adjustment.*learned scoring patterns/i);assert.match(en5.page6.generationFlow,/tokens.*context.*relationships.*scores.*probabilities.*selection.*add token.*repeat/i);assert.match(en5.page6.takeaway,/Training.*Generation/i);
assert.doesNotMatch(`${app}\n${lesson5}`,/StoryBuilder|story-builder/);assert.doesNotMatch(`${lesson4}\n${lesson5}`,/fetch\(|AutoModel|pipeline\(/);
process.stdout.write("Phase P13 five-Lesson acceptance checks passed.\n");
