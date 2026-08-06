import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Info, RefreshCcw, ShieldCheck } from "lucide-react";
import MissionLessonShell, { parseLessonPage } from "./MissionLessonShell.jsx";
import TokenPieces from "./TokenPieces.jsx";
import { getMission1IntroFixture } from "./mission1Challenges.js";
import PlayfulSceneBanner from "../playfulLearning/PlayfulSceneBanner.jsx";
import RobotGuideBubble from "../playfulLearning/RobotGuideBubble.jsx";
import MiniSceneIllustration from "../playfulLearning/MiniSceneIllustration.jsx";
import TokenBuildingBlock from "../playfulLearning/TokenBuildingBlock.jsx";
import Mission1PagedPlaygroundPage from "./Mission1PagedPlaygroundPage.jsx";
import { Mission1PagedConceptCheckPage, Mission1PagedRebuildPage } from "./Mission1PagedQuickCheckPages.jsx";
import { Mission1PagedNumbersPage, Mission1PagedSummaryPage } from "./Mission1PagedFinalPages.jsx";
import { completeMission1Progress } from "./mission1Progress.js";
import { writeProgress } from "../state/progress.js";
import { useI18n } from "../i18n/index.jsx";
import "./mission1Paged.css";

export const MISSION_1_PAGED_PAGES = Object.freeze([
  { id: "intro", sectionNumber: 1, titleKey: "mission1.sections.intro" },
  { id: "demo", sectionNumber: 2, titleKey: "mission1.sections.demo" },
  { id: "playground", sectionNumber: 3, titleKey: "mission1.sections.playground" },
  { id: "concept-check", sectionNumber: 4, titleKey: "mission1.paged.checkIdea" },
  { id: "rebuild", sectionNumber: 5, titleKey: "mission1.paged.rebuildTokens" },
  { id: "numbers", sectionNumber: 6, titleKey: "mission1.paged.numbersTitle" },
  { id: "summary", sectionNumber: 7, titleKey: "mission1.paged.summaryTitle" }
]);

