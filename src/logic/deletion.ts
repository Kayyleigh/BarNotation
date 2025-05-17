import type { EditorState } from "./editor-state";
import type { CursorPosition } from "./cursor";
import { findNodeById, findParentContainerAndIndex, findParentOfInlineContainer, updateNodeById } from "../utils/treeUtils";
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
    if (!parentInfo) return state;

    const { parent, key } = parentInfo;

    let replacementChildren: MathNode[] = [];
    let newCursor: CursorPosition | null = null;

    switch (parent.type) {
      case "fraction": {
        const numerator = parent.numerator;
        const denominator = parent.denominator;

        if (key === "numerator" && denominator.type === "inline-container") {
          replacementChildren = denominator.children;
          newCursor = {
            containerId: parent.id, // we'll fix this shortly
            index: 0,
          };
        } else if (key === "denominator" && numerator.type === "inline-container") {
          replacementChildren = numerator.children;
          newCursor = {
            containerId: parent.id, // will be adjusted
            index: numerator.children.length,
          };
        }
        break;
        // Add logic for root, subsup, etc.
      }
    }

    if (replacementChildren.length > 0 && newCursor) {
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

      const updatedRoot = updateNodeById(state.rootNode, grandParentContainer.id, {
        ...grandParentContainer,
        children: newChildren,
      });

      // Fix container ID to the flattened grandparent container
      return {
        rootNode: updatedRoot,
        cursor: newCursor,
      };
    }

    return state;
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
