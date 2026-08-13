export const LESSON_3_PLAYGROUND_SENTENCES = Object.freeze({
  A: Object.freeze({
    text: "The reader picked up the book because they needed the information.",
    tokens: Object.freeze(["The", "reader", "picked", "up", "the", "book", "because", "they", "needed", "the", "information", "."]),
    defaultFocusIndex: 7
  }),
  B: Object.freeze({
    text: "Because they needed the information, the reader picked up the book.",
    tokens: Object.freeze(["Because", "they", "needed", "the", "information", ",", "the", "reader", "picked", "up", "the", "book", "."]),
    defaultFocusIndex: 1
  })
});

const LEVELS = ["veryWeak", "weak", "medium", "strong"];

export function teachingTokenize(text) {
  return text.match(/\p{Script=Han}|[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*|[^\s\p{L}\p{N}]/gu) || [];
}

export function getIllustrativeConnectionPattern({ text, tokens, focusIndex }) {
  const seed = [...text].reduce((total, character, index) => total + character.codePointAt(0) * (index + 3), 0);
  return tokens.slice(0, focusIndex).map((_, tokenIndex) => {
    const distance = focusIndex - tokenIndex;
    const score = ((seed + (tokenIndex + 1) * 37 + (focusIndex + 1) * 61 + distance * 17) % 100) / 100;
    const distanceBoost = Math.max(0, 0.34 - distance * 0.035);
    const combined = Math.min(0.99, score * 0.66 + distanceBoost);
    const levelIndex = combined >= 0.76 ? 3 : combined >= 0.52 ? 2 : combined >= 0.28 ? 1 : 0;
    return { tokenIndex, score: combined, level: LEVELS[levelIndex] };
  });
}

export function analyseConnections({ text, tokens, focusIndex }) {
  return {
    tokens,
    connectionPattern: getIllustrativeConnectionPattern({ text, tokens, focusIndex }),
    source: "illustrative"
  };
}
