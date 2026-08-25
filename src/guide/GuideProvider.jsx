import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { findGuideFlow, guideFlows, readGuideLocation, resolveGuideForPage } from "./guideFlows.js";
import { createGuideState, guideReducer, readGuideProgress, shouldAutoStartGuide, writeGuideProgress } from "./guideState.js";

const GuideContext = createContext(null);

function browserStorage(name) {
  try {
    return typeof window !== "undefined" ? window[name] : null;
  } catch {
    return null;
  }
}

export default function GuideProvider({ children, flows = guideFlows, location: controlledLocation = null }) {
  const [location, setLocation] = useState(() => controlledLocation ?? readGuideLocation());
  const [state, dispatch] = useReducer(guideReducer, null, () => createGuideState(readGuideProgress(browserStorage("localStorage"))));

  useEffect(() => {
    if (controlledLocation) setLocation(controlledLocation);
  }, [controlledLocation]);

  useEffect(() => {
    if (controlledLocation || typeof window === "undefined") return undefined;
    const updateLocation = () => setLocation(readGuideLocation());
    window.addEventListener("popstate", updateLocation);
    window.addEventListener("ai-explorer:navigation", updateLocation);
    return () => {
      window.removeEventListener("popstate", updateLocation);
      window.removeEventListener("ai-explorer:navigation", updateLocation);
    };
  }, [controlledLocation]);

  useEffect(() => {
    writeGuideProgress(state, browserStorage("localStorage"));
  }, [state.seenFlowIds, state.completedFlowIds]);

  const availableFlow = useMemo(() => resolveGuideForPage({ flows, location, trigger: "manual" }), [flows, location]);
  const autoFlow = useMemo(() => resolveGuideForPage({ flows, location, trigger: "auto" }), [flows, location]);
  const activeFlow = useMemo(() => findGuideFlow(state.activeFlowId, flows), [flows, state.activeFlowId]);
  const currentStep = activeFlow?.steps?.[state.stepIndex] ?? null;
  const primarySteps = activeFlow?.steps?.filter((step) => !step.handoffOnly) ?? [];
  const visibleStepCount = primarySteps.length + (currentStep?.handoffOnly ? 1 : 0);
  const visibleStepIndex = currentStep?.handoffOnly
    ? visibleStepCount - 1
    : Math.max(0, activeFlow?.steps?.slice(0, state.stepIndex + 1).filter((step) => !step.handoffOnly).length - 1);

  const openGuide = useCallback((flowId = availableFlow?.id) => {
    const flow = findGuideFlow(flowId, flows);
    if (flow) dispatch({ type: "open", flowId: flow.id });
  }, [availableFlow, flows]);
  const collapseGuide = useCallback(() => dispatch({ type: "collapse" }), []);
  const skipGuide = useCallback(() => dispatch({ type: "skip" }), []);
  const finishGuide = useCallback(() => dispatch({ type: "finish" }), []);
  const nextStep = useCallback(() => {
    if (!activeFlow) return;
    const next = activeFlow.steps[state.stepIndex + 1];
    if (state.stepIndex >= activeFlow.steps.length - 1 || next?.handoffOnly) dispatch({ type: "finish" });
    else dispatch({ type: "next", lastStepIndex: activeFlow.steps.length - 1 });
  }, [activeFlow, state.stepIndex]);
  const previousStep = useCallback(() => dispatch({ type: "back" }), []);
  const goToStep = useCallback((stepId) => {
    const stepIndex = activeFlow?.steps?.findIndex((step) => step.id === stepId) ?? -1;
    if (stepIndex >= 0) dispatch({ type: "go-to", stepIndex });
  }, [activeFlow]);

  useEffect(() => {
    if (!state.activeFlowId) return;
    const flowStillApplies = availableFlow?.id === state.activeFlowId;
    dispatch({ type: "location-changed", keepFlow: flowStillApplies });
  }, [availableFlow?.id]);

  useEffect(() => {
    if (shouldAutoStartGuide(autoFlow, state)) {
      dispatch({ type: "open", flowId: autoFlow.id, stepIndex: autoFlow.autoStartStepIndex ?? 0 });
    }
  }, [autoFlow, state]);

  useEffect(() => {
    if (!state.expanded || typeof document === "undefined") return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      collapseGuide();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [collapseGuide, state.expanded]);

  const value = useMemo(() => ({
    ...state,
    location,
    availableFlow,
    autoFlow,
    activeFlow,
    currentStep,
    visibleStepCount,
    visibleStepIndex,
    openGuide,
    collapseGuide,
    skipGuide,
    finishGuide,
    nextStep,
    previousStep,
    goToStep
  }), [state, location, availableFlow, autoFlow, activeFlow, currentStep, visibleStepCount, visibleStepIndex, openGuide, collapseGuide, skipGuide, finishGuide, nextStep, previousStep, goToStep]);

  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
}

export function useGuide() {
  const value = useContext(GuideContext);
  if (!value) throw new Error("useGuide must be used inside GuideProvider");
  return value;
}
