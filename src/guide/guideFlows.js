export const GENERIC_GUIDE_FLOW = Object.freeze({
  id: "generic.page-helper",
  autoStart: false,
  autoStartPolicy: "manual-only",
  specificity: "generic",
  steps: Object.freeze([
    Object.freeze({
      id: "read-and-explore",
      titleKey: "guide.generic.title",
      bodyKey: "guide.generic.reading"
    })
  ])
});

export const REUSABLE_QUIZ_GUIDE_FLOW = Object.freeze({
  id: "reusable.quiz",
  autoStart: false,
  autoStartPolicy: "manual-only",
  specificity: "reusable",
  steps: Object.freeze([
    Object.freeze({
      id: "quiz",
      titleKey: "guide.reusable.quiz.title",
      bodyKey: "guide.reusable.quiz.body",
      targetId: "lesson-quiz",
      interactive: true
    })
  ])
});

export const HOME_GUIDE_FLOW = Object.freeze({
  id: "home.onboarding",
  autoStart: true,
  steps: Object.freeze([
    Object.freeze({
      id: "welcome",
      titleKey: "guide.home.titles.welcome",
      bodyKey: "guide.home.welcome",
      targetId: "home-hero"
    }),
    Object.freeze({
      id: "lessons",
      titleKey: "guide.home.titles.lessons",
      bodyKey: "guide.home.lessons",
      targetId: "home-lessons"
    }),
    Object.freeze({
      id: "language",
      titleKey: "guide.home.titles.language",
      bodyKey: "guide.home.language",
      targetId: "home-language-selector",
      interactive: true
    }),
    Object.freeze({
      id: "profile",
      titleKey: "guide.home.titles.profile",
      bodyKey: "guide.home.profile",
      targetId: "home-profile",
      interactive: true
    }),
    Object.freeze({
      id: "final-challenge",
      titleKey: "guide.home.titles.finalChallenge",
      bodyKey: "guide.home.finalChallenge",
      targetId: "home-final-challenge",
      interactive: true
    }),
    Object.freeze({
      id: "final-advisory",
      titleKey: "guide.home.titles.finalAdvisory",
      bodyKey: "guide.home.finalAdvisory",
      targetId: "home-final-advisory",
      interactive: true,
      handoffOnly: true
    })
  ])
});

export const LESSON_1_INTRO_GUIDE_FLOW = Object.freeze({
  id: "lesson1.intro",
  autoStart: true,
  steps: Object.freeze([
    Object.freeze({
      id: "learning-area",
      titleKey: "guide.lesson1.intro.title",
      bodyKey: "guide.lesson1.intro.body",
      targetId: "lesson1-learning-area"
    })
  ])
});

export const LESSON_1_PLAYGROUND_GUIDE_FLOW = Object.freeze({
  id: "lesson1.playground",
  autoStart: true,
  steps: Object.freeze([
    Object.freeze({
      id: "examples",
      titleKey: "guide.lesson1.playground.examples.title",
      bodyKey: "guide.lesson1.playground.examples.body",
      targetId: "lesson1-examples",
      interactive: true
    }),
    Object.freeze({
      id: "custom-input",
      titleKey: "guide.lesson1.playground.input.title",
      bodyKey: "guide.lesson1.playground.input.body",
      targetId: "m1-token-input",
      interactive: true
    }),
    Object.freeze({
      id: "tokenize",
      titleKey: "guide.lesson1.playground.tokenize.title",
      bodyKey: "guide.lesson1.playground.tokenize.body",
      targetId: "m1-tokenize",
      interactive: true
    })
  ])
});

export const LESSON_1_PLAYGROUND_RESULT_GUIDE_FLOW = Object.freeze({
  id: "lesson1.playground-result",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({
      id: "token-result",
      titleKey: "guide.lesson1.result.tokens.title",
      bodyKey: "guide.lesson1.result.tokens.body",
      targetId: "m1-token-result"
    }),
    Object.freeze({
      id: "technical-details",
      titleKey: "guide.lesson1.result.technical.title",
      bodyKey: "guide.lesson1.result.technical.body",
      targetId: "lesson1-technical-details",
      interactive: true
    })
  ])
});

