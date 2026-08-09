import { useCallback, useEffect, useRef, useState } from "react";

function getSessionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `lesson4-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function useLivePredictionModel() {
  const controllerRef = useRef(null);
  const sessionRef = useRef(getSessionId());
  const [status, setStatus] = useState("ready");
  const [error, setError] = useState("");

  const predict = useCallback(async (payload) => {
    if (controllerRef.current) throw new Error("A next-Token prediction is already running.");
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("predicting");
    setError("");
    const requestUrl = new URL("/api/next-token", window.location.origin).href;
    const startedAt = performance.now();
    try {
      const response = await fetch("/api/next-token", {
        method: "POST",
        headers: { "Content-Type":"application/json", "X-AI-Explorer-Session":sessionRef.current },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const contentType = response.headers.get("content-type") || "";
      const responseText = await response.text();
      let data = {};
      try { data = responseText ? JSON.parse(responseText) : {}; } catch { data = {}; }
      if (!response.ok) {
        console.error("[Lesson4Prediction]", {
          method:"POST",
          url:requestUrl,
          status:response.status,
          contentType,
          response:responseText,
          durationMs:Math.round(performance.now() - startedAt)
        });
        throw new Error(data.error || `Prediction service returned ${response.status}.`);
      }
      setStatus("ready");
      return data;
    } catch (failure) {
      if (failure.name === "AbortError") {
        setStatus("ready");
        throw new Error("Live model request cancelled.");
      }
      setError(failure.message);
      setStatus("error");
      throw failure;
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    sessionRef.current = getSessionId();
    setStatus("ready");
  }, []);
  const retry = useCallback(() => { setError(""); setStatus("ready"); }, []);
  useEffect(() => {
    if (status !== "error") return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/health", { signal:controller.signal, cache:"no-store" });
        if (response.ok) { setError(""); setStatus("ready"); }
      } catch { /* The compact retry callout remains until the service recovers. */ }
    }, 800);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [status]);
  useEffect(() => () => controllerRef.current?.abort(), []);
  return { status, error, predict, retry, cancel };
}
