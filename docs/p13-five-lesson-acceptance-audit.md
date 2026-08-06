# Phase P13 — Five-Lesson Curriculum Acceptance Audit

## Audit basis and limitations

This audit covers the five official paged Lessons in the current workspace. It combines source inspection, locale-structure checks, focused automated tests, completion-state review and production-build verification.

The controllable browser was unavailable during this phase. Visual scores are therefore provisional source-level assessments based on DOM/CSS structure, responsive rules and local assets; they are not claims of screenshot or real-viewport acceptance. The manual browser checklist appears at the end.

Scoring order is `A/B/C/D/E/F`: Teaching purpose / Child comprehension / Visual explanation / Interaction meaning / Continuity / Visual quality. Each score is 0–4. `Current → Final` records the score before and after P13 repairs.

## Whole-curriculum verdict

The official path now forms a coherent simplified mechanism:

1. Text becomes Tokens, lookup IDs and numerical representations.
2. A limited Context Window decides which Tokens are available now.
3. Numerical relationships combine useful information among visible Tokens.
4. Processed context produces candidate scores and probabilities; a decoding rule selects one Token, which is added before prediction repeats.
5. Training predicts actual next Tokens, measures the gap, adjusts many parameters slightly and repeats until useful scoring patterns are learned.

The course is primarily about LLM operation. Short cautions about limited windows, probability not being truth, teaching data and imperfect training patterns remain subordinate to that mechanism.

## Page-by-page acceptance record

The compact fields are: **Q** learning question; **Outcome** learner understanding; **Explain / Analogy / Illustration** pre-interaction support; **Action → Result** causal interaction; **Takeaway / Bridges** continuity; **Risks** technical, comprehension, visual, functional, responsive/accessibility; **Fix** required repair.

### Lesson 1 — Token workshop

| Page | Audit record | Current → Final |
|---|---|---|
| 1 · Text becomes pieces | **Q:** How can text become model input? **Outcome:** text is split into smaller Token pieces. **Explain:** Yes. **Analogy:** building blocks. **Illustration:** Teaching—robot reads the constructed sentence. **Action → Result:** observe constructed pieces → recognise that a sentence can be divided. **Takeaway / Bridges:** introduction leads directly to the verified tokenizer demonstration. **Risks:** metaphor limit is stated; no functional risk found; mobile wrapping rules present. **Fix:** none; protected approved page. | `4/4/4/2/3/4 → 4/4/4/2/3/4` |
| 2 · Real tokenisation demonstration | **Q:** Where does a real tokenizer split this sentence? **Outcome:** Qwen produces real verified pieces and different tokenizers may split differently. **Explain:** Yes. **Analogy:** magnifying-glass inspection. **Illustration:** Teaching. **Action → Result:** replay → pieces appear in sequence. **Takeaway / Bridges:** verified result prepares free experimentation. **Risks:** animation has reduced-motion handling and cleanup. **Fix:** none. | `4/4/4/3/4/4 → 4/4/4/3/4/4` |
| 3 · Try your own sentence | **Q:** Does changing text change its Tokens? **Outcome:** real tokenizer output depends on input. **Explain:** Yes. **Analogy:** experiment bench. **Illustration:** Teaching. **Action → Result:** enter text and tokenize → real pieces and IDs appear. **Takeaway / Bridges:** result leads to concept check. **Risks:** tokenizer errors and length validation handled; no model inference claim. **Fix:** none. | `4/4/4/4/3/4 → 4/4/4/4/3/4` |
| 4 · Concept check | **Q:** What can a Token be? **Outcome:** a Token may be a word, word part or punctuation. **Explain:** Yes. **Analogy:** classified pieces. **Illustration:** Teaching objects. **Action → Result:** choose description → explanatory feedback. **Takeaway / Bridges:** confirms the definition before rebuilding. **Risks:** selected state is semantic; no lock. **Fix:** none. | `3/4/3/3/3/4 → 3/4/3/3/3/4` |
| 5 · Rebuild real Tokens | **Q:** Why does Token order matter? **Outcome:** real pieces reconstruct text only in the original order. **Explain:** Yes. **Analogy:** puzzle construction. **Illustration:** Teaching. **Action → Result:** add/reorder pieces → sentence reconstruction feedback. **Takeaway / Bridges:** order prepares numerical lookup. **Risks:** keyboard/touch controls exist; not drag-only. **Fix:** none. | `4/4/4/4/3/4 → 4/4/4/4/3/4` |
| 6 · Tokens become numbers | **Q:** How does a Token become numerical material? **Outcome:** an ID is a lookup label that locates a learned numerical representation. **Explain:** Yes. **Analogy:** labelled drawer. **Illustration:** Teaching—pointing robot operates lookup. **Action → Result:** follow Token → ID → row → later calculations. **Takeaway / Bridges:** explicitly says visible values are illustrative, not Qwen values. **Risks:** embedding term is optional; no unexplained real numbers. **Fix:** none. | `4/3/4/3/4/4 → 4/3/4/3/4/4` |
| 7 · Lesson discovery | **Q:** What is the complete input transformation? **Outcome:** text → Tokens → ID lookup → learned numerical representation → calculations. **Explain:** Yes. **Analogy:** process strip. **Illustration:** Teaching. **Action → Result:** summary/restart/next actions. **Takeaway / Bridges:** directly opens Context Window lesson. **Risks:** completion still requires real activities. **Fix:** none. | `4/4/4/2/4/4 → 4/4/4/2/4/4` |

