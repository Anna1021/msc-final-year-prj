import React, { useEffect, useRef, useState } from "react";
import { defaultGuidePosition, GUIDE_ASSISTANT_SIZE, guidePointerOffset, guidePositionFromPointer, isGuideDrag, clampGuidePosition } from "./guideGeometry.js";
import { getGuideViewportInsets } from "./guideTargeting.js";
import { restoreGuidePosition, writeGuidePosition } from "./guideStorage.js";
import { useI18n } from "../i18n/index.jsx";

function sessionStorageSafe() {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

function viewport() {
  return { width: window.innerWidth, height: window.innerHeight };
}

function responsiveAssistantSize() {
  const size = window.innerWidth <= 600 ? 58 : GUIDE_ASSISTANT_SIZE;
  return { width: size, height: size };
}

function safePosition(position, size = responsiveAssistantSize()) {
  const insets = getGuideViewportInsets();
  return clampGuidePosition(position ?? defaultGuidePosition(viewport(), insets, size), viewport(), insets, size);
}

export default function GuideAssistant({ asset = "/assets/img/mission-robot-pointing.png", expanded = false, onActivate, className = "" }) {
  const { t } = useI18n();
  const [position, setPosition] = useState(() => {
    if (typeof window === "undefined") return { x: 16, y: 96 };
    const size = responsiveAssistantSize();
    const insets = getGuideViewportInsets();
    const fallback = defaultGuidePosition(viewport(), insets, size);
    return restoreGuidePosition(sessionStorageSafe(), viewport(), insets, fallback, size);
  });
  const assistantRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setPosition((current) => {
      const bounds = assistantRef.current?.getBoundingClientRect?.();
      const size = bounds?.width && bounds?.height ? { width: bounds.width, height: bounds.height } : responsiveAssistantSize();
      const next = safePosition(current, size);
      writeGuidePosition(next, sessionStorageSafe());
      return next;
    });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    suppressClickRef.current = false;
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointer = { x: event.clientX, y: event.clientY };
    dragRef.current = {
      pointerId: event.pointerId,
      start: pointer,
      offset: guidePointerOffset(pointer, bounds),
      size: { width: bounds.width, height: bounds.height },
      moved: false
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const currentPointer = { x: event.clientX, y: event.clientY };
    if (!drag.moved && !isGuideDrag(drag.start, currentPointer)) return;
    drag.moved = true;
    const next = guidePositionFromPointer(currentPointer, drag.offset, viewport(), getGuideViewportInsets(), drag.size);
    drag.currentPosition = next;
    setPosition(next);
    event.preventDefault();
  }

  function finishPointer(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (drag.moved) {
      suppressClickRef.current = true;
      writeGuidePosition(drag.currentPosition ?? position, sessionStorageSafe());
    }
    dragRef.current = null;
  }

  function handleClick(event) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onActivate?.();
  }

  return <button
    ref={assistantRef}
    type="button"
    className={`guide-assistant ${expanded ? "is-expanded" : "is-collapsed"} ${className}`.trim()}
    style={{ left: `${position.x}px`, top: `${position.y}px` }}
    aria-label={expanded ? t("guide.common.guideOpen") : t("guide.common.openGuide")}
    aria-expanded={expanded}
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={finishPointer}
    onPointerCancel={finishPointer}
    onClick={handleClick}
  >
    <span className="guide-assistant__mascot-frame" aria-hidden="true">
      <img className="guide-assistant__mascot-image" src={asset} alt="" draggable="false" />
    </span>
  </button>;
}
