export const ESCAPE_STORAGE_KEY = "aiExplorerEscapeRoomProgress";
export const ESCAPE_PROGRESS_VERSION = 1;

export const tokenRoom = {
  id: "token",
  title: "Token Door",
  label: "Room 1",
  crystalName: "Token Crystal",
  crystalId: "token",
  accent: "#9b6cff",
  sentence: "Models split text into tokens!",
  correctTokens: ["Models", "split", "text", "into", "tokens", "!"],
  trayTokens: ["tokens", "Models", "answers", "!", "text", "into", "split"],
  simulationNote: "Simplified tokenisation example. Different models may split text differently.",
  learningGoal: "A token may be a word, part of a word, or punctuation."
};

export const rooms = [
  tokenRoom,
  { id: "prediction", label: "Room 2", title: "Prediction Machine", crystalId: "prediction", crystalName: "Prediction Crystal", accent: "#ffbf3d", locked: true },
  { id: "verification", label: "Room 3", title: "Hallucination Archive", crystalId: "verification", crystalName: "Verification Crystal", accent: "#ff5a70", locked: true },
  { id: "context", label: "Room 4", title: "Context Lens", crystalId: "context", crystalName: "Context Crystal", accent: "#38c47f", locked: true },
  { id: "patterns", label: "Room 5", title: "Training Lab", crystalId: "patterns", crystalName: "Pattern Crystal", accent: "#3a8bff", locked: true },
  { id: "fairness", label: "Room 6", title: "Fairness Chamber", crystalId: "fairness", crystalName: "Fairness Crystal", accent: "#a855f7", locked: true }
];

export const finalExitPuzzle = {
  title: "Power the AI Brain Door",
  steps: ["Place crystals", "Build text generation", "Add human checks"],
  modelSequence: [
    "Training data teaches patterns",
    "Input becomes tokens + useful context",
    "The model predicts next tokens",
    "Generated output"
  ],
  humanReview: [
    "Verify important facts",
    "Check for bias",
    "Use AI critically"
  ],
  completionMessage:
    "LLMs generate text by predicting tokens from learned patterns. Their answers depend on training data and context, so they can be useful but also wrong or biased and should be checked critically."
};

export const tokenHintLevels = [
  "Start by rebuilding the sentence from left to right.",
  "A token can be a whole word, part of a word, or punctuation. One tray piece does not belong.",
  "For this learning simulation, use: Models → split → text → into → tokens → !"
];
