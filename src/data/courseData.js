export const missionData = [
  { id: 1, title: "How does ChatGPT read?", short: "How does ChatGPT read?", desc: "Learn how text is broken into tokens.", route: "/mission/1-tokenisation", skill: "Tokens & Tokenisation", icon: "wand" },
  { id: 2, title: "Can you think like ChatGPT?", short: "Can you think like ChatGPT?", desc: "Predict the next token using probability.", route: "/mission/2-next-token", skill: "Next-token Prediction", icon: "bolt" },
  { id: 3, title: "Why does ChatGPT make mistakes?", short: "Why does ChatGPT make mistakes?", desc: "Discover hallucinations and probabilistic errors.", route: "/mission/3-hallucination", skill: "Probability & Sampling", icon: "question" },
  { id: 4, title: "Why does context matter?", short: "Why does context matter?", desc: "See how earlier words change the meaning.", route: "/mission/4-context", skill: "Context & Meaning", icon: "link" },
  { id: 5, title: "Train your own AI", short: "Train your own AI", desc: "Add training data and see how it changes the model.", route: "/mission/5-training-data", skill: "Training Data Influence", icon: "database" },
  { id: 6, title: "Can AI be biased?", short: "Can AI be biased?", desc: "Explore how bias in data leads to biased outputs.", route: "/mission/6-bias", skill: "Bias & Fairness", icon: "scale" }
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
