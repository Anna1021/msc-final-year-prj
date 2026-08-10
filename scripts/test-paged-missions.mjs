import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PAGED_MISSIONS, PAGED_MISSION_ROUTES } from "../src/pagedMissions/missionCurriculumData.js";
import { MISSION_COPY } from "../src/pagedMissions/missionCurriculumData.js";

const component = await readFile(new URL("../src/pagedMissions/PagedCurriculumMission.jsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/pagedMissions/pagedCurriculum.css", import.meta.url), "utf8");
const kit = await readFile(new URL("../src/pagedMissions/PlayfulMissionKit.jsx", import.meta.url), "utf8");
const kitCss = await readFile(new URL("../src/pagedMissions/playfulMissionKit.css", import.meta.url), "utf8");
const app = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const course = await readFile(new URL("../src/data/courseData.js", import.meta.url), "utf8");
const fallbacks = await readFile(new URL("./create-spa-route-fallbacks.mjs", import.meta.url), "utf8");

assert.equal(PAGED_MISSIONS[3].pages.length, 6, "Lesson 3 metadata has six focused pages");
assert.equal(PAGED_MISSIONS[5].pages.length, 4, "Lesson 4 metadata has four focused pages");
assert.equal(PAGED_MISSIONS[6].pages.length, 4, "Lesson 5 has four focused pages");
assert.deepEqual(PAGED_MISSIONS[3].pages.map((page) => page[0]), ["connections","attention","representation","position","process","summary"]);
assert.deepEqual(PAGED_MISSIONS[5].pages.map((page) => page[0]), ["predict","choose","live","check"]);
assert.deepEqual(PAGED_MISSIONS[6].pages.map((page) => page[0]), ["origin","adjust","repeat","connect"]);
for (const [id, route] of Object.entries(PAGED_MISSION_ROUTES)) {
  assert.match(app, new RegExp(route.replaceAll("/", "\\/")), `paged Mission storage ID ${id} route is registered`);
  assert.match(fallbacks, new RegExp(route.slice(1).replaceAll("/", "\\/")), `${route} has an SPA fallback`);
  assert.match(course, new RegExp(`route:\\s*"${route.replaceAll("/", "\\/")}"`), `${route} is learner-facing`);
}
assert.match(component, /\["inspect","balance","output","scenario"\]/, "Mission 5 requires inspection, change, output and scenario activities");
assert.match(component, /visited\.has\(pages\.length\)/, "direct final-page access cannot complete a Mission");
assert.match(component, /role="radiogroup"[\s\S]*role="radio"[\s\S]*aria-checked/, "single-choice activities expose radio semantics");
assert.match(component, /<PageTransitionBridge/, "every page renders a causal bridge to the next idea");
assert.match(component, /<PlayfulDiscoveryPanel/, "every revealed discovery uses the shared discovery panel");
assert.match(kit, /role="status"/, "discovery changes are announced");
assert.match(component, /<PlayfulWorkbench/, "every curriculum page uses a major visual teaching scene");
assert.match(component, /paged-mission-playful/, "all curriculum Missions opt into the scoped visual kit");
assert.match(component, /mission5-robot-training\.png/, "training scenes use the local training robot");
assert.match(component, /pcm-person-card/, "Mission 5 uses accessible person example cards rather than anonymous dots");
assert.match(component, /history\.pushState/, "page navigation creates browser history");
assert.match(component, /addEventListener\("popstate"/, "browser Back and Forward restore pages");
assert.doesNotMatch(component, /sessionStorage/, "temporary activity state is not stored in sessionStorage");
assert.match(css, /^\.mission-lesson-paged\.paged-curriculum-mission/m, "shared CSS stays scoped to paged curriculum Missions");
assert.match(kitCss, /^\.paged-mission-playful/m, "playful kit CSS is scoped to paged Missions");
for (const width of [1180,980,760,520,375]) assert.match(css, new RegExp(`max-width:${width}px`), `${width}px responsive breakpoint exists`);
assert.match(css, /prefers-reduced-motion:reduce/, "reduced motion is respected");
const copyKeys = Object.keys(MISSION_COPY.en).sort();
for (const language of ["zh","fr","de"]) assert.deepEqual(Object.keys(MISSION_COPY[language]).sort(), copyKeys, `${language} shared paged-copy keys match English`);

process.stdout.write("Paged Missions 3–5 tests passed.\n");
