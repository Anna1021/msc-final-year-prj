import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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

if (differences.length) {
  for (const { language, namespace, missing, extra } of differences) {
    process.stderr.write(`\n[i18n parity] ${language}/${namespace}\n`);
    process.stderr.write(`  missing (${missing.length}):${missing.length ? `\n    ${missing.join("\n    ")}` : " none"}\n`);
    process.stderr.write(`  extra (${extra.length}):${extra.length ? `\n    ${extra.join("\n    ")}` : " none"}\n`);
  }
}

assert.equal(differences.length, 0, "Runtime locale namespaces must match the English leaf-key structure.");
process.stdout.write(`i18n parity passed for ${runtimeNamespaces.length} runtime namespaces across ${languages.length} locales.\n`);
