import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE, getHtmlLang, getInitialLanguage, LANGUAGE_STORAGE_KEY, normaliseLanguage, SUPPORTED_LANGUAGES } from "./languageConfig";
import enCommon from "../locales/en/common.json";
import enNavigation from "../locales/en/navigation.json";
import enMissions from "../locales/en/missions.json";
import enEscapeRoom from "../locales/en/escapeRoom.json";
import enMission1 from "../locales/en/mission1.json";
import enMission1Learning from "../locales/en/mission1Learning.json";
import enLearningMode from "../locales/en/learningMode.json";
import enMission2 from "../locales/en/mission2.json";
import enMission3 from "../locales/en/mission3.json";
import enMission4 from "../locales/en/mission4.json";
import enMission5 from "../locales/en/mission5.json";
import enTokenLab from "../locales/en/tokenLab.json";
import enNumbersStage from "../locales/en/numbersStage.json";
import enContextStage from "../locales/en/contextStage.json";
import enPredictionStage from "../locales/en/predictionStage.json";
import enCompareStage from "../locales/en/compareStage.json";
import zhCommon from "../locales/zh/common.json";
import zhNavigation from "../locales/zh/navigation.json";
import zhMissions from "../locales/zh/missions.json";
import zhEscapeRoom from "../locales/zh/escapeRoom.json";
import zhMission1 from "../locales/zh/mission1.json";
import zhMission1Learning from "../locales/zh/mission1Learning.json";
import zhLearningMode from "../locales/zh/learningMode.json";
import zhMission2 from "../locales/zh/mission2.json";
import zhMission3 from "../locales/zh/mission3.json";
import zhMission4 from "../locales/zh/mission4.json";
import zhMission5 from "../locales/zh/mission5.json";
import zhTokenLab from "../locales/zh/tokenLab.json";
import zhNumbersStage from "../locales/zh/numbersStage.json";
import zhContextStage from "../locales/zh/contextStage.json";
import zhPredictionStage from "../locales/zh/predictionStage.json";
import zhCompareStage from "../locales/zh/compareStage.json";
import frCommon from "../locales/fr/common.json";
import frNavigation from "../locales/fr/navigation.json";
import frMissions from "../locales/fr/missions.json";
import frEscapeRoom from "../locales/fr/escapeRoom.json";
import frMission1 from "../locales/fr/mission1.json";
import frMission1Learning from "../locales/fr/mission1Learning.json";
import frLearningMode from "../locales/fr/learningMode.json";
import frMission2 from "../locales/fr/mission2.json";
import frMission3 from "../locales/fr/mission3.json";
import frMission4 from "../locales/fr/mission4.json";
import frMission5 from "../locales/fr/mission5.json";
import frTokenLab from "../locales/fr/tokenLab.json";
import frNumbersStage from "../locales/fr/numbersStage.json";
import frContextStage from "../locales/fr/contextStage.json";
import frPredictionStage from "../locales/fr/predictionStage.json";
import frCompareStage from "../locales/fr/compareStage.json";
import deCommon from "../locales/de/common.json";
import deNavigation from "../locales/de/navigation.json";
import deMissions from "../locales/de/missions.json";
import deEscapeRoom from "../locales/de/escapeRoom.json";
import deMission1 from "../locales/de/mission1.json";
import deMission1Learning from "../locales/de/mission1Learning.json";
import deLearningMode from "../locales/de/learningMode.json";
import deMission2 from "../locales/de/mission2.json";
import deMission3 from "../locales/de/mission3.json";
import deMission4 from "../locales/de/mission4.json";
import deMission5 from "../locales/de/mission5.json";
import deTokenLab from "../locales/de/tokenLab.json";
import deNumbersStage from "../locales/de/numbersStage.json";
import deContextStage from "../locales/de/contextStage.json";
import dePredictionStage from "../locales/de/predictionStage.json";
import deCompareStage from "../locales/de/compareStage.json";

const resources = {
  en: { common: enCommon, navigation: enNavigation, missions: enMissions, escapeRoom: enEscapeRoom, mission1: enMission1, mission1Learning: enMission1Learning, learningMode: enLearningMode, mission2: enMission2, mission3: enMission3, mission4: enMission4, mission5: enMission5, tokenLab: enTokenLab, numbersStage: enNumbersStage, contextStage: enContextStage, predictionStage: enPredictionStage, compareStage: enCompareStage },
  zh: { common: zhCommon, navigation: zhNavigation, missions: zhMissions, escapeRoom: zhEscapeRoom, mission1: zhMission1, mission1Learning: zhMission1Learning, learningMode: zhLearningMode, mission2: zhMission2, mission3: zhMission3, mission4: zhMission4, mission5: zhMission5, tokenLab: zhTokenLab, numbersStage: zhNumbersStage, contextStage: zhContextStage, predictionStage: zhPredictionStage, compareStage: zhCompareStage },
  fr: { common: frCommon, navigation: frNavigation, missions: frMissions, escapeRoom: frEscapeRoom, mission1: frMission1, mission1Learning: frMission1Learning, learningMode: frLearningMode, mission2: frMission2, mission3: frMission3, mission4: frMission4, mission5: frMission5, tokenLab: frTokenLab, numbersStage: frNumbersStage, contextStage: frContextStage, predictionStage: frPredictionStage, compareStage: frCompareStage },
  de: { common: deCommon, navigation: deNavigation, missions: deMissions, escapeRoom: deEscapeRoom, mission1: deMission1, mission1Learning: deMission1Learning, learningMode: deLearningMode, mission2: deMission2, mission3: deMission3, mission4: deMission4, mission5: deMission5, tokenLab: deTokenLab, numbersStage: deNumbersStage, contextStage: deContextStage, predictionStage: dePredictionStage, compareStage: deCompareStage }
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
    title: t(`missions.items.${mission.order ?? mission.id}.title`),
    short: t(`missions.items.${mission.order ?? mission.id}.short`),
    desc: t(`missions.items.${mission.order ?? mission.id}.desc`),
    skill: t(`missions.items.${mission.order ?? mission.id}.skill`)
  };
}