### Lesson 2 — Context Window / moving spotlight

| Page | Audit record | Current → Final |
|---|---|---|
| 1 · A flashlight for a long story | **Q:** Can the model see the whole story? **Outcome:** only a limited region is available. **Explain:** Yes. **Analogy:** flashlight. **Illustration:** Teaching—reading robot beside illuminated Tokens. **Action → Result:** move light → available Tokens change. **Takeaway / Bridges:** limited view; P13 now explicitly introduces the Context Window next. **Risks:** previously lacked forward causal bridge. **Fix:** added four-language bridge. | `4/4/4/4/2/4 → 4/4/4/4/3/4` |
| 2 · Meet the Context Window | **Q:** What is the Context Window? **Outcome:** boundary identifies currently available Tokens. **Explain:** Yes. **Analogy:** visible frame. **Illustration:** Teaching. **Action → Result:** reveal frame → inside/outside labels appear. **Takeaway / Bridges:** new Token arrival motivates moving window. **Risks:** no confirmed bug. **Fix:** none. | `4/4/4/3/4/4 → 4/4/4/3/4/4` |
| 3 · The window moves | **Q:** What happens as text grows? **Outcome:** new Tokens enter and older Tokens can leave. **Explain:** Yes. **Analogy:** small whiteboard. **Illustration:** Teaching—robot points at constrained space. **Action → Result:** add Token → frame advances and older Token exits. **Takeaway / Bridges:** P13 now asks whether an exited clue can still help. **Risks:** previously no explicit bridge. **Fix:** added bridge. | `4/4/4/4/2/4 → 4/4/4/4/3/4` |
| 4 · Outside means unavailable | **Q:** Can an outside clue help now? **Outcome:** outside Tokens cannot directly affect the current calculation. **Explain:** Yes. **Analogy:** boundary test. **Illustration:** Teaching. **Action → Result:** choose available text → feedback explains missing river clue. **Takeaway / Bridges:** larger-window question follows. **Risks:** English sentence is intentional language material. **Fix:** none. | `4/4/4/4/4/4 → 4/4/4/4/4/4` |
| 5 · Bigger is still limited | **Q:** Does a bigger window remember everything? **Outcome:** more visible Tokens do not mean unlimited memory or understanding. **Explain:** Yes. **Analogy:** resizable viewport. **Illustration:** Teaching. **Action → Result:** move slider → visible/outside counts change. **Takeaway / Bridges:** P13 adds full-journey bridge. **Risks:** slider lacked spoken combined value. **Fix:** added `aria-valuetext` and four-language text. | `4/4/4/4/2/4 → 4/4/4/4/3/4` |
| 6 · Context discovery | **Q:** What was available to the model? **Outcome:** long text → moving limited window → available context. **Explain:** Yes. **Analogy:** journey map. **Illustration:** Teaching—robot points toward helpful words. **Action → Result:** completion only after five activities. **Takeaway / Bridges:** opens Lesson 3 relevance question. **Risks:** no direct-summary completion. **Fix:** none. | `4/4/4/2/4/4 → 4/4/4/2/4/4` |

