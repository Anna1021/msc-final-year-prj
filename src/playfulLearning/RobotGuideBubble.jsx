import React from "react";
import { Search } from "lucide-react";

export default function RobotGuideBubble({ label, title, children, illustration }) {
  return <div className="playful-guide-scene">
    {illustration}
    <div className="playful-guide-bubble">
      <span className="playful-guide-label"><Search size={15} strokeWidth={1.9} />{label}</span>
      <h3>{title}</h3>
      {children}
    </div>
  </div>;
}
