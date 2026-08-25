import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { placeGuidePanel } from "./guideGeometry.js";
import { afterGuideLayout, findGuideTarget, scrollGuideTargetIntoView } from "./guideTargeting.js";

const SPOTLIGHT_PADDING = 8;

function viewportRect(bounds, padding = SPOTLIGHT_PADDING) {
  const inset = typeof padding === "number"
    ? { top: padding, right: padding, bottom: padding, left: padding }
    : { top: padding?.top ?? SPOTLIGHT_PADDING, right: padding?.right ?? SPOTLIGHT_PADDING, bottom: padding?.bottom ?? SPOTLIGHT_PADDING, left: padding?.left ?? SPOTLIGHT_PADDING };
  const top = Math.max(0, Math.floor(bounds.top - inset.top));
  const left = Math.max(0, Math.floor(bounds.left - inset.left));
  const right = Math.min(window.innerWidth, Math.ceil(bounds.right + inset.right));
  const bottom = Math.min(window.innerHeight, Math.ceil(bounds.bottom + inset.bottom));
  return { top, left, right, bottom, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

export default function GuideSpotlight({ targetId = null, interactive = false, spotlightPadding = SPOTLIGHT_PADDING, children }) {
  const [rect, setRect] = useState(null);
  const [panelStyle, setPanelStyle] = useState(null);
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    if (!targetId) {
      setRect(null);
      setPanelStyle(null);
      return undefined;
    }
    let frame;
    let observer;
    const target = findGuideTarget(targetId);
    if (!target) {
      setRect(null);
      setPanelStyle(null);
      return undefined;
    }
    const update = () => {
      const nextRect = viewportRect(target.getBoundingClientRect(), spotlightPadding);
      setRect(nextRect);
      const panelBounds = panelRef.current?.getBoundingClientRect?.() ?? { width: 350, height: 230 };
      const placement = placeGuidePanel(nextRect, panelBounds, { width: window.innerWidth, height: window.innerHeight });
      setPanelStyle({ top: `${placement.top}px`, left: `${placement.left}px`, width: `${placement.width}px` });
    };
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };
    const cancelLayoutWait = afterGuideLayout(() => {
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      scrollGuideTargetIntoView(target, { behavior: reducedMotion ? "auto" : "smooth" });
      scheduleUpdate();
    });
    observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleUpdate) : null;
    observer?.observe(target);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);
    update();
    return () => {
      cancelLayoutWait();
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [spotlightPadding, targetId]);

  useEffect(() => {
    if (!targetId || !panelRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      const target = findGuideTarget(targetId);
      if (!target) return;
      const nextRect = viewportRect(target.getBoundingClientRect(), spotlightPadding);
      const panelBounds = panelRef.current.getBoundingClientRect();
      const placement = placeGuidePanel(nextRect, panelBounds, { width: window.innerWidth, height: window.innerHeight });
      setPanelStyle({ top: `${placement.top}px`, left: `${placement.left}px`, width: `${placement.width}px` });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [children, spotlightPadding, targetId]);

  const panel = React.isValidElement(children) ? React.cloneElement(children, { panelRef, style: panelStyle ?? undefined }) : children;

  return <div className={`guide-spotlight ${interactive ? "is-interactive" : ""}`} data-interactive-target={interactive ? "true" : "false"}>
    {rect && <div className="guide-spotlight-ring" aria-hidden="true" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />}
    <div className={`guide-panel-positioner ${rect ? "has-target" : "no-target"}`}>{panel}</div>
  </div>;
}
