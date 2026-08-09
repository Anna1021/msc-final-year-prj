# Phase P14 Report

## A. Legacy route inventory

| Old path | Old topic | Current status | Redirect target | Reason |
|---|---|---|---|---|
| `/mission/1-tokenisation` | Scrolling tokenisation lesson | Deprecated; renderer unreachable | `/mission/1-tokenisation-paged` | The official paged Lesson 1 covers the same concept. |
| `/mission/2-next-token` | Old next-token prediction lesson | Deprecated; renderer unreachable | `/mission/4-training-data-paged` | Its actual topic now belongs to official Lesson 4, not Lesson 2. |
| `/mission/3-hallucination` | Hallucination and verification | Deprecated; renderer unreachable | `/mission/3-hallucination-paged` | Lesson 3 now teaches helpful clues; the compatibility slug remains official but the old content does not. |
| `/mission/4-context` | Old prompt/context lesson | Deprecated; renderer unreachable | `/mission/2-prediction-paged` | Reading Context is now official Lesson 2. |
| `/mission/5-training-data` | Old training-data introduction | Deprecated; renderer unreachable | `/mission/5-bias-paged` | Learning from Training Examples is now official Lesson 5. |
| `/mission/5/get-training-data` | Old training step 1 | Deprecated; renderer unreachable | `/mission/5-bias-paged` | No exact page mapping is reliable, so the redirect starts at Lesson 5 Page 1. |
| `/mission/5/learn-patterns` | Old training step 2 | Deprecated; renderer unreachable | `/mission/5-bias-paged` | No exact page mapping is reliable, so the redirect starts at Lesson 5 Page 1. |
| `/mission/5/make-predictions` | Old training step 3 | Deprecated; renderer unreachable | `/mission/5-bias-paged` | No exact page mapping is reliable, so the redirect starts at Lesson 5 Page 1. |
| `/mission/6-bias` | Old bias lesson | Deprecated; renderer unreachable | `/mission/5-bias-paged` | Bias is not part of the official five-Lesson How-LLMs-work curriculum; Lesson 5 is the nearest current endpoint. |

All redirect targets are outside the redirect map, preventing loops. Old `page` and unrelated query parameters are removed; only `qa=1` is preserved. A direct request still receives the SPA fallback and React replaces the history entry with the canonical Page 1 URL.

## B. Official canonical routes

| Curriculum item | Canonical route | Pages |
|---|---|---:|
| Lesson 1 — Tokenisation | `/mission/1-tokenisation-paged` | 7 |
| Lesson 2 — Reading Context | `/mission/2-prediction-paged` | 6 |
| Lesson 3 — Finding Helpful Clues | `/mission/3-hallucination-paged` | 6 |
| Lesson 4 — Predicting the Next Token | `/mission/4-training-data-paged` | 6 |
| Lesson 5 — Learning from Training Examples | `/mission/5-bias-paged` | 6 |
| Final Challenge | `/final-challenge` | Direct entry |

The compatibility slugs containing `hallucination`, `training-data`, and `bias` are retained because changing them would break the approved official routes and stored links. They render only the current official curriculum.

## C. AI-literacy cleanup

- Old scrolling React components and some historical static HTML remain in source as reference/regression material.
- The App no longer contains renderer branches for any deprecated route, so those components cannot be reached through learner-facing React routes.
- All nine deprecated aliases redirect to current paged Lessons.
- No old hallucination, verification, responsible-AI, fairness, or bias lesson is reachable from a learner URL.
- SPA fallbacks intentionally remain for deprecated paths so a direct load can reach React and be canonicalised instead of returning 404.

## D. Access vs completion

- All five Lessons are directly available without completing another Lesson.
- Back and Next remain free page navigation; activity evidence does not disable Next.
- Final Challenge remains directly available and has no curriculum-level access guard.
- Visiting a Lesson/page and completing a required activity remain separate states.
- A legacy redirect writes neither progress nor visited/completion state.
- Directly opening a summary page does not create the missing required activity evidence and therefore cannot complete a Lesson by itself.

## E. Lesson 2 Page 3 repair

Previous logic called `onComplete()` after every `Add token` action, regardless of whether the finite Context Window had moved.

The new logic calculates the window start before and after the token is added. Required evidence is recorded only when the new start index is greater than the previous start index. This ties completion to the actual teaching event: an older token leaving the fixed-size visible window. It does not require the full animation and does not lock Next.

Test evidence:

- `didContextWindowShift(4, 5, 5) === false`
- `didContextWindowShift(5, 6, 5) === true`
- `test:p14-cleanup` verifies that Page 3 calls completion only through this predicate.

## F. Accessibility

The audited official selectors in Lessons 3, 4, and 5 were ordinary mutually exclusive button choices, not tab interfaces with associated tab panels. They now use:

- `role="group"` on the labelled container;
- native `button type="button"` controls;
- `aria-pressed` for selected state;
- the existing visible selected styling, updated to match `aria-pressed`.

Real AI Lab tab interfaces with associated panels were outside scope and remain unchanged. One obsolete, unmounted prediction prototype still contains legacy tab markup; it is not part of any official route.

## G. Partial-state refresh audit

Current incomplete-Lesson state is component-local:

- display state: selected examples, animation/reveal position, open comparisons;
- learner input: choices, token arrangements, selected candidates;
- required evidence: each Lesson wrapper's in-memory `activities` set;
- page visit/recommendation state: in-memory `visitedPages` and `continuedPages` sets.

Refreshing an unfinished Lesson resets these local states. Genuine completed Lesson state already written to `aiExplorerProgress` remains compatible and survives refresh.

