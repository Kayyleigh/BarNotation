import type { EditorState } from "./editor-state";
import { handleArrowLeft, handleArrowRight } from "./navigation";
import { handleBracketInsert, handleCharacterInsert } from "./insertion";
import { handleBackspace } from "./deletion";
import { transformToActsymbNode, transformToFraction, transformToSubSupNode } from "./transformations";
import { getStyleFromSymbol, isClosingBracket, isOpeningBracket } from "../utils/bracketUtils";
import { latexToMathNode, nodeToLatex } from "../models/latexParser";
import type { InlineContainerNode } from "../models/types";

export function handleKeyDown(
  e: React.KeyboardEvent,
  state: EditorState
): EditorState | null {

  // === Triple-key events ===

  if (e.ctrlKey && e.shiftKey && e.code === 'Digit6') {
    e.preventDefault();
    return transformToActsymbNode(state, "supLeft");
  }

  if (e.ctrlKey && e.shiftKey && e.key === '_') {
    e.preventDefault();
    return transformToActsymbNode(state, "subLeft");
  }

  // === Double-key events ===

  if (e.shiftKey && e.code === 'Digit6') {
    e.preventDefault();    
    return transformToSubSupNode(state, "supRight");
  }

  if (e.shiftKey && e.key === '_') {
    e.preventDefault();
    return transformToSubSupNode(state, "subRight");
  }

  if (e.ctrlKey && e.key === '6') {
    e.preventDefault();
    return transformToActsymbNode(state, "supRight");
  }

  if (e.ctrlKey && e.key === '-') {
    e.preventDefault();
    return transformToActsymbNode(state, "subRight");
  }

  // === Single-key events ===

  const key = e.key;

  if (key === "@") {
    e.preventDefault();
    console.log(nodeToLatex(state.rootNode))
  }

  if (key === "#") {
    e.preventDefault();
    const forcedRoot = latexToMathNode(`P(A|B) = \\frac{P(B|A) P(A)}{P(B)}`);
    return { rootNode: forcedRoot, cursor: { containerId: forcedRoot.id, index: (forcedRoot as InlineContainerNode).children.length } };
  }

  if (key === "ArrowLeft") {
    e.preventDefault();
    return handleArrowLeft(state);
  }

  if (key === "ArrowRight") {
    e.preventDefault();
    return handleArrowRight(state);
  }

  if (key === "Backspace") {
    e.preventDefault();
    return handleBackspace(state);
  }

  // Transformations: "/", "^", "_", etc.
  if (key === "/") {
    e.preventDefault();
    return transformToFraction(state);
  }

  if (isOpeningBracket(key)) {
    e.preventDefault();
    const style = getStyleFromSymbol(key);

    if (style) {
      return handleBracketInsert(state, style, "open");
    }
  }

  if (isClosingBracket(key)) {
    e.preventDefault();
    const style = getStyleFromSymbol(key);

    if (style) {
      return handleBracketInsert(state, style, "close");
    }
  }

  // Character input: only printable characters
  if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    console.log(`you input ${key}`)
    return handleCharacterInsert(state, key);
  }

  return null; // Unhandled
}
