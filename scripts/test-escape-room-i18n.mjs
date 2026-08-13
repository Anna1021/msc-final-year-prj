import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { activeEscapeRoomEnglish, escapeRoomRuntimeLocales } from "../src/finalChallenge/escapeRoomRuntimeLocales.js";

const languages = ["zh"];
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
assert.match(html, /\["en", "zh"\]\.includes\(payload\.preferredLanguage\)/, "Escape Room runtime supports only the active EN/ZH locale pair.");
assert.match(html, /const tokenRoomTeachingData = \(\) => tokenRoomPuzzles\[state\.language\]/, "Room 1 chooses its teaching puzzle at render time from the active locale.");
assert.match(html, /text: "天气很好"[\s\S]*pieces: Object\.freeze\(\["天气", "很好"\]\)/, "Chinese Room 1 includes a verified Chinese tokenizer example.");
assert.match(html, /sentence: "今天去公园"[\s\S]*correctOptionId: "option-d"/, "Chinese Room 1 uses the tokenizer-dependent statement as its stable correct answer.");
assert.match(html, /id: "option-d", statement: "取决于分词器。不同分词器可能会用不同方式拆分“今天去公园”。"/, "Chinese Room 1 includes the tokenizer-dependent explanation option.");

const finalChallenge = await readFile(new URL("../src/finalChallenge/FinalChallenge.jsx", import.meta.url), "utf8");
assert.match(finalChallenge, /if \(runtimeStatus !== "ready"\) return;[\s\S]*sendInitToGame\(iframeRef\.current, readEscapeProgress\(\), mainProgress, language\);[\s\S]*\[runtimeStatus, mainProgress, language, localeContent\]/, "An active locale change is immediately resent to the ready iframe.");
assert.match(html, /else if \(!wasInitialised\) \{[\s\S]*state\.exitOrder = \[\]/, "Final Lock ordering state is reset only during first initialisation, not a locale change.");

process.stdout.write("Escape Room i18n parity, active-content coverage, and stable-state checks passed.\n");
