# AI Explorer Phase P13 — Full Curriculum, QA and Teaching Audit

**Audit date:** 7 August 2026  
**Audited build:** working tree based on `2133793`  
**Official curriculum:** five paged Lessons, 31 pages total  
**Audience:** students aged 12–14  

## 1. Executive summary

### Overall verdict: **PARTIAL PASS**

The implemented five-Lesson curriculum now teaches one coherent, simplified causal account of how an autoregressive language model works:

> text → Tokens → numerical representations → available Context → useful token relationships → next-token scores → probabilities → selection → add one Token → repeat

It then explains the separate training process:

> training examples → predict the actual next Token → compare prediction with target → adjust many parameters slightly → repeat → learned scoring patterns

The official learner path is no longer primarily a generic AI-literacy course. Safety and truthfulness cautions are short boundary statements attached to the mechanism they qualify. They do not replace the mechanism. The strongest teaching sequence is Lesson 2 Pages 1–5: each page asks one concrete question, shows a visual state, lets the learner change it, and names the resulting idea. The most cognitively demanding sequence is Lesson 5 Pages 2–3, where probability gap, correction and distributed parameter adjustment arrive close together.

The result is a **partial**, rather than unconditional, pass for three reasons:

1. Source, state and automated route checks pass, but the controllable browser was unavailable in this session. Real viewport, pointer, focus-ring and console acceptance therefore still needs a manual browser pass.
2. Legacy scrolling Mission URLs and components remain in the bundle for regression safety. Official navigation does not use them, but direct legacy links can expose obsolete terminology, hard locks and AI-literacy material that contradicts the official five-Lesson course.
3. Completion state inside each paged Lesson is session-local until the required activities are completed and the learner uses the onward action. Refreshing mid-Lesson preserves real stored completion but not partial page/activity state. This is not data corruption, but it can surprise learners.

### Clear defects repaired during this audit

- Removed hard-coded English summary notices and onward labels from official Lessons 2–5.
- Reused the existing four-language keys for non-blocking guidance, Next and Final Challenge actions.
- Preserved free access: the repair changes copy only and does not add route or page gating.

### Curriculum identity

| Question | Finding |
| --- | --- |
| Is this mainly “How LLMs work”? | **Yes.** Every official Lesson advances the input-to-output or training mechanism. |
| Has it drifted into generic AI literacy? | **No on official pages; yes in dormant legacy pages.** |
| Is the causal chain visible? | **Yes.** Lesson summaries and Lesson 5 Page 6 explicitly reconnect it. |
| Is every representation real model output? | **No, and the UI says so.** Only Qwen tokenisation is real; later scores, probabilities, attention-like relationships, embeddings and training changes are reviewed teaching data. |
| Is access confused with completion? | **No on official pages.** All Lessons/pages and Final Challenge are available; genuine completion remains activity-based. |

## 2. Official route and learner-flow map

### Product routes

| Area | Canonical route | Expected behaviour |
| --- | --- | --- |
| Learn/Home | `/` or `/dashboard` | Presents the ordered learning journey; Lesson 1 is recommended, not required. |
| Lesson overview | `/missions` | All five Lessons directly selectable; completion and recommendation are separate. |
| Progress | `/progress` | Reports stored genuine completion, not mere visits. |
| Final Challenge | `/final-challenge` | Directly accessible; best experienced after five completed Lessons. |

### Official Lesson routes

| Lesson | Route | Pages | Stored Mission ID |
| --- | --- | ---: | ---: |
| 1 · Tokenisation and numbers | `/mission/1-tokenisation-paged?page=1…7` | 7 | 1 |
| 2 · Reading Context | `/mission/2-prediction-paged?page=1…6` | 6 | 2 |
| 3 · Finding Helpful Clues | `/mission/3-hallucination-paged?page=1…6` | 6 | 3 |
| 4 · Predicting the Next Token | `/mission/4-training-data-paged?page=1…6` | 6 | 5 |
| 5 · Learning from Training Examples | `/mission/5-bias-paged?page=1…6` | 6 | 6 |

The unusual route names and IDs are compatibility artefacts, not learner-facing curriculum labels. `curriculumVersion: 2` safely normalises the historic state into the five current Lessons.

### Navigation/state contract

- `parseLessonPage()` maps a missing, non-integer, negative, zero or out-of-range `page` query to Page 1.
- Next and Back use `history.pushState`; `popstate` restores the page and focus moves to the page heading.
- Page 1 disables only Back. Next is never disabled by activity state.
- Opening a later page adds a small recommendation notice; Continue here remains available.
- `available`, `recommended`, `visited`, `activityComplete` and `missionComplete` remain distinct concepts.
- A visit does not write progress. A recommendation override does not write progress.
- Final Challenge access is unconditional. Completion still counts only genuinely completed Lessons.

### HTTP/direct-load verification

The running Vite server returned HTTP 200 for 45 direct requests: Home, Dashboard, Missions, Progress, Final Challenge, the five base Lesson routes, all 31 `?page=n` URLs, and four invalid Page-1 query cases. This verifies dev-server fallback reachability, not client-side rendering or visual correctness.

## 3. Lesson role definitions

### Lesson 1 — Text becomes Tokens and numbers

- **Big question:** How can written text become material a model can calculate with?
- **Connection from previous knowledge:** Starts with familiar sentences and visible text pieces.
- **Objective:** Distinguish text, Token pieces, Token IDs and learned numerical representations.
- **Technical concept:** Real Qwen tokenisation; lookup ID; simplified embedding-vector idea.
- **Child-facing framing:** Building blocks and a labelled number drawer.
- **End takeaway:** The model does not receive a sentence as human-readable meaning; it receives ordered Token representations used in calculations.

### Lesson 2 — Reading Context

- **Big question:** Which Tokens are available to the model right now?
- **Connection:** Starts from the ordered Tokens produced in Lesson 1.
- **Objective:** Understand a finite, moving Context Window and inside/outside availability.
- **Technical concept:** Finite context length, moving visible region, availability boundary.
- **Child-facing framing:** A flashlight over a long story and a small whiteboard.
- **End takeaway:** Only Tokens inside the current window can directly contribute to the next calculation.

### Lesson 3 — Finding Helpful Clues

- **Big question:** Among available Tokens, which relationships help with the current step?
- **Connection:** Builds directly on “inside the Context Window”.
- **Objective:** Understand task-dependent, combined and order-sensitive token relationships.
- **Technical concept:** A deliberately simplified attention-like contribution between token representations.
- **Child-facing framing:** Spotlights, clue boards and position tracks.
- **End takeaway:** The Transformer numerically combines useful information from available Token representations before prediction.

### Lesson 4 — Predicting the Next Token

