export const LIVE_TOP_CANDIDATE_COUNT = 5;

function assertTemperature(temperature) {
  if (!Number.isFinite(temperature) || temperature <= 0) throw new RangeError("Temperature must be greater than zero.");
}

export function probabilityDistribution(logits, temperature = 1) {
  assertTemperature(temperature);
  if (!logits?.length) return new Float64Array();
  let maximum = -Infinity;
  for (let index = 0; index < logits.length; index += 1) maximum = Math.max(maximum, logits[index] / temperature);
  const probabilities = new Float64Array(logits.length);
  let total = 0;
  for (let index = 0; index < logits.length; index += 1) {
    const probability = Math.exp((logits[index] / temperature) - maximum);
    probabilities[index] = probability;
    total += probability;
  }
  for (let index = 0; index < probabilities.length; index += 1) probabilities[index] /= total;
  return probabilities;
}

export function topCandidateProbabilities(probabilities, count = LIVE_TOP_CANDIDATE_COUNT) {
  const top = [];
  for (let id = 0; id < probabilities.length; id += 1) {
    const candidate = { id, probability: probabilities[id] };
    const insertionIndex = top.findIndex((item) => candidate.probability > item.probability);
    if (insertionIndex === -1) {
      if (top.length < count) top.push(candidate);
    } else {
      top.splice(insertionIndex, 0, candidate);
      if (top.length > count) top.pop();
    }
  }
  return top;
}

export function createCandidateView(logits, tokenTextById, temperature = 1, count = LIVE_TOP_CANDIDATE_COUNT) {
  const probabilities = probabilityDistribution(logits, temperature);
  const candidates = topCandidateProbabilities(probabilities, count).map((candidate) => ({
    ...candidate,
    text: tokenTextById[candidate.id] ?? "",
    displayText: visualiseToken(tokenTextById[candidate.id] ?? "")
  }));
  const visibleProbability = candidates.reduce((total, candidate) => total + candidate.probability, 0);
  return { probabilities, candidates, otherProbability: Math.max(0, 1 - visibleProbability) };
}

export function chooseTokenId(probabilities, mode = "greedy", random = Math.random) {
  if (!probabilities.length) return null;
  if (mode === "greedy") {
    let best = 0;
    for (let index = 1; index < probabilities.length; index += 1) if (probabilities[index] > probabilities[best]) best = index;
    return best;
  }
  const threshold = random();
  let cumulative = 0;
  for (let index = 0; index < probabilities.length; index += 1) {
    cumulative += probabilities[index];
    if (threshold <= cumulative) return index;
  }
  return probabilities.length - 1;
}

export function visualiseToken(text) {
  if (text === "\n") return "↵ newline";
  if (text === "\t") return "⇥ tab";
  if (text.startsWith(" ")) return `␠${text.slice(1) || "space"}`;
  return text.replaceAll("\n", "↵").replaceAll("\t", "⇥") || "(special Token)";
}

export function temperatureDescription(temperature) {
  if (temperature < 0.7) return "more predictable";
  if (temperature > 1.05) return "more varied";
  return "balanced";
}
