export const AVAILABLE_LANGUAGES = {
    cs: { name: "Čeština" },         // Czech
    // de: { name: "Deutsch" },         // German
    // el: { name: "Ελληνικά" },        // Greek
    en: { name: "English", default: true }, // English (default)
    // es: { name: "Español" },         // Spanish
    // fr: { name: "Français" },        // French
    nl: { name: "Nederlands" },      // Dutch
    // ro: { name: "Română" },          // Romanian
    // sk: { name: "Slovenčina" },      // Slovak
  };
  
  export type LanguageKey = keyof typeof AVAILABLE_LANGUAGES;
  