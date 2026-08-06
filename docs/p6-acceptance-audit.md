# Phase P6 acceptance audit

Audit basis: source, CSS, state transitions, focused tests and local HTTP route checks. The in-app browser reported no available browser, so the scores below are code-informed learner-experience estimates, not a claim of visual browser acceptance.

Score columns use the required 16-point rubric. “Before” records the P5 implementation; “After” records this refinement in English mode.

## Mission 1 — Language-model text processing

| Page | Objective | Meaningful action → visible result | Discovery and next connection | Score | Refinement / preserved behaviour |
|---|---|---|---|---:|---|
| 1 · What is tokenisation? | Text is split into pieces | Observe a sentence become tactile blocks | Tokens are text pieces → inspect real pieces | 15→15 | Approved scene unchanged; real fixture preserved |
| 2 · See it in action | A tokenizer can split common and uncommon text differently | Replay the reveal → verified pieces appear in order | Splits depend on tokenizer patterns → try text | 15→15 | Approved scene unchanged; Qwen result and Replay preserved |
| 3 · Try your own sentence | Input changes token pieces/count | Enter/preset text and tokenize → real Qwen pieces update | Changed text may change pieces → check the idea | 14→14 | 200-char limit, presets, retry and real tokenizer preserved |
| 4 · Check the idea | A token is a text piece, not necessarily a word | Choose and check → token-kind explanation appears | Tokens may be words, parts or punctuation → rebuild | 13→13 | Radio semantics and unlimited retry preserved |
| 5 · Rebuild the sentence | Token order matters | Drag/click/keyboard reorder → reconstructed sentence appears | Correct order rebuilds text → follow pieces into numbers | 14→14 | Touch, keyboard, drag, reset and real fixtures preserved |
| 6 · From pieces to numbers | An ID is a lookup label for a learned number row | Click token → reveal ID → follow ID → reveal teaching row | ID is not meaning/score; teaching values are not Qwen values | 9→14 | Added progressive lookup; accuracy boundary and optional terminology preserved |
| 7 · Mission discovery | Reconstruct text → pieces → ID → representation | Review chain; retry/restart/continue | Numerical representations feed later calculations → context shapes next tokens | 13→14 | Added correct Mission 2 route; strict completion preserved |

## Mission 2 — Context and next-token prediction

| Page | Objective | Meaningful action → visible result | Discovery and next connection | Score | Refinement / preserved behaviour |
|---|---|---|---|---:|---|
| 1 · Earlier words give clues | Earlier words support a likely meaning | Select “beside/river” → clues and meaning light up | Context clues influence likely meaning → compare scenes | 14→14 | Reviewed bank example preserved |
| 2 · Same word, different context | The same word can fit different meanings | Switch/replay scenes → clues reveal then meaning changes | Surrounding patterns change likely meaning → add clearer context | 15→15 | Timers, cancellation and reduced-motion final state preserved |
| 3 · Build a clearer request | Relevant detail makes a request more specific | Add/remove detail chips → prompt and reviewed response change | Relevant context helps; more is not always better → predict next | 11→13 | Local response composition preserved; causal bridge added |
| 4 · What might come next? | Several next tokens receive different chances | Switch context and inspect candidate → selection appears | Reviewed probabilities are simplified, not Qwen → repeat trials | 12→14 | Stronger candidate semantics, tab roles and labels |
| 5 · Why probabilities? | Likely does not mean guaranteed | Run once or eight reviewed selections → history and counts change | High-chance tokens appear more often but do not always win | 10→14 | Weighted selection preserved; repeatable batch observation added |
| 6 · Predictable or varied | Temperature changes distribution shape | Move slider → all bars redistribute | Distribution changes, not intelligence or human creativity | 11→14 | Existing transform retained; accessible value text and bridge added |
| 7 · Add and repeat | Generation repeats selection after adding a token | Pick/auto-pick → text grows and candidate set changes | One token is added, then prediction repeats | 12→14 | Undo, Restart, alternate prompt and reviewed continuation sets preserved |
| 8 · Mission discovery | Rebuild the complete causal chain | Inspect chain and complete only after core activities | Fluent generated text still is not proof of truth → Mission 3 | 12→14 | Strict completion and misconception correction preserved |

## Mission 3 — Mistakes, hallucinations and verification

| Page | Objective | Meaningful action → visible result | Discovery and next connection | Score | Refinement / preserved behaviour |
|---|---|---|---|---:|---|
| 1 · Prediction is not fact checking | Fluency and confirmation differ | Inspect/sort signs → each is labelled plausible or confirming | Smooth wording is not evidence → follow a mistake | 11→13 | Investigation styling and page bridge added |
| 2 · Confident mistake | Pattern following can create an incorrect answer | Reveal penguin trail → reality check appears | The model did not deliberately lie → ask what was missing | 10→14 | Concrete reviewed example replaces abstract labels |
| 3 · What may be missing? | Information can be unavailable, missing or outdated | Open shelves → availability categories reveal | Unavailable information cannot be used reliably → inspect evidence | 10→13 | Training/new/private/missing/outdated distinctions added |
| 4 · Check the evidence | Sources differ in relevance and strength | Inspect source cards → strong/weak role appears | Evidence should be relevant, suitable and current → detective case | 11→13 | Evidence workbench styling retained |
| 5 · Hallucination detective | Important claims need verification | Choose action for penguin claim → evidence explanation appears | Suitable evidence matters more than confident wording | 10→14 | Retry and non-punitive feedback preserved |
| 6 · Verification stakes | Possible harm changes checking care | Choose scenario → checking response changes | Higher consequence needs more careful verification | 10→13 | Added money plus health/safety cases |
| 7 · Mission discovery | Build a safe checking habit | Review investigation chain | Fluent pattern-based answer may still need evidence → training origins | 11→13 | Cross-Mission bridge added |

