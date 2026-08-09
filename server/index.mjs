import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getModelServiceStats, predictNextToken } from "./modelService.mjs";

const root = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const port = Number(process.env.PORT || 8787);
const sessions = new Map();
const activePredictionSessions = new Set();
const MAX_BODY_BYTES = 16_384;
const MIME = { ".css":"text/css; charset=utf-8", ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".svg":"image/svg+xml", ".pdf":"application/pdf", ".wasm":"application/wasm" };

function json(response, status, body) {
  response.writeHead(status, { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff" });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) throw Object.assign(new Error("Request body is too large."), { status: 413 });
  }
  try { return JSON.parse(body || "{}"); }
  catch { throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 }); }
}

function checkRateLimit(request) {
  const session = String(request.headers["x-ai-explorer-session"] || request.socket.remoteAddress || "anonymous").slice(0, 128);
  const now = Date.now();
  const recent = (sessions.get(session) || []).filter(time => now - time < 60_000);
  if (recent.length >= 120) throw Object.assign(new Error("Too many prediction requests. Pause briefly and try again."), { status: 429 });
  recent.push(now);
  sessions.set(session, recent);
  return session;
}

function serveStatic(request, response, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(decodeURIComponent(requested)).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = resolve(join(root, safePath));
  if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) filePath = join(root, "index.html");
  const headers = { "Content-Type":MIME[extname(filePath).toLowerCase()] || "application/octet-stream", "X-Content-Type-Options":"nosniff" };
  response.writeHead(200, headers);
  if (request.method === "HEAD") return response.end();
  createReadStream(filePath).pipe(response);
}

export function createAppServer({ predictor = predictNextToken } = {}) {
  return createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (request.method === "GET" && url.pathname === "/api/health") return json(response, 200, { ok:true, model:getModelServiceStats() });
    if (request.method === "POST" && url.pathname === "/api/next-token") {
      let session;
      let ownsSession = false;
      try {
        session = checkRateLimit(request);
        if (activePredictionSessions.has(session)) throw Object.assign(new Error("A prediction is already running for this session."), { status:409 });
        activePredictionSessions.add(session);
        ownsSession = true;
        const result = await predictor(await readJson(request));
        return json(response, 200, result);
      } catch (error) {
        const status = error.status || (error instanceof TypeError || error instanceof RangeError ? 400 : 500);
        return json(response, status, { error:error instanceof Error ? error.message : "Prediction failed." });
      } finally {
        if (ownsSession) activePredictionSessions.delete(session);
      }
    }
    if (url.pathname === "/api/next-token") return json(response, 405, { error:"Method not allowed." });
    if (url.pathname.startsWith("/api/")) return json(response, 404, { error:"API route not found." });
    if (!["GET","HEAD"].includes(request.method || "")) return json(response, 405, { error:"Method not allowed." });
    serveStatic(request, response, url.pathname);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) createAppServer().listen(port, "0.0.0.0", () => console.log(`AI Explorer listening on ${port}`));