- **Big question:** How does processed Context become one next Token?
- **Connection:** Receives the updated representation from Lesson 3.
- **Objective:** Separate candidates, scores, probabilities, decoding and repeated generation.
- **Technical concept:** Vocabulary-wide scores, probabilities, greedy selection/sampling, autoregressive loop.
- **Child-facing framing:** Candidate launch pads, a selection gate and a story machine.
- **End takeaway:** Text grows by selecting and adding one Token, then recalculating for the next position.

### Lesson 5 — Learning from Training Examples

- **Big question:** Where did the model’s scoring patterns come from?
- **Connection:** Reuses next-token prediction as the practice task.
- **Objective:** Explain target comparison, correction, distributed parameter adjustment, repetition and generalisation.
- **Technical concept:** Simplified next-token training loop and learned numerical parameters.
- **Child-facing framing:** Practice cards, an answer flap, tiny dials and an example conveyor.
- **End takeaway:** Training changes parameters to improve future next-token scores; generation uses those learned parameters without retraining on each prompt.

## 4. Page-by-page curriculum audit

Scores use a 1–5 scale in this order: **necessity / clarity / visual explanation / interaction usefulness / technical accuracy / age suitability**.

### Lesson 1 — Tokenisation and numbers

#### 1.1 What is a token?

- **Big question:** What kind of piece does a language model process?
- **Why this page exists:** It establishes the basic unit needed by every later page.
- **Entering knowledge:** A learner knows what a sentence and word are; no model vocabulary is assumed.
- **New idea / child explanation:** A Token is one text piece. It may be a word, part of a word or punctuation.
- **Visual teaching / purpose:** Coloured building blocks turn an abstract split into countable objects; the robot reading them anchors the pieces to a sentence.
- **Interaction:** Observation rather than required input. The page asks the learner to inspect how the example sentence can become pieces.
- **What changes / discovery:** The sentence is visually re-represented as separate blocks; text does not need to stay in whole-word units.
- **Technical truth:** Tokenizers segment text into vocabulary units. The displayed first-page blocks are explicitly a teaching picture, not the real Qwen split.
- **Simplification / boundary:** Building blocks could imply Tokens are always words; the note immediately states that the real tokenizer may split differently.
- **Connection:** Page 2 replaces the metaphor with verified Qwen output.
- **If removed:** The real output on Page 2 would arrive before the learner has a concrete unit concept.
- **Potential issue:** The definition appears both in the hero and card; acceptable reinforcement, but future copy editing could reduce repetition.
- **Scores:** **5 / 5 / 5 / 3 / 5 / 5**.

#### 1.2 See real tokenisation

- **Big question:** Where does a real tokenizer actually split this sentence?
- **Why:** It prevents the building-block metaphor from becoming fake tokenizer behaviour.
- **Entering knowledge:** Text can be divided into Token pieces.
- **New idea / child explanation:** A real tokenizer has a fixed vocabulary; familiar pieces may stay together and unfamiliar long words may split.
- **Visual teaching / purpose:** Verified Qwen pieces reveal in sequence; spacing markers and magnifier focus make invisible boundaries visible.
- **Interaction:** Replay the reveal animation.
- **What changes / discovery:** `uncharacteristically` becomes `un + character + istically`; some pieces begin with a space.
- **Technical truth:** Output uses the fixed Qwen2.5 tokenizer fixture. Different model tokenizers can segment differently.
- **Simplification / boundary:** No claim that the animation is model inference; it is replaying verified tokenizer output.
- **Connection:** Learner is ready to supply original text on Page 3.
- **If removed:** The course would rely on an illustrative split while claiming to teach real Tokenisation.
- **Potential issue:** “Fixed collection” is accurate but does not explain training of the tokenizer; that detail is not necessary for this age/goal.
- **Scores:** **5 / 5 / 5 / 4 / 5 / 5**.

#### 1.3 Try your own sentence

- **Big question:** Will different text produce different Tokens?
- **Why:** Converts a watched example into repeatable evidence.
- **Entering knowledge:** Real boundaries can differ from whole-word boundaries.
- **New idea / child explanation:** The same tokenizer applies its vocabulary to anything the learner types.
- **Visual teaching / purpose:** Write → Tokenize → Discover strip makes the action/result sequence explicit; example cards reduce blank-page anxiety.
- **Interaction:** Select an example or type text, run Qwen tokenizer, inspect pieces and IDs, restart.
- **What changes / discovery:** The result count, Token pieces and IDs respond to actual local input.
- **Technical truth:** Real tokenizer-only execution in the browser; no upload and no model weights.
- **Simplification / boundary:** IDs are authentic tokenizer IDs, but are not semantic meanings or embedding values.
- **Connection:** Page 4 checks whether the learner has generalised what a Token can be.
- **If removed:** Lesson 1 would be a demonstration rather than an experiment.
- **Potential issue:** Token IDs appear before Page 6 formally explains them; they should remain visually secondary.
- **Scores:** **5 / 5 / 5 / 5 / 5 / 5**.

#### 1.4 Check the idea

- **Big question:** Which definition describes a Token correctly?
- **Why:** Detects the likely misconception “one Token equals one word”.
- **Entering knowledge:** Learner has seen both a teaching split and real splits.
- **New idea / child explanation:** Tokens can be words, word parts, punctuation and other text pieces.
- **Visual teaching / purpose:** Question icon, checkpoint panel and answer cards clearly signal a practice page rather than exposition.
- **Interaction:** Choose an explanation and receive corrective feedback.
- **What changes / discovery:** The chosen answer is marked and explained; wrong choices do not block navigation.
- **Technical truth:** The accepted definition is appropriately broad.
- **Simplification / boundary:** It does not introduce byte-level edge cases, which would add little value.
- **Connection:** Page 5 applies the idea to ordered real pieces.
- **If removed:** A common whole-word misconception could survive the Lesson.
- **Potential issue:** This is a recognition task; the rebuild page provides stronger evidence of understanding.
- **Scores:** **4 / 5 / 4 / 4 / 5 / 5**.

#### 1.5 Rebuild real Tokens

- **Big question:** Why must Token pieces stay in order?
- **Why:** Introduces sequence before Context and position relationships.
- **Entering knowledge:** Learner recognises real Token pieces.
- **New idea / child explanation:** Correct pieces in the wrong order no longer reconstruct the same text.
- **Visual teaching / purpose:** Puzzle blocks and a construction area make ordering physical and inspectable.
- **Interaction:** Add/reorder verified pieces and check the reconstruction.
- **What changes / discovery:** Correct ordering reconstructs the source text and produces explicit success feedback.
- **Technical truth:** Token sequence order is preserved and matters to later model computation.
- **Simplification / boundary:** The activity reconstructs decoded text rather than implementing positional encodings.
- **Connection:** Page 6 follows each ordered Token into a numerical lookup.
- **If removed:** Lesson 3’s later statement that order changes relationships would have less foundation.
- **Potential issue:** Ensure keyboard controls remain as usable as pointer controls in manual QA.
- **Scores:** **5 / 5 / 5 / 5 / 5 / 5**.

