import React, { forwardRef } from "react";
import "./lessonPageHero.css";

const LessonPageHero = forwardRef(function LessonPageHero({
  lessonIndex,
  lessonCount = 5,
  lessonProgressLabel,
  lessonName,
  title,
  subtitle,
  illustration = null,
  illustrationAlt = "",
  headingId,
  className = ""
}, headingRef) {
  const illustrationContent = typeof illustration === "string"
    ? <img src={illustration} alt={illustrationAlt} />
    : illustration;

  return <header className={`lesson-page-hero ${illustrationContent ? "has-illustration" : ""} ${className}`.trim()}>
    <div className="lesson-page-hero__copy">
      <p className="lesson-page-hero__eyebrow">{lessonProgressLabel}<span aria-hidden="true"> · </span>{lessonName}</p>
      <div className="lesson-page-hero__title-shell">
        <h1 id={headingId} ref={headingRef} tabIndex="-1">{title}</h1>
      </div>
      <p className="lesson-page-hero__subtitle">{subtitle}</p>
      <span className="lesson-page-hero__accent" aria-hidden="true" />
    </div>
    {illustrationContent && <div className="lesson-page-hero__illustration">{illustrationContent}</div>}
  </header>;
});

export default LessonPageHero;
