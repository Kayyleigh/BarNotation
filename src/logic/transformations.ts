import { type EditorState } from "./editor-state";
import { findNodeById, updateNodeById } from "../utils/treeUtils";
import { transformToCustomAccentNode, transformToFractionNode } from "../models/transformations";
import { type BracketStyle } from "../utils/bracketUtils";
import { createChildedNode, createGroupNode, createInlineContainer } from "../models/nodeFactories";
import type { InlineContainerNode } from "../models/types";
import type { CornerPosition } from "../utils/subsupUtils";

export function transformToFraction(state: EditorState): EditorState {
  const container = findNodeById(state.rootNode, state.cursor.containerId);
  if (!container || container.type !== "inline-container") return state;
  const idx = state.cursor.index;
  if (idx === 0) return state;

  const numerator = container.children[idx - 1];

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

export function transformToCustomAccent(
  state: EditorState,
  position: "above" | "below"
): EditorState {
  const container = findNodeById(state.rootNode, state.cursor.containerId);
  if (!container || container.type !== "inline-container") return state;
  const idx = state.cursor.index;
  if (idx === 0) return state;

  const base = container.children[idx - 1]; 

  const accentedNode = transformToCustomAccentNode(base, position)
  
  const newChildren = [
    ...container.children.slice(0, idx - 1),
    accentedNode,
    ...container.children.slice(idx),
  ];

  const updatedRoot = updateNodeById(state.rootNode, container.id, {
    ...container,
    children: newChildren,
  });

  return {
    rootNode: updatedRoot,
    cursor: {
      containerId: accentedNode.accent.content.id,
      index: 0,
    },
  };
}

export function transformToChildedNode(
  state: EditorState,
  cornerPosition: CornerPosition,
  variant: "subsup" | "actsymb" = "subsup"
): EditorState {
  const container = findNodeById(state.rootNode, state.cursor.containerId);
  if (!container || container.type !== "inline-container") return state;
  const idx = state.cursor.index;
  if (idx === 0) return state;

  const base = container.children[idx - 1]; 
  const subsupBase = createInlineContainer([base])
  const subsupNode = createChildedNode(subsupBase, variant);

  const newChildren = [
    ...container.children.slice(0, idx - 1),
    subsupNode,
    ...container.children.slice(idx),
  ];

  const updatedRoot = updateNodeById(state.rootNode, container.id, {
    ...container,
    children: newChildren,
  });

  return {
    rootNode: updatedRoot,
    cursor: {
      containerId: subsupNode[cornerPosition].id,
      index: 0,
    },
  };
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
      containerId: groupNode.child.id, // inline container inside the GroupNode
      index: 0, //TODO: ideally know if should jump to end for after close is made
    },
  };
}