#### 1.6 Tokens become numbers

- **Big question:** How does a text piece become something the model can calculate with?
- **Why:** Bridges tokenizer output to model-side representation.
- **Entering knowledge:** Token pieces and authentic IDs exist in tokenizer output.
- **New idea / child explanation:** The ID is a label/address; it points to one learned row of numbers used by the model.
- **Visual teaching / purpose:** Token → ID tag → number drawer → calculations gives one visible causal path.
- **Interaction:** Click through the lookup steps progressively.
- **What changes / discovery:** ID 305 appears, then a small illustrative row, then the later-calculation destination.
- **Technical truth:** Token IDs index an embedding matrix in a model. Embeddings belong to model weights, not tokenizer-only assets.
- **Simplification / boundary:** The visible values are explicitly not Qwen values and the real vector is much larger. “Address” is only an analogy.
- **Connection:** Summary joins text, Tokens, IDs and representations; Lesson 2 then limits which representations are available.
- **If removed:** The course would jump from text pieces to Transformer calculations without a numerical bridge.
- **Potential issue:** This is Lesson 1’s hardest page; the optional technical details should stay collapsed by default.
- **Scores:** **5 / 4 / 5 / 4 / 5 / 4**.

#### 1.7 Mission summary

- **Big question:** What complete transformation has happened before Context processing begins?
- **Why:** Consolidates two systems that students may otherwise conflate: tokenizer and model.
- **Entering knowledge:** All earlier Lesson 1 concepts.
- **New idea / child explanation:** Text becomes Token pieces; an ID locates numbers; calculations use the numerical representation.
- **Visual teaching / purpose:** Four-step strip compresses the causal chain without adding a new mechanism.
- **Interaction:** Review, try another example, restart, return or continue.
- **What changes / discovery:** Genuine mission completion occurs only if tokenizer experiment and two required checks are complete.
- **Technical truth:** Correctly separates authentic tokenisation from illustrative model numbers.
- **Simplification / boundary:** Summary omits positional information; Lesson 3 later establishes that order matters.
- **Connection:** Opens Reading Context directly.
- **If removed:** Learners could leave with isolated facts rather than an input pipeline.
- **Potential issue:** Direct visitors correctly remain incomplete, but the incomplete copy should continue to explain completion without sounding like an access lock.
- **Scores:** **5 / 5 / 5 / 3 / 5 / 5**.

### Lesson 2 — Reading Context

#### 2.1 A flashlight for a long story

- **Big question:** Can the model use an unlimited amount of text at once?
- **Why:** Establishes limited availability before naming Context Window.
- **Entering knowledge:** Text has become an ordered Token sequence.
- **New idea / child explanation:** The model works on a limited part of the available text.
- **Visual teaching / purpose:** Flashlight over a long token track makes inclusion/exclusion visible without jargon.
- **Interaction:** Move the reading light left/right.
- **What changes / discovery:** Different five-Token regions become available.
- **Technical truth:** Transformer inference is bounded by a context length; the exact window behaviour is simplified.
- **Simplification / boundary:** A model is not literally reading in the dark and may process all Tokens currently in its supplied context in parallel.
- **Connection:** Page 2 names the highlighted region.
- **If removed:** “Context Window” would be introduced as a definition without an intuitive problem.
- **Potential issue:** “At one time” can imply a human serial reading process; visuals/copy should keep emphasis on availability, not consciousness.
- **Scores:** **5 / 5 / 5 / 5 / 4 / 5**.

#### 2.2 Meet the Context Window

- **Big question:** What is the boundary around available Tokens called?
- **Why:** Gives formal vocabulary to the prior visual model.
- **Entering knowledge:** Learner has moved a limited light region.
- **New idea / child explanation:** The Context Window is the group of Tokens available for the current step.
- **Visual teaching / purpose:** Aligned frame, inside/outside labels and legend map one term to one visual boundary.
- **Interaction:** Reveal the window and labels.
- **What changes / discovery:** Tokens become explicitly classified as inside or outside.
- **Technical truth:** Context is the sequence supplied to the model for the current forward pass.
- **Simplification / boundary:** It is not human memory and not necessarily a literal sliding DOM-style window.
- **Connection:** Page 3 grows the sequence and moves the finite region.
- **If removed:** Learners would use the flashlight metaphor without acquiring the key technical term.
- **Potential issue:** Track alignment depends on measured offsets; source handles horizontal centring, but all widths need manual visual QA.
- **Scores:** **5 / 5 / 5 / 4 / 5 / 5**.

#### 2.3 The window moves

- **Big question:** What happens when new Tokens arrive after the current space is full?
- **Why:** Turns a static boundary into a generation-time sequence.
- **Entering knowledge:** Context has a limited size.
- **New idea / child explanation:** New pieces can enter while older pieces move outside the current view.
- **Visual teaching / purpose:** Growing token track plus fixed-size frame makes the trade-off visible; whiteboard reinforces finite space.
- **Interaction:** Add Tokens one at a time.
- **What changes / discovery:** Count increases, frame start moves, older Token styling changes to outside.
- **Technical truth:** With a fixed-length teaching window, later sequences may exclude earlier Tokens.
- **Simplification / boundary:** Real applications can use truncation, caching or larger contexts; the core finite-capacity point remains true.
- **Connection:** Page 4 tests the consequence of losing a useful clue.
- **If removed:** Learner may think the Context Window is a one-time box that never changes.
- **Potential issue:** Completion marks after any addition, while full animation provides the strongest evidence; completion could later require reaching the first visible shift.
- **Scores:** **5 / 5 / 5 / 5 / 4 / 5**.

#### 2.4 Outside means unavailable

- **Big question:** Can a useful clue affect the current step if it is outside the window?
- **Why:** Connects availability to a real consequence.
- **Entering knowledge:** Older Tokens can leave the window.
- **New idea / child explanation:** A clue can be useful in principle but unavailable right now.
- **Visual teaching / purpose:** Faded river sentence, visible bank sentence and prominent question panel make the contrast direct.
- **Interaction:** Choose which text the model can use now.
- **What changes / discovery:** Feedback distinguishes “useful clue” from “available clue”.
- **Technical truth:** Excluded Tokens cannot directly influence a forward pass.
- **Simplification / boundary:** Real systems might separately retrieve or summarise information; this page describes the supplied model context only.
- **Connection:** Page 5 asks whether simply enlarging the window removes the limit.
- **If removed:** Context Window would remain a size fact rather than a computational constraint.
- **Potential issue:** The selected correct option is pre-emphasised by layout in some states; manual QA should confirm the answer is not visually given away.
- **Scores:** **5 / 5 / 5 / 5 / 5 / 5**.

