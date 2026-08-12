import assert from "node:assert/strict";
import { AutoModelForCausalLM, AutoTokenizer } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/Qwen2.5-0.5B";
const REVISION = "bae5ceaee026f0d0592858b2bd27645a06f19c42";

function topCandidates(logits, temperature = 1, count = 5) {
  const scaled = new Float64Array(logits.length);
  let max = -Infinity;
  for (let index = 0; index < logits.length; index += 1) {
    const value = logits[index] / temperature;
    scaled[index] = value;
    if (value > max) max = value;
  }
  let total = 0;
  for (let index = 0; index < scaled.length; index += 1) {
    const value = Math.exp(scaled[index] - max);
    scaled[index] = value;
    total += value;
  }
  return Array.from(scaled, (value, id) => ({ id, probability:value / total }))
    .sort((left, right) => right.probability - left.probability)
    .slice(0, count);
}

const loadStartedAt = performance.now();
const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, { revision:REVISION });
const model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
  revision:REVISION,
  dtype:"q4",
  device:"cpu"
});
const loadMs = performance.now() - loadStartedAt;

async function predict(text, temperature = 1) {
  const inputs = await tokenizer(text);
  const startedAt = performance.now();
  const output = await model(inputs);
  const latencyMs = performance.now() - startedAt;
  const [, sequenceLength, vocabularySize] = output.logits.dims;
  const start = (sequenceLength - 1) * vocabularySize;
  const logits = output.logits.data.slice(start, start + vocabularySize);
  const candidates = topCandidates(logits, temperature).map((candidate) => ({
    ...candidate,
    text:tokenizer.decode([...Array.from(inputs.input_ids.data, Number), candidate.id], { skip_special_tokens:false }).slice(text.length)
  }));
  return { inputIds:Array.from(inputs.input_ids.data, Number), logits, candidates, latencyMs };
}

const prompts = ["The little robot opened the", "小机器人打开了", "Le petit robot a ouvert", "Der kleine Roboter öffnete"];
const results = [];
for (const prompt of prompts) results.push(await predict(prompt));
assert.equal(results[0].logits.length, 151936, "Qwen returns its real vocabulary-sized logits");
assert.ok(results.every((result) => result.inputIds.length > 0));
assert.ok(results.every((result) => result.candidates.every((item) => Number.isInteger(item.id) && !item.text.includes("�"))));
assert.ok(new Set(results.map((result) => result.candidates[0].id)).size > 1, "multilingual prompts change the real model output");

const cool = topCandidates(results[0].logits, 0.4);
const warm = topCandidates(results[0].logits, 1.6);
assert.ok(cool[0].probability > warm[0].probability, "lower temperature concentrates probability");

console.log(JSON.stringify({
  model:MODEL_ID,
  revision:REVISION,
  dtype:"q4",
  loadMs,
  memory:process.memoryUsage(),
  prompts:prompts.map((prompt, index) => ({ prompt, latencyMs:results[index].latencyMs, candidates:results[index].candidates })),
  coolTopProbability:cool[0].probability,
  warmTopProbability:warm[0].probability
}, null, 2));
