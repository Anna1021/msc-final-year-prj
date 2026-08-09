import assert from "node:assert/strict";
import fixtureSet from "../src/mission1/qwenTokenizerFixtures.json" with { type: "json" };
import { getMission1ChallengePool, getMission1IntroFixture, isCorrectChallengeOrder, shuffleChallengePieces } from "../src/mission1/mission1Challenges.js";
import { completeMission1Progress, createMission1CoreProgress, isMission1CoreComplete } from "../src/mission1/mission1Progress.js";
import { readFile } from "node:fs/promises";

const intro = getMission1IntroFixture();
assert.equal(intro.text, "The uncharacteristically quiet reader smiled.");
assert.deepEqual(intro.rawPieces, ["The", "Ġun", "character", "istically", "Ġquiet", "Ġreader", "Ġsmiled", "."]);
assert.equal(intro.count, 8);

for (const language of ["en", "zh", "fr", "de"]) {
  const pool = getMission1ChallengePool(language);
  assert.ok(pool.length >= 2, `${language} has repeatable challenges`);
  for (const fixture of pool) assert.ok(fixture.count >= 4 && fixture.count <= 8);
}

const fixture = fixtureSet.fixtures.find((item) => item.id === "challenge-tokenisation");
const ordered = fixture.rawPieces.map((rawPiece, originalIndex) => ({ rawPiece, originalIndex }));
assert.equal(isCorrectChallengeOrder(ordered), true);
const shuffled = shuffleChallengePieces(fixture, () => 0);
assert.equal(isCorrectChallengeOrder(shuffled), false);

const initialCore = createMission1CoreProgress();
assert.equal(isMission1CoreComplete(initialCore), false);
assert.equal(isMission1CoreComplete({ ...initialCore, playgroundRun: true, partAComplete: true, partBComplete: true, summarySeen: true }), true);

const freshProgress = { missions: { 1: { progress: 0, completed: false }, 2: { progress: 0, completed: false } } };
const completedProgress = completeMission1Progress(freshProgress);
assert.notEqual(completedProgress, freshProgress);
assert.deepEqual(completedProgress.missions[1], { progress: 100, completed: true });
assert.deepEqual(freshProgress.missions[1], { progress: 0, completed: false });
assert.equal(completeMission1Progress(completedProgress), completedProgress, "completion is idempotent");
assert.deepEqual(createMission1CoreProgress(), initialCore, "restart resets UI state only");
assert.equal(completedProgress.missions[1].completed, true, "restart does not change persisted completion");

function leafPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? leafPaths(child, path) : [path];
  });
}
const localeSets = await Promise.all(["en", "zh", "fr", "de"].map(async (language) => JSON.parse(await readFile(new URL(`../src/locales/${language}/mission1.json`, import.meta.url), "utf8"))));
const expectedKeys = leafPaths(localeSets[0]).sort();
for (const [index, locale] of localeSets.entries()) assert.deepEqual(leafPaths(locale).sort(), expectedKeys, `locale ${["en", "zh", "fr", "de"][index]} keys`);

const missionSource = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const missionCss = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
assert.match(missionSource, /PlayfulSceneBanner/, "Section 1 includes the building-block scene");
assert.match(missionSource, /metaphorNote/, "the metaphor is not presented as a real tokenizer boundary");
assert.match(missionSource, /playful-real-token-lab[\s\S]*TokenPieces/, "verified output still uses TokenPieces");
assert.match(missionSource, /uncharacteristically[\s\S]*un[\s\S]*character[\s\S]*istically/, "Why scene preserves the verified split example");
assert.match(missionSource, /m1-number-bridge/, "Tokens-to-Numbers bridge remains present");
assert.doesNotMatch(missionSource.slice(missionSource.indexOf("function Mission1("), missionSource.indexOf("function QuickQuiz(")), /XP|Badge|Reflection|Save Note|View Notes/, "removed gamification and notes UI stay removed");
assert.match(missionCss, /prefers-reduced-motion:reduce/, "reduced-motion support remains present");
assert.doesNotMatch(missionSource.slice(missionSource.indexOf("function Mission1("), missionSource.indexOf("function QuickQuiz(")), /https?:\/\//, "Mission 1 adds no external hotlinks");
const playfulCss = await readFile(new URL("../src/playfulLearning/playfulLearning.css", import.meta.url), "utf8");
const tokenBlockSource = await readFile(new URL("../src/playfulLearning/TokenBuildingBlock.jsx", import.meta.url), "utf8");
assert.match(missionSource, /scopeClass="playful-learning-scope"/, "Mission 1 enables the Playful Learning scope");
assert.match(tokenBlockSource, /variant = "metaphor"/, "TokenBuildingBlock defaults to metaphor mode");
assert.match(tokenBlockSource, /variant === "verified"/, "TokenBuildingBlock has an explicit verified mode");
assert.match(missionSource, /visualVariant="verified"/, "Section 2 requests verified token visuals");
assert.match(missionSource, /function replayExample\(\)/, "Replay handler remains explicit");
assert.match(playfulCss, /\.mission-1\.playful-learning-scope/, "UI Kit styles require both page scopes");
assert.match(playfulCss, /prefers-reduced-motion:reduce/, "UI Kit defines reduced-motion rules");
assert.doesNotMatch(playfulCss, /(^|[},]\s*)\.(card|button|token|robot|main-column|right-column)(?=[\s,{:.#])/m, "UI Kit does not define forbidden global selectors");
assert.doesNotMatch(playfulCss, /https?:\/\//, "UI Kit has no external asset hotlinks");

process.stdout.write("Mission 1 flow tests passed.\n");
