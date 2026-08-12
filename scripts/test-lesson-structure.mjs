import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PAGED_MISSIONS} from "../src/pagedMissions/missionCurriculumData.js";

const read=(path)=>readFile(new URL(path,import.meta.url),"utf8");
const [lesson1,lesson2,lesson3,lesson4,lesson5,pages2,pages3,pages4,pages5,css1,css2,css3,css4,css5,playground,numbers]=await Promise.all([
  read("../src/mission1/Mission1PagedPrototype.jsx"),
  read("../src/mission2/Mission2PagedPrototype.jsx"),
  read("../src/mission3/Lesson3Paged.jsx"),
  read("../src/mission4/Lesson4Paged.jsx"),
  read("../src/mission5/Lesson5Paged.jsx"),
  read("../src/mission2/Mission2ContextPages.jsx"),
  read("../src/mission3/Lesson3Pages.jsx"),
  read("../src/mission4/Lesson4TeachingPages.jsx"),
  read("../src/mission5/Lesson5Pages.jsx"),
  read("../src/mission1/mission1Paged.css"),
  read("../src/mission2/mission2Paged.css"),
  read("../src/mission3/lesson3Paged.css"),
  read("../src/mission4/lesson4Paged.css"),
  read("../src/mission5/lesson5Paged.css"),
  read("../src/mission1/QwenTokenizerPlayground.jsx"),
  read("../src/mission1/Mission1PagedFinalPages.jsx")
]);

function registryCount(source,name,itemPattern){
  const block=source.match(new RegExp(`export const ${name}[^]*?\\]\\);`))?.[0];
  assert.ok(block,`${name} registry exists`);
  return (block.match(itemPattern)||[]).length;
}

const counts={
  1:registryCount(lesson1,"MISSION_1_PAGED_PAGES",/\{ id:/g),
  2:registryCount(lesson2,"MISSION_2_PAGED_PAGES",/\{ id:/g),
  3:registryCount(lesson3,"LESSON_3_PAGES",/^\s*\["/gm),
  4:registryCount(lesson4,"LESSON_4_PAGES",/\["[^"]+","mission4\./g),
  5:registryCount(lesson5,"LESSON_5_PAGES",/^\s*\["/gm)
};
assert.deepEqual(counts,{1:6,2:7,3:7,4:6,5:8});
assert.equal(PAGED_MISSIONS[3].pages.length,counts[3]);
assert.equal(PAGED_MISSIONS[5].pages.length,counts[4]);
assert.equal(PAGED_MISSIONS[6].pages.length,counts[5]);

for(const [number,source] of [[1,lesson1],[2,lesson2]]){
  assert.match(source,/pageCount=\{(?:MISSION_[12]_PAGED_PAGES\.length|pageCount)\}/,`Lesson ${number} shell uses its registry count`);
}
for(const [number,source] of [[3,lesson3],[4,lesson4],[5,lesson5]]){
  assert.match(source,new RegExp(`const pageCount\\s*=\\s*${number===3?"LESSON_3_PAGES":number===4?"LESSON_4_PAGES":"LESSON_5_PAGES"}\\.length`));
  assert.match(source,/pageCount=\{pageCount\}/);
  assert.match(source,number===3?/total:progressPageCount/:/total:pageCount/);
  assert.match(source,/visited\.has\(pageCount\)/);
}
assert.doesNotMatch(lesson3,/pageCount=\{6\}|total:6|visited\.has\(6\)/);

for(const [number,source] of [[3,pages3],[4,pages4]]){
  assert.match(source,/useState\(true\)/,`Lesson ${number} Technical Word starts expanded`);
  assert.match(source,/aria-expanded=\{open\}/);
  assert.match(source,/aria-controls=\{(?:panelId|id)\}/);
}
assert.match(pages5,/l5-page-four-keyword[\s\S]*mission5\.page4\.term/,"Lesson 5 Page 4 uses its approved static Parameter keyword card");
assert.match(playground,/technicalOpen, setTechnicalOpen\] = useState\(true\)/,"Lesson 1 technical details start expanded");
assert.match(playground,/aria-controls="mission1-tokenizer-technical-details"/);
assert.doesNotMatch(numbers,/embeddingSecondary|technicalOpen/,"Lesson 1 keeps technical embedding terminology out of the core journey");
assert.match(pages2,/technicalOpen, setTechnicalOpen\] = useState\(true\)/,"Lesson 2 Technical Word starts expanded");
assert.match(pages2,/<details className="m2-context-keyword-card" open=\{technicalOpen\}/);
assert.match(pages2,/aria-expanded=\{technicalOpen\} aria-controls="mission2-context-window-definition"/);
assert.match(css1,/\.mission-lesson-paged\.mission-1-paged \.mission-lesson-paged__title\{display:none\}/);
assert.match(css2,/\.mission-lesson-paged\.mission-2-paged\.mission-2-reading-context \.mission-lesson-paged__title\{display:none\}/);
assert.match(css3,/\.lesson-3-paged \.mission-lesson-paged__title\{display:none\}/);
assert.match(css4,/\.lesson-4-paged \.mission-lesson-paged__title\{display:none\}/);
assert.match(css5,/\.lesson-5-paged \.mission-lesson-paged__title\{display:none\}/);

process.stdout.write(`Lesson structure audit passed: ${Object.values(counts).join(" / ")} pages.\n`);
