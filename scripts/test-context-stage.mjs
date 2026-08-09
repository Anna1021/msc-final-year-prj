import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { composeContextResponse, contextScenarios, contextWordExamples } from "../src/tokenLab/context/contextLabData.js";

assert.equal(contextWordExamples.length, 8);
assert.deepEqual(contextWordExamples.map((example) => example.id), ["bank", "bat", "match", "light", "wave", "ring", "mouse", "spring"], "Reviewed word pool stays unchanged");
assert.ok(contextWordExamples.every((example) => example.senses.length === 2 && example.senses.every((sense) => sense.contextWords.length >= 2)));
assert.equal(contextScenarios.length, 2);
assert.ok(contextScenarios.every((scenario) => scenario.details.some((detail) => detail.category === "useful") && scenario.details.some((detail) => detail.category === "extra") && scenario.details.some((detail) => detail.category === "unrelated")));

function leafPaths(value, prefix = "") { return Object.entries(value).flatMap(([key, child]) => { const path = prefix ? `${prefix}.${key}` : key; return child && typeof child === "object" ? leafPaths(child, path) : [path]; }); }
const languages = ["en", "zh", "fr", "de"];
const locales = await Promise.all(languages.map(async (language) => JSON.parse(await readFile(new URL(`../src/locales/${language}/contextStage.json`, import.meta.url), "utf8"))));
const keys = leafPaths(locales[0]).sort();
locales.forEach((locale, index) => assert.deepEqual(leafPaths(locale).sort(), keys, `${languages[index]} Context keys`));

