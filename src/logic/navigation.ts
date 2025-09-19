import type { EditorState } from "./editor-state";
import { flattenCursorPositions, findCursorIndex } from "../utils/navigationUtils";
import type { MathNode, MatrixNode } from "../models/mathNodeTypes";
import { findNodePath } from "../utils/treeUtils";
//TODO: textnode nav? if prev is text then in_idx is its len. 

export function handleJumpLeft(state: EditorState): EditorState {
  const { cursor, rootNode } = state;
  const path = findNodePath(rootNode, cursor.containerId);
  if (!path) return state;

  if (cursor.index > 0) {
    // Normal jump left within container
    return { ...state, cursor: { containerId: cursor.containerId, index: cursor.index - 1 } };
  }

  // At start of container → fallback to handleArrowLeft (flattened/tree-aware)
  return handleArrowLeft(state);
}

export function handleJumpRight(state: EditorState): EditorState {
  const { cursor, rootNode } = state;
  const path = findNodePath(rootNode, cursor.containerId);
  if (!path) return state;

  const container = path[path.length - 1];
  const length = "children" in container ? container.children.length : 0;

  if (cursor.index < length) {
    // Normal jump right within container
    return { ...state, cursor: { containerId: cursor.containerId, index: cursor.index + 1 } };
  }

  // At end of container → fallback to handleArrowRight
  return handleArrowRight(state);
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
