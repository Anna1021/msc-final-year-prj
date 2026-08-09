import { LIVE_MODEL } from "../src/mission4/liveModelConfig.js";
import { chooseTokenId, probabilityDistribution, topCandidateProbabilities, visualiseToken } from "../src/mission4/livePredictionMath.js";

let tokenizerPromise;
let modelPromise;
let modelLoadCount = 0;
let inferenceQueue = Promise.resolve();

export const NEXT_TOKEN_LIMITS = Object.freeze({ maxTextLength: 5000, minTemperature: 0.4, maxTemperature: 1.6, maxTopK: 10 });

export function validatePredictionRequest(value) {
  const text = typeof value?.text === "string" ? value.text : "";
  const temperature = Number(value?.temperature ?? 1);
  const mode = value?.mode ?? "greedy";
  const topK = Number(value?.top_k ?? 5);
  if (!text.trim()) throw new TypeError("text must contain at least one visible character");
  if (text.length > NEXT_TOKEN_LIMITS.maxTextLength) throw new RangeError(`text must be ${NEXT_TOKEN_LIMITS.maxTextLength} characters or fewer`);
  if (!Number.isFinite(temperature) || temperature < NEXT_TOKEN_LIMITS.minTemperature || temperature > NEXT_TOKEN_LIMITS.maxTemperature) throw new RangeError("temperature must be between 0.4 and 1.6");
  if (!Number.isInteger(topK) || topK < 1 || topK > NEXT_TOKEN_LIMITS.maxTopK) throw new RangeError(`top_k must be an integer from 1 to ${NEXT_TOKEN_LIMITS.maxTopK}`);
  if (!new Set(["greedy", "sampling"]).has(mode)) throw new RangeError("mode must be greedy or sampling");
  return { text, temperature, mode, topK };
}

async function loadTokenizer() {
  if (!tokenizerPromise) {
    tokenizerPromise = import("@huggingface/transformers").then(({ AutoTokenizer }) => AutoTokenizer.from_pretrained(LIVE_MODEL.id, { revision: LIVE_MODEL.revision }));
  }
  return tokenizerPromise;
}

export async function tokenizeText(value) {
  const text = typeof value?.text === "string" ? value.text : "";
  if (!text.trim()) throw new TypeError("text must contain at least one visible character");
  if (text.length > 200) throw new RangeError("text must be 200 characters or fewer");
  const tokenizer = await loadTokenizer();
  const encoded = await tokenizer(text, { add_special_tokens:false });
  const ids = Array.from(encoded.input_ids.data, Number);
  const decode = (tokenIds) => tokenizer.decode(tokenIds, { skip_special_tokens:false, clean_up_tokenization_spaces:false });
  const pieces = ids.map((id, index) => {
    const decodedPiece = decode([id]);
    return { index, id, rawPiece:visualiseToken(decodedPiece), decodedPiece };
  });
  const visualGroups = [];
  for (let index = 0; index < pieces.length;) {
    let end = index + 1;
    let decodedPiece = decode(ids.slice(index, end));
    while (decodedPiece.includes("�") && end < pieces.length) {
      end += 1;
      decodedPiece = decode(ids.slice(index, end));
    }
    visualGroups.push({ startIndex:index, tokenCount:end-index, ids:ids.slice(index,end), rawPieces:pieces.slice(index,end).map((piece)=>piece.rawPiece), decodedPiece });
    index = end;
  }
  return { text, checkpoint:LIVE_MODEL.id, revision:LIVE_MODEL.revision, count:ids.length, ids, rawPieces:pieces.map((piece)=>piece.rawPiece), pieces, visualGroups, decoded:decode(ids) };
}

async function loadModel() {
  if (!modelPromise) {
    modelLoadCount += 1;
    modelPromise = import("@huggingface/transformers").then(({ AutoModelForCausalLM }) => AutoModelForCausalLM.from_pretrained(LIVE_MODEL.id, {
      revision: LIVE_MODEL.revision,
      dtype: "q4",
      device: "cpu"
    }));
  }
  return modelPromise;
}

function isEosToken(tokenizer, tokenId) {
  const ids = [tokenizer.eos_token_id, tokenizer.model?.eos_token_id, tokenizer.model?.config?.eos_token_id].flat().filter(Number.isInteger);
  return ids.includes(tokenId);
}

async function infer(request) {
  const { text, temperature, mode, topK } = validatePredictionRequest(request);
  const [tokenizer, model] = await Promise.all([loadTokenizer(), loadModel()]);
  const inputs = await tokenizer(text);
  const output = await model(inputs);
  if (!output?.logits?.dims || output.logits.dims.length !== 3) throw new Error("The model did not return usable causal-language-model logits.");
  const [, sequenceLength, vocabularySize] = output.logits.dims;
  const start = (sequenceLength - 1) * vocabularySize;
  const logits = output.logits.data.slice(start, start + vocabularySize);
  const probabilities = probabilityDistribution(logits, temperature);
  const top = topCandidateProbabilities(probabilities, topK);
  const selectedId = chooseTokenId(probabilities, mode);
  const toCandidate = ({ id, probability }) => {
    const rawToken = tokenizer.decode([id], { skip_special_tokens: false, clean_up_tokenization_spaces: false });
    return { token_id: id, raw_token: rawToken, display_token: visualiseToken(rawToken), probability };
  };
  const candidates = top.map(toCandidate);
  const selected = toCandidate({ id: selectedId, probability: probabilities[selectedId] });
  return {
    input_text: text,
    temperature,
    candidates,
    selected,
    is_eos: isEosToken(tokenizer, selectedId),
    model: { id: LIVE_MODEL.id, revision: LIVE_MODEL.revision }
  };
}

export function predictNextToken(request) {
  const queued = inferenceQueue.then(() => infer(request));
  inferenceQueue = queued.catch(() => {});
  return queued;
}

export function getModelServiceStats() {
  return { modelLoadCount, modelLoaded: Boolean(modelPromise), tokenizerLoaded: Boolean(tokenizerPromise) };
}

export function resetModelServiceForTests() {
  tokenizerPromise = undefined;
  modelPromise = undefined;
  modelLoadCount = 0;
  inferenceQueue = Promise.resolve();
}
