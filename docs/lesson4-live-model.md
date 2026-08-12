# Lesson 4 Live Model Record

## Capability audit

The project already had a pinned Qwen tokenizer, but a tokenizer cannot produce
next-Token logits. Page 3 therefore requires a causal language model and its own
matching tokenizer. Teaching fixtures remain appropriate for Pages 1–2, but
they are never used as fallback output for the live page.

## Model bake-off

| Candidate | Strength | Deployment concern | Decision |
|---|---|---|---|
| DistilGPT2 | Small, established causal LM | Older English-only model; the reviewed school prompts produced less useful continuation quality than the selected model during the prior architecture audit | Not selected |
| SmolLM2 135M base | Small modern base model | Base checkpoint is less consistently usable for the short, learner-facing starters | Not selected |
| SmolLM2 135M Instruct | Small CPU-deployable model | Primarily English; raw Chinese, French and German continuations degraded quickly | Replaced |
| Qwen2.5 0.5B base | Multilingual raw-prefix continuation across the four lesson languages | Larger download and memory footprint | Selected and validated |

The base checkpoint is used directly for raw next-Token completion. No chat
template, hidden instruction, system prompt, or language-specific model routing
is applied.

## Selected checkpoint

- Repository: `onnx-community/Qwen2.5-0.5B`
- Revision: `bae5ceaee026f0d0592858b2bd27645a06f19c42`
- Upstream family: `Qwen/Qwen2.5-0.5B` (base)
- Runtime: `@huggingface/transformers` 3.8.1 on Node CPU
- Graph: q4 ONNX causal-language-model inference graph (about 786 MB)
- Licence: Apache-2.0

ONNX Runtime executes an exported inference graph and has no training mode.
Consequently the PyTorch-only `model.eval()` and `torch.inference_mode()` APIs
do not apply; no gradient or training path exists in this service.

## Inference pipeline

1. The model's tokenizer encodes the arbitrary learner text.
2. The causal model performs one forward pass.
3. The final sequence position is selected from the logits tensor.
4. Temperature is applied as `logits / temperature`.
5. A numerically stable softmax is calculated across all 151,936 vocabulary
   entries.
6. Five absolute top probabilities are returned without renormalising them.
7. Greedy mode chooses the full-distribution argmax; sampling support uses the
   full distribution.
8. The service returns the selected Token ID and the complete next ID sequence.
   Later forward passes reuse those IDs directly, avoiding decode/re-encode drift.
9. Learner-visible text is derived by the matching tokenizer decoding the full
   sequence. A candidate that is only part of a UTF-8 byte sequence is labelled
   as a byte fragment until the accumulated IDs decode to readable Unicode.

Leading spaces, punctuation, subwords, newline, tab, and special Tokens are not
trimmed from decoded contributions. Technical token pieces remain separate from
the context-aware learner-readable `display_token` value.

## Persistent service behaviour

`server/modelService.mjs` stores tokenizer and model promises at module scope.
The first request loads them; later requests reuse the same instance. A global
inference queue serializes model calls. The HTTP layer also rejects overlapping
requests carrying the same browser-session ID, rate-limits sessions, validates
request size and fields, and never substitutes fake candidates after failure.

## Validation evidence

- EN, ZH, FR and DE raw prefixes produced readable, context-specific candidates.
- All seven 15-Token smoke runs retained valid Unicode and exact cumulative IDs.
- The four Chinese prompts had 0% repeated bigrams and trigrams over 15 greedy
  Tokens. The former SmolLM comparison produced corruption and up to 64.3%
  repeated bigrams on the same prompts.
- Local q4 cold loading took about 29.7 seconds. The first warmed-model forward
  pass took about 93–116 ms; later 15-Token smoke passes averaged roughly
  105–128 ms per Token.
- The local Node process used about 2.6 GB RSS. The target Space is CPU Basic,
  so this is within its 16 GB memory allocation.
- A real sequential HTTP run generated 100 Tokens with one model load.

## Deployment

Render now runs one Node web service. It builds the Vite application, serves the
`dist` assets and SPA fallbacks, and exposes same-origin `/api/next-token`.
Learners do not download model weights and see no ONNX, WASM, WebGPU, PyTorch,
Render, or model-comparison details in the Page 3 UI.