export default function Mission1PagedPrototype({ progress, setProgress, navigate, notify }) {
  const { language, t } = useI18n();
  const introFixture = useMemo(getMission1IntroFixture, []);
  const introGroups = useMemo(() => introFixture.rawPieces.map((rawPiece, index) => ({ startIndex: index, tokenCount: 1, ids: [introFixture.ids[index]], rawPieces: [rawPiece], decodedPiece: introFixture.decodedPieces[index] })), [introFixture]);
  const [currentPage, setCurrentPage] = useState(() => parseLessonPage(window.location.search, MISSION_1_PAGED_PAGES.length));
  const [visitedPages, setVisitedPages] = useState(() => new Set([parseLessonPage(window.location.search, MISSION_1_PAGED_PAGES.length)]));
  const [continuedPages, setContinuedPages] = useState(() => new Set());
  const [revealCount, setRevealCount] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [replayNotice, setReplayNotice] = useState(false);
  const [conceptResult, setConceptResult] = useState("idle");
  const [rebuildResult, setRebuildResult] = useState("idle");
  const [playgroundComplete, setPlaygroundComplete] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [exploreIndex, setExploreIndex] = useState(0);
  const replaying = revealCount < introGroups.length;
  const page = MISSION_1_PAGED_PAGES[currentPage - 1];
  const coreComplete = playgroundComplete && conceptResult === "correct" && rebuildResult === "correct";
  const missionComplete = progress.missions[1]?.completed === true;
  const shellLabels = {
    backToMissions: t("mission1.paged.backToMissions"),
    missionCount: t("mission1.paged.missionCount"),
    tokenisation: t("mission1.paged.tokenisation"),
    pageCount: t("mission1.paged.pageCount", { current: currentPage, total: MISSION_1_PAGED_PAGES.length }),
    back: t("mission1.paged.back"),
    next: t("mission1.paged.next"),
    prototypeEndAction: t("mission1.paged.prototypeEndAction"),
    prototypeLabel: t("mission1.paged.prototypeLabel"),
    robotAlt: t("mission1.paged.robotAlt")
  };

  useEffect(() => {
    const onPopState = () => {
      const nextPage = parseLessonPage(window.location.search, MISSION_1_PAGED_PAGES.length);
      setCurrentPage(nextPage);
      setVisitedPages((current) => new Set(current).add(nextPage));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) { setRevealCount(introGroups.length); return undefined; }
    setRevealCount(0);
    const timer = window.setInterval(() => setRevealCount((count) => {
      if (count >= introGroups.length) { window.clearInterval(timer); return count; }
      return count + 1;
    }), 220);
    return () => window.clearInterval(timer);
  }, [animationKey, introGroups.length]);

  useEffect(() => {
    if (!animationKey) return undefined;
    const timer = window.setTimeout(() => setReplayNotice(false), 900);
    return () => window.clearTimeout(timer);
  }, [animationKey]);

  useEffect(() => {
    if (currentPage !== 7 || !coreComplete || missionComplete) return;
    setProgress((previous) => {
      const next = completeMission1Progress(previous);
      writeProgress(next);
      return next;
    });
    notify?.(t("mission1.paged.summaryComplete"));
  }, [coreComplete, currentPage, missionComplete, notify, setProgress, t]);

  function changePage(nextPage) {
    const safePage = nextPage >= 1 && nextPage <= MISSION_1_PAGED_PAGES.length ? nextPage : 1;
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(safePage));
    window.history.pushState({}, "", `${url.pathname}${url.search}`);
    setCurrentPage(safePage);
    setVisitedPages((current) => new Set(current).add(safePage));
  }

  function replayExample() {
    setReplayNotice(true);
    setAnimationKey((value) => value + 1);
  }

  function restartMission() {
    setPlaygroundComplete(false);
    setConceptResult("idle");
    setRebuildResult("idle");
    setResetKey((value) => value + 1);
    changePage(1);
  }

  const pageSubtitle = currentPage === 1
    ? t("mission1.intro.body")
    : currentPage === 2
      ? t("mission1.demo.body")
      : currentPage === 3
        ? t("mission1.playground.intro")
        : currentPage === 4
          ? t("mission1.paged.conceptInstruction")
          : currentPage === 5
            ? t("mission1.checkB.instructions")
            : currentPage === 6
              ? t("mission1.paged.numbersIntro")
              : t("mission1.paged.summaryDiscovery");

  const recommendedPage = MISSION_1_PAGED_PAGES.findIndex((_, index) => !visitedPages.has(index + 1)) + 1;
  const showRecommendation = recommendedPage > 0 && currentPage > recommendedPage && !continuedPages.has(currentPage);
  const recommendation = {
    visible: showRecommendation,
    message: t("learningMode.notice"),
    goLabel: t("learningMode.goRecommended"),
    continueLabel: t("learningMode.continueHere"),
    onGoRecommended: () => changePage(recommendedPage),
    onContinue: () => setContinuedPages((current) => new Set(current).add(currentPage))
  };

  return <MissionLessonShell currentPage={currentPage} pageCount={MISSION_1_PAGED_PAGES.length} onPageChange={changePage} onBackToMissions={() => navigate("/missions")} title={t(page.titleKey)} subtitle={pageSubtitle} labels={shellLabels} recommendation={recommendation}>
    {currentPage === 1 ? <section id="m1-intro" className="course-section mission-1-paged__lesson" data-lesson-page="1">
      <div className="course-section-head"><h2><span>1</span>{t("mission1.sections.intro")}</h2></div>
      <p>{t("mission1.intro.body")}</p>
      <PlayfulSceneBanner badge={t("mission1.intro.buildingLabel")} sentenceLabel={t("mission1.intro.sentenceLabel")} sentence={introFixture.text} blocks={["The", "uncharacteristically", "quiet", "robot", "smiled", "."]} metaphorLabel={t("mission1.intro.metaphorLabel")} note={t("mission1.intro.metaphorNote")} imageSrc="/assets/img/mission-robot-reading.png" />
    </section> : currentPage === 2 ? <section id="m1-demo" className="course-section mission-1-paged__lesson" data-lesson-page="2">
      <div className="course-section-head"><h2><span>2</span>{t("mission1.sections.demo")}</h2><button type="button" className="outline tiny-top" aria-live="polite" onClick={replayExample}><RefreshCcw className={replaying ? "m1-spinner" : ""} size={16} strokeWidth={1.8} />{replaying || replayNotice ? t("mission1.demo.replaying") : t("mission1.demo.replay")}</button></div>
      <p>{t("mission1.demo.body")}</p>
      <div className="playful-real-token-lab" data-tour-id="m1-demo-result"><div className="playful-real-token-head"><span><ShieldCheck size={16} strokeWidth={2} />{t("mission1.demo.realPieces")}</span><small>{t("mission1.demo.verifiedCount")}</small></div><TokenPieces groups={introGroups.slice(0, revealCount)} visualVariant="verified" t={t} /><p className="m1-space-legend"><span>␠</span>{t("mission1.tokens.spaceLegend")}</p></div>
      <RobotGuideBubble label={t("mission1.demo.lookCloser")} title={t("mission1.demo.whyTitle")} illustration={<MiniSceneIllustration imageSrc="/assets/img/mission-robot-pointing.png" />}>
        <p>{t("mission1.demo.whyVocabulary")}</p><p>{t("mission1.demo.whyCommon")}</p>
        <div className={`playful-split-focus ${revealCount >= 4 && replaying ? "is-emphasised" : ""}`}><strong>uncharacteristically</strong><ArrowRight size={20} strokeWidth={1.8} /><span className="playful-split-pieces">{["un", "character", "istically"].map((piece, index) => <TokenBuildingBlock variant="verified" index={index} verifiedLabel={t("mission1.tokens.verifiedLabel")} key={piece}>{piece}</TokenBuildingBlock>)}</span></div>
      </RobotGuideBubble>
      <div className="playful-model-note"><span><Info size={17} strokeWidth={1.8} /></span><div><strong>{t("mission1.demo.model")}</strong><small>{t("mission1.demo.different")}</small></div></div>
    </section> : null}
    <Mission1PagedPlaygroundPage active={currentPage === 3} language={language} t={t} exploreIndex={exploreIndex} resetKey={resetKey} onSuccessfulRun={() => setPlaygroundComplete(true)} />
    <Mission1PagedConceptCheckPage active={currentPage === 4} t={t} resetKey={resetKey} onResultChange={setConceptResult} />
    <Mission1PagedRebuildPage active={currentPage === 5} language={language} t={t} resetKey={resetKey} result={rebuildResult} onResultChange={setRebuildResult} />
    <Mission1PagedNumbersPage active={currentPage === 6} t={t} />
    <Mission1PagedSummaryPage active={currentPage === 7} complete={missionComplete || (currentPage === 7 && coreComplete)} t={t} onTryAnother={() => { setExploreIndex((value) => value + 1); changePage(3); }} onRestart={restartMission} onMissions={() => navigate("/missions")} onNextMission={() => navigate("/mission/2-prediction-paged")} />
  </MissionLessonShell>;
}
