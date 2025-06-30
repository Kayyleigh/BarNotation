import { type CursorPosition, createInitialCursor } from "./cursor";
import { type RootWrapperNode } from "../models/types";

export interface EditorState {
  rootNode: RootWrapperNode;
  cursor: CursorPosition;
}

export const createEditorState = (root: RootWrapperNode): EditorState => ({
  rootNode: root,
  cursor: createInitialCursor(root),
});

export const setCursor = (state: EditorState, newCursor: CursorPosition): EditorState => ({
  ...state,
  cursor: newCursor,
});
