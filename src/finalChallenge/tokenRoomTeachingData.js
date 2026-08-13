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
  sentence: "The reader found an unhelpful clue.",
  targetWord: "unhelpful",
  sentenceIds: Object.freeze([785, 6604, 1730, 458, 650, 8653, 1262, 29989, 13]),
  sentenceRawPieces: Object.freeze(["The", "Ġreader", "Ġfound", "Ġan", "Ġun", "help", "ful", "Ġclue", "."]),
  targetIds: Object.freeze([650, 8653, 1262]),
  targetRawPieces: Object.freeze(["Ġun", "help", "ful"]),
  targetDecodedPieces: Object.freeze([" un", "help", "ful"]),
  correctOptionId: "option-d",
  options: Object.freeze([
    Object.freeze({ id: "option-a", pieces: Object.freeze(["unhelpful"]) }),
    Object.freeze({ id: "option-b", pieces: Object.freeze(["un", "helpful"]) }),
    Object.freeze({ id: "option-c", pieces: Object.freeze(["un", "help", "ful"]) }),
    Object.freeze({
      id: "option-d",
      statement: "It depends on the tokenizer. Different tokenizers may split \"unhelpful\" differently."
    })
  ])
});

const EN_TOKEN_ROOM_PUZZLE = Object.freeze({
  example: TOKEN_ROOM_EXAMPLE,
  challenge: TOKEN_ROOM_CHALLENGE
});

const ZH_TOKEN_ROOM_PUZZLE = Object.freeze({
  example: Object.freeze({
    text: "天气很好",
    ids: Object.freeze([104307, 101243]),
    rawPieces: Object.freeze(["å¤©æ°Ķ", "å¾Īå¥½"]),
    decodedPieces: Object.freeze(["天气", "很好"])
  }),
  challenge: Object.freeze({
    sentence: "今天去公园",
    targetWord: "今天去公园",
    sentenceIds: Object.freeze([100644, 85336, 102077]),
    sentenceRawPieces: Object.freeze(["ä»Ĭå¤©", "åİ»", "åħ¬åĽŃ"]),
    targetIds: Object.freeze([100644, 85336, 102077]),
    targetRawPieces: Object.freeze(["ä»Ĭå¤©", "åİ»", "åħ¬åĽŃ"]),
    targetDecodedPieces: Object.freeze(["今天", "去", "公园"]),
    correctOptionId: "option-d",
    options: Object.freeze([
      Object.freeze({ id: "option-a", pieces: Object.freeze(["今天去公园"]) }),
      Object.freeze({ id: "option-b", pieces: Object.freeze(["今天去", "公园"]) }),
      Object.freeze({ id: "option-c", pieces: Object.freeze(["今天", "去", "公园"]) }),
      Object.freeze({
        id: "option-d",
        statement: "取决于分词器。不同分词器可能会用不同方式拆分“今天去公园”。"
      })
    ])
  })
});

export const TOKEN_ROOM_PUZZLES = Object.freeze({
  en: EN_TOKEN_ROOM_PUZZLE,
  zh: ZH_TOKEN_ROOM_PUZZLE
});

export function getTokenRoomPuzzle(language = "en") {
  return TOKEN_ROOM_PUZZLES[language] || TOKEN_ROOM_PUZZLES.en;
}