export const LESSON_1_QUIZ_GUIDE_FLOW = Object.freeze({
  id: "lesson1.quiz",
  autoStart: true,
  steps: Object.freeze([
    Object.freeze({
      id: "quiz-area",
      titleKey: "guide.lesson1.quiz.area.title",
      bodyKey: "guide.lesson1.quiz.area.body",
      targetId: "lesson1-quiz",
      interactive: true
    }),
    Object.freeze({
      id: "check-answer",
      titleKey: "guide.lesson1.quiz.check.title",
      bodyKey: "guide.lesson1.quiz.check.body",
      targetId: "lesson1-quiz-check",
      interactive: true
    }),
    Object.freeze({
      id: "skip-quiz",
      titleKey: "guide.lesson1.quiz.skip.title",
      bodyKey: "guide.lesson1.quiz.skip.body",
      targetId: "lesson1-quiz-skip",
      interactive: true
    })
  ])
});

export const LESSON_1_SUMMARY_GUIDE_FLOW = Object.freeze({
  id: "lesson1.summary",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({
      id: "summary",
      titleKey: "guide.lesson1.summary.title",
      bodyKey: "guide.lesson1.summary.body"
    })
  ])
});

export const LESSON_2_WARMUP_GUIDE_FLOW = Object.freeze({
  id: "lesson2-warmup",
  autoStart: true,
  steps: Object.freeze([
    Object.freeze({
      id: "think-about-it",
      titleKey: "guide.lesson2.warmup.title",
      bodyKey: "guide.lesson2.warmup.body",
      targetId: "lesson2-think-about-it",
      interactive: true
    })
  ])
});

export const LESSON_2_CONTEXT_WINDOW_GUIDE_FLOW = Object.freeze({
  id: "lesson2-context-window",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "context-window", titleKey: "guide.lesson2.contextWindow.title", bodyKey: "guide.lesson2.contextWindow.body" })
  ])
});

export const LESSON_2_CONTEXT_COMPARISON_GUIDE_FLOW = Object.freeze({
  id: "lesson2-context-comparison",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "compare-contexts", titleKey: "guide.lesson2.contextComparison.title", bodyKey: "guide.lesson2.contextComparison.body" })
  ])
});

export const LESSON_2_CONTEXT_LIMIT_GUIDE_FLOW = Object.freeze({
  id: "lesson2-context-limit",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "inside-or-outside", titleKey: "guide.lesson2.contextLimit.title", bodyKey: "guide.lesson2.contextLimit.body" })
  ])
});

export const LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW = Object.freeze({
  id: "lesson2-context-playground",
  autoStart: true,
  steps: Object.freeze([
    Object.freeze({
      id: "drag-window",
      titleKey: "guide.lesson2.playground.drag.title",
      bodyKey: "guide.lesson2.playground.drag.body",
      targetId: "lesson2-context-window-drag",
      spotlightPadding: Object.freeze({ top: 52, right: 24, bottom: 10, left: 10 }),
      interactive: true
    }),
    Object.freeze({
      id: "controls",
      titleKey: "guide.lesson2.playground.controls.title",
      bodyKey: "guide.lesson2.playground.controls.body",
      targetId: "lesson2-context-controls",
      interactive: true
    }),
    Object.freeze({
      id: "window-size",
      titleKey: "guide.lesson2.playground.size.title",
      bodyKey: "guide.lesson2.playground.size.body",
      targetId: "lesson2-context-size",
      interactive: true
    }),
    Object.freeze({
      id: "result",
      titleKey: "guide.lesson2.playground.result.title",
      bodyKey: "guide.lesson2.playground.result.body",
      targetId: "lesson2-context-result"
    })
  ])
});

export const LESSON_2_QUIZ_GUIDE_FLOW = REUSABLE_QUIZ_GUIDE_FLOW;

