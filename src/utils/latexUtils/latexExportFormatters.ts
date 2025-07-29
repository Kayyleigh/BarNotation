import type { Note, TextCellContent } from "../../models/noteTypes";
import { TEXT_CELL_TYPES } from "../../models/textTypes";

export type LatexFormat = "singleColumn" | "doubleColumn";

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([%$#&_{}])/g, "\\$1")
    .replace(/\^/g, "\\^{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function textCellToLatex(content: TextCellContent): string {
  if (!(content.text)) { // Failsafe for legacy formats
    if (typeof content === "string") return content;
    else return "";
  }

  const escaped = escapeLatex(content.text.trim());

  switch (content.type) {
    case TEXT_CELL_TYPES.Section:
      return `\\section{${escaped}}`;
    case TEXT_CELL_TYPES.Subsection:
      return `\\subsection{${escaped}}`;
    case TEXT_CELL_TYPES.Subsubsection:
      return `\\subsubsection{${escaped}}`;
    case TEXT_CELL_TYPES.Plain:
    default:
      return escaped;
  }
}

export function formatNoteToLatex(note: Note, format: LatexFormat): string {
  const header = [
    `% Exported LaTeX from BarNotation`,
    `\\documentclass${format === "doubleColumn" ? "[twocolumn]" : ""}{article}`,
    `\\usepackage{amsmath}`,
    `\\usepackage{amssymb}`,
    `\\usepackage[utf8]{inputenc}`,
    ``,
    `\\title{${note.metadata.title || "Untitled"}}`,
    `\\author{${note.metadata.author || "Anonymous"}}`,
    `\\date{${note.metadata.dateOrPeriod || "\\today"}}`,
    ``,
    `\\begin{document}`,
    `\\maketitle`
  ].join("\n");

  const body = note.cells.map((cell) => {
    if (cell.type === "math") {
      const latex = cell.content;
      return `${latex}`;
    } else if (cell.type === "text") {
      return textCellToLatex(cell.content);
    } else {
      return ""; // unknown cell type
    }
  }).join("\n\n");

  const footer = "\\end{document}";

  return `${header}\n\n${body}\n\n${footer}`;
}
