import { nodeToLatex } from "../../models/nodeToLatex";
import type { Note, TextCellContent } from "../../models/noteTypes";
import { TEXT_CELL_TYPES } from "../../models/textTypes";

export type LatexFormat = "singleColumn" | "doubleColumn";

export interface LatexExportOptions {
  format: LatexFormat;
  wrapMathEquations: boolean;
}

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([%$#&_{}])/g, "\\$1")
    .replace(/\^/g, "\\^{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function textCellToLatex(content: TextCellContent): string {
  if (!content?.text) {
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

export function formatNoteToLatex(
  note: Note, 
  options: LatexExportOptions,
  includeHtmlStyling: boolean = false
): string {
  const { format, wrapMathEquations } = options;

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

  const savedEditorStatesString = localStorage.getItem(`note-editor-state-${note.id}`);

  let body = "";

  if (savedEditorStatesString !== null) {
    body = note.cells.map((cell) => {
      if (cell.type === "math") {
              
        const savedEditorStates = JSON.parse(savedEditorStatesString)

        const rootNode = savedEditorStates.states[cell.id].rootNode
        let content = nodeToLatex(rootNode, includeHtmlStyling)

        if (wrapMathEquations) {
          // Remove wrapping \[ and \]
          if (content.startsWith("\\[") && content.endsWith("\\]")) {
            content = content.slice(2, -2).trim();
          }

          // Indent all lines of math content
          const indented = content
            .split("\n")
            .map(line => `  ${line}`) // two-space indentation
            .join("\n");

          return `\\begin{equation}\n${indented}\n\\end{equation}`;
        } else {
          return content;
        }
        
      } else if (cell.type === "text") {
        return textCellToLatex(cell.content);
      } else {
        return "";
      }
    }).join("\n\n");
  }
  const footer = "\\end{document}";

  return `${header}\n\n${body}\n\n${footer}`;
}
