export const GUIDE_TARGET_ATTRIBUTE = "data-guide-target";
export const GUIDE_TARGET_SELECTOR = `[${GUIDE_TARGET_ATTRIBUTE}]`;

const SAFE_TARGET_ID = /^[a-z0-9][a-z0-9._:-]*$/i;

export function guideTargetProps(targetId) {
  if (!SAFE_TARGET_ID.test(String(targetId))) throw new TypeError("Guide target IDs must be stable semantic identifiers.");
  return { [GUIDE_TARGET_ATTRIBUTE]: targetId };
}

export function guideTargetSelector(targetId) {
  if (!SAFE_TARGET_ID.test(String(targetId))) throw new TypeError("Guide target IDs must be stable semantic identifiers.");
  return `[${GUIDE_TARGET_ATTRIBUTE}="${targetId}"]`;
}

export function findGuideTarget(targetId, root = typeof document !== "undefined" ? document : null) {
  return root?.querySelector?.(guideTargetSelector(targetId)) ?? null;
}

export function getGuideScrollContainer(target) {
  return target?.closest?.(".page.paged-mission-page") ?? null;
}

export function getGuideViewportInsets(root = typeof document !== "undefined" ? document : null, viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0) {
  const header = root?.querySelector?.(".global-topbar, .mission-lesson-paged__header");
  const footer = root?.querySelector?.(".mission-lesson-paged__nav, .global-mobile-nav");
  const headerRect = header?.getBoundingClientRect?.();
  const footerRect = footer?.getBoundingClientRect?.();
  const headerVisible = headerRect && headerRect.width > 0 && headerRect.height > 0 && headerRect.bottom > 0;
  const footerVisible = footerRect && footerRect.width > 0 && footerRect.height > 0 && footerRect.bottom > 0 && footerRect.top < viewportHeight;
  return {
    top: headerVisible ? Math.min(viewportHeight, headerRect.bottom + 12) : 16,
    right: 16,
    bottom: footerVisible ? Math.max(16, viewportHeight - footerRect.top + 12) : 24,
    left: 16
  };
}

export function isGuideTargetSafelyVisible(targetRect, viewportHeight, insets) {
  return targetRect.top >= insets.top && targetRect.bottom <= viewportHeight - insets.bottom;
}

export function scrollGuideTargetIntoView(target, { behavior = "smooth", root, viewportHeight } = {}) {
  if (!target?.getBoundingClientRect) return false;
  const height = viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 0);
  const insets = getGuideViewportInsets(root, height);
  const targetRect = target.getBoundingClientRect();
  if (isGuideTargetSafelyVisible(targetRect, height, insets)) return false;

  const container = getGuideScrollContainer(target);
  if (container?.scrollTo) {
    const containerRect = container.getBoundingClientRect();
    const safeHeight = Math.max(1, height - insets.top - insets.bottom);
    const targetCentre = targetRect.top - containerRect.top + container.scrollTop + targetRect.height / 2;
    container.scrollTo({ top: Math.max(0, targetCentre - safeHeight / 2), behavior });
  } else {
    target.scrollIntoView?.({ block: "center", behavior });
  }
  return true;
}

export function afterGuideLayout(callback, schedule = typeof window !== "undefined" ? window.requestAnimationFrame.bind(window) : (fn) => fn()) {
  let firstFrame;
  let secondFrame;
  let cancelled = false;
  firstFrame = schedule(() => {
    secondFrame = schedule(() => {
      if (!cancelled) callback();
    });
  });
  return () => {
    cancelled = true;
    if (typeof window !== "undefined") {
      window.cancelAnimationFrame?.(firstFrame);
      window.cancelAnimationFrame?.(secondFrame);
    }
  };
}
