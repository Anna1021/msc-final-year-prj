import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import presetSet from "../src/tokenLab/tokenLabPresetFixtures.json" with { type: "json" };
import { createQwenTokenizer, encodeWithTokenizer, QWEN_TOKENIZER } from "../src/mission1/qwenTokenizer.js";
import { createTokenLabChallengePieces, getTokenLabChallengeAvailability, isTokenLabChallengeCorrect } from "../src/tokenLab/tokenLabChallenge.js";
import { readAiLabStage } from "../src/tokenLab/aiLabSession.js";

const assets = new URL("../public/tokenizers/qwen2.5-0.5b-instruct/", import.meta.url);
const tokenizer = createQwenTokenizer(JSON.parse(await readFile(new URL("tokenizer.json", assets), "utf8")), JSON.parse(await readFile(new URL("tokenizer_config.json", assets), "utf8")));
assert.equal(presetSet.checkpoint, QWEN_TOKENIZER.checkpoint);
assert.equal(presetSet.revision, QWEN_TOKENIZER.revision);
assert.ok(presetSet.presets.length >= 9);
for (const preset of presetSet.presets) {
  const result = encodeWithTokenizer(tokenizer, preset.text);
  assert.equal(result.decoded, preset.text, `${preset.id} round-trip`);
  assert.equal(result.count, preset.count, `${preset.id} count`);
  assert.equal(result.visualGroups.length, preset.visualGroupCount, `${preset.id} visual groups`);
  assert.deepEqual(result.ids, preset.ids, `${preset.id} ids`);
  assert.deepEqual(result.rawPieces, preset.rawPieces, `${preset.id} raw pieces`);
}
for (const required of ["contractions", "hyphens", "punctuation", "emoji", "chinese", "french", "german"]) {
  assert.ok(presetSet.presets.some((preset) => preset.category === required), `${required} preset`);
}

const challengeResult = encodeWithTokenizer(tokenizer, "Tokenisation can be surprising.");
assert.equal(getTokenLabChallengeAvailability(challengeResult), "available");
assert.equal(getTokenLabChallengeAvailability({ visualGroups: challengeResult.visualGroups.slice(0, 3) }), "too-short");
assert.equal(getTokenLabChallengeAvailability({ visualGroups: Array.from({ length: 13 }, (_, index) => ({ decodedPiece: String(index) })) }), "too-long");
assert.equal(getTokenLabChallengeAvailability({ visualGroups: [{ decodedPiece: "a" }, { decodedPiece: "b" }, { decodedPiece: "�" }, { decodedPiece: "d" }] }), "unsupported-bytes");
const shuffled = createTokenLabChallengePieces(challengeResult, () => 0);
assert.equal(isTokenLabChallengeCorrect(shuffled, challengeResult.visualGroups.length), false);
const ordered = [...shuffled].sort((a, b) => a.originalIndex - b.originalIndex);
assert.equal(isTokenLabChallengeCorrect(ordered, challengeResult.visualGroups.length), true);

function leafPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => { const path = prefix ? `${prefix}.${key}` : key; return child && typeof child === "object" ? leafPaths(child, path) : [path]; });
}
const languages = ["en", "zh", "fr", "de"];
const locales = await Promise.all(languages.map(async (language) => JSON.parse(await readFile(new URL(`../src/locales/${language}/tokenLab.json`, import.meta.url), "utf8"))));
const keys = leafPaths(locales[0]).sort();
locales.forEach((locale, index) => assert.deepEqual(leafPaths(locale).sort(), keys, `${languages[index]} Token Lab keys`));
const navigation = await Promise.all(languages.map(async (language) => JSON.parse(await readFile(new URL(`../src/locales/${language}/navigation.json`, import.meta.url), "utf8"))));
navigation.forEach((locale, index) => assert.ok(locale.aiLab, `${languages[index]} AI Lab navigation label`));
for (const stage of ["tokenize", "numbers", "context", "predict", "compare"]) assert.equal(readAiLabStage(`?stage=${stage}`), stage, `Direct ${stage} Stage URL`);

