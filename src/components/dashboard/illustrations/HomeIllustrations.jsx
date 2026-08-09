import React from "react";

const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" };

export function LlmExplorerLogo() {
  const dots = [[24,5,2.2],[14,8,2],[34,8,2],[8,17,1.8],[19,16,2.2],[29,16,2.2],[40,17,1.8],[5,27,2],[15,26,1.8],[24,25,2.5],[34,26,1.8],[43,27,2],[8,37,1.8],[19,35,2.2],[29,35,2.2],[40,37,1.8],[14,44,2],[34,44,2],[24,47,2.2]];
  return <svg className="llm-logo-svg" viewBox="0 0 48 52" aria-hidden="true"><g fill="currentColor">{dots.map(([cx,cy,r], index)=><circle key={index} cx={cx} cy={cy} r={r} opacity={index % 3 === 0 ? .62 : 1}/>)}</g><g stroke="currentColor" strokeWidth=".8" opacity=".2"><path d="M14 8 24 25 34 8M8 17l16 8 16-8M8 37l16-12 16 12M14 44l10-19 10 19"/></g></svg>;
}

export function TextIllustration({ className = "" }) {
  return <svg className={className} viewBox="0 0 92 72" aria-hidden="true"><path {...common} strokeWidth="2" d="M11 12h62a7 7 0 0 1 7 7v28a7 7 0 0 1-7 7H37L22 65V54H11a7 7 0 0 1-7-7V19a7 7 0 0 1 7-7Z"/><path {...common} strokeWidth="2" d="M20 26h42M20 35h34M20 44h25" opacity=".75"/></svg>;
}

export function TokensIllustration({ className = "" }) {
  const tiles = [[8,8,18,17],[34,8,18,17],[60,8,18,17],[8,31,18,17],[34,31,18,17],[60,31,18,17],[21,54,18,12],[47,54,18,12]];
  return <svg className={className} viewBox="0 0 86 72" aria-hidden="true"><g {...common} strokeWidth="1.8">{tiles.map(([x,y,w,h], index)=><rect key={index} x={x} y={y} width={w} height={h} rx="3" fill={index === 3 || index === 6 ? "currentColor" : "none"} fillOpacity=".08"/>)}</g></svg>;
}

export function ContextIllustration({ className = "" }) {
  return <svg className={className} viewBox="0 0 102 72" aria-hidden="true"><rect {...common} x="4" y="7" width="94" height="58" rx="7" strokeWidth="2"/><path {...common} d="M4 21h94" strokeWidth="1.6" opacity=".65"/><g fill="currentColor"><circle cx="13" cy="14" r="2"/><circle cx="21" cy="14" r="2" opacity=".65"/><circle cx="29" cy="14" r="2" opacity=".4"/></g><path {...common} d="M15 32h53M15 41h72M15 50h43M15 58h61" strokeWidth="3.2" opacity=".55"/></svg>;
}

export function PatternsIllustration({ className = "" }) {
  return <svg className={className} viewBox="0 0 96 76" aria-hidden="true"><g {...common} strokeWidth="1.7" opacity=".65"><path d="m15 26 28 12 19-24M43 38l22 23M43 38l38-4M62 14l19 20M65 61l16-27"/></g><g fill="#fff" stroke="currentColor" strokeWidth="1.8"><circle cx="15" cy="26" r="7"/><circle cx="43" cy="38" r="8"/><circle cx="62" cy="14" r="7"/><circle cx="81" cy="34" r="7"/><circle cx="65" cy="61" r="7"/></g><circle cx="43" cy="38" r="3" fill="currentColor"/></svg>;
}

export function PredictionIllustration({ className = "" }) {
  return <svg className={className} viewBox="0 0 96 76" aria-hidden="true"><path {...common} d="M8 65h80" strokeWidth="1.5" opacity=".35"/><g fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.7"><rect x="15" y="48" width="14" height="17" rx="2"/><rect x="40" y="31" width="14" height="34" rx="2"/><rect x="65" y="12" width="14" height="53" rx="2"/></g><path {...common} d="M22 44v-5M47 27v-5M72 8V4" strokeWidth="1.5" opacity=".55"/></svg>;
}

export function RepeatIllustration({ className = "" }) {
  return <svg className={className} viewBox="0 0 82 72" aria-hidden="true"><path {...common} d="M61 23A25 25 0 0 0 18 25" strokeWidth="2.2"/><path {...common} d="m18 15-1 11 11-1" strokeWidth="2.2"/><path {...common} d="M21 49a25 25 0 0 0 43-2" strokeWidth="2.2"/><path {...common} d="m64 57 1-11-11 1" strokeWidth="2.2"/></svg>;
}