export const LESSON_2_SUMMARY_GUIDE_FLOW = Object.freeze({
  id: "lesson2-summary",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "summary", titleKey: "guide.lesson2.summary.title", bodyKey: "guide.lesson2.summary.body" })
  ])
});

export const LESSON_3_INTRO_GUIDE_FLOW = Object.freeze({
  id: "lesson3-intro",
  autoStart: true,
  steps: Object.freeze([
    Object.freeze({
      id: "connections-overview",
      titleKey: "guide.lesson3.intro.title",
      bodyKey: "guide.lesson3.intro.body"
    }),
    Object.freeze({
      id: "keywords",
      titleKey: "guide.lesson3.keywords.title",
      bodyKey: "guide.lesson3.keywords.body",
      targetId: "lesson3-keywords",
      interactive: true
    })
  ])
});

export const LESSON_3_CONTRIBUTIONS_GUIDE_FLOW = Object.freeze({
  id: "lesson3-contributions",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "contributions", titleKey: "guide.lesson3.contributions.title", bodyKey: "guide.lesson3.contributions.body" })
  ])
});

export const LESSON_3_REPRESENTATION_GUIDE_FLOW = Object.freeze({
  id: "lesson3-representation",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "contextual-representation", titleKey: "guide.lesson3.representation.title", bodyKey: "guide.lesson3.representation.body" })
  ])
});

export const LESSON_3_POSITION_GUIDE_FLOW = Object.freeze({
  id: "lesson3-position",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "position", titleKey: "guide.lesson3.position.title", bodyKey: "guide.lesson3.position.body" })
  ])
});

export const LESSON_3_PLAYGROUND_GUIDE_FLOW = Object.freeze({
  id: "lesson3-playground",
  autoStart: true,
  steps: Object.freeze([
    Object.freeze({
      id: "sentence-selector",
      titleKey: "guide.lesson3.playground.sentence.title",
      bodyKey: "guide.lesson3.playground.sentence.body",
      targetId: "lesson3-sentence-selector",
      interactive: true
    }),
    Object.freeze({
      id: "focus-tokens",
      titleKey: "guide.lesson3.playground.focus.title",
      bodyKey: "guide.lesson3.playground.focus.body",
      targetId: "lesson3-focus-tokens",
      interactive: true
    }),
    Object.freeze({
      id: "connections",
      titleKey: "guide.lesson3.playground.connections.title",
      bodyKey: "guide.lesson3.playground.connections.body",
      targetId: "lesson3-connections",
      interactive: true
    }),
    Object.freeze({
      id: "own-sentence",
      titleKey: "guide.lesson3.playground.ownSentence.title",
      bodyKey: "guide.lesson3.playground.ownSentence.body",
      targetId: "lesson3-own-sentence",
      interactive: true
    })
  ])
});

export const LESSON_3_QUIZ_GUIDE_FLOW = REUSABLE_QUIZ_GUIDE_FLOW;

export const LESSON_3_SUMMARY_GUIDE_FLOW = Object.freeze({
  id: "lesson3-summary",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "summary", titleKey: "guide.lesson3.summary.title", bodyKey: "guide.lesson3.summary.body" })
  ])
});

export const LESSON_4_POSSIBILITIES_GUIDE_FLOW = Object.freeze({
  id: "lesson4-possibilities",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({
      id: "possible-next-tokens",
      titleKey: "guide.lesson4.possibilities.title",
      bodyKey: "guide.lesson4.possibilities.body"
    }),
    Object.freeze({
      id: "technical-words",
      titleKey: "guide.lesson4.technicalWords.title",
      bodyKey: "guide.lesson4.technicalWords.body",
      targetId: "lesson4-technical-word",
      interactive: true
    })
  ])
});

export const LESSON_4_SCORES_GUIDE_FLOW = Object.freeze({
  id: "lesson4-scores",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "scores", titleKey: "guide.lesson4.scores.title", bodyKey: "guide.lesson4.scores.body" })
  ])
});

