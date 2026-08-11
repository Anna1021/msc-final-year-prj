# Lesson 5 Structural Audit and Real Training-Step Demonstration

## Page-count audit

All displayed totals, progress dots, URL parsing, Back/Next behavior, final-page
detection and completion checks now use the canonical page registries.

| Lesson | Canonical registry | Actual pages | Displayed total |
|---|---|---:|---:|
| 1 — Tokenisation | `MISSION_1_PAGED_PAGES.length` | 7 | 7 |
| 2 — Reading Context | `MISSION_2_PAGED_PAGES.length` | 6 | 6 |
| 3 — Connecting the Tokens | `LESSON_3_PAGES.length` | 6 | 6 |
| 4 — Predicting the Next Token | `LESSON_4_PAGES.length` | 4 | 4 |
| 5 — How the Model Learns to Predict | `LESSON_5_PAGES.length` | 4 | 4 |

Lesson 5 previously displayed a stale six-page total after the official lesson
was reduced to four pages. The fix does not introduce a separate `TOTAL_PAGES =
4`; `Lesson5Paged` derives `pageCount` from `LESSON_5_PAGES.length`, and the
curriculum metadata contains the same four canonical page entries.

Direct `?page=` parsing accepts only values inside the current registry. The
shell creates its progress dots from the same count, Next changes to the onward
action on the actual last page, and genuine Lesson completion still requires the
required activities plus a visit to that registry's last page.

## Duplicate-title audit

The shared shell and the newer page bodies could both render the same title and
subtitle. Lessons 3–5 already treated the page-local heading as canonical. The
same contract is now applied to Lessons 1–2: the duplicate shell hero is hidden
while the numbered page heading, teaching subtitle and activity remain intact.

Lesson 5 Page 2 therefore has one primary hierarchy only:

- Lesson 5 of 5;
- How does the model improve a prediction?;
- A correction signal nudges many adjustable numbers by tiny amounts.

## Technical Word behavior

Existing Technical Word explanations in Lessons 1–5 are visible by default.
They remain optional to collapse and do not block any activity.

- Lesson 1 tokenizer details and numerical-representation definition start open.
- Lesson 2 `Context window` is now an open, collapsible Technical Word panel.
- Lessons 3, 4 and 5 side-rail Technical Word panels start open.
- Each disclosure uses the full summary/header as the interactive target,
  exposes `aria-expanded` and `aria-controls`, supports native keyboard
  activation, has a visible focus style, and rotates its chevron when open.
- Desktop Lessons 3–5 keep `Key ideas` above `Technical word` in the sticky side
  rail. Their existing responsive rules move that rail below the main activity.

## Lesson 5 Page 2: real optimisation demonstration

Page 2 is a small, deterministic, genuinely trainable teaching model. It is not
Qwen training and it loads no model weights, network API or ML framework.

### Mathematical state

- candidates: `ball`, `stick`, `cat`, `moon`;
- target: `ball`;
- parameters: four logits initialised from `[0.35, 0.28, 0.20, 0.17]`;
- probabilities: numerically stable softmax of the current logits;
- loss: cross-entropy for the target Token;
- gradient: `probability - oneHotTarget`;
- update: one deterministic SGD step with learning rate `0.18`.

No probability is incremented directly and there is no predefined per-step
probability table. `Run 5 steps` calls the same real update five consecutive
times. Training is capped at 20 visible steps to keep the experiment readable.

### Verified progression

| Step | ball | stick | cat | moon | Cross-entropy |
|---:|---:|---:|---:|---:|---:|
| 0 | 35.00% | 28.00% | 20.00% | 17.00% | 1.0498 |
| 1 | 38.67% | 26.17% | 18.96% | 16.20% | 0.9502 |
| 5 | 52.06% | 19.84% | 15.03% | 13.07% | 0.6528 |
| 10 | 64.49% | 14.32% | 11.25% | 9.93% | 0.4386 |
| 20 | 78.28% | 8.51% | 6.96% | 6.26% | 0.2449 |

Probabilities sum to one after every tested step. The target probability rises
and the cross-entropy/prediction gap falls over the tested sequence. Reset
recreates the exact initial logits and distribution.

