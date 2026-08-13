import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { canAccessFinalChallenge, canAccessMission, defaultProgress } from "../src/state/progress.js";
import { ESCAPE_PROGRESS_VERSION, finalExitPuzzle, rooms } from "../src/finalChallenge/escapeRoomData.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const app = await read("../src/main.jsx");
const finalChallenge = await read("../src/finalChallenge/FinalChallenge.jsx");
const runtime = await read("../public/escape-room/index.html");
const shell = await read("../src/mission1/MissionLessonShell.jsx");
const lessonSources = await Promise.all([
  read("../src/mission2/Mission2PagedPrototype.jsx"),
  read("../src/mission3/Lesson3Paged.jsx"),
  read("../src/mission4/Lesson4Paged.jsx"),
  read("../src/mission5/Lesson5Paged.jsx")
]);

assert.equal(canAccessFinalChallenge(defaultProgress), true, "Final Challenge is available with zero completed lessons");
for (const id of [1, 2, 3, 5, 6]) assert.equal(canAccessMission(defaultProgress, id), true, `Lesson storage id ${id} is available`);
assert.doesNotMatch(app, /route === "\/final-challenge" && !canAccessFinalChallenge/, "no Final Challenge route guard remains");
assert.doesNotMatch(app, /function AccessGuardPage/, "obsolete access guard UI is removed");
assert.doesNotMatch(finalChallenge, /setProgress/, "Escape completion cannot mutate five-Lesson progress");
assert.match(app, /onClick=\{\(\) => navigate\("\/final-challenge"\)\}/, "Final Challenge entry navigates directly");
assert.match(shell, /currentPage === pageCount \? onEnd\?\.\(\)/, "final-page footer uses an available continuation action");
for (const source of lessonSources) {
  assert.doesNotMatch(source, /disabled=\{!complete\}/, "summary continuation is never disabled by completion");
  assert.match(source, /navigate\("\/mission\/|navigate\("\/final-challenge"\)|navigate\("\/missions"\)/, "summary has a direct onward route");
}

assert.equal(ESCAPE_PROGRESS_VERSION, 3, "the five-room migration safely invalidates incompatible six-room progress");
assert.deepEqual(rooms.map((room) => room.id), ["token", "numbers", "context", "connections", "prediction"]);
assert.deepEqual(rooms.map((room) => room.crystalId), ["token", "numbers", "connection-lab", "prediction-machine", "prediction"]);
assert.equal(rooms.length, 5, "Final Challenge exposes exactly five rooms and five crystals");
assert.equal(new Set(rooms.map((room) => room.crystalId)).size, 5, "each room awards one unique crystal");
assert.ok(rooms.every((room) => room.accent.toLowerCase() !== "#9b6cff"), "no room uses the retired purple crystal accent");
assert.deepEqual(finalExitPuzzle.steps, ["Place crystals", "Form final crystal", "Solve final lock"]);
assert.deepEqual(finalExitPuzzle.concepts, ["Training", "Tokens", "Context", "Connections", "Prediction", "Repeat"]);
assert.deepEqual(finalExitPuzzle.correctOrder, finalExitPuzzle.concepts);
assert.match(finalExitPuzzle.trainingNote, /Training happened earlier/i);

for (const visibleIdea of ["Token Workshop", "Context Chamber", "Connection Lab", "Prediction Machine", "Pattern Workshop", "Final Lock", "Rebuild the model's process"]) {
  assert.ok(runtime.includes(visibleIdea), `runtime includes ${visibleIdea}`);
}
assert.match(runtime, /Inspect console[\s\S]*Activate context scanner[\s\S]*Unlock context door/, "Room 2 uses the Context Chamber's three-step flow");
assert.match(runtime, /const insideWindow = \["curious", "reader", "opened", "the", "old", "book"\]/, "Room 2 preserves the exact current-context answer group");
assert.match(runtime, /feedback\.contextIncorrect/, "Room 2 has localised incorrect-answer feedback");
assert.match(runtime, /feedback\.contextScanned/, "Room 2 guide updates after the scanner is active");
assert.match(runtime, /data\.selectedOption === "inside"[\s\S]*roomComplete\(room\)/, "Room 2 completes only for the current-context answer");
assert.match(runtime, /\.context-lock-options \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/, "Room 2 answers use a compact two-by-two grid");
assert.match(runtime, /Inspect console[\s\S]*Reveal connections[\s\S]*Decode the pattern/, "Room 3 uses the Connection Lab's three-step flow");
assert.match(runtime, /\["The", "little", "reader", "opened", "the", "old", "book"\]/, "Room 3 uses the Lesson 3 sentence");
assert.match(runtime, /Focus token · opened/, "Room 3 explicitly marks opened as the focus token");
assert.match(runtime, /\{ token: "reader", strength: 8 \}/, "reader has the strongest shown connection");
assert.match(runtime, /Which token is shown contributing the most information to[\s\S]*opened/, "Room 3 asks learners to read the shown pattern");
assert.match(runtime, /data\.selectedOption === "reader"[\s\S]*roomComplete\(room\)/, "Room 3 completes only for reader");
assert.match(runtime, /feedback\.connectionIncorrect/, "Room 3 incorrect feedback directs learners back to the visual");
assert.match(runtime, /"connection-lab": "verification"/, "Room 3 uses the existing red crystal asset");
assert.match(runtime, /Inspect console[\s\S]*Run prediction[\s\S]*Decode the signal/, "Room 4 uses the Prediction Machine's three-step flow");
assert.match(runtime, /\{ token: "book", value: 46[\s\S]*\{ token: "door", value: 27[\s\S]*\{ token: "box", value: 15[\s\S]*\{ token: "window", value: 8[\s\S]*\{ token: "other", value: 4/, "Room 4 contains the fixed illustrative prediction totaling 100%");
assert.match(runtime, /Higher probability means more likely, but it does not guarantee which token will be chosen/, "Room 4 separates likelihood from certainty");
assert.match(runtime, /Which statement best matches the prediction shown by the machine/, "Room 4 asks learners to read the prediction display");
assert.match(runtime, /data\.selectedOption === 1[\s\S]*roomComplete\(room\)/, "Room 4 completes only for Option B");
assert.match(runtime, /Does “more likely” mean “certain”/, "Room 4 hint reinforces the key misconception");
assert.match(runtime, /feedback\.predictionIncorrect/, "Room 4 incorrect feedback directs learners to both parts of the clue");
assert.match(runtime, /The little reader opened the book/, "Room 4 completion reinforces that the generated token joins the context");
assert.match(runtime, /"prediction-machine": "prediction"/, "Room 4 uses the existing blue crystal asset");
assert.match(runtime, /Inspect console[\s\S]*Read training records[\s\S]*Unlock the pattern/, "Room 5 uses the shared three-stage room flow");
assert.match(runtime, /Inspect training console/, "Room 5 initially asks learners to inspect the offline console");
assert.match(runtime, /const records = data\.inspected \?/, "Room 5 keeps its training records hidden until inspection");
assert.match(runtime, /The dragon sleeps in the <mark>cave<\/mark>[\s\S]*The dragon hides in the <mark>cave<\/mark>[\s\S]*The dragon waits in the <mark>cave<\/mark>[\s\S]*The dragon flew over the <mark>castle<\/mark>/, "Room 5 uses the four requested simplified training records");
assert.match(runtime, /token: "cave", value: 48[\s\S]*token: "castle", value: 29[\s\S]*token: "forest", value: 23[\s\S]*The dragon returned to the ___/, "Room 5 reveals the requested illustrative toy prediction");
assert.match(runtime, /These are illustrative teaching values, not real model output/, "Room 5 clearly labels the toy prediction as illustrative");
assert.match(runtime, /Why can the training examples change the toy model's later prediction/, "Room 5 asks the requested learning-pattern lock question");
assert.match(runtime, /The model stores every sentence and searches for an exact copy later[\s\S]*Repeated examples can strengthen learned patterns, which can influence later predictions[\s\S]*The model learns one perfect answer after seeing a single example[\s\S]*The examples directly tell the model what to say in every future conversation/, "Room 5 includes the four specified options");
assert.match(runtime, /data\.selectedOption === 1[\s\S]*feedback\.patternCorrect[\s\S]*return roomComplete\(room\)/, "Room 5 completes only for Option B");
assert.match(runtime, /feedback\.patternIncorrect/, "Room 5 gives explanatory incorrect feedback");
assert.match(runtime, /data-action="reset-room"/, "Room 5 retains the shared reset action");
assert.match(runtime, /if \(!already\) \{\s*send\("ESCAPE_ROOM_ROOM_COMPLETE"/, "Room 5 uses the shared duplicate-award guard");
assert.match(runtime, /data-action="replay"/, "Room 5 completion retains shared replay mode");
assert.match(runtime, /prediction: "patterns"/, "Room 5 uses the remaining non-purple pink crystal artwork");
assert.match(runtime, /room\.crystal === "token"\) return "\/assets\/img\/final-challenge\/crystals\/crystal-fairness\.png"/, "Tokens use the existing pink crystal asset");
assert.doesNotMatch(runtime.match(/const rooms = \[[\s\S]*?\n    \];/)?.[0] || "", /#9b6cff|number: 6/, "the active room map has no purple crystal and no sixth room");
assert.match(runtime, /No model weights are trained in your browser/);
assert.match(runtime, /Training happened earlier/, "the optional hint and completion feedback retain the earlier-training clarification");
assert.match(runtime, /data-exit-crystal/);
assert.match(runtime, /data-exit-crystal-slot/, "the five sockets accept crystal drops");
assert.match(runtime, /application\/x-ai-crystal[\s\S]*updatePlacedCrystals\(crystal\)/, "crystal placement supports drag-and-drop as well as click");
assert.doesNotMatch(runtime, /\.brain-slot:nth-child\(7\)/, "there is no hidden sixth socket style");
assert.match(runtime, /data-exit-piece/);
assert.match(runtime, /dragstart/);
assert.match(runtime, /handleExitDrop/);
const finalConceptSource = runtime.match(/const finalConceptPieces = \[[\s\S]*?\n    \];/)?.[0] || "";
assert.equal((finalConceptSource.match(/id:/g) || []).length, 6, "the Final Lock has exactly six process cards");
assert.match(finalConceptSource, /id: "training"[\s\S]*id: "tokens"[\s\S]*id: "context"[\s\S]*id: "connections"[\s\S]*id: "prediction"[\s\S]*id: "repeat"/, "the six process steps have the required order");
assert.doesNotMatch(finalConceptSource, /numbers|train-predict/, "the Final Lock has no Numbers concept, duplicate Prediction, or obsolete combined step");
assert.match(runtime, /const finalConceptTrayOrder = \["prediction", "repeat", "context", "training", "connections", "tokens"\]/, "the draggable cards begin in a deliberately shuffled order");
assert.doesNotMatch(runtime, /const finalConceptTrayOrder = \["training", "tokens", "context", "connections", "prediction", "repeat"\]/, "the tray does not reveal the correct answer order");
assert.match(runtime, /renderSequence\("final", finalConceptTrayPieces, finalConceptOrder/, "the shuffled tray and correct slot order remain separate");
assert.match(runtime, /\.brain-puzzle \{[\s\S]*grid-template-columns: minmax\(0, 1fr\);[\s\S]*width: 100%/, "the single Final Lock fills the full right-hand puzzle area");
assert.match(runtime, /\.sequence-slots, \.sequence-tray \{[\s\S]*grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)/, "the six slots and shuffled cards use the available width");
assert.doesNotMatch(finalConceptSource, /note: "Earlier"/, "the Training card does not reveal its correct position");
assert.doesNotMatch(runtime, /class="exit-training-note"/, "the default answer-revealing training note is removed");
assert.match(runtime, /This is the model's process, not the order of the lessons you completed[\s\S]*slots 1–6/, "the Final Lock explicitly separates model process from Lesson order");
assert.match(runtime, /\$\{!fused \? `<div class="crystal-tray"/, "the used crystal inventory disappears after fusion to shorten the final puzzle");
assert.equal((runtime.match(/renderSequence\("final"/g) || []).length, 1, "the Final Exit renders one ordering question");
assert.doesNotMatch(runtime, /renderSequence\("model"|renderSequence\("review"/, "the old two-question structure is removed");
assert.match(runtime, /Training happened earlier/, "the Final Lock explicitly separates earlier training from model use");
assert.match(runtime, /exit\.incorrectOrder/, "an incorrect order remains in place for another attempt");
assert.match(runtime, /data-action="hint-final"/, "the single Final Lock retains a hint");
assert.match(runtime, /exitStage: "placing"[\s\S]*finishFinalFusion[\s\S]*state\.exitStage = "fused"/, "the Final Exit has an explicit placing-to-fused state transition");
assert.match(runtime, /state\.exitPlaced\.size === rooms\.length && state\.exitStage === "placing"[\s\S]*state\.exitStage = "fusing"/, "only the fifth placed crystal starts fusion");
assert.match(runtime, /if \(state\.exitStage !== "fusing" \|\| fusionTimer\) return/, "fusion is guarded against duplicate starts");
assert.match(runtime, /const puzzleUnlocked = fused[\s\S]*puzzleUnlocked \? `<div class="brain-puzzle">/, "the Final Lock renders only after fusion completes");
assert.match(runtime, /prefers-reduced-motion: reduce[\s\S]*reducedMotion \? 320 : 1900/, "reduced motion uses a short state-safe fusion transition");
assert.match(runtime, /final-multicolour-crystal\.svg/, "the fused state retains the local multicolour Final Crystal");
assert.match(runtime, /id="completionScreen"/, "the completed Final Challenge has a dedicated epilogue screen");
assert.match(runtime, /const completionConcepts = \[[\s\S]*tokens[\s\S]*context[\s\S]*connections[\s\S]*prediction[\s\S]*patterns[\s\S]*repeat/, "the epilogue recaps all six process ideas using stable IDs");
assert.match(runtime, /function renderCompletion\(\)[\s\S]*completion-final-crystal[\s\S]*completion-guide[\s\S]*data-completion-action="return"[\s\S]*data-completion-action="replay"/, "the epilogue reuses the final crystal and guide with both requested actions");
assert.match(runtime, /completionTimer = window\.setTimeout\([\s\S]*openCompletion\(\{ focus: true \}\)[\s\S]*reducedMotion \? 80 : 700/, "success transitions to the epilogue after a short accessible delay");
assert.match(runtime, /data-completion-action='return'[\s\S]*ESCAPE_ROOM_NAVIGATE[\s\S]*route: "missions"/, "Return to AI Explorer uses the existing navigation bridge");
assert.match(runtime, /data-completion-action='replay'[\s\S]*ESCAPE_ROOM_REPLAY/, "Replay delegates to the shared Escape Room reset flow");
assert.match(finalChallenge, /currentScreen: "completion"[\s\S]*finalCompleted: true/, "completion is stored as a persistent Escape Room phase");
assert.match(finalChallenge, /ESCAPE_ROOM_REPLAY[\s\S]*resetAll\(\)/, "the parent handles replay with the existing full reset function");
assert.match(runtime, /function finalCrystalColour[\s\S]*token: "#ff5f9e"/, "Tokens use a pink Final Exit glow without changing Room 1 styling");
assert.equal((runtime.match(/class="fusion-trail-core"/g) || []).length, 1, "fusion renders its five coloured paths from one data-driven SVG template");
assert.match(runtime, /const fusionPaths = \[[\s\S]*#ff5f9e[\s\S]*#46d49b[\s\S]*#ff7655[\s\S]*#ffd15a[\s\S]*#6da9ff/, "fusion trails use the five existing crystal colours");
assert.match(runtime, /Array\.from\(\{ length: 20 \}/, "fusion uses twenty lightweight CSS particles rather than a large particle system");
assert.match(runtime, /@keyframes fusionFlash[\s\S]*@keyframes finalCrystalForm/, "fusion includes a local flash and final-crystal materialisation");
assert.match(runtime, /\.fusion-trails, \.fusion-particles, \.fusion-flash \{ display: none !important; \}/, "reduced motion removes complex fusion effects");
assert.match(runtime, /not live Qwen output/i, "reviewed values are explicitly separated from Qwen output");
assert.doesNotMatch(runtime, /Qwen probabilities are|Qwen output is|generated by Qwen/i, "runtime makes no positive fake Qwen claim");
assert.doesNotMatch(runtime.match(/const rooms = \[[\s\S]*?\n    \];/)?.[0] || "", /Hallucination|Verification|Fairness|Bias/);
assert.match(finalChallenge, /function handleGameLoad\(\)[\s\S]*setRuntimeStatus\("ready"\)[\s\S]*sendInitToGame[\s\S]*ESCAPE_ROOM_REQUEST_STATE/, "a loaded game iframe safely completes the handshake if its initial READY message races the parent");
assert.match(finalChallenge, /onLoad=\{handleGameLoad\}/, "the iframe uses the load-handshake fallback");

new Function(runtime.match(/<script>([\s\S]*)<\/script>/)?.[1] || "");
process.stdout.write("Phase P14 access and Language Model Escape Room checks passed.\n");
