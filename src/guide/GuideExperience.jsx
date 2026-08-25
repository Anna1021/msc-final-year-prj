import React from "react";
import GuideAssistant from "./GuideAssistant.jsx";
import GuidePanel from "./GuidePanel.jsx";
import GuideSpotlight from "./GuideSpotlight.jsx";
import { useGuide } from "./GuideProvider.jsx";
import "./guide.css";

export default function GuideExperience({ assistantAsset = "/assets/img/mission-robot-pointing.png" }) {
  const guide = useGuide();
  const step = guide.currentStep;
  return <>
    <GuideAssistant asset={assistantAsset} expanded={guide.expanded} onActivate={guide.expanded ? guide.collapseGuide : () => guide.openGuide()} />
    {guide.expanded && step && <GuideSpotlight targetId={step.targetId} interactive={Boolean(step.interactive)} spotlightPadding={step.spotlightPadding}>
      <GuidePanel
        step={step}
        stepIndex={guide.visibleStepIndex}
        stepCount={guide.visibleStepCount}
        onBack={guide.previousStep}
        onNext={guide.nextStep}
        onClose={guide.collapseGuide}
        onSkip={guide.skipGuide}
      />
    </GuideSpotlight>}
  </>;
}
