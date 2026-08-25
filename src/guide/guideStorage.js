import { clampGuidePosition, isGuidePositionCompletelyOutside } from "./guideGeometry.js";

export const GUIDE_POSITION_STORAGE_KEY = "llmExplorerGuideAssistantPositionV1";

export function readGuidePosition(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(GUIDE_POSITION_STORAGE_KEY) || "null");
    if (Number.isFinite(parsed?.x) && Number.isFinite(parsed?.y)) return { x: parsed.x, y: parsed.y };
  } catch {
    // A missing or invalid position simply restores the safe default.
  }
  return null;
}

export function writeGuidePosition(position, storage) {
  try {
    storage?.setItem(GUIDE_POSITION_STORAGE_KEY, JSON.stringify({ x: position.x, y: position.y }));
  } catch {
    // Session persistence is optional.
  }
}

export function restoreGuidePosition(storage, viewport, insets, fallback, size) {
  const stored = readGuidePosition(storage);
  const safeFallback = clampGuidePosition(fallback, viewport, insets, size);
  if (!stored || isGuidePositionCompletelyOutside(stored, viewport, size)) return safeFallback;
  return clampGuidePosition(stored, viewport, insets, size);
}
