import assert from "node:assert/strict";
import { chooseTokenId, createSeededRandom, probabilityDistribution, topCandidateProbabilities } from "../src/mission4/livePredictionMath.js";

const seed = 0x4c4c4d34;
const fixture = Float32Array.from([4, 3, 2, 1, 0, -1, -2, -3]);

function samplePath(temperature, steps = 12) {
  const probabilities = probabilityDistribution(fixture, temperature);
  return Array.from({ length:steps }, (_, sampleIndex) => chooseTokenId(probabilities, "sampling", createSeededRandom(seed, sampleIndex)));
}

assert.deepEqual(samplePath(1), samplePath(1), "the same seed and temperature reproduce the same sampled path");
assert.notDeepEqual(samplePath(.3), samplePath(1.7), "materially different temperatures can alter the sampled path with the same seed");

const outsideTopFive = Float64Array.from([.3, .2, .15, .1, .09, .08, .05, .03]);
assert.deepEqual(topCandidateProbabilities(outsideTopFive, 5).map(({ id }) => id), [0, 1, 2, 3, 4]);
assert.equal(chooseTokenId(outsideTopFive, "sampling", () => .86), 5, "sampling uses the full vocabulary distribution rather than the displayed top five");

const probabilityTotal = probabilityDistribution(fixture, 1).reduce((sum, value) => sum + value, 0);
assert.ok(Math.abs(probabilityTotal - 1) < 1e-12, "temperature-scaled probabilities sum to one");

process.stdout.write("Live prediction temperature-sampling tests passed.\n");
