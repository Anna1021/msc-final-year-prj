import { Tensor } from "@huggingface/transformers";
import { LIVE_MODEL } from "../src/mission4/liveModelConfig.js";
import { chooseTokenId, createSeededRandom, probabilityDistribution, topCandidateProbabilities, visualiseToken } from "../src/mission4/livePredictionMath.js";

let tokenizerPromise;
let modelPromise;
let modelLoadCount = 0;
let inferenceQueue = Promise.resolve();

export const NEXT_TOKEN_LIMITS = Object.freeze({ maxTextLength: 5000, maxInputTokens: 2048, minTemperature: 0.4, maxTemperature: 1.6, maxTopK: 10 });

export function validatePredictionRequest(value) {
  const text = typeof value?.text === "string" ? value.text : "";
  const inputTokenIds = value?.input_token_ids;
  const temperature = Number(value?.temperature ?? 1);
  const mode = value?.mode ?? "greedy";
  const topK = Number(value?.top_k ?? 5);
  const seed = Number(value?.seed ?? 0);
  const sampleIndex = Number(value?.sample_index ?? 0);
  if (inputTokenIds != null && (!Array.isArray(inputTokenIds) || !inputTokenIds.length || inputTokenIds.length > NEXT_TOKEN_LIMITS.maxInputTokens || inputTokenIds.some((id) => !Number.isInteger(id) || id < 0))) {
    throw new TypeError(`input_token_ids must contain 1 to ${NEXT_TOKEN_LIMITS.maxInputTokens} non-negative integer Token IDs`);
  }
  if (!text.trim() && !inputTokenIds?.length) throw new TypeError("text must contain at least one visible character");
  if (text.length > NEXT_TOKEN_LIMITS.maxTextLength) throw new RangeError(`text must be ${NEXT_TOKEN_LIMITS.maxTextLength} characters or fewer`);
  if (!Number.isFinite(temperature) || temperature < NEXT_TOKEN_LIMITS.minTemperature || temperature > NEXT_TOKEN_LIMITS.maxTemperature) throw new RangeError("temperature must be between 0.4 and 1.6");
  if (!Number.isInteger(topK) || topK < 1 || topK > NEXT_TOKEN_LIMITS.maxTopK) throw new RangeError(`top_k must be an integer from 1 to ${NEXT_TOKEN_LIMITS.maxTopK}`);
  if (!new Set(["greedy", "sampling"]).has(mode)) throw new RangeError("mode must be greedy or sampling");
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError("seed must be an unsigned 32-bit integer");
  if (!Number.isInteger(sampleIndex) || sampleIndex < 0 || sampleIndex > NEXT_TOKEN_LIMITS.maxInputTokens) throw new RangeError(`sample_index must be an integer from 0 to ${NEXT_TOKEN_LIMITS.maxInputTokens}`);
  return { text, inputTokenIds:inputTokenIds ? [...inputTokenIds] : null, temperature, mode, topK, seed, sampleIndex };
}

async function loadTokenizer() {
  if (!tokenizerPromise) {
    console.log(`[ModelService] Loading tokenizer: ${LIVE_MODEL.id}`);
    console.log(`[ModelService] revision: ${LIVE_MODEL.revision}`);
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
    console.log(`[ModelService] Loading model: ${LIVE_MODEL.id}`);
    console.log(`[ModelService] revision: ${LIVE_MODEL.revision}`);
    console.log(`[ModelService] dtype: ${LIVE_MODEL.dtype}`);
    modelPromise = import("@huggingface/transformers").then(({ AutoModelForCausalLM }) => AutoModelForCausalLM.from_pretrained(LIVE_MODEL.id, {
      revision: LIVE_MODEL.revision,
      dtype: LIVE_MODEL.dtype,
      device: "cpu"
    }));
  }
  return modelPromise;
}

function isEosToken(tokenizer, tokenId) {
  const ids = [tokenizer.eos_token_id, tokenizer.model?.eos_token_id, tokenizer.model?.config?.eos_token_id].flat().filter(Number.isInteger);
  return ids.includes(tokenId);
}

const DECODE_OPTIONS = Object.freeze({ skip_special_tokens:false, clean_up_tokenization_spaces:false });

export function decodeTokenIds(tokenizer, tokenIds) {
  return tokenizer.decode(tokenIds, DECODE_OPTIONS);
}

