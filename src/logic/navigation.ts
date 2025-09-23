import type { EditorState } from "./editor-state";
import { flattenCursorPositions, findCursorIndex } from "../utils/navigationUtils";
import type { InlineContainerNode, MathNode, MatrixNode, StructureNode } from "../models/mathNodeTypes";
import { findNodePath } from "../utils/treeUtils";
import type { CursorPosition } from "./cursor";
//TODO: textnode nav? if prev is text then in_idx is its len. 

/**
 * Find the index of a child `struc` inside an inline container `ic`.
 * Complexity: O(n) in the size of the grandparent’s children.
 */
function findIndexInIC(ic: InlineContainerNode, struc: StructureNode): number {
  return ic.children.findIndex(child => child.id === struc.id);
}

/**
 * Handle a "jump left" key action, which moves the cursor:
 * - one position left within the same container if possible
 * - otherwise, out of the current inline container into the parent context
 */
export function handleJumpLeft(state: EditorState): EditorState {
  const { cursor, rootNode } = state;

  const path = findNodePath(rootNode, cursor.containerId);
  if (!path) return state;

  // Case 1: Move left within the current container
  if (cursor.index > 0) {
    return {
      ...state,
      cursor: { containerId: cursor.containerId, index: cursor.index - 1 },
    };
  }

  // Case 2: At start of container -> may need to jump out
  if (path.length < 3) {
    // not deep enough -> fallback to default arrow behavior
    return handleArrowLeft(state);
  }

  const parent = path[path.length - 2] as StructureNode;
  const grandparent = path[path.length - 3] as InlineContainerNode;

  if (grandparent.type !== "inline-container") {
    return handleArrowLeft(state);
  }

  const parentIndex = findIndexInIC(grandparent, parent);
  if (parentIndex < 0) {
    // cannot jump further left -> fallback
    return handleArrowLeft(state);
  }

  const jumpOutCursor: CursorPosition = {
    containerId: grandparent.id,
    index: parentIndex,
  };

  return { ...state, cursor: jumpOutCursor };
}

/**
 * Handle a "jump right" key action, which moves the cursor:
 * - one position right within the same container if possible
 * - otherwise, out of the current inline container into the parent context
 */
export function handleJumpRight(state: EditorState): EditorState {
  const { cursor, rootNode } = state;

  const path = findNodePath(rootNode, cursor.containerId);
  if (!path) return state;

  const container = path[path.length - 1];
  const length = "children" in container ? container.children.length : 0;

  // Case 1: Move right within the current container
  if (cursor.index < length) {
    return {
      ...state,
      cursor: { containerId: cursor.containerId, index: cursor.index + 1 },
    };
  }

  // Case 2: At end of container -> may need to jump out
  if (path.length < 3) {
    return handleArrowRight(state);
  }

  const parent = path[path.length - 2] as StructureNode;
  const grandparent = path[path.length - 3] as InlineContainerNode;

  if (grandparent.type !== "inline-container") {
    return handleArrowRight(state);
  }

  const parentIndex = findIndexInIC(grandparent, parent);
  if (parentIndex < 0) {
    return handleArrowRight(state);
  }

  const jumpOutCursor: CursorPosition = {
    containerId: grandparent.id,
    index: parentIndex + 1, // <-- difference: land *after* the parent
  };

  return { ...state, cursor: jumpOutCursor };
}

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

export function handleArrowUp(state: EditorState): EditorState {
  // Custom logic to move cursor up in matrix
  // You'll need to find current row/col, and move to the same col in the row above
  return tryMoveMatrixVertical(state, -1);
}

export function handleArrowDown(state: EditorState): EditorState {
  return tryMoveMatrixVertical(state, +1);
}

function tryMoveMatrixVertical(state: EditorState, direction: -1 | 1): EditorState {
  const { cursor, rootNode } = state;
  const path = findNodePath(rootNode, cursor.containerId);

  if (!path) return state;

  const matrixNode = path.find((n: MathNode) => n.type === "matrix");

  if (!matrixNode) return state;

  const matrix = matrixNode as MatrixNode;
  const containerId = cursor.containerId;

  let rowIndex = -1;
  let colIndex = -1;

  for (let r = 0; r < matrix.rows.length; r++) {
    for (let c = 0; c < matrix.rows[r].length; c++) {
      if (matrix.rows[r][c].id === containerId) {
        rowIndex = r;
        colIndex = c;
        break;
      }
    }
    if (rowIndex !== -1) break;
  }

  const targetRow = rowIndex + direction;

  if (
    targetRow >= 0 &&
    targetRow < matrix.rows.length &&
    colIndex < matrix.rows[targetRow].length
  ) {
    const targetCell = matrix.rows[targetRow][colIndex];
    return {
      ...state,
      cursor: { containerId: targetCell.id, index: 0 },
    };
  }

  return state;
}
