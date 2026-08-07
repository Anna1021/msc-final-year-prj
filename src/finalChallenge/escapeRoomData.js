export const ESCAPE_STORAGE_KEY = "aiExplorerEscapeRoomProgress";
// Version 2 replaces the legacy AI-literacy room ids with the LLM process path.
export const ESCAPE_PROGRESS_VERSION = 2;

export const tokenRoom = {
  id: "token",
  title: "Token Workshop",
  label: "Room 1",
  crystalName: "Token Crystal",
  crystalId: "token",
  accent: "#9b6cff",
  sentence: "Robots learn surprisingly fast.",
  correctTokens: ["Robots", "learn", "surprisingly", "fast", "."],
  trayTokens: ["surprisingly", "Robots", ".", "learn", "answers", "fast"],
  simulationNote: "A classroom token example. Different tokenizers may split the same text differently.",
  learningGoal: "A language model first works with text pieces called tokens."
};

export const rooms = [
  tokenRoom,
  { id: "numbers", label: "Room 2", title: "Number Lookup", crystalId: "numbers", crystalName: "Numbers Crystal", accent: "#3a8bff", aim: "Follow a token ID to one learned row of numbers." },
  { id: "context", label: "Room 3", title: "Context Window", crystalId: "context", crystalName: "Context Crystal", accent: "#38c4c9", aim: "See which earlier tokens are available right now." },
  { id: "connections", label: "Room 4", title: "Connection Lab", crystalId: "connections", crystalName: "Connections Crystal", accent: "#ff9d3d", aim: "Find which visible tokens provide the most helpful clues." },
  { id: "prediction", label: "Room 5", title: "Next-Token Machine", crystalId: "prediction", crystalName: "Prediction Crystal", accent: "#ff5f9e", aim: "Compare possible next tokens, choose one, then repeat." },
  { id: "training", label: "Room 6", title: "Training Workshop", crystalId: "training", crystalName: "Training Crystal", accent: "#46b86f", aim: "Follow prediction, answer, adjustment and repetition during training." }
];

export const finalExitPuzzle = {
  title: "Power the Language Model Door",
  steps: ["Place crystals", "Build the generation path", "Build the training loop"],
  modelSequence: [
    "Text becomes tokens",
    "Tokens point to numbers",
    "Context and connections shape the current representation",
    "The model predicts one next token",
    "The token is added and the process repeats"
  ],
  trainingLoop: [
    "Read a training example",
    "Predict the next token",
    "Reveal the actual token",
    "Adjust internal parameters",
    "Repeat across many examples"
  ],
  completionMessage:
    "You followed the path inside a language model: text becomes tokens and numbers, context connects useful clues, and one next token is predicted at a time. Training is a separate earlier process that adjusts the model across many examples."
};

export const tokenHintLevels = [
  "Start by rebuilding the sentence from left to right.",
  "One tray piece does not belong in the sentence.",
  "Use: Robots → learn → surprisingly → fast → ."
];
