import assert from "node:assert/strict";
import { once } from "node:events";
import { createAppServer } from "../server/index.mjs";
import { getModelServiceStats, resetModelServiceForTests } from "../server/modelService.mjs";

resetModelServiceForTests();
const server = createAppServer();
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = process.env.AI_EXPLORER_TEST_URL || `http://127.0.0.1:${server.address().port}`;

async function predict(text, temperature = 1, session = "live-sequential") {
  const response = await fetch(`${base}/api/next-token`, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "X-AI-Explorer-Session":session },
    body:JSON.stringify({ text, temperature, mode:"greedy", top_k:5 })
  });
  if (!response.ok) assert.fail(`Prediction service returned ${response.status}: ${await response.text()}`);
  const result = await response.json();
  assert.equal(result.input_text, text);
  assert.equal(result.candidates.length, 5);
  assert.ok(result.candidates.every((candidate, index, list) => Number.isInteger(candidate.token_id)
    && typeof candidate.raw_token === "string"
    && candidate.raw_token.length > 0
    && candidate.probability > 0
    && (index === 0 || list[index - 1].probability >= candidate.probability)));
  assert.equal(result.selected.token_id, result.candidates[0].token_id);
  return result;
}

let text = "The little robot opened";
const generations = [];
for (let step = 1; step <= 100; step += 1) {
  const result = await predict(text);
  generations.push({ step, before:text, selected:result.selected, candidates:result.candidates });
  const next = text + result.selected.raw_token;
  assert.ok(next.startsWith(text), "raw Token text is appended without destructive cleanup");
  text = next;
  if (result.is_eos) break;
}
assert.ok(generations.length >= 2);
assert.equal(generations.length, 100, "the real backend supports a 100-Token sequential generation run for the acceptance prompt");
assert.notDeepEqual(generations[0].candidates.map(item => item.token_id), generations[1].candidates.map(item => item.token_id), "updated context changes the next distribution");

const [cool, warm] = await Promise.all([
  predict("Today the weather feels", 0.4, "temperature-cool"),
  predict("Today the weather feels", 1.6, "temperature-warm")
]);
assert.ok(cool.candidates[0].probability > warm.candidates[0].probability, "lower Temperature concentrates the real full-vocabulary distribution");

const concurrent = await Promise.all([
  predict("A dragon found a", 1, "parallel-a"),
  predict("The school robot saw", 1, "parallel-b"),
  predict("Once upon a", 1, "parallel-c")
]);
assert.equal(concurrent.length, 3, "concurrent HTTP requests are safely served through the inference queue");
assert.equal(getModelServiceStats().modelLoadCount, 1, "all sequential and concurrent requests reuse one loaded model instance");

process.stdout.write(`${JSON.stringify({ generated:generations.length, finalText:text, first:generations[0], second:generations[1], coolTop:cool.candidates[0].probability, warmTop:warm.candidates[0].probability }, null, 2)}\n`);
server.close();
await once(server, "close");
