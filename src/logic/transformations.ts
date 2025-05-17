import { type EditorState } from "./editor-state";
import { findNodeById, updateNodeById } from "../utils/treeUtils";
import { transformToFractionNode } from "../models/transformations";
import { getCloseSymbol, getOpenSymbol, type BracketStyle } from "../utils/bracketUtils";
import { createGroupNode, createInlineContainer } from "../models/nodeFactories";
import type { InlineContainerNode, TextNode } from "../models/types";

export function transformToFraction(state: EditorState): EditorState {
  const container = findNodeById(state.rootNode, state.cursor.containerId);
  console.log(container)
  if (!container || container.type !== "inline-container") return state;
  const idx = state.cursor.index;
  if (idx === 0) return state;

  const numerator = container.children[idx - 1]; //TODO or Group when that exists

  const fraction = transformToFractionNode(numerator);

  const newChildren = [
    ...container.children.slice(0, idx - 1),
    fraction,
    ...container.children.slice(idx),
  ];

  const updatedRoot = updateNodeById(state.rootNode, container.id, {
    ...container,
    children: newChildren,
  });

  return {
    rootNode: updatedRoot,
    cursor: {
      containerId: fraction.denominator.id,
      index: 0,
    },
  };
}

export function transformToGroupNode(
  state: EditorState,
  containerId: string,
  startIndex: number,
  endIndex: number,
  bracketStyle: BracketStyle,
): EditorState {
  const container = findNodeById(state.rootNode, containerId) as InlineContainerNode | undefined;
  if (!container || container.type !== "inline-container") return state;

  const children = container.children;

  // Slice out the nodes between startIndex and endIndex
  const groupMembers = children.slice(startIndex + 1, endIndex);

  // Create the GroupNode with an inline container holding those children
  const groupNode = createGroupNode(createInlineContainer(groupMembers), bracketStyle);

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
      containerId: groupNode.child.id, // inline container inside the GroupNode
      index: 0,
    },
  };
}