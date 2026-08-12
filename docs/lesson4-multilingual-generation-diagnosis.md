# Lesson 4 multilingual generation diagnosis

## Conclusion

The malformed multilingual continuations are predominantly a **model capability
limitation**, amplified by greedy decoding and long generation lengths. They are
not caused by stale logits, a duplicated append, or a KV-cache position bug.

The official SmolLM2 model card says that the family primarily understands and
generates English. The current checkpoint is also instruction-tuned, whereas the
Lesson 4 activity intentionally performs raw-prefix causal completion.

## Generation-state findings

- The server does not carry a KV cache between requests. It recomputes the full
  accumulated ID sequence on every step.
- The attention mask contains one value per input ID and grows with the input.
- Logits are read from `sequenceLength - 1` on every fresh forward pass.
- Step N+1 consumes the exact `next_input_token_ids` returned by step N.
- Every step appends the selected ID exactly once and increases input length by
  exactly one.
- UI text and the next model input are derived from the same cumulative IDs.
- No top-p, sampling top-k, repetition penalty, or no-repeat n-gram rule is used.
  `top_k: 5` controls only how many candidates are displayed.
- The LivePredictionLab currently requests `mode: "greedy"`. Temperature changes
  the displayed softmax distribution but not the greedy argmax choice.

## Unicode finding for the recorded character

For the raw prefix `小猫坐在`, greedy generation selected Token ID `132` at
generation step 6. In its accumulated byte context it decodes to:

- `氷` — U+6C37

At that step `水` (U+6C34) was a separate second-ranked candidate. Later the
probability of ID 132 rose above 97%, creating a genuine model repetition loop.
This is valid Unicode selected by the model, not font corruption. It must not be
normalised or replaced with `水`.

## Baseline (raw-prefix, greedy, temperature 1.0)

Repetition is measured over selected Token IDs.

| Locale | Tokens | Unigram repeat | Bigram repeat | Trigram repeat | EOS | Valid Unicode | Example output |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| EN | 10 | 10.0% | 0.0% | 0.0% | No | Yes | `The little robot opened the door and the room was filled with the soft,` |
| EN | 20 | 15.0% | 0.0% | 0.0% | No | Yes | `The little robot opened the door and the room was filled with the soft, warm light of the fire. It was a cozy` |
| ZH | 10 | 60.0% | 44.4% | 25.0% | No | Yes | `小机器人打开了水水的水` |
| ZH | 20 | 75.0% | 63.2% | 50.0% | No | Yes | `小机器人打开了水水的水水水，水` |
| FR | 10 | 10.0% | 0.0% | 0.0% | No | Yes | `Le petit robot a ouvert leur 100% de la v` |
| FR | 20 | 30.0% | 21.1% | 16.7% | No | Yes | `Le petit robot a ouvert leur 100% de la vue, avec un 100%` |
| DE | 10 | 40.0% | 22.2% | 0.0% | No | Yes | `Der kleine Roboter öffnete, 1999, 20` |
| DE | 20 | 70.0% | 42.1% | 16.7% | No | Yes | `Der kleine Roboter öffnete, 1999, 2000, 2001, ` |

No locale emitted EOS in the 100-Token greedy run. At 100 Tokens, unigram
repetition reached 73% (EN), 95% (ZH), 74% (FR), and 88% (DE). English remains
relatively coherent at 10–20 Tokens; Chinese, French, and German are already
incoherent or degenerating within that range.

## Raw prefix versus official chat template

The tokenizer defines an official ChatML-style template. An A/B run showed that
applying it does not fix the teaching task:

- EN chat output entered a repeated `little robot` pattern.
- ZH chat input produced an English response.
- FR mostly echoed the user text and emitted EOS.
- DE produced an English conversational response.

This is expected: a chat template asks the instruct model to answer a user,
whereas the lesson demonstrates continuation of the visible prefix. Silently
adding a chat instruction would change the experiment and should not be used as
a cosmetic quality fix.

## Product options (not implemented)

1. **Keep the current model and shorten the default demonstration.** This best
   matches the lesson's focus on several next-Token decisions rather than long
   prose, but it cannot make the current Chinese prompt coherent even at 10
   Tokens.
2. **Benchmark simpler locale-specific prefixes.** Outputs would remain genuine
   inference, but starters should be selected using recorded evidence and not
   hardcoded continuations.
3. **Evaluate a multilingual base causal LM.** Qwen2.5-0.5B is a plausible
   feasibility candidate: its official card lists Chinese, English, French and
   German among 29+ supported languages, it is Apache-2.0, and a Transformers.js
   ONNX conversion exists. Its q4f16 ONNX weight is about 483 MB versus the
   current model's approximately 181 MB, so memory, cold start, CPU latency and
   hosting limits must be benchmarked before any switch.

The subsequent minimal model-swap phase replaced the production checkpoint with
`onnx-community/Qwen2.5-0.5B` base at revision
`bae5ceaee026f0d0592858b2bd27645a06f19c42`. Prompt, UI, generation limit and
probability controls remained unchanged.
