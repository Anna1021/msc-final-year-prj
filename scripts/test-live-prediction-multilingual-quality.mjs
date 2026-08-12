import assert from "node:assert/strict";
import { predictNextToken, resetModelServiceForTests } from "../server/modelService.mjs";

const STARTERS = Object.freeze({
  EN:"The little robot opened the",
  ZH:"小机器人打开了",
  FR:"Le petit robot a ouvert",
  DE:"Der kleine Roboter öffnete"
});
const CHECKPOINTS = new Set([5, 10, 20, 50, 100]);

function repetitionRate(ids, size) {
  if (ids.length < size) return 0;
  const ngrams = [];
  for (let index = 0; index <= ids.length - size; index += 1) ngrams.push(ids.slice(index, index + size).join(","));
  return Number((((ngrams.length - new Set(ngrams).size) / ngrams.length) * 100).toFixed(1));
}

function scriptCounts(text) {
  const counts = { han:0, latin:0, replacement:0, other:0 };
  for (const character of text) {
    if (character === "�") counts.replacement += 1;
    else if (/\p{Script=Han}/u.test(character)) counts.han += 1;
    else if (/\p{Script=Latin}/u.test(character)) counts.latin += 1;
    else counts.other += 1;
  }
  return counts;
}

async function generate({ locale, prompt, mode, temperature, maxTokens }) {
  let text = prompt;
  let inputTokenIds = null;
  const selectedIds = [];
  const checkpoints = [];
  let eos = false;

  for (let step = 1; step <= maxTokens; step += 1) {
    const result = await predictNextToken({ text, input_token_ids:inputTokenIds, temperature, mode, top_k:5 });
    assert.equal(result.next_input_token_ids.length, result.input_token_ids.length + 1, "diagnostic generation state grows by one Token");
    selectedIds.push(result.selected.token_id);
    inputTokenIds = result.next_input_token_ids;
    text = result.next_decoded_text;
    eos = result.is_eos;
    if (CHECKPOINTS.has(step) || eos) {
      checkpoints.push({
        locale,
        prompt,
        mode,
        temperature,
        tokens:step,
        repetition:{ unigram:repetitionRate(selectedIds, 1), bigram:repetitionRate(selectedIds, 2), trigram:repetitionRate(selectedIds, 3) },
        eos,
        unicodeValid:!text.includes("�"),
        scripts:scriptCounts(text.slice(prompt.length)),
        selectedTokenIds:[...selectedIds],
        output:text
      });
    }
    if (eos) break;
  }
  return checkpoints;
}

resetModelServiceForTests();
const report = [];
for (const [locale, prompt] of Object.entries(STARTERS)) {
  report.push(...await generate({ locale, prompt, mode:"greedy", temperature:1, maxTokens:100 }));
}

// Sampling is deliberately report-only: natural model quality is not a CI pass/fail condition.
for (const temperature of [0.7, 1, 1.2]) {
  report.push(...await generate({ locale:"ZH", prompt:STARTERS.ZH, mode:"sampling", temperature, maxTokens:20 }));
}

process.stdout.write(JSON.stringify({
  note:"Quality metrics are diagnostic only. Failures indicate state/Unicode invariants, not linguistic quality.",
  generatedAt:new Date().toISOString(),
  report
}, null, 2) + "\n");