export const LESSON_4_PROBABILITIES_GUIDE_FLOW = Object.freeze({
  id: "lesson4-probabilities",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "probabilities", titleKey: "guide.lesson4.probabilities.title", bodyKey: "guide.lesson4.probabilities.body" })
  ])
});

export const LESSON_4_LIVE_GUIDE_FLOW = Object.freeze({
  id: "lesson4-live",
  autoStart: true,
  autoStartStepIndex: 2,
  steps: Object.freeze([
    Object.freeze({ id: "preset-examples", titleKey: "guide.lesson4.live.presets.title", bodyKey: "guide.lesson4.live.presets.body", targetId: "lesson4-preset-examples", interactive: true }),
    Object.freeze({ id: "custom-input", titleKey: "guide.lesson4.live.input.title", bodyKey: "guide.lesson4.live.input.body", targetId: "lesson4-input", interactive: true }),
    Object.freeze({ id: "character-limit", titleKey: "guide.lesson4.live.counter.title", bodyKey: "guide.lesson4.live.counter.body", targetId: "lesson4-character-counter", spotlightPadding: Object.freeze({ top: 38, right: 10, bottom: 10, left: 10 }) }),
    Object.freeze({ id: "run", titleKey: "guide.lesson4.live.run.title", bodyKey: "guide.lesson4.live.run.body", targetId: "lesson4-run", interactive: true }),
    Object.freeze({ id: "generation-mode", titleKey: "guide.lesson4.live.mode.title", bodyKey: "guide.lesson4.live.mode.body", targetId: "lesson4-generation-mode", interactive: true }),
    Object.freeze({ id: "max-tokens", titleKey: "guide.lesson4.live.maxTokens.title", bodyKey: "guide.lesson4.live.maxTokens.body", targetId: "lesson4-max-tokens", interactive: true }),
    Object.freeze({ id: "temperature", titleKey: "guide.lesson4.live.temperature.title", bodyKey: "guide.lesson4.live.temperature.body", targetId: "lesson4-temperature", interactive: true })
  ])
});

export const LESSON_4_HISTORY_GUIDE_FLOW = Object.freeze({
  id: "lesson4-history",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "history", titleKey: "guide.lesson4.history.title", bodyKey: "guide.lesson4.history.body", targetId: "lesson4-history", interactive: true }),
    Object.freeze({ id: "history-navigation", titleKey: "guide.lesson4.history.navigationTitle", bodyKey: "guide.lesson4.history.navigationBody", targetId: "lesson4-history-navigation", interactive: true })
  ])
});

export const LESSON_4_QUIZ_GUIDE_FLOW = REUSABLE_QUIZ_GUIDE_FLOW;

export const LESSON_4_SUMMARY_GUIDE_FLOW = Object.freeze({
  id: "lesson4-summary",
  autoStart: false,
  steps: Object.freeze([
    Object.freeze({ id: "summary", titleKey: "guide.lesson4.summary.title", bodyKey: "guide.lesson4.summary.body" })
  ])
});

export const LESSON_5_TRAINING_FIRST_GUIDE_FLOW = Object.freeze({
  id: "lesson5-training-first",
  autoStart: true,
  autoStartPolicy: "first-encounter",
  specificity: "page",
  steps: Object.freeze([
    Object.freeze({
      id: "training-before-use",
      titleKey: "guide.lesson5.trainingFirst.title",
      bodyKey: "guide.lesson5.trainingFirst.body",
      targetId: "lesson5-training-before-use"
    })
  ])
});

export const LESSON_5_PATTERNS_GUIDE_FLOW = Object.freeze({
  id: "lesson5-patterns",
  autoStart: false,
  autoStartPolicy: "manual-only",
  specificity: "helper",
  steps: Object.freeze([
    Object.freeze({ id: "patterns", titleKey: "guide.lesson5.patterns.title", bodyKey: "guide.lesson5.patterns.body", targetId: "lesson5-patterns" })
  ])
});

