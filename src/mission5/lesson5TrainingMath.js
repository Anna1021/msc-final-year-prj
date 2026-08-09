export const TRAINING_TOKENS = Object.freeze(["ball", "stick", "cat", "moon"]);
export const TRAINING_TARGET_INDEX = 0;
export const TRAINING_LEARNING_RATE = 0.18;
export const MAX_TRAINING_STEPS = 20;

const INITIAL_PROBABILITIES = Object.freeze([0.35, 0.28, 0.2, 0.17]);
const INITIAL_CONTROL_POSITIONS = Object.freeze([
  18, 44, 69, 31, 57, 76, 23, 62,
  39, 82, 51, 28, 71, 47, 34, 65
]);

export function softmax(logits) {
  const maximum = Math.max(...logits);
  const exponentials = logits.map((logit) => Math.exp(logit - maximum));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

export function crossEntropy(probabilities, targetIndex = TRAINING_TARGET_INDEX) {
  return -Math.log(Math.max(probabilities[targetIndex], Number.EPSILON));
}

export function createTrainingState() {
  const logits = INITIAL_PROBABILITIES.map((probability) => Math.log(probability));
  const probabilities = softmax(logits);
  return { step: 0, logits, probabilities, loss: crossEntropy(probabilities) };
}

export function applyTrainingStep(state, learningRate = TRAINING_LEARNING_RATE) {
  if (state.step >= MAX_TRAINING_STEPS) return state;
  const gradient = state.probabilities.map((probability, index) => probability - (index === TRAINING_TARGET_INDEX ? 1 : 0));
  const logits = state.logits.map((logit, index) => logit - learningRate * gradient[index]);
  const probabilities = softmax(logits);
  return { step: state.step + 1, logits, probabilities, loss: crossEntropy(probabilities) };
}

export function runTrainingSteps(state, count) {
  let next = state;
  for (let index = 0; index < count && next.step < MAX_TRAINING_STEPS; index += 1) next = applyTrainingStep(next);
  return next;
}

export function toProbabilityRows(state) {
  return TRAINING_TOKENS.map((token, index) => ({ token, probability: state.probabilities[index] * 100 }));
}

export function predictionGap(state) {
  return 1 - state.probabilities[TRAINING_TARGET_INDEX];
}

export function controlPositions(state) {
  const initialLogits = INITIAL_PROBABILITIES.map((probability) => Math.log(probability));
  const changes = state.logits.map((logit, index) => logit - initialLogits[index]);
  return INITIAL_CONTROL_POSITIONS.map((position, controlIndex) => {
    const combinedChange = changes.reduce((sum, change, logitIndex) => sum + change * Math.sin((controlIndex + 1) * (logitIndex + 2)), 0);
    return Math.max(10, Math.min(90, position + combinedChange * 11));
  });
}
