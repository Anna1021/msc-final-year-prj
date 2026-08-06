# AI Explorer five-Mission curriculum

## Progress compatibility

Curriculum version 2 keeps stable storage IDs for existing implemented pages while separating them from learner-facing order.

| New order | Stable storage ID | Legacy source |
| --- | ---: | --- |
| 1 | 1 | Old Mission 1 |
| 2 | 2 | Old Missions 2 and 4 combined |
| 3 | 3 | Old Mission 3 |
| 4 | 5 | Old Mission 5 |
| 5 | 6 | Old Mission 6 |

For legacy data, new Mission 2 is complete only when both old Mission 2 and old Mission 4 were complete. Otherwise its migrated progress is the rounded average of the two old progress values. This avoids silently treating the new combined learning journey as complete. Old Missions 5 and 6 retain their storage IDs so their implemented activities do not write into the wrong Mission.

## Mission 2 — How does a language model decide what comes next?

1. **Earlier words give clues** — complete a simple sentence and notice that the model uses preceding text.
2. **Same word, different context** — compare money-bank and river-bank scenes without claiming conscious understanding.
3. **Context changes what comes next** — inspect candidate tokens and probability bars after “The cat chased the …”.
4. **More than one continuation can fit** — compare several reasonable candidates; high probability is not a guarantee.
5. **Choose one token and repeat** — append one selected token and run the prediction loop again.
6. **Predictable and varied outputs** — explore a simplified variation control; “temperature” is secondary vocabulary.
7. **Mission challenge** — change earlier context, observe probabilities, choose a continuation and grow the sentence.
8. **Summary** — Earlier text → context → candidates → probabilities → select one → repeat.

## Mission 3 — Why can language models make mistakes?

1. A fluent answer can still be wrong.
2. Prediction is not fact checking.
3. Missing information changes what can be predicted reliably.
4. Confident wording is not proof.
5. Compare, question and verify.
6. Repeatable misinformation/hallucination challenge.
7. Summary: fluent prediction → uncertainty → verification.

## Mission 4 — How does training shape a language model?

1. Models learn patterns from many examples.
2. Different types of training data.
3. Repeated examples shape learned patterns.
4. Changing examples changes behaviour.
5. Data quality and coverage matter.
6. Small repeatable training simulation.
7. Summary: examples → patterns → behaviour and outputs.

## Mission 5 — How can bias appear in AI?

1. What balanced representation means.
2. Uneven examples can create uneven patterns.
3. Compare two training-data mixtures.
4. Observe different outputs.
5. Bias can affect real people.
6. Improve the data or checking process.
7. Final responsible-use challenge.
8. Summary and Final Challenge transition.

Story Builder is intentionally outside the Mission curriculum and has no reserved Mission slot.
