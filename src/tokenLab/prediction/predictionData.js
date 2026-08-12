export const predictionExamples=[
{id:"spread",contexts:[{id:"food",prompt:"She spread butter on the",candidates:[[" toast",62],[" bread",24],[" table",10],[" moon",4]]},{id:"book",prompt:"She placed the book on the",candidates:[[" table",46],[" shelf",34],[" desk",16],[" toast",4]]}]},
{id:"lunch",contexts:[{id:"sport",prompt:"The goalkeeper caught the",candidates:[[" ball",78],[" train",10],[" sandwich",8],[" cloud",4]]},{id:"food",prompt:"At lunch, he ate the",candidates:[[" sandwich",48],[" apple",32],[" ball",12],[" cloud",8]]}]},
{id:"weather",contexts:[{id:"rain",prompt:"Dark clouds filled the sky, so it might",candidates:[[" rain",64],[" storm",20],[" clear",11],[" dance",5]]},{id:"sun",prompt:"The sky was bright and clear, so it might stay",candidates:[[" sunny",66],[" warm",19],[" dry",12],[" purple",3]]}]},
{id:"school",contexts:[{id:"lesson",prompt:"The teacher wrote the answer on the",candidates:[[" board",67],[" page",18],[" desk",11],[" sandwich",4]]},{id:"student",prompt:"The student wrote the answer on the",candidates:[[" page",51],[" worksheet",29],[" board",15],[" cloud",5]]}]},
{id:"story",contexts:[{id:"forest",prompt:"Once upon a time, a traveller walked into the",candidates:[[" forest",43],[" city",31],[" cave",20],[" .",6]]},{id:"space",prompt:"Once upon a time, a pilot flew towards the",candidates:[[" moon",39],[" station",34],[" planet",22],[" .",5]]}]},
{id:"animal",contexts:[{id:"cat",prompt:"The cat curled up on the soft",candidates:[[" bed",52],[" mat",28],[" chair",16],[" moon",4]]},{id:"dog",prompt:"The dog chased the red",candidates:[[" ball",69],[" frisbee",19],[" car",9],[" cloud",3]]}]}
];
export const predictionContinuationSets=[[[" and",38],[".",32],[" with",18],[" because",12]],[[" the",44],[" a",28],[" two",17],[" bright",11]],[[" friends",36],[" story",29],[" game",23],[" lesson",12]],[[".",55],["!",21],[" today",16],[" again",8]]];

const chinesePredictionExamples=[
{id:"spread",contexts:[{id:"food",prompt:"她把黄油抹在",candidates:[["面包",62],["吐司",24],["桌上",10],["月亮",4]]},{id:"book",prompt:"她把书放在",candidates:[["桌上",46],["书架上",34],["书桌上",16],["吐司上",4]]}]},
{id:"lunch",contexts:[{id:"sport",prompt:"守门员接住了",candidates:[["球",78],["火车",10],["三明治",8],["云",4]]},{id:"food",prompt:"午餐时，他吃了",candidates:[["三明治",48],["苹果",32],["球",12],["云",8]]}]},
{id:"weather",contexts:[{id:"rain",prompt:"天空布满乌云，所以可能会",candidates:[["下雨",64],["打雷",20],["放晴",11],["跳舞",5]]},{id:"sun",prompt:"天空明亮晴朗，所以天气可能继续",candidates:[["晴朗",66],["温暖",19],["干燥",12],["紫色",3]]}]}
];
const chinesePredictionContinuationSets=[[['，而且',38],['。',32],['，还',18],['，因为',12]],[['这',44],['一个',28],['两个',17],['明亮的',11]],[['朋友',36],['故事',29],['游戏',23],['课程',12]],[['。',55],['！',21],['今天',16],['再次',8]]];

export function getPredictionExamples(language){return language==="zh"?chinesePredictionExamples:predictionExamples}
export function getPredictionContinuationSets(language){return language==="zh"?chinesePredictionContinuationSets:predictionContinuationSets}

// Reviewed classroom examples only. These probabilities are not Qwen output.
export const greedyTeachingExamples={
en:{prompt:"I feel very",candidates:[[" happy",46],[" tired",27],[" excited",17],[" nervous",10]]},
zh:{prompt:"我今天感到很",candidates:[["开心",46],["累",27],["兴奋",17],["紧张",10]]},
fr:{prompt:"Aujourd’hui, je me sens très",candidates:[[" heureux",46],[" fatigué",27],[" enthousiaste",17],[" nerveux",10]]},
de:{prompt:"Heute fühle ich mich sehr",candidates:[[" glücklich",46],[" müde",27],[" aufgeregt",17],[" nervös",10]]}
};

export function transformProbabilities(candidates,temperature=50){const power=temperature<50?1.8-temperature/62.5:1-(temperature-50)/125;const weights=candidates.map(([,p])=>p**power);const total=weights.reduce((a,b)=>a+b,0);const raw=weights.map(value=>value/total*100);const rounded=raw.map(Math.round);rounded[0]+=100-rounded.reduce((a,b)=>a+b,0);return candidates.map(([token],index)=>({token,probability:rounded[index]}))}
export function weightedChoice(distribution,random=Math.random){let point=random()*100;for(const item of distribution){point-=item.probability;if(point<0)return item.token}return distribution.at(-1).token}
export function likelihood(probability){return probability>=45?"more":probability>=15?"possible":"less"}
