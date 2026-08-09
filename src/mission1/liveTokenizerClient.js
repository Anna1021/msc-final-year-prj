import { LIVE_MODEL } from "../mission4/liveModelConfig.js";

export const LIVE_TOKENIZER = Object.freeze({ checkpoint:LIVE_MODEL.id, revision:LIVE_MODEL.revision, endpoint:"/api/tokenize" });

export function validateLiveTokenizerInput(text, maxLength = 200) {
  if (typeof text !== "string") return "invalid-type";
  if (!text.trim()) return "empty";
  if (text.length > maxLength) return "too-long";
  return null;
}

export async function tokenizeWithLiveModel(text, { fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== "function") throw new Error("This browser cannot contact the tokenizer service.");
  const response = await fetchImpl(LIVE_TOKENIZER.endpoint, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ text }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Tokenizer service returned ${response.status}.`);
  if (body.text !== text || body.decoded !== text || body.checkpoint !== LIVE_TOKENIZER.checkpoint) throw new Error("Tokenizer response validation failed.");
  return body;
}
