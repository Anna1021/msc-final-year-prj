import React, { useCallback, useEffect, useState } from "react";
import MissionLessonShell, { parseLessonPage } from "../mission1/MissionLessonShell.jsx";
import Mission1PagedKnowledgeQuiz from "../mission1/Mission1PagedKnowledgeQuiz.jsx";
import LessonPageHero from "../pagedMissions/LessonPageHero.jsx";
import { useI18n } from "../i18n/index.jsx";
import {
  Mission2GrowingTextPage,
  Mission2OpeningPage,
  Mission2OutsidePage,
  Mission2SizePage,
  Mission2SummaryPage,
  Mission2WindowPage
} from "./Mission2ContextPages.jsx";
import { writeProgress } from "../state/progress.js";
import { createMission2QuizCopy } from "./mission2QuizCopy.js";
import "./mission2Paged.css";

export const MISSION_2_PAGED_PAGES = Object.freeze([
  { id: "context-basics", titleKey: "mission2.page1.title", subtitleKey: "mission2.page1.subtitle" },
  { id: "window", titleKey: "mission2.page2.title", subtitleKey: "mission2.page2.subtitle" },
  { id: "moving-window", titleKey: "mission2.page3.title", subtitleKey: "mission2.page3.subtitle" },
  { id: "outside", titleKey: "mission2.page4.title", subtitleKey: "mission2.page4.subtitle" },
  { id: "window-size", titleKey: "mission2.page5.title", subtitleKey: "mission2.page5.subtitle" },
  { id: "checkpoint", titleKey: "mission2.page6.title", subtitleKey: "mission2.page6.subtitle" },
  { id: "summary", titleKey: "mission2.page7.title", subtitleKey: "mission2.page7.subtitle" }
]);

const HERO_ROBOTS = [
  "/assets/img/mission-robot-reading.png",
  "/assets/img/mission-robot-pointing.png",
  "/assets/img/mission-robot-reading.png",
  "/assets/img/mission-robot-pointing.png",
  "/assets/img/mission-robot-reading.png",
  "/assets/img/mission-robot-pointing.png",
  "/assets/img/mission-robot-pointing.png"
];

const REQUIRED_ACTIVITIES = ["move-window", "show-boundary", "grow-text", "visible-clue", "resize-window"];

