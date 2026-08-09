import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createQwenTokenizer, encodeWithTokenizer, QWEN_TOKENIZER } from "../src/mission1/qwenTokenizer.js";

const assetDirectory = new URL("../public/tokenizers/qwen2.5-0.5b-instruct/", import.meta.url);
const tokenizerJson = JSON.parse(await readFile(new URL("tokenizer.json", assetDirectory), "utf8"));
const tokenizerConfig = JSON.parse(await readFile(new URL("tokenizer_config.json", assetDirectory), "utf8"));
const tokenizer = createQwenTokenizer(tokenizerJson, tokenizerConfig);

const candidates = [
  "Cats find antidisestablishmentarianism surprising!",
  "Long words can split into smaller tokens.",
  "A supercalifragilisticexpialidocious reader waved!",
  "The uncharacteristically quiet reader smiled.",
  "Multilingual text can split differently!",
  "Readers learn quickly!",
  "Tokenisation can be surprising.",
  "A chatbot noticed punctuation!",
  "Multilingual readers say hello.",
  "The tiny kitten reappeared.",
  "A model reads “hello” differently.",
  "Bonjour, cher lecteur!",
  "你好，语言模型！",
  "Der Leser lernt schnell.",
  "Le modèle découpe le texte.",
  "Spaces, emojis 🌍, and punctuation!"
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
