import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { rooms } from "../src/finalChallenge/escapeRoomData.js";
import { NUMBERS_ROOM_TEACHING_DATA } from "../src/finalChallenge/numbersRoomTeachingData.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const runtime = await read("../public/escape-room/index.html");

// 1–2. The stuck shared-action wizard is gone. Every visible drawer and answer gets its own listener.
assert.ok(!runtime.includes("data-action=\"numbers-step\""));
assert.ok(!runtime.includes("querySelector(\"[data-action='numbers-step']\")"));
assert.match(runtime, /querySelectorAll\("\[data-number-drawer\]"\)\.forEach/);
assert.match(runtime, /querySelectorAll\("\[data-number-concept\]"\)\.forEach/);

// 3–8. Three exclusive scenes make the lookup explicit, retryable and honest.
assert.equal(NUMBERS_ROOM_TEACHING_DATA.token, "reader");
assert.equal(NUMBERS_ROOM_TEACHING_DATA.tokenId, 305);
assert.deepEqual([...NUMBERS_ROOM_TEACHING_DATA.drawers], [128, 305, 742]);
assert.ok(runtime.includes("Lookup ID"));
assert.ok(runtime.includes("Find drawer ${teaching.tokenId}."));
assert.match(runtime, /if \(scene === 1\)[\s\S]*?if \(scene === 2\)[\s\S]*?numbers-check-scene/);
assert.doesNotMatch(runtime.match(/function numbersPuzzle[\s\S]*?(?=\n    function contextWindowPuzzle)/)?.[0] || "", /stepStrip\(/);
assert.match(runtime, /drawer === numbersRoomTeachingData\.tokenId[\s\S]*?data\.drawerOpened = true/);
assert.match(runtime, /\} else \{[\s\S]*?data\.drawerOpened = false;[\s\S]*?does not match ID/);
assert.ok(!runtime.includes("[ ?, ?, ?, … ]"));
for (const value of NUMBERS_ROOM_TEACHING_DATA.illustrativeRow) assert.ok(runtime.includes(value));
assert.equal(NUMBERS_ROOM_TEACHING_DATA.accuracyNote, "Simplified teaching row — real models use much larger learned representations.");
assert.ok(runtime.includes("305 did not create these numbers."));
assert.ok(runtime.includes("The model uses this learned number row in later calculations."));

// 9–11. The misconception check is specific and gates crystal collection.
assert.equal(NUMBERS_ROOM_TEACHING_DATA.correctConceptId, "lookup-label");
assert.deepEqual(NUMBERS_ROOM_TEACHING_DATA.concepts.map(({ id }) => id), ["meaning", "lookup-label", "probability"]);
assert.ok(runtime.includes("305 does not store the meaning"));
assert.ok(runtime.includes("305 is not a probability"));
assert.match(runtime, /if \(data\.drawerOpened && data\.conceptPassed\) return roomComplete\(room\)/);
assert.match(runtime, /data\.conceptPassed[\s\S]*?data-action="check"/);
assert.match(runtime, /data-action="continue-number-lookup"/);
assert.match(runtime, /selectedConcept === numbersRoomTeachingData\.correctConceptId[\s\S]*?data\.conceptPassed = true/);
const numbersSource = runtime.match(/function numbersPuzzle[\s\S]*?(?=\n    function contextWindowPuzzle)/)?.[0] || "";
assert.doesNotMatch(numbersSource, /guide\(/, "Numbers Room has no fixed right clue rail");
assert.match(runtime, /linear-gradient\(145deg, rgba\(245,243,255,\.93\), rgba\(229,239,255,\.9\)\)/, "main surface is luminous glass rather than pure white");
assert.match(runtime, /@keyframes drawerOpen/);

// 12. The shared completion helper still emits the crystal event once.
assert.match(runtime, /const already = state\.completed\.has\(room\.id\) && state\.crystals\.has\(room\.crystal\)/);
assert.match(runtime, /if \(!already\) \{\s*send\("ESCAPE_ROOM_ROOM_COMPLETE"/);

// 13–14. Native controls, visible focus, live feedback and reduced motion are retained.
assert.match(runtime, /<button type="button" class="numbers-drawer/);
assert.match(runtime, /role="radiogroup"/);
assert.match(runtime, /role="status" aria-live="polite"/);
assert.match(runtime, /\.numbers-drawer:focus-visible,[\s\S]*?\.numbers-short-choice:focus-visible/);
assert.match(runtime, /@media \(prefers-reduced-motion: reduce\)/);

// 15. Token Room implementation and event binding remain byte-for-byte unchanged.
const sourceHash = (name, nextName) => {
  const source = runtime.match(new RegExp(`    function ${name}\\(.*?\\) \\{[\\s\\S]*?(?=\\n    function ${nextName})`))?.[0];
  assert.ok(source, `${name} source is present`);
  return createHash("sha256").update(source).digest("hex");
};
assert.equal(sourceHash("tokenPuzzle", "numbersPuzzle"), "1947376c9a26b877b379fa853344ad47f0aef951db556800f91278352be63ac8");
assert.equal(sourceHash("bindTokenRoom", "bindChoiceRoom"), "9b2f64af9b480b74ba7cf2aab7f6889e8d0241258bdb50e7d3a6ca68b1bc5838");

// 16. Rooms 4–6 are unchanged from the accepted P15A baseline.
const unchanged = [
  ["connectionsPuzzle", "nextTokenPuzzle", "2d19ac8a064c60b3c243af829d53405d53d338735e086774742f715f6d31752a"],
  ["nextTokenPuzzle", "trainingLoopPuzzle", "5b5593302f112954c546ecd04c2cd30f46c250f1889d1f44394ee09b8fd249e5"],
  ["trainingLoopPuzzle", "predictionPuzzle", "91917d2b3be02e751f09cd1ae48c5fe325fa4a8d7428ddc6e8fb5e79d6fc1f61"]
];
for (const [name, nextName, hash] of unchanged) assert.equal(sourceHash(name, nextName), hash, `${name} is unchanged`);

// 17. Six-room and final-exit requirements remain intact.
assert.deepEqual(rooms.map((room) => room.id), ["token", "numbers", "context", "connections", "prediction", "training"]);
assert.equal(new Set(rooms.map((room) => room.crystalId)).size, 6);
assert.match(runtime, /const allDone = rooms\.every\(\(room\) => state\.completed\.has\(room\.id\) && state\.crystals\.has\(room\.crystal\)\)/);
assert.match(runtime, /if \(!allPlaced\)[\s\S]*?Place every crystal around the Language Model Door first/);

new Function(runtime.match(/<script>([\s\S]*)<\/script>/)?.[1] || "");
process.stdout.write("Phase P15B Numbers Room lookup-puzzle checks passed.\n");
