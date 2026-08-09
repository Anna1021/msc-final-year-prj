import { Tokenizer } from "@huggingface/tokenizers";

export const QWEN_TOKENIZER = Object.freeze({
  checkpoint: "Qwen/Qwen2.5-0.5B-Instruct",
  revision: "7ae557604adf67be50417f59c2c2f167def9a775",
  library: "@huggingface/tokenizers",
  libraryVersion: "0.1.3",
  assetBaseUrl: "/tokenizers/qwen2.5-0.5b-instruct"
});

let tokenizerPromise;

export function validateQwenTokenizerInput(text, maxLength = 200) {
  if (typeof text !== "string") return "invalid-type";
  if (!text.trim()) return "empty";
  if (text.length > maxLength) return "too-long";
  return null;
}

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Unable to load Qwen tokenizer asset (${response.status} ${response.statusText}).`);
  }
  return response.json();
}

export function createQwenTokenizer(tokenizerJson, tokenizerConfig) {
  return new Tokenizer(tokenizerJson, tokenizerConfig);
}

export function resetQwenTokenizerForTests() {
  tokenizerPromise = undefined;
}

export function loadQwenTokenizer({
  assetBaseUrl = QWEN_TOKENIZER.assetBaseUrl,
  fetchImpl = globalThis.fetch
} = {}) {
  if (typeof fetchImpl !== "function") {
    return Promise.reject(new Error("This browser cannot load the Qwen tokenizer assets."));
  }
  if (!tokenizerPromise) {
    const base = assetBaseUrl.replace(/\/$/, "");
    tokenizerPromise = Promise.all([
      fetchJson(`${base}/tokenizer.json`, fetchImpl),
      fetchJson(`${base}/tokenizer_config.json`, fetchImpl)
    ]).then(([tokenizerJson, tokenizerConfig]) => createQwenTokenizer(tokenizerJson, tokenizerConfig))
      .catch((error) => {
        tokenizerPromise = undefined;
        throw error;
      });
  }
  return tokenizerPromise;
}

export function encodeWithTokenizer(tokenizer, text) {
  if (typeof text !== "string") throw new TypeError("Tokenizer input must be a string.");
  const encoded = tokenizer.encode(text, { add_special_tokens: false });
  const ids = Array.from(encoded.ids, Number);
  const pieces = Array.from(encoded.tokens, (rawPiece, index) => ({
    index,
    id: ids[index],
    rawPiece,
    decodedPiece: tokenizer.decode([ids[index]], { skip_special_tokens: false })
  }));
  const visualGroups = [];
  for (let index = 0; index < pieces.length;) {
    let end = index + 1;
    let decodedPiece = pieces[index].decodedPiece;
    while (decodedPiece.includes("�") && end < pieces.length) {
      end += 1;
      decodedPiece = tokenizer.decode(ids.slice(index, end), { skip_special_tokens: false });
    }
    visualGroups.push({
      startIndex: index,
      tokenCount: end - index,
      ids: ids.slice(index, end),
      rawPieces: pieces.slice(index, end).map((piece) => piece.rawPiece),
      decodedPiece
    });
    index = end;
  }
  return {
    text,
    checkpoint: QWEN_TOKENIZER.checkpoint,
    revision: QWEN_TOKENIZER.revision,
    count: ids.length,
    ids,
    rawPieces: pieces.map((piece) => piece.rawPiece),
    pieces,
    visualGroups,
    decoded: tokenizer.decode(ids, { skip_special_tokens: false })
  };
}

export async function tokenizeWithQwen(text, options) {
  const tokenizer = await loadQwenTokenizer(options);
  return encodeWithTokenizer(tokenizer, text);
}
