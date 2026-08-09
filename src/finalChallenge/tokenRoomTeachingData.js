export const TOKEN_ROOM_TOKENIZER = Object.freeze({
  checkpoint: "Qwen/Qwen2.5-0.5B-Instruct",
  revision: "7ae557604adf67be50417f59c2c2f167def9a775",
  addSpecialTokens: false
});

export const TOKEN_ROOM_EXAMPLE = Object.freeze({
  text: "unbelievable!",
  ids: Object.freeze([359, 31798, 23760, 0]),
  rawPieces: Object.freeze(["un", "belie", "vable", "!"]),
  decodedPieces: Object.freeze(["un", "belie", "vable", "!"])
});

export const TOKEN_ROOM_CHALLENGE = Object.freeze({
  sentence: "The robot found an unhelpful clue.",
  targetWord: "unhelpful",
  sentenceIds: Object.freeze([785, 12305, 1730, 458, 650, 8653, 1262, 29989, 13]),
  sentenceRawPieces: Object.freeze(["The", "Ġrobot", "Ġfound", "Ġan", "Ġun", "help", "ful", "Ġclue", "."]),
  targetIds: Object.freeze([650, 8653, 1262]),
  targetRawPieces: Object.freeze(["Ġun", "help", "ful"]),
  targetDecodedPieces: Object.freeze([" un", "help", "ful"]),
  correctOptionId: "qwen",
  options: Object.freeze([
    Object.freeze({ id: "whole", pieces: Object.freeze(["unhelpful"]) }),
    Object.freeze({ id: "human", pieces: Object.freeze(["un", "helpful"]) }),
    Object.freeze({ id: "qwen", pieces: Object.freeze(["un", "help", "ful"]) })
  ])
});