#### 2.5 Bigger is still limited

- **Big question:** Does a larger Context Window remember everything?
- **Why:** Prevents “bigger equals unlimited memory/understanding”.
- **Entering knowledge:** Outside Tokens cannot directly contribute.
- **New idea / child explanation:** More Tokens can fit, but every window still has an edge.
- **Visual teaching / purpose:** Slider, visible/outside counts and resizing frame show the trade-off quantitatively.
- **Interaction:** Change context size.
- **What changes / discovery:** Counts and boundary update together.
- **Technical truth:** Models have finite context lengths; larger context is not human memory or guaranteed understanding.
- **Simplification / boundary:** The classroom sizes 3–7 are illustrative, not Qwen limits.
- **Connection:** Page 6 consolidates the entire availability journey.
- **If removed:** Learners could overgeneralise the earlier fixed five-Token picture.
- **Potential issue:** Slider movement marks completion immediately; acceptable evidence of exploration. Screen-reader value text is present.
- **Scores:** **5 / 5 / 5 / 5 / 5 / 5**.

#### 2.6 Your Context discovery

- **Big question:** What information did the model have available?
- **Why:** Consolidates long text → window → available context.
- **Entering knowledge:** All Context pages.
- **New idea / child explanation:** Availability is a necessary first filter; usefulness comes next.
- **Visual teaching / purpose:** Three-stage route and discovery list reduce five interactions to one model.
- **Interaction:** Review and continue; no new task is appropriate on a synthesis page.
- **What changes / discovery:** Completion records only after all five recommended activities plus summary visit and onward action.
- **Technical truth:** Correctly stops before claiming all visible Tokens contribute equally.
- **Simplification / boundary:** Does not discuss attention masks or KV caches.
- **Connection:** Explicitly opens Lesson 3’s helpful-clue question.
- **If removed:** The distinction between “available” and “helpful” would be easier to miss.
- **Potential issue:** Partial activity state is not persisted across refresh.
- **Scores:** **5 / 5 / 5 / 3 / 5 / 5**.

### Lesson 3 — Finding Helpful Clues

#### 3.1 Some clues help more

- **Big question:** Do all visible Tokens help equally for the current question?
- **Why:** Separates Context availability from contribution.
- **Entering knowledge:** All shown Tokens are inside the Context Window.
- **New idea / child explanation:** Some visible pieces give stronger clues for one task.
- **Visual teaching / purpose:** Token strip, spotlight beams, question card and detective robot connect task to highlighted evidence.
- **Interaction:** Select the two most useful Tokens.
- **What changes / discovery:** Correct `dog + slept` become helpful while others recede.
- **Technical truth:** Transformer contributions are numerical and task/position dependent; this is a qualitative teaching proxy.
- **Simplification / boundary:** The model is not consciously “looking for clues”.
- **Connection:** Page 2 changes only the task to isolate what controls usefulness.
- **If removed:** Lesson 3 loses its fundamental contrast.
- **Potential issue:** Required answer is narrowly reviewed; copy correctly frames it as a classroom task.
- **Scores:** **5 / 5 / 5 / 5 / 4 / 5**.

#### 3.2 The task changes the clues

- **Big question:** Is a Token always equally helpful?
- **Why:** Shows relevance is relational, not a permanent property of a word.
- **Entering knowledge:** Some Tokens contributed strongly to sleeping question.
- **New idea / child explanation:** Keep the sentence; change the question; the useful pair changes.
- **Visual teaching / purpose:** Two tab-like tasks redirect a spotlight over the same strip.
- **Interaction:** Switch between both questions.
- **What changes / discovery:** `dog + slept` changes to `warm + fire`.
- **Technical truth:** Real attention-like relationships arise from numerical representations and current positions, not explicit English questions.
- **Simplification / boundary:** The model note states that the question switch is a classroom picture.
- **Connection:** Page 3 shows several relationships contributing together.
- **If removed:** Students may treat “helpful Token” as a fixed label.
- **Potential issue:** `role=tablist` requires manual keyboard-arrow behaviour review; buttons remain Tab-accessible but full tab semantics could be improved.
- **Scores:** **5 / 5 / 5 / 5 / 4 / 5**.

#### 3.3 Clues can work together

- **Big question:** Can several earlier Tokens contribute at the same time?
- **Why:** Avoids the false idea that the model chooses one single clue.
- **Entering knowledge:** Relevance can change with the task.
- **New idea / child explanation:** Several relationships can add information to an updated representation.
- **Visual teaching / purpose:** Detective board and connecting threads externalise many-to-one contribution.
- **Interaction:** Reveal clue links progressively or all at once.
- **What changes / discovery:** Coat, street and cold connect to the target explanation.
- **Technical truth:** Attention combines weighted information across representations; real models do not reason as detectives.
- **Simplification / boundary:** No fake attention weights or live model claim; technical word is optional.
- **Connection:** Page 4 adds position/order to those relationships.
- **If removed:** The curriculum would suggest a single-keyword matching system.
- **Potential issue:** All three English clues are fixed; the teaching value is causal visualisation, not open-ended language analysis.
- **Scores:** **5 / 4 / 5 / 5 / 4 / 5**.

#### 3.4 Order changes relationships

- **Big question:** Why is a bag of words not enough?
- **Why:** Adds position information without teaching positional encodings directly.
- **Entering knowledge:** Several Tokens can contribute.
- **New idea / child explanation:** Same words in a new order can describe different roles.
- **Visual teaching / purpose:** Parallel numbered tracks make the swap and actor positions inspectable.
- **Interaction:** Identify who chases in both sentences.
- **What changes / discovery:** Correct actor changes from dog to cat with order.
- **Technical truth:** Transformer representations incorporate position/order information.
- **Simplification / boundary:** The activity shows linguistic consequence, not the internal encoding method.
- **Connection:** Page 5 asks the learner to apply helpful relationships to new examples.
- **If removed:** The course risks teaching relevance without sequence.
- **Potential issue:** Completion is pedagogical but not part of stored required activities; learners may skip it without affecting Mission completion.
- **Scores:** **5 / 5 / 5 / 5 / 5 / 5**.

#### 3.5 Find the helpful clues

