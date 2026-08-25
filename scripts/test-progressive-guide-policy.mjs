import assert from "node:assert/strict";
import {
  GENERIC_GUIDE_FLOW,
  LESSON_4_LIVE_GUIDE_FLOW,
  LESSON_5_TOY_MODEL_GUIDE_FLOW,
  REUSABLE_QUIZ_GUIDE_FLOW,
  guideFlows,
  readGuideLocation,
  resolveGuideForPage
} from "../src/guide/guideFlows.js";
import { createGuideState, guideReducer, shouldAutoStartGuide } from "../src/guide/guideState.js";

const location={lesson:9,page:1,key:"lesson9.page1",route:"/fixture"};
const flow=(id,autoStart=false)=>({id,autoStart,steps:[{id:"only"}]});
const pageGuide=flow("page",true), pageHelper=flow("helper"), reusable=flow("reusable"), generic=flow("generic");

function fixture(entry){return {reusable:{quiz:reusable},lessons:{9:{pages:{1:entry},fallback:generic}}};}
assert.equal(resolveGuideForPage({flows:fixture({pageSpecificGuide:pageGuide,pageSpecificHelper:pageHelper,reusableInteractions:["quiz"]}),location,trigger:"manual"}),pageGuide,"page Guide wins");
assert.equal(resolveGuideForPage({flows:fixture({pageSpecificHelper:pageHelper,reusableInteractions:["quiz"]}),location,trigger:"manual"}),pageHelper,"page helper wins");
assert.equal(resolveGuideForPage({flows:fixture({reusableInteractions:["quiz"]}),location,trigger:"manual"}),reusable,"reusable flow is used only without custom content");
assert.equal(resolveGuideForPage({flows:fixture({}),location,trigger:"manual"}),generic,"generic helper is the final fallback");

const lesson5=readGuideLocation({pathname:"/mission/5-bias-paged",search:"?page=5"});
assert.equal(resolveGuideForPage({flows:guideFlows,location:lesson5,trigger:"manual"}),LESSON_5_TOY_MODEL_GUIDE_FLOW);
assert.equal(resolveGuideForPage({flows:guideFlows,location:lesson5,trigger:"auto"}),LESSON_5_TOY_MODEL_GUIDE_FLOW);
assert.equal(LESSON_5_TOY_MODEL_GUIDE_FLOW.steps.length,4,"Lesson 5 uses one authoritative custom flow only");

const lesson4=readGuideLocation({pathname:"/mission/4-training-data-paged",search:"?page=4"});
assert.equal(resolveGuideForPage({flows:guideFlows,location:lesson4,trigger:"manual"}),LESSON_4_LIVE_GUIDE_FLOW);
assert.equal(resolveGuideForPage({flows:guideFlows,location:lesson4,trigger:"auto"}),LESSON_4_LIVE_GUIDE_FLOW);

const laterQuiz=readGuideLocation({pathname:"/mission/5-bias-paged",search:"?page=7"});
assert.equal(resolveGuideForPage({flows:guideFlows,location:laterQuiz,trigger:"manual"}),REUSABLE_QUIZ_GUIDE_FLOW);
assert.equal(resolveGuideForPage({flows:guideFlows,location:laterQuiz,trigger:"auto"}),null,"reusable quiz help remains manual-only");

const unknown={route:"/unknown",lesson:null,page:null,key:"/unknown"};
assert.equal(resolveGuideForPage({flows:guideFlows,location:unknown,trigger:"manual"}),GENERIC_GUIDE_FLOW);
assert.equal(resolveGuideForPage({flows:guideFlows,location:unknown,trigger:"auto"}),null);

const seen=guideReducer(createGuideState(),{type:"open",flowId:LESSON_5_TOY_MODEL_GUIDE_FLOW.id});
assert.equal(shouldAutoStartGuide(LESSON_5_TOY_MODEL_GUIDE_FLOW,guideReducer(seen,{type:"collapse"})),false);
assert.equal(resolveGuideForPage({flows:guideFlows,location:lesson5,trigger:"manual"}),LESSON_5_TOY_MODEL_GUIDE_FLOW,"manual replay resolution is unchanged by seen state");

process.stdout.write("Progressive Guide priority regression tests passed.\n");
