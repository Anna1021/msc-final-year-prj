# Lesson 4 — Live Next Token Lab Implementation Report

## Outcome

Lesson 4 now uses the four-page rhythm **Explain → Compare → Experiment → Check**.
Page 3 no longer asks a learner to prepare or download a browser model and no
longer uses a manual **Add Token** step. A single Run action can now show the
real generation loop continuously:

`current text → real logits → probabilities → selected Token → append raw Token → repeat`

Page 4 is one focused concept check: after a Token is added, the model uses the
updated text as context and predicts again.

## Production architecture

The production path is now:

`React UI → POST /api/next-token → persistent Node model service → JSON response`

Render is configured as a Node web service rather than a static-only service.
The same server serves the Vite `dist` directory, SPA route fallbacks, Ethics
PDFs, and the same-origin prediction API. There is no API key in the client.

The service lazily loads one pinned model/tokenizer instance and reuses it for
all requests. Inference requests are serialized through one process-level queue,
preventing simultaneous calls from corrupting shared inference state or causing
unbounded memory spikes. The health response exposes load status for operational
checks. Input length, Temperature, top-k, mode, JSON size, HTTP method, and a
per-session request rate are validated.

## Selected real model

- Checkpoint: `onnx-community/SmolLM2-135M-Instruct-ONNX`
- Revision: `b8a5c0f183b78c55955a5364f610c36668b5e681`
- Runtime: `@huggingface/transformers` 3.8.1 on server CPU
- Quantisation: q4 ONNX
- Licence: Apache-2.0

This is inference-only ONNX execution. The PyTorch-specific `model.eval()` and
`torch.inference_mode()` calls do not exist in this runtime; ONNX Runtime does
not expose a training mode and executes the exported inference graph directly.

## API contract

`POST /api/next-token`

Request:

```json
{
  "text": "The little robot opened the",
  "temperature": 1.0,
  "mode": "greedy",
  "top_k": 5
}
```

Response fields include the unchanged input, Temperature, five candidates,
selected Token, EOS state, and pinned model identity. Every candidate carries:

- `token_id`
- `raw_token` — appended exactly to the text
- `display_token` — whitespace made visible for learners
- `probability` — absolute probability from the full vocabulary

The server takes logits at the final sequence position, applies Temperature,
runs a stable softmax over all 49,152 vocabulary logits, and only then selects
the top five. The displayed five are not renormalised to 100%.

## Verified real results

Direct real-model validation produced prompt-dependent outputs. For
`The little robot opened`, the first two HTTP predictions were:

1. `␠the`, ID 260, probability 58.97%
2. after appending raw ` the`, `␠door`, ID 6644, probability 46.87%

The required 100-step HTTP acceptance test completed without reloading the
model. Its first 20 generated Tokens produced:

`The little robot opened the door and the room was filled with the soft, warm light of the fire. It was a`

The candidate Token IDs changed after the first append. For the same prompt
`Today the weather feels`, the leading absolute probability changed from about
80.29% at Temperature 0.4 to about 3.08% at Temperature 1.6. Sequential and
parallel HTTP requests all completed while `modelLoadCount` remained 1.

## Page 3 learner flow

- The default starter is `The little robot opened the`.
- The prompt and primary Run action share the first row.
- Example starters and Reset are directly below.
- **Auto** is the recommended default; **Step by step** is also available.
- Auto supports Pause and Resume without deleting context or history.
- Maximum generated Tokens can be 5, 10, 20, 50, or 100; default is 20.
- Current Context always shows the complete accumulated text.
- The newest Token receives a short, non-blocking highlight.
- The adjacent panel shows the five latest real probabilities and clearly notes
  that many other vocabulary Tokens can have smaller probabilities.
- Temperature affects the next real request.
- Generation History retains every step up to the chosen limit, shows about five
  cards at once, supports horizontal scrolling, and allows reviewing an earlier
  distribution without deleting later steps.
- Lesson evidence is recorded only after at least two successful real predictions.

## Concurrency, cancellation, and errors

- The React hook permits only one outstanding request per lab instance.
- `AbortController` cancels navigation/reset work and stale run IDs prevent late
  responses from mutating a newer run.
- Auto mode waits for one request to finish before making the next.
- Pause allows the current request to finish, then stops before another request.
- The server serializes inference across users and rate-limits sessions.
- API errors stay inside the lab and can be retried; no fake candidates or
  teaching fixtures are substituted as “Live” output.

