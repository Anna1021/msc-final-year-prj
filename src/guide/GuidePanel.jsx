import React, { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useI18n } from "../i18n/index.jsx";

export default function GuidePanel({ step, stepIndex, stepCount, onBack, onNext, onClose, onSkip, panelRef, style }) {
  const { t } = useI18n();
  const closeRef = useRef(null);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex >= stepCount - 1;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, [step?.id]);

  return <section
    ref={panelRef}
    className="guide-panel"
    style={style}
    role="region"
    aria-labelledby="guide-panel-title"
    aria-describedby="guide-panel-copy"
  >
    <header>
      <span>{stepCount > 1 ? t("guide.common.progress", { current: stepIndex + 1, total: stepCount }) : t("guide.common.eyebrow")}</span>
      <button ref={closeRef} type="button" className="guide-panel-close" aria-label={t("guide.common.close")} onClick={onClose}><X size={18} /></button>
    </header>
    <h2 id="guide-panel-title">{t(step.titleKey)}</h2>
    <p id="guide-panel-copy">{t(step.bodyKey)}</p>
    <footer>
      <button type="button" className="guide-panel-skip" onClick={onSkip}>{t("guide.common.skip")}</button>
      <div>
        {!isFirst && <button type="button" className="guide-panel-back" onClick={onBack}><ArrowLeft size={16} />{t("guide.common.back")}</button>}
        <button type="button" className="guide-panel-next" onClick={onNext}>{isLast ? t("guide.common.close") : t("guide.common.next")}{!isLast && <ArrowRight size={16} />}</button>
      </div>
    </footer>
  </section>;
}
