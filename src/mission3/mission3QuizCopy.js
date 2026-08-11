export function createMission3QuizCopy(t) {
  const key = (name) => t(`mission3.page6.${name}`);

  return {
    quizTitle: key("title"),
    quizIntro: key("subtitle"),
    conceptCheckpoint: key("conceptCheckpoint"),
    threeQuestions: key("quickQuestions"),
    answerEach: key("answerEach"),
    yourProgress: key("yourProgress"),
    questionLabel: key("questionLabel"),
    questionOf: t("mission3.page6.questionOf", {
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
      correct: [0, 1, 0, 1][number - 1],
      correctFeedback: key(`q${number}Correct`),
      incorrectFeedback: key(`q${number}Incorrect`)
    }))
  };
}
