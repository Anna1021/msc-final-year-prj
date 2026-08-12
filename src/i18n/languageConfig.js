export const SUPPORTED_LANGUAGES = [
  { code: "en", htmlLang: "en", nativeName: "English", shortName: "EN" },
  { code: "zh", htmlLang: "zh-CN", nativeName: "中文", shortName: "中" }
];

export const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_STORAGE_KEY = "aiExplorerLanguage";

export function normaliseLanguage(value) {
  const raw = String(value || "").toLowerCase();
  const base = raw.split("-")[0];
  return SUPPORTED_LANGUAGES.some((language) => language.code === base) ? base : DEFAULT_LANGUAGE;
}

export function getInitialLanguage() {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved) return normaliseLanguage(saved);
  } catch {
    // Ignore storage failures and fall back to browser language.
  }
  if (typeof navigator !== "undefined") return normaliseLanguage(navigator.language);
  return DEFAULT_LANGUAGE;
}

export function getHtmlLang(language) {
  return SUPPORTED_LANGUAGES.find((item) => item.code === language)?.htmlLang || "en";
}
