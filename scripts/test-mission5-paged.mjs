import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PAGED_MISSIONS} from "../src/pagedMissions/missionCurriculumData.js";
import {
  MAX_TRAINING_STEPS,applyTrainingStep,controlPositions,createTrainingState,
  runTrainingSteps,toProbabilityRows
} from "../src/mission5/lesson5TrainingMath.js";
import {
  AVAILABLE_TRAINING_EXAMPLES,STARTER_TRAINING_EXAMPLES,calculateToyPrediction,
  predictionDeltas
} from "../src/mission5/lesson5ToyTraining.js";
import {createMission5QuizCopy,MISSION_5_QUIZ_CORRECT_ANSWERS} from "../src/mission5/mission5QuizCopy.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const[shell,pages,data,math,css,quizFramework,quizCopySource,app,course,state,sharedQuizTheme]=await Promise.all([
  read("../src/mission5/Lesson5Paged.jsx"),read("../src/mission5/Lesson5Pages.jsx"),
  read("../src/mission5/lesson5TeachingData.js"),read("../src/mission5/lesson5TrainingMath.js"),read("../src/mission5/lesson5Paged.css"),
  read("../src/mission1/Mission1PagedKnowledgeQuiz.jsx"),read("../src/mission5/mission5QuizCopy.js"),
  read("../src/main.jsx"),read("../src/data/courseData.js"),read("../src/state/progress.js"),
  read("../src/pagedMissions/lessonQuizTheme.css")
]);

