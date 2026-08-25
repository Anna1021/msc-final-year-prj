import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";
import {
  clampGuidePosition,
  GUIDE_DRAG_THRESHOLD,
  guidePointerOffset,
  guidePositionFromPointer,
  isGuideDrag
} from "../src/guide/guideGeometry.js";
import { GUIDE_POSITION_STORAGE_KEY, restoreGuidePosition } from "../src/guide/guideStorage.js";
import { getGuideViewportInsets } from "../src/guide/guideTargeting.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [assistantSource, cssSource, enSource, zhSource] = await Promise.all([
  read("../src/guide/GuideAssistant.jsx"),
  read("../src/guide/guide.css"),
  read("../src/locales/en/guide.json"),
  read("../src/locales/zh/guide.json")
]);
await transformWithEsbuild(assistantSource, "src/guide/GuideAssistant.jsx", { loader: "jsx", jsx: "automatic" });

const viewport = { width: 1000, height: 800 };
const size = { width: 62, height: 62 };
const hiddenFooter = { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 };
const header = { top: 0, right: 1000, bottom: 64, left: 0, width: 1000, height: 64 };
const rootWithHiddenMobileNav = {
  querySelector(selector) {
    return selector.includes("global-topbar")
      ? { getBoundingClientRect: () => header }
      : { getBoundingClientRect: () => hiddenFooter };
  }
};
const insets = getGuideViewportInsets(rootWithHiddenMobileNav, viewport.height);
assert.deepEqual(insets, { top: 76, right: 16, bottom: 24, left: 16 }, "a display:none mobile nav must not consume the desktop vertical drag range");

const centre = { x: 469, y: 369 };
assert.deepEqual(clampGuidePosition(centre, viewport, insets, size), centre, "a centre position remains valid");
assert.deepEqual(clampGuidePosition({ x: 287, y: 243 }, viewport, insets, size), { x: 287, y: 243 }, "arbitrary intermediate positions remain valid");

const assistantRect = { left: centre.x, top: centre.y, width: 62, height: 62 };
const startPointer = { x: 500, y: 400 };
const offset = guidePointerOffset(startPointer, assistantRect);
assert.deepEqual(offset, { x: 31, y: 31 });
const movedUp = guidePositionFromPointer({ x: 500, y: 180 }, offset, viewport, insets, size);
const movedDown = guidePositionFromPointer({ x: 500, y: 680 }, offset, viewport, insets, size);
assert.equal(movedUp.x, centre.x, "vertical movement does not alter X");
assert.ok(movedUp.y < centre.y && movedDown.y > centre.y, "free Y movement works in both directions");
const movedBackDown = guidePositionFromPointer({ x: 500, y: 540 }, offset, viewport, insets, size);
assert.ok(movedBackDown.y > movedUp.y, "dragging upward never traps the assistant from moving down again");
const movedLeft = guidePositionFromPointer({ x: 120, y: 400 }, offset, viewport, insets, size);
const movedRight = guidePositionFromPointer({ x: 900, y: 400 }, offset, viewport, insets, size);
assert.ok(movedLeft.x < centre.x && movedRight.x > centre.x, "free X movement works in both directions");
const topEdge = guidePositionFromPointer({ x: 500, y: -100 }, offset, viewport, insets, size);
const fromTopTowardCentre = guidePositionFromPointer({ x: 500, y: 400 }, offset, viewport, insets, size);
assert.equal(topEdge.y, insets.top);
assert.equal(fromTopTowardCentre.y, centre.y, "a clamped edge does not become a sticky or snapped position");
assert.equal(GUIDE_DRAG_THRESHOLD, 6);
assert.equal(isGuideDrag(startPointer, { x: 504, y: 403 }), false, "movement within the threshold remains a click");
assert.equal(isGuideDrag(startPointer, { x: 507, y: 400 }), true, "movement beyond the threshold is a drag");

function memoryStorage(value) {
  const values = new Map(value === undefined ? [] : [[GUIDE_POSITION_STORAGE_KEY, value]]);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, next) => values.set(key, String(next)) };
}
const fallback = { x: 916, y: 710 };
assert.deepEqual(restoreGuidePosition(memoryStorage(JSON.stringify(centre)), viewport, insets, fallback, size), centre, "a valid session position restores unchanged");
assert.deepEqual(restoreGuidePosition(memoryStorage("not-json"), viewport, insets, fallback, size), clampGuidePosition(fallback, viewport, insets, size), "malformed session data falls back safely");
assert.deepEqual(restoreGuidePosition(memoryStorage(JSON.stringify({ x: 4000, y: 4000 })), viewport, insets, fallback, size), clampGuidePosition(fallback, viewport, insets, size), "a completely impossible position falls back safely");
assert.deepEqual(restoreGuidePosition(memoryStorage(JSON.stringify({ x: 980, y: 700 })), viewport, insets, fallback, size), { x: 922, y: 700 }, "a partially out-of-range position is corrected rather than discarded");
assert.deepEqual(clampGuidePosition({ x: 900, y: 650 }, { width: 700, height: 500 }, insets, size), { x: 622, y: 414 }, "viewport resize only moves the assistant far enough to fit");

assert.match(assistantSource, /style=\{\{ left: `\$\{position\.x\}px`, top: `\$\{position\.y\}px` \}\}/, "assistant renders viewport coordinates with fixed left/top");
assert.doesNotMatch(assistantSource, /style=\{\{ transform:/, "outer drag coordinates are not rendered with a transform");
assert.match(assistantSource, /guidePointerOffset\(pointer, bounds\)/);
assert.match(assistantSource, /guidePositionFromPointer\(currentPointer, drag\.offset/);
assert.match(assistantSource, /suppressClickRef\.current = true/, "a completed drag suppresses click activation");
assert.doesNotMatch(assistantSource.match(/function handlePointerMove[\s\S]*?\n  \}/)?.[0] ?? "", /onActivate|nextStep|stepIndex/, "dragging does not alter Guide state or open the panel");
assert.match(assistantSource, /guide-assistant__mascot-frame/);
assert.match(assistantSource, /guide-assistant__mascot-image/);
assert.match(cssSource, /\.guide-assistant__mascot-frame[\s\S]*overflow:\s*hidden/, "the mascot is framed independently inside the circular assistant");
assert.match(cssSource, /\.guide-assistant__mascot-image[\s\S]*width:\s*76px[\s\S]*height:\s*52px[\s\S]*transform:\s*translate3d\(-8px, 1px, 0\)/, "the visible robot is framed without the previous magnification and positive-right offset");
assert.doesNotMatch(cssSource, /\.guide-assistant__mascot-image[\s\S]*?scale\(1\.12\)/, "the inner robot is no longer enlarged into the right edge");

const en = JSON.parse(enSource);
const zh = JSON.parse(zhSource);
assert.equal(en.common.openGuide, "Open Q website guide");
assert.equal(zh.common.openGuide, "打开小Q网页助手");
assert.equal(en.home.titles.welcome, "Hi, I'm Q!");
assert.equal(zh.home.titles.welcome, "嗨，我是小Q！");

process.stdout.write("Guide dragging and Q identity regression tests passed.\n");
