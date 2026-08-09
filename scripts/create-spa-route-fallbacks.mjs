import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const sourceIndex = path.join(distDir, "index.html");

const routes = [
  "dashboard",
  "missions",
  "ai-lab",
  "token-lab",
  "progress",
  "activity",
  "about",
  "profile",
  "badges",
  "glossary",
  "mission/1-tokenisation",
  "mission/1-tokenisation-paged",
  "mission/2-prediction-paged",
  "mission/2-next-token",
  "mission/3-hallucination",
  "mission/3-hallucination-paged",
  "mission/4-context",
  "mission/5-training-data",
  "mission/4-training-data-paged",
  "mission/5/get-training-data",
  "mission/5/learn-patterns",
  "mission/5/make-predictions",
  "mission/6-bias",
  "mission/5-bias-paged",
  "final-challenge",
];

await stat(sourceIndex);

await Promise.all(
  routes.map(async (route) => {
    const targetDir = path.join(distDir, route);
    await mkdir(targetDir, { recursive: true });
    await copyFile(sourceIndex, path.join(targetDir, "index.html"));
  }),
);

console.log(`Created SPA route fallbacks for ${routes.length} routes.`);
