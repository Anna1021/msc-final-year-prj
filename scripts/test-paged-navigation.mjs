import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const shell = await readFile(new URL("../src/mission1/MissionLessonShell.jsx", import.meta.url), "utf8");
const mission1Css = await readFile(new URL("../src/mission1/mission1Paged.css", import.meta.url), "utf8");
const mission2Css = await readFile(new URL("../src/mission2/mission2Paged.css", import.meta.url), "utf8");
const curriculumCss = await readFile(new URL("../src/pagedMissions/pagedCurriculum.css", import.meta.url), "utf8");

assert.match(shell, /<nav className="mission-lesson-paged__nav"/, "shared footer is always rendered by the shell");
assert.match(shell, /disabled=\{currentPage === 1\}[\s\S]*onPageChange\(currentPage - 1\)/, "Back targets the previous page and is disabled only on Page 1");
assert.match(shell, /disabled=\{currentPage === pageCount && !onEnd\}[\s\S]*onPageChange\(currentPage \+ 1\)/, "Next targets the following page and the final action remains available when an onward route exists");
assert.match(shell, /currentPage === pageCount \? onEnd\?\.\(\)/, "the final page delegates to its non-blocking onward action");
assert.match(shell, /currentPage === pageCount \? labels\.prototypeEndAction : labels\.next/, "final page has a distinct final-page label");
assert.doesNotMatch(shell, /canAdvance|activityComplete.*mission-lesson-paged__nav/, "activity state cannot remove or lock page navigation");

for (const [name, css] of [["Mission 1", mission1Css], ["Mission 2", mission2Css], ["Missions 3–5", curriculumCss]]) {
  assert.match(css, /mission-lesson-paged__nav\s*\{[^}]*position:fixed/, `${name} footer stays visible in the viewport`);
  assert.match(css, /mission-lesson-paged__(?:content|safe-area)[^}]*padding[^}]*var\(--paged-nav-height\)/, `${name} content reserves footer safe space`);
  assert.doesNotMatch(css, /mission-(?:1|2)-paged\s*\{[^}]*overflow(?:-y)?:auto|paged-curriculum-mission\s*\{[^}]*overflow(?:-y)?:auto/, `${name} does not create a second main scroll region`);
}

for (const width of [760, 520, 375]) {
  assert.match(mission1Css + mission2Css + curriculumCss, new RegExp(`max-width:${width}px`), `${width}px navigation breakpoint exists`);
}

process.stdout.write("Shared paged navigation tests passed.\n");
