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

LLM Explorer is an interactive React/Vite learning prototype for helping 12--14 year-old students understand core ideas behind Large Language Models. The central learning message is that ChatGPT does not truly "know" answers in the human sense: it processes tokens, uses context, compares probabilities, learns patterns from training data, and can still make confident mistakes.

## Current Prototype

The project has evolved from separate static HTML pages into a React single-page application. It currently includes:

- A Home dashboard that acts as the main orientation space for the learning journey.
- A Missions overview page for navigating six learning missions.
- Mission 1: Tokenisation, redesigned as a long-scroll lesson flow.
- Mission 2: Next-token prediction, with probability bars and a creativity slider.
- Mission 3: Hallucination, redesigned as a detective-style investigation.
- Mission 4: Context, currently a functional draft.
- Mission 5: Training data, split into get data, learn patterns, and make predictions pages.
- Mission 6: Bias, currently a functional draft.
- Progress and Activity pages that show mission completion, learning activity, and saved reflections.

Activity records are intentionally lightweight and are based on real mission progress. The interface does not present inferred learning time or placeholder reward totals as learner analytics.

## Technology

- React
- Vite
- CSS animations and responsive layout
- localStorage for prototype progress and saved reflections
- Static PNG mascot and learning illustrations

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL shown by Vite, usually:

```text
http://127.0.0.1:5173/
```

## Project Status

Missions 1--3 are the most polished long-scroll learning flows. Mission 5 has been restructured into a clearer multi-page training-data flow. Missions 4--6 will be further refined so the full learning path has a consistent teaching style.
