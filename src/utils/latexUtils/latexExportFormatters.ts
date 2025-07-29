import { nodeToLatex } from "../../models/nodeToLatex";
import type { Note, TextCellContent } from "../../models/noteTypes";
import { TEXT_CELL_TYPES } from "../../models/textTypes";
import { noteUsesActuarialSymbols } from "./latexDependencies";

export type LatexFormat = "singleColumn" | "doubleColumn";

export interface LatexExportOptions {
  format: LatexFormat;
  wrapMathEquations: boolean;
}

// Could later use this for template extensions
export interface LatexExportTemplate {
  renderPreamble(note: Note, options: LatexExportOptions): string;
  renderBody(note: Note, options: LatexExportOptions, includeHtmlStyling: boolean): string;
  renderFooter(): string;
}

function stripOuterDisplayMath(content: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${content}</div>`, "text/html");
  const container = doc.body.firstChild;

  if (!(container instanceof HTMLElement)) return content;

  const children = Array.from(container.children);

  // Look for \[ at the beginning
  const first = children[0];
  const last = children[children.length - 1];

  const isStartDisplayMath =
    first?.textContent?.trim() === "\\[" && first.classList.contains("latex-cmd");

  const isEndDisplayMath =
    last?.textContent?.trim() === "\\]" && last.classList.contains("latex-cmd");

  if (isStartDisplayMath && isEndDisplayMath) {
    // Remove outer \[ and \]
    first.remove();
    last.remove();
  }

  return container.innerHTML.trim();
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
    return typeof content === "string" ? content : "";
  }

  const escaped = escapeLatex(content.text.trim());

  switch (content.type) {
    case TEXT_CELL_TYPES.Section:
      return `\\section{${escaped}}`;
    case TEXT_CELL_TYPES.Subsection:
      return `\\subsection{${escaped}}`;
    case TEXT_CELL_TYPES.Subsubsection:
      return `\\subsubsection{${escaped}}`;
    default:
      return escaped;
  }
}

function defaultPreamble(note: Note, options: LatexExportOptions): string {
  const { format } = options;

  const lines = [
    `% Exported LaTeX from BarNotation`,
    `\\documentclass${format === "doubleColumn" ? "[twocolumn]" : ""}{article}`,
    `\\usepackage{amsmath}`,
    `\\usepackage{amssymb}`,
    `\\usepackage[utf8]{inputenc}`,
  ];

  if (noteUsesActuarialSymbols(note)) {
    lines.push(`\\usepackage{actuarialsymbol}`);
  }

  lines.push(
    ``,
    `\\title{${escapeLatex(note.metadata.title || "Untitled")}}`,
    `\\author{${escapeLatex(note.metadata.author || "Anonymous")}}`,
    `\\date{${escapeLatex(note.metadata.dateOrPeriod || "\\today")}}`,
    ``,
    `\\begin{document}`,
    `\\maketitle`
  );

  return lines.join("\n");
}

function defaultFooter(): string {
  return `\\end{document}`;
}

function defaultBody(note: Note, options: LatexExportOptions, includeHtmlStyling: boolean): string {
  const { wrapMathEquations } = options;
  const savedEditorStatesString = localStorage.getItem(`note-editor-state-${note.id}`);
  if (!savedEditorStatesString) return "";

  const savedEditorStates = JSON.parse(savedEditorStatesString);

  return note.cells.map((cell) => {
    if (cell.type === "math") {
      const rootNode = savedEditorStates.states[cell.id]?.rootNode;
      if (!rootNode) return "";

      let content = nodeToLatex(rootNode, includeHtmlStyling);

      if (wrapMathEquations) {
        // Remove \[ \] wrapper 
        content = stripOuterDisplayMath(content);

        const indented = content
          .split("\n")
          .map(line => `  ${line}`)
          .join("\n");

        const wrapperLeft = includeHtmlStyling ? highlightLatex(`\\begin{equation}`) : `\\begin{equation}`;
        const wrapperRight = includeHtmlStyling ? highlightLatex(`\\end{equation}`) : `\\end{equation}`;
        return `${wrapperLeft}\n${indented}\n${wrapperRight}`;
      }

      return content;
    }

    if (cell.type === "text") {
      const plain = textCellToLatex(cell.content);
      return includeHtmlStyling ? highlightLatex(plain) : plain;
    }

    return "";
  }).join("\n\n");
}

export function formatNoteToLatex(
  note: Note,
  options: LatexExportOptions,
  includeHtmlStyling = false
): string {
  let header = defaultPreamble(note, options);
  let footer = defaultFooter();

  if (includeHtmlStyling) {
    header = highlightLatex(header);
    footer = highlightLatex(footer);
  }

  const body = defaultBody(note, options, includeHtmlStyling);

  return `${header}\n\n${body}\n\n${footer}`;
}

export function highlightLatex(latex: string): string {
  const COMMENT_REGEX = /(%[^\n]*)/g;
  const COMMAND_REGEX = /(\\[a-zA-Z@]+[*]?)/g;

  return latex
    .replace(COMMENT_REGEX, '<span class="latex-comment">$1</span>')
    .replace(COMMAND_REGEX, '<span class="latex-cmd">$1</span>');
}