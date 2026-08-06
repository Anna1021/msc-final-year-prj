import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PAGED_MISSIONS } from "../src/pagedMissions/missionCurriculumData.js";

const shell = await readFile(new URL("../src/mission3/Lesson3Paged.jsx", import.meta.url), "utf8");
const pages = await readFile(new URL("../src/mission3/Lesson3Pages.jsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/mission3/lesson3Paged.css", import.meta.url), "utf8");
const app = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const course = await readFile(new URL("../src/data/courseData.js", import.meta.url), "utf8");

assert.equal(PAGED_MISSIONS[3].topic, "Finding Helpful Clues");
assert.equal(PAGED_MISSIONS[3].pages.length, 6);
assert.deepEqual(PAGED_MISSIONS[3].pages.map((page)=>page[0]), ["equal","task","combine","order","practice","summary"]);
assert.match(course, /Which words help a language model most\?[\s\S]*Finding Helpful Clues/);
assert.doesNotMatch(course, /id:\s*3[^\n]*(?:short:\s*"Mistakes"|skill:\s*"Uncertainty|desc:\s*"Explore prediction)/i, "Mistakes and verification are not official Lesson 3 content");
assert.match(app, /3-hallucination-paged"\) page = <Lesson3Paged/, "official route renders the new Lesson 3 component");

assert.match(shell, /LESSON_3_PAGES[\s\S]*equal[\s\S]*task[\s\S]*combine[\s\S]*order[\s\S]*practice[\s\S]*summary/);
for (let page=1;page<=6;page+=1) assert.match(shell,new RegExp(`Lesson3Page${page} active=\\{currentPage===${page}\\}`),`Page ${page} remains directly mounted`);
assert.match(shell, /history\.pushState/);
assert.match(shell, /addEventListener\("popstate"/);
assert.doesNotMatch(shell, /canAdvance=/, "Back and Next remain non-blocking");
assert.match(shell, /REQUIRED = \["task-focus","combined-clues","clue-practice"\]/);
assert.match(shell, /visited\.has\(6\)/, "direct summary access cannot complete the Lesson");

assert.match(pages, /DOG_TOKENS[\s\S]*DOG_ANSWER[\s\S]*TokenStrip/, "Page 1 exposes visible context tokens and useful-clue selection");
assert.match(pages, /task === "sleeping"[\s\S]*taskA[\s\S]*taskB/, "Page 2 changes clue focus for two tasks");
assert.match(pages, /COMBINED_CLUES[\s\S]*revealNext[\s\S]*revealAll/, "Page 3 supports several clues contributing together");
assert.match(pages, /The","dog","chased","cat[\s\S]*The","cat","chased","dog/, "Page 4 demonstrates order-dependent relationships");
assert.match(pages, /CLUE_EXAMPLES[\s\S]*checkClues[\s\S]*unlimited|CLUE_EXAMPLES[\s\S]*l3-check-clues/, "Page 5 includes a real clue-finding activity");
assert.match(pages, /l3-discovery-route[\s\S]*Prediction gate|l3-discovery-route[\s\S]*mission3\.page6\.next/, "Page 6 contains the discovery route and closed prediction gate");
assert.match(pages, /A real model learns numerical relationships|mission3\.page5\.boundary/, "reviewed examples are bounded from real model calculations");
assert.doesNotMatch(pages, /Qwen|attention weights|attention matrix|query\s*\/\s*key\s*\/\s*value/i, "no Qwen or fabricated attention values are claimed");
assert.doesNotMatch(pages, /fetch\(|axios|https?:\/\//, "Lesson 3 has no API calls or external image hotlinks");
assert.match(pages, /role="tab"[\s\S]*aria-selected/);
assert.match(pages, /aria-pressed/);
assert.match(pages, /aria-live="polite"/);
for (let number=1;number<=6;number+=1) assert.match(pages,new RegExp(`Question number="${number}"`),`Page ${number} uses the shared numbered learning block`);
assert.match(css, /^\.mission-lesson-paged\.lesson-3-paged/m, "CSS is scoped to Lesson 3");
assert.match(css, /Mission 1 visual parity/, "Lesson 3 keeps its Mission 1-aligned playful learning sheet");
assert.match(css, /max-width:760px/);
assert.match(css, /max-width:375px/);
assert.match(css, /overflow-x:hidden/);
assert.match(css, /prefers-reduced-motion:reduce/);

function leafPaths(value,prefix="") { return Object.entries(value).flatMap(([key,child])=>{const path=prefix?`${prefix}.${key}`:key;return child&&typeof child==="object"?leafPaths(child,path):[path];}); }
const locales=await Promise.all(["en","zh","fr","de"].map(async(language)=>JSON.parse(await readFile(new URL(`../src/locales/${language}/mission3.json`,import.meta.url),"utf8"))));
const expected=leafPaths(locales[0]).sort();
for(const [index,locale] of locales.entries()) assert.deepEqual(leafPaths(locale).sort(),expected,`${["en","zh","fr","de"][index]} Lesson 3 locale keys match`);

process.stdout.write("Lesson 3 Finding Helpful Clues tests passed.\n");