const pageSource = await readFile(new URL("../src/tokenLab/TokenLabPage.jsx", import.meta.url), "utf8");
const challengeSource = await readFile(new URL("../src/tokenLab/TokenLabChallenge.jsx", import.meta.url), "utf8");
const spotlightSource = await readFile(new URL("../src/tokenLab/AiLabSpotlight.jsx", import.meta.url), "utf8");
const guideButtonSource = await readFile(new URL("../src/tokenLab/AiLabGuideButton.jsx", import.meta.url), "utf8");
const spotlightStepsSource = await readFile(new URL("../src/tokenLab/spotlightSteps.js", import.meta.url), "utf8");
const stageSpotlightSource = await readFile(new URL("../src/tokenLab/stageSpotlightSteps.js", import.meta.url), "utf8");
const stagePageSources = await Promise.all(["numbers/NumbersStagePage.jsx", "context/ContextStagePage.jsx", "prediction/PredictionStagePage.jsx", "compare/CompareStagePage.jsx"].map((path) => readFile(new URL(`../src/tokenLab/${path}`, import.meta.url), "utf8")));
const tokenLabCssSource = await readFile(new URL("../src/tokenLab/tokenLab.css", import.meta.url), "utf8");
const playfulStageSource = await readFile(new URL("../src/tokenLab/aiLabPlayfulStage1.css", import.meta.url), "utf8");
const sharedPlayfulSource = await readFile(new URL("../src/tokenLab/playfulLab.css", import.meta.url), "utf8");
for (const forbidden of ["aiExplorerProgress", "saveLearningNote", "writeProgress", "setProgress", "fetch("]) {
  assert.equal(pageSource.includes(forbidden) || challengeSource.includes(forbidden), false, `Token Lab excludes ${forbidden}`);
}
const fallbackSource = await readFile(new URL("./create-spa-route-fallbacks.mjs", import.meta.url), "utf8");
assert.ok(fallbackSource.includes('"ai-lab"'), "AI Lab SPA fallback");
assert.ok(fallbackSource.includes('"token-lab"'), "Legacy Token Lab SPA fallback");

