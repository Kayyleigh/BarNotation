import type { EditorState } from "./editor-state";
import { handleArrowLeft, handleArrowRight } from "./navigation";
import { handleBracketInsert, handleCharacterInsert } from "./insertion";
import { handleBackspace } from "./deletion";
import { transformToActsymbNode, transformToFraction, transformToSubSupNode, transformToOverUnderset, transformToCustomAccent } from "./transformations";
import { getStyleFromSymbol, isClosingBracket, isOpeningBracket } from "../utils/bracketUtils";

export function handleKeyDown(
  e: React.KeyboardEvent,
  state: EditorState
): EditorState | null {

  // === Triple-key events ===

  if (e.shiftKey && e.ctrlKey && e.code === 'Digit6') {
    e.preventDefault();
    return transformToActsymbNode(state, "supLeft");
  }

  if (e.shiftKey && e.ctrlKey && e.code === 'Minus') {
    e.preventDefault();
    return transformToActsymbNode(state, "subLeft");
  }

  // === Double-key events ===

  // Actuarial symbol
  if (e.altKey && e.code === 'Digit6') {
    e.preventDefault();
    return transformToActsymbNode(state, "supRight");
  }

  if (e.altKey && e.code === 'Minus') {
    e.preventDefault();
    return transformToActsymbNode(state, "subRight");
  }

  // TODO remove these 2; just for testing
  if (e.ctrlKey && e.key === "ArrowUp") {
    e.preventDefault();
    return transformToCustomAccent(state, "above");
  }

  if (e.ctrlKey && e.key === "ArrowDown") {
    e.preventDefault();
    return transformToCustomAccent(state, "below");
  }

  // Over/Underset
  if (e.shiftKey && e.key === "ArrowUp") {
    e.preventDefault();
    return transformToOverUnderset(state, "overunderset", "above");
  }

  if (e.shiftKey && e.key === "ArrowDown") {
    e.preventDefault();
    return transformToOverUnderset(state, "overunderset", "below");
  }

  // nth top/bottom
  if (e.altKey && e.key === "ArrowUp") {
    e.preventDefault();
    return transformToOverUnderset(state, "nthtopbottom", "above");
  }

  if (e.altKey && e.key === "ArrowDown") {
    e.preventDefault();
    return transformToOverUnderset(state, "nthtopbottom", "below");
  }

  // Regular childed 
  if (e.shiftKey && e.code === 'Digit6') {
    e.preventDefault();    
    return transformToSubSupNode(state, "supRight");
  }

  if (e.shiftKey && e.key === '_') {
    e.preventDefault();
    return transformToSubSupNode(state, "subRight");
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
    console.log("yyou typed", key)
    return handleCharacterInsert(state, key);
  }

  return null; // Unhandled
}
