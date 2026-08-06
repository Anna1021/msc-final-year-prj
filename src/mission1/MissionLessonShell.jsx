import React, { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function parseLessonPage(search, pageCount) {
  const rawPage = new URLSearchParams(search).get("page");
  const page = Number(rawPage);
  return Number.isInteger(page) && page >= 1 && page <= pageCount ? page : 1;
}

export default function MissionLessonShell({ currentPage, pageCount, onPageChange, onBackToMissions, title, subtitle, labels, recommendation = null, rootClassName = "mission-1-paged mission-1 playful-learning-scope", robotImage = "/assets/img/mission-robot-reading.png", children }) {
  const headingRef = useRef(null);

  useEffect(() => {
    document.querySelector(".mission-lesson-paged")?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
    headingRef.current?.focus({ preventScroll: true });
  }, [currentPage]);

  const pageLabel = labels.pageCount;

  return <div className={`mission-lesson-paged ${rootClassName}`}>
    <header className="mission-lesson-paged__header">
      <button type="button" className="mission-lesson-paged__back-to-missions" onClick={onBackToMissions}><ArrowLeft size={18} strokeWidth={1.8} />{labels.backToMissions}</button>
      <div className="mission-lesson-paged__identity"><strong>{labels.missionCount}</strong><span>{pageLabel}</span></div>
      <div className="mission-lesson-paged__progress" role="progressbar" aria-label={pageLabel} aria-valuemin="1" aria-valuemax={pageCount} aria-valuenow={currentPage}>
        {Array.from({ length: pageCount }, (_, index) => <span className={index + 1 <= currentPage ? "is-active" : ""} key={index} />)}
      </div>
    </header>

    <main className="mission-lesson-paged__content mission-lesson-paged__safe-area">
      <header className="mission-lesson-paged__title">
        <div><span className="mission-lesson-paged__eyebrow">{labels.missionCount} · {labels.topicLabel ?? labels.tokenisation}</span><h1 ref={headingRef} tabIndex="-1">{title}</h1><p>{subtitle}</p></div>
        <img src={robotImage} alt={labels.robotAlt} />
      </header>
      {recommendation?.visible && <aside className="mission-lesson-recommendation" aria-live="polite"><p>{recommendation.message}</p><div><button type="button" className="outline" onClick={recommendation.onGoRecommended}>{recommendation.goLabel}</button><button type="button" onClick={recommendation.onContinue}>{recommendation.continueLabel}</button></div></aside>}
      <div className="mission-lesson-paged__page" data-current-page={currentPage}>{children}</div>
      <p className="mission-lesson-paged__announcement" aria-live="polite">{pageLabel}: {title}</p>
    </main>

    <nav className="mission-lesson-paged__nav" aria-label="Lesson pages">
      <button type="button" className="outline" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}><ArrowLeft size={18} strokeWidth={1.8} />{labels.back}</button>
      <span><strong>{pageLabel}</strong><small>{labels.prototypeLabel}</small></span>
      <button type="button" className="primary" disabled={currentPage === pageCount} onClick={() => onPageChange(currentPage + 1)}>{currentPage === pageCount ? labels.prototypeEndAction : labels.next}{currentPage < pageCount && <ArrowRight size={18} strokeWidth={1.8} />}</button>
    </nav>
  </div>;
}
