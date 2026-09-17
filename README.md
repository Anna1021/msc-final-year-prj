---
title: LLM Explorer
emoji: 🤖
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
license: apache-2.0
---

# LLM Explorer

LLM Explorer is an interactive educational web application designed primarily for learners aged 12–14 to explore how Large Language Models (LLMs) generate text. It combines visual explanations, interactive activities, authentic model-backed examples, knowledge checks, optional contextual guidance, and a Final Challenge.

This educational prototype combines authentic model-backed activities with simplified teaching representations; it does not claim that its evaluation objectively proved improved learning outcomes.

## Live Application

The easiest way to inspect the completed application is the deployed Hugging Face Space:

**[Open LLM Explorer on Hugging Face Spaces](https://huggingface.co/spaces/Xinxinzi1021/llm-explorer)**

- [Open the application directly](https://xinxinzi1021-llm-explorer.hf.space/)
- [GitHub repository](https://github.com/Anna1021/msc-final-year-prj)
- [Space container logs](https://huggingface.co/spaces/Xinxinzi1021/llm-explorer?logs=container)

No local installation is required. The Docker deployment runs independently on Hugging Face Spaces and does not require the author's computer or local development server to remain running. A sleeping Space must restart before it can serve the application; the first AI activity can take additional time to initialise its runtime.

## What the Application Contains

The learning journey contains five connected lessons:

1. **Tokens and numerical representations** — how text is divided into tokens, assigned token IDs, and represented numerically.
2. **Context** — how the available context and a limited Context Window affect what a model can use.
3. **Connections between token positions** — a clearly labelled simplified teaching representation of how information from different positions can contribute differently during contextual processing.
4. **Next-token prediction** — how a real language model assigns probabilities and extends a sequence one token at a time.
5. **Training and learned patterns** — how earlier training shapes later predictions, illustrated with simplified teaching activities rather than browser-based model training.

The current application also includes:

- visual explanations and interactive lesson activities;
- optional knowledge checks with immediate feedback;
- a reusable contextual **Q Guide** on selected pages;
- an **AI Lab** for exploring tokenisation, numerical representations, context, prediction and comparisons;
- a bilingual Final Challenge with five concept rooms, five collectible crystals and a final lock;
- English and Simplified Chinese interfaces; and
- browser-local persistence for learner progress, language preference, Guide state, notes, and Final Challenge progress.

Simplified instructional values are labelled as teaching representations and are not presented as authentic model outputs. Authentic tokenisation and next-token activities use the Qwen integrations described below.

The Final Challenge revisits Tokens, Context, Connections, Prediction and Training. Its final lock orders six process cards: Training → Tokens → Context → Connections → Prediction → Repeat. The six cards are not six separate rooms.

The main routes are `/dashboard`, `/missions`, `/ai-lab`, `/progress`, `/activity` and `/final-challenge`. Lesson routes retain historical names for compatibility; the current lesson titles and order are defined in `src/data/courseData.js`, not inferred from those URL names.

## Technology

- **Frontend:** React 19, JavaScript, Vite 6, CSS, and Lucide React.
- **Server:** Node.js 20 using its built-in HTTP server for static delivery and internal JSON APIs.
- **Server tokenisation and inference:** Transformers.js 3.8.1 with a pinned Qwen2.5 model, q4 ONNX weights and CPU execution.
- **AI Lab browser tokenisation:** `@huggingface/tokenizers` 0.1.3 with bundled tokenizer-only Qwen assets.
- **Persistence:** browser `localStorage`; no account or database is required.
- **Deployment:** Docker on Hugging Face Spaces.

## Repository Structure

```text
src/                  React application source, lessons, UI, state and localisation
server/               Node.js server, API validation and Qwen model integration
public/               Runtime assets, Final Challenge, tokenizer files and ethics PDFs
scripts/              Development/build utilities, model caching and existing test programs
tests/                Cold-start regression test
docs/                 Supporting curriculum and live-model documentation
construct-export-kit/ Historical development handoff material; not part of current runtime
```

The tests are a mixture of logic-level checks, structural and regression checks, API integration tests, and model-backed functional tests. They are not exclusively unit tests.

Most existing tests are in `scripts/`, with the cold-start regression in `tests/`. Use the npm scripts in `package.json` to run them. Some supporting documents and the `construct-export-kit/` describe earlier iterations; use the active application source for the current curriculum.

## Requirements

- Node.js **20.x** (`.node-version` and `package.json`)
- npm
- internet access for the initial server model download
- Git LFS when obtaining the project from a Git clone

The cold-start checks were run with Node `v20.18.0`. No paid inference API key is required: inference runs in the Node server process.

The downloaded server model files are not included in the repository.

## Running Locally

Clone the repository and retrieve its LFS-managed images and PDFs, then install locked dependencies:

```bash
git clone https://github.com/Anna1021/msc-final-year-prj.git
cd msc-final-year-prj
git lfs pull
npm ci
npm run dev
```

`npm run dev` starts both processes:

- frontend: <http://127.0.0.1:5182/>
- backend API: <http://127.0.0.1:8787/>
- backend health check: <http://127.0.0.1:8787/api/health>

During development, Vite proxies frontend `/api` requests to the Node server. The two processes can alternatively be started separately with `npm run dev:frontend` and `npm run dev:server`.

Keep the backend on port `8787` when using the default Vite proxy. If `PORT` is overridden for development, the proxy target must match.

## Production Build

Create the production Vite output and direct-route SPA fallbacks:

```bash
npm run build
```

The generated application is written to `dist/`. It is generated output and is not committed to source control.

After building, start the production Node server:

```bash
npm run start
```

Open <http://127.0.0.1:8787/>. The server uses the `PORT` environment variable when supplied and otherwise defaults to port `8787`.

Use the Node server to test the complete production application. `npm run preview` serves a Vite preview and does not start the backend AI APIs.

## Model Setup

Lesson 1's live tokenizer and the server-backed next-token activities use the same pinned checkpoint:

- model: `onnx-community/Qwen2.5-0.5B`
- revision: `bae5ceaee026f0d0592858b2bd27645a06f19c42`
- representation: q4 ONNX
- execution device: CPU

The model and its server tokenizer are downloaded and cached by Transformers.js rather than stored in source control. Before running model-backed automated tests, pre-cache the pinned files:

```bash
node scripts/cache-live-model.mjs
```

The first download is relatively large and may take several minutes, depending on the network connection.

The AI Lab's browser-side tokenizer is separate from the server model. Its bundled tokenizer-only assets come from:

- checkpoint: `Qwen/Qwen2.5-0.5B-Instruct`
- revision: `7ae557604adf67be50417f59c2c2f167def9a775`

These files are stored under `public/tokenizers/qwen2.5-0.5b-instruct/` with their licence, checksums, and provenance. They contain no model weights.

### Startup and lazy loading

The production startup path is `server/index.mjs` → `server/modelService.mjs` → lightweight configuration and prediction-math helpers. Transformers.js, including `Tensor`, is dynamically imported only when a valid AI request needs it.

| Request | Initialises the server AI runtime? | Loads model weights? |
| --- | --- | --- |
| `GET /` or `GET /assets/...` | No | No |
| `GET /api/health` | No | No |
| First valid `POST /api/tokenize` | Yes; loads the tokenizer | No |
| First valid `POST /api/next-token` | Yes; loads the tokenizer if needed | Yes |

Later requests reuse the in-process tokenizer and model promises. Prediction requests share an inference queue; the server also enforces per-session rate limits and rejects overlapping predictions for the same session. Restarting the process clears these in-memory instances, even when the model files are already cached on disk.

### JSON APIs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Returns `ok` and lightweight model configuration/load status without triggering loading. |
| `POST /api/tokenize` | Accepts `{ "text": "Robots learn quickly!" }`; returns token IDs, pieces, visual groups and decoded text. Text is limited to 200 characters. |
| `POST /api/next-token` | Accepts text or `input_token_ids`, plus prediction controls; returns candidates, a selected token, updated token IDs, decoded text and model metadata. |

Example next-token request:

```json
{
  "text": "The little robot opened",
  "temperature": 1,
  "mode": "greedy",
  "top_k": 5,
  "seed": 0,
  "sample_index": 0
}
```

The API supports `greedy` and `sampling` modes, temperatures from `0.4` to `1.6`, and `top_k` from `1` to `10`. `top_k` controls the displayed candidate count; sampling uses the full probability distribution. For continuation, send the previous `next_input_token_ids` as `input_token_ids` to preserve the exact token sequence. The `X-AI-Explorer-Session` header identifies a prediction session.

The health fields `modelLoaded` and `tokenizerLoaded` reflect whether their loading promises have been created; they are not guarantees that loading has finished. Use the `Model ready` log or a successful prediction to confirm model readiness.

## Automated Testing

The automated checks use Node's strict assertion facilities and cover:

- logic-level checks;
- structural and regression checks;
- API integration tests;
- model-backed functional checks; and
- server readiness with AI runtime imports explicitly blocked.

Build before running server/API checks, because they serve files from `dist/`:

```bash
npm run build
npm run test:server-cold-start
npm run test:tokenizer
npm run test:next-token-api
npm run test:live-prediction-temperature
```

For model-backed checks:

```bash
node scripts/cache-live-model.mjs
npm run test:next-token-live
npm run test:live-prediction-unicode
npm run test:live-prediction-generation-state
npm run test:live-prediction-multilingual-quality
```

The GitHub checkout currently registers **41 `test:*` npm commands**. Run `npm run` to list them. This checkout does not currently define `test:all`; run the individual commands relevant to your change.

During the cold-start change, the build, cold-start test, tokenizer fixtures, next-token API checks, live 100-token generation, Unicode decoding, generation-state and temperature/sampling checks passed. The live API test also verified concurrent requests and reuse of a single loaded model. This is a targeted validation record, not a claim that the complete suite has just been rerun.

The repository does not use Jest, Vitest, Mocha, Playwright, Cypress, snapshot testing, browser end-to-end automation, or code-coverage measurement. Browser-dependent visual interactions, responsive layouts, drag behaviour, animations, and spotlight positioning therefore still require manual browser inspection.

Individual test commands remain available in the `scripts` field of `package.json`.

## Deployment

The public application is deployed as a Docker-based Hugging Face Space:

**[https://huggingface.co/spaces/Xinxinzi1021/llm-explorer](https://huggingface.co/spaces/Xinxinzi1021/llm-explorer)**

The Docker build installs locked dependencies, builds the Vite application and pre-caches the pinned model and tokenizer:

```dockerfile
RUN npm run build && node scripts/cache-live-model.mjs
```

Keep this caching step. It avoids downloading model assets on each container start, while lazy imports avoid initialising the inference runtime before the HTTP server is listening. The same container serves the frontend and APIs on port `7860`; the README metadata's `app_port` matches the Docker `PORT` setting.

To run the image locally:

```bash
docker build -t llm-explorer .
docker run --rm -p 7860:7860 llm-explorer
```

Open <http://localhost:7860/>. Building the image needs internet access for dependencies and model assets.

### Publishing updates

GitHub (`Anna1021/msc-final-year-prj`) and the Hugging Face Space (`Xinxinzi1021/llm-explorer`) are separate repositories. The checked deployment setup has no GitHub-to-Space sync workflow. A GitHub push alone does not publish a new Space version; the intended changes must also be committed to the Space repository. A new Space commit triggers its Docker build. Preserve the YAML metadata at the beginning of this README when updating the Space copy.

### Checking a deployment

In **Container logs**, server startup should show:

```text
[Server] Starting...
[Server] Listening on port 7860
```

Opening the homepage, static assets or `/api/health` must not trigger model loading. After the first valid AI requests, the relevant logs appear:

```text
[ModelService] Loading tokenizer: onnx-community/Qwen2.5-0.5B
[ModelService] revision: bae5ceaee026f0d0592858b2bd27645a06f19c42
[ModelService] Loading model: onnx-community/Qwen2.5-0.5B
[ModelService] revision: bae5ceaee026f0d0592858b2bd27645a06f19c42
[ModelService] dtype: q4
[ModelService] Model ready
```

A tokenizer-only request produces no model-loading or model-ready log. Build logs separately contain model-cache messages, which are expected before the runtime container starts.

If a Space remains on **Starting**, check the deployed commit, **Build** logs and **Container** logs. Confirm that the build finished and the server is listening on `7860`; the platform's `Application Startup` marker alone does not prove that Node has started listening. This optimisation reduces application startup work but cannot eliminate Hugging Face's container provisioning or wake-up delay. See the [official Space management guide](https://huggingface.co/docs/huggingface_hub/guides/manage-spaces) for restart controls.

## Data, Assets and Provenance

- Server model and browser tokenizer provenance are pinned and documented above and in `THIRD_PARTY_NOTICES.md`.
- Runtime illustrations and Final Challenge assets are stored under `public/assets/` and `public/escape-room/`.
- Required deterministic fixture JSON files are included with the application source.
- `public/ethics/` intentionally contains participant information, assent, and consent PDFs used by the deployed questionnaire and participation flow. These runtime documents must remain available after deployment.
- No raw participant response or evaluation dataset is required to build or run the application, and none is included as runtime application data.
- Learner progress is stored in the current browser, not synchronised between devices. Clearing browser storage removes local progress. Text entered into live AI activities is sent to this application's backend for processing; AI Lab's bundled tokenizer runs locally in the browser.

## Licence and Third-Party Components

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for third-party model, tokenizer, and library attribution. No separate project licence is asserted here beyond the repository and deployment metadata already present.