export default function Mission2PagedPrototype({ setProgress, navigate, notify }) {
  const { language, t } = useI18n();
  const initialPage = parseLessonPage(window.location.search, MISSION_2_PAGED_PAGES.length);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [visitedPages, setVisitedPages] = useState(() => new Set([initialPage]));
  const [continuedPages, setContinuedPages] = useState(() => new Set());
  const [activities, setActivities] = useState(() => new Set());
  const [quizResult, setQuizResult] = useState("idle");
  const page = MISSION_2_PAGED_PAGES[currentPage - 1];
  const quizCopy = createMission2QuizCopy(t);
  const pageQuizCopy = { ...quizCopy, quizTitle: quizCopy.conceptCheckpoint };
  const heroSubtitle = currentPage === 2 ? t("mission2.page2.introLead") : t(page.subtitleKey);

  useEffect(() => {
    const onPopState = () => {
      const nextPage = parseLessonPage(window.location.search, MISSION_2_PAGED_PAGES.length);
      setCurrentPage(nextPage);
      setVisitedPages((current) => new Set(current).add(nextPage));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function changePage(nextPage) {
    const safePage = nextPage >= 1 && nextPage <= MISSION_2_PAGED_PAGES.length ? nextPage : 1;
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(safePage));
    window.history.pushState({}, "", `${url.pathname}${url.search}`);
    setCurrentPage(safePage);
    setVisitedPages((current) => new Set(current).add(safePage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const mark = useCallback((key) => setActivities((current) => new Set(current).add(key)), []);
  const recommendedPage = MISSION_2_PAGED_PAGES.findIndex((_, index) => !visitedPages.has(index + 1)) + 1;
  const recommendation = {
    visible: recommendedPage > 0 && currentPage > recommendedPage && !continuedPages.has(currentPage),
    message: t("learningMode.notice"),
    goLabel: t("learningMode.goRecommended"),
    continueLabel: t("learningMode.continueHere"),
    onGoRecommended: () => changePage(recommendedPage),
    onContinue: () => setContinuedPages((current) => new Set(current).add(currentPage))
  };
  const labels = {
    backToMissions: t("mission2.shell.backToMissions"),
    missionCount: t("mission2.shell.lessonCount"),
    topicLabel: t("mission2.shell.topic"),
    pageCount: t("mission2.shell.pageCount", { current: currentPage, total: MISSION_2_PAGED_PAGES.length }),
    back: t("mission2.shell.back"),
    next: t("mission2.shell.next"),
    prototypeEndAction: t("mission2.shell.endAction"),
    prototypeLabel: t("mission2.shell.topic"),
    navigationLabel: t("common.lesson.navigationLabel"),
    robotAlt: t("mission2.shell.robotAlt")
  };
  const complete = REQUIRED_ACTIVITIES.every((key) => activities.has(key)) && quizResult === "correct" && visitedPages.has(7);

  function continueToNextLesson() {
    if (complete) {
      setProgress((previous) => {
        const next = structuredClone(previous);
        next.missions[2] = { progress: 100, completed: true };
        writeProgress(next);
        return next;
      });
      notify?.(t("mission2.actions.completedNotice"));
    }
    navigate("/mission/3-hallucination-paged");
  }

  return <MissionLessonShell
    currentPage={currentPage}
    pageCount={MISSION_2_PAGED_PAGES.length}
    onPageChange={changePage}
    onEnd={continueToNextLesson}
    onBackToMissions={() => navigate("/missions")}
    title={t(page.titleKey)}
    subtitle={t(page.subtitleKey)}
    labels={{ ...labels, prototypeEndAction: t("mission2.shell.nextLesson") }}
    recommendation={recommendation}
    hideNext={currentPage === 6}
    skipAction={currentPage === 6 ? { label: t("mission2.skipQuiz"), onClick: () => changePage(7) } : null}
    rootClassName={`mission-2-paged mission-2-reading-context mission-2-open-hero m2-reading-page-${currentPage} m2-hero-page-${currentPage} paged-mission-playful playful-learning-scope ${currentPage === 6 ? "lesson-quiz-layout" : ""}`}
    robotImage={HERO_ROBOTS[currentPage - 1]}
    pageHero={<LessonPageHero
      lessonIndex={2}
      lessonCount={5}
      lessonProgressLabel={t("common.lesson.progress", { current: 2, total: 5 })}
      lessonName={t("mission2.shell.topic")}
      title={t(page.titleKey)}
      subtitle={heroSubtitle}
      illustration={HERO_ROBOTS[currentPage - 1]}
      illustrationAlt={t("mission2.shell.robotAlt")}
      headingId={`lesson-2-page-${currentPage}-title`}
    />}
  >
    <Mission2OpeningPage active={currentPage === 1} language={language} t={t} onComplete={() => mark("move-window")} />
    <Mission2WindowPage active={currentPage === 2} t={t} onComplete={() => mark("show-boundary")} />
    <Mission2GrowingTextPage active={currentPage === 3} t={t} onComplete={() => mark("grow-text")} />
    <Mission2OutsidePage active={currentPage === 4} t={t} onComplete={() => mark("visible-clue")} />
    <Mission2SizePage active={currentPage === 5} t={t} onComplete={() => mark("resize-window")} />
    <Mission1PagedKnowledgeQuiz active={currentPage === 6} copy={pageQuizCopy} resetKey={0} onResultChange={setQuizResult} onContinue={() => changePage(7)} pageNumber={6} lessonClassName="mission-2-paged__lesson" showLesson1Visuals={false} guideTarget="lesson-quiz" />
    <Mission2SummaryPage active={currentPage === 7} t={t} complete={complete} onContinue={continueToNextLesson} />
  </MissionLessonShell>;
}
