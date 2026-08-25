import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";
import { GENERIC_GUIDE_FLOW, readGuideLocation, resolveGuideFlow } from "../src/guide/guideFlows.js";
import { clampGuidePosition, GUIDE_DRAG_THRESHOLD, isGuideDrag, placeGuidePanel } from "../src/guide/guideGeometry.js";
import { createGuideState, guideReducer, GUIDE_PROGRESS_STORAGE_KEY, readGuideProgress, writeGuideProgress } from "../src/guide/guideState.js";
import { GUIDE_POSITION_STORAGE_KEY, readGuidePosition, restoreGuidePosition, writeGuidePosition } from "../src/guide/guideStorage.js";
import { findGuideTarget, getGuideScrollContainer, guideTargetProps, guideTargetSelector } from "../src/guide/guideTargeting.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const componentPaths = [
  "../src/guide/GuideProvider.jsx",
  "../src/guide/GuideAssistant.jsx",
  "../src/guide/GuidePanel.jsx",
  "../src/guide/GuideSpotlight.jsx",
  "../src/guide/GuideExperience.jsx"
];
const [providerSource, assistantSource, panelSource, spotlightSource, experienceSource, guideCss, enGuideSource, zhGuideSource] = await Promise.all([
  ...componentPaths.map(read),
  read("../src/guide/guide.css"),
  read("../src/locales/en/guide.json"),
  read("../src/locales/zh/guide.json")
]);

await Promise.all(componentPaths.map(async (path) => {
  const source = await read(path);
  await transformWithEsbuild(source, path, { loader: "jsx", jsx: "automatic" });
}));

const opened = guideReducer(createGuideState(), { type: "open", flowId: "test.flow" });
assert.equal(opened.expanded, true, "opening expands the guide");
assert.deepEqual(opened.seenFlowIds, ["test.flow"], "opening records a semantic seen ID");
const collapsed = guideReducer(opened, { type: "collapse" });
assert.equal(collapsed.expanded, false, "close collapses the guide");
assert.equal(collapsed.activeFlowId, "test.flow", "collapse keeps the current flow available for reopening");
assert.match(experienceSource, /<GuideAssistant[\s\S]*\{guide\.expanded && step && <GuideSpotlight/, "the assistant remains rendered while the expanded panel is conditional");
assert.match(experienceSource, /onActivate=\{guide\.expanded \? guide\.collapseGuide : \(\) => guide\.openGuide\(\)\}/, "the assistant toggles expanded and collapsed states");
assert.match(experienceSource, /onClose=\{guide\.collapseGuide\}/, "the panel close action collapses instead of removing the assistant");

assert.equal(GUIDE_DRAG_THRESHOLD, 6);
assert.equal(isGuideDrag({ x: 10, y: 10 }, { x: 14, y: 13 }), false, "small pointer movement remains a click");
assert.equal(isGuideDrag({ x: 10, y: 10 }, { x: 17, y: 10 }), true, "movement beyond the threshold is a drag");
assert.match(assistantSource, /onPointerDown=\{handlePointerDown\}/);
assert.match(assistantSource, /suppressClickRef\.current/, "drag-generated clicks are suppressed");
assert.match(assistantSource, /onActivate\?\.\(\)/, "a click without dragging activates the guide");

assert.deepEqual(
  clampGuidePosition({ x: -100, y: 900 }, { width: 800, height: 600 }, { top: 70, bottom: 90, left: 16, right: 16 }, 62),
  { x: 16, y: 448 },
  "assistant position is clamped within the safe viewport"
);
const placed = placeGuidePanel({ top: 100, bottom: 160, left: 720, right: 780 }, { width: 340, height: 220 }, { width: 900, height: 700 });
assert.ok(placed.left >= 16 && placed.left + placed.width <= 884, "panel placement stays within the viewport");

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
}
const session = memoryStorage();
writeGuidePosition({ x: 120, y: 180 }, session);
assert.deepEqual(readGuidePosition(session), { x: 120, y: 180 }, "assistant position persists for the session");
assert.deepEqual(restoreGuidePosition(session, { width: 160, height: 160 }, { top: 16, bottom: 16 }, { x: 20, y: 20 }), { x: 20, y: 20 }, "a stored position completely outside the current viewport uses the safe fallback");
assert.equal(GUIDE_POSITION_STORAGE_KEY, "llmExplorerGuideAssistantPositionV1");

