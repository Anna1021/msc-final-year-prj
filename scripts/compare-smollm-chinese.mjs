import { Tensor, AutoModelForCausalLM, AutoTokenizer } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/SmolLM2-135M-Instruct-ONNX";
const REVISION = "b8a5c0f183b78c55955a5364f610c36668b5e681";
const PROMPTS = ["我今天去了", "今天天气很", "我喜欢吃", "小机器人打开了"];

const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, { revision:REVISION });
const model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, { revision:REVISION, dtype:"q4", device:"cpu" });

function tokenInputs(ids) {
  return {
    input_ids:new Tensor("int64", BigInt64Array.from(ids, BigInt), [1, ids.length]),
    attention_mask:new Tensor("int64", BigInt64Array.from(ids, () => 1n), [1, ids.length])
  };
}

function repetitionRate(ids, size) {
  if (ids.length < size) return 0;
  const values = [];
  for (let index = 0; index <= ids.length - size; index += 1) values.push(ids.slice(index, index + size).join(","));
  return Number((((values.length - new Set(values).size) / values.length) * 100).toFixed(1));
}

const results = [];
for (const prompt of PROMPTS) {
  const encoded = await tokenizer(prompt);
  const ids = Array.from(encoded.input_ids.data, Number);
  const generatedIds = [];
  for (let step = 0; step < 15; step += 1) {
    const output = await model(tokenInputs(ids));
    const [, sequenceLength, vocabularySize] = output.logits.dims;
    const start = (sequenceLength - 1) * vocabularySize;
    let selectedId = 0;
    let selectedLogit = -Infinity;
    for (let id = 0; id < vocabularySize; id += 1) {
      const logit = output.logits.data[start + id];
      if (logit > selectedLogit) {
        selectedLogit = logit;
        selectedId = id;
      }
    }
    ids.push(selectedId);
    generatedIds.push(selectedId);
  }
  const output = tokenizer.decode(ids, { skip_special_tokens:false, clean_up_tokenization_spaces:false });
  results.push({ prompt, output, generated:output.slice(prompt.length), unicodeValid:!output.includes("�"), repetition:{ unigram:repetitionRate(generatedIds, 1), bigram:repetitionRate(generatedIds, 2), trigram:repetitionRate(generatedIds, 3) } });
}

process.stdout.write(JSON.stringify({ model:MODEL_ID, results }, null, 2) + "\n");
