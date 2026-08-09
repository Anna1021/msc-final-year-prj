import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createQwenTokenizer, encodeWithTokenizer, QWEN_TOKENIZER } from "../src/mission1/qwenTokenizer.js";

const assets = new URL("../public/tokenizers/qwen2.5-0.5b-instruct/", import.meta.url);
const tokenizer = createQwenTokenizer(
  JSON.parse(await readFile(new URL("tokenizer.json", assets), "utf8")),
  JSON.parse(await readFile(new URL("tokenizer_config.json", assets), "utf8"))
);
const definitions = [
  { id: "everyday", category: "everyday", language: "en", text: "Readers learn quickly!" },
  { id: "long-word", category: "longWords", language: "en", text: "The uncharacteristically quiet reader smiled." },
  { id: "contraction", category: "contractions", language: "en", text: "I can't believe it's tokenised!" },
  { id: "hyphen", category: "hyphens", language: "en", text: "A well-trained reader re-checks text." },
  { id: "punctuation", category: "punctuation", language: "en", text: "Wait... really?!" },
  { id: "emoji", category: "emoji", language: "en", text: "Spaces, emojis 🌍, and punctuation!" },
  { id: "chinese", category: "chinese", language: "zh", text: "你好，语言模型！" },
  { id: "french", category: "french", language: "fr", text: "Le modèle découpe le texte." },
  { id: "german", category: "german", language: "de", text: "Der Leser lernt schnell." },
  { id: "spacing", category: "spacing", language: "en", text: "Tokens  can change with spacing." }
];

const presets = definitions.map((definition) => {
  const result = encodeWithTokenizer(tokenizer, definition.text);
  if (result.decoded !== definition.text) throw new Error(`Round-trip failed for ${definition.id}.`);
  return {
    ...definition,
    count: result.count,
    visualGroupCount: result.visualGroups.length,
    ids: result.ids,
    rawPieces: result.rawPieces,
    decoded: result.decoded
  };
});

const output = {
  schemaVersion: 1,
  generatedAt: "2026-08-01",
  checkpoint: QWEN_TOKENIZER.checkpoint,
  revision: QWEN_TOKENIZER.revision,
  presets
};
const outputUrl = new URL("../src/tokenLab/tokenLabPresetFixtures.json", import.meta.url);
await mkdir(new URL("../src/tokenLab/", import.meta.url), { recursive: true });
await writeFile(outputUrl, `${JSON.stringify(output, null, 2)}\n`, "utf8");
process.stdout.write(`Wrote ${presets.length} Token Lab preset fixtures.\n`);
