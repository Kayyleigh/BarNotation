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

//BUG: when deleting subsup that has nonempty other corners, it still deletes whole thing

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
      case "accented": {
        const baseChild = parent.base;

        if (parent.accent.type === 'custom') {
          if (key === "accent.content" && baseChild.type === "inline-container") {
            replacementChildren = baseChild.children;
          } 
        }
        break;
      }
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
      }
      case "group": {
        const child = parent.child
        replacementChildren = child.children
        break;
      }
      case "childed": {
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
    //TODO maybe here deal with:
    // 1. revert group on deletion of either side bracket 
    // 2. mutate textnode when content size >1 (does not solve the cursor issue for numbers, but good for easy coming brack from errors in typing specialseq)
    return state;
  }

  if (cursor.index === 0 && container.children.length > 0) {
    console.log(`Trying to backspace at start of non-empty ${container.type}. I have not decided yet how to handle that`)
    return state
  }

  const currentToDelete = container.children[cursor.index - 1]
  if (currentToDelete.type === 'text') {
    console.log(currentToDelete)
    // Either deal with this or make implicit group
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