## Files changed for this implementation

- `server/index.mjs`
- `server/modelService.mjs`
- `render.yaml`
- `package.json`
- `package-lock.json`
- `src/mission4/LivePredictionLab.jsx`
- `src/mission4/useLivePredictionModel.js`
- `src/mission4/liveModelConfig.js`
- `src/mission4/livePredictionMath.js`
- `src/mission4/Lesson4TeachingPages.jsx`
- `src/mission4/lesson4Live.css`
- `src/locales/{en,zh,fr,de}/mission4.json`
- `scripts/test-next-token-api.mjs`
- `scripts/test-next-token-live.mjs`
- `scripts/validate-smollm-next-token.mjs`
- `scripts/test-mission4-paged.mjs`
- `scripts/test-p13-acceptance.mjs`
- `docs/lesson4-live-model.md`
- `docs/lesson4-live-lab-report.md`

Historical browser-worker files remain unreachable reference material; Page 3
does not import them.

## Verification

Passed:

- `npm run model:validate-next-token`
- `npm run test:next-token-api`
- `npm run test:next-token-live` — 100 sequential steps, Temperature comparison,
  concurrent requests, one model load
- `npm run test:mission4-paged`
- `npm run test:mission1-paged`
- `npm run test:mission2-paged`
- `npm run test:mission3-paged`
- `npm run test:mission5-paged`
- `npm run test:paged-navigation`
- `npm run test:paged-missions`
- `npm run test:curriculum`
- `npm run test:p13-acceptance`
- `npm run test:p14-final-challenge`
- `npm run test:p14-cleanup`
- `npm run test:lesson-structure`
- `npm run test:tokenizer`
- `npm run test:token-lab`
- `npm run build`
- `git diff --check`
- direct `curl` calls for two consecutive real predictions

The in-app browser service reported no available browser instance. Therefore
desktop/mobile visual acceptance, live button clicking, focus order, and Console
inspection are **not claimed as completed**. No commit or push was performed.

## Scope confirmation

The Lesson 4 implementation itself did not modify Lesson 1–3 teaching content,
Lesson 5, Final Challenge, AI Lab, progress schema, or completion migration.
The current worktree also contains separately authorised Lesson 5 work; that
work is not part of this Lesson 4 phase and was not reverted. The Lesson 4
phase changed the Render service type only because a persistent real-model API
cannot run in a static-only deployment.

## Final acceptance record — 26 requested items

1. **Final model.** `onnx-community/SmolLM2-135M-Instruct-ONNX`, q4 CPU,
   pinned to commit `b8a5c0f183b78c55955a5364f610c36668b5e681` under
   Apache-2.0. The choice follows the earlier bake-off: it is small enough for
   the deployment target while producing coherent causal completions.
2. **Backend.** A persistent Node service lazily loads and reuses one tokenizer
   and one causal model. ONNX executes an inference graph only; there is no
   training or gradient path.
3. **API.** `POST /api/next-token` validates text, Temperature, decoding mode,
   top-k, body size, method, session concurrency and request rate. It returns
   input, Top 5 candidates, selected Token, EOS and pinned model identity.
4. **Real logits and probabilities.** The service reads the final sequence
   position from the real model logits, applies `logits / temperature`, performs
   stable full-vocabulary softmax, and only then extracts Top 5. Top 5 is not
   renormalised.
5. **Auto mode.** Auto is the default and performs one HTTP request per Token,
   appends the returned `raw_token`, and uses the updated text in the next
   request.
6. **Pause / Resume.** Pause preserves context, last probabilities and all
   history. An in-flight step may finish, but no next request is sent. Resume
   continues from the preserved context.
7. **Step-by-step mode.** One click makes exactly one request, displays that
   step's real distribution, appends the selected raw Token, then stops.
   Switching from Auto pauses without resetting state.
8. **Max Tokens.** Options are 5, 10, 20, 50 and 100, with 20 as default.
   Raising a reached limit enables continuation from existing context.
9. **100-Token test.** `test:next-token-live` completed exactly 100 sequential
   HTTP predictions for the acceptance prompt and retained one model load.
10. **Current Context.** The learner sees one continuous, wrapping, read-only
    text surface with internal vertical scrolling and a generated-Token count.
