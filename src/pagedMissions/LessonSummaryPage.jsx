import React from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import "./lessonSummaryPage.css";

export default function LessonSummaryPage({
  active,
  pageNumber,
  kicker,
  ideas,
  recap,
  nuance = "",
  nextLabel,
  nextTitle,
  nextCopy,
  advisory = ""
}) {
  return <section hidden={!active} className="lesson-summary-page" data-lesson-page={pageNumber}>
    <article className="lesson-summary-card">
      <header className="lesson-summary-card__heading">
        <span className="lesson-summary-card__number" aria-hidden="true">{pageNumber}</span>
        <div><small>{kicker}</small><strong>{recap}</strong></div>
        <Sparkles aria-hidden="true" />
      </header>

      <div className="lesson-summary-flow">
        {ideas.map(({ Icon, title, copy }, index) => <React.Fragment key={title}>
          <article className={`lesson-summary-idea tone-${index + 1}`}>
            <span><Icon aria-hidden="true" /></span>
            <strong>{title}</strong>
            <p>{copy}</p>
          </article>
          {index < ideas.length - 1 && <ArrowRight className="lesson-summary-flow__arrow" aria-hidden="true" />}
        </React.Fragment>)}
      </div>

      <div className="lesson-summary-recap">
        <CheckCircle2 aria-hidden="true" />
        <p>{recap}</p>
        {nuance && <small>{nuance}</small>}
      </div>

      <section className="lesson-summary-next">
        <span><Sparkles aria-hidden="true" /></span>
        <div><small>{nextLabel}</small><strong>{nextTitle}</strong><p>{nextCopy}</p></div>
        <ArrowRight aria-hidden="true" />
      </section>

      {advisory && <p className="lesson-summary-advisory">{advisory}</p>}
    </article>
  </section>;
}
