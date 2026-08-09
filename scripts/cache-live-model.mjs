import { AutoModelForCausalLM, AutoTokenizer, env } from "@huggingface/transformers";
import { LIVE_MODEL } from "../src/mission4/liveModelConfig.js";

env.allowLocalModels = true;

console.log(`Caching ${LIVE_MODEL.id} at revision ${LIVE_MODEL.revision}...`);

await AutoTokenizer.from_pretrained(LIVE_MODEL.id, {
  revision: LIVE_MODEL.revision
});

await AutoModelForCausalLM.from_pretrained(LIVE_MODEL.id, {
  revision: LIVE_MODEL.revision,
  dtype: "q4",
  device: "cpu"
});

console.log("Pinned live model and tokenizer cached for the Space image.");