11. **Latest Token highlight.** Each appended Token is rendered from its exact
    raw substring in a short 650 ms highlight; reduced-motion CSS disables the
    animation when requested.
12. **Probability updates.** Each History record stores the context before,
    Top 5 candidates, selection, context after and Temperature. The first and
    second real candidate-ID lists differ after appending `␠the`.
13. **Temperature.** The 0.4–1.6 control affects the next real request. For
    `Today the weather feels`, the leading absolute probability measured about
    80.29% at 0.4 and 3.08% at 1.6.
14. **Generation History.** Every generated step is retained up to the selected
    limit; the data is never sliced to the five visible cards.
15. **Recent-five viewport.** The 780 px desktop track and 138 px cards show
    roughly five steps. Each new step scrolls the track to its right edge.
16. **Horizontal review.** Earlier step buttons remain reachable by touch,
    trackpad, keyboard focus, the thin native horizontal scrollbar, or the
    labelled left/right controls. Reviewing an old step pauses Auto and is no
    longer cleared by a pending response; **Return to latest** exits review.
17. **Concurrency / cancellation.** The hook allows one outstanding request,
    uses `AbortController`, rotates session IDs after cancellation and rejects
    stale run IDs. The server rejects overlapping requests from one session and
    serialises multi-session inference through a safe queue.
18. **Completion logic.** Page 3 records required evidence only after at least
    two successful real predictions. Visiting the page or encountering an error
    cannot complete it.
19. **Responsive.** Scoped CSS changes the 55/45 workspace to one column at
    760 px; the sidebar also moves below. At 520/375 px prompt/actions and rows
    stack while only History keeps horizontal scrolling. This is source/build
    verified, not falsely claimed as visual browser acceptance.
20. **Accessibility.** Controls are native buttons, inputs, select and fieldset;
    mode buttons expose `aria-pressed`, ranges expose `aria-valuetext`, live
    outcomes use polite announcements, errors use `role=alert`, History controls
    have labels, focus-visible styling exists, and reduced motion is respected.
21. **Files changed.** The authoritative Lesson 4 file list appears above.
    Historical browser-worker files are not imported by the official Page 3.
22. **Backend tests.** API tests cover valid Top 5, sorting, greedy choice,
    validation errors, same-session overlap, client cancellation, health, SPA
    and PDF serving. Real tests cover raw append, changed second distribution,
    Temperature, 100 sequential requests, concurrent sessions and one load.
    EOS production detection and Auto stopping are also asserted in service/UI
    contracts; the acceptance prompt itself did not emit EOS within 100 Tokens.
23. **Frontend tests.** Source and regression checks cover immediate Run, Auto
    default, Pause/Resume, one-step mode, safe switching, 100 limit, continuous
    context, no trail/Add/Prepare controls, highlight, changing candidates,
    Temperature, complete History, recent positioning, review, max/EOS stop,
    stale-run protection, local errors, responsive overflow rules and the fixed
    History-review race.
24. **Sequential inference evidence.** The first real response for
    `The little robot opened` selected raw ` the` (ID 260, 58.97%); after exact
    raw append, the second request selected raw ` door` (ID 6644, 46.87%).
25. **Build results.** Production build passed and created 25 SPA fallbacks.
    `git diff --check` passed. Vite still reports the pre-existing bundle-size
    warning; it is not a build error.
26. **Remaining manual browser checks.** The in-app browser returned no browser
    instance. Visual review at desktop/760/375 widths, real pointer/keyboard
    interaction, focus order, History gesture scrolling, Console inspection and
    live Back/Forward remain explicitly manual. No screenshots are presented as
    browser evidence.

## Explicit non-regression confirmations

- No browser **Prepare Model** flow.
- No manual **Add Token** control on Page 3.
- No hard-coded predictions, hard-coded probabilities, prompt mappings, random
  fake probability or fake fallback in the real Page 3 path.
- No copied reference UI; the implementation uses the existing AI Explorer
  Lesson shell, tokens and robot assets.
- The Lesson 4 phase made no Lesson 1–3 teaching changes, no Progress schema
  change, no completion migration change, no commit and no push.
- Separately authorised Lesson 5 work is present in the same dirty worktree; it
  is not part of this Lesson 4 implementation and was preserved.
