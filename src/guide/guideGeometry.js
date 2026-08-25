export const GUIDE_ASSISTANT_SIZE = 62;
export const GUIDE_DRAG_THRESHOLD = 6;
export const GUIDE_EDGE_GAP = 16;

export function movementDistance(start, current) {
  return Math.hypot(current.x - start.x, current.y - start.y);
}

export function isGuideDrag(start, current, threshold = GUIDE_DRAG_THRESHOLD) {
  return movementDistance(start, current) >= threshold;
}

function guideSize(size) {
  if (Number.isFinite(size)) return { width: size, height: size };
  return {
    width: Number.isFinite(size?.width) ? size.width : GUIDE_ASSISTANT_SIZE,
    height: Number.isFinite(size?.height) ? size.height : GUIDE_ASSISTANT_SIZE
  };
}

export function clampGuidePosition(position, viewport, insets = {}, size = GUIDE_ASSISTANT_SIZE) {
  const dimensions = guideSize(size);
  const left = Math.max(GUIDE_EDGE_GAP, Number(insets.left) || GUIDE_EDGE_GAP);
  const top = Math.max(GUIDE_EDGE_GAP, Number(insets.top) || GUIDE_EDGE_GAP);
  const right = Math.max(GUIDE_EDGE_GAP, Number(insets.right) || GUIDE_EDGE_GAP);
  const bottom = Math.max(GUIDE_EDGE_GAP, Number(insets.bottom) || GUIDE_EDGE_GAP);
  const maxX = Math.max(left, viewport.width - dimensions.width - right);
  const maxY = Math.max(top, viewport.height - dimensions.height - bottom);
  const x = Number.isFinite(position?.x) ? position.x : left;
  const y = Number.isFinite(position?.y) ? position.y : top;
  return {
    x: Math.min(maxX, Math.max(left, x)),
    y: Math.min(maxY, Math.max(top, y))
  };
}

export function defaultGuidePosition(viewport, insets = {}, size = GUIDE_ASSISTANT_SIZE) {
  const dimensions = guideSize(size);
  return clampGuidePosition({ x: viewport.width - dimensions.width - 22, y: viewport.height - dimensions.height - Math.max(24, insets.bottom || 0) }, viewport, insets, size);
}

export function guidePointerOffset(pointer, assistantRect) {
  return { x: pointer.x - assistantRect.left, y: pointer.y - assistantRect.top };
}

export function guidePositionFromPointer(pointer, offset, viewport, insets = {}, size = GUIDE_ASSISTANT_SIZE) {
  return clampGuidePosition({ x: pointer.x - offset.x, y: pointer.y - offset.y }, viewport, insets, size);
}

export function isGuidePositionCompletelyOutside(position, viewport, size = GUIDE_ASSISTANT_SIZE) {
  const dimensions = guideSize(size);
  if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y)) return true;
  return position.x + dimensions.width < 0
    || position.y + dimensions.height < 0
    || position.x > viewport.width
    || position.y > viewport.height;
}

export function placeGuidePanel(targetRect, panelSize, viewport, gap = 14) {
  const margin = 16;
  const width = Math.min(panelSize.width || 340, viewport.width - margin * 2);
  const height = Math.min(panelSize.height || 230, viewport.height - margin * 2);
  const belowTop = targetRect.bottom + gap;
  const aboveTop = targetRect.top - height - gap;
  const rightLeft = targetRect.right + gap;
  const leftLeft = targetRect.left - width - gap;

  let top;
  let left;
  if (belowTop + height <= viewport.height - margin) {
    top = belowTop;
    left = targetRect.left;
  } else if (aboveTop >= margin) {
    top = aboveTop;
    left = targetRect.left;
  } else if (rightLeft + width <= viewport.width - margin) {
    top = targetRect.top;
    left = rightLeft;
  } else {
    top = targetRect.top;
    left = leftLeft;
  }
  return {
    top: Math.min(viewport.height - height - margin, Math.max(margin, top)),
    left: Math.min(viewport.width - width - margin, Math.max(margin, left)),
    width
  };
}
