// utils/latexDependencies.ts
import type { Note } from "../../models/noteTypes";
import type { MathNode } from "../../models/types";

function containsActuarialSymbol(node: MathNode): boolean {
  if (!node) return false;

  if (node.type === "childed" && node.variant === "actsymb") return true;

  // TODO could strictly keep it at importing actuarialangle (so make another function separately), but imo likely that user needs symbol anyway
  if (node.type === "accented" && node.accent.type === "predefined" && node.accent.decoration === "angl") return true;

  const children: MathNode[] = [];

  if ("child" in node && node.child) children.push(node.child);
  if ("children" in node && Array.isArray(node.children)) children.push(...node.children);
  if ("numerator" in node) children.push(node.numerator, node.denominator);
  if ("index" in node) children.push(node.index, node.base);
  if ("rows" in node) node.rows.forEach(row => children.push(...row));
  if ("elements" in node) children.push(...node.elements);
  if ("base" in node && node.base) children.push(node.base);
  if ("accent" in node && node.accent?.content) children.push(node.accent.content);
  if ("lower" in node && node.lower) children.push(node.lower);
  if ("upper" in node && node.upper) children.push(node.upper);
  if ("subLeft" in node) children.push(node.subLeft, node.subRight, node.supLeft, node.supRight);

  return children.some(child => child && containsActuarialSymbol(child));
}

export function noteUsesActuarialSymbols(note: Note): boolean {
  const stateJSON = localStorage.getItem(`note-editor-state-${note.id}`);
  if (!stateJSON) return false;

  const { states } = JSON.parse(stateJSON);

  return note.cells.some(cell => {
    if (cell.type !== "math") return false;
    const root = states[cell.id]?.rootNode;
    return root && containsActuarialSymbol(root);
  });
}
