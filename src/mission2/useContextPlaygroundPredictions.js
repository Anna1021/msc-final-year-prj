import { useCallback, useEffect, useRef, useState } from "react";

function createSessionId() {
  return globalThis.crypto?.randomUUID?.() || `lesson2-context-${Date.now()}`;
}

export function clampContextWindow(start, size, tokenCount) {
  return Math.max(0, Math.min(start, Math.max(0, tokenCount - size)));
}

export function moveContextWindow(start, size, tokenCount, direction) {
  return clampContextWindow(start + direction, size, tokenCount);
}

export function resizeContextWindow(start, nextSize, tokenCount) {
  return { start: clampContextWindow(start, nextSize, tokenCount), size: nextSize };
}

export function getAvailableContext(tokens, start, size) {
  const safeStart = clampContextWindow(start, size, tokens.length);
  return tokens.slice(safeStart, safeStart + size);
}

export async function getContextPredictions({ tokens, signal, sessionId }) {
  const response = await fetch("/api/next-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-AI-Explorer-Session": sessionId,
    },
    body: JSON.stringify({
      text: tokens.join(" "),
      temperature: 1,
      mode: "greedy",
      top_k: 5,
    }),
    signal,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Prediction service returned ${response.status}.`);
  return payload.candidates || [];
}

export default function useContextPlaygroundPredictions(tokens, active) {
  const controllerRef = useRef(null);
  const requestRef = useRef(0);
  const sessionRef = useRef(createSessionId());
  const [state, setState] = useState({ status: "idle", candidates: [], error: "" });

  const load = useCallback(async () => {
    if (!active || !tokens.length) return;
    if (controllerRef.current) {
      controllerRef.current.abort();
      sessionRef.current = createSessionId();
    }
    const controller = new AbortController();
    const requestId = ++requestRef.current;
    controllerRef.current = controller;
    setState((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const candidates = await getContextPredictions({ tokens, signal: controller.signal, sessionId: sessionRef.current });
      if (requestId === requestRef.current) setState({ status: "ready", candidates, error: "" });
    } catch (error) {
      if (error.name !== "AbortError" && requestId === requestRef.current) {
        setState({ status: "error", candidates: [], error: error.message });
      }
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [active, tokens]);

  useEffect(() => {
    const timer = setTimeout(load, 180);
    return () => {
      clearTimeout(timer);
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
        sessionRef.current = createSessionId();
      }
    };
  }, [load]);

  return { ...state, retry: load };
}
