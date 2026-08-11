export const TOY_LOCATIONS = Object.freeze(["cave", "forest", "castle"]);

export const STARTER_TRAINING_EXAMPLES = Object.freeze([
  { id: "starter-sleeps", text: "The dragon sleeps in the cave.", location: "cave", starter: true },
  { id: "starter-hides", text: "The dragon hides in the cave.", location: "cave", starter: true },
  { id: "starter-waits", text: "The dragon waits in the cave.", location: "cave", starter: true }
]);

export const AVAILABLE_TRAINING_EXAMPLES = Object.freeze([
  { id: "rests-cave", text: "The dragon rests in the cave.", location: "cave" },
  { id: "guards-cave", text: "The dragon guards the cave.", location: "cave" },
  { id: "flies-castle", text: "The dragon flew over the castle.", location: "castle" },
  { id: "wanders-forest", text: "The dragon wandered through the forest.", location: "forest" },
  { id: "stands-castle", text: "The dragon stood near the castle.", location: "castle" }
]);

const INITIAL_WEIGHTS = Object.freeze({ cave: 34, forest: 33, castle: 33 });
const EVIDENCE_WEIGHT = 6;

function roundToWholePercentages(weights) {
  const total = TOY_LOCATIONS.reduce((sum, location) => sum + weights[location], 0);
  const exact = TOY_LOCATIONS.map((location, index) => ({
    location,
    index,
    value: (weights[location] / total) * 100
  }));
  const result = Object.fromEntries(exact.map(({ location, value }) => [location, Math.floor(value)]));
  let remaining = 100 - Object.values(result).reduce((sum, value) => sum + value, 0);
  const remainderOrder = [...exact].sort((a, b) => (b.value - Math.floor(b.value)) - (a.value - Math.floor(a.value)) || a.index - b.index);
  for (let index = 0; index < remaining; index += 1) result[remainderOrder[index].location] += 1;
  return result;
}

export function calculateToyPrediction(exampleIds = []) {
  const selected = new Set(exampleIds);
  const weights = { ...INITIAL_WEIGHTS };
  AVAILABLE_TRAINING_EXAMPLES.forEach((example) => {
    if (selected.has(example.id)) weights[example.location] += EVIDENCE_WEIGHT;
  });
  return roundToWholePercentages(weights);
}

export function predictionDeltas(before, after) {
  return Object.fromEntries(TOY_LOCATIONS.map((location) => [location, after[location] - before[location]]));
}
