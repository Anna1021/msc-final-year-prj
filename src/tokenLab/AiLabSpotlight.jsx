import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, X } from "lucide-react";

const padding=8;
const focusableSelector='button:not(:disabled),[href],textarea,input,select,[tabindex]:not([tabindex="-1"])';
function targetFor(step){return document.querySelector(`[data-tour-id="${step.target}"]`)}

export default function AiLabSpotlight({active,stepIndex,steps,t,onNext,onPrevious,onSkip,onFinish}){
  const[rect,setRect]=useState(null),[replayRect,setReplayRect]=useState(null);
  const cardRef=useRef(null),returnFocusRef=useRef(null),step=steps?.[stepIndex];
  useEffect(()=>{if(!active)return undefined;returnFocusRef.current=document.activeElement;return()=>{const target=returnFocusRef.current;if(target?.isConnected)window.requestAnimationFrame(()=>target.focus({preventScroll:true}))}},[active]);
  useLayoutEffect(()=>{
    if(!active||!step)return undefined;let frame;
    const update=()=>{const target=targetFor(step);if(!target){setRect(null);return}const bounds=target.getBoundingClientRect();setRect({top:Math.max(0,bounds.top-padding),left:Math.max(0,bounds.left-padding),right:Math.min(window.innerWidth,bounds.right+padding),bottom:Math.min(window.innerHeight,bounds.bottom+padding),width:bounds.width+padding*2,height:bounds.height+padding*2});const replay=step.start?document.querySelector('[data-tour-id="ai-lab-replay-guide"]'):null;if(replay){const b=replay.getBoundingClientRect();setReplayRect({top:b.top-5,left:b.left-5,width:b.width+10,height:b.height+10})}else setReplayRect(null)};
    const requestUpdate=()=>{window.cancelAnimationFrame(frame);frame=window.requestAnimationFrame(update)};update();window.addEventListener("resize",requestUpdate);window.addEventListener("scroll",requestUpdate,true);return()=>{window.cancelAnimationFrame(frame);window.removeEventListener("resize",requestUpdate);window.removeEventListener("scroll",requestUpdate,true)};
  },[active,step]);
  useEffect(()=>{if(!active||!step)return;const target=targetFor(step);if(!target)return;const bounds=target.getBoundingClientRect(),reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;if(bounds.top<104||bounds.bottom>window.innerHeight-24)target.scrollIntoView({behavior:reduced?"auto":"smooth",block:"center"});window.requestAnimationFrame(()=>{const preferred=step.waitsForAction?target.querySelector(focusableSelector):cardRef.current?.querySelector("button");preferred?.focus({preventScroll:true})})},[active,step]);
  useEffect(()=>{if(!active)return undefined;const onKeyDown=event=>{if(event.key==="Escape"){event.preventDefault();onSkip();return}if(event.key!=="Tab")return;const target=targetFor(step);const nodes=[...(cardRef.current?.querySelectorAll(focusableSelector)||[]),...(step?.waitsForAction?target?.querySelectorAll(focusableSelector)||[]:[])].filter(node=>!node.disabled);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}};document.addEventListener("keydown",onKeyDown);return()=>document.removeEventListener("keydown",onKeyDown)},[active,step,onSkip]);
  if(!active||!step||!rect)return null;
  const cardBelow=rect.bottom+16,useAbove=cardBelow+240>window.innerHeight&&rect.top>260;
  const cardStyle={"--spotlight-card-top":`${useAbove?Math.max(16,rect.top-228):Math.min(cardBelow,window.innerHeight-228)}px`,"--spotlight-card-left":`${Math.min(Math.max(16,rect.left),Math.max(16,window.innerWidth-376))}px`};
  return <div className="ai-lab-spotlight" role="dialog" aria-modal="true" aria-label={t("tokenLab.tour.label")}>
    <div className="ai-lab-spotlight-shade top" style={{height:rect.top}}/><div className="ai-lab-spotlight-shade left" style={{top:rect.top,width:rect.left,height:rect.height}}/><div className="ai-lab-spotlight-shade right" style={{top:rect.top,left:rect.right,height:rect.height}}/><div className="ai-lab-spotlight-shade bottom" style={{top:rect.bottom}}/><div className="ai-lab-spotlight-ring" style={{top:rect.top,left:rect.left,width:rect.width,height:rect.height}}/>{step.start&&replayRect&&<div className="ai-lab-replay-focus" aria-hidden="true" style={replayRect}/>}<section ref={cardRef} className="ai-lab-tour-card" style={cardStyle}>
      <header><span>{t("tokenLab.tour.progress",{current:stepIndex+1,total:steps.length})}</span><img src="/assets/img/mission-robot-pointing.png" alt=""/><button type="button" aria-label={t("tokenLab.tour.skip")} onClick={onSkip}><X size={17} strokeWidth={1.8}/></button></header>
      <h2>{step.start&&<ArrowUpRight className="ai-lab-tour-direction" size={18} strokeWidth={1.8}/>} {t(step.titleKey)}</h2><p>{t(step.bodyKey)}</p>
      <footer>{step.start?<button type="button" className="light" onClick={onSkip}>{t("tokenLab.tour.skip")}</button>:<button type="button" className="light" onClick={onPrevious}><ArrowLeft size={16}/>{t("tokenLab.tour.back")}</button>}{step.finish?<button type="button" className="primary" onClick={onFinish}>{t("tokenLab.tour.finish")}<Check size={16}/></button>:step.waitsForAction?<small>{t(step.waitKey||"tokenLab.tour.clickTarget")}</small>:<button type="button" className="primary" onClick={onNext}>{step.start?t("tokenLab.tour.start"):t("tokenLab.tour.next")}<ArrowRight size={16}/></button>}</footer>
    </section>
  </div>;
}
