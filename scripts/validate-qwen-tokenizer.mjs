import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createQwenTokenizer, encodeWithTokenizer, QWEN_TOKENIZER } from "../src/mission1/qwenTokenizer.js";

const assetDirectory = new URL("../public/tokenizers/qwen2.5-0.5b-instruct/", import.meta.url);
const tokenizerJson = JSON.parse(await readFile(new URL("tokenizer.json", assetDirectory), "utf8"));
const tokenizerConfig = JSON.parse(await readFile(new URL("tokenizer_config.json", assetDirectory), "utf8"));
const tokenizer = createQwenTokenizer(tokenizerJson, tokenizerConfig);

const candidates = [
  "Cats find antidisestablishmentarianism surprising!",
  "Robots can misunderstand tokenisation.",
  "A supercalifragilisticexpialidocious robot waved!",
  "The uncharacteristically quiet robot smiled.",
  "AI reads multilingual text differently!",
  "Robots learn quickly!",
  "Tokenisation can be surprising.",
  "A chatbot noticed punctuation!",
  "Multilingual robots say hello.",
  "The tiny robot reappeared.",
  "AI reads “hello” differently.",
  "Bonjour, petit robot!",
  "你好，AI Explorer！",
  "Der Roboter lernt schnell.",
  "L’IA découpe le texte.",
  "Spaces, emojis 🤖, and punctuation!"
];

const results = candidates.map((text) => encodeWithTokenizer(tokenizer, text));
const invalid = results.filter((result) => result.decoded !== result.text);
if (invalid.length) {
  throw new Error(`Round-trip validation failed for: ${invalid.map((item) => JSON.stringify(item.text)).join(", ")}`);
}

const report = {
  generatedAt: new Date().toISOString(),
  checkpoint: QWEN_TOKENIZER.checkpoint,
  revision: QWEN_TOKENIZER.revision,
  tokenizerLibrary: `${QWEN_TOKENIZER.library}@${QWEN_TOKENIZER.libraryVersion}`,
  assetDirectory: fileURLToPath(assetDirectory),
  results
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
