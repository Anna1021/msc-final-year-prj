import { predictNextToken, resetModelServiceForTests } from "../server/modelService.mjs";

const PROMPTS = [
  "The little robot opened the",
  "我今天去了",
  "今天天气很",
  "我喜欢吃",
  "小机器人打开了",
  "Le petit robot a ouvert",
  "Der kleine Roboter öffnete"
];

function repetitionRate(ids, size) {
  if (ids.length < size) return 0;
  const values = [];
  for (let index = 0; index <= ids.length - size; index += 1) values.push(ids.slice(index, index + size).join(","));
  return Number((((values.length - new Set(values).size) / values.length) * 100).toFixed(1));
}

resetModelServiceForTests();
const startedAt = performance.now();
const results = [];
for (const prompt of PROMPTS) {
  let text = prompt;
  let inputTokenIds = null;
  const generatedIds = [];
  const latencies = [];
  let candidateLabelsReadable = true;
  for (let step = 0; step < 15; step += 1) {
    const predictionStartedAt = performance.now();
    const prediction = await predictNextToken({ text, input_token_ids:inputTokenIds, temperature:1, mode:"greedy", top_k:5 });
    latencies.push(performance.now() - predictionStartedAt);
    candidateLabelsReadable &&= prediction.candidates.every((candidate) => candidate.display_kind === "byte_fragment" || (!candidate.display_token.includes("�") && candidate.display_token.length > 0));
    generatedIds.push(prediction.selected.token_id);
    inputTokenIds = prediction.next_input_token_ids;
    text = prediction.next_decoded_text;
    if (prediction.is_eos) break;
  }
  results.push({
    prompt,
    output:text,
    generated:text.slice(prompt.length),
    tokens:generatedIds.length,
    unicodeValid:!text.includes("�"),
    candidateLabelsReadable,
    repetition:{ unigram:repetitionRate(generatedIds, 1), bigram:repetitionRate(generatedIds, 2), trigram:repetitionRate(generatedIds, 3) },
    firstPredictionMs:Number(latencies[0].toFixed(1)),
    subsequentAverageMs:Number((latencies.slice(1).reduce((sum, value) => sum + value, 0) / Math.max(1, latencies.length - 1)).toFixed(1))
  });
}

process.stdout.write(JSON.stringify({
  totalMs:Number((performance.now() - startedAt).toFixed(1)),
  memory:process.memoryUsage(),
  results
}, null, 2) + "\n");