- **Big question:** Which visible Tokens directly support the current task?
- **Why:** Gives independent practice after three guided demonstrations.
- **Entering knowledge:** Relevance depends on task, multiple clues and order.
- **New idea / child explanation:** Build a short evidence path for a reviewed question.
- **Visual teaching / purpose:** Workbench, selected-clue path and target keep input, action and result spatially separate.
- **Interaction:** Select Tokens, check, retry and swap examples.
- **What changes / discovery:** Correct selections generate a plain-language causal explanation.
- **Technical truth:** Activity is a proxy for learned numerical relations, not measured attention.
- **Simplification / boundary:** Copy admits other reasonable clues in real language.
- **Connection:** Page 6 maps useful relations into prediction preparation.
- **If removed:** Lesson would not test transfer beyond the original dog sentence.
- **Potential issue:** One correct set can oversimplify ambiguity; boundary wording mitigates it.
- **Scores:** **5 / 5 / 5 / 5 / 4 / 5**.

#### 3.6 Your clue-finding discovery

- **Big question:** How do helpful relationships move the process toward output?
- **Why:** Prevents Lesson 3 becoming an isolated detective game.
- **Entering knowledge:** Available Context and useful ordered relationships.
- **New idea / child explanation:** Numerical relationships combine information into an updated representation used for next-token comparison.
- **Visual teaching / purpose:** Five-stage route connects Context, clues, combination, updated representation and prediction.
- **Interaction:** Review and continue; completion remains based on three meaningful activities.
- **What changes / discovery:** No new simulation; learner receives an explicit accuracy reminder.
- **Technical truth:** Properly avoids claiming that models literally highlight words.
- **Simplification / boundary:** Feed-forward sublayers, residual streams and multiple heads/layers are intentionally omitted.
- **Connection:** Hands processed Context directly to Lesson 4.
- **If removed:** The course would jump from clue games to probability bars with no computational bridge.
- **Potential issue:** “Updated representation” is abstract and may require adult help for some 12-year-olds.
- **Scores:** **5 / 4 / 5 / 3 / 5 / 4**.

### Lesson 4 — Predicting the Next Token

#### 4.1 Several Tokens could come next

- **Big question:** Is there always only one possible next Token?
- **Why:** Establishes a candidate set before scores or probabilities.
- **Entering knowledge:** Processed Context is ready for prediction.
- **New idea / child explanation:** Many vocabulary pieces compete for one empty next position.
- **Visual teaching / purpose:** Prompt strip, empty slot and candidate launch pads show one position with several options.
- **Interaction:** Select at least two plausible candidates.
- **What changes / discovery:** Multiple selections remain plausible; there is not one prewritten full sentence.
- **Technical truth:** A language-model output layer scores the vocabulary for the next position.
- **Simplification / boundary:** Candidate subset is reviewed and tiny, not the full vocabulary.
- **Connection:** Page 2 provides a way to compare candidates.
- **If removed:** Probabilities could be misread as a multiple-choice quiz rather than vocabulary scoring.
- **Potential issue:** Capitalisation of “Token” is inconsistent with common prose style but consistent within this Lesson.
- **Scores:** **5 / 5 / 5 / 4 / 5 / 5**.

#### 4.2 Candidates get different chances

- **Big question:** How can possible Tokens be compared?
- **Why:** Introduces scores and probabilities before selection.
- **Entering knowledge:** Several candidates can fit.
- **New idea / child explanation:** The Context gives candidates different numerical fit scores, shown as chances adding to 100%.
- **Visual teaching / purpose:** Score ribbons and printed percentages provide redundant, accessible magnitude cues.
- **Interaction:** Reveal scores and pick the highest.
- **What changes / discovery:** Hidden comparisons become visible; `mat` is highest in the reviewed example.
- **Technical truth:** Logits can be transformed into a probability distribution. Probability is not factual confidence.
- **Simplification / boundary:** Values are reviewed teaching data, not Qwen inference.
- **Connection:** Page 3 separates distribution from decoding rule.
- **If removed:** Learners would see selection without understanding candidate comparison.
- **Potential issue:** “Chances add to 100%” is clear but the visible subset must indeed total 100; teaching data should remain tested.
- **Scores:** **5 / 4 / 5 / 5 / 5 / 4**.

#### 4.3 One rule chooses one Token

- **Big question:** Must the highest-probability Token always be selected?
- **Why:** Distinguishes model scores from decoding behaviour.
- **Entering knowledge:** Candidate Tokens have different probabilities.
- **New idea / child explanation:** One rule always takes the highest; another samples so lower options can sometimes appear.
- **Visual teaching / purpose:** Two mode cards and a selection gate show the rule as a separate stage.
- **Interaction:** Run both highest-chance and chance-based modes repeatedly.
- **What changes / discovery:** Highest stays `mat`; fixed reviewed sampling can yield another plausible Token.
- **Technical truth:** Greedy decoding and sampling are real decoding strategies.
- **Simplification / boundary:** Sampling uses a fixed classroom sequence, not random Qwen generation; stated as such.
- **Connection:** Page 4 follows the chosen Token into Context.
- **If removed:** Students may equate probabilities with deterministic output.
- **Potential issue:** “Chance-based” can be misunderstood as arbitrary; higher probabilities remaining more likely is explicitly stated.
- **Scores:** **5 / 4 / 5 / 5 / 5 / 4**.

#### 4.4 Add the Token to the text

- **Big question:** What happens immediately after selection?
- **Why:** Makes autoregression causal rather than magical.
- **Entering knowledge:** One Token has been selected.
- **New idea / child explanation:** The selected piece joins the text and changes what the model sees next.
- **Visual teaching / purpose:** Carried Token, before/after strip and new empty slot show state transition.
- **Interaction:** Add the Token.
- **What changes / discovery:** `mat` becomes part of the prompt; a new `next?` appears.
- **Technical truth:** Generated Token is appended and becomes input for the next step.
- **Simplification / boundary:** Does not expose caches or full forward-pass computation.
- **Connection:** Page 5 repeats this operation multiple times.
- **If removed:** The prediction loop would omit its feedback step.
- **Potential issue:** None found in source-level review.
- **Scores:** **5 / 5 / 5 / 5 / 5 / 5**.

#### 4.5 Predict, add and repeat

- **Big question:** How can one-Token decisions create longer text?
- **Why:** Synthesises Pages 1–4 into a reusable generation loop.
- **Entering knowledge:** Candidates → scores → rule → selected Token → updated Context.
- **New idea / child explanation:** Each addition creates a new situation and therefore a new candidate set.
- **Visual teaching / purpose:** Story machine, candidate tray and growing sentence keep cycle state visible.
- **Interaction:** Select/place, use teaching choice, undo, restart and change starter.
- **What changes / discovery:** Story and candidate set update after every placed Token.
- **Technical truth:** Autoregressive generation repeats a next-token forward pass.
- **Simplification / boundary:** Fixed local candidate tree; no Qwen weights or inference.
- **Connection:** Page 6 names every stage, then asks where scores came from.
- **If removed:** Learner may know one prediction step but not text generation.
- **Potential issue:** Many controls increase cognitive load; primary Place action remains visually dominant.
- **Scores:** **5 / 5 / 5 / 5 / 5 / 5**.

