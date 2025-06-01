import type { EditorState } from "./editor-state";
import { handleArrowLeft, handleArrowRight } from "./navigation";
import { handleBracketInsert, handleCharacterInsert } from "./insertion";
import { handleBackspace } from "./deletion";
import { transformToActsymbNode, transformToFraction, transformToSubSupNode, transformToCustomAccent } from "./transformations";
import { getStyleFromSymbol, isClosingBracket, isOpeningBracket } from "../utils/bracketUtils";
import { latexToMathNode, nodeToLatex } from "../models/latexParser";
import type { InlineContainerNode } from "../models/types";

export function handleKeyDown(
  e: React.KeyboardEvent,
  state: EditorState
): EditorState | null {

  // === Triple-key events ===

  if (e.metaKey && e.shiftKey && e.code === 'Digit6') {
    e.preventDefault();
    return transformToActsymbNode(state, "supLeft");
  }

  if (e.metaKey && e.shiftKey && e.key === '_') {
    e.preventDefault();
    return transformToActsymbNode(state, "subLeft");
  }

  // === Double-key events ===

  if (e.shiftKey && e.key === "ArrowUp") {
    e.preventDefault();
    return transformToCustomAccent(state, "above");
  }

  if (e.shiftKey && e.key === "ArrowDown") {
    e.preventDefault();
    return transformToCustomAccent(state, "below");
  }


  if (e.shiftKey && e.code === 'Digit6') {
    e.preventDefault();    
    return transformToSubSupNode(state, "supRight");
  }

  if (e.shiftKey && e.key === '_') {
    e.preventDefault();
    return transformToSubSupNode(state, "subRight");
  }

  if (e.metaKey && e.key === '6') {
    e.preventDefault();
    return transformToActsymbNode(state, "supRight");
  }

  if (e.metaKey && e.key === '-') {
    e.preventDefault();
    return transformToActsymbNode(state, "subRight");
  }

  // === Single-key events ===

  const key = e.key;

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
