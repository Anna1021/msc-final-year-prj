import React from "react";

export default function AiLabVisualInstruction({ items }) {
  return <div className="ai-lab-visual-instruction">{items.map(({ Icon, text, example }, index) => <React.Fragment key={text}><span><Icon size={20} strokeWidth={1.8} /><strong>{text}</strong>{example && <small>{example}</small>}</span>{index < items.length - 1 && <i aria-hidden="true">→</i>}</React.Fragment>)}</div>;
}
