export const LESSON_3_DOG_TOKENS = Object.freeze([
  "The", "tired", "dog", "slept", "beside", "the", "warm", "fire", "."
]);

export const LESSON_3_CONNECTIONS = Object.freeze([
  { id: "tired", label: "tired", strength: "strong" },
  { id: "slept", label: "slept", strength: "strong" },
  { id: "beside", label: "beside", strength: "light" }
]);

export const LESSON_3_POSITION_SENTENCES = Object.freeze({
  a: ["The", "dog", "chased", "the", "cat"],
  b: ["The", "cat", "chased", "the", "dog"]
});

export const LESSON_3_PROCESS_EXAMPLE = Object.freeze({
  tokens: ["The", "robot", "picked", "up", "the", "red", "key", "."],
  targets: ["key", "red"]
});
