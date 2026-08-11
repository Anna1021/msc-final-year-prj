export const MISSION_5_QUIZ_CORRECT_ANSWERS = Object.freeze([0, 1, 1, 0]);

export function createMission5QuizCopy(t) {
  const key = (name) => t(`mission5.page6.${name}`);

  return {
    quizTitle: key("conceptCheckpoint"),
    quizIntro: key("subtitle"),
    conceptCheckpoint: key("conceptCheckpoint"),
    threeQuestions: key("quickQuestions"),
    answerEach: key("answerEach"),
    yourProgress: key("yourProgress"),
    questionLabel: key("questionLabel"),
    questionOf: t("mission5.page6.questionOf", {
      current: "{{current}}",
      total: "{{total}}"
    }),
    completedLabel: key("completedLabel"),
    takeTime: key("takeTime"),
    readCarefully: key("readCarefully"),
    checkAnswer: key("checkAnswer"),
    tryAgain: key("tryAgain"),
    nextQuestion: key("nextQuestion"),
    returnToLatest: key("returnToLatest"),
    finishCheckpoint: key("finishCheckpoint"),
    continue: key("continue"),
    correctLabel: key("correctLabel"),
    incorrectLabel: key("incorrectLabel"),
    niceWork: key("niceWork"),
    completionText: key("completionText"),
    completedIdeas: [1, 2, 3, 4].map((number) => key(`completedIdea${number}`)),
    checkpointQuestions: [1, 2, 3, 4].map((number) => ({
      prompt: key(`q${number}Prompt`),
      options: ["A", "B", "C", "D"].map((letter) => key(`q${number}${letter}`)),
      correct: MISSION_5_QUIZ_CORRECT_ANSWERS[number - 1],
      correctFeedback: key(`q${number}Correct`),
      incorrectFeedback: key(`q${number}Incorrect`)
    }))
  };
}
