import { type EditorState } from "./editor-state";
import { findNodeById, updateNodeById } from "../utils/treeUtils";
import { transformToFractionNode, transformtoOverUndersetNode } from "../models/transformations";
import { type BracketStyle } from "../utils/bracketUtils";
import { createChildedNode, createGroupNode, createInlineContainer, generateId } from "../models/nodeFactories";
import type { InlineContainerNode, MathNode, MatrixNode, OverUndersetVariant, TextNode } from "../models/mathNodeTypes";
import type { CornerPosition } from "../utils/subsupUtils";

function isOperatorNode(node: MathNode): boolean {
  return node.type === "text" && typeof (node as TextNode).content === "string" &&
    /^[+\-*/=<>^_]$/.test((node as TextNode).content.trim());
}

function findBaseRange(container: InlineContainerNode, idx: number): { start: number, end: number } {
  // end is exclusive (so slice end)
  const startIndex = idx - 1;
  if (startIndex < 0) return { start: idx - 1, end: idx }; 

  const lastNode = container.children[startIndex];
  if (lastNode.type === "group") {
    return { start: startIndex, end: idx };
  }

  // Otherwise walk backward until operator or beginning
  let scanIndex = startIndex;
  while (scanIndex > 0) {
    const prevNode = container.children[scanIndex - 1];
    if (isOperatorNode(prevNode)) break;
    scanIndex--;
  }

  return { start: scanIndex, end: idx };
}

function transformPreviousNode<T extends { id: string }>(
  state: EditorState,
  transformFn: (base: any) => T, //Unexpected any. Specify a different type.eslint@typescript-eslint/no-explicit-any
  getCursor: (newNode: T) => { containerId: string; index: number }
): EditorState {
  const container = findNodeById(state.rootNode, state.cursor.containerId);
  if (!container || container.type !== "inline-container") return state;

  const idx = state.cursor.index;
  if (idx === 0) return state;

  // Find the range for base nodes
  const { start, end } = findBaseRange(container, idx);
  const baseNodes = container.children.slice(start, end);

  // Wrap them into an inline container if multiple
  const base =
    baseNodes.length === 1 ? baseNodes[0] : createInlineContainer(baseNodes);

  const newNode = transformFn(base);

  const newChildren = [
    ...container.children.slice(0, start),
    newNode,
    ...container.children.slice(end),
  ];

  const updatedRoot = updateNodeById(state.rootNode, container.id, {
    ...container,
    children: newChildren,
  });

  return {
    rootNode: updatedRoot,
    cursor: getCursor(newNode),
  };
}

export function transformToFraction(state: EditorState): EditorState {
  return transformPreviousNode(
    state,
    (base) => transformToFractionNode(base),
    (frac) => ({ containerId: frac.denominator.id, index: 0 })
  );
}

export function transformToOverUnderset(
  state: EditorState,
  variant: OverUndersetVariant,
  position: "above" | "below"
): EditorState {
  return transformPreviousNode(
    state,
    (base) => transformtoOverUndersetNode(base, variant, position),
    (node) => ({ containerId: node.content.id, index: 0 })
  );
}

export function transformToChildedNode(
  state: EditorState,
  cornerPosition: CornerPosition,
  variant: "subsup" | "actsymb" = "subsup"
): EditorState {
  return transformPreviousNode(
    state,
    (base) => {
      const subsupBase = createInlineContainer([base]);
      return createChildedNode(subsupBase, variant);
    },
    (node) => ({ containerId: node[cornerPosition].id, index: 0 })
  );
}

export function transformToSubSupNode(
  state: EditorState,
  cornerPosition: CornerPosition,
): EditorState {
  return transformToChildedNode(state, cornerPosition, 'subsup')
}

export function transformToActsymbNode(
  state: EditorState,
  cornerPosition: CornerPosition,
): EditorState {
  return transformToChildedNode(state, cornerPosition, 'actsymb')
}

export function transformToGroupNode(
  state: EditorState,
  containerId: string,
  startIndex: number,
  endIndex: number,
  bracketStyle: BracketStyle,
  side: "open" | "close",
): EditorState {
  const container = findNodeById(state.rootNode, containerId) as InlineContainerNode | undefined;
  if (!container || container.type !== "inline-container") return state;

  const children = container.children;

  // Slice out the nodes between startIndex and endIndex
  const groupMembers = children.slice(startIndex + 1, endIndex);
  const groupChild = createInlineContainer(groupMembers)

  // Create the GroupNode with an inline container holding those children
  const groupNode = createGroupNode(groupChild, bracketStyle);

  // Rebuild the children, replacing the range with the new GroupNode
  const newChildren = [
    ...children.slice(0, startIndex),   // all nodes before the open bracket
    groupNode,                         // GroupNode replaces brackets + inner content
    ...children.slice(endIndex + 1),  // all nodes after the closing bracket
  ];

  const updatedRoot = updateNodeById(state.rootNode, container.id, {
    ...container,
    children: newChildren,
  });

  return {
    ...state,
    rootNode: updatedRoot,
    cursor: {
      containerId: (side === 'open') ? groupNode.child.id : container.id, // inline container inside the GroupNode
      index: (side === 'open') ? 0 : startIndex + 1, //TODO: ideally know if should jump to end for after close is made
    },
  };
}

function createEmptyMatrixCell(): InlineContainerNode {
  return {
    id: generateId(),
    type: "inline-container",
    children: [],
  };
}

export function insertMatrixRow(matrix: MatrixNode, rowIndex: number): MatrixNode {
  if (matrix.type !== "matrix") return matrix;

  const numCols = matrix.rows[0]?.length ?? 0;
  const newRow: InlineContainerNode[] = Array.from({ length: numCols }, () =>
    createEmptyMatrixCell()
  );

  const newRows = [
    ...matrix.rows.slice(0, rowIndex),
    newRow,
    ...matrix.rows.slice(rowIndex),
  ];

  return {
    ...matrix,
    rows: newRows,
  };
}

export function insertMatrixColumn(matrix: MatrixNode, colIndex: number): MatrixNode {
  if (matrix.type !== "matrix") return matrix;

  const newRows = matrix.rows.map((row) => {
    const newCell = createEmptyMatrixCell();
    return [
      ...row.slice(0, colIndex),
      newCell,
      ...row.slice(colIndex),
    ];
  });

  return {
    ...matrix,
    rows: newRows,
  };
}