export function StepArrow() {
  return <svg className="pipeline-step-arrow" viewBox="0 0 34 18" aria-hidden="true"><path {...common} d="M2 9h27m-6-6 6 6-6 6" strokeWidth="1.7"/></svg>;
}

export function PipelineLoopArrow() {
  return <svg className="pipeline-loop-arrow" viewBox="0 0 760 46" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="pipeline-loop-head" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M7 3.5 0 0v7Z" fill="#9679f5"/></marker></defs><path d="M716 5C700 37 588 39 385 39S70 38 38 12" fill="none" stroke="#9679f5" strokeWidth="1.7" strokeDasharray="5 5" strokeLinecap="round" markerEnd="url(#pipeline-loop-head)" opacity=".72"/></svg>;
}

export function TokensLessonIllustration() {
  return <svg viewBox="0 0 178 92" aria-hidden="true"><path {...common} d="M8 23h56a7 7 0 0 1 7 7v23a7 7 0 0 1-7 7H39L27 70V60H8a7 7 0 0 1-7-7V30a7 7 0 0 1 7-7Z" strokeWidth="1.8"/><text x="15" y="47" fill="currentColor" fontSize="14" fontWeight="700">Hello!</text><path {...common} d="M79 44h22m-6-6 6 6-6 6" strokeWidth="1.6"/><g fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="1.5">{[[111,22],[132,22],[153,22],[111,43],[132,43],[153,43],[121,64],[143,64]].map(([x,y],i)=><rect key={i} x={x} y={y} width="15" height="15" rx="2.5"/>)}</g></svg>;
}

export function ContextLessonIllustration() { return <ContextIllustration className="lesson-context-svg"/>; }
export function PatternsLessonIllustration() { return <PatternsIllustration className="lesson-patterns-svg"/>; }
export function PredictionLessonIllustration() { return <PredictionIllustration className="lesson-prediction-svg"/>; }

export function LearningLessonIllustration() {
  return <svg viewBox="0 0 150 92" aria-hidden="true"><path {...common} d="M75 25C59 15 41 14 22 20v54c18-6 36-4 53 7m0-56c16-10 34-11 53-5v54c-18-6-36-4-53 7Z" strokeWidth="2"/><path {...common} d="M75 25v56M33 33c12-3 22-2 32 2M33 44c12-3 22-2 32 2M33 55c12-3 22-2 32 2M85 35c10-4 20-4 32-1M85 46c10-4 20-4 32-1M85 57c10-4 20-4 32-1" strokeWidth="1.5" opacity=".55"/></svg>;
}

export function PortalIllustration() {
  return <svg className="portal-illustration" viewBox="0 0 280 170" aria-hidden="true"><defs><radialGradient id="portal-glow"><stop offset="0" stopColor="#fff"/><stop offset=".35" stopColor="#b9a5ff"/><stop offset="1" stopColor="#6240e8"/></radialGradient><linearGradient id="portal-frame" x1="0" x2="1"><stop stopColor="#9c8aff"/><stop offset=".5" stopColor="#5540d7"/><stop offset="1" stopColor="#8871f2"/></linearGradient></defs><ellipse cx="138" cy="145" rx="76" ry="14" fill="#7860ee" opacity=".18"/><path d="M78 140V77a60 60 0 0 1 120 0v63h-18V78a42 42 0 0 0-84 0v62Z" fill="url(#portal-frame)"/><path d="M98 139V79a40 40 0 0 1 80 0v60Z" fill="url(#portal-glow)"/><path d="M108 139V82a30 30 0 0 1 60 0v57Z" fill="#c5b7ff" opacity=".25"/><g fill="#fff" opacity=".75"><circle cx="135" cy="69" r="2"/><circle cx="151" cy="88" r="1.6"/><circle cx="124" cy="102" r="1.8"/><circle cx="143" cy="119" r="2.2"/></g><g fill="#8b70f4" stroke="#5a42d6" strokeWidth="1"><path d="m58 132 10-35 11 35Z"/><path d="m42 140 9-27 10 27Z"/><path d="m208 135 11-38 12 38Z"/><path d="m225 142 8-27 10 27Z"/></g><path d="M65 140h147l10 11H55Z" fill="#9d8df3"/><path d="M50 151h177l13 12H38Z" fill="#d4ccfb"/><path d="M38 163h202" stroke="#6c56df" strokeWidth="2"/></svg>;
}
