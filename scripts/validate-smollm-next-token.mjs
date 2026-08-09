import assert from "node:assert/strict";
import { AutoModelForCausalLM, AutoTokenizer } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/SmolLM2-135M-Instruct-ONNX";
const REVISION = "b8a5c0f183b78c55955a5364f610c36668b5e681";

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
  return Array.from(scaled, (value, id) => ({ id, probability: value / total }))
    .sort((left, right) => right.probability - left.probability)
    .slice(0, count);
}

const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, { revision: REVISION });
const model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
  revision: REVISION,
  dtype: "q4",
  device: "cpu"
});

async function predict(text, temperature = 1) {
  const inputs = await tokenizer(text);
  const output = await model(inputs);
  const [, sequenceLength, vocabularySize] = output.logits.dims;
  const start = (sequenceLength - 1) * vocabularySize;
  const logits = output.logits.data.slice(start, start + vocabularySize);
  const candidates = topCandidates(logits, temperature).map((candidate) => ({
    ...candidate,
    text: tokenizer.decode([candidate.id], { skip_special_tokens: false })
  }));
  return {
    inputIds: Array.from(inputs.input_ids.data, Number),
    logits,
    candidates
  };
}

const prompts = ["The cat sat on the", "Once upon a", "Today I feel"];
const first = await predict(prompts[0]);
const second = await predict(prompts[1]);
const third = await predict(prompts[2]);
assert.equal(first.logits.length, 49152, "real vocabulary-sized logits are returned");
assert.ok(first.inputIds.length > 0, "real input token IDs are returned");
assert.ok(first.candidates.every((item) => Number.isInteger(item.id) && item.text.length > 0));
assert.notDeepEqual(first.candidates.map((item) => item.id), second.candidates.map((item) => item.id), "arbitrary prompts change the model output");
assert.notDeepEqual(second.candidates.map((item) => item.id), third.candidates.map((item) => item.id), "a third arbitrary prompt also changes the model output");

const cool = topCandidates(first.logits, 0.35);
const warm = topCandidates(first.logits, 1.35);
assert.ok(cool[0].probability > warm[0].probability, "lower temperature concentrates probability");

const appendedId = first.candidates[0].id;
const appendedText = tokenizer.decode([...first.inputIds, appendedId], { skip_special_tokens: true });
const next = await predict(appendedText);
assert.notDeepEqual(first.candidates.map((item) => item.id), next.candidates.map((item) => item.id), "appending a real token changes the next inference");

console.log(JSON.stringify({
  model: MODEL_ID,
  revision: REVISION,
  prompts: prompts.map((prompt, index) => ({ prompt, candidates: [first, second, third][index].candidates })),
  appendedText,
  secondStep: next.candidates,
  coolTopProbability: cool[0].probability,
  warmTopProbability: warm[0].probability
}, null, 2));
