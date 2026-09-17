import assert from "node:assert/strict";
import { once } from "node:events";
import { register } from "node:module";

// Fail even on an attempted runtime import, not merely model weight loading.
register(`data:text/javascript,${encodeURIComponent(`
  export async function resolve(specifier, context, nextResolve) {
    if (["transformers", "onnxruntime", "@huggingface/tokenizers"].some(name => specifier.includes(name))) {
      throw new Error("AI runtime imported during lightweight request: " + specifier);
    }
    return nextResolve(specifier, context);
  }
`)}`, import.meta.url);

const { createAppServer } = await import("../server/index.mjs");
const server = createAppServer();
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
try {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<div id="root"><\/div>/);
  const asset = html.match(/src="(\/assets\/[^" ]+\.js)"/);
  assert.ok(asset, "built frontend includes a JavaScript asset");
  const assetResponse = await fetch(`${base}${asset[1]}`);
  assert.equal(assetResponse.status, 200);
  assert.match(assetResponse.headers.get("content-type"), /javascript/);
  await assetResponse.arrayBuffer();
  for (const route of ["tokenize", "next-token"]) {
    const invalid = await fetch(`${base}/api/${route}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}"
    });
    assert.equal(invalid.status, 400);
  }
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  const status = await health.json();
  assert.equal(status.ok, true);
  assert.equal(status.model.modelLoaded, false);
  assert.equal(status.model.tokenizerLoaded, false);
  assert.equal(status.model.modelLoadCount, 0);
} finally {
  server.close();
  await once(server, "close");
}
console.log("Cold-start static, health, and validation routes passed with AI runtime imports blocked.");
