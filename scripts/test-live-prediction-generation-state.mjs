import assert from "node:assert/strict";
import { AutoTokenizer } from "@huggingface/transformers";
import { decodeStableTokenIds, predictNextToken, resetModelServiceForTests } from "../server/modelService.mjs";
import { LIVE_MODEL } from "../src/mission4/liveModelConfig.js";

const tokenizer = await AutoTokenizer.from_pretrained(LIVE_MODEL.id, { revision:LIVE_MODEL.revision });

async function verifyState(prompt, steps = 12) {
  let text = prompt;
  let inputTokenIds = null;
  let previousNextIds = null;

  for (let step = 1; step <= steps; step += 1) {
    const prediction = await predictNextToken({
      text,
      input_token_ids:inputTokenIds,
      temperature:1,
      mode:"greedy",
      top_k:5
    });

    if (previousNextIds) {
      assert.deepEqual(prediction.input_token_ids, previousNextIds, `step ${step} consumes the exact sequence returned by step ${step - 1}`);
    }
    assert.equal(prediction.next_input_token_ids.length, prediction.input_token_ids.length + 1, `step ${step} grows the context by exactly one Token`);
    assert.deepEqual(
      prediction.next_input_token_ids,
      [...prediction.input_token_ids, prediction.selected.token_id],
      `step ${step} appends the selected Token exactly once`
    );
    assert.equal(prediction.decoded_text, decodeStableTokenIds(tokenizer, prediction.input_token_ids).decodedText, `step ${step} display is the stable decode of the inference IDs`);
    assert.equal(prediction.next_decoded_text, decodeStableTokenIds(tokenizer, prediction.next_input_token_ids).decodedText, `step ${step} next display is the stable decode of the next inference IDs`);

    process.stdout.write(JSON.stringify({
      prompt,
      step,
      inputLength:prediction.input_token_ids.length,
      lastTokenIds:prediction.input_token_ids.slice(-8),
      selectedTokenId:prediction.selected.token_id,
      nextInputLength:prediction.next_input_token_ids.length
    }) + "\n");

    previousNextIds = prediction.next_input_token_ids;
    inputTokenIds = prediction.next_input_token_ids;
    text = prediction.next_decoded_text;
    if (prediction.is_eos) break;
  }
}

resetModelServiceForTests();
await verifyState("The little robot opened the");
await verifyState("小机器人打开了");
process.stdout.write("Live prediction generation-state tests passed.\n");
