export const contextSpotlightSteps = [
  { id:"entrance",target:"context-experiment-tabs",titleKey:"contextStage.tour.steps.entrance.title",bodyKey:"contextStage.tour.steps.entrance.body",start:true },
  { id:"scene",target:"context-sentence-options",titleKey:"contextStage.tour.steps.scene.title",bodyKey:"contextStage.tour.steps.scene.body",waitsForAction:true,waitKey:"contextStage.tour.chooseScene" },
  { id:"clues",target:"context-highlight-words",titleKey:"contextStage.tour.steps.clues.title",bodyKey:"contextStage.tour.steps.clues.body" },
  { id:"meaning",target:"context-meaning-card",titleKey:"contextStage.tour.steps.meaning.title",bodyKey:"contextStage.tour.steps.meaning.body" },
  { id:"builder",target:"context-experiment-builder",titleKey:"contextStage.tour.steps.builder.title",bodyKey:"contextStage.tour.steps.builder.body",waitsForAction:true,waitKey:"contextStage.tour.openBuilder" },
  { id:"vague",target:"context-vague-request",titleKey:"contextStage.tour.steps.vague.title",bodyKey:"contextStage.tour.steps.vague.body" },
  { id:"useful",target:"context-detail-cards",titleKey:"contextStage.tour.steps.useful.title",bodyKey:"contextStage.tour.steps.useful.body",waitsForAction:true,waitKey:"contextStage.tour.addUseful" },
  { id:"compare",target:"context-response-preview",titleKey:"contextStage.tour.steps.compare.title",bodyKey:"contextStage.tour.steps.compare.body" },
  { id:"unrelated",target:"context-detail-cards",titleKey:"contextStage.tour.steps.unrelated.title",bodyKey:"contextStage.tour.steps.unrelated.body",waitsForAction:true,waitKey:"contextStage.tour.addUnrelated" },
  { id:"discovery",target:"context-builder-discovery",titleKey:"contextStage.tour.steps.discovery.title",bodyKey:"contextStage.tour.steps.discovery.body",finish:true }
];

export const predictionSpotlightSteps = [
  { id:"welcome",target:"predict-stage",titleKey:"predictionStage.tour.steps.welcome.title",bodyKey:"predictionStage.tour.steps.welcome.body",start:true },
  { id:"clue",target:"predict-context",titleKey:"predictionStage.tour.steps.clue.title",bodyKey:"predictionStage.tour.steps.clue.body" },
  { id:"race",target:"predict-probability-bars",titleKey:"predictionStage.tour.steps.race.title",bodyKey:"predictionStage.tour.steps.race.body" },
  { id:"temperature",target:"predict-temperature",titleKey:"predictionStage.tour.steps.temperature.title",bodyKey:"predictionStage.tour.steps.temperature.body" },
  { id:"choose",target:"predict-choice",titleKey:"predictionStage.tour.steps.choose.title",bodyKey:"predictionStage.tour.steps.choose.body" },
  { id:"compare",target:"predict-comparison",titleKey:"predictionStage.tour.steps.compare.title",bodyKey:"predictionStage.tour.steps.compare.body" },
  { id:"truth",target:"predict-truth",titleKey:"predictionStage.tour.steps.truth.title",bodyKey:"predictionStage.tour.steps.truth.body",finish:true }
];

export const compareSpotlightSteps = [
  { id:"welcome",target:"compare-stage",titleKey:"compareStage.tour.steps.welcome.title",bodyKey:"compareStage.tour.steps.welcome.body",start:true },
  { id:"inputs",target:"compare-inputs",titleKey:"compareStage.tour.steps.inputs.title",bodyKey:"compareStage.tour.steps.inputs.body" },
  { id:"run",target:"compare-run",titleKey:"compareStage.tour.steps.run.title",bodyKey:"compareStage.tour.steps.run.body",waitsForAction:true,waitKey:"compareStage.tour.clickRun" },
  { id:"tokens",target:"compare-tokens",titleKey:"compareStage.tour.steps.tokens.title",bodyKey:"compareStage.tour.steps.tokens.body" },
  { id:"layers",target:"compare-layer-tabs",titleKey:"compareStage.tour.steps.layers.title",bodyKey:"compareStage.tour.steps.layers.body" },
  { id:"discovery",target:"compare-discovery",titleKey:"compareStage.tour.steps.discovery.title",bodyKey:"compareStage.tour.steps.discovery.body",finish:true }
];
