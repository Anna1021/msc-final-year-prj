import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import {
  createQwenTokenizer,
  encodeWithTokenizer,
  loadQwenTokenizer,
  QWEN_TOKENIZER,
  resetQwenTokenizerForTests,
  tokenizeWithQwen,
  validateQwenTokenizerInput
} from "../src/mission1/qwenTokenizer.js";

const assetDirectory = new URL("../public/tokenizers/qwen2.5-0.5b-instruct/", import.meta.url);
const fixturesUrl = new URL("../src/mission1/qwenTokenizerFixtures.json", import.meta.url);
const source = JSON.parse(await readFile(new URL("source.json", assetDirectory), "utf8"));
const fixtureSet = JSON.parse(await readFile(fixturesUrl, "utf8"));
const tokenizerJson = JSON.parse(await readFile(new URL("tokenizer.json", assetDirectory), "utf8"));
const tokenizerConfig = JSON.parse(await readFile(new URL("tokenizer_config.json", assetDirectory), "utf8"));
const tokenizer = createQwenTokenizer(tokenizerJson, tokenizerConfig);

assert.equal(source.checkpoint, QWEN_TOKENIZER.checkpoint);
assert.equal(source.revision, QWEN_TOKENIZER.revision);
assert.equal(source.tokenizerLibraryVersion, QWEN_TOKENIZER.libraryVersion);
assert.equal(fixtureSet.checkpoint, QWEN_TOKENIZER.checkpoint);
assert.equal(fixtureSet.revision, QWEN_TOKENIZER.revision);
assert.equal(fixtureSet.addSpecialTokens, false);

const expectedAssetFiles = ["LICENSE", "source.json", "tokenizer.json", "tokenizer_config.json"];
assert.deepEqual((await readdir(assetDirectory)).sort(), expectedAssetFiles);

for (const [filename, metadata] of Object.entries(source.files)) {
  const file = await readFile(new URL(filename, assetDirectory));
  assert.equal(createHash("sha256").update(file).digest("hex"), metadata.sha256, `${filename} checksum`);
}

for (const fixture of fixtureSet.fixtures) {
  const actual = encodeWithTokenizer(tokenizer, fixture.text);
  assert.equal(actual.decoded, fixture.text, `${fixture.id} round-trip`);
  assert.equal(actual.count, fixture.count, `${fixture.id} count`);
  assert.deepEqual(actual.ids, fixture.ids, `${fixture.id} ids`);
  assert.deepEqual(actual.rawPieces, fixture.rawPieces, `${fixture.id} raw pieces`);
  assert.deepEqual(actual.pieces.map((piece) => piece.decodedPiece), fixture.decodedPieces, `${fixture.id} decoded pieces`);
  if (fixture.role === "part-b") assert.ok(actual.count >= 4 && actual.count <= 8, `${fixture.id} Part B size`);
}

assert.ok(fixtureSet.fixtures.filter((fixture) => fixture.role === "part-b").length >= 5);
assert.ok(fixtureSet.fixtures.some((fixture) => fixture.language === "en"));
assert.ok(fixtureSet.fixtures.some((fixture) => fixture.language === "zh"));
assert.ok(fixtureSet.fixtures.some((fixture) => fixture.language === "fr"));
assert.ok(fixtureSet.fixtures.some((fixture) => fixture.language === "de"));
assert.equal(validateQwenTokenizerInput(""), "empty");
assert.equal(validateQwenTokenizerInput("   "), "empty");
assert.equal(validateQwenTokenizerInput("a".repeat(201)), "too-long");
assert.equal(validateQwenTokenizerInput("a".repeat(200)), null);
assert.equal(validateQwenTokenizerInput("你好，AI Explorer！"), null);

resetQwenTokenizerForTests();
const requestedAssets = [];
const fetchImpl = async (url) => {
  requestedAssets.push(url);
  if (url.endsWith("/tokenizer.json")) return { ok: true, json: async () => tokenizerJson };
  if (url.endsWith("/tokenizer_config.json")) return { ok: true, json: async () => tokenizerConfig };
  return { ok: false, status: 404, statusText: "Not Found" };
};
const browserStyleResult = await tokenizeWithQwen("Robots learn quickly!", { fetchImpl });
assert.equal(browserStyleResult.count, 5);
assert.deepEqual(requestedAssets, [
  `${QWEN_TOKENIZER.assetBaseUrl}/tokenizer.json`,
  `${QWEN_TOKENIZER.assetBaseUrl}/tokenizer_config.json`
]);
assert.equal(await loadQwenTokenizer({ fetchImpl }), await loadQwenTokenizer({ fetchImpl }), "loader singleton");
resetQwenTokenizerForTests();

process.stdout.write(`Validated ${fixtureSet.fixtures.length} Qwen tokenizer fixtures.\n`);
