export const CAT_PROMPT = "The cat sat on the";

export const CAT_CANDIDATES = Object.freeze([
  { token:"mat", probability:46, tone:"purple" },
  { token:"floor", probability:27, tone:"blue" },
  { token:"chair", probability:19, tone:"green" },
  { token:"roof", probability:8, tone:"pink" }
]);

// A shared, illustrative comparison used by Lesson 4's score and probability
// teaching pages. These are deliberately not model outputs; the live model is
// introduced separately on Page 4.
export const SCORE_PROBABILITY_CANDIDATES = Object.freeze([
  { token: "book", scoreWidth: 100, probability: 46, tone: "blue" },
  { token: "door", scoreWidth: 68, probability: 27, tone: "purple" },
  { token: "box", scoreWidth: 48, probability: 15, tone: "green" },
  { token: "window", scoreWidth: 29, probability: 8, tone: "yellow" },
  { token: "banana", scoreWidth: 12, probability: 3, tone: "pink" },
  { token: "other", scoreWidth: 5, probability: 1, tone: "neutral" }
]);

export const REVIEWED_STORIES = Object.freeze([
  {
    id:"reader",
    starter:"A curious reader opened the",
    sets:[
      [{token:"door",probability:45},{token:"box",probability:28},{token:"window",probability:18},{token:"book",probability:9}],
      [{token:"and",probability:38},{token:".",probability:32},{token:"with",probability:18},{token:"because",probability:12}],
      [{token:"found",probability:44},{token:"saw",probability:28},{token:"carried",probability:17},{token:"dropped",probability:11}],
      [{token:"a",probability:55},{token:"the",probability:21},{token:"two",probability:16},{token:"one",probability:8}],
      [{token:"key",probability:42},{token:"map",probability:27},{token:"light",probability:19},{token:"note",probability:12}]
    ]
  },
  {
    id:"maya",
    starter:"Deep in the forest, Maya found a",
    sets:[
      [{token:"door",probability:39},{token:"map",probability:31},{token:"key",probability:21},{token:"river",probability:9}],
      [{token:"hidden",probability:41},{token:"small",probability:29},{token:"bright",probability:18},{token:"strange",probability:12}],
      [{token:"path",probability:43},{token:"message",probability:26},{token:"box",probability:20},{token:"stone",probability:11}],
      [{token:"near",probability:40},{token:"under",probability:29},{token:"beside",probability:19},{token:"inside",probability:12}],
      [{token:"home",probability:47},{token:"camp",probability:25},{token:"water",probability:17},{token:"trees",probability:11}]
    ]
  }
]);

export const REVIEWED_SAMPLING_SEQUENCE = Object.freeze(["floor","mat","chair","mat"]);
