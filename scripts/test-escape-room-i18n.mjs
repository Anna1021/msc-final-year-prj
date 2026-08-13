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
assert.match(html, /optionLabel: "选项"/, "Chinese rooms label answer choices in Chinese.");
assert.match(html, /beforeWindow: Object\.freeze\(\["放学后", "一位", "好奇的", "小读者", "走进图书馆"\]\)[\s\S]*insideWindow: Object\.freeze\(\["他", "打开了", "一本", "封面陈旧的", "故事书", "慢慢阅读"\]\)[\s\S]*afterWindow: Object\.freeze\(\["直到天黑", "。"\]\)/, "Chinese Room 2 uses complete locale-specific activity data without English token positions.");
assert.match(html, /const teaching = activity\.contextChamber/, "Room 2 selects teaching data from the current locale at render time.");
assert.doesNotMatch(html.match(/function contextChamberPuzzle\(data\)[\s\S]*?\n    \}/)?.[0] || "", /\["Once"|"curious"|"quietly"/, "Room 2 no longer embeds English token arrays in its renderer.");
assert.match(html, /id: "reader", label: "读者"[\s\S]*id: "opened", label: "打开了"/, "Chinese Room 3 has locale-specific token labels.");
assert.match(html, /prompt: "小读者打开了"[\s\S]*label: "书", value: 46/, "Chinese Room 4 has a locale-specific prediction prompt and candidates.");
assert.match(html, /examples: Object\.freeze\(\[[\s\S]*小龙在<mark>山洞<\/mark>里睡觉[\s\S]*prompt: "小龙回到了 ___"/, "Chinese Room 5 has locale-specific training examples and test prompt.");
for (const stableAnswer of ["inside", "reader", "most-likely", "patterns"]) {
  assert.match(html, new RegExp(`correctOptionId: "${stableAnswer}"`), `Escape Room keeps stable answer ID ${stableAnswer} across locale-specific display data.`);
}
assert.match(html, /const activeActivityData = \(\) => localeActivityData\[state\.language\]/, "Rooms 2–5 recompute their activity data from the current locale on every render.");

const finalChallenge = await readFile(new URL("../src/finalChallenge/FinalChallenge.jsx", import.meta.url), "utf8");
assert.match(finalChallenge, /if \(runtimeStatus !== "ready"\) return;[\s\S]*sendInitToGame\(iframeRef\.current, readEscapeProgress\(\), mainProgress, language\);[\s\S]*\[runtimeStatus, mainProgress, language, localeContent\]/, "An active locale change is immediately resent to the ready iframe.");
assert.match(html, /else if \(!wasInitialised\) \{[\s\S]*state\.exitOrder = \[\]/, "Final Lock ordering state is reset only during first initialisation, not a locale change.");

process.stdout.write("Escape Room i18n parity, active-content coverage, and stable-state checks passed.\n");
