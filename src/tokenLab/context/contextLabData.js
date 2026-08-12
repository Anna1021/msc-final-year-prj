export const contextWordExamples = [
  { id:"bank", target:"bank", senses:[{id:"money",sentence:"I deposited my money at the bank.",contextWords:["deposited","money"]},{id:"river",sentence:"We sat beside the river bank.",contextWords:["beside","river"]}] },
  { id:"bat", target:"bat", senses:[{id:"animal",sentence:"The bat flew out of the cave.",contextWords:["flew","cave"]},{id:"sport",sentence:"He hit the ball with a bat.",contextWords:["hit","ball"]}] },
  { id:"match", target:"match", senses:[{id:"game",sentence:"The football match starts at six.",contextWords:["football","starts"]},{id:"fire",sentence:"She used a match to light the candle.",contextWords:["light","candle"]}] },
  { id:"light", target:"light", senses:[{id:"weight",sentence:"This small bag is very light.",contextWords:["small","bag"]},{id:"lamp",sentence:"Please turn on the light in the hall.",contextWords:["turn","hall"]}] },
  { id:"wave", target:"wave", senses:[{id:"ocean",sentence:"A huge wave rolled towards the beach.",contextWords:["huge","beach"]},{id:"greeting",sentence:"Give me a wave when you arrive.",contextWords:["give","arrive"]}] },
  { id:"ring", target:"ring", senses:[{id:"jewellery",sentence:"She wore a silver ring on her finger.",contextWords:["silver","finger"]},{id:"sound",sentence:"I heard the phone ring downstairs.",contextWords:["phone","heard"]}] },
  { id:"mouse", target:"mouse", senses:[{id:"animal",sentence:"A tiny mouse hid under the cupboard.",contextWords:["tiny","cupboard"]},{id:"computer",sentence:"Click the icon using the mouse.",contextWords:["click","icon"]}] },
  { id:"spring", target:"spring", senses:[{id:"season",sentence:"Flowers begin to grow in spring.",contextWords:["flowers","grow"]},{id:"coil",sentence:"The metal spring bounced back into shape.",contextWords:["metal","bounced"]}] }
];

const chineseContextWordExamples = [
  { id:"bank", target:"苹果", senses:[{id:"money",sentence:"桌上放着一个红苹果。",contextWords:["桌上","红"]},{id:"river",sentence:"苹果发布了新手机。",contextWords:["发布","手机"]}] },
  { id:"bat", target:"杜鹃", senses:[{id:"animal",sentence:"杜鹃在树林里啼叫。",contextWords:["树林","啼叫"]},{id:"sport",sentence:"春天山坡上开满了杜鹃。",contextWords:["春天","开满"]}] },
  { id:"match", target:"打", senses:[{id:"game",sentence:"他打了一下球。",contextWords:["一下","球"]},{id:"fire",sentence:"下雨了，她打了一把伞。",contextWords:["下雨","伞"]}] },
  { id:"light", target:"花", senses:[{id:"weight",sentence:"花园里开了一朵花。",contextWords:["花园","一朵"]},{id:"lamp",sentence:"我花十元买了这本书。",contextWords:["十元","买"]}] }
];

export function getContextWordExamples(language) {
  return language === "zh" ? chineseContextWordExamples : contextWordExamples;
}

export const contextScenarios = [
  { id:"party", details:[{id:"age",category:"useful"},{id:"guests",category:"useful"},{id:"indoors",category:"useful"},{id:"budget",category:"useful"},{id:"anime",category:"useful"},{id:"blue",category:"extra"},{id:"saturn",category:"unrelated"}], rules:[{requires:["age","guests","budget","anime"],key:"full"},{requires:["guests","anime"],key:"themedGroup"},{requires:["budget","indoors"],key:"budgetIndoor"},{requires:["age"],key:"age"},{requires:["guests"],key:"guests"},{requires:["budget"],key:"budget"},{requires:["anime"],key:"anime"}] },
  { id:"weekend", details:[{id:"age",category:"useful"},{id:"friends",category:"useful"},{id:"outdoors",category:"useful"},{id:"budget",category:"useful"},{id:"rain",category:"useful"},{id:"photos",category:"extra"},{id:"saturn",category:"unrelated"}], rules:[{requires:["friends","outdoors","budget","rain"],key:"full"},{requires:["friends","outdoors"],key:"groupOutdoor"},{requires:["budget","rain"],key:"budgetRain"},{requires:["outdoors"],key:"outdoors"},{requires:["friends"],key:"friends"},{requires:["budget"],key:"budget"},{requires:["rain"],key:"rain"}] }
];

export function composeContextResponse(t, scenario, selectedIds) {
  const rule = scenario.rules.find((candidate) => candidate.requires.every((id) => selectedIds.includes(id)));
  const main = t(`contextStage.scenarios.${scenario.id}.responses.${rule?.key || "base"}`);
  const extra = scenario.details.find((detail) => detail.category === "extra" && selectedIds.includes(detail.id));
  return extra ? `${main} ${t(`contextStage.scenarios.${scenario.id}.responses.extra`)}` : main;
}
