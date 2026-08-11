import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Blocks, Info, RefreshCcw, ShieldCheck } from "lucide-react";
import MissionLessonShell, { parseLessonPage } from "./MissionLessonShell.jsx";
import TokenPieces from "./TokenPieces.jsx";
import { getMission1IntroFixture } from "./mission1Challenges.js";
import RobotGuideBubble from "../playfulLearning/RobotGuideBubble.jsx";
import MiniSceneIllustration from "../playfulLearning/MiniSceneIllustration.jsx";
import TokenBuildingBlock from "../playfulLearning/TokenBuildingBlock.jsx";
import Mission1PagedPlaygroundPage from "./Mission1PagedPlaygroundPage.jsx";
import { Mission1PagedSummaryPage } from "./Mission1PagedFinalPages.jsx";
import { Mission1PagedIdJourneyPage } from "./Mission1PagedIdJourneyPages.jsx";
import Mission1PagedKnowledgeQuiz from "./Mission1PagedKnowledgeQuiz.jsx";
import LessonPageHero from "../pagedMissions/LessonPageHero.jsx";
import { getLesson1JourneyCopy } from "./lesson1JourneyCopy.js";
import { completeMission1Progress } from "./mission1Progress.js";
import { writeProgress } from "../state/progress.js";
import { useI18n } from "../i18n/index.jsx";
import "./mission1Paged.css";

function PlayfulSceneBannerIntro({ t }) {
  const exampleBlocks = ["The", "uncharacteristically", "quiet", "reader", "smiled", "."];
  return <div className="playful-scene-banner mission-1-paged__intro-scene" data-tour-id="m1-intro-sentence">
    <div className="playful-scene-copy">
      <span className="playful-scene-badge"><Blocks size={17} strokeWidth={1.9} />{t("mission1.intro.buildingLabel")}</span>
      <div className="mission-1-paged__intro-grid">
        <section className="mission-1-paged__why-tokens" aria-labelledby="m1-why-tokens-title">
          <h3 id="m1-why-tokens-title">{t("mission1.intro.whyTitle")}</h3>
          <p>{t("mission1.intro.whyText")}</p>
          <p>{t("mission1.intro.whyBreaks")}</p>
          <div className="mission-1-paged__token-flow" aria-label={t("mission1.intro.flowLabel")}>
            <div><small>{t("mission1.intro.flowText")}</small><span>reading books</span></div>
            <ArrowDown aria-hidden="true" size={17} />
            <div><small>{t("mission1.intro.flowTokens")}</small><span className="mission-1-paged__mini-blocks"><b>reading</b><b>books</b></span></div>
          </div>
        </section>
        <section className="mission-1-paged__example-tokens" aria-labelledby="m1-example-sentence">
          <small>{t("mission1.intro.sentenceLabel")}</small>
          <strong id="m1-example-sentence">{t("mission1.intro.exampleSentence")}</strong>
          <div className="playful-block-row" aria-label={t("mission1.intro.metaphorLabel")}>{exampleBlocks.map((block, index) => <TokenBuildingBlock index={index} punctuation={block === "."} key={`${block}-${index}`}>{block}</TokenBuildingBlock>)}</div>
          <div className="mission-1-paged__tokenizer-compare">
            <div><span>{t("mission1.intro.compareText")}</span><strong>unbelievable</strong></div>
            <div><span>{t("mission1.intro.tokenizerA")}</span><span className="mission-1-paged__compare-pieces"><b>unbelievable</b></span></div>
            <div><span>{t("mission1.intro.tokenizerB")}</span><span className="mission-1-paged__compare-pieces"><b>un</b><b>belie</b><b>vable</b></span></div>
            <small>{t("mission1.intro.compareNote")}</small>
            <strong>{t("mission1.intro.differentNotWrong")}</strong>
          </div>
        </section>
      </div>
      <p className="playful-boundary-note"><span aria-hidden="true">i</span>{t("mission1.intro.metaphorNote")}</p>
    </div>
    <div className="playful-scene-art" aria-hidden="true">
      <span className="playful-art-orbit orbit-one" /><span className="playful-art-orbit orbit-two" />
      <img src="/assets/img/mission-robot-reading.png" alt="" />
      <span className="playful-floating-block block-one" /><span className="playful-floating-block block-two" />
    </div>
  </div>;
}

