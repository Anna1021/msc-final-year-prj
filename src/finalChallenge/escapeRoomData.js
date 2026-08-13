import { TOKEN_ROOM_CHALLENGE, TOKEN_ROOM_EXAMPLE, TOKEN_ROOM_PUZZLES, TOKEN_ROOM_TOKENIZER } from "./tokenRoomTeachingData.js";

export const ESCAPE_STORAGE_KEY = "aiExplorerEscapeRoomProgress";
// Version 3 moves the Final Challenge to the five-Lesson/five-crystal path.
export const ESCAPE_PROGRESS_VERSION = 3;

export const tokenRoom = {
  id: "token",
  title: "Token Workshop",
  label: "Room 1",
  crystalName: "Token Crystal",
  crystalId: "token",
  accent: "#46b86f",
  aim: "Choose the real tokenizer split for one highlighted word.",
  tokenizer: TOKEN_ROOM_TOKENIZER,
  teachingExample: TOKEN_ROOM_EXAMPLE,
  challenge: TOKEN_ROOM_CHALLENGE,
  puzzles: TOKEN_ROOM_PUZZLES,
  learningGoal: "Text enters a language model as tokenizer-dependent pieces, not as one whole block."
};

export const rooms = [
  tokenRoom,
  { id: "numbers", label: "Room 2", title: "Context Chamber", crystalId: "numbers", crystalName: "Context Crystal", accent: "#46d49b", aim: "Find which tokens are available to the model right now." },
  { id: "context", label: "Room 3", title: "Connection Lab", crystalId: "connection-lab", crystalName: "Connections Crystal", accent: "#ff7655", aim: "Decode the connection pattern to unlock the chamber." },
  { id: "connections", label: "Room 4", title: "Prediction Machine", crystalId: "prediction-machine", crystalName: "Prediction Crystal", accent: "#6da9ff", aim: "Power the prediction console and decode the next-token signal." },
  { id: "prediction", label: "Room 5", title: "Pattern Workshop", crystalId: "prediction", crystalName: "Pattern Crystal", accent: "#ff5f9e", aim: "Restore the model's training pattern to unlock the final crystal." }
];

export const finalExitPuzzle = {
  title: "Power the Language Model Door",
  steps: ["Place crystals", "Form final crystal", "Solve final lock"],
  concepts: ["Training", "Tokens", "Context", "Connections", "Prediction", "Repeat"],
  correctOrder: ["Training", "Tokens", "Context", "Connections", "Prediction", "Repeat"],
  trainingNote: "Training happened earlier, when the model learned patterns from many examples.",
  completionMessage:
    "Training happened earlier. During use, text becomes tokens, available context is processed, information is connected, one next-token prediction is made, and the selected token is added before prediction repeats."
};

export const tokenHintLevels = [
  "Look for an option that splits the highlighted word into more than one Token.",
  "The tokenizer used in LLM Explorer makes three Token pieces here.",
  "The first Token also contains the space before the highlighted word."
];
