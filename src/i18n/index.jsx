import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE, getHtmlLang, getInitialLanguage, LANGUAGE_STORAGE_KEY, normaliseLanguage, SUPPORTED_LANGUAGES } from "./languageConfig";
import enCommon from "../locales/en/common.json";
import enNavigation from "../locales/en/navigation.json";
import enMissions from "../locales/en/missions.json";
import enEscapeRoom from "../locales/en/escapeRoom.json";
import zhCommon from "../locales/zh/common.json";
import zhNavigation from "../locales/zh/navigation.json";
import zhMissions from "../locales/zh/missions.json";
import zhEscapeRoom from "../locales/zh/escapeRoom.json";
import frCommon from "../locales/fr/common.json";
import frNavigation from "../locales/fr/navigation.json";
import frMissions from "../locales/fr/missions.json";
import frEscapeRoom from "../locales/fr/escapeRoom.json";
import deCommon from "../locales/de/common.json";
import deNavigation from "../locales/de/navigation.json";
import deMissions from "../locales/de/missions.json";
import deEscapeRoom from "../locales/de/escapeRoom.json";

const resources = {
  en: { common: enCommon, navigation: enNavigation, missions: enMissions, escapeRoom: enEscapeRoom },
  zh: { common: zhCommon, navigation: zhNavigation, missions: zhMissions, escapeRoom: zhEscapeRoom },
  fr: { common: frCommon, navigation: frNavigation, missions: frMissions, escapeRoom: frEscapeRoom },
  de: { common: deCommon, navigation: deNavigation, missions: deMissions, escapeRoom: deEscapeRoom }
};

const I18nContext = createContext(null);

function readPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function interpolate(value, params = {}) {
  if (typeof value !== "string") return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] ?? "");
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    const htmlLang = getHtmlLang(language);
    document.documentElement.lang = htmlLang;
    document.documentElement.dataset.locale = language;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Non-critical: language still works for this session.
    }
  }, [language]);

  const value = useMemo(() => {
    function t(key, params) {
      const [namespace, ...rest] = String(key).split(".");
      const path = rest.join(".");
      const translated = readPath(resources[language]?.[namespace], path);
      const fallback = readPath(resources[DEFAULT_LANGUAGE]?.[namespace], path);
      return interpolate(translated ?? fallback ?? key, params);
    }

    function setLanguage(nextLanguage) {
      setLanguageState(normaliseLanguage(nextLanguage));
    }

    return { language, setLanguage, t, languages: SUPPORTED_LANGUAGES };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside LanguageProvider");
  return value;
}

export function translateMission(mission, translatorOrField) {
  if (!mission?.id) return mission;

  if (typeof translatorOrField === "string") {
    return mission[translatorOrField] ?? "";
  }

  if (typeof translatorOrField !== "function") {
    return mission;
  }

  const t = translatorOrField;
  return {
    ...mission,
    title: t(`missions.items.${mission.id}.title`),
    short: t(`missions.items.${mission.id}.short`),
    desc: t(`missions.items.${mission.id}.desc`),
    skill: t(`missions.items.${mission.id}.skill`)
  };
}
