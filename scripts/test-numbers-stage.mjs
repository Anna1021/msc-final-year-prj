import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createQwenTokenizer, encodeWithTokenizer, QWEN_TOKENIZER } from "../src/mission1/qwenTokenizer.js";
import { createAiLabTokenContract, getDefaultNumbersContract, readAiLabStage } from "../src/tokenLab/aiLabSession.js";
import { toyEmbeddingData } from "../src/tokenLab/numbers/toyEmbeddingData.js";

const assets = new URL("../public/tokenizers/qwen2.5-0.5b-instruct/", import.meta.url);
const tokenizer = createQwenTokenizer(JSON.parse(await readFile(new URL("tokenizer.json", assets), "utf8")), JSON.parse(await readFile(new URL("tokenizer_config.json", assets), "utf8")));
const realResult = encodeWithTokenizer(tokenizer, "Robots learn quickly!");
const defaultContract = getDefaultNumbersContract();
assert.equal(defaultContract.input, realResult.text);
assert.deepEqual(defaultContract.ids, realResult.ids, "default IDs come from verified tokenizer output");
assert.deepEqual(defaultContract.pieces.map((piece) => piece.rawPiece), realResult.rawPieces, "default pieces come from verified tokenizer output");
assert.deepEqual(defaultContract.pieces.map((piece) => piece.id), defaultContract.ids, "each displayed piece keeps a one-to-one real token ID");
assert.equal(defaultContract.tokenizer.checkpoint, QWEN_TOKENIZER.checkpoint);
assert.equal(defaultContract.tokenizer.revision, QWEN_TOKENIZER.revision);

const transient = createAiLabTokenContract(realResult);
assert.deepEqual(transient.ids, realResult.ids);
assert.deepEqual(transient.visualGroups, realResult.visualGroups);
assert.notEqual(transient.ids, realResult.ids, "transient contract copies mutable arrays");
assert.equal(readAiLabStage(""), "tokenize");
assert.equal(readAiLabStage("?stage=tokenize"), "tokenize");
assert.equal(readAiLabStage("?stage=numbers"), "numbers");
assert.equal(readAiLabStage("?stage=unknown"), "tokenize");

assert.equal(toyEmbeddingData.length, 3);
assert.ok(toyEmbeddingData.every((item) => item.toyVector.length === 3));

function leafPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => { const path = prefix ? `${prefix}.${key}` : key; return child && typeof child === "object" ? leafPaths(child, path) : [path]; });
}
const languages = ["en", "zh", "fr", "de"];
const locales = await Promise.all(languages.map(async (language) => JSON.parse(await readFile(new URL(`../src/locales/${language}/numbersStage.json`, import.meta.url), "utf8"))));
const keys = leafPaths(locales[0]).sort();
locales.forEach((locale, index) => assert.deepEqual(leafPaths(locale).sort(), keys, `${languages[index]} Numbers keys`));

