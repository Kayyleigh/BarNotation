// accentUtils.ts

// Extract keys as a union type of accents/decorations:
export type NodeDecoration = "tilde" | "hat" | "widehat" | "bar" | "ddot" | "mathring" | "angl" | "underline" | "joint";

export const decorationToLatexCommand: Record<NodeDecoration, string | undefined> = {
    hat: "\\hat",
    bar: "\\bar",
    widehat: "\\widehat",
    tilde: "\\tilde",
    ddot: "\\ddot",
    mathring: "\\mathring",
    angl: "\\angl",
    underline: "\\underline",
    joint: "\\joint" // or your custom LaTeX macro if defined
  };

  export const decorationToLatexCommandInverse = Object.fromEntries(
    Object.entries(decorationToLatexCommand).map(([k, v]) => [v.replace(/^\\/, ""), k])
  );