export function decodeStableTokenIds(tokenizer, tokenIds) {
  const ids = [...tokenIds];
  let decodedText = decodeTokenIds(tokenizer, ids);
  let pendingTokenCount = 0;
  while (ids.length && decodedText.endsWith("�")) {
    const lastId = ids.at(-1);
    const isolated = decodeTokenIds(tokenizer, [lastId]);
    if (!isolated.includes("�")) break;
    ids.pop();
    pendingTokenCount += 1;
    decodedText = decodeTokenIds(tokenizer, ids);
  }
  return { decodedText, pendingTokenCount, complete:pendingTokenCount === 0 };
}

function decodedContribution(tokenizer, inputIds, tokenId) {
  const before = decodeStableTokenIds(tokenizer, inputIds);
  const after = decodeStableTokenIds(tokenizer, [...inputIds, tokenId]);
  const contribution = after.decodedText.startsWith(before.decodedText)
    ? after.decodedText.slice(before.decodedText.length)
    : "";
  return { contribution, before, after };
}

function tokenInputs(ids) {
  return {
    input_ids:new Tensor("int64", BigInt64Array.from(ids, BigInt), [1, ids.length]),
    attention_mask:new Tensor("int64", BigInt64Array.from(ids, () => 1n), [1, ids.length])
  };
}

async function infer(request) {
  const { text, inputTokenIds, temperature, mode, topK, seed, sampleIndex } = validatePredictionRequest(request);
  const [tokenizer, model] = await Promise.all([loadTokenizer(), loadModel()]);
  const encoded = inputTokenIds ? null : await tokenizer(text);
  const inputIds = inputTokenIds || Array.from(encoded.input_ids.data, Number);
  const inputs = inputTokenIds ? tokenInputs(inputIds) : encoded;
  const output = await model(inputs);
  if (!output?.logits?.dims || output.logits.dims.length !== 3) throw new Error("The model did not return usable causal-language-model logits.");
  const [, sequenceLength, vocabularySize] = output.logits.dims;
  const start = (sequenceLength - 1) * vocabularySize;
  const logits = output.logits.data.slice(start, start + vocabularySize);
  const probabilities = probabilityDistribution(logits, temperature);
  const top = topCandidateProbabilities(probabilities, topK);
  const selectedId = chooseTokenId(probabilities, mode, createSeededRandom(seed, sampleIndex));
  const toCandidate = ({ id, probability }) => {
    const decoded = decodedContribution(tokenizer, inputIds, id);
    const technicalToken = tokenizer.model?.convert_ids_to_tokens?.([id])?.[0] ?? `Token ${id}`;
    const readable = Boolean(decoded.contribution) && !decoded.contribution.includes("�");
    return {
      token_id:id,
      raw_token:technicalToken,
      decoded_contribution:readable ? decoded.contribution : "",
      display_token:readable ? visualiseToken(decoded.contribution) : "",
      display_kind:readable ? "text" : "byte_fragment",
      probability
    };
  };
  const candidates = top.map(toCandidate);
  const selected = toCandidate({ id: selectedId, probability: probabilities[selectedId] });
  const nextInputTokenIds = [...inputIds, selectedId];
  const currentDecoded = decodeStableTokenIds(tokenizer, inputIds);
  const nextDecoded = decodeStableTokenIds(tokenizer, nextInputTokenIds);
  return {
    input_text: currentDecoded.decodedText,
    input_token_ids:inputIds,
    next_input_token_ids:nextInputTokenIds,
    decoded_text:currentDecoded.decodedText,
    next_decoded_text:nextDecoded.decodedText,
    pending_token_count:nextDecoded.pendingTokenCount,
    temperature,
    mode,
    seed,
    sample_index:sampleIndex,
    candidates,
    selected,
    is_eos: isEosToken(tokenizer, selectedId),
    model: { id: LIVE_MODEL.id, revision: LIVE_MODEL.revision, dtype:LIVE_MODEL.dtype }
  };
}

export function predictNextToken(request) {
  const queued = inferenceQueue.then(() => infer(request));
  inferenceQueue = queued.catch(() => {});
  return queued;
}

export function getModelServiceStats() {
  return {
    id:LIVE_MODEL.id,
    revision:LIVE_MODEL.revision,
    dtype:LIVE_MODEL.dtype,
    modelLoadCount,
    modelLoaded:Boolean(modelPromise),
    tokenizerLoaded:Boolean(tokenizerPromise)
  };
}

export function resetModelServiceForTests() {
  tokenizerPromise = undefined;
  modelPromise = undefined;
  modelLoadCount = 0;
  inferenceQueue = Promise.resolve();
}
