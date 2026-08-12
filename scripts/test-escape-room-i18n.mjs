import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { activeEscapeRoomEnglish, escapeRoomRuntimeLocales } from "../src/finalChallenge/escapeRoomRuntimeLocales.js";

const languages = ["zh", "fr", "de"];
const intentionalOriginal = new Set(["Option", "Tokens", "Training"]);

function leafPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" && !Array.isArray(child) ? leafPaths(child, path) : [path];
  });
}

const english = JSON.parse(await readFile(new URL("../src/locales/en/escapeRoom.json", import.meta.url), "utf8"));
const englishMessageKeys = leafPaths(english.runtime.messages).sort();

for (const language of languages) {
  const runtime = escapeRoomRuntimeLocales[language];
  assert.deepEqual(leafPaths(runtime.messages).sort(), englishMessageKeys, `${language} runtime message parity`);
  for (const source of activeEscapeRoomEnglish) {
    assert.equal(typeof runtime.replacements[source], "string", `${language} must map ${source}`);
    if (!intentionalOriginal.has(source)) assert.notEqual(runtime.replacements[source], source, `${language} must translate ${source}`);
  }
}

const html = await readFile(new URL("../public/escape-room/index.html", import.meta.url), "utf8");
assert.doesNotMatch(html, /state\.exitFeedback\s*=/, "Final Exit state must store locale keys, not rendered strings.");
assert.match(html, /feedbackKey/, "Room feedback must use stable locale keys.");
assert.match(html, /exitFeedbackKey/, "Final Exit feedback must use stable locale keys.");
for (const room of ["token", "context", "connection", "prediction", "pattern"]) {
  assert.match(html, new RegExp(`setRoomFeedback\\(data, \\"feedback\\.${room}`), `${room} must store stable feedback keys.`);
}
assert.match(html, /previousRoom !== state\.currentRoom \|\| !state\.roomData/, "Language init must preserve the active room state.");

process.stdout.write("Escape Room i18n parity, active-content coverage, and stable-state checks passed.\n");
