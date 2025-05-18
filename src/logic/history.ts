import type { EditorState } from "./editor-state";

export type HistoryState = {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
};

export function applyTransformation(
  state: EditorState,
  transformFn: (state: EditorState) => EditorState
): EditorState {
  return transformFn(state);
}