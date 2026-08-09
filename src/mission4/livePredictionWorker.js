import { AutoModelForCausalLM, AutoTokenizer, Tensor } from "@huggingface/transformers";
import { LIVE_MODEL } from "./liveModelConfig.js";
import { topCandidateProbabilities, probabilityDistribution } from "./livePredictionMath.js";

let tokenizer;
let model;
let backend = "wasm";

function send(type, payload = {}, transfer = []) {
  self.postMessage({ type, ...payload }, transfer);
}

function progressCallback(update) {
  const progress = Number.isFinite(update.progress) ? update.progress : (update.loaded && update.total ? (update.loaded / update.total) * 100 : null);
  send("progress", { status: update.status, file: update.file || "", progress });
}

async function loadModel() {
  if (model && tokenizer) return;
  tokenizer = await AutoTokenizer.from_pretrained(LIVE_MODEL.id, { revision: LIVE_MODEL.revision, progress_callback: progressCallback });
  const supportsWebGpu = Boolean(self.navigator?.gpu);
  backend = supportsWebGpu ? "webgpu" : "wasm";
  const options = {
    revision: LIVE_MODEL.revision,
    device: backend,
    dtype: supportsWebGpu ? "q4f16" : "q4",
    progress_callback: progressCallback
  };
  try {
    model = await AutoModelForCausalLM.from_pretrained(LIVE_MODEL.id, options);
  } catch (error) {
    if (!supportsWebGpu) throw error;
    backend = "wasm";
    model = await AutoModelForCausalLM.from_pretrained(LIVE_MODEL.id, { ...options, device: "wasm", dtype: "q4" });
  }
}

function tensorsFromIds(ids) {
  return {
    input_ids: new Tensor("int64", BigInt64Array.from(ids, BigInt), [1, ids.length]),
    attention_mask: new Tensor("int64", BigInt64Array.from(ids, () => 1n), [1, ids.length])
  };
}

async function predict({ text, inputIds, appendTokenId }) {
  await loadModel();
  let ids;
  let inputs;
  if (Array.isArray(inputIds) && inputIds.length) {
    ids = [...inputIds];
    if (Number.isInteger(appendTokenId)) ids.push(appendTokenId);
    inputs = tensorsFromIds(ids);
  } else {
    inputs = await tokenizer(text);
    ids = Array.from(inputs.input_ids.data, Number);
  }
  const output = await model(inputs);
  if (!output?.logits?.dims || output.logits.dims.length !== 3) throw new Error("The model did not return a usable next-token logits tensor.");
  const [, sequenceLength, vocabularySize] = output.logits.dims;
  if (!sequenceLength || !vocabularySize) throw new Error("The model returned an empty next-token logits tensor.");
  const start = (sequenceLength - 1) * vocabularySize;
  const logits = Float32Array.from(output.logits.data.slice(start, start + vocabularySize));
  const topIds = topCandidateProbabilities(probabilityDistribution(logits, 1), 5).map((candidate) => candidate.id);
  const tokenTextById = Object.fromEntries(topIds.map((id) => [id, tokenizer.decode([id], { skip_special_tokens: false })]));
  const currentText = tokenizer.decode(ids, { skip_special_tokens: true });
  const appendedTokenText = Number.isInteger(appendTokenId) ? tokenizer.decode([appendTokenId], { skip_special_tokens: false }) : "";
  return { logits, inputIds: ids, currentText, appendedTokenText, tokenTextById, backend };
}

self.addEventListener("message", async (event) => {
  const { id, command, payload } = event.data || {};
  try {
    if (command === "load") {
      await loadModel();
      send("response", { id, result: { backend } });
      return;
    }
    if (command === "predict") {
      const result = await predict(payload || {});
      send("response", { id, result }, [result.logits.buffer]);
    }
  } catch (error) {
    send("error", { id, message: error instanceof Error ? error.message : String(error) });
  }
});
