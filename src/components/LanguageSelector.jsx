import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useI18n } from "../i18n/index.jsx";

export default function LanguageSelector({ compact = false, guideTarget = null }) {
  const { language, setLanguage, languages, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find((item) => item.code === language) || languages[0];

  useEffect(() => {
    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={`language-selector ${compact ? "language-selector-compact" : ""}`} ref={ref} data-guide-target={guideTarget || undefined}>
      <button
        type="button"
        className="language-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.language.choose")}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe2 size={18} aria-hidden="true" />
        <span className="language-current">
          <strong>{current.shortName}</strong>
          {!compact && <small>{current.nativeName}</small>}
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="language-menu" role="listbox" aria-label={t("common.language.label")}>
          {languages.map((option) => (
            <button
              type="button"
              key={option.code}
              role="option"
              aria-selected={option.code === language}
              onClick={() => {
                setLanguage(option.code);
                setOpen(false);
              }}
            >
              <span className="language-option-text">
                <strong>{option.nativeName}</strong>
                <small>{option.shortName}</small>
              </span>
              {option.code === language && <Check size={18} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
