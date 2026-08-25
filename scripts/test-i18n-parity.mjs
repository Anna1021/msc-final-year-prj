import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DEFAULT_LANGUAGE, normaliseLanguage, SUPPORTED_LANGUAGES } from "../src/i18n/languageConfig.js";
import { escapeRoomRuntimeLocales } from "../src/finalChallenge/escapeRoomRuntimeLocales.js";

const languages = ["en", "zh", "fr", "de"];
const runtimeNamespaces = [
  "common",
  "navigation",
  "missions",
  "escapeRoom",
  "mission1",
  "mission1Learning",
  "learningMode",
  "mission2",
  "mission3",
  "mission4",
  "mission5",
  "tokenLab",
  "numbersStage",
  "contextStage",
  "predictionStage",
  "compareStage"
];
const supportedLanguageOnlyNamespaces = ["guide"];

function leafPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" && !Array.isArray(child)
      ? leafPaths(child, path)
      : [path];
  });
}

async function readLocaleNamespace(language, namespace) {
  const source = await readFile(new URL(`../src/locales/${language}/${namespace}.json`, import.meta.url), "utf8");
  return JSON.parse(source);
}

const differences = [];

assert.deepEqual(SUPPORTED_LANGUAGES.map(({ code }) => code), ["en", "zh"], "Only English and Chinese are selectable at runtime.");
assert.equal(DEFAULT_LANGUAGE, "en");
assert.equal(normaliseLanguage("fr"), "en", "A previously persisted French locale falls back to English.");
assert.equal(normaliseLanguage("de-DE"), "en", "A previously persisted German locale falls back to English.");
assert.equal(normaliseLanguage("zh-CN"), "zh");

for (const namespace of runtimeNamespaces) {
  const english = await readLocaleNamespace("en", namespace);
  if (namespace === "escapeRoom") delete english.runtime;
  const englishKeys = new Set(leafPaths(english));

  for (const language of languages.slice(1)) {
    const locale = await readLocaleNamespace(language, namespace);
    if (namespace === "escapeRoom") delete locale.runtime;
    const localeKeys = new Set(leafPaths(locale));
    const missing = [...englishKeys].filter((key) => !localeKeys.has(key)).sort();
    const extra = [...localeKeys].filter((key) => !englishKeys.has(key)).sort();

    if (missing.length || extra.length) differences.push({ language, namespace, missing, extra });
  }
}

for (const namespace of supportedLanguageOnlyNamespaces) {
  const english = await readLocaleNamespace("en", namespace);
  const chinese = await readLocaleNamespace("zh", namespace);
  const englishKeys = new Set(leafPaths(english));
  const chineseKeys = new Set(leafPaths(chinese));
  const missing = [...englishKeys].filter((key) => !chineseKeys.has(key)).sort();
  const extra = [...chineseKeys].filter((key) => !englishKeys.has(key)).sort();
  if (missing.length || extra.length) differences.push({ language: "zh", namespace, missing, extra });
}

if (differences.length) {
  for (const { language, namespace, missing, extra } of differences) {
    process.stderr.write(`\n[i18n parity] ${language}/${namespace}\n`);
    process.stderr.write(`  missing (${missing.length}):${missing.length ? `\n    ${missing.join("\n    ")}` : " none"}\n`);
    process.stderr.write(`  extra (${extra.length}):${extra.length ? `\n    ${extra.join("\n    ")}` : " none"}\n`);
  }
}

assert.equal(differences.length, 0, "Runtime locale namespaces must match the English leaf-key structure.");

function stringLeaves(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(stringLeaves);
}

const chineseNamespaces = await Promise.all(runtimeNamespaces.map((namespace) => readLocaleNamespace("zh", namespace)));
const chineseVisibleText = [
  ...chineseNamespaces.flatMap(stringLeaves),
  ...stringLeaves(escapeRoomRuntimeLocales.zh)
].join("\n").replace(/\{\{\w+\}\}/g, "");
assert.doesNotMatch(chineseVisibleText, /\bTokens?\b/i, "Chinese educational UI must use 词元 instead of standalone Token/Tokens.");
assert.match(chineseVisibleText, /词元/);

process.stdout.write(`i18n parity passed for ${runtimeNamespaces.length} retained namespaces plus ${supportedLanguageOnlyNamespaces.length} EN/ZH-only namespace; runtime selection is en/zh only.\n`);