#### 4.6 Your prediction discovery

- **Big question:** What is the complete generation loop?
- **Why:** Reconnects all parts and hands a precise question to training.
- **Entering knowledge:** All Lesson 4 interactions.
- **New idea / child explanation:** Processed Context creates scores, probabilities and selection; selected Token joins Context; repeat.
- **Visual teaching / purpose:** Six-node route plus discovery list gives both diagrammatic and verbal recap.
- **Interaction:** Review and continue; four key activities are required for genuine completion.
- **What changes / discovery:** A truth note separates likelihood from truth/safety.
- **Technical truth:** Causal order is correct at the intended level.
- **Simplification / boundary:** Omits vocabulary projection details and temperature/top-k/top-p.
- **Connection:** Asks how the model learned which patterns deserve higher scores.
- **If removed:** Lesson 5 would not have a clear target for its training explanation.
- **Potential issue:** The truth/safety sentence is AI-literacy adjacent, but remains one boundary line attached to probability interpretation.
- **Scores:** **5 / 5 / 5 / 3 / 5 / 5**.

### Lesson 5 — Learning from Training Examples

#### 5.1 Practise predicting the next Token

- **Big question:** What task does a model practise during training?
- **Why:** Reuses the now-familiar generation task instead of introducing training abstractly.
- **Entering knowledge:** Learner can predict a next Token.
- **New idea / child explanation:** During training, the text already contains the real next Token, so the prediction can be checked.
- **Visual teaching / purpose:** Fill-the-gap card, candidate tray and hidden target show prediction before answer.
- **Interaction:** Pick a prediction and compare with the actual Token.
- **What changes / discovery:** The hidden target `ball` is revealed beside the chosen prediction.
- **Technical truth:** Next-token language-model training uses known subsequent Tokens as targets.
- **Simplification / boundary:** One tiny example stands for batches of enormous token datasets.
- **Connection:** Page 2 measures how far prediction was from the target.
- **If removed:** Correction would appear without a practice prediction to correct.
- **Potential issue:** Any choice triggers completion after reveal; this is correct because the objective is observe comparison, not guess correctly.
- **Scores:** **5 / 5 / 5 / 5 / 5 / 5**.

#### 5.2 Compare prediction and answer

- **Big question:** How can the system tell whether the actual Token received enough probability?
- **Why:** Introduces the correction signal without starting with the word “loss”.
- **Entering knowledge:** Prediction and actual target can differ.
- **New idea / child explanation:** If the real answer had low probability, the prediction gap is larger.
- **Visual teaching / purpose:** Before-correction bars and answer flap make target probability visible.
- **Interaction:** Compare low-target and high-target states.
- **What changes / discovery:** `ball` probability and gap label change together.
- **Technical truth:** Training loss penalises low probability on the correct next Token.
- **Simplification / boundary:** Does not calculate cross-entropy; technical note comes after the concrete comparison.
- **Connection:** Page 3 asks what the correction changes.
- **If removed:** Parameter adjustment would have no causal signal.
- **Potential issue:** This is cognitively dense; “prediction gap” should remain the primary phrase and “loss” optional.
- **Scores:** **5 / 4 / 5 / 5 / 5 / 4**.

#### 5.3 Adjust many numbers slightly

- **Big question:** What changes after an error is measured?
- **Why:** Prevents the misconception that the model stores a corrected sentence in one box.
- **Entering knowledge:** There is a larger/smaller target gap.
- **New idea / child explanation:** Many internal numerical settings move a tiny amount so future scores can improve.
- **Visual teaching / purpose:** Multiple dials changing together depict distributed adjustment.
- **Interaction:** Apply one tiny adjustment.
- **What changes / discovery:** Several dial values and illustrative probabilities shift.
- **Technical truth:** Optimisation updates many parameters using gradients; updates are distributed.
- **Simplification / boundary:** Values are illustrative, not Qwen weights; no live training occurs.
- **Connection:** Page 4 repeats this process over many example groups.
- **If removed:** Training becomes “compare answers” without learning.
- **Potential issue:** The dial-to-probability mapping could imply direct one-dial/one-word control; copy should continue stressing distributed changes.
- **Scores:** **5 / 4 / 5 / 4 / 4 / 4**.

#### 5.4 Repeat with many examples

- **Big question:** How do tiny adjustments become useful patterns?
- **Why:** Scale and repetition are essential to distinguish training from one correction.
- **Entering knowledge:** One example causes a small distributed update.
- **New idea / child explanation:** Repeating prediction/correction across many related examples strengthens reusable patterns.
- **Visual teaching / purpose:** Example-group conveyor and before/after probability pattern show accumulation.
- **Interaction:** Process multiple reviewed groups.
- **What changes / discovery:** Group results appear; money example changes the displayed `bank` continuation pattern.
- **Technical truth:** Repeated optimisation over varied examples shapes model parameters.
- **Simplification / boundary:** Tiny controlled groups stand in for huge datasets and many training steps.
- **Connection:** Page 5 distinguishes applying patterns from exact copying.
- **If removed:** Learner may think one correction teaches the whole behaviour.
- **Potential issue:** Completion requires two groups, not every group; sufficient to show repetition while keeping task length reasonable.
- **Scores:** **5 / 5 / 5 / 5 / 5 / 5**.

#### 5.5 Patterns are not perfect memory

- **Big question:** Is model learning just copying training sentences?
- **Why:** Corrects a likely misconception created by repeated examples.
- **Entering knowledge:** Repetition strengthens patterns.
- **New idea / child explanation:** Exact repetition is copying; applying a learned relation to new wording is generalisation.
- **Visual teaching / purpose:** Paired training/new-text cards make same-versus-related visible.
- **Interaction:** Classify one exact and one related example.
- **What changes / discovery:** Correct pair produces explanatory feedback.
- **Technical truth:** Language models can both memorise and generalise; the activity distinguishes concepts without claiming no memorisation.
- **Simplification / boundary:** Two examples cannot prove generalisation; they illustrate the distinction.
- **Connection:** Page 6 combines training and generation.
- **If removed:** Learners may equate parameters with a searchable sentence database.
- **Potential issue:** The phrase “patterns are not perfect memory” must not be read as “models never memorise”; caution copy should remain.
- **Scores:** **5 / 5 / 5 / 5 / 4 / 5**.

#### 5.6 The complete training loop

