import type { EditorState } from "./editor-state";
import { handleArrowLeft, handleArrowRight } from "./navigation";
import { handleCharacterInsert } from "./insertion";
import { handleBackspace } from "./deletion";
import { transformToFraction } from "./transformations";

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

  // Character input: only printable characters
  if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    console.log(`you input ${key}`)
    return handleCharacterInsert(state, key);
  }

  return null; // Unhandled
}
