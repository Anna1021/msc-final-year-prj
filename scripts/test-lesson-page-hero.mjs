import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const temporaryDirectory = await mkdtemp(join(tmpdir(), "lesson-page-hero-"));

try {
  const result = await build({
    entryPoints: [new URL("../src/pagedMissions/LessonPageHero.jsx", import.meta.url).pathname],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    plugins: [{
      name: "ignore-component-css",
      setup(buildContext) {
        buildContext.onResolve({ filter: /lessonPageHero\.css$/ }, () => ({ path: "lessonPageHero.css", namespace: "empty-css" }));
        buildContext.onLoad({ filter: /.*/, namespace: "empty-css" }, () => ({ contents: "", loader: "js" }));
      }
    }]
  });
  const compiledPath = join(temporaryDirectory, "LessonPageHero.mjs");
  await writeFile(compiledPath, result.outputFiles[0].contents);
  const { default: LessonPageHero } = await import(pathToFileURL(compiledPath));
  const cases = [
    { title: "Check the idea", lessonName: "Reading Context", progress: "Lesson 1 of 5" },
    { title: "Learning patterns, not storing one answer", lessonName: "Learning the Patterns", progress: "Leçon 2 sur 5" },
    { title: "模式开始影响预测", lessonName: "连接 Tokens", progress: "第 3 课 / 共 5 课" }
  ];

  for (const [index, item] of cases.entries()) {
    const html = renderToStaticMarkup(React.createElement(LessonPageHero, {
      lessonIndex: index + 1,
      lessonCount: 5,
      lessonProgressLabel: item.progress,
      lessonName: item.lessonName,
      title: item.title,
      subtitle: "A short explanatory subtitle that may wrap onto a second line.",
      illustration: index === 0 ? "/assets/img/mission-robot-reading.png" : null
    }));
    assert.equal((html.match(/<h1/g) || []).length, 1, "each Page Hero renders exactly one H1");
    assert.match(html, new RegExp(item.title));
    assert.match(html, new RegExp(item.progress));
    assert.match(html, /lesson-page-hero__subtitle/);
    assert.match(html, /lesson-page-hero__accent/);
  }

  const css = await readFile(new URL("../src/pagedMissions/lessonPageHero.css", import.meta.url), "utf8");
  assert.match(css, /--lesson-hero-eyebrow:\s*#347bc7/);
  assert.match(css, /--lesson-hero-title:\s*#17182f/);
  assert.match(css, /--lesson-hero-border:\s*#c8bcf4/);
  assert.match(css, /linear-gradient\(90deg,\s*var\(--lesson-hero-accent-start\)[\s\S]*var\(--lesson-hero-accent-mid\)[\s\S]*var\(--lesson-hero-accent-end\)/);
  assert.match(css, /width:\s*fit-content;[\s\S]*max-width:\s*100%/);
  assert.match(css, /@media \(max-width:\s*520px\)[\s\S]*white-space:\s*normal;[\s\S]*overflow-wrap:\s*anywhere/);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

process.stdout.write("Shared Lesson Page Hero tests passed.\n");
