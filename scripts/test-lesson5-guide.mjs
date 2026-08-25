import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";
import {
  LESSON_5_BRIDGE_GUIDE_FLOW,
  LESSON_5_CHANGE_GUIDE_FLOW,
  LESSON_5_QUIZ_GUIDE_FLOW,
  LESSON_5_TOY_MODEL_GUIDE_FLOW,
  guideFlows, readGuideLocation, resolveGuideForPage
} from "../src/guide/guideFlows.js";

const read=(path)=>readFile(new URL(path,import.meta.url),"utf8");
const [pages,paged,enText,zhText]=await Promise.all([
  read("../src/mission5/Lesson5Pages.jsx"),read("../src/mission5/Lesson5Paged.jsx"),
  read("../src/locales/en/guide.json"),read("../src/locales/zh/guide.json")
]);
await transformWithEsbuild(pages,"src/mission5/Lesson5Pages.jsx",{loader:"jsx",jsx:"automatic"});
await transformWithEsbuild(paged,"src/mission5/Lesson5Paged.jsx",{loader:"jsx",jsx:"automatic"});
const at=(page,trigger="manual")=>resolveGuideForPage({flows:guideFlows,location:readGuideLocation({pathname:"/mission/5-bias-paged",search:`?page=${page}`}),trigger});
assert.equal(at(5),LESSON_5_TOY_MODEL_GUIDE_FLOW);
assert.equal(at(5,"auto"),LESSON_5_TOY_MODEL_GUIDE_FLOW);
assert.equal(at(6),LESSON_5_BRIDGE_GUIDE_FLOW);
assert.equal(at(7),LESSON_5_QUIZ_GUIDE_FLOW);
assert.equal(at(7,"auto"),null);
assert.deepEqual(LESSON_5_TOY_MODEL_GUIDE_FLOW.steps.map(step=>step.targetId),[
  "lesson5-toy-training-examples","lesson5-toy-add-example","lesson5-toy-test-sentence","lesson5-toy-prediction"
]);
for(const target of ["lesson5-training-before-use","lesson5-patterns","lesson5-repeated-examples","lesson5-parameters","lesson5-response-loop","lesson5-toy-change"]){
  assert.match(pages,new RegExp(target));
}
assert.match(pages,/guide\.openGuide\(LESSON_5_CHANGE_GUIDE_FLOW\.id\)/);
assert.match(paged,/guideTarget="lesson-quiz"/);
assert.equal(LESSON_5_CHANGE_GUIDE_FLOW.autoStart,false);
const en=JSON.parse(enText),zh=JSON.parse(zhText);
const flatten=(value,prefix="")=>Object.entries(value).flatMap(([key,child])=>child&&typeof child==="object"?flatten(child,prefix?`${prefix}.${key}`:key):[prefix?`${prefix}.${key}`:key]).sort();
assert.deepEqual(flatten(en),flatten(zh));
assert.match(en.lesson5.toyModel.examples.body,/simplified simulation/i);
assert.match(zh.lesson5.toyModel.examples.body,/简化模拟/);
process.stdout.write("Lesson 5 Guide regression tests passed.\n");