const local = memoryStorage();
writeGuideProgress({ seenFlowIds: ["one"], completedFlowIds: ["two"] }, local);
assert.deepEqual(readGuideProgress(local), { seenFlowIds: ["one"], completedFlowIds: ["two"] });
assert.equal(GUIDE_PROGRESS_STORAGE_KEY, "llmExplorerGuideProgressV1");
for (const source of [providerSource, assistantSource, panelSource, spotlightSource, experienceSource]) {
  assert.doesNotMatch(source, /writeProgress|readProgress|missions\[/, "guide infrastructure must not touch learner progress");
}

const lessonLocation = readGuideLocation({ pathname: "/mission/1-tokenisation-paged", search: "?page=4" });
assert.deepEqual(lessonLocation, { route: "/mission/1-tokenisation-paged", lesson: 1, page: 4, key: "lesson1.page4" });
const fixtureFlow = { id: "lesson1.page4", steps: [{ id: "input" }] };
const fixtureFlows = { home: null, lessons: { 1: { pages: { 4: fixtureFlow } } } };
assert.equal(resolveGuideFlow(fixtureFlows, lessonLocation), fixtureFlow, "route and lesson page resolve through data-driven flow configuration");
assert.equal(resolveGuideFlow(fixtureFlows, readGuideLocation({ pathname: "/mission/1-tokenisation-paged", search: "?page=2" })), GENERIC_GUIDE_FLOW, "pages without a tour resolve to the generic helper");

const target = { closest: (selector) => selector === ".page.paged-mission-page" ? { id: "lesson-scroll" } : null };
const root = { querySelector: (selector) => selector === '[data-guide-target="lesson1-input"]' ? target : null };
assert.deepEqual(guideTargetProps("lesson1-input"), { "data-guide-target": "lesson1-input" });
assert.equal(guideTargetSelector("lesson1-input"), '[data-guide-target="lesson1-input"]');
assert.equal(findGuideTarget("lesson1-input", root), target, "spotlight target lookup uses a stable semantic attribute");
assert.deepEqual(getGuideScrollContainer(target), { id: "lesson-scroll" }, "paged lessons use their real scrolling container");
assert.throws(() => guideTargetSelector("div > button"), /stable semantic identifiers/);

const enGuide = JSON.parse(enGuideSource);
const zhGuide = JSON.parse(zhGuideSource);
assert.deepEqual(Object.keys(enGuide.common), Object.keys(zhGuide.common), "guide controls have EN/ZH parity");
assert.match(panelSource, /useI18n\(\)/);
assert.match(panelSource, /t\(step\.titleKey\)/, "open guide copy is translated during render rather than stored as text");
assert.match(providerSource, /event\.key !== "Escape"[\s\S]*collapseGuide\(\)/, "Escape collapses the expanded guide");
assert.match(assistantSource, /aria-label=\{expanded \? t\("guide\.common\.guideOpen"\) : t\("guide\.common\.openGuide"\)\}/);
assert.match(panelSource, /:focus|focus/);

assert.doesNotMatch(spotlightSource, /aria-modal|focusableSelector|event\.key === "Tab"/, "the reusable spotlight does not install a modal focus trap");
assert.match(spotlightSource, /data-interactive-target=\{interactive \? "true" : "false"\}/);
assert.doesNotMatch(spotlightSource, /guide-spotlight-shade/, "the spotlight uses one continuous mask without horizontal shade seams");
assert.match(guideCss, /\.guide-spotlight-ring[\s\S]*?100vmax rgba\(36, 34, 74, \.42\)/, "the ring supplies one continuous outside shade");
assert.match(guideCss, /\.guide-spotlight-ring[\s\S]*?pointer-events:\s*none/);
assert.match(guideCss, /\.guide-panel[\s\S]*?pointer-events:\s*auto/);

process.stdout.write("Guide infrastructure regression tests passed.\n");