### Lesson 3 — Relationship finder

| Page | Audit record | Current → Final |
|---|---|---|
| 1 · Some clues help more | **Q:** Do all visible Tokens help equally? **Outcome:** useful contribution differs for the current task. **Explain:** Yes. **Analogy:** clue spotlight. **Illustration:** Teaching. **Action → Result:** choose dog/slept → useful Tokens become highlighted. **Takeaway / Bridges:** changing task follows. **Risks:** metaphor could imply conscious investigation, but later boundary corrects it. **Fix:** none. | `4/4/4/4/4/4 → 4/4/4/4/4/4` |
| 2 · The task changes the clues | **Q:** Is a Token always equally helpful? **Outcome:** the same visible sequence supports different relationships. **Explain:** Yes. **Analogy:** redirected spotlight. **Illustration:** Teaching—robot redirects focus. **Action → Result:** change task → highlighted pair changes. **Takeaway / Bridges:** multiple clues next. **Risks:** real numerical calculation boundary present. **Fix:** none. | `4/4/4/4/4/4 → 4/4/4/4/4/4` |
| 3 · Clues work together | **Q:** Can several earlier Tokens contribute? **Outcome:** several relationships contribute to an updated representation. **Explain:** Yes. **Analogy:** pinned relationship board. **Illustration:** Teaching. **Action → Result:** connect clues → joined pattern reaches target. **Takeaway / Bridges:** position follows. **Risks:** attention is optional and anthropomorphic limit explicit. **Fix:** none. | `4/3/4/4/4/4 → 4/3/4/4/4/4` |
| 4 · Order changes relationships | **Q:** Why is a word list insufficient? **Outcome:** position changes who does what. **Explain:** Yes. **Analogy:** two position tracks. **Illustration:** Teaching. **Action → Result:** identify actor in both orders → relationship changes. **Takeaway / Bridges:** practice follows. **Risks:** selected result has text/icon, not colour only. **Fix:** none. | `4/4/4/4/4/4 → 4/4/4/4/4/4` |
| 5 · Find helpful clues | **Q:** Which visible Tokens support the task? **Outcome:** related information elsewhere in context can contribute. **Explain:** Yes. **Analogy:** clue workbench. **Illustration:** Teaching. **Action → Result:** select and check → reviewed explanation appears. **Takeaway / Bridges:** summary follows. **Risks:** examples are simplified, clearly labelled. **Fix:** none. | `4/4/4/4/4/4 → 4/4/4/4/4/4` |
| 6 · Clue-finding discovery | **Q:** How does useful context prepare prediction? **Outcome:** visible representations → useful numerical relationships → updated representation → prediction gate. **Explain:** Yes. **Analogy:** route map. **Illustration:** Teaching. **Action → Result:** completion requires three activities. **Takeaway / Bridges:** directly hands processed context to Lesson 4. **Risks:** no measured attention-weight claim. **Fix:** none. | `4/3/4/2/4/4 → 4/3/4/2/4/4` |

### Lesson 4 — Prediction machine

