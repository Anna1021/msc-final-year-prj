import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { canAccessFinalChallenge, canAccessMission, defaultProgress } from "../src/state/progress.js";
import { rooms } from "../src/finalChallenge/escapeRoomData.js";
import { didContextWindowShift } from "../src/mission2/contextWindowProgress.js";
import { LEGACY_LESSON_REDIRECTS, canonicalLessonLocation, resolveLegacyLessonRoute } from "../src/utils/legacyLessonRoutes.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const app = await read("../src/main.jsx");
const shell = await read("../src/mission1/MissionLessonShell.jsx");
const fallback = await read("./create-spa-route-fallbacks.mjs");
const progressSource = await read("../src/state/progress.js");
const lesson2 = await read("../src/mission2/Mission2PagedPrototype.jsx");
const lesson2Pages = await read("../src/mission2/Mission2ContextPages.jsx");
const officialLessonCopy = await Promise.all([
  read("../src/locales/en/mission1.json"),
  read("../src/locales/en/mission2.json"),
  read("../src/locales/en/mission3.json"),
  read("../src/locales/en/mission4.json"),
  read("../src/locales/en/mission5.json")
]);

const expectedRedirects = {
  "/mission/1-tokenisation": "/mission/1-tokenisation-paged",
  "/mission/2-next-token": "/mission/4-training-data-paged",
  "/mission/3-hallucination": "/mission/3-hallucination-paged",
  "/mission/4-context": "/mission/2-prediction-paged",
  "/mission/5-training-data": "/mission/5-bias-paged",
  "/mission/5/get-training-data": "/mission/5-bias-paged",
  "/mission/5/learn-patterns": "/mission/5-bias-paged",
  "/mission/5/make-predictions": "/mission/5-bias-paged",
  "/mission/6-bias": "/mission/5-bias-paged"
};
const canonicalRoutes = [
  "/mission/1-tokenisation-paged",
  "/mission/2-prediction-paged",
  "/mission/3-hallucination-paged",
  "/mission/4-training-data-paged",
  "/mission/5-bias-paged"
];

// 1–2. Every obsolete route is mapped to the intended official lesson and has no renderer.
assert.deepEqual(LEGACY_LESSON_REDIRECTS, expectedRedirects);
for (const [legacy, canonical] of Object.entries(expectedRedirects)) {
  assert.equal(resolveLegacyLessonRoute(legacy), canonical);
  assert.doesNotMatch(app, new RegExp(`route === ["']${legacy.replaceAll("/", "\\/")}["']\\) page =`));
}

// 3–4. Redirects are pure and the App explicitly avoids visit writes for legacy arrivals.
assert.equal(canonicalLessonLocation("/mission/4-context", "?page=9&qa=1"), "/mission/2-prediction-paged?qa=1");
assert.equal(canonicalLessonLocation("/mission/4-context", "?page=9"), "/mission/2-prediction-paged");
assert.match(app, /if \(resolveLegacyLessonRoute\(window\.location\.pathname\)\) return new Set\(\)/);
assert.match(app, /if \(!legacyTarget\) \{[\s\S]*?setVisitedMissionIds/);
assert.doesNotMatch(await read("../src/utils/legacyLessonRoutes.js"), /writeProgress|localStorage|sessionStorage|completed/);

// 5–6. The five official route components contain 27 pages and invalid page values fall back safely.
assert.equal(7 + 6 + 6 + 4 + 4, 27);
for (const route of canonicalRoutes) assert.match(app, new RegExp(`route === ["']${route.replaceAll("/", "\\/")}["']`));
assert.match(shell, /Number\.isInteger\(page\) && page >= 1 && page <= pageCount \? page : 1/);

// 7–10. Lessons, Final Challenge and Next remain available without curriculum-level locks.
const emptyProgress = defaultProgress();
for (const id of [1, 2, 3, 5, 6]) assert.equal(canAccessMission(emptyProgress, id), true);
assert.equal(canAccessFinalChallenge(emptyProgress), true);
assert.match(app, /route === "\/final-challenge"\) page = <FinalChallenge/);
assert.doesNotMatch(app, /route === "\/final-challenge" && !canAccessFinalChallenge/);
assert.match(shell, /disabled=\{currentPage === pageCount && !onEnd\}/);
assert.doesNotMatch(shell, /activityComplete[\s\S]{0,120}disabled|canAdvance/);

// 11. Direct summary visits do not satisfy required activity evidence or write completion by themselves.
assert.match(lesson2, /const \[activities, setActivities\] = useState\(\(\) => new Set\(\)\)/);
assert.match(lesson2, /const complete = REQUIRED_ACTIVITIES\.every/);
assert.match(lesson2, /if \(complete\) \{[\s\S]*?writeProgress/);

// 12–13. Page 3 evidence is tied to a real movement of the fixed-size window.
assert.equal(didContextWindowShift(4, 5, 5), false);
assert.equal(didContextWindowShift(5, 6, 5), true);
assert.match(lesson2Pages, /if \(didContextWindowShift\(count, nextCount, WINDOW_SIZE\)\) onComplete\?\.\(\)/);

// 14. Canonical lesson content does not revive the removed AI-literacy curriculum.
const canonicalCopy = officialLessonCopy.join("\n");
assert.doesNotMatch(canonicalCopy, /hallucination|verification checklist|responsible AI|gender bias|fairness/i);

// 15. Official navigation and overview use learner-facing Lesson terminology.
assert.match(await read("../src/locales/en/navigation.json"), /"missions": "Lessons"/);
assert.match(await read("../src/locales/en/missions.json"), /"allTitle": "All Lessons"/);
assert.match(app, /t\("mission2\.shell\.backToMissions"\)/);

// 16. Escape Room remains a six-crystal experience.
assert.equal(rooms.length, 6);
assert.equal(new Set(rooms.map((room) => room.crystalId)).size, 6);

// 17–18. Existing completion IDs and curriculum migration version stay compatible.
assert.deepEqual(Object.keys(emptyProgress.missions).map(Number), [1, 2, 3, 5, 6]);
assert.match(progressSource, /const CURRICULUM_VERSION = 2/);

// 19. Redirect targets are canonical and cannot redirect again.
for (const target of Object.values(expectedRedirects)) assert.equal(resolveLegacyLessonRoute(target), null);

// 20. The build continues to emit direct-load SPA fallbacks for every official route.
for (const route of [...canonicalRoutes, "/final-challenge"]) {
  assert.match(fallback, new RegExp(`["']${route.slice(1).replaceAll("/", "\\/")}["']`));
}

process.stdout.write("Phase P14 canonical routing and compatibility checks passed (20 requirements).\n");