### Learner-facing flow

The main canvas compares **Start** with **Now / Training step N** around a
central group of model controls. Each calculated update changes the current
probability bars, numeric deltas, Prediction Gap and the positions/angles of
multiple controls. The controls are explicitly described as a picture of many
adjustable numbers working together, not one word slot per control.

Controls:

- **Run one training step** — one softmax → cross-entropy → gradient → SGD update;
- **Run 5 steps** — five identical mathematical updates;
- **Reset training** — deterministic return to Step 0.

The first genuine update records the Page 2 activity once. Further updates do
not create duplicate completion events.

The learner-facing accuracy note says:

> REAL OPTIMISATION DEMO — calculated live with a tiny teaching model. Real
> language models use vastly more parameters. This is not Qwen training.

The primary visual uses the child-friendly `Prediction gap` label. The exact
cross-entropy value is secondary information in the Technical Word side rail,
not the main teaching task.

## Curriculum continuity

Lesson 4 remains the generation path:

`context → candidate scores → probabilities → select Token → repeat`

Lesson 5 explains where the scoring patterns came from:

`training text → predict → reveal real Token → compare → prediction gap → tiny
parameter updates → repeat across many examples`

The page says that the target Token becomes more likely for this training
example. It does not claim that one example teaches a fact, that one parameter
stores a word, or that generation retrains the model.

## Modified files for this phase

- `src/mission1/QwenTokenizerPlayground.jsx`
- `src/mission1/mission1Paged.css`
- `src/mission2/Mission2ContextPages.jsx`
- `src/mission2/mission2Paged.css`
- `src/mission5/Lesson5Paged.jsx`
- `src/mission5/Lesson5Pages.jsx`
- `src/mission5/lesson5TrainingMath.js`
- `src/mission5/lesson5Paged.css`
- `src/locales/{en,zh,fr,de}/mission2.json`
- `src/locales/{en,zh,fr,de}/mission5.json`
- `src/pagedMissions/missionCurriculumData.js`
- `scripts/test-lesson-structure.mjs`
- `scripts/test-mission5-paged.mjs`
- `package.json`
- `docs/lesson5-training-redesign-report.md`

The worktree already contained earlier uncommitted curriculum and Lesson 4
changes. They were preserved; this phase did not rewrite the Lesson 4 Live Model.

## Automated verification

Passed:

- `npm run test:lesson-structure` — registry counts `7 / 6 / 6 / 4 / 4`,
  registry-derived display totals, duplicate-title suppression and Technical
  Word defaults/accessibility;
- `npm run test:mission1-paged`;
- `npm run test:mission2-paged`;
- `npm run test:mission3-paged`;
- `npm run test:mission4-paged`;
- `npm run test:mission5-paged` — live softmax/cross-entropy/gradient updates,
  probability normalisation, convergence direction, deterministic reset, Run 5
  equivalence, responsive/reduced-motion rules, no network/model-weight
  dependency and idempotent completion;
- `npm run test:paged-navigation`;
- `npm run test:paged-missions`;
- `npm run test:curriculum`;
- `npm run test:tokenizer`;
- `npm run test:p13-acceptance`;
- `npm run test:p14-cleanup`;
- `npm run build` — production build and 25 SPA route fallbacks created;
- `git diff --check`.

Vite continues to report the pre-existing large-chunk advisory; it is a warning,
not a build error, and this phase did not change the deployment architecture.

## Browser verification

The in-app browser runtime exposed no controllable browser instance in this
environment. Visual behavior at desktop, 760 px and 375 px, translated overflow,
real pointer/keyboard interaction, focus order and the browser Console therefore
remain manual acceptance items. They are not falsely reported as browser-tested.

## Final implementation facts

| Check | Result |
|---|---|
| Uses real optimisation math | YES |
| Uses hard-coded probability sequence | NO |
| Uses Qwen training | NO |
| Softmax calculated live | YES |
| Cross-entropy calculated live | YES |
| Gradient update calculated live | YES |
| Reset deterministic | YES |
| Repeated steps supported | YES |

No commit or push was performed.
