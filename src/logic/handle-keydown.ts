import type { EditorState } from "./editor-state";
import { handleArrowDown, handleArrowLeft, handleArrowRight, handleArrowUp, handleJumpLeft, handleJumpRight } from "./navigation";
import { handleBracketInsert, handleCharacterInsert } from "./insertion";
import { handleBackspace } from "./deletion";
import { transformToActsymbNode, transformToFraction, transformToSubSupNode, transformToOverUnderset } from "./transformations";
import { getStyleFromSymbol, isClosingBracket, isOpeningBracket } from "../utils/bracketUtils";
import { handleCtrlArrow } from "./matrix-manipulation";
import type { LibraryEntry } from "../models/libraryTypes";

/**
 * Normalize KeyboardEvent into a string key like:
 * "Alt+Digit6", "Shift+Ctrl+ArrowUp", etc.
 */
function getKeyCombo(e: KeyboardEvent | React.KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.shiftKey) parts.push("Shift");
  if (e.altKey) parts.push("Alt");
  parts.push(e.code); // Use `code` to be layout-independent
  return parts.join("+");
}

/**
 * Centralized map of key combos to handlers.
 * Each function returns a new EditorState or null.
 */
const keyMap: Record<
  string,
  (state: EditorState, e: KeyboardEvent | React.KeyboardEvent, commandMap?: Record<string, LibraryEntry>) => EditorState | null
> = {
  // Triple-key events
  "Shift+Alt+Digit6": (state) => transformToActsymbNode(state, "supLeft"),
  "Shift+Alt+Minus": (state) => transformToActsymbNode(state, "subLeft"),
  "Shift+Alt+ArrowUp": (state) => transformToOverUnderset(state, "nthtopbottom", "above"),
  "Shift+Alt+ArrowDown": (state) => transformToOverUnderset(state, "nthtopbottom", "below"),

  // Double-key events
  "Alt+Digit6": (state) => transformToActsymbNode(state, "supRight"),
  "Alt+Minus": (state) => transformToActsymbNode(state, "subRight"),
  "Ctrl+ArrowUp": (state) => handleCtrlArrow(state, "up"),
  "Ctrl+ArrowDown": (state) => handleCtrlArrow(state, "down"),
  "Ctrl+ArrowLeft": (state) => handleCtrlArrow(state, "left"),
  "Ctrl+ArrowRight": (state) => handleCtrlArrow(state, "right"),
  "Shift+ArrowUp": (state) => transformToOverUnderset(state, "overunderset", "above"),
  "Shift+ArrowDown": (state) => transformToOverUnderset(state, "overunderset", "below"),
  "Shift+Digit6": (state) => transformToSubSupNode(state, "supRight"),
  "Shift+Minus": (state) => transformToSubSupNode(state, "subRight"),
  "Shift+ArrowLeft": (state) => handleJumpLeft(state),
  "Shift+ArrowRight": (state) => handleJumpRight(state),

  // Single-key events
  "ArrowLeft": (state) => handleArrowLeft(state),
  "ArrowRight": (state) => handleArrowRight(state),
  "ArrowUp": (state) => handleArrowUp(state),
  "ArrowDown": (state) => handleArrowDown(state),
  "Backspace": (state) => handleBackspace(state),
  "Slash": (state) => transformToFraction(state), // "/"
};

/**
 * Unified keydown handler.
 */
export function handleKeyDown(
  e: React.KeyboardEvent,
  state: EditorState,
  commandMap?: Record<string, LibraryEntry>
): EditorState | null {

  // If Alt+digits (only digits 1-5) then preventdefault so the NotebookEditor can immediately catch it instead??
  if (e.altKey && /^(Digit[1-5]|Numpad[1-5]|Equal)$/.test(e.code)) {
    e.preventDefault();
    return null;
  }

  // First, check keyMap for explicit combos
  const combo = getKeyCombo(e);

  if (keyMap[combo]) {
    e.preventDefault();
    return keyMap[combo](state, e, commandMap); //Argument of type 'KeyboardEvent<Element>' is not assignable to parameter of type 'KeyboardEvent'.
  }

  // Bracket insertion
  if (isOpeningBracket(e.key)) {
    const style = getStyleFromSymbol(e.key);
    if (style) {
      e.preventDefault();
      return handleBracketInsert(state, style, "open");
    }
  }

  if (isClosingBracket(e.key)) {
    const style = getStyleFromSymbol(e.key);
    if (style) {
      e.preventDefault();
      return handleBracketInsert(state, style, "close");
    }
  }

  // Character input (printable characters only)
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    return handleCharacterInsert(state, e.key, commandMap);
  }

  // Unhandled keys bubble naturally
  return null;
}
