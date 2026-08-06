import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { missionData } from "../src/data/courseData.js";
import { canAccessFinalChallenge, canAccessMission, completedCount, CURRICULUM_VERSION, isUnlocked, missionLearningState, normaliseProgress, recommendedMissionId } from "../src/state/progress.js";

assert.equal(missionData.length, 5, "curriculum exposes exactly five Missions");
assert.deepEqual(missionData.map((mission) => mission.order), [1, 2, 3, 4, 5]);
assert.deepEqual(missionData.map((mission) => mission.id), [1, 2, 3, 5, 6], "stable storage IDs avoid rewriting implemented Mission state");
assert.equal(missionData.some((mission) => /story builder/i.test(`${mission.title} ${mission.desc} ${mission.skill}`)), false, "Story Builder is absent");

const legacy = normaliseProgress({ missions: {
  1: { progress: 100, completed: true }, 2: { progress: 100, completed: true }, 3: { progress: 35, completed: false },
  4: { progress: 50, completed: false }, 5: { progress: 100, completed: true }, 6: { progress: 100, completed: true }
} });
assert.equal(legacy.curriculumVersion, CURRICULUM_VERSION);
assert.deepEqual(legacy.missions[1], { progress: 100, completed: true });
assert.deepEqual(legacy.missions[2], { progress: 75, completed: false }, "combined Mission 2 is not silently completed when old Context is incomplete");
assert.deepEqual(legacy.missions[5], { progress: 100, completed: true }, "old Training maps to new Mission 4");
assert.deepEqual(legacy.missions[6], { progress: 100, completed: true }, "old Bias maps to new Mission 5");
assert.equal(completedCount(legacy), 3);
assert.equal(canAccessFinalChallenge(legacy), false);
for (const mission of missionData) assert.equal(canAccessMission(legacy, mission.id), true, `Mission ${mission.order} is always available`);
assert.equal(isUnlocked(legacy, 3), true, "legacy unlock helper no longer creates a hard route lock");
assert.equal(recommendedMissionId(legacy), 2, "the first incomplete Mission remains the recommendation");
assert.deepEqual(missionLearningState(legacy, 3, new Set([3])), { available:true, recommended:false, visited:true, activityComplete:true, missionComplete:false });

const allLegacyComplete = normaliseProgress({ missions: Object.fromEntries([1, 2, 3, 4, 5, 6].map((id) => [id, { progress: 100, completed: true }])) });
assert.equal(completedCount(allLegacyComplete), 5);
assert.equal(canAccessFinalChallenge(allLegacyComplete), true, "five migrated Missions unlock the Final Challenge");

const appSource = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
assert.match(appSource, /learningMode === "guided"[\s\S]*learningMode === "explore"/, "Missions overview offers Guided Path and Explore Freely modes");
assert.doesNotMatch(appSource, /missionId && !canAccessMission/, "runtime routing has no Mission access guard");
assert.match(appSource, /canAccessFinalChallenge\(progress, qaMode\)/, "Final Challenge keeps its genuine completion guard");

function leafPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? leafPaths(child, path) : [path];
  });
}
const localeSets = await Promise.all(["en", "zh", "fr", "de"].map(async (language) => JSON.parse(await readFile(new URL(`../src/locales/${language}/missions.json`, import.meta.url), "utf8"))));
const expectedKeys = leafPaths(localeSets[0]).sort();
for (const [index, locale] of localeSets.entries()) {
  assert.deepEqual(leafPaths(locale).sort(), expectedKeys, `Mission locale ${["en", "zh", "fr", "de"][index]} keys match`);
  assert.equal(Object.keys(locale.items).length, 5);
}
const learningModeLocales = await Promise.all(["en", "zh", "fr", "de"].map(async (language) => JSON.parse(await readFile(new URL(`../src/locales/${language}/learningMode.json`, import.meta.url), "utf8"))));
const learningModeKeys = leafPaths(learningModeLocales[0]).sort();
for (const [index, locale] of learningModeLocales.entries()) assert.deepEqual(leafPaths(locale).sort(), learningModeKeys, `Learning mode locale ${["en", "zh", "fr", "de"][index]} keys match`);

process.stdout.write("Five-Mission curriculum tests passed.\n");