export const LESSON_5_REPEATED_EXAMPLES_GUIDE_FLOW = Object.freeze({
  id: "lesson5-repeated-examples",
  autoStart: false,
  autoStartPolicy: "manual-only",
  specificity: "helper",
  steps: Object.freeze([
    Object.freeze({ id: "repeated-examples", titleKey: "guide.lesson5.repeatedExamples.title", bodyKey: "guide.lesson5.repeatedExamples.body", targetId: "lesson5-repeated-examples" })
  ])
});

export const LESSON_5_PARAMETERS_GUIDE_FLOW = Object.freeze({
  id: "lesson5-parameters",
  autoStart: false,
  autoStartPolicy: "manual-only",
  specificity: "helper",
  steps: Object.freeze([
    Object.freeze({ id: "parameters", titleKey: "guide.lesson5.parameters.title", bodyKey: "guide.lesson5.parameters.body", targetId: "lesson5-parameters" })
  ])
});

export const LESSON_5_TOY_MODEL_GUIDE_FLOW = Object.freeze({
  id: "lesson5-toy-model",
  autoStart: true,
  autoStartPolicy: "first-encounter",
  specificity: "page",
  steps: Object.freeze([
    Object.freeze({ id: "training-examples", titleKey: "guide.lesson5.toyModel.examples.title", bodyKey: "guide.lesson5.toyModel.examples.body", targetId: "lesson5-toy-training-examples", interactive: true }),
    Object.freeze({ id: "add-example", titleKey: "guide.lesson5.toyModel.add.title", bodyKey: "guide.lesson5.toyModel.add.body", targetId: "lesson5-toy-add-example", interactive: true }),
    Object.freeze({ id: "test-sentence", titleKey: "guide.lesson5.toyModel.test.title", bodyKey: "guide.lesson5.toyModel.test.body", targetId: "lesson5-toy-test-sentence" }),
    Object.freeze({ id: "current-prediction", titleKey: "guide.lesson5.toyModel.prediction.title", bodyKey: "guide.lesson5.toyModel.prediction.body", targetId: "lesson5-toy-prediction" })
  ])
});

export const LESSON_5_CHANGE_GUIDE_FLOW = Object.freeze({
  id: "lesson5-toy-change",
  autoStart: false,
  autoStartPolicy: "event",
  specificity: "page",
  steps: Object.freeze([
    Object.freeze({ id: "compare-change", titleKey: "guide.lesson5.toyModel.change.title", bodyKey: "guide.lesson5.toyModel.change.body", targetId: "lesson5-toy-change" })
  ])
});

export const LESSON_5_BRIDGE_GUIDE_FLOW = Object.freeze({
  id: "lesson5-response-bridge",
  autoStart: true,
  autoStartPolicy: "first-encounter",
  specificity: "page",
  steps: Object.freeze([
    Object.freeze({ id: "response-loop", titleKey: "guide.lesson5.bridge.title", bodyKey: "guide.lesson5.bridge.body", targetId: "lesson5-response-loop" })
  ])
});

export const LESSON_5_SUMMARY_GUIDE_FLOW = Object.freeze({
  id: "lesson5-summary",
  autoStart: false,
  autoStartPolicy: "manual-only",
  specificity: "helper",
  steps: Object.freeze([
    Object.freeze({ id: "summary", titleKey: "guide.lesson5.summary.title", bodyKey: "guide.lesson5.summary.body" })
  ])
});

export const LESSON_5_QUIZ_GUIDE_FLOW = REUSABLE_QUIZ_GUIDE_FLOW;

function pageSpecificGuide(flow) {
  return Object.freeze({ pageSpecificGuide: flow });
}

function pageSpecificHelper(flow) {
  return Object.freeze({ pageSpecificHelper: flow });
}

function reusableInteraction(...keys) {
  return Object.freeze({ reusableInteractions: Object.freeze(keys) });
}

