import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PAGED_MISSIONS} from "../src/pagedMissions/missionCurriculumData.js";
import {
  MAX_TRAINING_STEPS,applyTrainingStep,controlPositions,createTrainingState,
  runTrainingSteps,toProbabilityRows
} from "../src/mission5/lesson5TrainingMath.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const[shell,pages,data,math,css,app,course,state]=await Promise.all([
  read("../src/mission5/Lesson5Paged.jsx"),read("../src/mission5/Lesson5Pages.jsx"),
  read("../src/mission5/lesson5TeachingData.js"),read("../src/mission5/lesson5TrainingMath.js"),read("../src/mission5/lesson5Paged.css"),
  read("../src/main.jsx"),read("../src/data/courseData.js"),read("../src/state/progress.js")
]);

assert.equal(PAGED_MISSIONS[6].topic,"How the Model Learns to Predict");
assert.equal(PAGED_MISSIONS[6].pages.length,4);
assert.deepEqual(PAGED_MISSIONS[6].pages.map(page=>page[0]),["origin","adjust","repeat","connect"]);
assert.match(course,/id:\s*6[^\n]*How does a language model learn to predict\?[\s\S]*How the Model Learns/);
assert.match(app,/5-bias-paged"\) page = <Lesson5Paged/);
for(let page=1;page<=4;page+=1)assert.match(shell,new RegExp(`Lesson5NewPage${page} active=\\{currentPage===${page}\\}`));
assert.match(shell,/history\.pushState/);
assert.match(shell,/addEventListener\("popstate"/);
assert.doesNotMatch(shell,/canAdvance=/);
assert.match(shell,/REQUIRED=\["reveal-target","adjust-parameters","repeat-examples","connect-paths"\]/);
assert.match(shell,/visited\.has\(pageCount\)/,"direct Page 4 access cannot complete Lesson 5");
assert.match(shell,/next\.missions\[6\]/,"stable completion storage ID remains 6");
assert.match(shell,/navigate\("\/final-challenge"\)/);
assert.match(shell,/nextChallenge/);

assert.doesNotMatch(`${pages}\n${data}`,/PUPPY_CHOICES|Choose the token you think came next|copying|generalising/i,"English guessing and copying quizzes are no longer official");
assert.match(pages,/TRAINING_PROMPT[\s\S]*BEFORE_ADJUSTMENT[\s\S]*l5-new-real-target/,"Page 1 begins with prediction and known training target");
assert.match(pages,/Reveal the real Token|mission5\.actions\.reveal/);
assert.match(pages,/l5-new-comparison[\s\S]*realToken/,"prediction and target are compared");
assert.match(pages,/createTrainingState[\s\S]*runTrainingSteps[\s\S]*controlPositions/);
assert.match(pages,/mission5\.actions\.runOne[\s\S]*mission5\.actions\.runFive[\s\S]*mission5\.actions\.resetTraining/);
assert.doesNotMatch(`${pages}\n${data}\n${math}`,/AFTER_ADJUSTMENT|probability\s*\+=|trainingSteps\s*=\s*\[/i,"Page 2 has no predefined probability sequence");
assert.match(math,/const gradient = state\.probabilities\.map/);
assert.match(math,/probability - \(index === TRAINING_TARGET_INDEX \? 1 : 0\)/);
assert.match(math,/logit - learningRate \* gradient\[index\]/);
assert.match(pages,/TRAINING_EXAMPLES[\s\S]*GRADUAL_PATTERN_STATES[\s\S]*nextExample/,"Page 3 repeats a gradual example stream");
assert.equal((data.match(/context:/g)||[]).length,4);
assert.match(data,/probability:21[\s\S]*probability:31/,"teaching pattern changes remain gradual");
assert.doesNotMatch(PAGED_MISSIONS[6].pages.flat().join(" "),/memory|memorisation|generalisation/i,"generalisation is not a standalone page");
assert.match(pages,/TRAINING_STEPS/);
assert.match(pages,/GENERATION_STEPS/);
assert.match(pages,/l5-new-parameter-bridge/,"Page 4 distinguishes and connects training and generation");
for(const className of["l5-new-sidebar","l5-new-key-ideas","l5-new-technical"])assert.match(pages,new RegExp(className));
assert.doesNotMatch(`${pages}\n${data}\n${math}`,/fetch\(|axios|AutoModel|pipeline\(|Qwen gradients|Qwen parameter values/i);
assert.match(pages,/aria-live|role="status"/);
assert.match(css,/^\.mission-lesson-paged\.lesson-5-paged/m);
assert.match(css,/\.l5-new-layout\{display:grid;grid-template-columns/);
for(const width of[1179,980,760,520,375])assert.match(css,new RegExp(`max-width:${width}px`));
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/focus-visible/);
assert.match(state,/canAccessFinalChallenge/);

const initial=createTrainingState();
assert.equal(initial.step,0);
assert.ok(Math.abs(initial.probabilities.reduce((sum,value)=>sum+value,0)-1)<1e-12);
assert.deepEqual(toProbabilityRows(initial).map(row=>Math.round(row.probability)),[35,28,20,17]);
const oneStep=applyTrainingStep(initial);
assert.equal(oneStep.step,1);
assert.ok(oneStep.probabilities[0]>initial.probabilities[0],"target probability rises after a real gradient update");
assert.ok(oneStep.loss<initial.loss,"cross-entropy falls after a real gradient update");
assert.ok(Math.abs(oneStep.probabilities.reduce((sum,value)=>sum+value,0)-1)<1e-12);
const fiveAtOnce=runTrainingSteps(initial,5);
let fiveSequential=initial;
for(let index=0;index<5;index+=1)fiveSequential=applyTrainingStep(fiveSequential);
assert.deepEqual(fiveAtOnce,fiveSequential,"Run 5 is exactly five real SGD updates");
const converged=runTrainingSteps(initial,MAX_TRAINING_STEPS);
assert.ok(converged.probabilities[0]>fiveAtOnce.probabilities[0]);
assert.ok(converged.loss<fiveAtOnce.loss);
assert.deepEqual(createTrainingState(),initial,"Reset is deterministic");
assert.notDeepEqual(controlPositions(oneStep),controlPositions(initial),"parameter controls respond to the calculated update");
assert.match(pages,/completionAnnounced[\s\S]*onComplete/,'completion is idempotent after the first real step');

function leafPaths(value,prefix=""){return Object.entries(value).flatMap(([key,child])=>{const path=prefix?`${prefix}.${key}`:key;return child&&typeof child==="object"?leafPaths(child,path):[path]})}
const locales=await Promise.all(["en","zh","fr","de"].map(async language=>JSON.parse(await read(`../src/locales/${language}/mission5.json`))));
const expected=leafPaths(locales[0]).sort();
for(const[index,locale]of locales.entries())assert.deepEqual(leafPaths(locale).sort(),expected,`${["en","zh","fr","de"][index]} Lesson 5 keys match`);
assert.equal(locales[0].shell.nextChallenge,"Next: Final Challenge");
assert.match(locales[0].page1.subtitle,/real next Token/);
assert.match(locales[0].page2.takeaway,/Compare with the real target/);
assert.match(locales[0].labels.realOptimisation,/calculated live[\s\S]*not Qwen training/i);
assert.match(locales[0].page3.takeaway,/huge amounts of text/);
assert.match(locales[0].page4.bridge,/Training changes[\s\S]*Generation/);

process.stdout.write("Lesson 5 How the Model Learns to Predict tests passed.\n");
