import type { MatrixNode } from "../models/mathNodeTypes";
import { findParentOfInlineContainer, updateNodeById } from "../utils/treeUtils";
import type { EditorState } from "./editor-state";
import { insertMatrixColumn, insertMatrixRow } from "./transformations";

export function handleCtrlArrow(
    state: EditorState,
    direction: "up" | "down" | "left" | "right"
  ): EditorState {
    const { cursor } = state;
    const parentInfo = findParentOfInlineContainer(state.rootNode, cursor.containerId);
  
    if (!parentInfo || parentInfo.parent.type !== "matrix") return state;
  
    const key = parentInfo.key;
    const matrix = parentInfo.parent;
    const match = key.match(/^rows\[(\d+)\]\[(\d+)\]$/);
    if (!match) return state;
  
    const rowIndex = parseInt(match[1], 10);
    const colIndex = parseInt(match[2], 10);
  
    let updatedMatrix: MatrixNode;
    let newContainerId: string;
  
    switch (direction) {
      case "down":
        updatedMatrix = insertMatrixRow(matrix, rowIndex + 1);
        newContainerId = updatedMatrix.rows[rowIndex + 1][colIndex].id;
        break;
      case "up":
        updatedMatrix = insertMatrixRow(matrix, rowIndex);
        newContainerId = updatedMatrix.rows[rowIndex][colIndex].id;
        break;
      case "right":
        updatedMatrix = insertMatrixColumn(matrix, colIndex + 1);
        newContainerId = updatedMatrix.rows[rowIndex][colIndex + 1].id;
        break;
      case "left":
        updatedMatrix = insertMatrixColumn(matrix, colIndex);
        newContainerId = updatedMatrix.rows[rowIndex][colIndex].id;
        break;
      default:
        return state;
    }
  
    const updatedRoot = updateNodeById(state.rootNode, matrix.id, updatedMatrix);
  
    return {
      rootNode: updatedRoot,
      cursor: {
        containerId: newContainerId,
        index: 0,
      },
    };
  }
  