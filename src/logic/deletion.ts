import type { EditorState } from "./editor-state";
import { findNodeById, updateNodeById } from "../utils/treeUtils";

export function handleBackspace(state: EditorState): EditorState {
  const { cursor } = state;
  console.log(state)
  const container = findNodeById(state.rootNode, cursor.containerId);
  if (!container || container.type !== "inline-container") return state;

  if (cursor.index === 0) {
    // TODO: Backspace at start of container — navigate or merge
    return state;
  }

  const updatedChildren = [
    ...container.children.slice(0, cursor.index - 1),
    ...container.children.slice(cursor.index),
  ];

  const updatedRoot = updateNodeById(state.rootNode, container.id, {
    ...container,
    children: updatedChildren,
  });

  return {
    rootNode: updatedRoot,
    cursor: {
      containerId: container.id,
      index: cursor.index - 1,
    },
  };
}