const page = await readFile(new URL("../src/tokenLab/context/ContextStagePage.jsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/tokenLab/context/contextStage.css", import.meta.url), "utf8");
const lab = await readFile(new URL("../src/tokenLab/TokenLabPage.jsx", import.meta.url), "utf8");
const session = await readFile(new URL("../src/tokenLab/aiLabSession.js", import.meta.url), "utf8");
const tours = await readFile(new URL("../src/tokenLab/stageSpotlightSteps.js", import.meta.url), "utf8");
assert.ok(lab.includes('{ id: "context", status: "available"'));
assert.ok(session.includes('"context"'));
for (const id of ["context-experiment-tabs", "context-target-word", "context-sentence-options", "context-highlight-words", "context-meaning-card", "context-meaning-takeaway", "context-builder", "context-vague-request", "context-detail-cards", "context-response-preview", "context-builder-discovery", "context-reset", "context-replay"]) assert.ok(page.includes(id), id);
assert.ok(page.includes('tourId="context-experiment-meaning"')&&page.includes('tourId="context-experiment-builder"'),"Experiment entrances expose stable Guide targets");
for (const behavior of ["toggle", "another", "play", "selected", "composeContextResponse"]) assert.ok(page.includes(behavior), behavior);
for (const forbidden of ["localStorage", "sessionStorage", "writeProgress", "saveLearningNote", "aiExplorerProgress", "fetch(", "XP", "Badge"]) assert.equal(page.includes(forbidden), false, `Context excludes ${forbidden}`);
assert.ok(css.includes("prefers-reduced-motion"));
assert.ok(page.includes("Playing") || page.includes("actions.playing"));
assert.ok(page.includes("context-response-compare"), "Before and After responses remain visible together");
assert.ok(page.includes("context-scene-card") && page.includes("SceneMotif"), "Meaning experiment uses two visual scenes");
assert.ok(page.includes("context-prompt-tray"), "Builder uses a visible prompt tray");
assert.ok(page.includes('role="tabpanel"') && page.includes('role="tab"') && page.includes("moveTab") && page.includes("tabIndex={active?0:-1}"), "Context experiment selectors preserve tabs and arrow-key navigation");
for (const category of ["useful", "extra", "unrelated"]) assert.ok(page.includes(`detail.category`) && locales[0].feedback[category], `${category} feedback remains available after selection`);
assert.ok(page.includes("timers.current.forEach(window.clearTimeout)"), "Replay cancels old timers before starting again");
assert.ok(page.includes('window.matchMedia?.("(prefers-reduced-motion: reduce)")'), "Replay resolves immediately under reduced motion");
for (const key of ["whyTitle", "whyBody", "notHuman", "promptTray", "emptyTray", "finalDiscovery"]) assert.ok(keys.some((path) => path.endsWith(key)), `Context includes ${key} in every language`);
assert.ok(locales[0].builder.demo.includes("not a live AI response"));
assert.ok(locales[0].safeguards.noGuarantee.includes("not simply more context"));
assert.ok(page.includes("setSenseIndex(null)") && page.includes("hiddenMeaning"), "Experiment A does not reveal a meaning before scene selection");
assert.ok(page.includes("step>=index+1") && page.includes("step>=3") && page.includes("step>=4"), "Scene selection progressively reveals reviewed clues, target and meaning");
assert.ok(page.includes("context-scene-card") && page.includes("quiet") && page.includes("context-investigation-board"), "Selected scene becomes prominent and feeds a visual investigation board");
assert.ok(page.includes("selectedDetails") && page.includes("context-prompt-tray"), "Selected details enter the visible Prompt Tray");
assert.match(page, /active&&<small className=\{detail\.category\}/, "Detail category stays hidden until the card is selected");
assert.ok(page.includes("context-cause-link") && page.includes("builder.effects"), "Selected details visibly connect to their reviewed response effect");
const echo=(key)=>key;
for(const scenario of contextScenarios){
  const unrelated=scenario.details.find(detail=>detail.category==="unrelated").id;
  assert.equal(composeContextResponse(echo,scenario,[unrelated]),composeContextResponse(echo,scenario,[]),`${scenario.id}: unrelated detail does not invent a main-answer change`);
  const useful=scenario.details.find(detail=>detail.category==="useful"&&scenario.rules.some(rule=>rule.requires.length===1&&rule.requires.includes(detail.id))).id;
  assert.notEqual(composeContextResponse(echo,scenario,[useful]),composeContextResponse(echo,scenario,[]),`${scenario.id}: existing useful rule changes the reviewed response`);
}
for(const locale of locales){
  assert.match(locale.meaning.notHuman,/not.*understand|不表示.*理解|ne signifie pas.*comprend|bedeutet nicht.*versteht/i,"Explanation rejects human-like understanding");
  assert.match(locale.meaning.notHuman,/not real attention|并不是真实 attention|pas de vrais poids d’attention|keine echten Aufmerksamkeitsgewichte/i,"Clue highlights are not presented as real attention weights");
  assert.match(locale.builder.finalDiscovery,/not automatically|不一定|pas toujours|nicht automatisch/i,"More context is not described as always better");
  assert.match(locale.safeguards.canStillFail,/incorrect|出错|incorrecte|falsch/i,"Clearer responses still carry an accuracy warning");
}
assert.equal((tours.match(/contextStage\.tour\.steps/g)||[]).length,20,"Context Guide covers ten causal steps across both experiments");
for(const action of ['id:"scene"','id:"builder"','id:"useful"','id:"unrelated"'])assert.match(tours,new RegExp(`${action}[\\s\\S]*?waitsForAction:true`),`Guide waits for ${action}`);
for(const target of ["context-experiment-tabs","context-sentence-options","context-highlight-words","context-meaning-card","context-vague-request","context-detail-cards","context-response-preview","context-builder-discovery"])assert.ok(page.includes(target)&&tours.includes(target),`Guide target exists: ${target}`);
assert.ok(tours.includes("context-experiment-builder")&&page.includes('tourId="context-experiment-builder"'),"Builder entrance Guide target exists");
assert.match(tours,/id:"unrelated"[\s\S]*?waitsForAction:true[\s\S]*?id:"discovery"[\s\S]*?finish:true/,"Guide cannot finish before meaningful Builder interactions");
assert.equal(/fetch\(|https?:\/\//.test(page),false,"Context adds no cloud model or API");
assert.equal(/\.context-(?:workspace|scene-options|prompt-builder|response-compare)[^{]*\{[^}]*(?:^|;)\s*height\s*:/s.test(css),false,"Responsive experiment containers have no fixed clipping height");
process.stdout.write("Context Stage tests passed.\n");
