import type { EditorState } from "./editor-state";
import { handleArrowLeft, handleArrowRight } from "./navigation";
import { handleBracketInsert, handleCharacterInsert } from "./insertion";
import { handleBackspace } from "./deletion";
import { transformToFraction, transformToGroupNode } from "./transformations";
import { createGroupNode, createInlineContainer } from "../models/nodeFactories";
import { getStyleFromSymbol, isClosingBracket, isOpeningBracket } from "../utils/bracketUtils";

export function handleKeyDown(
  e: React.KeyboardEvent,
  state: EditorState
): EditorState | null {
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

  // Opening bracket:
  // 1. if no more non-bracket after in container -> make pair with empty containernode
  // 2. if matching closing bracket textNode later in node -> transform all betw into GroupNode with contents wrapped in its IC
  // 3. else only opening bracket in textnode (normal insertion behavior)

  if (isOpeningBracket(key)) {
    e.preventDefault();
    const style = getStyleFromSymbol(key);

    if (style) {
      return handleBracketInsert(state, style, "open");
    }
  }

  // Closing bracket:
  // 1. if matching opening bracket textNode earlier in node -> transform all betw into GroupNode with contents wrapped in its IC
  // 2. else only closing bracket in textNode (normal insertion behavior)

  if (isClosingBracket(key)) {
    e.preventDefault();
    const style = getStyleFromSymbol(key);

    // check if opening bracket textNode earlier in same contaienr
    // if so: make new groupnode (full)
    // else insert symbol

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
