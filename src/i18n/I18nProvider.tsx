import React, { useEffect, useState } from "react";
import { I18nContext } from "./I18nContext";
import cs from "./strings/cs";
// import de from "./strings/de";
// import el from "./strings/el";
import en from "./strings/en";
// import es from "./strings/es";
// import fr from "./strings/fr";
import nl from "./strings/nl";
// import ro from "./strings/ro";
// import sk from "./strings/sk";

import type { LanguageKey } from "./languages";

type TranslationDict = {
  [key: string]: string | TranslationDict;
};

const translations: Record<LanguageKey, TranslationDict> = {
  cs,
  // de,
  // el,
  en,
  // es,
  // fr,
  nl,
  // ro,
  // sk,
};

function getPluralForm(lang: LanguageKey, count: number): string | null {
  if (lang === "cs") {
    if (count === 1) return null; // singular
    if ([2, 3, 4].includes(count)) return "_plural1"; // paucal
    return "_plural2"; // plural for 0, 5+
  }

  // Default (e.g., en, nl): singular = no suffix, plural = "_plural"
  return count !== 1 ? "_plural" : null;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LanguageKey>(() => {
    const stored = localStorage.getItem("language");
    return (stored as LanguageKey) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", lang);
  }, [lang]);

  const t = (path: string, vars?: { [key: string]: unknown }): string => {
    const count = typeof vars?.count === "number" ? vars.count : undefined;
    const pluralSuffix = count != null ? getPluralForm(lang, count) : null;

    // Try pluralized version first (e.g. minutesAgo_plural1)
    const pathsToTry = pluralSuffix ? [path + pluralSuffix, path + "_plural", path] : [path];

    for (const tryPath of pathsToTry) {
      const parts = tryPath.split(".");
      let value: unknown = translations[lang];

      for (const part of parts) {
        if (typeof value === "object" && value !== null && part in value) {
          value = (value as Record<string, unknown>)[part];
        } else {
          value = null;
          break;
        }
      }

      if (typeof value === "string") {
        // Interpolate variables like {{count}}
        return vars
          ? value.replace(/\{\{(.*?)\}\}/g, (_, key) =>
            String(vars[key.trim()] ?? `{{${key}}}`)
          )
          : value;
      }
    }

    // fallback: return key
    return path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};
