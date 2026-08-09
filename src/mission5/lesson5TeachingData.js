// Reviewed teaching illustrations used outside the live optimisation demo.
export const TRAINING_PROMPT="The puppy chased the";
export const TRAINING_TARGET="ball";

export const BEFORE_ADJUSTMENT=Object.freeze([
  {token:"ball",probability:35},
  {token:"stick",probability:28},
  {token:"cat",probability:20},
  {token:"moon",probability:17}
]);

export const TRAINING_EXAMPLES=Object.freeze([
  {context:"The puppy chased the",target:"ball"},
  {context:"The child kicked the",target:"ball"},
  {context:"She threw the",target:"ball"},
  {context:"The dog fetched the",target:"stick"}
]);

export const GRADUAL_PATTERN_STATES=Object.freeze([
  [{token:"ball",probability:21},{token:"stick",probability:18},{token:"other",probability:61}],
  [{token:"ball",probability:24},{token:"stick",probability:18},{token:"other",probability:58}],
  [{token:"ball",probability:27},{token:"stick",probability:18},{token:"other",probability:55}],
  [{token:"ball",probability:30},{token:"stick",probability:18},{token:"other",probability:52}],
  [{token:"ball",probability:31},{token:"stick",probability:20},{token:"other",probability:49}]
]);

export const TRAINING_STEPS=Object.freeze(["trainingText","predict","reveal","compare","adjust","repeat"]);
export const GENERATION_STEPS=Object.freeze(["yourText","tokens","context","transformer","probabilities","select","repeat"]);