UX risk: a learner refreshing near the summary may need to repeat required activities. Future persistence could improve continuity, but it should use a separate, versioned draft-state store and must not conflate partial evidence with official completion.

This phase did not add persistence because the requested scope was audit-first and a safe design needs decisions about expiry, migration, and reset behavior.

## H. Final Challenge regression

- Direct route access remains available.
- No five-Lesson hard lock was added.
- The current How-LLMs-work room content remains in place.
- Six rooms and six distinct crystals remain: token, numbers, context, connections, prediction, and training.
- The final exit still requires placing the crystals, building the generation path, and building the separate training loop.
- No old hallucination, verification, fairness, or bias room was reintroduced.

## I. Modified files

Phase P14 changes:

- `src/utils/legacyLessonRoutes.js`
- `src/main.jsx`
- `src/tokenLab/TokenLabPage.jsx`
- `src/mission1/Mission1PagedPrototype.jsx`
- `src/mission1/Mission1PagedFinalPages.jsx`
- `src/mission2/Mission2ContextPages.jsx`
- `src/mission2/contextWindowProgress.js`
- `src/mission3/Lesson3Pages.jsx`
- `src/mission3/lesson3Paged.css`
- `src/mission4/Lesson4Pages.jsx`
- `src/mission4/lesson4Paged.css`
- `src/mission5/Lesson5Pages.jsx`
- `src/locales/{en,zh,fr,de}/navigation.json`
- `src/locales/{en,zh,fr,de}/missions.json`
- `scripts/test-p14-cleanup.mjs`
- `scripts/test-mission1-paged.mjs`
- `scripts/test-mission3-paged.mjs`
- `scripts/test-mission4-paged.mjs`
- `scripts/test-mission5-paged.mjs`
- `scripts/test-token-lab.mjs`
- `package.json`
- `docs/phase-p14-report.md`

The worktree also contained earlier P13 curriculum-audit edits before this phase. They were preserved and not reverted.

## J. Tests

| Command | Result |
|---|---|
| `npm run test:mission1` | PASS |
| `npm run test:mission1-paged` | PASS |
| `npm run test:mission2-paged` | PASS |
| `npm run test:mission3-paged` | PASS |
| `npm run test:mission4-paged` | PASS |
| `npm run test:mission5-paged` | PASS |
| `npm run test:paged-navigation` | PASS |
| `npm run test:paged-missions` | PASS |
| `npm run test:curriculum` | PASS |
| `npm run test:tokenizer` | PASS |
| `npm run test:token-lab` | PASS |
| `npm run test:p13-acceptance` | PASS |
| `npm run test:p14-final-challenge` | PASS |
| `npm run test:p14-cleanup` | PASS — 20 P14 requirements |
| `npm run build` | PASS — 25 SPA fallbacks created |
| `git diff --check` | PASS |

The first regression run exposed four stale tests: one required the old scrolling Lesson 1 to remain reachable and three required ordinary choice buttons to use fake tab semantics. Those assertions were updated to the new approved routing and accessibility contracts, then passed.

## K. Browser acceptance

Source/test verified:

- canonical mappings and no redirect loops;
- no legacy renderer branches;
- Page 1 and final-page direct-load fallbacks for all official Lessons;
- Final Challenge and representative legacy fallbacks return HTTP 200 from the production preview;
- build, page counts, invalid-page parsing, completion compatibility, and six-crystal data.

Real browser verified: none in this environment.

**Browser visual acceptance NOT completed.** The browser control reported that no browser was available, so desktop/mobile layout, console, keyboard focus order, Back/Forward, translated overflow, and live address-bar redirects were not falsely claimed as manually verified.

## L. Remaining issues

### High

- None found by source and automated regression checks.

### Medium

- Unfinished per-page activity evidence is intentionally in memory and is lost on refresh. This can require repeated work before a Lesson can be genuinely completed.
- Real browser acceptance at 1440, 1180, 980, 760, 520, and 375 px remains outstanding because no controllable browser was available.

### Low

- Historical components/static references remain in the repository. They are unreachable but increase maintenance/search noise.
- Official compatibility slugs still contain obsolete topic words (`hallucination`, `bias`, `training-data`); preserving these routes was an explicit compatibility requirement.
- Some internal identifiers and CSS class names still use `mission`. Learner-facing overview/navigation language is now `Lesson`; internal schema names were deliberately not migrated.
- Vite reports a pre-existing bundle-size warning for the main JavaScript chunk; this phase did not change deployment architecture or code splitting.

## Final self-check

1. Can any learner-facing URL still expose the obsolete hallucination/bias/verification curriculum? **No, by route/source tests; live browser not available.**
2. Can every official Lesson be opened directly without completing another Lesson? **Yes, by access functions, route branches, fallbacks, and HTTP preview checks.**
3. Can Final Challenge be opened directly? **Yes.**
4. Can a learner visit any page without accidentally completing a Lesson? **Yes, by state-flow/source tests; redirects explicitly avoid visited writes.**
5. Does Lesson 2 Page 3 now require the first actual Context Window shift? **Yes.**
6. Did this phase modify any curriculum concept unnecessarily? **No.**
7. Did this phase preserve the five-Lesson How-LLMs-work causal chain? **Yes.**
8. Did this phase preserve current progress migration? **Yes; `curriculumVersion` remains 2 and IDs remain 1, 2, 3, 5, 6.**
9. Did this phase accidentally alter Escape Room six-crystal logic? **No.**
10. Has real browser acceptance actually been performed? **No — source, automated tests, build, and HTTP preview only.**