export const MISSION_1_PAGED_PAGES = Object.freeze([
  { id: "intro", sectionNumber: 1, titleKey: "mission1.sections.intro" },
  { id: "demo", sectionNumber: 2, titleKey: "mission1.sections.demo" },
  { id: "id-journey", sectionNumber: 3, titleKey: "mission1.sections.numbers" },
  { id: "playground", sectionNumber: 4, titleKey: "mission1.sections.playground" },
  { id: "knowledge-check", sectionNumber: 5, titleKey: "mission1.sections.quickCheck" },
  { id: "summary", sectionNumber: 6, titleKey: "mission1.paged.summaryTitle" }
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
  const [quizResult, setQuizResult] = useState("idle");
  const [playgroundComplete, setPlaygroundComplete] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [exploreIndex, setExploreIndex] = useState(0);
  const replaying = revealCount < introGroups.length;
  const page = MISSION_1_PAGED_PAGES[currentPage - 1];
  const journeyCopy = useMemo(() => getLesson1JourneyCopy(language), [language]);
  const pageQuizCopy = { ...journeyCopy, quizTitle: journeyCopy.conceptCheckpoint };
  const coreComplete = playgroundComplete && quizResult === "correct";
  const missionComplete = progress.missions[1]?.completed === true;
  const shellLabels = {
    backToMissions: t("mission2.shell.backToMissions"),
    missionCount: t("missions.missionOf", { mission: 1 }),
    tokenisation: t("mission1.paged.tokenisation"),
    pageCount: t("mission1.paged.pageCount", { current: currentPage, total: MISSION_1_PAGED_PAGES.length }),
    back: t("mission1.paged.back"),
    next: t("mission1.paged.next"),
    prototypeEndAction: t("missions.lessonSummary"),
    prototypeLabel: t("missions.missionLabel", { id: 1 }),
    navigationLabel: t("common.lesson.navigationLabel"),
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
    if (currentPage !== 6 || !coreComplete || missionComplete) return;
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
    setQuizResult("idle");
    setResetKey((value) => value + 1);
    changePage(1);
  }

  const pageSubtitle = currentPage === 1
    ? t("mission1.intro.body")
    : currentPage === 2
      ? t("mission1.demo.body")
      : currentPage === 3 ? journeyCopy.numbersIntro
        : currentPage === 4 ? t("mission1.liveTokenizerIntro")
          : currentPage === 5 ? journeyCopy.quizIntro
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

  return <MissionLessonShell currentPage={currentPage} pageCount={MISSION_1_PAGED_PAGES.length} onPageChange={changePage} onEnd={() => navigate("/mission/2-prediction-paged")} onBackToMissions={() => navigate("/missions")} title={t(page.titleKey)} subtitle={pageSubtitle} labels={{...shellLabels, prototypeEndAction: t("missions.nextLesson2")}} recommendation={recommendation} hideNext={currentPage === 5} skipAction={currentPage===5?{label:t("mission1.skipQuiz"),onClick:()=>changePage(6)}:null} rootClassName={`mission-1-paged mission-1 playful-learning-scope ${currentPage===5?"mission-2-paged mission-2-reading-context m2-reading-page-6 lesson-quiz-layout":""}`} pageHero={<LessonPageHero lessonIndex={1} lessonCount={5} lessonProgressLabel={t("common.lesson.progress",{current:1,total:5})} lessonName={t("mission1.paged.tokenisation")} title={t(page.titleKey)} subtitle={pageSubtitle} illustration="/assets/img/mission-robot-reading.png" illustrationAlt={t("mission1.paged.robotAlt")} headingId={`lesson-1-page-${currentPage}-title`}/> }>
    {currentPage === 1 ? <section id="m1-intro" className="course-section mission-1-paged__lesson" data-lesson-page="1">
      <div className="course-section-head"><h2><span>1</span>{t("mission1.intro.buildingLabel")}</h2></div>
      <p>{t("mission1.intro.body")}</p>
      <PlayfulSceneBannerIntro t={t} />
    </section> : currentPage === 2 ? <section id="m1-demo" className="course-section mission-1-paged__lesson" data-lesson-page="2">
      <div className="course-section-head"><h2><span>2</span>{t("mission1.demo.realPieces")}</h2><button type="button" className="outline tiny-top" aria-live="polite" onClick={replayExample}><RefreshCcw className={replaying ? "m1-spinner" : ""} size={16} strokeWidth={1.8} />{replaying || replayNotice ? t("mission1.demo.replaying") : t("mission1.demo.replay")}</button></div>
      <p>{t("mission1.demo.body")}</p>
      <div className="playful-real-token-lab" data-tour-id="m1-demo-result"><div className="playful-real-token-head"><span><ShieldCheck size={16} strokeWidth={2} />{t("mission1.demo.realPieces")}</span><small>{t("mission1.demo.verifiedCount")}</small></div><TokenPieces groups={introGroups.slice(0, revealCount)} visualVariant="verified" t={t} /><p className="m1-space-legend"><span>␠</span>{t("mission1.tokens.spaceLegend")}</p></div>
      <RobotGuideBubble label={t("mission1.demo.lookCloser")} title={t("mission1.demo.whyTitle")} illustration={<MiniSceneIllustration imageSrc="/assets/img/mission-robot-pointing.png" />}>
        <p>{t("mission1.demo.whyVocabulary")}</p><p>{t("mission1.demo.whyCommon")}</p>
        <div className={`playful-split-focus ${revealCount >= 4 && replaying ? "is-emphasised" : ""}`}><strong>uncharacteristically</strong><ArrowRight size={20} strokeWidth={1.8} /><span className="playful-split-pieces">{["un", "character", "istically"].map((piece, index) => <TokenBuildingBlock variant="verified" index={index} verifiedLabel={t("mission1.tokens.verifiedLabel")} key={piece}>{piece}</TokenBuildingBlock>)}</span></div>
      </RobotGuideBubble>
      <div className="playful-model-note"><span><Info size={17} strokeWidth={1.8} /></span><div><strong>{t("mission1.demo.model")}</strong><small>{t("mission1.demo.different")}</small></div></div>
    </section> : null}
    <Mission1PagedIdJourneyPage active={currentPage === 3} copy={journeyCopy} />
    <Mission1PagedPlaygroundPage active={currentPage === 4} language={language} t={t} exploreIndex={exploreIndex} resetKey={resetKey} onSuccessfulRun={() => setPlaygroundComplete(true)} />
    <Mission1PagedKnowledgeQuiz active={currentPage === 5} copy={pageQuizCopy} resetKey={resetKey} onResultChange={setQuizResult} onContinue={() => changePage(6)} />
    <Mission1PagedSummaryPage active={currentPage === 6} complete={missionComplete || (currentPage === 6 && coreComplete)} t={t} onTryAnother={() => { setExploreIndex((value) => value + 1); changePage(4); }} onRestart={restartMission} onMissions={() => navigate("/missions")} onNextMission={() => navigate("/mission/2-prediction-paged")} />
  </MissionLessonShell>;
}
