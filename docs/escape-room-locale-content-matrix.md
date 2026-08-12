# Escape Room locale content matrix

Active route: `/final-challenge`. The React shell embeds `public/escape-room/index.html` and sends the selected locale plus translated runtime content through the existing bridge.

| Active area | Status after audit |
| --- | --- |
| Landing / room map | EN/ZH/FR/DE localised |
| Room 1 — Token Workshop | EN/ZH/FR/DE localised; `Qwen2.5` and the analysed word remain original |
| Room 2 — Numbers / Context Chamber | EN/ZH/FR/DE localised |
| Room 3 — Connection Lab | EN/ZH/FR/DE localised; analysed token labels remain identifiable |
| Room 4 — Prediction Machine | EN/ZH/FR/DE localised |
| Room 5 — Pattern Workshop | EN/ZH/FR/DE localised |
| Room 6 | Legacy/unreachable: active v3 flow intentionally contains five rooms/five crystals |
| Inventory / crystal UI | EN/ZH/FR/DE localised; state remains stable IDs |
| Hints and validation feedback | EN/ZH/FR/DE localised; state stores locale keys |
| Progress and navigation | EN/ZH/FR/DE localised |
| Final Exit / completion | EN/ZH/FR/DE localised; ordering uses stable concept IDs |
| Buttons, tooltips, titles and aria labels | Active content covered by the runtime locale map |
| Legacy Final Challenge component | Unreachable; intentionally unchanged |

Intentional original content: product/model name `Qwen2.5`, the technical terms `AI` and `Token` where established by the lesson, and source tokens such as `unhelpful`/`opened` where the puzzle is explicitly analysing that original token. These values do not participate in locale-dependent correctness checks.
