import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createQwenTokenizer, encodeWithTokenizer, QWEN_TOKENIZER } from "../src/mission1/qwenTokenizer.js";
import { rooms, tokenRoom } from "../src/finalChallenge/escapeRoomData.js";
import { TOKEN_ROOM_CHALLENGE, TOKEN_ROOM_EXAMPLE, TOKEN_ROOM_TOKENIZER } from "../src/finalChallenge/tokenRoomTeachingData.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const runtime = await read("../public/escape-room/index.html");
const tokenizerJson = JSON.parse(await read("../public/tokenizers/qwen2.5-0.5b-instruct/tokenizer.json"));
const tokenizerConfig = JSON.parse(await read("../public/tokenizers/qwen2.5-0.5b-instruct/tokenizer_config.json"));
const tokenizer = createQwenTokenizer(tokenizerJson, tokenizerConfig);

assert.equal(TOKEN_ROOM_TOKENIZER.checkpoint, QWEN_TOKENIZER.checkpoint);
assert.equal(TOKEN_ROOM_TOKENIZER.revision, QWEN_TOKENIZER.revision);

// 1–2. The former English sentence-ordering task and grammar distractor are gone.
for (const obsolete of ["Robots learn surprisingly fast.", "Drag pieces into the lock slots", "One piece does not belong", "placeTokenInSlot"]) {
  assert.ok(!runtime.includes(obsolete), `obsolete Token Room behavior removed: ${obsolete}`);
}
assert.match(runtime, /You do not need to reorder the sentence/);

// 3. The learner transfers the idea from a different verified example.
assert.notEqual(TOKEN_ROOM_EXAMPLE.text.replace(/[^a-z]/gi, "").toLowerCase(), TOKEN_ROOM_CHALLENGE.targetWord.toLowerCase());

// 4–6. Both displayed splits are reproduced from the pinned Qwen tokenizer, including punctuation.
const exampleResult = encodeWithTokenizer(tokenizer, TOKEN_ROOM_EXAMPLE.text);
assert.deepEqual(exampleResult.ids, [...TOKEN_ROOM_EXAMPLE.ids]);
assert.deepEqual(exampleResult.rawPieces, [...TOKEN_ROOM_EXAMPLE.rawPieces]);
assert.deepEqual(exampleResult.pieces.map((piece) => piece.decodedPiece), [...TOKEN_ROOM_EXAMPLE.decodedPieces]);
assert.equal(TOKEN_ROOM_EXAMPLE.rawPieces.at(-1), "!");
assert.equal(TOKEN_ROOM_EXAMPLE.ids.at(-1), 0);

const challengeResult = encodeWithTokenizer(tokenizer, TOKEN_ROOM_CHALLENGE.sentence);
assert.deepEqual(challengeResult.ids, [...TOKEN_ROOM_CHALLENGE.sentenceIds]);
assert.deepEqual(challengeResult.rawPieces, [...TOKEN_ROOM_CHALLENGE.sentenceRawPieces]);
const targetStart = challengeResult.rawPieces.indexOf(TOKEN_ROOM_CHALLENGE.targetRawPieces[0]);
assert.ok(targetStart >= 0, "target token sequence exists in the full sentence");
assert.deepEqual(challengeResult.ids.slice(targetStart, targetStart + TOKEN_ROOM_CHALLENGE.targetIds.length), [...TOKEN_ROOM_CHALLENGE.targetIds]);
assert.deepEqual(challengeResult.rawPieces.slice(targetStart, targetStart + TOKEN_ROOM_CHALLENGE.targetRawPieces.length), [...TOKEN_ROOM_CHALLENGE.targetRawPieces]);
assert.deepEqual(TOKEN_ROOM_CHALLENGE.options.find((option) => option.id === TOKEN_ROOM_CHALLENGE.correctOptionId).pieces, ["un", "help", "ful"]);
for (const piece of [...TOKEN_ROOM_EXAMPLE.rawPieces, ...TOKEN_ROOM_CHALLENGE.targetRawPieces]) assert.ok(runtime.includes(JSON.stringify(piece)) || runtime.includes(`>${piece.replace(/^Ġ/, "")}<`));

// 7–8. A wrong response teaches and retries; only the verified option can complete the room.
assert.match(runtime, /Not quite\. Token boundaries do not always match whole-word or human word-part boundaries/);
assert.match(runtime, /data-action="token-hint"/);
assert.match(runtime, /data\.submitted = true;[\s\S]*?data\.attempts \+= 1;[\s\S]*?renderRoom\(room\)/);
assert.match(runtime, /if \(!data\.selectedOption\)[\s\S]*?else if \(data\.selectedOption === tokenRoomTeachingData\.challenge\.correctOptionId\) \{\s*return roomComplete\(room\)/);

// 9. The Token Crystal completion event is emitted only for the first collection.
assert.match(runtime, /const already = state\.completed\.has\(room\.id\) && state\.crystals\.has\(room\.crystal\)/);
assert.match(runtime, /if \(!already\) \{\s*send\("ESCAPE_ROOM_ROOM_COMPLETE"/);

// 10–11. Native buttons provide click/keyboard operation, focus is visible, and reduced motion is preserved.
assert.match(runtime, /<button type="button" class="token-split-option[\s\S]*?data-token-option/);
assert.match(runtime, /querySelectorAll\("\[data-token-option\]"\)[\s\S]*?addEventListener\("click"/);
assert.match(runtime, /\.token-split-option:focus-visible/);
assert.match(runtime, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(runtime, /role="status" aria-live="polite"/);

// 12. Rooms 4–6 remain byte-for-byte unchanged from the P15A baseline.
const hashes = {
  connectionsPuzzle: "2d19ac8a064c60b3c243af829d53405d53d338735e086774742f715f6d31752a",
  nextTokenPuzzle: "5b5593302f112954c546ecd04c2cd30f46c250f1889d1f44394ee09b8fd249e5",
  trainingLoopPuzzle: "91917d2b3be02e751f09cd1ae48c5fe325fa4a8d7428ddc6e8fb5e79d6fc1f61"
};
const functionOrder = ["connectionsPuzzle", "nextTokenPuzzle", "trainingLoopPuzzle", "predictionPuzzle"];
for (let index = 0; index < functionOrder.length - 1; index += 1) {
  const name = functionOrder[index];
  const nextName = functionOrder[index + 1];
  const source = runtime.match(new RegExp(`    function ${name}\\(data\\) \\{[\\s\\S]*?(?=\\n    function ${nextName})`))?.[0];
  assert.ok(source, `${name} source is present`);
  assert.equal(createHash("sha256").update(source).digest("hex"), hashes[name], `${name} is unchanged`);
}

// 13. The overall six-room/six-crystal architecture remains intact.
assert.equal(tokenRoom.challenge, TOKEN_ROOM_CHALLENGE);
assert.deepEqual(rooms.map((room) => room.id), ["token", "numbers", "context", "connections", "prediction", "training"]);
assert.equal(new Set(rooms.map((room) => room.crystalId)).size, 6);

new Function(runtime.match(/<script>([\s\S]*)<\/script>/)?.[1] || "");
process.stdout.write("Phase P15A real-tokenisation Token Room checks passed.\n");
