export const predictionExamples=[
{id:"spread",contexts:[{id:"food",prompt:"She spread butter on the",candidates:[[" toast",62],[" bread",24],[" table",10],[" moon",4]]},{id:"book",prompt:"She placed the book on the",candidates:[[" table",46],[" shelf",34],[" desk",16],[" toast",4]]}]},
{id:"lunch",contexts:[{id:"sport",prompt:"The goalkeeper caught the",candidates:[[" ball",78],[" train",10],[" sandwich",8],[" cloud",4]]},{id:"food",prompt:"At lunch, he ate the",candidates:[[" sandwich",48],[" apple",32],[" ball",12],[" cloud",8]]}]},
{id:"weather",contexts:[{id:"rain",prompt:"Dark clouds filled the sky, so it might",candidates:[[" rain",64],[" storm",20],[" clear",11],[" dance",5]]},{id:"sun",prompt:"The sky was bright and clear, so it might stay",candidates:[[" sunny",66],[" warm",19],[" dry",12],[" purple",3]]}]},
{id:"school",contexts:[{id:"lesson",prompt:"The teacher wrote the answer on the",candidates:[[" board",67],[" page",18],[" desk",11],[" sandwich",4]]},{id:"student",prompt:"The student wrote the answer on the",candidates:[[" page",51],[" worksheet",29],[" board",15],[" cloud",5]]}]},
{id:"story",contexts:[{id:"forest",prompt:"Once upon a time, a robot walked into the",candidates:[[" forest",43],[" city",31],[" cave",20],[" .",6]]},{id:"space",prompt:"Once upon a time, a robot flew towards the",candidates:[[" moon",39],[" station",34],[" planet",22],[" .",5]]}]},
{id:"animal",contexts:[{id:"cat",prompt:"The cat curled up on the soft",candidates:[[" bed",52],[" mat",28],[" chair",16],[" moon",4]]},{id:"dog",prompt:"The dog chased the red",candidates:[[" ball",69],[" frisbee",19],[" car",9],[" cloud",3]]}]}
];
export const predictionContinuationSets=[[[" and",38],[".",32],[" with",18],[" because",12]],[[" the",44],[" a",28],[" two",17],[" bright",11]],[[" friends",36],[" story",29],[" game",23],[" robot",12]],[[".",55],["!",21],[" today",16],[" again",8]]];

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
