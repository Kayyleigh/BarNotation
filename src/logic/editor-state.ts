import { type CursorPosition, createInitialCursor } from "./cursor";
import { type MathNode, type InlineContainerNode } from "../models/types";

export interface EditorState {
  rootNode: MathNode;
  cursor: CursorPosition;
}

export const createEditorState = (root: InlineContainerNode): EditorState => ({
  rootNode: root,
  cursor: createInitialCursor(root),
});

export const setCursor = (state: EditorState, newCursor: CursorPosition): EditorState => ({
  ...state,
  cursor: newCursor,
});
