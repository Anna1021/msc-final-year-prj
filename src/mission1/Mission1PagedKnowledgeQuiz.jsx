import React,{useEffect,useMemo,useState} from "react";
import {ArrowRight,Check,CheckCircle2,HelpCircle,Lightbulb,X} from "lucide-react";
import TokenBuildingBlock from "../playfulLearning/TokenBuildingBlock.jsx";

const LETTERS=["A","B","C","D"];

export default function Mission1PagedKnowledgeQuiz({active,copy,resetKey,onResultChange,onContinue,pageNumber=5,lessonClassName="mission-1-paged__lesson",showLesson1Visuals=true,showDecoration=true,showCorrectAnswer=false,showTitle=true}){
  const questions=copy.checkpointQuestions;
  const[currentQuestion,setCurrentQuestion]=useState(0);
  const[latestQuestion,setLatestQuestion]=useState(0);
  const[selected,setSelected]=useState(null);
  const[answerState,setAnswerState]=useState("idle");
  const[completed,setCompleted]=useState([]);
  const[responses,setResponses]=useState({});
  const finished=completed.length===questions.length;
  const reviewing=currentQuestion<latestQuestion;
  const question=questions[currentQuestion];
  const correctIndex=question.correct;
  const statusText=useMemo(()=>copy.questionOf.replace("{{current}}",String(currentQuestion+1)).replace("{{total}}",String(questions.length)),[copy.questionOf,currentQuestion,questions.length]);

  useEffect(()=>{setCurrentQuestion(0);setLatestQuestion(0);setSelected(null);setAnswerState("idle");setCompleted([]);setResponses({});onResultChange("idle")},[resetKey]);
  function saveResponse(questionIndex,nextSelected,nextState){setResponses(previous=>({...previous,[questionIndex]:{selected:nextSelected,answerState:nextState}}))}
  function showQuestion(index){if(index>latestQuestion||(!completed.includes(index)&&index!==latestQuestion))return;const response=responses[index]??{selected:null,answerState:"idle"};setCurrentQuestion(index);setSelected(response.selected);setAnswerState(response.answerState)}
  function choose(index){if(answerState!=="idle"||reviewing)return;setSelected(index);saveResponse(currentQuestion,index,"idle")}
  function checkAnswer(){if(selected===null||reviewing)return;const nextState=selected===correctIndex?"correct":"incorrect";setAnswerState(nextState);saveResponse(currentQuestion,selected,nextState)}
  function retry(){if(reviewing)return;setSelected(null);setAnswerState("idle");saveResponse(currentQuestion,null,"idle")}
  function advance(){const nextCompleted=[...new Set([...completed,currentQuestion])];setCompleted(nextCompleted);if(currentQuestion===questions.length-1){onResultChange("correct");return}const nextQuestion=currentQuestion+1;setLatestQuestion(nextQuestion);setCurrentQuestion(nextQuestion);const response=responses[nextQuestion]??{selected:null,answerState:"idle"};setSelected(response.selected);setAnswerState(response.answerState)}
  function returnToLatest(){showQuestion(latestQuestion)}

  if(finished)return <section className={`course-section ${lessonClassName} mission-knowledge-quiz`} data-lesson-page={pageNumber} hidden={!active}><QuizHeading copy={copy} pageNumber={pageNumber} showDecoration={showDecoration} showTitle={showTitle}/><div className="mission-checkpoint-complete" role="status"><span className="mission-checkpoint-complete__icon"><CheckCircle2/></span><h3>{copy.niceWork}</h3><p>{copy.completionText}</p><div>{copy.completedIdeas.map(item=><span key={item}><Check/>{item}</span>)}</div><button type="button" className="primary" onClick={onContinue}>{copy.continue}<ArrowRight/></button></div></section>;

  return <section className={`course-section ${lessonClassName} mission-knowledge-quiz`} data-lesson-page={pageNumber} hidden={!active}>
    <QuizHeading copy={copy} pageNumber={pageNumber} showDecoration={showDecoration} showTitle={showTitle}/>
    <div className="mission-checkpoint-layout">
      <aside className="mission-checkpoint-sidebar" aria-label={copy.yourProgress}><h3>{copy.yourProgress}</h3>{questions.map((item,index)=>{const locked=index>latestQuestion;return <button type="button" className={`${index===currentQuestion?"is-current":""} ${completed.includes(index)?"is-complete":""}`} aria-current={index===currentQuestion?"step":undefined} aria-label={`${copy.questionLabel} ${index+1}${completed.includes(index)?`, ${copy.completedLabel}`:""}`} disabled={locked} onClick={()=>showQuestion(index)} key={item.prompt}><span>{completed.includes(index)?<Check/>:index+1}</span>{copy.questionLabel} {index+1}</button>})}<p><Lightbulb/ ><strong>{copy.takeTime}</strong><small>{copy.readCarefully}</small></p></aside>
      <div className="mission-checkpoint-panel">
        <div className="mission-checkpoint-position"><strong>{statusText}</strong><span aria-hidden="true">{questions.map((_,index)=><i className={index<=currentQuestion?"is-active":""} key={index}/>)}</span></div>
        <h3>{question.prompt}</h3>
        {showLesson1Visuals&&currentQuestion===1&&<div className="mission-checkpoint-token-visual" aria-label={copy.qwenExample}><small>{copy.qwenExample}</small><strong>misunderstanding</strong><div><span><em>{copy.qwenTokenizer}</em><b><TokenBuildingBlock index={0}>mis</TokenBuildingBlock><TokenBuildingBlock index={1}>under</TokenBuildingBlock><TokenBuildingBlock index={2}>standing</TokenBuildingBlock></b></span><small>{copy.qwenVerifiedIds}</small></div></div>}
        <div className="mission-checkpoint-options" role="radiogroup" aria-label={question.prompt}>{question.options.map((option,index)=>{const resultClass=answerState!=="idle"&&index===selected?(answerState==="correct"?"is-correct":"is-incorrect"):"";return <button type="button" role="radio" aria-checked={selected===index} disabled={reviewing} className={`${selected===index?"is-selected":""} ${resultClass}`} onClick={()=>choose(index)} key={option}><span>{LETTERS[index]}</span><strong>{option}</strong>{resultClass==="is-correct"?<Check aria-label={copy.correctLabel}/>:resultClass==="is-incorrect"?<X aria-label={copy.incorrectLabel}/>:null}</button>})}</div>
        {answerState!=="idle"&&<div className={`mission-checkpoint-feedback is-${answerState}`} role="status">{answerState==="correct"?<CheckCircle2/>:<HelpCircle/>}<div><strong>{answerState==="correct"?copy.correctLabel:copy.tryAgain}</strong><p>{answerState==="correct"?question.correctFeedback:question.incorrectFeedback}</p>{answerState==="incorrect"&&showCorrectAnswer&&<p><strong>{copy.correctAnswerLabel}</strong> {question.options[correctIndex]}</p>}{showLesson1Visuals&&currentQuestion===2&&answerState==="correct"&&<span className="mission-checkpoint-id-visual"><TokenBuildingBlock index={2}>{copy.sampleToken}</TokenBuildingBlock><ArrowRight/><b>ID 305</b><small>{copy.idReminder}</small></span>}</div></div>}
        <div className="mission-checkpoint-actions">{reviewing?<button type="button" className="primary" onClick={returnToLatest}>{copy.returnToLatest}<ArrowRight/></button>:answerState==="idle"?<button type="button" className="primary" disabled={selected===null} onClick={checkAnswer}>{copy.checkAnswer}</button>:answerState==="incorrect"?<button type="button" className="primary" onClick={retry}>{copy.tryAgain}</button>:<button type="button" className="primary" onClick={advance}>{currentQuestion===questions.length-1?copy.finishCheckpoint:copy.nextQuestion}<ArrowRight/></button>}</div>
      </div>
    </div>
  </section>
}

function QuizHeading({copy,pageNumber,showDecoration,showTitle}){return <><div className="mission-paged-page-heading"><div className="course-section-head"><h2><span>{pageNumber}</span>{showTitle&&copy.quizTitle}</h2></div><span className="mission-paged-heading-sticker mission-checkpoint-clipboard" aria-hidden="true"><CheckCircle2/></span></div><div className="mission-checkpoint-banner"><div><span><HelpCircle/>{copy.conceptCheckpoint}</span><h3>{copy.threeQuestions}</h3><p>{copy.answerEach}</p></div>{showDecoration&&<div className="mission-checkpoint-decoration" aria-hidden="true"><strong>?</strong><img src="/assets/img/mission-robot-pointing.png" alt=""/></div>}</div></>}
