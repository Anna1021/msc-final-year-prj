import assert from "node:assert/strict";
import { AutoTokenizer } from "@huggingface/transformers";
import { decodeStableTokenIds, decodeTokenIds, predictNextToken, resetModelServiceForTests } from "../server/modelService.mjs";
import { LIVE_MODEL } from "../src/mission4/liveModelConfig.js";

const tokenizer = await AutoTokenizer.from_pretrained(LIVE_MODEL.id, { revision:LIVE_MODEL.revision });
const samples = [
  "The little robot opened",
  "小机器人打开了",
  "Le petit robot a ouvert",
  "Der kleine Roboter öffnete",
  "🙂"
];

for (const text of samples) {
  const encoded = await tokenizer(text, { add_special_tokens:false });
  const ids = Array.from(encoded.input_ids.data, Number);
  assert.equal(decodeTokenIds(tokenizer, ids), text, `official full-sequence decode round-trips ${text}`);
  assert.equal(decodeStableTokenIds(tokenizer, ids).decodedText, text, `stable display decode round-trips ${text}`);
}

const chineseIds = Array.from((await tokenizer("小机器人打开了", { add_special_tokens:false })).input_ids.data, Number);
const hasIsolatedByteFragment = chineseIds.some((id) => decodeTokenIds(tokenizer, [id]).includes("�"));
assert.equal(decodeTokenIds(tokenizer, chineseIds), "小机器人打开了", "the official cumulative decode preserves the Chinese fixture regardless of tokenizer granularity");

resetModelServiceForTests();
async function generate(prompt, count) {
  let text = prompt;
  let inputTokenIds = null;
  const steps = [];
  for (let step = 0; step < count; step += 1) {
    const result = await predictNextToken({ text, input_token_ids:inputTokenIds, temperature:1, mode:"greedy", top_k:5 });
    assert.ok(result.candidates.every((candidate) => !candidate.display_token.includes("�") && !candidate.decoded_contribution.includes("�")), "candidate labels never expose broken replacement-character chunks");
    assert.ok(!result.next_decoded_text.includes("�"), "cumulative display remains valid Unicode");
    assert.ok(result.next_decoded_text.startsWith(prompt), "generation preserves the original multilingual prompt exactly");
    assert.deepEqual(result.next_input_token_ids, [...result.input_token_ids, result.selected.token_id], "generation accumulates exact Token IDs");
    steps.push(result);
    text = result.next_decoded_text;
    inputTokenIds = result.next_input_token_ids;
  }
  return steps;
}

const steps = await generate("小机器人打开了", 8);
if (hasIsolatedByteFragment) {
  assert.ok(steps.some((result) => result.selected.display_kind === "byte_fragment"), "incomplete UTF-8 candidates are explicitly represented as byte fragments when this tokenizer produces them");
}
assert.ok(steps.some((result) => result.selected.display_kind === "text" && result.selected.decoded_contribution), "context-aware decoding eventually yields a readable Unicode contribution");
for (const prompt of ["The little robot opened", "Le petit robot a ouvert", "Der kleine Roboter öffnete"]) await generate(prompt, 3);

process.stdout.write("Live prediction Unicode decoding tests passed.\n");
