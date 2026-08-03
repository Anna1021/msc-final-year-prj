import { compareSpotlightSteps, contextSpotlightSteps, predictionSpotlightSteps } from "./stageSpotlightSteps.js";

export const AI_LAB_TOUR_STORAGE_KEY = "aiLabTourCompleted";
export const AI_LAB_NUMBERS_TOUR_STORAGE_KEY = "aiLabNumbersTourCompleted";
export const AI_LAB_CONTEXT_TOUR_STORAGE_KEY = "aiLabContextTourCompleted";
export const AI_LAB_PREDICTION_TOUR_STORAGE_KEY = "aiLabPredictionTourCompleted";
export const AI_LAB_COMPARE_TOUR_STORAGE_KEY = "aiLabCompareTourCompleted";

export const aiLabSpotlightSteps = [
  { id:"welcome",target:"ai-lab-flow",titleKey:"tokenLab.tour.steps.welcome.title",bodyKey:"tokenLab.tour.steps.welcome.body",start:true },
  { id:"stage",target:"ai-lab-stage-tokenize",titleKey:"tokenLab.tour.steps.stage.title",bodyKey:"tokenLab.tour.steps.stage.body" },
  { id:"input",target:"ai-lab-token-input",titleKey:"tokenLab.tour.steps.input.title",bodyKey:"tokenLab.tour.steps.input.body" },
  { id:"tokenize",target:"ai-lab-tokenize-button",titleKey:"tokenLab.tour.steps.tokenize.title",bodyKey:"tokenLab.tour.steps.tokenize.body",waitsForAction:true },
  { id:"result",target:"ai-lab-token-result",titleKey:"tokenLab.tour.steps.result.title",bodyKey:"tokenLab.tour.steps.result.body" },
  { id:"why",target:"ai-lab-why-split",titleKey:"tokenLab.tour.steps.why.title",bodyKey:"tokenLab.tour.steps.why.body" },
  { id:"challenge",target:"ai-lab-challenge-status",titleKey:"tokenLab.tour.steps.challenge.title",bodyKey:"tokenLab.tour.steps.challenge.body",finish:true }
];

export const numbersSpotlightSteps = [
  { id:"pick",target:"ai-lab-numbers-token-cards",titleKey:"numbersStage.tour.steps.choose.title",bodyKey:"numbersStage.tour.steps.choose.body",start:true,waitsForAction:true,waitKey:"numbersStage.tour.chooseToContinue" },
  { id:"id",target:"ai-lab-numbers-selected-id",titleKey:"numbersStage.tour.steps.id.title",bodyKey:"numbersStage.tour.steps.id.body" },
  { id:"follow",target:"ai-lab-numbers-follow-address",titleKey:"numbersStage.tour.steps.lookup.title",bodyKey:"numbersStage.tour.steps.lookup.body",waitsForAction:true,waitKey:"numbersStage.tour.followToContinue" },
  { id:"training",target:"ai-lab-numbers-training",titleKey:"numbersStage.tour.steps.training.title",bodyKey:"numbersStage.tour.steps.training.body" },
  { id:"open",target:"ai-lab-numbers-real-unavailable",titleKey:"numbersStage.tour.steps.unavailable.title",bodyKey:"numbersStage.tour.steps.unavailable.body",waitsForAction:true,waitKey:"numbersStage.tour.openToContinue" },
  { id:"drawer",target:"ai-lab-numbers-reveal-row",titleKey:"numbersStage.tour.steps.teaching.title",bodyKey:"numbersStage.tour.steps.teaching.body",waitsForAction:true,waitKey:"numbersStage.tour.revealToContinue" },
  { id:"whole",target:"ai-lab-numbers-whole-row",titleKey:"numbersStage.tour.steps.wholeRow.title",bodyKey:"numbersStage.tour.steps.wholeRow.body" },
  { id:"bridge",target:"ai-lab-numbers-show-bridge",titleKey:"numbersStage.tour.steps.next.title",bodyKey:"numbersStage.tour.steps.next.body",waitsForAction:true,waitKey:"numbersStage.tour.bridgeToContinue" },
  { id:"summary",target:"ai-lab-numbers-summary",titleKey:"numbersStage.tour.steps.summary.title",bodyKey:"numbersStage.tour.steps.summary.body",finish:true }
];

export const stageTours = {
  tokenize:{ storageKey:AI_LAB_TOUR_STORAGE_KEY,steps:aiLabSpotlightSteps },
  numbers:{ storageKey:AI_LAB_NUMBERS_TOUR_STORAGE_KEY,steps:numbersSpotlightSteps },
  context:{ storageKey:AI_LAB_CONTEXT_TOUR_STORAGE_KEY,steps:contextSpotlightSteps },
  predict:{ storageKey:AI_LAB_PREDICTION_TOUR_STORAGE_KEY,steps:predictionSpotlightSteps },
  compare:{ storageKey:AI_LAB_COMPARE_TOUR_STORAGE_KEY,steps:compareSpotlightSteps }
};
