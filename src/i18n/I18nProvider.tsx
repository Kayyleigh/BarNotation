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

  const t = (path: string, vars?: { [key: string]: unknown }): string => {
    const parts = path.split(".");
    let value: unknown = translations[lang];
  
    for (const part of parts) {
      if (typeof value === "object" && value !== null && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return path;
      }
    }
  
    // Always check for _plural if count !== 1
    if (vars?.count != null && vars.count !== 1) {
      const pluralPath = path + "_plural";
      let pluralValue: unknown = translations[lang];
      for (const part of pluralPath.split(".")) {
        if (typeof pluralValue === "object" && pluralValue !== null && part in pluralValue) {
          pluralValue = (pluralValue as Record<string, unknown>)[part];
        } else {
          pluralValue = null;
          break;
        }
      }
  
      if (typeof pluralValue === "string") {
        value = pluralValue;
      }
    }
  
    if (typeof value !== "string") return path;
  
    if (!vars) return value;
  
    return value.replace(/\{\{(.*?)\}\}/g, (_, key) =>
      String(vars[key.trim()] ?? `{{${key}}}`)
    );
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};
