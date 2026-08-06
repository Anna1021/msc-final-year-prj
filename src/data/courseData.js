export const missionData = [
  { id: 1, order: 1, title: "How does a language model process text?", short: "Text processing", desc: "Explore tokens and numerical representations.", route: "/mission/1-tokenisation-paged", skill: "Tokens & Numerical Representations", icon: "wand" },
  { id: 2, order: 2, title: "Which words can a language model see?", short: "Reading context", desc: "Explore the context window and the text available to the model.", route: "/mission/2-prediction-paged", skill: "Reading Context", icon: "bolt" },
  { id: 3, order: 3, title: "Which words help a language model most?", short: "Finding clues", desc: "Explore how useful clues connect across the current context.", route: "/mission/3-hallucination-paged", skill: "Finding Helpful Clues", icon: "question" },
  { id: 5, order: 4, title: "How does a language model choose what comes next?", short: "Next-token prediction", desc: "Compare possible next Tokens, their chances and one-Token-at-a-time generation.", route: "/mission/4-training-data-paged", skill: "Predicting the Next Token", icon: "database" },
  { id: 6, order: 5, title: "How does a language model learn from examples?", short: "Training", desc: "Follow prediction, correction and repetition to see how useful patterns are learned.", route: "/mission/5-bias-paged", skill: "Learning from Training Examples", icon: "database" }
];

export const nextTokenQuestions = [
  { context: "The cat sat on the", display: "The cat sat on the ____.", options: ["mat", "moon", "pizza", "computer"], correct: "mat", base: { mat: 72, floor: 18, chair: 7, pizza: 3 } },
  { context: "I drink coffee every", display: "I drink coffee every ____.", options: ["morning", "planet", "shoe", "keyboard"], correct: "morning", base: { morning: 68, day: 17, night: 10, week: 5 } },
  { context: "She opened the book and started to", display: "She opened the book and started to ____.", options: ["read", "swim", "melt", "sleep"], correct: "read", base: { read: 64, write: 16, learn: 12, sleep: 8 } },
  { context: "The teacher wrote on the", display: "The teacher wrote on the ____.", options: ["board", "cloud", "sandwich", "moon"], correct: "board", base: { board: 70, paper: 17, screen: 9, wall: 4 } },
  { context: "For homework, check your", display: "For homework, check your ____.", options: ["answer", "banana", "spaceship", "pillow"], correct: "answer", base: { answer: 62, work: 20, source: 13, spelling: 5 } },
  { context: "The dog chased the", display: "The dog chased the ____.", options: ["ball", "planet", "keyboard", "cloud"], correct: "ball", base: { ball: 66, cat: 15, stick: 12, car: 7 } },
  { context: "Please close the", display: "Please close the ____.", options: ["door", "banana", "river", "idea"], correct: "door", base: { door: 74, window: 17, book: 6, file: 3 } },
  { context: "She wore a warm", display: "She wore a warm ____.", options: ["coat", "computer", "pizza", "question"], correct: "coat", base: { coat: 69, jacket: 18, scarf: 10, hat: 3 } }
];

export const detectiveCards = [
  "Penguins can fly.",
  "The Sun is made of ice.",
  "Water freezes at 0°C.",
  "The Moon orbits Earth."
];

export const detectiveTrueFacts = ["Water freezes at 0°C.", "The Moon orbits Earth."];
export const detectiveFalseFacts = ["Penguins can fly.", "The Sun is made of ice."];

export function shuffleList(items) {
  return [...items].sort(() => Math.random() - 0.5);
}
