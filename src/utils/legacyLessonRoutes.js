export const LEGACY_LESSON_REDIRECTS = Object.freeze({
  "/mission/1-tokenisation": "/mission/1-tokenisation-paged",
  "/mission/2-next-token": "/mission/4-training-data-paged",
  "/mission/3-hallucination": "/mission/3-hallucination-paged",
  "/mission/4-context": "/mission/2-prediction-paged",
  "/mission/5-training-data": "/mission/5-bias-paged",
  "/mission/5/get-training-data": "/mission/5-bias-paged",
  "/mission/5/learn-patterns": "/mission/5-bias-paged",
  "/mission/5/make-predictions": "/mission/5-bias-paged",
  "/mission/6-bias": "/mission/5-bias-paged"
});

export function resolveLegacyLessonRoute(pathname) {
  return LEGACY_LESSON_REDIRECTS[pathname] || null;
}

export function canonicalLessonLocation(pathname, search = "") {
  const canonicalPath = resolveLegacyLessonRoute(pathname);
  if (!canonicalPath) return null;
  const params = new URLSearchParams(search);
  const suffix = params.get("qa") === "1" ? "?qa=1" : "";
  return `${canonicalPath}${suffix}`;
}
