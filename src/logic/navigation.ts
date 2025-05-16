import { type EditorState } from "./editor-state";
import { findNodeById, findParentContainerAndIndex } from "../utils/treeUtils";
import type { InlineContainerNode } from "../models/types";

export function handleArrowLeft(state: EditorState): EditorState {
  const { cursor } = state;

  // Intra-container move
  if (cursor.index > 0) {
    return { ...state, cursor: { ...cursor, index: cursor.index - 1 } };
  }

  // Inter-container move: move to previous sibling's end
  const parentInfo = findParentContainerAndIndex(state.rootNode, cursor.containerId);
  if (!parentInfo) return state;

  const { container, indexInParent } = parentInfo;

  if (indexInParent > 0) {
    const prevSibling = container.children[indexInParent - 1];
    if (prevSibling.type === "inline-container") {
      return {
        ...state,
        cursor: {
          containerId: prevSibling.id,
          index: prevSibling.children.length
        }
      };
    }
  }

  return state;
}

export function handleArrowRight(state: EditorState): EditorState {
  const { cursor } = state;

  const container = findNodeById(state.rootNode, cursor.containerId) as InlineContainerNode;
  if (!container || !("children" in container)) return state;

  // Intra-container move
  if (cursor.index < container.children.length) {
    console.log(`You are inside it`)
    return { ...state, cursor: { ...cursor, index: cursor.index + 1 } };
  }

  // Inter-container move: move to next sibling's start
  const parentInfo = findParentContainerAndIndex(state.rootNode, cursor.containerId);
  if (!parentInfo) return state;

  const { container: parent, indexInParent } = parentInfo;

  if (indexInParent < parent.children.length - 1) {
    console.log(`crossing`)
    const nextSibling = parent.children[indexInParent + 1];
    if (nextSibling.type === "inline-container") {
      return {
        ...state,
        cursor: {
          containerId: nextSibling.id,
          index: 0
        }
      };
    }
  }

  return state;
}
