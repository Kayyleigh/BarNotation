import type { EditorState } from "./editor-state";
import { findNodeById, findParentContainerAndIndex, findParentOfInlineContainer, isEmptyNode, updateNodeById } from "../utils/treeUtils";
import type {
  InlineContainerNode,
  MathNode,
  // MathNode,
  // FractionNode,
  // RootNode,
  // SubSuperscriptNode,
  // GroupNode,
} from "../models/types";

export const handleBackspace = (state: EditorState): EditorState => {
  const { cursor } = state;
  const container = findNodeById(state.rootNode, cursor.containerId);

  if (!container || container.type !== "inline-container") return state;

  // Case: deleting at beginning of an empty container
  if (cursor.index === 0 && container.children.length === 0) {
    const parentInfo = findParentOfInlineContainer(state.rootNode, container.id);
    if (!parentInfo) {
      console.log(`you do not have IC parent`)
      return state;
    }
    const { parent, key } = parentInfo;

    let replacementChildren: MathNode[] = [];

    switch (parent.type) {
      case "fraction": {
        const numerator = parent.numerator;
        const denominator = parent.denominator;

        if (key === "numerator" && denominator.type === "inline-container") {
          replacementChildren = denominator.children;
        } 
        else if (key === "denominator" && numerator.type === "inline-container") {
          replacementChildren = numerator.children;
        }
        break;
        // Add logic for root, subsup, etc.
      }
      case "group": {
        const child = parent.child
        replacementChildren = child.children
        break;
      }
      case "subsup": {
        const corners = [parent.subLeft, parent.supLeft, parent.subRight, parent.supRight];
        if (corners.every(corner => isEmptyNode(corner))) {
          replacementChildren = (parent.base as InlineContainerNode).children
        }
        break;
      }
      case "actsymb": {
        const corners = [parent.subLeft, parent.supLeft, parent.subRight, parent.supRight];
        if (corners.every(corner => isEmptyNode(corner))) {
          replacementChildren = (parent.base as InlineContainerNode).children
        }
        break;
      }
    }

    if (replacementChildren.length >= 0) {
      // Find grandparent inline-container to insert children into
      const grandParent = findParentContainerAndIndex(state.rootNode, parentInfo.parent.id);
      if (!grandParent || grandParent.container.type !== "inline-container") return state;
    
      const grandParentContainer = grandParent.container as InlineContainerNode;
      const indexInGrandParent = grandParentContainer.children.findIndex((c) => c.id === parent.id);
      if (indexInGrandParent === -1) return state;
    
      const newChildren = [
        ...grandParentContainer.children.slice(0, indexInGrandParent),
        ...replacementChildren,
        ...grandParentContainer.children.slice(indexInGrandParent + 1),
      ];
    
      const insertedCount = replacementChildren.length;
    
      // Decide cursor index: start or end of inserted
      const cursorIndex =
        key === "numerator"
          ? indexInGrandParent + 1 // end of numerator //TODO +0 if there is no empty Textnode at start of IC
          : indexInGrandParent + insertedCount; // start of denominator
    
      const updatedRoot = updateNodeById(state.rootNode, grandParentContainer.id, {
        ...grandParentContainer,
        children: newChildren,
      });
    
      return {
        rootNode: updatedRoot,
        cursor: {
          containerId: grandParentContainer.id,
          index: cursorIndex,
        },
      };
    }
    console.warn(`${replacementChildren}`)
    return state;
  }

  if (cursor.index === 0 && container.children.length > 0) {
    console.log(`Trying to backspace at start of non-empty ${container.type}. I have not decided yet how to handle that`)
    return state
  }

  // Standard deletion
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
};