- **Big question:** Where do next-token scoring patterns come from, and when are they used?
- **Why:** It is the curriculum’s final causal synthesis.
- **Entering knowledge:** Full generation and training sub-processes.
- **New idea / child explanation:** Training learns parameter patterns; generation later uses them to continue text.
- **Visual teaching / purpose:** Separate training loop, generation flow and five-Lesson map prevent the two phases being conflated.
- **Interaction:** Review and enter the Final Challenge; genuine Lesson completion still requires five activities.
- **What changes / discovery:** Course map joins Tokens, Context, relationships, selection and training.
- **Technical truth:** Correctly separates optimisation from inference and notes repeated Transformer layers/billions of parameters.
- **Simplification / boundary:** Omits pretraining/fine-tuning distinctions, optimiser mathematics and architecture internals beyond the taught chain.
- **Connection:** Final Challenge synthesises the same mechanisms.
- **If removed:** Students could finish the course without answering where scores came from.
- **Potential issue:** Highest information density in the course; diagrams should be read in a deliberate top-to-bottom order during manual QA.
- **Scores:** **5 / 4 / 5 / 3 / 5 / 4**.

## 5. Causal-chain audit

### Generation chain

| Link | Where taught | Verdict |
| --- | --- | --- |
| Text → Token pieces | L1 P1–P3 | Clear; authentic Qwen result replaces metaphor. |
| Tokens → IDs → numerical representations | L1 P3, P6 | Clear with strong real/illustrative boundary. |
| Numerical sequence → finite Context | L2 P1–P3 | Clear; order and finite availability visible. |
| Context → useful relationships | L3 P1–P5 | Clear as a qualitative attention-like model. |
| Updated representation → candidate scores | L3 P6, L4 P1–P2 | Explicit bridge. |
| Scores → probabilities | L4 P2 | Accurate at age-appropriate depth. |
| Probabilities + decoding rule → selected Token | L4 P3 | Clear separation. |
| Selected Token → updated Context | L4 P4 | Strongest single causal transition. |
| Updated Context → repeat | L4 P5–P6 | Clear autoregressive loop. |

### Training chain

| Link | Where taught | Verdict |
| --- | --- | --- |
| Existing text supplies next-Token targets | L5 P1 | Clear. |
| Prediction compared with actual target | L5 P1–P2 | Clear. |
| Gap drives distributed parameter adjustment | L5 P2–P3 | Accurate but cognitively demanding. |
| Repetition over examples shapes patterns | L5 P4 | Clear. |
| Patterns can transfer beyond exact copies | L5 P5 | Clear with stated boundary. |
| Training learns; generation uses | L5 P6 | Explicit and central. |

No causal link is entirely missing. The weakest bridge is conceptual rather than absent: L1 P6’s illustrative number row to L3’s updated representation necessarily skips many Transformer details. For the stated age and scope, this is an acceptable simplification as long as the course does not imply those few displayed values are real model state.

## 6. Lesson-level difficulty and support estimates

Scale: 1 = very low, 5 = high. Adult-help estimate assumes independent English reading by ages 12–14.

| Lesson | Reading demand | Conceptual difficulty | Interaction complexity | Cognitive load | Misconception risk | Adult help likely |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 Tokens and numbers | 2 | 3 | 3 | 3 | 3 | 2 |
| 2 Reading Context | 2 | 2 | 3 | 2 | 2 | 1 |
| 3 Helpful Clues | 2 | 3 | 3 | 3 | 4 | 2 |
| 4 Next-Token Prediction | 3 | 3 | 4 | 3 | 3 | 2 |
| 5 Training | 3 | 4 | 3 | 4 | 4 | 3 |

### Support interpretation

- Lesson 2 is the most independently accessible and can serve as the visual/pacing benchmark.
- Lesson 3 needs repeated reminders that “clue finding” is a picture of numerical contribution, not conscious reasoning.
- Lesson 4’s probability and decoding distinction is essential; do not merge Pages 2 and 3.
- Lesson 5 should retain optional technical disclosure. Showing “loss”, gradients and parameter mathematics before the visual comparison would increase adult-help need.

## 7. Page score summary and merge/removal candidates

The detailed six-part scores appear in each page record. No page scores 2 or below for **teaching necessity**, **clarity**, **technical accuracy** or **age suitability**. Summary pages score 3 for interaction usefulness by design; they perform synthesis and state-transition duties and should not be removed merely for lacking a new activity.

### Candidate status

- **No removal candidate:** Every page introduces, tests, applies or consolidates a distinct necessary link.
- **Do not merge L4 P2 and P3:** Candidate probability and decoding rule are frequently conflated; keeping separate pages is pedagogically valuable.
- **Do not merge L5 P2 and P3:** Error signal and parameter update are different causal stages, despite adjacent complexity.
- **Possible future copy trim, not merge:** L1 P1 repeats the Token definition in hero and card; remove one repetition only if testing confirms scanning fatigue.

## 8. AI-literacy drift audit

### Official pages

The official 31 pages stay focused on mechanism. The following adjacent ideas remain, but each supports accuracy rather than becoming a new topic:

- L2: Context is finite and not human memory.
- L3: The model does not investigate like a human detective.
- L4: High probability is not factual truth or confidence.
- L5: Generalisation is not guaranteed; teaching numbers are not live weights.

These are appropriate misconception guards. There are no official pages devoted to hallucination detection, fact checking, bias, ethics, responsible use or misinformation.

### Legacy risk

Legacy scrolling components in `src/main.jsx` and `src/mission2/Mission2PredictionPages.jsx` still contain hallucination, verification, bias and hard-unlock language. Official `courseData.js`, Home/Missions navigation and paged onward actions do not point to them. Nevertheless, old direct URLs can still expose them. This is the clearest remaining source of product-position drift and should be handled in a dedicated compatibility cleanup by redirecting legacy URLs to semantically matching official paged Lessons, after checking external bookmarks.

## 9. UI/UX consistency audit

### Shared strengths

- One persistent paged shell supplies Back to Missions, Lesson identity, page count, progress dots, title focus and fixed Back/Next navigation.
- All official Lessons use playful coloured teaching scenes, restrained gradients, rounded cards, Lucide-style icons and consistent robot assets.
- Page-number markers and one-question headings establish a repeatable rhythm.
- Required interactions use visible result changes and textual feedback rather than colour alone.
- Fixed footer safe-area padding is present across Mission CSS.
- Lesson-specific CSS includes responsive breakpoints and `prefers-reduced-motion` handling.

### Source-level risks requiring visual confirmation

