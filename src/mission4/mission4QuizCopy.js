export function createMission4QuizCopy(t) {
  const key = (name) => t(`mission4.quiz.${name}`);

  return {
    quizTitle: key("title"),
    quizIntro: key("subtitle"),
    conceptCheckpoint: key("conceptCheckpoint"),
    threeQuestions: key("quickQuestions"),
    answerEach: key("answerEach"),
    yourProgress: key("yourProgress"),
    questionLabel: key("questionLabel"),
    questionOf: t("mission4.quiz.questionOf", { current: "{{current}}", total: "{{total}}" }),
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
    correctAnswerLabel: key("correctAnswerLabel"),
    niceWork: key("niceWork"),
    completionText: key("completionText"),
    completedIdeas: [1, 2, 3, 4].map((number) => key(`completedIdea${number}`)),
    checkpointQuestions: [1, 2, 3, 4].map((number) => ({
      prompt: key(`q${number}Prompt`),
      options: ["A", "B", "C", "D"].map((letter) => key(`q${number}${letter}`)),
      correct: [1, 2, 1, 2][number - 1],
      correctFeedback: key(`q${number}Correct`),
      incorrectFeedback: key(`q${number}Incorrect`)
    }))
  };
}
