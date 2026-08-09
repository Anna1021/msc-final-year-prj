import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createQwenTokenizer, encodeWithTokenizer, QWEN_TOKENIZER } from "../src/mission1/qwenTokenizer.js";

const assetDirectory = new URL("../public/tokenizers/qwen2.5-0.5b-instruct/", import.meta.url);
const outputUrl = new URL("../src/mission1/qwenTokenizerFixtures.json", import.meta.url);
const tokenizerJson = JSON.parse(await readFile(new URL("tokenizer.json", assetDirectory), "utf8"));
const tokenizerConfig = JSON.parse(await readFile(new URL("tokenizer_config.json", assetDirectory), "utf8"));
const tokenizer = createQwenTokenizer(tokenizerJson, tokenizerConfig);

const definitions = [
  { id: "intro-long-word", role: "intro", language: "en", text: "The uncharacteristically quiet robot smiled." },
  { id: "challenge-robots-learn", role: "part-b", language: "en", text: "Robots learn quickly!" },
  { id: "challenge-tokenisation", role: "part-b", language: "en", text: "Tokenisation can be surprising." },
  { id: "challenge-chatbot", role: "part-b", language: "en", text: "A chatbot noticed punctuation!" },
  { id: "challenge-multilingual", role: "part-b", language: "en", text: "Multilingual robots say hello." },
  { id: "challenge-reappeared", role: "part-b", language: "en", text: "The tiny robot reappeared." },
  { id: "challenge-french", role: "part-b", language: "fr", text: "Bonjour, petit robot!" },
  { id: "challenge-chinese", role: "part-b", language: "zh", text: "你好，AI Explorer！" },
  { id: "challenge-german", role: "part-b", language: "de", text: "Der Roboter lernt schnell." },
  { id: "challenge-french-subword", role: "part-b", language: "fr", text: "L’IA découpe le texte." },
  { id: "edge-curly-quotes", role: "edge-case", language: "en", text: "AI reads “hello” differently." },
  { id: "edge-emoji-byte-pieces", role: "edge-case", language: "en", text: "Spaces, emojis 🤖, and punctuation!" }
];

const fixtures = definitions.map((definition) => {
  const result = encodeWithTokenizer(tokenizer, definition.text);
  if (result.decoded !== definition.text) throw new Error(`Round-trip failed for ${definition.id}.`);
  if (definition.role === "part-b" && (result.count < 4 || result.count > 8)) {
    throw new Error(`${definition.id} has ${result.count} tokens; Part B requires 4–8.`);
  }
  return {
    ...definition,
    count: result.count,
    ids: result.ids,
    rawPieces: result.rawPieces,
    decodedPieces: result.pieces.map((piece) => piece.decodedPiece),
    decoded: result.decoded
  };
});

const output = {
  schemaVersion: 1,
  generatedAt: "2026-08-01",
  checkpoint: QWEN_TOKENIZER.checkpoint,
  revision: QWEN_TOKENIZER.revision,
  tokenizerLibrary: `${QWEN_TOKENIZER.library}@${QWEN_TOKENIZER.libraryVersion}`,
  addSpecialTokens: false,
  fixtures
};

await mkdir(new URL("../src/mission1/", import.meta.url), { recursive: true });
await writeFile(outputUrl, `${JSON.stringify(output, null, 2)}\n`, "utf8");
process.stdout.write(`Wrote ${fixtures.length} verified fixtures to ${outputUrl.pathname}\n`);