for (const target of ["ai-lab-flow", "ai-lab-token-input", "ai-lab-tokenize-button", "ai-lab-token-result", "ai-lab-token-count", "ai-lab-space-marker", "ai-lab-why-split", "ai-lab-challenge-status", "ai-lab-restart"]) {
  assert.ok(pageSource.includes(target), `AI Lab tour target ${target}`);
}
assert.ok(pageSource.includes('`ai-lab-stage-${stage.id}`'), "AI Lab creates stable stage targets");
assert.ok(pageSource.includes('aria-disabled={availability !== "available"}'), "Challenge exposes disabled state");
assert.ok(pageSource.includes("trySuitable"), "Challenge has a suitable-example recovery action");
assert.ok(pageSource.includes("ai-lab-sticky-flow"), "The single stage flow remains sticky across the lab");
assert.ok(pageSource.includes('status: "available"'), "Implemented experiment is available");
assert.equal((pageSource.match(/status: "available"/g) || []).length, 5, "All five AI Lab experiments are available");
assert.equal(pageSource.includes("LockKeyhole"), false, "Planned stages have no lock icon");
assert.equal(pageSource.includes("progress"), false, "AI Lab stages do not read learning progress");
assert.ok(pageSource.includes("ai-lab-replay-guide"), "AI Lab exposes Replay Guide");
assert.ok(pageSource.includes('window.addEventListener("popstate"'), "Back and Forward update the active Stage");
assert.ok(pageSource.includes("stageTours"), "AI Lab selects the current Stage tour");
assert.ok(spotlightStepsSource.includes('"aiLabTourCompleted"'), "Tokenize Tour keeps its independent storage key");
assert.ok(spotlightStepsSource.includes('"aiLabNumbersTourCompleted"'), "Numbers Tour has a separate storage key");
const guideKeys = [...spotlightStepsSource.matchAll(/"(aiLab\w*TourCompleted)"/g)].map((match) => match[1]);
assert.equal(guideKeys.length, 5, "All five Stages have Guide completion keys");
assert.equal(new Set(guideKeys).size, 5, "Guide completion keys remain independent");
assert.equal((spotlightStepsSource.match(/target:/g) || []).length, 16, "Tokenize and Numbers define sixteen configured steps");
for (const target of ["ai-lab-flow", "ai-lab-stage-tokenize", "ai-lab-token-input", "ai-lab-tokenize-button", "ai-lab-token-result", "ai-lab-why-split", "ai-lab-challenge-status"]) assert.ok(spotlightStepsSource.includes(target), `Tour config includes ${target}`);
assert.ok(spotlightSource.includes('role="dialog"'), "Spotlight has dialog semantics");
assert.ok(spotlightSource.includes('event.key==="Escape"') && spotlightSource.includes("focusableSelector"), "Spotlight supports Escape and keyboard focus containment");
assert.ok(spotlightSource.includes('prefers-reduced-motion: reduce'), "Spotlight uses minimal scrolling under reduced motion");
assert.ok(guideButtonSource.includes("CircleHelp"), "Guide button uses consistent help iconography");
assert.ok(guideButtonSource.includes("ArrowUpRight"), "Hero guide includes a restrained direction cue");
assert.ok(pageSource.includes("replayCurrentTour") && pageSource.includes("onReplay={replayCurrentTour}"), "Guide replays the current Stage without navigation");
assert.equal(pageSource.includes('selectStage("tokenize");\n    window.requestAnimationFrame'), false, "Guide no longer navigates later Stages back to Tokenize");
assert.ok(pageSource.includes('activeStage === "tokenize"'), "Only Tokenize renders the Full Hero state");
assert.ok(pageSource.includes("ai-lab-compact-header"), "Later stages render an explicit Compact Header");
assert.ok(pageSource.includes('compact ? "ai-lab-compact-flow" : "ai-lab-flow"'), "The shared Stepper preserves full and compact Spotlight targets");
assert.match(tokenLabCssSource, /\.ai-lab-compact-header\s*\{[^}]*position:sticky/s, "Compact Header is a real stable shell state");
assert.match(tokenLabCssSource, /\.ai-lab-flow \.active \.ai-lab-step::after/, "Active Stage uses a local bottom accent");
assert.match(tokenLabCssSource, /\.ai-lab-flow\s*\{[^}]*min-height:104px/s, "Desktop Stepper reserves enough vertical space");
assert.match(tokenLabCssSource, /grid-template-rows:27px 17px minmax\(24px,auto\) 4px/, "Stepper reserves separate title, subtitle, and accent rows");
assert.match(tokenLabCssSource, /\.ai-lab-step small\s*\{[^}]*white-space:normal/s, "Long translated subtitles may wrap without clipping");
assert.match(tokenLabCssSource, /\.ai-lab-compact-header\s*\{[^}]*min-height:108px/s, "Later Stage headers share a stable desktop height");
assert.ok(pageSource.includes("stageBridges") && pageSource.includes("<StageBridge"), "Stages include short optional learning bridges");
assert.ok(spotlightSource.includes("returnFocusRef") && spotlightSource.includes("preventScroll:true"), "Guide restores focus when it closes");
assert.doesNotMatch(playfulStageSource, /\.ai-lab-flow \.active \.ai-lab-step\s*\{[^}]*background:(?!transparent)/s, "Active Stage has no oversized rectangular fill");
assert.ok(spotlightSource.includes("ai-lab-replay-focus"), "Step one adds secondary Replay emphasis");
const allStageMarkup = [pageSource, ...stagePageSources].join("\n");
const configuredTargets = [...`${spotlightStepsSource}\n${stageSpotlightSource}`.matchAll(/target:"([^"]+)"/g)].map((match) => match[1]);
for (const target of configuredTargets) assert.ok(target.startsWith("ai-lab-stage-") || allStageMarkup.includes(target), `Guide target exists: ${target}`);
for (const hiddenOnlyTarget of ["numbers-sentence-control", "numbers-toy-table", "context-builder"]) assert.equal(configuredTargets.includes(hiddenOnlyTarget), false, `Guide avoids unreachable hidden target ${hiddenOnlyTarget}`);
assert.match(stageSpotlightSource,/id:"builder"[\s\S]*?waitsForAction:true[\s\S]*?target:"context-vague-request"[\s\S]*?target:"context-detail-cards"/,"Context Guide opens Builder before targeting its initially hidden controls");
assert.match(pageSource, /featuredPresetIds = \["long-word", "punctuation", "emoji", "chinese", "spacing"\]/, "Tokenize shows five featured example categories");
assert.match(pageSource, /examplesOpen/, "remaining examples are folded behind More examples");
assert.match(pageSource, /ai-lab-result-sticker/, "token result includes a local teaching sticker");
assert.match(pageSource, /ai-lab-challenge-sticker/, "challenge includes a building-oriented sticker");
assert.equal(pageSource.includes("ai-lab-robot-sticker-sheet.png"), false, "the full sticker sheet is never rendered");
assert.equal(pageSource.includes("305") || pageSource.includes("190"), false, "Tokenize uses no number-specific sticker content");
assert.match(pageSource, /tokenLab\.result\.whyStep1/, "Why explanation uses the visual three-step version");
assert.match(pageSource, /tokenLab\.experiment\.privacyShort/, "privacy is reduced to a compact default label");
assert.match(playfulStageSource, /\.token-lab-page\.playful-learning-scope/, "Stage 1 playful CSS is doubly scoped");
assert.match(playfulStageSource, /prefers-reduced-motion:reduce/, "Stage 1 supports reduced motion");
assert.match(playfulStageSource, /@media\(max-width:520px\)/, "Stage 1 has narrow mobile rules");
assert.match(tokenLabCssSource, /grid-auto-rows:max-content/, "AI Lab rows grow with their content");
assert.match(tokenLabCssSource, /align-content:start/, "AI Lab content starts naturally inside its scroll container");
assert.doesNotMatch(playfulStageSource, /\.token-lab-experiment\s*\{[^}]*overflow\s*:\s*hidden/s, "Tokenize card does not clip growing content");
assert.doesNotMatch(playfulStageSource, /\.token-lab-experiment\s*\{[^}]*(?:height|max-height)\s*:\s*\d+px/s, "Tokenize card has no fixed pixel height");
assert.doesNotMatch(playfulStageSource, /\.ai-lab-input-sticker\s*\{[^}]*position\s*:\s*absolute/s, "Input robot stays in normal layout flow");
assert.doesNotMatch(playfulStageSource, /\.token-lab-notice\s*\{[^}]*position\s*:\s*(?:fixed|absolute|sticky)/s, "Try this next stays in document flow");
for (const staleSelector of ["token-lab-hero-mark", "numbers-stage-mark", "context-mascot", "predict-workspace", "response-preview"]) assert.equal(sharedPlayfulSource.includes(staleSelector), false, `Superseded ${staleSelector} styling is removed`);
for (const preserved of ["maxLength={200}", "runAgain", "retry", "restartLab", "tokenLab.result", "why-split", "technical", "TokenLabChallenge", "trySuitable", "token-lab-notice", "/mission/1-tokenisation-paged"]) {
  assert.ok(pageSource.includes(preserved), `Tokenize preserves ${preserved}`);
}
assert.doesNotMatch(playfulStageSource, /(^|[},]\s*)\.(card|button|token|robot)(?=[\s,{:.#])/m, "Stage 1 adds no forbidden global selectors");
assert.doesNotMatch(pageSource, /https?:\/\//, "Tokenize uses no external image hotlinks");

process.stdout.write("Token Lab tests passed.\n");
