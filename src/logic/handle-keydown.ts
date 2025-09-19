import type { EditorState } from "./editor-state";
import { handleArrowLeft, handleArrowRight } from "./navigation";
import { handleBracketInsert, handleCharacterInsert } from "./insertion";
import { handleBackspace } from "./deletion";
import { transformToActsymbNode, transformToFraction, transformToSubSupNode, transformToOverUnderset } from "./transformations";
import { getStyleFromSymbol, isClosingBracket, isOpeningBracket } from "../utils/bracketUtils";
import { handleCtrlArrow } from "./matrix-manipulation";
import type { LibraryEntry } from "../models/libraryTypes";

export function handleKeyDown(
  e: React.KeyboardEvent,
  state: EditorState,
  commandMap?: Record<string, LibraryEntry>,
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

  // nth top/bottom
  if (e.shiftKey && e.altKey && e.key === "ArrowUp") {
    e.preventDefault();
    return transformToOverUnderset(state, "nthtopbottom", "above");
  }

  if (e.shiftKey && e.altKey && e.key === "ArrowDown") {
    e.preventDefault();
    return transformToOverUnderset(state, "nthtopbottom", "below");
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

  // Matrix: Ctrl + Arrow to insert row/column
  if (e.ctrlKey && !e.shiftKey) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      return handleCtrlArrow(state, "up");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      return handleCtrlArrow(state, "down");
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      return handleCtrlArrow(state, "left");
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      return handleCtrlArrow(state, "right");
    }
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
    // console.log("you typed", key)
    return handleCharacterInsert(state, key, commandMap);
  }

  return null; // Unhandled
}
