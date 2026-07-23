export const ESCAPE_STORAGE_KEY = "aiExplorerEscapeRoomProgress";
export const ESCAPE_PROGRESS_VERSION = 1;
export const MAIN_PROGRESS_KEY = "aiExplorerProgress";

export const tokenRoom = {
  id: "token",
  title: "Token Door",
  label: "Room 1",
  crystalName: "Token Crystal",
  crystalId: "token",
  accent: "#9b6cff",
  sentence: "I can't wait!",
  correctTokens: ["I", "can", "'t", "wait", "!"],
  trayTokens: ["wait", "I", "can't", "!", "can", "'t"],
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

export const finalExitPanels = {
  model: [
    "Patterns learned from training data",
    "Input tokens + relevant context",
    "Next-token prediction",
    "Generated output"
  ],
  human: [
    "Generated output",
    "May be inaccurate → Verify sources",
    "May reflect bias → Check fairness",
    "Use AI critically"
  ]
};

export const tokenHintLevels = [
  "Start by rebuilding the sentence from left to right.",
  "A token can be a whole word, part of a word, or punctuation. Look carefully at can't and the exclamation mark.",
  "For this learning simulation, use: I → can → 't → wait → !"
];
