import React, { useEffect, useState } from "react";
import { I18nContext } from "./I18nContext";
// import cs from "./strings/cs";
// import de from "./strings/de";
// import el from "./strings/el";
import en from "./strings/en";
// import es from "./strings/es";
// import fr from "./strings/fr";
import nl from "./strings/nl";
// import ro from "./strings/ro";
// import sk from "./strings/sk";

import type { LanguageKey } from "./languages";

const translations: Record<LanguageKey, typeof en> = {
// cs,
// de,
// el,
en,
// es,
// fr,
nl,
// ro,
// sk,
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LanguageKey>(() => {
    const stored = localStorage.getItem("language");
    return (stored as LanguageKey) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", lang);
  }, [lang]);

  const t = (path: string): string => {
    const parts = path.split(".");
    let value: unknown = translations[lang];
  
    for (const part of parts) {
      if (typeof value === "object" && value !== null && part in value) {
        value = (value as Record<string, unknown>)[part]; // narrow the type
      } else {
        return path; // fallback to showing the key
      }
    }
  
    return typeof value === "string" ? value : path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};
