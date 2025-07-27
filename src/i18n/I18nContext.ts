import { createContext } from "react";
import type { LanguageKey } from "./languages";

export interface I18nContextType {
    lang: LanguageKey;
    setLang: (lang: LanguageKey) => void;
    t: (path: string, vars?: { [key: string]: unknown }) => string
}

export const I18nContext = createContext<I18nContextType | null>(null);
