import assert from "node:assert/strict";
import { once } from "node:events";
import { createAppServer } from "../server/index.mjs";
import { getModelServiceStats, validatePredictionRequest } from "../server/modelService.mjs";

const requests = [];
const predictor = async (request) => {
  requests.push(validatePredictionRequest(request));
  if (request.text.startsWith("slow")) await new Promise(resolve => setTimeout(resolve, 80));
  return {
    input_text: request.text,
    temperature: request.temperature,
    candidates: [
      { token_id: 1, raw_token: " the", display_token: "␠the", probability: 0.42 },
      { token_id: 2, raw_token: " a", display_token: "␠a", probability: 0.21 },
      { token_id: 3, raw_token: " door", display_token: "␠door", probability: 0.12 },
      { token_id: 4, raw_token: ".", display_token: ".", probability: 0.08 },
      { token_id: 5, raw_token: "ing", display_token: "ing", probability: 0.04 }
    ],
    selected: { token_id: 1, raw_token: " the", display_token: "␠the", probability: 0.42 },
    is_eos: false,
    model: { id: "test-model", revision: "fixed-test-revision" }
  };
};

const server = createAppServer({ predictor });
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;

try {
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).ok, true);

  const tokenized = await fetch(`${base}/api/tokenize`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ text:"Robots can misunderstand tokenisation." })
  });
  assert.equal(tokenized.status, 200);
  const tokenizedBody = await tokenized.json();
  assert.equal(tokenizedBody.decoded, tokenizedBody.text, "the live tokenizer round-trips the learner text exactly");
  assert.equal(tokenizedBody.count, tokenizedBody.ids.length);
  assert.equal(tokenizedBody.checkpoint, "onnx-community/SmolLM2-135M-Instruct-ONNX");
  assert.deepEqual(tokenizedBody.ids, [20348,1565,416,20820,9624,5014,30]);
  assert.equal(getModelServiceStats().tokenizerLoaded, true);
  assert.equal(getModelServiceStats().modelLoaded, false, "Mission 1 loads only the tokenizer, not model weights");
  assert.equal((await fetch(`${base}/api/tokenize`, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ text:"" }) })).status, 400);
  assert.equal((await fetch(`${base}/api/tokenize`)).status, 405);

  const valid = await fetch(`${base}/api/next-token`, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "X-AI-Explorer-Session":"api-test" },
    body:JSON.stringify({ text:"The robot opened", temperature:0.8, top_k:5, mode:"greedy" })
  });
  assert.equal(valid.status, 200);
  assert.match(valid.headers.get("content-type"), /application\/json/);
  const body = await valid.json();
  assert.equal(body.candidates.length, 5);
  assert.equal(body.selected.raw_token, " the");
  assert.equal(body.candidates[0].probability, 0.42);
  assert.deepEqual(body.candidates.map(candidate => candidate.probability), [0.42, 0.21, 0.12, 0.08, 0.04]);
  assert.equal(body.selected.token_id, body.candidates[0].token_id);
  assert.equal(requests.length, 1);

  for (const [payload, expected] of [
    [{ text:"", temperature:1, top_k:5, mode:"greedy" }, 400],
    [{ text:"hello", temperature:0.1, top_k:5, mode:"greedy" }, 400],
    [{ text:"hello", temperature:1, top_k:99, mode:"greedy" }, 400],
    [{ text:"hello", temperature:1, top_k:5, mode:"invented" }, 400]
  ]) {
    const response = await fetch(`${base}/api/next-token`, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload) });
    assert.equal(response.status, expected);
    assert.equal(typeof (await response.json()).error, "string");
  }

  const invalidJson = await fetch(`${base}/api/next-token`, { method:"POST", headers:{ "Content-Type":"application/json" }, body:"{" });
  assert.equal(invalidJson.status, 400);
  const wrongMethod = await fetch(`${base}/api/next-token`);
  assert.equal(wrongMethod.status, 405);

  const overlappingFirst = fetch(`${base}/api/next-token`, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "X-AI-Explorer-Session":"same-generation" },
    body:JSON.stringify({ text:"slow first request", temperature:1, top_k:5, mode:"greedy" })
  });
  await new Promise(resolve => setTimeout(resolve, 10));
  const overlappingSecond = await fetch(`${base}/api/next-token`, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "X-AI-Explorer-Session":"same-generation" },
    body:JSON.stringify({ text:"slow second request", temperature:1, top_k:5, mode:"greedy" })
  });
  assert.equal(overlappingSecond.status, 409, "one browser session cannot queue two active predictions");
  assert.equal((await overlappingFirst).status, 200);

  const abortController = new AbortController();
  const abortedRequest = fetch(`${base}/api/next-token`, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "X-AI-Explorer-Session":"cancelled-generation" },
    body:JSON.stringify({ text:"slow cancelled request", temperature:1, top_k:5, mode:"greedy" }),
    signal:abortController.signal
  });
  await new Promise(resolve => setTimeout(resolve, 10));
  abortController.abort();
  await assert.rejects(abortedRequest, /abort/i, "a browser can cancel an in-flight HTTP request");
  await new Promise(resolve => setTimeout(resolve, 90));
  assert.equal((await fetch(`${base}/api/health`)).status, 200, "an aborted client does not damage the service");

  const lessonRoute = await fetch(`${base}/mission/4-training-data-paged?page=3`);
  assert.equal(lessonRoute.status, 200);
  assert.match(lessonRoute.headers.get("content-type"), /text\/html/);
  assert.match(await lessonRoute.text(), /<div id="root"><\/div>/);

  const ethicsPdf = await fetch(`${base}/ethics/Adult_Participant_Information_Sheet.pdf`, { method:"HEAD" });
  assert.equal(ethicsPdf.status, 200);
  assert.match(ethicsPdf.headers.get("content-type"), /application\/pdf/);
} finally {
  server.close();
  await once(server, "close");
}

process.stdout.write("Next-token API validation and error handling tests passed.\n");
