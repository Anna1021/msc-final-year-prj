import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { rooms } from "../src/finalChallenge/escapeRoomData.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const runtime = await read("../public/escape-room/index.html");
const contextSource = runtime.match(/function contextWindowPuzzle[\s\S]*?(?=\n    function connectionsPuzzle)/)?.[0] || "";

// 1–2. Umbrella remains the correct clue, and completion requires the solved shift state.
assert.match(runtime, /data\.choice === "umbrella"[\s\S]*?data\.solved = true;[\s\S]*?data\.shifted = true/);
assert.match(runtime, /if \(data\.solved && data\.shifted\) return roomComplete\(room\)/);
assert.doesNotMatch(contextSource, /roomComplete\(/);

// 3–5. The current window is bright and distinct; old text stays labelled/readable; chips map to source clues.
assert.match(runtime, /\.context-current-window[\s\S]*?background: linear-gradient\(145deg, rgba\(231,253,255,\.96\), rgba\(198,239,246,\.94\)\)/);
assert.match(runtime, /\.context-current-window \.context-sentence p \{ color: #142b48/);
assert.match(runtime, /context-old-zone[\s\S]*?Outside window/);
assert.match(runtime, /\.context-old-zone \.context-sentence p \{ color: #d8e2ec/);
for (const clue of ["umbrella at home", "dark clouds", "looked outside"]) assert.ok(contextSource.includes(clue));
assert.match(contextSource, /data-context-clue="\$\{id\}"/);

// 6–8. Correct and wrong choices teach current availability; the window shifts once after success.
assert.ok(runtime.includes("This clue is outside the current Context Window. The model cannot use it right now."));
assert.ok(runtime.includes("This clue is still inside the highlighted window."));
assert.match(runtime, /querySelectorAll\("\[data-context-clue\]"\)\.forEach/);
assert.match(contextSource, /if \(scene === 1\)[\s\S]*?if \(scene === 2\)[\s\S]*?context-shift-scene/);
assert.match(contextSource, /Moved outside[\s\S]*?New text/);
assert.match(runtime, /@keyframes contextFadeLeft/);
assert.match(runtime, /@keyframes contextSlideIn/);

// 9–10. Crystal is shown only in Scene 3; native controls, focus, live feedback and reduced motion remain.
assert.match(contextSource, /context-shift-scene[\s\S]*?data-action="check"/);
assert.match(runtime, /const already = state\.completed\.has\(room\.id\) && state\.crystals\.has\(room\.crystal\)/);
assert.match(contextSource, /<button type="button" role="radio"/);
assert.match(runtime, /\.context-clue-chip:focus-visible/);
assert.match(contextSource, /role="status" aria-live="polite"/);
assert.match(runtime, /@media \(prefers-reduced-motion: reduce\)/);

// 11–12. Responsive stacking exists and the room has no fixed side clue rail.
assert.match(runtime, /@media \(max-width: 760px\)[\s\S]*?\.context-reading-stage \{ grid-template-columns: 1fr/);
assert.doesNotMatch(contextSource, /guide\(/);
assert.doesNotMatch(contextSource, /stepStrip\(/);

const sourceHash = (name, nextName) => {
  const source = runtime.match(new RegExp(`    function ${name}\\(.*?\\) \\{[\\s\\S]*?(?=\\n    function ${nextName})`))?.[0];
  assert.ok(source, `${name} source is present`);
  return createHash("sha256").update(source).digest("hex");
};

// Global regression: Room 1 and the retained legacy puzzle functions remain unchanged.
assert.equal(sourceHash("tokenPuzzle", "numbersPuzzle"), "54dfe05178fbbe4d027d088fa3fe18d289cd275c1e83fd4023ba344e10913548");
for (const [name, nextName, hash] of [
  ["connectionsPuzzle", "nextTokenPuzzle", "2d19ac8a064c60b3c243af829d53405d53d338735e086774742f715f6d31752a"],
  ["nextTokenPuzzle", "trainingLoopPuzzle", "631c3e47ea74a9b64cb5195c3bafe20cbab1bd529802a69684980c39407ef5e3"],
  ["trainingLoopPuzzle", "predictionPuzzle", "91917d2b3be02e751f09cd1ae48c5fe325fa4a8d7428ddc6e8fb5e79d6fc1f61"]
]) assert.equal(sourceHash(name, nextName), hash, `${name} is unchanged`);

assert.deepEqual(rooms.map((room) => room.id), ["token", "numbers", "context", "connections", "prediction"]);
assert.equal(new Set(rooms.map((room) => room.crystalId)).size, 5);
assert.match(runtime, /const allDone = rooms\.every\(\(room\) => state\.completed\.has\(room\.id\) && state\.crystals\.has\(room\.crystal\)\)/);

new Function(runtime.match(/<script>([\s\S]*)<\/script>/)?.[1] || "");
process.stdout.write("Phase P15C moving Context Window checks passed.\n");
