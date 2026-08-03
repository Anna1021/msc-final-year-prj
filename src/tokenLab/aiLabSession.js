import fixtureSet from "../mission1/qwenTokenizerFixtures.json" with { type: "json" };
import { QWEN_TOKENIZER } from "../mission1/qwenTokenizer.js";

export function createAiLabTokenContract(result) {
  if (!result || typeof result.text !== "string" || !Array.isArray(result.ids) || !Array.isArray(result.pieces) || !Array.isArray(result.visualGroups)) return null;
  return {
    input: result.text,
    pieces: result.pieces.map((piece) => ({ ...piece })),
    ids: [...result.ids],
    visualGroups: result.visualGroups.map((group) => ({ ...group, ids: [...group.ids], rawPieces: [...group.rawPieces] })),
    count: result.count,
    tokenizer: { checkpoint: result.checkpoint || QWEN_TOKENIZER.checkpoint, revision: result.revision || QWEN_TOKENIZER.revision }
  };
}

export function getDefaultNumbersContract() {
  const fixture = fixtureSet.fixtures.find((item) => item.id === "challenge-robots-learn");
  const pieces = fixture.ids.map((id, index) => ({ index, id, rawPiece: fixture.rawPieces[index], decodedPiece: fixture.decodedPieces[index] }));
  return {
    input: fixture.text,
    pieces,
    ids: [...fixture.ids],
    visualGroups: pieces.map((piece) => ({ startIndex: piece.index, tokenCount: 1, ids: [piece.id], rawPieces: [piece.rawPiece], decodedPiece: piece.decodedPiece })),
    count: fixture.count,
    tokenizer: { checkpoint: fixtureSet.checkpoint, revision: fixtureSet.revision }
  };
}

export function readAiLabStage(search = window.location.search) {
  if (typeof window !== "undefined" && window.location.pathname === "/token-lab") return "tokenize";
  const stage = new URLSearchParams(search).get("stage");
  return ["numbers", "context", "predict", "compare"].includes(stage) ? stage : "tokenize";
}
