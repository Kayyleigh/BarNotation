// accentUtils.ts

// Extract keys as a union type of accents/decorations:
export type NodeDecoration = "tilde" | "hat" | "widehat" | "bar" | "ddot" | "mathring" | "angl" | "underline" | "joint" | "overline" | "underbrace";

export interface DecorationInfo {
  command: string;        // The LaTeX command string
  package?: string;       // Optional LaTeX package required
}

export const decorationToLatexCommand: Record<NodeDecoration, DecorationInfo> = {
  hat: { command: "\\hat" },
  bar: { command: "\\bar" },
  widehat: { command: "\\widehat", package: "amsmath" }, // example package
  tilde: { command: "\\tilde" },
  ddot: { command: "\\ddot" },
  mathring: { command: "\\mathring" },
  angl: { command: "\\angl", package: "actuarialangle" },
  underline: { command: "\\underline" },
  joint: { command: "\\joint" }, 
  overline: { command: "\\overline" }, 
  underbrace: { command: "\\underbrace" }, 
};

export const decorationToLatexCommandInverse = Object.fromEntries(
  Object.entries(decorationToLatexCommand).map(([k, v]) => [v.command.replace(/^\\/, ""), k])
);
