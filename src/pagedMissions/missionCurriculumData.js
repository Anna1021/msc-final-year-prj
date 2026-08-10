export const PAGED_MISSION_ROUTES = Object.freeze({
  2: "/mission/2-prediction-paged",
  3: "/mission/3-hallucination-paged",
  5: "/mission/4-training-data-paged",
  6: "/mission/5-bias-paged"
});

export const PAGED_MISSIONS = Object.freeze({
  3: {
    order: 3, topic: "Connecting the Tokens", robot: "/assets/img/mission3-robot-hallucination.png",
    pages: [
      ["connections", "From context to connections", "See how available tokens can combine information."],
      ["attention", "Some connections contribute more", "Observe different simplified connection strengths."],
      ["representation", "Build a context-aware Token", "Update a simplified Token representation."],
      ["position", "Position changes relationships", "See how order changes Token relationships."],
      ["process", "Watch the Transformer process a sentence", "Run one controlled mechanism demonstration."],
      ["summary", "Before prediction", "Connect contextual processing to the prediction gate."]
    ]
  },
  5: {
    order: 4, topic: "Predicting the Next Token", robot: "/assets/img/missions-robot-target.png",
    pages: [
      ["predict", "How does the model predict the next Token?", "Connect candidate scores to probabilities."],
      ["choose", "How does the model choose one Token?", "Compare selection rules and add the chosen Token."],
      ["live", "Live Next Token Lab", "Run genuine next-token inference in your browser."],
      ["check", "Check what you discovered", "Explain the next-token generation loop."]
    ]
  },
  6: {
    order: 5, topic: "How the Model Learns to Predict", robot: "/assets/img/mission5-robot-training.png",
    pages: [
      ["origin", "Where do prediction probabilities come from?", "Compare a prediction with the real next Token."],
      ["adjust", "How does the model improve a prediction?", "Nudge many adjustable numbers by tiny amounts."],
      ["repeat", "Why does training use so many examples?", "Repeat prediction, comparison and adjustment."],
      ["connect", "Training vs Generation", "Connect learned parameters with later generation."]
    ]
  }
});

export const MISSION_COPY = {
  en: { back:"Back", next:"Next", backMissions:"Back to Missions", page:"Page", complete:"Complete Mission", retry:"Try again", discovery:"What you discovered", teaching:"Simplified teaching demonstration — not live model output.", done:"Activity complete", choose:"Choose an option to reveal what changes.", rhythm:"Observe → Act → Discover", bridge:"How this leads onward" },
  zh: { back:"上一页", next:"下一页", backMissions:"返回 Missions", page:"第", complete:"完成 Mission", retry:"再试一次", discovery:"你的发现", teaching:"这是简化教学演示，并非真实模型输出。", done:"活动已完成", choose:"请选择一个选项，观察变化。", rhythm:"观察 → 行动 → 发现", bridge:"这一步如何连接下一页" },
  fr: { back:"Retour", next:"Suivant", backMissions:"Retour aux Missions", page:"Page", complete:"Terminer la Mission", retry:"Réessayer", discovery:"Ta découverte", teaching:"Démonstration pédagogique simplifiée — pas une sortie réelle du modèle.", done:"Activité terminée", choose:"Choisis une option pour observer le changement.", rhythm:"Observer → Agir → Découvrir", bridge:"Le lien avec la suite" },
  de: { back:"Zurück", next:"Weiter", backMissions:"Zurück zu Missions", page:"Seite", complete:"Mission abschließen", retry:"Noch einmal", discovery:"Deine Entdeckung", teaching:"Vereinfachte Lerndemonstration — keine echte Modellausgabe.", done:"Aktivität abgeschlossen", choose:"Wähle eine Option und beobachte die Veränderung.", rhythm:"Beobachten → Handeln → Entdecken", bridge:"So geht es weiter" }
};