| Page | Audit record | Current → Final |
|---|---|---|
| 1 · Several Tokens could come next | **Q:** Is there only one possible continuation? **Outcome:** several vocabulary Tokens are candidates. **Explain:** Yes. **Analogy:** launch pads. **Illustration:** Teaching—target robot operates candidate area. **Action → Result:** inspect candidates → multiple plausible pieces remain. **Takeaway / Bridges:** scoring follows. **Risks:** no real-Qwen claim. **Fix:** none. | `4/4/4/3/4/4 → 4/4/4/3/4/4` |
| 2 · Candidates get different chances | **Q:** How are candidates compared? **Outcome:** numerical scores become probabilities that total 100%. **Explain:** Yes. **Analogy:** score ribbons. **Illustration:** Teaching. **Action → Result:** reveal scores and compare → highest printed chance visible. **Takeaway / Bridges:** selection rule follows. **Risks:** probability is explicitly not confidence/truth. **Fix:** none. | `4/3/4/4/4/4 → 4/3/4/4/4/4` |
| 3 · One rule chooses one Token | **Q:** How does one candidate become output? **Outcome:** probabilities and decoding rule are separate. **Explain:** Yes. **Analogy:** selection gate. **Illustration:** Teaching—robot operates gate. **Action → Result:** compare highest-chance and sampling → selected Token can differ. **Takeaway / Bridges:** placement follows. **Risks:** fixed reviewed sampling, not random Qwen output. **Fix:** none. | `4/3/4/4/4/4 → 4/3/4/4/4/4` |
| 4 · Add the Token | **Q:** What happens after selection? **Outcome:** selected Token joins context and creates a new next position. **Explain:** Yes. **Analogy:** Token socket. **Illustration:** Teaching. **Action → Result:** add mat → context visibly changes. **Takeaway / Bridges:** repetition follows. **Risks:** no bug found. **Fix:** none. | `4/4/4/4/4/4 → 4/4/4/4/4/4` |
| 5 · Predict, add and repeat | **Q:** How can one-Token prediction make longer text? **Outcome:** each addition changes the next candidate set. **Explain:** Yes. **Analogy:** story machine. **Illustration:** Teaching—training robot operates machine. **Action → Result:** select/place/undo/restart → story and candidates update. **Takeaway / Bridges:** complete loop follows. **Risks:** fixed candidate tree labelled; controls remain repeatable. **Fix:** none. | `4/4/4/4/4/4 → 4/4/4/4/4/4` |
| 6 · Prediction discovery | **Q:** What is the full generation loop? **Outcome:** processed context → scores → probabilities → rule → selection → add → repeat. **Explain:** Yes. **Analogy:** route. **Illustration:** Teaching. **Action → Result:** completion requires meaningful activities. **Takeaway / Bridges:** training workshop follows. **Risks:** no direct-summary completion. **Fix:** none. | `4/4/4/2/4/4 → 4/4/4/2/4/4` |

### Lesson 5 — Training workshop