1. Horizontal Context tracks intentionally scroll; verify the frame remains aligned at 375, 520, 760, 980, 1180 and 1440 px.
2. French/German labels can be longer than English; verify summary maps and action rows do not overflow.
3. Lesson 4 Page 5 has five actions; verify wrapping preserves a dominant primary action on tablet/mobile.
4. Lesson 5 Page 6 contains three maps; verify fixed footer never covers the last CTA.
5. `role=tablist` controls in Lessons 3–5 are Tab-accessible but may not implement arrow-key tab semantics.
6. Decorative robot images are correctly hidden from assistive technology in page scenes; hero robot alt text remains meaningful.

### Browser limitation

The in-app browser controller returned no available browser in this session. Therefore no new screenshot, live Console, real focus-outline or pointer test is claimed here. Automated and source checks are evidence, not a substitute for the manual viewport matrix.

## 10. Bug and finding log

| ID | Severity | Finding | Status |
| --- | --- | --- | --- |
| P13-01 | Medium | Official Lesson 2–5 summary notices/actions contained hard-coded English, causing mixed-language UI. | **Fixed** using existing i18n keys. |
| P13-02 | Medium | Legacy direct Mission URLs can expose obsolete locks and AI-literacy curriculum. | **Open; not auto-fixed** because semantic redirects require a deliberate bookmark/compatibility decision. |
| P13-03 | Low | Partial in-Lesson activity/visited state is React session state and resets on refresh. Stored completion remains safe. | **Open recommendation.** |
| P13-04 | Low | Some tablist controls do not show explicit arrow-key management in source. | **Open accessibility enhancement.** |
| P13-05 | Low | L2 P3 marks the activity after the first added Token, before the window necessarily shifts. | **Open teaching-evidence refinement.** |
| P13-06 | Observation | Route slugs and storage IDs use legacy names/numbers. Learner-facing labels are correct. | **Documented; no migration advised now.** |
| P13-07 | Verification limit | No controllable browser was available for screenshot/Console acceptance. | **Manual QA required.** |

## 11. Recommendations not implemented

### High priority

1. **Canonicalise legacy Mission URLs** after mapping each old semantic route to the correct new Lesson. Preserve browser history and external links with safe redirects; do not revive legacy components.
2. **Run the full manual viewport matrix** for all 31 pages, with special attention to Context alignment, fixed footer overlap and long translations.

### Medium priority

1. Persist optional in-progress activity evidence separately from `missionComplete`, so a refresh does not erase a learner’s unfinished experiment state.
2. Add an end-to-end browser suite that clicks Next/Back, browser Back/Forward, invalid query recovery and each required activity from clean storage.
3. Add keyboard arrow behaviour or change tablist semantics to a simpler button group where appropriate.
4. Consider requiring the first actual window shift, rather than one Token addition, for L2 P3 activity completion.

### Low priority

1. Standardise prose capitalisation of “Token/token” without changing technical meaning.
2. Reduce the duplicated L1 P1 definition only if learner testing shows it feels repetitive.
3. Add visual regression snapshots for representative explanatory, activity and summary pages in every Lesson and at mobile/tablet/desktop widths.

## 12. Test evidence

### Automated suites passed

- `npm run test:tokenizer` — 12 Qwen fixtures.
- `npm run test:mission1`
- `npm run test:mission1-paged`
- `npm run test:mission2-paged`
- `npm run test:mission3-paged`
- `npm run test:mission4-paged`
- `npm run test:mission5-paged`
- `npm run test:p13-acceptance`
- `npm run test:p14-final-challenge`
- `npm run test:paged-missions`
- `npm run test:paged-navigation`
- `npm run test:curriculum`
- `npm run test:token-lab`
- `npm run test:numbers-stage`
- `npm run test:context-stage`
- `npm run test:prediction-stage`
- `npm run test:compare-stage`

All 17 listed suites passed again after the audit repair. `npm run build` also passed and generated SPA fallbacks for 25 routes. Vite reported its existing large-chunk advisory (main JavaScript approximately 946 kB before gzip); this is a performance recommendation, not a build error. `git diff --check` passed with no whitespace errors.

## 13. Manual browser acceptance checklist

For each official route/page at 1440, 1180, 980, 760, 520 and 375 px:

1. Open directly and refresh; confirm same React page and no blank state.
2. Use Next, Back, browser Back and Forward; confirm URL, content and heading focus.
3. Enter an invalid `page` query; confirm Page 1 without crash.
4. Skip to a later page; confirm non-blocking notice and both actions.
5. Complete the activity; confirm visible causal result and no accidental navigation.
6. Refresh before completion; confirm stored Mission progress is not falsely completed.
7. Complete all required activities, visit summary and use onward CTA; confirm exactly one Mission completes.
8. Repeat completion; confirm idempotent state.
9. Inspect Console for runtime, i18n and asset errors.
10. Verify keyboard focus, focus outline, Tab order, slider/button semantics and reduced-motion mode.
11. Verify no content is obscured by the fixed footer and no horizontal page overflow appears.
12. Switch English/Chinese/French/German and check for raw keys, English-only structural text and overflow.

## 14. Final eight-question self-evaluation

| Question | Answer | Evidence |
| --- | --- | --- |
| 1. Does the course clearly answer “How do LLMs work?” | **YES** | The official path teaches both generation and training causal chains, not a set of unrelated literacy topics. |
| 2. Can a learner explain text-to-output in order? | **YES, at the intended simplified level** | Every link is introduced on a dedicated page and reassembled in L4 P6/L5 P6. |
| 3. Are tokenizer and model responsibilities separated? | **YES** | Real Qwen tokenisation is identified; embeddings/numerical rows require model weights and are labelled illustrative. |
| 4. Are all interactions purposeful? | **PARTLY** | Core interactions create visible causal change; summary pages intentionally review rather than add new mechanics. L2 P3 completion evidence could be stricter. |
| 5. Are access, visit and completion separate? | **YES on official flow** | Page/route access is free; visit does not complete; required activities plus summary/onward action complete Lessons. |
| 6. Is the curriculum technically honest? | **YES** | No fake Qwen inference, attention weights, embeddings or live training are claimed; classroom data is labelled. |
| 7. Is it independently usable by ages 12–14? | **PARTLY** | Reading and visual scaffolding are strong; L1 P6, L3 P6 and L5 P2–P3/P6 may need teacher support for some learners. |
| 8. Is the implementation fully production-accepted? | **NO, not from this audit alone** | Automated/build/HTTP evidence is strong, but real-browser visual, console and accessibility acceptance remains outstanding. |

## Final conclusion

The official five-Lesson curriculum is now coherent enough to support the project claim: **AI Explorer helps school students understand, at a simplified but honest level, how a language model turns text into Tokens, uses Context and useful relationships, predicts one Token at a time, and learns those prediction patterns from examples.**

No new feature or broad redesign is needed before manual browser acceptance. The next work should be verification and narrowly scoped fixes, especially legacy-route canonicalisation and real viewport/accessibility testing—not additional curriculum topics.
