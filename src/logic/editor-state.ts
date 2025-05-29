import { type CursorPosition, createInitialCursor } from "./cursor";
import { type MathNode, type RootWrapperNode } from "../models/types";

export interface EditorState {
  rootNode: MathNode;
  cursor: CursorPosition;
  hoveredNodeId?: string; // optional: null = nothing hovered
}

export const createEditorState = (root: RootWrapperNode): EditorState => ({
  rootNode: root,
  cursor: createInitialCursor(root),
});

export const setCursor = (state: EditorState, newCursor: CursorPosition): EditorState => ({
  ...state,
  cursor: newCursor,
});

export const setHoveredNode = (state: EditorState, hoveredNodeId?: string): EditorState => ({
  ...state,
  hoveredNodeId,
});

