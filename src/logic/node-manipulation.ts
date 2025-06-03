import type { EditorState } from "./editor-state";
import type { MathNode } from "../models/types";
import { findNodeById, findParentContainerAndIndex, updateNodeById } from "../utils/treeUtils";
import { nodeToLatex } from "../models/nodeToLatex";

export function moveNodeByDrag(
  state: EditorState,
  draggedNodeId: string,
  targetContainerId: string,
  targetIndex: number
): EditorState {
  const draggedNode = findNodeById(state.rootNode, draggedNodeId);
  
  console.log(`${draggedNode} ? is dragged ??`)
  if (!draggedNode) return state;

  console.log(`YOu are dragging a ${draggedNode.type}`)

  // Remove node
  let newState = deleteNodeById(state, draggedNodeId);

  // Re-insert at target location
  newState = insertNodeAtIndex(newState, targetContainerId, targetIndex, draggedNode);

  return newState;
}

export function insertNodeAtIndex(
  state: EditorState,
  containerId: string,
  index: number,
  newNode: MathNode
): EditorState {
  const container = findNodeById(state.rootNode, containerId);

  if (!container || container.type !== "inline-container") return state;

  const newChildren = [...container.children];
  newChildren.splice(index, 0, newNode);

  const updatedContainer = { ...container, children: newChildren };
  const newRoot = updateNodeById(state.rootNode, container.id, updatedContainer);

  return {
    ...state,
    rootNode: newRoot,
    cursor: {
      containerId,
      index: index + 1, // optional: move cursor after drop
    },
  };
}

export function deleteNodeById(state: EditorState, nodeId: string): EditorState {
  const info = findParentContainerAndIndex(state.rootNode, nodeId);
  console.log(`Do we have a parent? ${info}`)
  if (!info) return state;

  console.log(`Deleting node ${(info.container.children.map(c=> nodeToLatex(c, false)).join(""))}`)
  const { container, indexInParent } = info;
  const newChildren = [...container.children];
  newChildren.splice(indexInParent, 1);

  const updatedContainer: MathNode = {
    ...container,
    children: newChildren,
  };

  const newRoot = updateNodeById(state.rootNode, container.id, updatedContainer);
  return {
    ...state,
    rootNode: newRoot,
  };
}

// Inserts the given node at the cursor position
export function insertNodeAtCursor(state: EditorState, newNode: MathNode): EditorState {
  const container = findNodeById(state.rootNode, state.cursor.containerId);
  console.log(`Inserting ${newNode.type} into ${container?.type}`);

  if (!container || container.type !== "inline-container") return state;

  let newIndex = state.cursor.index;
  let newRoot = state.rootNode;
  let newState = state;

  if (newNode.type === 'inline-container') {
    // Flatten: insert each child one by one
    for (const childNode of newNode.children) {
      newState = insertNodeAtCursor(newState, childNode);
    }
    // After inserting all children, return updated state
    return newState;
  } else {
    // Insert newNode at current cursor index
    const newChildren = [...container.children];
    newChildren.splice(newIndex, 0, newNode);

    const updatedContainer = { ...container, children: newChildren };
    newRoot = updateNodeById(state.rootNode, container.id, updatedContainer);

    // Update cursor index to be after the inserted node
    newIndex = newIndex + 1;
  }

  return {
    ...state,
    rootNode: newRoot,
    cursor: {
      containerId: container.id,
      index: newIndex,
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
