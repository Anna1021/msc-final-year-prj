export const PAGED_MISSION_ROUTES = Object.freeze({
  2: "/mission/2-prediction-paged",
  3: "/mission/3-hallucination-paged",
  5: "/mission/4-training-data-paged",
  6: "/mission/5-bias-paged"
});

export const PAGED_MISSIONS = Object.freeze({
  3: {
    order: 3, topic: "Finding Helpful Clues", robot: "/assets/img/mission3-robot-hallucination.png",
    pages: [
      ["equal", "Some clues help more", "Visible tokens do not all help equally for the same task."],
      ["task", "The task changes the clues", "Useful token relationships change with the current task."],
      ["combine", "Clues can work together", "Several earlier tokens can contribute at the same time."],
      ["order", "Order changes relationships", "The same words can describe a different relationship in a new order."],
      ["practice", "Find the helpful clues", "Use reviewed examples to practise clue finding."],
      ["summary", "Lesson discovery", "Connect visible context and useful relationships to prediction."]
    ]
  },
  5: {
    order: 4, topic: "Predicting the Next Token", robot: "/assets/img/missions-robot-target.png",
    pages: [
      ["candidates", "Several Tokens could come next", "Compare possible continuations for one next position."],
      ["scores", "Candidates get different chances", "Reveal reviewed scores and probabilities."],
      ["choose", "One rule chooses one Token", "Compare highest-chance selection and sampling."],
      ["add", "Add the Token to the text", "Place the chosen Token into the updated context."],
      ["repeat", "Predict, add and repeat", "Generate a reviewed story one Token at a time."],
      ["summary", "Lesson discovery", "Connect the full next-token prediction loop."]
    ]
  },
  6: {
    order: 5, topic: "Learning from Training Examples", robot: "/assets/img/mission5-robot-training.png",
    pages: [
      ["practice", "Practise predicting the next token", "Training begins with existing text."],
      ["compare", "Compare prediction and answer", "The actual token creates a correction signal."],
      ["adjust", "Adjust many numbers slightly", "Small distributed changes improve predictions."],
      ["repeat", "Repeat with many examples", "Corrections accumulate into patterns."],
      ["generalise", "Patterns are not perfect memory", "Apply learning to related new text."],
      ["summary", "The complete training loop", "Connect training with all five lessons."]
    ]
  }
});

export const MISSION_COPY = {
  en: { back:"Back", next:"Next", backMissions:"Back to Missions", page:"Page", complete:"Complete Mission", retry:"Try again", discovery:"What you discovered", teaching:"Simplified teaching demonstration — not live model output.", done:"Activity complete", choose:"Choose an option to reveal what changes.", rhythm:"Observe → Act → Discover", bridge:"How this leads onward" },
  zh: { back:"上一页", next:"下一页", backMissions:"返回 Missions", page:"第", complete:"完成 Mission", retry:"再试一次", discovery:"你的发现", teaching:"这是简化教学演示，并非真实模型输出。", done:"活动已完成", choose:"请选择一个选项，观察变化。", rhythm:"观察 → 行动 → 发现", bridge:"这一步如何连接下一页" },
  fr: { back:"Retour", next:"Suivant", backMissions:"Retour aux Missions", page:"Page", complete:"Terminer la Mission", retry:"Réessayer", discovery:"Ta découverte", teaching:"Démonstration pédagogique simplifiée — pas une sortie réelle du modèle.", done:"Activité terminée", choose:"Choisis une option pour observer le changement.", rhythm:"Observer → Agir → Découvrir", bridge:"Le lien avec la suite" },
  de: { back:"Zurück", next:"Weiter", backMissions:"Zurück zu Missions", page:"Seite", complete:"Mission abschließen", retry:"Noch einmal", discovery:"Deine Entdeckung", teaching:"Vereinfachte Lerndemonstration — keine echte Modellausgabe.", done:"Aktivität abgeschlossen", choose:"Wähle eine Option und beobachte die Veränderung.", rhythm:"Beobachten → Handeln → Entdecken", bridge:"So geht es weiter" }
};
