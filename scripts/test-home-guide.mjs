import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";
import { HOME_GUIDE_FLOW, readGuideLocation, resolveGuideFlow } from "../src/guide/guideFlows.js";
import { createGuideState, guideReducer, shouldAutoStartGuide } from "../src/guide/guideState.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [mainSource, languageSelectorSource, providerSource, experienceSource, panelSource, enSource, zhSource] = await Promise.all([
  read("../src/main.jsx"),
  read("../src/components/LanguageSelector.jsx"),
  read("../src/guide/GuideProvider.jsx"),
  read("../src/guide/GuideExperience.jsx"),
  read("../src/guide/GuidePanel.jsx"),
  read("../src/locales/en/guide.json"),
  read("../src/locales/zh/guide.json")
]);

await Promise.all([
  [mainSource, "src/main.jsx"],
  [languageSelectorSource, "src/components/LanguageSelector.jsx"],
  [providerSource, "src/guide/GuideProvider.jsx"],
  [experienceSource, "src/guide/GuideExperience.jsx"],
  [panelSource, "src/guide/GuidePanel.jsx"]
].map(([source, filename]) => transformWithEsbuild(source, filename, { loader: "jsx", jsx: "automatic" })));

const homeLocation = readGuideLocation({ pathname: "/dashboard", search: "" });
assert.equal(resolveGuideFlow({ home: HOME_GUIDE_FLOW, lessons: {} }, homeLocation), HOME_GUIDE_FLOW);
assert.equal(HOME_GUIDE_FLOW.autoStart, true);
assert.equal(HOME_GUIDE_FLOW.steps.filter((step) => !step.handoffOnly).length, 5, "Homepage has five primary onboarding steps");
assert.equal(HOME_GUIDE_FLOW.steps.at(-1).handoffOnly, true, "advisory explanation is a conditional handoff step");

const unseen = createGuideState();
assert.equal(shouldAutoStartGuide(HOME_GUIDE_FLOW, unseen), true, "first eligible Homepage visit auto-starts");
const seen = guideReducer(unseen, { type: "open", flowId: HOME_GUIDE_FLOW.id });
assert.equal(shouldAutoStartGuide(HOME_GUIDE_FLOW, seen), false, "an opened guide does not auto-start repeatedly");
const collapsed = guideReducer(seen, { type: "collapse" });
assert.equal(collapsed.activeFlowId, HOME_GUIDE_FLOW.id, "Close preserves the Homepage flow for assistant reopening");
const reopened = guideReducer(collapsed, { type: "open", flowId: HOME_GUIDE_FLOW.id });
assert.equal(reopened.expanded, true, "assistant reopening restarts the Homepage guide");
assert.equal(reopened.stepIndex, 0);
const skipped = guideReducer(reopened, { type: "skip" });
assert.ok(skipped.completedFlowIds.includes(HOME_GUIDE_FLOW.id), "Skip persists completion of the Homepage guide");
assert.equal(shouldAutoStartGuide(HOME_GUIDE_FLOW, skipped), false);
assert.match(providerSource, /shouldAutoStartGuide\(autoFlow, state\)/);
assert.match(experienceSource, /guide\.expanded \? guide\.collapseGuide : \(\) => guide\.openGuide\(\)/, "floating assistant reopens the current Homepage guide");

for (const target of ["home-hero", "home-lessons", "home-final-challenge", "home-final-advisory"]) {
  assert.match(mainSource, new RegExp(`data-guide-target=[{\"]+${target}`), `${target} resolves on the real Homepage UI`);
}
assert.match(mainSource, /<LanguageSelector compact guideTarget=\{route === "\/dashboard" \? "home-language-selector" : null\}/);
assert.match(languageSelectorSource, /data-guide-target=\{guideTarget \|\| undefined\}/);
assert.match(languageSelectorSource, /className="language-button"[\s\S]*onClick=\{\(\) => setOpen/, "the real language selector remains clickable");
assert.match(mainSource, /data-guide-target=\{route === "\/dashboard" \? "home-profile" : undefined\}[\s\S]*onClick=\{\(\) => setOpen\(!open\)\}/, "the real profile control remains clickable");
assert.match(mainSource, /data-guide-target="home-final-challenge" onClick=\{\(\) => navigate\("\/final-challenge"\)\}/, "the guide targets the real Final Challenge button");

const en = JSON.parse(enSource);
const zh = JSON.parse(zhSource);
assert.deepEqual(Object.keys(en.home), Object.keys(zh.home), "Homepage guide has EN/ZH key parity");
assert.equal(en.home.titles.welcome, "Hi, I'm Q!");
assert.equal(zh.home.titles.welcome, "嗨，我是小Q！");
assert.match(en.home.welcome, /guide robot for LLM Explorer/);
assert.match(en.home.welcome, /not the language model/);
assert.doesNotMatch(JSON.stringify(en), /Xiao Q/i);
assert.deepEqual(
  HOME_GUIDE_FLOW.steps.map((step) => step.titleKey),
  ["guide.home.titles.welcome", "guide.home.titles.lessons", "guide.home.titles.language", "guide.home.titles.profile", "guide.home.titles.finalChallenge", "guide.home.titles.finalAdvisory"],
  "every Homepage step provides its own translated title key"
);
assert.match(panelSource, /const \{ t \} = useI18n\(\)/);
assert.match(panelSource, /t\(step\.titleKey\)/, "the current step title is translated during render");
assert.match(panelSource, /t\(step\.bodyKey\)/, "guide text is translated at render time without restarting its state");

for (const stepId of ["language", "profile", "final-challenge", "final-advisory"]) {
  assert.equal(HOME_GUIDE_FLOW.steps.find((step) => step.id === stepId)?.interactive, true, `${stepId} leaves the real target interactive`);
}
assert.match(mainSource, /completedCount\(progress\) < missionData\.length[\s\S]*setShowFinalChallengeAdvisory\(true\)/, "existing incomplete-lesson advisory check is retained");
assert.match(mainSource, /showFinalChallengeAdvisory[\s\S]*guide\.currentStep\?\.id === "final-challenge"\) guide\.goToStep\("final-advisory"\)/, "the guide advances only when the existing advisory is visible");
assert.match(mainSource, /resolvedRoute === "\/final-challenge" && guide\.activeFlowId === "home\.onboarding"\) guide\.finishGuide\(\)/, "direct Final Challenge navigation ends the Homepage guide cleanly");
assert.match(mainSource, /<GuideProvider>[\s\S]*<App \/>[\s\S]*<\/GuideProvider>/, "GuideProvider is mounted around the shared application");
assert.match(mainSource, /<GuideExperience \/>/);

process.stdout.write("Homepage guide integration regression tests passed.\n");
