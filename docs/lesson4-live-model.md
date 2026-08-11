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
| SmolLM2 135M Instruct | Small CPU-deployable model; coherent completions on the reviewed starters | Still needs server memory and a first-load warm-up | Selected and validated |
| Qwen2.5 0.5B | Stronger and multilingual | Roughly four times the parameter count; materially higher RAM, download, and CPU latency for a one-Token educational endpoint | Not required after SmolLM2 passed |

The chosen checkpoint is not presented as the largest or “smartest” model. It
was selected because it passed real arbitrary-prompt and repeated-generation
checks while remaining realistic for a persistent CPU service.

## Selected checkpoint

- Repository: `onnx-community/SmolLM2-135M-Instruct-ONNX`
- Revision: `b8a5c0f183b78c55955a5364f610c36668b5e681`
- Upstream family: `HuggingFaceTB/SmolLM2-135M-Instruct`
- Runtime: `@huggingface/transformers` 3.8.1 on Node CPU
- Graph: q4 ONNX causal-language-model inference graph
- Licence: Apache-2.0

ONNX Runtime executes an exported inference graph and has no training mode.
Consequently the PyTorch-only `model.eval()` and `torch.inference_mode()` APIs
do not apply; no gradient or training path exists in this service.

## Inference pipeline

1. The model's tokenizer encodes the arbitrary learner text.
2. The causal model performs one forward pass.
3. The final sequence position is selected from the logits tensor.
4. Temperature is applied as `logits / temperature`.
5. A numerically stable softmax is calculated across all 49,152 vocabulary
   entries.
6. Five absolute top probabilities are returned without renormalising them.
7. Greedy mode chooses the full-distribution argmax; sampling support uses the
   full distribution.
8. The frontend appends `selected.raw_token` and sends the new text for the next
   real forward pass.

Leading spaces, punctuation, subwords, newline, tab, and special Tokens are not
trimmed from `raw_token`. `display_token` is a separate learner-readable value.

## Persistent service behaviour

`server/modelService.mjs` stores tokenizer and model promises at module scope.
The first request loads them; later requests reuse the same instance. A global
inference queue serializes model calls. The HTTP layer also rejects overlapping
requests carrying the same browser-session ID, rate-limits sessions, validates
request size and fields, and never substitutes fake candidates after failure.

## Validation evidence

- Three unrelated prompts produced different real Token IDs/distributions.
- `The little robot opened` produced raw Token ` the` (ID 260, 58.97%).
- Appending it and rerunning produced raw Token ` door` (ID 6644, 46.87%).
- Temperature 0.4 concentrated a tested leading probability to about 80.29%; at
  1.6 it spread to about 3.08%.
- A real sequential HTTP run generated 100 Tokens with one model load.
- Concurrent requests from distinct sessions completed through the queue.

## Deployment

Render now runs one Node web service. It builds the Vite application, serves the
`dist` assets and SPA fallbacks, and exposes same-origin `/api/next-token`.
Learners do not download model weights and see no ONNX, WASM, WebGPU, PyTorch,
Render, or model-comparison details in the Page 3 UI.
