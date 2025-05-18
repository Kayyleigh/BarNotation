import type { EditorState } from "./editor-state";
import type { MathNode } from "../models/types";
import { findNodeById, updateNodeById } from "../utils/treeUtils";

// Inserts the given node at the cursor position
export function insertNodeAtCursor(state: EditorState, newNode: MathNode): EditorState {
  const container = findNodeById(state.rootNode, state.cursor.containerId);

  if (!container || container.type !== "inline-container") return state;

  const newChildren = [...container.children];
  newChildren.splice(state.cursor.index, 0, newNode);

  const updatedContainer = { ...container, children: newChildren };
  const newRoot = updateNodeById(state.rootNode, container.id, updatedContainer);

  return {
    ...state,
    rootNode: newRoot,
    cursor: {
      containerId: container.id,
      index: state.cursor.index + 1,
    },
  };
}

// Deletes the currently selected node, assuming cursor is on it
export function deleteSelectedNode(state: EditorState): EditorState {
  const container = findNodeById(state.rootNode, state.cursor.containerId);

  if (!container || container.type !== "inline-container") return state;

  const newChildren = [...container.children];
  if (state.cursor.index === 0) return state;

  newChildren.splice(state.cursor.index - 1, 1);

  const updatedContainer = { ...container, children: newChildren };
  const newRoot = updateNodeById(state.rootNode, container.id, updatedContainer);

  return {
    ...state,
    rootNode: newRoot,
    cursor: {
      containerId: container.id,
      index: Math.max(0, state.cursor.index - 1),
    },
  };
}

// Optional: gets selected node for copy
export function getSelectedNode(state: EditorState): MathNode | null {
  const container = findNodeById(state.rootNode, state.cursor.containerId);

  if (!container || container.type !== "inline-container") return null;
  return container.children[state.cursor.index - 1] || null;
}
