// Reviewed classroom illustrations. None of these values come from Qwen or live training.
export const PUPPY_CHOICES = Object.freeze(["ball", "moon", "quietly", "sandwich"]);

export const TARGET_COMPARISONS = Object.freeze({
  low: [{token:"ball",probability:35},{token:"cat",probability:30},{token:"moon",probability:20},{token:"sandwich",probability:15}],
  high: [{token:"ball",probability:75},{token:"cat",probability:12},{token:"moon",probability:8},{token:"sandwich",probability:5}]
});

export const ADJUSTMENT = Object.freeze({
  before:[35,30,20,15],
  after:[39,28,19,14]
});

export const EXAMPLE_GROUPS = Object.freeze([
  {id:"animal",examples:["The puppy chased the ball.","The dog fetched the ball."],result:"Animal actions strengthen a ball-related pattern."},
  {id:"money",examples:["She saved money in the bank.","He deposited cash at the bank."],result:"For savings, bank becomes the stronger next-token pattern."},
  {id:"river",examples:["They sat beside the river bank.","The water reached the river bank."],result:"Near river, bank can also follow a water-related pattern."}
]);

export const SAVINGS_BEFORE = Object.freeze([{token:"bank",probability:30},{token:"box",probability:28},{token:"river",probability:22},{token:"garden",probability:20}]);
export const SAVINGS_AFTER = Object.freeze([{token:"bank",probability:58},{token:"box",probability:19},{token:"river",probability:13},{token:"garden",probability:10}]);