| Page | Audit record | Current → Final |
|---|---|---|
| 1 · Practise next-Token prediction | **Q:** How can the model practise? **Outcome:** predict from existing text, then reveal actual Token. **Explain:** Yes. **Analogy:** practice card and hidden answer. **Illustration:** Teaching—robot feeds example. **Action → Result:** choose prediction → prediction/target comparison. **Takeaway / Bridges:** explicit target comparison follows. **Risks:** values are classroom demonstration. **Fix:** none. | `4/4/4/4/4/4 → 4/4/4/4/4/4` |
| 2 · Compare prediction and answer | **Q:** Was the target given enough chance? **Outcome:** higher target probability means smaller prediction gap. **Explain:** Yes. **Analogy:** answer flap. **Illustration:** Teaching—comparison state. **Action → Result:** inspect both states → larger/smaller gap text changes. **Takeaway / Bridges:** adjustment follows. **Risks:** loss introduced only after simple meaning. **Fix:** none. | `4/3/4/4/4/4 → 4/3/4/4/4/4` |
| 3 · Adjust many numbers slightly | **Q:** What does the correction change? **Outcome:** many parameters move a tiny amount; no number stores one fact. **Explain:** Yes. **Analogy:** dial workshop. **Illustration:** Teaching—pointing robot operates controls. **Action → Result:** adjust → reviewed probabilities change slightly. **Takeaway / Bridges:** repetition follows. **Risks:** explicitly not Qwen weights. **Fix:** none. | `4/3/4/4/4/4 → 4/3/4/4/4/4` |
| 4 · Repeat many examples | **Q:** How do tiny changes become patterns? **Outcome:** repeated related examples accumulate different prediction patterns. **Explain:** Yes. **Analogy:** example conveyor and pattern threads. **Illustration:** Teaching. **Action → Result:** process at least two groups → named pattern results and reviewed before/after state. **Takeaway / Bridges:** memory distinction follows. **Risks:** controlled local data, no live training. **Fix:** none. | `4/4/4/4/4/4 → 4/4/4/4/4/4` |
| 5 · Patterns are not perfect memory | **Q:** Is learning just exact memorisation? **Outcome:** exact copying differs from applying a pattern to related new wording. **Explain:** Yes. **Analogy:** paired pattern cards. **Illustration:** Teaching. **Action → Result:** classify both → explanatory feedback. **Takeaway / Bridges:** training loop follows. **Risks:** non-English UI previously showed English structural labels; selection state lacked semantic state. **Fix:** translated labels in four languages; added `type` and `aria-pressed`. | `4/4/4/4/4/4 → 4/4/4/4/4/4` |
| 6 · Complete training loop | **Q:** Where did prediction patterns come from? **Outcome:** training learns numerical patterns; generation uses them to continue text. **Explain:** Yes. **Analogy:** separate connected route maps. **Illustration:** Teaching—robot follows course route. **Action → Result:** completion only after five activities and visiting summary. **Takeaway / Bridges:** final course synthesis. **Risks:** original compact training path omitted explicit Tokens and central distinction was less direct. **Fix:** four-language paths now include Tokens, probabilities, add-Token, learned scoring patterns and an explicit training-versus-generation takeaway. | `4/3/4/2/2/4 → 4/4/4/2/4/4` |

## Confirmed repairs

- Added conceptual forward bridges to Lesson 2 Pages 1, 3 and 5 in all four languages.
- Added combined visible/outside `aria-valuetext` to the Context Window size slider.
- Localised Lesson 5 Page 5 structural labels and exposed each selected classification with `aria-pressed`.
- Strengthened the final training path with Tokens and learned scoring patterns.
- Strengthened the final generation path with probabilities, selected-Token addition and repetition.
- Replaced the final takeaway with the central distinction: training learns numerical patterns; generation uses them to continue text.
- Retained the shared heading-focus restoration, popstate handling, free navigation, recommendation prompt and meaningful completion conditions.

## Truthfulness findings

- Only the real Qwen tokenizer is loaded.
- No model weights, ONNX model, live generation endpoint, live training endpoint, real attention weights, real embeddings or real parameter updates are present.
- Lesson 2 uses a fixed classroom Context Window picture.
- Lesson 3 uses reviewed relationships, not measured attention weights.
- Lesson 4 uses reviewed probabilities and fixed candidate trees, not Qwen inference.
- Lesson 5 uses reviewed teaching numbers and illustrative parameter adjustment, not Qwen training.

## Remaining manual browser acceptance

Because browser control was unavailable, manually verify:

1. All 31 official pages at 1440, 1180, 980, 760, 520 and 375 px.
2. Representative explanatory, interaction and summary pages for every Lesson.
3. Page-title focus after Next, Back and browser Back/Forward.
4. No robot, translated button or causal map overlaps the fixed footer.
5. French and German wrapping, particularly Lesson 5 Pages 5–6.
6. Context slider announcements with a screen reader.
7. Full completion of each Lesson from clean progress and idempotent repeat completion.
8. Overview completion indicators and Final Challenge gating after all five genuine completions.
9. Console output during tokenizer loading, replay timers and route changes.

No Story Builder, popup Guide, AI Lab change, progress-schema change, Final Challenge change, external API or external image was introduced.
