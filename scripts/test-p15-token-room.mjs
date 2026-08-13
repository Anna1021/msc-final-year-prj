import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createQwenTokenizer, encodeWithTokenizer, QWEN_TOKENIZER } from "../src/mission1/qwenTokenizer.js";
import { rooms, tokenRoom } from "../src/finalChallenge/escapeRoomData.js";
import { TOKEN_ROOM_CHALLENGE, TOKEN_ROOM_EXAMPLE, TOKEN_ROOM_PUZZLES, TOKEN_ROOM_TOKENIZER } from "../src/finalChallenge/tokenRoomTeachingData.js";

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
assert.equal(TOKEN_ROOM_CHALLENGE.correctOptionId, "option-d");
assert.equal(TOKEN_ROOM_CHALLENGE.options.length, 4);
assert.deepEqual(TOKEN_ROOM_CHALLENGE.options.find((option) => option.id === "option-c").pieces, ["un", "help", "ful"]);
assert.equal(
  TOKEN_ROOM_CHALLENGE.options.find((option) => option.id === TOKEN_ROOM_CHALLENGE.correctOptionId).statement,
  "It depends on the tokenizer. Different tokenizers may split \"unhelpful\" differently."
);

const chinesePuzzle = TOKEN_ROOM_PUZZLES.zh;
const chineseExampleResult = encodeWithTokenizer(tokenizer, chinesePuzzle.example.text);
assert.deepEqual(chineseExampleResult.ids, [...chinesePuzzle.example.ids]);
assert.deepEqual(chineseExampleResult.pieces.map((piece) => piece.decodedPiece), [...chinesePuzzle.example.decodedPieces]);
const chineseChallengeResult = encodeWithTokenizer(tokenizer, chinesePuzzle.challenge.sentence);
assert.deepEqual(chineseChallengeResult.ids, [...chinesePuzzle.challenge.sentenceIds]);
assert.deepEqual(chineseChallengeResult.pieces.map((piece) => piece.decodedPiece), [...chinesePuzzle.challenge.targetDecodedPieces]);
assert.equal(chinesePuzzle.challenge.correctOptionId, "option-d");
assert.deepEqual(chinesePuzzle.challenge.options.find((option) => option.id === "option-c").pieces, ["今天", "去", "公园"]);
assert.match(chinesePuzzle.challenge.options.find((option) => option.id === "option-d").statement, /取决于分词器/);
assert.ok(chinesePuzzle.challenge.options.every((option) => option.id.startsWith("option-")), "puzzle logic uses stable locale-independent option IDs");
for (const piece of [...TOKEN_ROOM_EXAMPLE.rawPieces, ...TOKEN_ROOM_CHALLENGE.targetRawPieces]) assert.ok(runtime.includes(JSON.stringify(piece)) || runtime.includes(`>${piece.replace(/^Ġ/, "")}<`));

// 7–8. A wrong split teaches tokenizer dependence; only the accurate statement can complete the room.
assert.match(runtime, /Which statement about tokenising &ldquo;unhelpful&rdquo; is the most accurate/);
assert.match(runtime, /It depends on the tokenizer\. Different tokenizers may split &ldquo;unhelpful&rdquo; differently/);
assert.match(runtime, /Choose the most accurate statement\. You do not need to reorder the sentence/);
assert.match(runtime, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(runtime, /setRoomFeedback\(data, "feedback\.tokenIncorrect", "bad"\)/);
assert.match(runtime, /Hint: Think back to the verified example\. Do all tokenizers have to split the same text in exactly the same way/);
assert.match(runtime, /return roomComplete\(room\)/);
assert.match(runtime, /data-action="token-hint"/);
assert.match(runtime, /data\.submitted = true;[\s\S]*?data\.attempts \+= 1;[\s\S]*?renderRoom\(room\)/);
assert.match(runtime, /if \(!data\.selectedOption\)[\s\S]*?else if \(data\.selectedOption === activeTokenPuzzle\.challenge\.correctOptionId\) \{\s*return roomComplete\(room\)/);

// 9. The Token Crystal completion event is emitted only for the first collection.
assert.match(runtime, /const already = state\.completed\.has\(room\.id\) && state\.crystals\.has\(room\.crystal\)/);
assert.match(runtime, /if \(!already\) \{\s*send\("ESCAPE_ROOM_ROOM_COMPLETE"/);

// 10–11. Native buttons provide click/keyboard operation, focus is visible, and reduced motion is preserved.
assert.match(runtime, /<button type="button" class="token-split-option[\s\S]*?data-token-option/);
assert.match(runtime, /querySelectorAll\("\[data-token-option\]"\)[\s\S]*?addEventListener\("click"/);
assert.match(runtime, /\.token-split-option:focus-visible/);
assert.match(runtime, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(runtime, /role="status" aria-live="polite"/);

// 12. The retired Room 5–6 puzzle functions remain available as legacy code, but are no longer routed.
const functionOrder = ["nextTokenPuzzle", "trainingLoopPuzzle", "predictionPuzzle"];
for (let index = 0; index < functionOrder.length - 1; index += 1) {
  const name = functionOrder[index];
  const nextName = functionOrder[index + 1];
  const source = runtime.match(new RegExp(`    function ${name}\\(data\\) \\{[\\s\\S]*?(?=\\n    function ${nextName})`))?.[0];
  assert.ok(source, `${name} source is present`);
}

// 13. The active Final Challenge now follows the five-Lesson/five-crystal architecture.
assert.equal(tokenRoom.challenge, TOKEN_ROOM_CHALLENGE);
assert.deepEqual(rooms.map((room) => room.id), ["token", "numbers", "context", "connections", "prediction"]);
assert.equal(new Set(rooms.map((room) => room.crystalId)).size, 5);
assert.equal(rooms.at(-1).title, "Pattern Workshop");
assert.equal(tokenRoom.accent, "#46b86f", "Room 1 no longer exposes the retired purple crystal accent");

new Function(runtime.match(/<script>([\s\S]*)<\/script>/)?.[1] || "");
process.stdout.write("Phase P15A real-tokenisation Token Room checks passed.\n");
