import type { EditorState } from "./editor-state";
import { flattenCursorPositions, findCursorIndex } from "../utils/navigationUtils";
//TODO: textnode nav? if prev is text then in_idx is its len. 
export function handleArrowLeft(state: EditorState): EditorState {
  const flat = flattenCursorPositions(state.rootNode);
  const i = findCursorIndex(flat, state.cursor);

  if (i > 0) {
    return { ...state, cursor: flat[i - 1] };
  }

  return state;
}

export function handleArrowRight(state: EditorState): EditorState {
  const flat = flattenCursorPositions(state.rootNode);
  const i = findCursorIndex(flat, state.cursor);

  if (i >= 0 && i < flat.length - 1) {
    return { ...state, cursor: flat[i + 1] };
  }

  return state;
}