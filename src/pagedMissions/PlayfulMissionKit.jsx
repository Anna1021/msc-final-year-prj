import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import "./playfulMissionKit.css";

export function PlayfulWorkbench({ variant = "blue", label, instruction, robotSrc, robotAlt = "", icon: Icon, children, className = "" }) {
  return <section className={`paged-playful-workbench is-${variant} ${className}`.trim()}>
    <header className="paged-playful-workbench__guide">
      <div className="paged-playful-workbench__motif" aria-hidden="true"><span /><span />{Icon && <Icon />}</div>
      <div><span className="paged-playful-workbench__label">{Icon && <Icon size={16} strokeWidth={1.9} />}{label}</span><p>{instruction}</p></div>
      {robotSrc && <img src={robotSrc} alt={robotAlt} />}
    </header>
    <div className="paged-playful-workbench__activity">{children}</div>
  </section>;
}

export function PlayfulDiscoveryPanel({ title = "Discovery", children }) {
  return <div className="paged-playful-discovery" role="status"><span><CheckCircle2 /></span><div><strong>{title}</strong><p>{children}</p></div></div>;
}

export function PageTransitionBridge({ label, children }) {
  return <aside className="paged-playful-bridge"><span aria-hidden="true"><ArrowRight /></span><div><strong>{label}</strong><p>{children}</p></div></aside>;
}

export function TactileChoiceCard({ selected = false, tone = "blue", icon: Icon, children, className = "", ...props }) {
  return <button type="button" className={`paged-tactile-choice tone-${tone} ${selected ? "is-selected" : ""} ${className}`.trim()} {...props}>{Icon && <span><Icon /></span>}<span>{children}</span>{selected && <CheckCircle2 className="paged-tactile-choice__check" />}</button>;
}