export const guideFlows = Object.freeze({
  home: HOME_GUIDE_FLOW,
  reusable: Object.freeze({
    quiz: REUSABLE_QUIZ_GUIDE_FLOW
  }),
  lessons: Object.freeze({
    1: Object.freeze({
      pages: Object.freeze({
        1: pageSpecificGuide(LESSON_1_INTRO_GUIDE_FLOW),
        4: pageSpecificGuide(LESSON_1_PLAYGROUND_GUIDE_FLOW),
        5: pageSpecificGuide(LESSON_1_QUIZ_GUIDE_FLOW),
        6: pageSpecificHelper(LESSON_1_SUMMARY_GUIDE_FLOW)
      }),
      fallback: GENERIC_GUIDE_FLOW
    }),
    2: Object.freeze({
      pages: Object.freeze({
        1: pageSpecificGuide(LESSON_2_WARMUP_GUIDE_FLOW),
        2: pageSpecificHelper(LESSON_2_CONTEXT_WINDOW_GUIDE_FLOW),
        3: pageSpecificHelper(LESSON_2_CONTEXT_COMPARISON_GUIDE_FLOW),
        4: pageSpecificHelper(LESSON_2_CONTEXT_LIMIT_GUIDE_FLOW),
        5: pageSpecificGuide(LESSON_2_CONTEXT_PLAYGROUND_GUIDE_FLOW),
        6: reusableInteraction("quiz"),
        7: pageSpecificHelper(LESSON_2_SUMMARY_GUIDE_FLOW)
      }),
      fallback: GENERIC_GUIDE_FLOW
    }),
    3: Object.freeze({
      pages: Object.freeze({
        1: pageSpecificGuide(LESSON_3_INTRO_GUIDE_FLOW),
        2: pageSpecificHelper(LESSON_3_CONTRIBUTIONS_GUIDE_FLOW),
        3: pageSpecificHelper(LESSON_3_REPRESENTATION_GUIDE_FLOW),
        4: pageSpecificHelper(LESSON_3_POSITION_GUIDE_FLOW),
        5: pageSpecificGuide(LESSON_3_PLAYGROUND_GUIDE_FLOW),
        6: reusableInteraction("quiz"),
        7: pageSpecificHelper(LESSON_3_SUMMARY_GUIDE_FLOW)
      }),
      fallback: GENERIC_GUIDE_FLOW
    }),
    4: Object.freeze({
      pages: Object.freeze({
        1: pageSpecificHelper(LESSON_4_POSSIBILITIES_GUIDE_FLOW),
        2: pageSpecificHelper(LESSON_4_SCORES_GUIDE_FLOW),
        3: pageSpecificHelper(LESSON_4_PROBABILITIES_GUIDE_FLOW),
        4: pageSpecificGuide(LESSON_4_LIVE_GUIDE_FLOW),
        5: reusableInteraction("quiz"),
        6: pageSpecificHelper(LESSON_4_SUMMARY_GUIDE_FLOW)
      }),
      fallback: GENERIC_GUIDE_FLOW
    }),
    5: Object.freeze({
      pages: Object.freeze({
        1: pageSpecificGuide(LESSON_5_TRAINING_FIRST_GUIDE_FLOW),
        2: pageSpecificHelper(LESSON_5_PATTERNS_GUIDE_FLOW),
        3: pageSpecificHelper(LESSON_5_REPEATED_EXAMPLES_GUIDE_FLOW),
        4: pageSpecificHelper(LESSON_5_PARAMETERS_GUIDE_FLOW),
        5: pageSpecificGuide(LESSON_5_TOY_MODEL_GUIDE_FLOW),
        6: pageSpecificGuide(LESSON_5_BRIDGE_GUIDE_FLOW),
        7: reusableInteraction("quiz"),
        8: pageSpecificHelper(LESSON_5_SUMMARY_GUIDE_FLOW)
      }),
      fallback: GENERIC_GUIDE_FLOW
    })
  }),
  auxiliary: Object.freeze([
    LESSON_1_PLAYGROUND_RESULT_GUIDE_FLOW,
    LESSON_4_HISTORY_GUIDE_FLOW,
    LESSON_5_CHANGE_GUIDE_FLOW
  ])
});

