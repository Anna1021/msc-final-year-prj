export const GUIDE_PROGRESS_STORAGE_KEY = "llmExplorerGuideProgressV1";

function uniqueIds(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter((value) => typeof value === "string" && value.length > 0))];
}

export function readGuideProgress(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(GUIDE_PROGRESS_STORAGE_KEY) || "{}");
    return { seenFlowIds: uniqueIds(parsed.seenFlowIds), completedFlowIds: uniqueIds(parsed.completedFlowIds) };
  } catch {
    return { seenFlowIds: [], completedFlowIds: [] };
  }
}

export function writeGuideProgress(progress, storage) {
  const value = {
    seenFlowIds: uniqueIds(progress.seenFlowIds),
    completedFlowIds: uniqueIds(progress.completedFlowIds)
  };
  try {
    storage?.setItem(GUIDE_PROGRESS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Guide persistence is optional; the guide continues to work in memory.
  }
  return value;
}

export function createGuideState(progress = {}) {
  return {
    expanded: false,
    activeFlowId: null,
    stepIndex: 0,
    seenFlowIds: uniqueIds(progress.seenFlowIds),
    completedFlowIds: uniqueIds(progress.completedFlowIds)
  };
}

export function shouldAutoStartGuide(flow, state) {
  if (!flow?.autoStart || !flow.id || state?.expanded) return false;
  return !state.seenFlowIds?.includes(flow.id) && !state.completedFlowIds?.includes(flow.id);
}

function addId(values, id) {
  return id ? uniqueIds([...values, id]) : values;
}

export function guideReducer(state, action) {
  switch (action.type) {
    case "open":
      return {
        ...state,
        expanded: true,
        activeFlowId: action.flowId,
        stepIndex: Math.max(0, action.stepIndex ?? 0),
        seenFlowIds: addId(state.seenFlowIds, action.flowId)
      };
    case "collapse":
      return { ...state, expanded: false };
    case "next":
      return { ...state, stepIndex: Math.min(action.lastStepIndex, state.stepIndex + 1) };
    case "back":
      return { ...state, stepIndex: Math.max(0, state.stepIndex - 1) };
    case "go-to":
      return { ...state, stepIndex: Math.max(0, action.stepIndex ?? 0) };
    case "finish":
    case "skip":
      return {
        ...state,
        expanded: false,
        completedFlowIds: addId(state.completedFlowIds, state.activeFlowId)
      };
    case "location-changed":
      return action.keepFlow ? state : { ...state, expanded: false, activeFlowId: null, stepIndex: 0 };
    default:
      return state;
  }
}