assert.equal(PAGED_MISSIONS[6].topic,"How the Model Learns to Predict");
assert.equal(PAGED_MISSIONS[6].pages.length,7);
assert.deepEqual(PAGED_MISSIONS[6].pages.map(page=>page[0]),["origin","adjust","repeat","connect","try","quiz","summary"]);
assert.match(course,/id:\s*6[^\n]*How does a language model learn to predict\?[\s\S]*How the Model Learns/);
assert.match(app,/5-bias-paged"\) page = <Lesson5Paged/);
for(const page of[1,2,3,4,5,7])assert.match(shell,new RegExp(`Lesson5NewPage${page} active=\\{currentPage===${page}\\}`));
assert.match(shell,/Mission1PagedKnowledgeQuiz active=\{currentPage===6\}/,"Page 6 renders the shared Lesson 1 quiz framework");
assert.match(shell,/history\.pushState/);
assert.match(shell,/addEventListener\("popstate"/);
assert.doesNotMatch(shell,/canAdvance=/);
assert.match(shell,/REQUIRED=\["reveal-target","adjust-parameters","repeat-examples","connect-paths"\]/);
assert.match(shell,/visited\.has\(pageCount\)/,"direct Page 7 access cannot complete Lesson 5");
assert.match(shell,/next\.missions\[6\]/,"stable completion storage ID remains 6");
assert.match(shell,/navigate\("\/final-challenge"\)/);
assert.match(shell,/nextChallenge/);
assert.match(shell,/import LessonPageHero from "\.\.\/pagedMissions\/LessonPageHero\.jsx"/);
assert.match(shell,/const pageHero=<LessonPageHero[\s\S]*lessonIndex=\{5\}[\s\S]*lessonCount=\{5\}[\s\S]*lessonName=\{t\("mission5\.shell\.topic"\)\}[\s\S]*title=\{t\(page\[1\]\)\}[\s\S]*subtitle=\{pageSubtitle\}/,"all seven Lesson 5 pages, including the summary, use the shared localized Hero");
assert.match(shell,/pageHero=\{pageHero\}/);
assert.match(shell,/Rebuilt Lesson 5 pages use the shared Hero/,"rebuilt Lesson 5 pages carry the shared Hero and non-duplicated-title rule beside the renderer");

assert.doesNotMatch(`${pages}\n${data}`,/PUPPY_CHOICES|Choose the token you think came next|copying|generalising/i,"English guessing and copying quizzes are no longer official");
assert.match(pages,/l5-page-one-short-answer[\s\S]*l5-page-one-flow[\s\S]*l5-page-one-think/,"Page 1 introduces Training with a short answer, four-step visual and examples");
assert.match(pages,/mission5\.page1\.flowAria/,"Page 1 flow accessibility copy is locale-driven");
assert.match(pages,/ExampleStackVisual[\s\S]*PatternNetworkVisual[\s\S]*PatternOrbVisual[\s\S]*PredictionBarsVisual/,"Page 1 uses four substantial original teaching illustrations");
for(const visual of["l5-page-one-document-stack","l5-page-one-pattern-network","l5-page-one-pattern-orb","l5-page-one-prediction-bars"])assert.match(pages,new RegExp(visual));
assert.match(pages,/l5-page-number-badge">1[\s\S]*mission5\.page1\.badge/,"Page 1 keeps The short answer and adds its in-card number badge");
assert.equal((shell.match(/^\s*\["/gm)||[]).length,7,"the real Lesson 5 registry has seven pages");
assert.match(shell,/pageCount=\{pageCount\}/,"navigation and progress use the same seven-page count");
assert.match(shell,/total:pageCount/);
assert.doesNotMatch(shell,/PLANNED_PAGE_COUNT|progressPageCount=/,"Lesson 5 no longer displays a fake count over a four-page router");
assert.match(app,/"\/mission\/5-bias-paged": \{ number: 5, total: 7/,"the learner-facing TopBar also reports seven pages");
assert.match(shell,/Lesson5NewPage1 active=\{currentPage===1\}[\s\S]*Lesson5NewPage2 active=\{currentPage===2\}/,"Page 1 Next can reveal the existing new Page 2 through shared currentPage state");
assert.match(pages,/export function Lesson5NewPage5/,"Page 5 has a real learner-facing component");
assert.doesNotMatch(pages,/export function Lesson5NewPage6/,"Page 6 is no longer a route placeholder");
assert.match(pages,/export function Lesson5NewPage7[\s\S]*LessonSummaryPage[\s\S]*pageNumber="7"/,"Page 7 is a real shared-scaffold lesson summary");
assert.match(pages,/l5-page-one-keyword[\s\S]*mission5\.page1\.term/,"Page 1 has an independent Training keyword card");
assert.match(pages,/l5-page-one-takeaway[\s\S]*CircleDot/,"Page 1 takeaway is a teaching strip rather than a green success alert");
assert.match(pages,/PAGE_2_CANDIDATES=Object\.freeze\(\[\{id:"read",value:46\}[\s\S]*\{id:"write",value:27\}/);
assert.match(pages,/l5-page-two-intro[\s\S]*l5-page-two-pattern-copy[\s\S]*l5-page-two-chart[\s\S]*l5-page-two-takeaway/,"Page 2 follows the approved examples, explanation, probability chart and teaching-strip composition");
assert.match(pages,/is-bar-\$\{index\+1\}[\s\S]*mission5\.page2\.lessLikely[\s\S]*mission5\.page2\.moreLikely/,"Page 2 probability chart has distinct bar classes and a localized likelihood axis");
assert.match(pages,/l5-page-two-keyword[\s\S]*mission5-robot-training\.png/,"Page 2 has the full-height Pattern keyword card and one local mascot");
assert.match(pages,/l5-page-two-intro"><span className="l5-page-number-badge">2[\s\S]*mission5\.page2\.introTitle/,"Page 2 keeps its localized short heading and adds its in-card number badge");
assert.match(css,/\.is-bar-1 i b[\s\S]*\.is-bar-5 i b/,"Page 2 uses five semantically distinct bar colours");
assert.doesNotMatch(`${pages}\n${data}\n${math}`,/AFTER_ADJUSTMENT|probability\s*\+=|trainingSteps\s*=\s*\[/i,"Page 2 has no predefined probability sequence");
assert.match(math,/const gradient = state\.probabilities\.map/);
assert.match(math,/probability - \(index === TRAINING_TARGET_INDEX \? 1 : 0\)/);
assert.match(math,/logit - learningRate \* gradient\[index\]/);
assert.match(pages,/l5-page-three-intro[\s\S]*l5-page-three-flow[\s\S]*is-examples[\s\S]*is-pattern[\s\S]*is-prediction/,"Page 3 follows the approved three-stage examples-to-prediction composition");
assert.match(pages,/PAGE_3_PREDICTIONS=Object\.freeze\(\[\{id:"read",value:62\}[\s\S]*\{id:"write",value:18\}[\s\S]*\{id:"sleep",value:12\}[\s\S]*\{id:"run",value:8\}/,"Page 3 uses stable candidate IDs with the approved illustrative distribution that sums to 100%");
assert.match(pages,/mission5\.page3\.illustrative[\s\S]*mission5\.page3\.takeawayTitle/,"Page 3 localizes the illustrative label and approved takeaway");
assert.match(pages,/l5-page-three-keyword[\s\S]*mission5\.page3\.definition/,"Page 3 has an independent localized Pattern keyword card");
assert.match(pages,/l5-page-three-intro"><span className="l5-page-number-badge">3[\s\S]*mission5\.page3\.introTitle/,"Page 3 keeps its localized short heading and adds its in-card number badge");
assert.match(pages,/PAGE_3_EXAMPLES[\s\S]*mission5\.page3\.tokens\.\$\{id\}[\s\S]*tokenId==="read"/,"Page 3 separates stable teaching-token IDs from localized display labels");
assert.match(css,/\.lesson-5-paged \.l5-page-number-badge\{/,"Lesson 5 badges use one scoped style");
assert.equal((data.match(/context:/g)||[]).length,4);
assert.match(data,/probability:21[\s\S]*probability:31/,"teaching pattern changes remain gradual");
assert.doesNotMatch(PAGED_MISSIONS[6].pages.flat().join(" "),/memory|memorisation|generalisation/i,"generalisation is not a standalone page");
const page4Source=pages.match(/function Page4ProbabilityBars[\s\S]*?function ToyLocationVisual/)?.[0]||"";
assert.match(page4Source,/l5-page-number-badge">4[\s\S]*mission5\.page4\.kicker/,"Page 4 keeps the shared numbered in-card lead-in without repeating the full page title");
assert.doesNotMatch(page4Source,/<h1|PageHeading/,"Page 4 leaves its only full title to the shared LessonPageHero");
assert.match(page4Source,/is-before[\s\S]*is-adjustment[\s\S]*is-after/,"Page 4 uses exactly the approved Before, Adjustment and After teaching sequence");
assert.deepEqual((page4Source.match(/<section className="l5-page-four-stage/g)||[]).length,3,"Page 4 has three major teaching regions");
assert.match(page4Source,/\[\["book",30\],\["door",40\],\["box",20\],\["other",10\]\]/,"Page 4 shows the approved illustrative starting values");
assert.match(page4Source,/\[\["book",65\],\["door",15\],\["box",10\],\["other",10\]\]/,"Page 4 shows the approved values only after many repeated learning steps");
assert.match(page4Source,/l5-page-four-adjustment-visual[\s\S]*<Settings\/>[\s\S]*l5-page-four-pattern-visual/,"Page 4 builds original gear and abstract pattern visuals from SVG and the icon library");
assert.match(page4Source,/l5-page-four-keyword[\s\S]*mission5\.page4\.term[\s\S]*mission5\.page4\.definition[\s\S]*mission5\.page4\.parameterChange/,"Page 4 has one independent Parameter keyword card");
assert.match(page4Source,/mission5\.page4\.illustrative/,"Page 4 explicitly labels the probability states as a simplified illustration");
assert.doesNotMatch(page4Source,/onClick|button|input|range|reset|add example/i,"Page 4 remains a static teaching page and does not borrow Page 5 interactions");
assert.doesNotMatch(page4Source,/training example row|new input|patterns shape predictions|brain/i,"Page 4 does not repeat Page 3 or use a brain metaphor");
assert.match(pages,/Lesson5NewPage4[\s\S]*useEffect\(\(\)=>\{if\(active\)onComplete/,"Page 4 is marked read without requiring an invented interaction");
assert.match(css,/Lesson 5 Page 4: comparison -> one small parameter adjustment -> accumulated learning/);
assert.match(css,/l5-page-four-flow\{display:grid;grid-template-columns:minmax\(210px,1fr\) 34px minmax\(190px,\.84fr\) 34px minmax\(230px,1\.05fr\)/,"Page 4 uses three roomy teaching regions on desktop");
assert.match(css,/l5-page-four-keyword\{position:sticky[\s\S]*min-height:560px/,"the Parameter keyword stays independent in the right column");
const page5Source=pages.match(/function ToyLocationVisual[\s\S]*?export function Lesson5NewPage7/)?.[0]||"";
assert.match(page5Source,/l5-page-number-badge">5[\s\S]*mission5\.page5\.kicker/,"Page 5 uses the shared numbered in-card lead-in without repeating the full title");
assert.doesNotMatch(page5Source,/<h1|PageHeading/,"Page 5 leaves its only full title to the shared LessonPageHero");
assert.match(page5Source,/mission5\.page5\.testPrompt[\s\S]*<strong>___<\/strong>/,"Page 5 keeps one localized fixed test sentence");
assert.match(page5Source,/STARTER_TRAINING_EXAMPLES/,"Page 5 renders the locked starter set");
assert.match(page5Source,/AVAILABLE_TRAINING_EXAMPLES/,"Page 5 renders the bounded preset pool");
assert.match(page5Source,/function addExample[\s\S]*function removeExample[\s\S]*function resetSimulation/,"Page 5 supports adding, removing and resetting examples");
assert.match(page5Source,/aria-live="polite"/,"Page 5 announces the latest prediction change accessibly");
assert.match(page5Source,/l5-page-five-how[\s\S]*l5-page-five-disclaimer/,"Page 5 keeps How it works and the teaching-simulation boundary in its sidebar");
assert.match(page5Source,/<svg viewBox="0 0 120 86"[\s\S]*className="trees"[\s\S]*className="castle-base"[\s\S]*className="cave-rock"/,"Page 5 uses original inline SVG/CSS world illustrations");
assert.doesNotMatch(page5Source,/<input|<textarea|fetch\(|axios/,"Page 5 has no free-text input or model API call");
for(const number of[1,2,3,4])assert.match(pages,new RegExp(`mission5\\.page7\\.idea${number}Title`),`Page 7 includes summary idea ${number}`);
assert.doesNotMatch(pages,/Lesson5PendingPage|l5-route-placeholder/,"Page 7 no longer renders a placeholder or duplicate legacy heading");
assert.match(css,/Three-level colour depth:[\s\S]*l5-new-main[\s\S]*l5-page-one-short-answer[\s\S]*l5-page-five-card/,"Lesson 5 uses one scoped outer and inner pastel depth hierarchy");
assert.match(css,/Level 3 remains clean[\s\S]*l5-page-one-examples article[\s\S]*l5-page-five-latest/,"small Lesson 5 information components remain clean and readable");
assert.match(shell,/navigate\("\/final-challenge"\)/,"the final summary continues to the existing Final Challenge route");
assert.match(shell,/import Mission1PagedKnowledgeQuiz from "\.\.\/mission1\/Mission1PagedKnowledgeQuiz\.jsx"/);
assert.match(shell,/import "\.\.\/mission1\/mission1Paged\.css"/,"Page 6 reuses the established Lesson 1 quiz CSS");
assert.match(shell,/hideNext=\{currentPage===6\}/,"the shell Next button is hidden while the quiz controls progression");
assert.match(shell,/skipAction=\{currentPage===6\?\{label:t\("mission5\.skipQuiz"\),onClick:\(\)=>changePage\(7\)\}:null\}/,"Lesson 5 matches Lesson 1 with a localized Skip the quiz action");
assert.match(shell,/onContinue=\{\(\)=>changePage\(7\)\}[\s\S]*pageNumber=\{6\}/,"quiz completion continues directly to Page 7 and displays badge 6");
assert.match(shell,/quizResult==="correct"/,"Lesson 5 completion includes successful quiz completion");
assert.match(shell,/currentPage===6\?"mission-1-paged mission-2-paged lesson-quiz-layout"/,"Page 6 opts into the same scoped quiz presentation as the existing lessons");
assert.match(sharedQuizTheme,/mission-checkpoint-options button:nth-child\(2\)[\s\S]*nth-child\(3\)[\s\S]*nth-child\(4\)/,"Lesson 5 shares the restrained lavender, blue, mint and yellow answer accents");
assert.doesNotMatch(quizFramework,/<h1/,"the shared quiz card does not duplicate the shared Hero H1");
assert.match(quizFramework,/role="radiogroup"[\s\S]*role="radio"[\s\S]*aria-checked/,"the shared framework provides selectable options");
assert.match(quizFramework,/function checkAnswer[\s\S]*function retry[\s\S]*function advance/,"the shared framework preserves check, retry and next-question behaviour");
assert.match(quizFramework,/mission-checkpoint-position[\s\S]*questions\.map/,"the shared framework provides question progress");
assert.match(quizFramework,/mission-checkpoint-complete/,"the shared framework provides its established completion state");
assert.deepEqual(MISSION_5_QUIZ_CORRECT_ANSWERS,[0,1,1,0],"the four correct answers are A, B, B and A");
assert.match(quizCopySource,/\[1, 2, 3, 4\]\.map/,"Lesson 5 supplies exactly four configured questions");
for(const className of["l5-page-one-keyword","l5-page-two-keyword","l5-page-three-keyword","l5-page-four-keyword"])assert.match(pages,new RegExp(className));
assert.doesNotMatch(`${pages}\n${data}\n${math}`,/fetch\(|axios|AutoModel|pipeline\(|Qwen gradients|Qwen parameter values/i);
assert.match(pages,/aria-live|role="status"/);
assert.match(css,/^\.mission-lesson-paged\.lesson-5-paged/m);
assert.match(css,/\.l5-new-layout\{display:grid;grid-template-columns/);
for(const width of[1179,980,760,520,375])assert.match(css,new RegExp(`max-width:${width}px`));
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/focus-visible/);
assert.match(css,/l5-page-five-stages\{display:grid;grid-template-columns:minmax\(290px,1\.1fr\) 28px minmax\(300px,1\.08fr\) 28px minmax\(230px,\.82fr\)/,"Page 5 uses three teaching stages on desktop");
assert.match(css,/l5-page-five-predictions>div>i b\{[\s\S]*transition:width \.42s ease/,"Page 5 probability bars animate deterministic state changes");
assert.match(css,/@media\(max-width:980px\)\{\.lesson-5-paged\.l5-page-try \.l5-new-layout\{grid-template-columns:1fr\}/,"Page 5 stacks its main card and sidebar safely on narrower screens");
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
assert.match(pages,/Lesson5NewPage2[\s\S]*useEffect\(\(\)=>\{if\(active\)onComplete/,'Page 2 is marked read without adding an interaction');

assert.deepEqual(STARTER_TRAINING_EXAMPLES.map(example=>({id:example.id,location:example.location,starter:example.starter})),[
  {id:"starter-sleeps",location:"cave",starter:true},
  {id:"starter-hides",location:"cave",starter:true},
  {id:"starter-waits",location:"cave",starter:true}
],"starter state stores semantic IDs rather than translated sentences");
assert.ok([...STARTER_TRAINING_EXAMPLES,...AVAILABLE_TRAINING_EXAMPLES].every(example=>!("text" in example)),"toy-model state never persists translated display text");
assert.equal(AVAILABLE_TRAINING_EXAMPLES.length,5,"the add-example control is deliberately bounded to five presets");
assert.deepEqual(calculateToyPrediction([]),{cave:34,forest:33,castle:33},"the initial toy prediction is exactly 34/33/33");
const afterOneCave=calculateToyPrediction(["rests-cave"]);
const afterTwoCaves=calculateToyPrediction(["rests-cave","guards-cave"]);
const afterCastle=calculateToyPrediction(["rests-cave","guards-cave","flies-castle"]);
const afterForest=calculateToyPrediction(["wanders-forest"]);
assert.ok(afterOneCave.cave>34,"adding a cave example raises cave");
assert.ok(afterTwoCaves.cave>afterOneCave.cave,"a second cave example strengthens the cave pattern gradually");
assert.ok(afterCastle.castle>afterTwoCaves.castle,"adding a castle example raises castle");
assert.ok(afterForest.forest>33,"adding a forest example raises forest");
assert.deepEqual(calculateToyPrediction(["rests-cave"]),afterOneCave,"removing the second added example restores the prior deterministic distribution");
const presetIds=AVAILABLE_TRAINING_EXAMPLES.map(example=>example.id);
for(let count=0;count<=presetIds.length;count+=1){
  const result=calculateToyPrediction(presetIds.slice(0,count));
  assert.equal(Object.values(result).reduce((sum,value)=>sum+value,0),100,"toy probabilities always sum to 100");
  assert.ok(Object.values(result).every(value=>value>=0),"toy probabilities never become negative");
}
assert.deepEqual(calculateToyPrediction([]),{cave:34,forest:33,castle:33},"reset returns to the exact initial distribution");
assert.equal(Object.values(predictionDeltas(afterOneCave,afterTwoCaves)).reduce((sum,value)=>sum+value,0),0,"displayed deltas conserve the 100% total");

function leafPaths(value,prefix=""){return Object.entries(value).flatMap(([key,child])=>{const path=prefix?`${prefix}.${key}`:key;return child&&typeof child==="object"?leafPaths(child,path):[path]})}
const locales=await Promise.all(["en","zh","fr","de"].map(async language=>JSON.parse(await read(`../src/locales/${language}/mission5.json`))));
const expected=leafPaths(locales[0]).sort();
for(const[index,locale]of locales.entries())assert.deepEqual(leafPaths(locale).sort(),expected,`${["en","zh","fr","de"][index]} Lesson 5 keys match`);
for(const[index,locale]of locales.entries()){
  const language=["en","zh","fr","de"][index];
  assert.ok(locale.page5.testPrompt,`${language} test prompt is localized`);
  for(const example of [...STARTER_TRAINING_EXAMPLES,...AVAILABLE_TRAINING_EXAMPLES]) assert.ok(locale.page5.examples[example.id],`${language} localizes toy example ${example.id}`);
}
assert.equal(locales[0].shell.nextChallenge,"Next: Final Challenge");
assert.match(locales[0].page1.title,/Where do the patterns come from/);
assert.match(locales[0].page1.subtitle,/After predicting the next token/);
assert.equal(locales[0].shell.topic,"Learning Patterns");
assert.match(locales[0].page2.takeaway,/Compare with the real target/);
assert.match(locales[0].labels.realOptimisation,/calculated live[\s\S]*not Qwen training/i);
assert.match(locales[0].navigation.page3Subtitle,/patterns begin to influence its predictions/);
assert.equal(locales[0].navigation.page4Title,"What happens after comparison?");
assert.match(locales[0].navigation.page4Subtitle,/many small adjustments over time/);
assert.equal(locales[0].page4.term,"Parameter");
assert.match(locales[0].page4.adjustmentBody,/internal parameters/);
assert.match(locales[0].page4.takeawayMany,/Many examples/);
assert.equal(locales[0].navigation.page5Title,"Try it yourself: train a tiny toy model");
assert.match(locales[0].navigation.page5Subtitle,/predictions change/);
assert.match(locales[0].page5.simulationBody,/simplified teaching simulation[\s\S]*Real LLM training uses vastly more data[\s\S]*many internal parameters/i);
assert.match(locales[0].page5.simulationBoundary,/does not work the same way as a real neural network/i);
assert.equal(locales[0].navigation.page6Title,"Check what you learned");
assert.match(locales[0].navigation.page6Subtitle,/Four quick questions[\s\S]*training/);
const translateEnglish=(path,variables={})=>{
  const value=path.split(".").reduce((current,key)=>current?.[key],{mission5:locales[0]});
  return Object.entries(variables).reduce((text,[key,replacement])=>text.replaceAll(`{{${key}}}`,replacement),value);
};
const mission5Quiz=createMission5QuizCopy(translateEnglish);
assert.equal(mission5Quiz.checkpointQuestions.length,4);
assert.deepEqual(mission5Quiz.checkpointQuestions.map(question=>question.correct),[0,1,1,0]);
assert.deepEqual(mission5Quiz.checkpointQuestions.map(question=>question.options.length),[4,4,4,4]);
assert.match(mission5Quiz.checkpointQuestions[0].prompt,/patterns used in an LLM’s later predictions/);
assert.match(mission5Quiz.checkpointQuestions[1].correctFeedback,/recurring relationship[\s\S]*many examples/);
assert.match(mission5Quiz.checkpointQuestions[2].incorrectFeedback,/small adjustments repeated many times/);
assert.match(mission5Quiz.checkpointQuestions[3].correctFeedback,/training examples → learned patterns → later predictions/);
assert.equal(mission5Quiz.continue,"Continue to summary");

process.stdout.write("Lesson 5 How the Model Learns to Predict tests passed.\n");