const LESSON_ROUTES = Object.freeze({
  "/mission/1-tokenisation-paged": 1,
  "/mission/2-prediction-paged": 2,
  "/mission/3-hallucination-paged": 3,
  "/mission/4-training-data-paged": 4,
  "/mission/5-bias-paged": 5
});

function normalisePage(value) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function readGuideLocation({ pathname, search } = {}) {
  const safePathname = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/dashboard");
  const safeSearch = search ?? (typeof window !== "undefined" ? window.location.search : "");
  const route = safePathname === "/" ? "/dashboard" : safePathname;
  const lesson = LESSON_ROUTES[route] ?? null;
  const page = lesson ? normalisePage(new URLSearchParams(safeSearch).get("page")) : null;
  return Object.freeze({ route, lesson, page, key: lesson ? `lesson${lesson}.page${page}` : route === "/dashboard" ? "home" : route });
}

function isGuideFlow(value) {
  return Boolean(value?.id && Array.isArray(value?.steps));
}

function resolvePageSource(flows, lessonFlow, pageEntry, includeGeneric) {
  if (isGuideFlow(pageEntry)) return pageEntry;
  if (pageEntry?.pageSpecificGuide) return pageEntry.pageSpecificGuide;
  if (pageEntry?.pageSpecificHelper) return pageEntry.pageSpecificHelper;
  const reusableKey = pageEntry?.reusableInteractions?.find((key) => flows?.reusable?.[key]);
  if (reusableKey) return flows.reusable[reusableKey];
  return lessonFlow?.fallback ?? (includeGeneric ? GENERIC_GUIDE_FLOW : null);
}

function permitsTrigger(flow, trigger) {
  if (!flow) return false;
  if (trigger === "manual") return true;
  return flow.autoStartPolicy === "first-encounter" || flow.autoStart === true;
}

export function resolveGuideForPage({ flows = guideFlows, location, trigger = "manual", includeGeneric = true } = {}) {
  let resolved = null;
  if (!location) resolved = includeGeneric ? GENERIC_GUIDE_FLOW : null;
  else if (location.key === "home") resolved = flows?.home ?? (includeGeneric ? GENERIC_GUIDE_FLOW : null);
  else if (location.lesson) {
    const lessonFlow = flows?.lessons?.[location.lesson];
    resolved = resolvePageSource(flows, lessonFlow, lessonFlow?.pages?.[location.page], includeGeneric);
  } else resolved = flows?.routes?.[location.route] ?? (includeGeneric ? GENERIC_GUIDE_FLOW : null);
  return permitsTrigger(resolved, trigger) ? resolved : null;
}

export function resolveGuideFlow(flows, location, options = {}) {
  return resolveGuideForPage({ flows, location, trigger: options.trigger ?? "manual", includeGeneric: options.includeGeneric ?? true });
}

export function listGuideFlows(flows = guideFlows, { includeGeneric = true } = {}) {
  const found = [];
  if (flows.home) found.push(flows.home);
  Object.values(flows.lessons ?? {}).forEach((lesson) => {
    Object.values(lesson.pages ?? {}).forEach((entry) => {
      if (isGuideFlow(entry)) found.push(entry);
      if (entry?.pageSpecificGuide) found.push(entry.pageSpecificGuide);
      if (entry?.pageSpecificHelper) found.push(entry.pageSpecificHelper);
      entry?.reusableInteractions?.forEach((key) => flows?.reusable?.[key] && found.push(flows.reusable[key]));
    });
    if (lesson.fallback) found.push(lesson.fallback);
  });
  Object.values(flows.reusable ?? {}).forEach((flow) => flow && found.push(flow));
  Object.values(flows.routes ?? {}).forEach((flow) => flow && found.push(flow));
  Object.values(flows.auxiliary ?? {}).forEach((flow) => flow && found.push(flow));
  if (includeGeneric) found.push(GENERIC_GUIDE_FLOW);
  return found;
}

export function findGuideFlow(flowId, flows = guideFlows) {
  return listGuideFlows(flows).find((flow) => flow.id === flowId) ?? null;
}