const pageSource = await readFile(new URL("../src/tokenLab/TokenLabPage.jsx", import.meta.url), "utf8");
const numbersSource = await readFile(new URL("../src/tokenLab/numbers/NumbersStagePage.jsx", import.meta.url), "utf8");
const numbersCss = await readFile(new URL("../src/tokenLab/numbers/numbersStage.css", import.meta.url), "utf8");
const sessionSource = await readFile(new URL("../src/tokenLab/aiLabSession.js", import.meta.url), "utf8");
const spotlightSource = await readFile(new URL("../src/tokenLab/spotlightSteps.js", import.meta.url), "utf8");
assert.ok(pageSource.includes('status: "available", Icon: Hash'), "Numbers stage is available");
assert.ok(pageSource.includes('searchParams.set("stage", nextStage)'), "AI Lab uses query stage navigation");
assert.ok(pageSource.includes("popstate"), "AI Lab stage follows browser history");
assert.ok(pageSource.includes('`ai-lab-stage-${stage.id}`'), "Stage flow creates the stable Numbers target");
for (const target of ["numbers-real-journey", "numbers-sentence-control", "numbers-token-row", "numbers-selected-token", "numbers-address-journey", "numbers-training-scene", "numbers-real-unavailable", "numbers-toy-sandbox", "numbers-toy-table", "numbers-selected-row", "numbers-accuracy-label", "numbers-next-use", "numbers-restart"]) assert.ok(numbersSource.includes(target), `Numbers target ${target}`);
for (const target of ["ai-lab-numbers-token-cards", "ai-lab-numbers-selected-id", "ai-lab-numbers-follow-address", "ai-lab-numbers-training", "ai-lab-numbers-real-unavailable", "ai-lab-numbers-open-teaching", "ai-lab-numbers-reveal-row", "ai-lab-numbers-whole-row", "ai-lab-numbers-show-bridge", "ai-lab-numbers-summary", "ai-lab-numbers-restart"]) assert.ok(numbersSource.includes(target), `Numbers keeps a stable Guide target ${target}`);
for (const forbidden of ["localStorage", "sessionStorage", "aiExplorerProgress", "writeProgress", "saveLearningNote", "Activity", "Badge", "XP", "safetensors", "onnx", "Qwen-like"]) assert.equal(numbersSource.includes(forbidden) || sessionSource.includes(forbidden), false, `Numbers excludes ${forbidden}`);
assert.ok(spotlightSource.includes("numbersSpotlightSteps") && spotlightSource.includes("aiLabNumbersTourCompleted"), "Numbers has an independent reusable Spotlight config");
assert.equal((spotlightSource.match(/numbersStage\.tour\.steps/g) || []).length, 18, "Nine Numbers Guide steps have title and body keys");
for (const action of ['id:"pick"','id:"follow"','id:"open"','id:"drawer"','id:"bridge"']) assert.ok(spotlightSource.includes(action), `Guide includes required action ${action}`);
assert.match(spotlightSource, /id:"bridge"[\s\S]*?waitsForAction:true[\s\S]*?id:"summary"[\s\S]*?finish:true/, "Guide cannot finish before the final row-to-context bridge");
assert.equal(numbersSource.includes("Compare"), false);
assert.ok(numbersSource.includes("numbersStage.toy.label"), "Toy accuracy label is permanent");
assert.ok(numbersSource.includes('/assets/img/mission-robot-pointing.png') && numbersSource.includes('/assets/img/mission-robot-reading.png') && numbersSource.includes('/assets/img/missions-robot-target.png'), "Numbers reuses three safe local robot poses");
assert.ok(numbersSource.includes("contract.pieces.map"), "Real Journey renders tokenizer pieces one-to-one with IDs");
assert.match(numbersSource, /tableOpen\s*&&/, "Full teaching table is closed by default");
assert.ok(numbersSource.includes("followLabel") && numbersSource.includes("revealNumbers") && numbersSource.includes("replayLookup"), "Progressive lookup remains repeatable");
assert.ok(numbersSource.includes("toyVector.slice(0,revealedCount)") && numbersSource.includes("setRevealedCount(index+1)"), "Teaching values appear progressively instead of all at once");
assert.match(numbersSource, /followLabel\(\)[\s\S]*?setNumbersVisible\(false\)/, "Following the label does not reveal made-up values as a real lookup result");
assert.ok(numbersSource.includes("onTokenSelected()") && numbersSource.includes("onAddressFollowed()") && numbersSource.includes("onTeachingOpened()") && numbersSource.includes("onNumbersRevealed()") && numbersSource.includes("onBridgeShown()"), "Required Numbers interactions notify the shared Guide");
assert.ok(numbersSource.includes("numbersStage.summary.id") && numbersSource.includes("numbersStage.summary.row") && numbersSource.includes("numbersStage.summary.training") && numbersSource.includes("numbersStage.summary.context") && numbersSource.includes("numbersStage.summary.next"), "The stage ends with the complete causal chain");
assert.equal(/Toy ID/i.test(numbersSource), false, "The visible journey contains no competing Toy ID system");
assert.equal(locales.some(locale=>/Toy ID/i.test(JSON.stringify(locale))), false, "No locale exposes a Toy ID system");
assert.ok((numbersSource.match(/<SelectedIdentity/g)||[]).length>=4, "The selected real token and Qwen ID remain visible across the journey");
for (const locale of locales) {
  assert.match(locale.real.labelMeaning, /score|分数|score|Punktzahl/i, "ID copy explicitly prevents score misconceptions");
  assert.match(locale.toy.revealSteps.complete, /real|真实|vraie|echte/i, "Completed reveal distinguishes the larger real-model row");
  assert.match(locale.lookup.discovery, /\{\{id\}\}.*\{\{id\}\}/, "UI explicitly teaches ID N selects row N");
  assert.match(locale.training.notCalculatedBody, /training|训练|entraînement|Training/i, "UI says training learned the row values");
  assert.match(locale.training.notCalculatedTitle, /not calculate|不会计算|ne calcule pas|berechnet.*nicht/i, "UI says the ID does not calculate row values");
  assert.match(locale.toy.label, /made-up|虚构|inventées|Erfundene/i, "Teaching values are clearly made up");
  assert.match(locale.toy.notRealRow, /not Qwen|不是 Qwen|Ce n’est pas la ligne Qwen|nicht Qwen/i, "Teaching row is never presented as the real Qwen row");
  assert.match(locale.toy.noSingleMeaning, /single|单个|seule|einzelner/i, "Individual values are not assigned standalone meanings");
  assert.match(locale.nextUse.discovery, /next|下一个|prochains|nächsten/i, "Row-to-next-token bridge is explicit");
  assert.match(`${locale.nextUse.calculations} ${locale.nextUse.contextChanges}`, /context|上下文|voisins|umgebender/i, "Row-to-context-calculation bridge is explicit");
  assert.match(locale.nextUse.conceptOnly, /no Qwen|没有.*Qwen|aucune.*Qwen|keine Qwen/i, "Conceptual output explicitly excludes Qwen probabilities");
}
assert.deepEqual(toyEmbeddingData.map((item) => item.toyVector), [[0.2,-0.4,0.7],[-0.1,0.6,0.3],[0.8,0.1,-0.2]], "Toy values stay unchanged");
for (const scene of [1,2,3,4,5,6]) assert.ok(numbersSource.includes(`aria-hidden="true">${scene}`), `Numbers presents visual scene ${scene}`);
assert.ok(numbersSource.includes("numbers-block-tray") && numbersSource.includes("numbersStage.toy.oneRow"), "Teaching values are visibly grouped as one row");
assert.ok(numbersSource.includes("numbers-id-row-compare"), "ID-versus-row distinction is directly visible");
assert.ok(numbersSource.includes("numbers-context-bridge") && numbersSource.includes("numbersStage.nextUse.calculations") && numbersSource.includes("numbersStage.nextUse.choices"), "The row visibly reaches context calculations and next-token choices");
assert.ok(numbersSource.includes("numbersStage.technical.truth"), "Technical layer repeats the real-versus-teaching truth boundary");
assert.ok(numbersCss.includes("prefers-reduced-motion"), "Numbers interaction respects reduced motion");
assert.doesNotMatch(numbersCss, /min-width:\s*(?:[4-9]\d{2}|\d{4,})px/, "Numbers has no fixed desktop-width content that forces mobile overflow");

const tokenizerFiles = await readdir(new URL("../public/tokenizers/qwen2.5-0.5b-instruct/", import.meta.url));
assert.equal(tokenizerFiles.some((name) => /\.(safetensors|onnx)$/i.test(name)), false, "No model weights or ONNX assets");

process.stdout.write("Numbers Stage tests passed.\n");
