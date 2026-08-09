import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { changedTokenIndexes, comparePairs, swapPairSides } from "../src/tokenLab/compare/compareData.js";

assert.equal(comparePairs.length, 3, "Compare keeps three reviewed categories");
assert.deepEqual(comparePairs.map((pair) => pair.id), ["meaning", "details", "ending"]);
for (const pair of comparePairs) {
  assert.equal(pair.inputs.length, 2);
  assert.ok(pair.inputs.every((input) => input.length > 0 && input.length <= 200));
  assert.equal(pair.contextClues.length, 2);
  assert.equal(pair.predictions.length, 2);
  for (const candidates of pair.predictions) assert.equal(candidates.reduce((sum, [, probability]) => sum + probability, 0), 100, `${pair.id} probabilities`);
}
assert.deepEqual(swapPairSides(comparePairs[0]).inputs, [...comparePairs[0].inputs].reverse());
assert.deepEqual(changedTokenIndexes([{ decodedPiece:"a" },{ decodedPiece:"b" }],[{ decodedPiece:"a" }]), [false, true]);

function leafPaths(value, prefix = "") { return Object.entries(value).flatMap(([key, child]) => { const path = prefix ? `${prefix}.${key}` : key; return child && typeof child === "object" ? leafPaths(child, path) : [path]; }); }
const languages = ["en", "zh", "fr", "de"];
const locales = await Promise.all(languages.map(async (language) => JSON.parse(await readFile(new URL(`../src/locales/${language}/compareStage.json`, import.meta.url), "utf8"))));
const keys = leafPaths(locales[0]).sort();
locales.forEach((locale, index) => assert.deepEqual(leafPaths(locale).sort(), keys, `${languages[index]} Compare keys`));

const page = await readFile(new URL("../src/tokenLab/compare/CompareStagePage.jsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/tokenLab/compare/compareStage.css", import.meta.url), "utf8");
const lab = await readFile(new URL("../src/tokenLab/TokenLabPage.jsx", import.meta.url), "utf8");
const session = await readFile(new URL("../src/tokenLab/aiLabSession.js", import.meta.url), "utf8");
const tours = await readFile(new URL("../src/tokenLab/spotlightSteps.js", import.meta.url), "utf8");
const stageTours = await readFile(new URL("../src/tokenLab/stageSpotlightSteps.js", import.meta.url), "utf8");

assert.ok(lab.includes('{ id: "compare", status: "available"'));
assert.ok(session.includes('"compare"'));
for (const id of ["compare-stage", "compare-inputs", "compare-run", "compare-layer-tabs", "compare-tokens", "compare-context-prediction", "compare-discovery", "compare-reset"]) assert.ok(page.includes(id), id);
for (const behavior of ["tokenizeWithQwen", "swapSides", "another", "replay", "restart", "availableLayers", "reviewedOnly"]) assert.ok(page.includes(behavior), behavior);
for (const forbidden of ["localStorage", "sessionStorage", "writeProgress", "saveLearningNote", "aiExplorerProgress", "XP", "Badge", "fetch(", "embedding"] ) assert.equal(page.includes(forbidden), false, `Compare excludes ${forbidden}`);
assert.ok(page.includes('custom ? ["text", "tokens"]'), "Custom text only enables real token layers");
assert.ok(page.includes("moveLayerTab") && page.includes('role="tabpanel"'), "Compare layers support keyboard tab navigation");
assert.ok(page.includes("validateQwenTokenizerInput"), "Custom input uses existing tokenizer validation");
assert.ok(css.includes("prefers-reduced-motion"));
assert.ok(css.includes("max-width:375px"));
assert.ok(tours.includes('"aiLabCompareTourCompleted"'));
assert.ok(tours.includes("compareSpotlightSteps"));
assert.ok(stageTours.includes('id:"run"') && stageTours.includes("waitsForAction:true"));
for (const stage of ["tokenize", "numbers", "context", "predict", "compare"]) assert.ok(tours.includes(`${stage}:`), `${stage} guide registry`);
process.stdout.write("Compare Stage tests passed.\n");