## Mission 4 — Training data and learned patterns

| Page | Objective | Meaningful action → visible result | Discovery and next connection | Score | Refinement / preserved behaviour |
|---|---|---|---|---:|---|
| 1 · What is training data? | Training uses collections of examples | Open example crates → selected kinds become tactile | Examples are used while values adjust → find repetitions | 11→13 | Data-scene treatment added |
| 2 · Examples become patterns | Training gradually adjusts numerical values across examples | Reveal groups → example/value/pattern chain appears | Repeated relationships become easier to predict | 10→14 | Explicit numerical-value adjustment added |
| 3 · Find the pattern | Infer a repeated input/output relationship | Choose label for “hola” → rule explanation appears | Repeated examples suggest a pattern → test new case | 11→13 | Retry preserved |
| 4 · Test the pattern | A learned pattern can apply to a similar example | Label a new phrase → generalisation appears | Patterns can help, but may be wrong → examine quality | 11→13 | Required test activity preserved |
| 5 · Data quality matters | Accuracy and variety matter | Compare two boxes → useful choice explained | Repeating incorrect data is not quality → choose relevance | 11→13 | Before/after contrast strengthened by scoped scene tone |
| 6 · More is not always better | Relevant examples beat unrelated additions | Pack examples → useful/weak states appear | Relevant, accurate, varied examples matter → clarify limits | 11→13 | Core example participation preserved |
| 7 · Classroom limits | Toy activity is not real LLM training | Reveal scale steps → real-vs-demo boundary appears | These clicks do not retrain Qwen/ChatGPT | 12→14 | Boundary wording and reduced-motion behaviour preserved |
| 8 · Mission discovery | Connect examples to later predictions | Review full chain | Training adjusts values; learned patterns shape predictions → bias | 11→13 | Cross-Mission bridge added |

## Mission 5 — Bias and responsible checking

| Page | Objective | Meaningful action → visible result | Discovery and next connection | Score | Refinement / preserved behaviour |
|---|---|---|---|---:|---|
| 1 · What is bias? | Bias is a systematic pattern, not only intention | Inspect balance metaphor → limitation appears | A balance is a clue, not a complete fairness test | 11→13 | Non-punitive visual retained |
| 2 · Imbalanced dataset | Representation can be visibly uneven | Count 9:1 cards and answer → imbalance is stated | One group dominates this teaching set → change it | 12→14 | Immediate 9:1 visual preserved |
| 3 · Change the balance | Data composition can be changed | Move accessible slider → people counts update | Equal counts help this toy representation but do not prove fairness | 11→14 | Added explicit fairness caveat and value text |
| 4 · Output pattern change | Input patterns may influence output tendencies | Compare counts/output bars → reviewed tendency changes | This is a teaching relationship, not live model output | 12→14 | Boundary and required acknowledgement preserved |
| 5 · Different causes | Bias can arise through several mechanisms | Open cause cards → four causes reveal | Imbalance, history, omissions and labels all matter | 10→13 | Cause-scene colour and tactile states added |
| 6 · How can we check? | Responsible checking combines actions | Build checklist → selected plan becomes visible | There is no one-button bias fix | 11→13 | aria-pressed and repeated exploration preserved |
| 7 · Responsible checker | Testing should consider affected groups | Choose school-club response → suitable action appears | Inspect data, compare outputs, consider people affected | 11→13 | Retry and non-shaming feedback preserved |
| 8 · Mission discovery | Rebuild the responsible-checking chain | Review synthesis and complete after required activities | Data patterns may shape outputs; people must inspect and test | 11→13 | Final Challenge gating remains separate and strict |

## Integration findings

- Learner-facing routes use five paged Missions. Legacy scrolling routes remain safe fallbacks.
- Storage mapping remains `1 → 1`, merged legacy `2 + 4 → 2`, `3 → 3`, `5 → 4`, `6 → 5` in learner-facing order.
- Guided Path and Explore Freely change presentation only. Neither writes completion.
- Direct final-page access cannot satisfy required activity sets.
- Final Challenge still checks five genuine Mission completions.
- No learner-facing Mission 6, Story Builder, AI Lab change, Escape Room change or new model data was introduced.

## Manual limitations

- Browser automation was unavailable, so 1440/1180/980/760/520/375 visual screenshots, click paths, Console and actual Tab-order acceptance remain manual checks.
- English learner copy received the full teaching-coherence audit. Shared controls and Mission 1/Mission 2 resource keys have four-language parity; Missions 3–5 learner-body copy still requires complete human-reviewed translation before non-English acceptance can be claimed.
