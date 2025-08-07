import type { EditorState } from "./editor-state";
import { findNodeById, findParentContainerAndIndex, findParentOfInlineContainer, getLogicalChildren, isEmptyNode, updateNodeById } from "../utils/treeUtils";
import {
  type InlineContainerNode,
  type MathNode,
} from "../models/mathNodeTypes";
import { handleArrowLeft } from "./navigation";

//BUG: when deleting subsup that has nonempty other corners, it still deletes whole thing

export const handleBackspace = (state: EditorState): EditorState => {
  const { cursor } = state;
  const container = findNodeById(state.rootNode, cursor.containerId);


  if (!container) return state;

  if (container.type === "command-input" || container.type === "multi-digit") {
    // console.log(`You are in ${container.type}`)

    // Case: At start of empty node
    if (cursor.index === 0 && container.children.every(isEmptyNode)) { //TODO now if not empty it will disappear cursor
      // We're at the start → remove the whole node
      const parentContainer = findParentContainerAndIndex(state.rootNode, container.id);
      if (!parentContainer || parentContainer.container.type !== "inline-container") return state;

      const parent = parentContainer.container;
      const indexInParent = parent.children.findIndex(c => c.id === container.id);
      if (indexInParent === -1) return state;

      const newChildren = [
        ...parent.children.slice(0, indexInParent),
        ...parent.children.slice(indexInParent + 1),
      ];

      const updatedRoot = updateNodeById(state.rootNode, parent.id, {
        ...parent,
        children: newChildren,
      });

      return {
        rootNode: updatedRoot,
        cursor: {
          containerId: parent.id,
          index: indexInParent, // Move cursor to the deleted container's position
        },
      };
    }

    if (cursor.index > 0) {
      // Delete last character in the custom container
      const childNodes = container.children;
      const updatedChildren = [...childNodes.slice(0, cursor.index - 1), ...childNodes.slice(cursor.index)];
      const updatedContainer = {
        ...container,
        children: updatedChildren,
      };

      const updatedRoot = updateNodeById(state.rootNode, container.id, updatedContainer);

      // console.log(`You are at ${cursor.index} in ${container.type} with ${nodeToMathText(container)}`)

      // If new index is last of text container, move to parent
      if (cursor.index === container.children.length) {
        const parentContainer = findParentContainerAndIndex(state.rootNode, container.id);

        if (!parentContainer) {
          console.warn(`${container.type} with ID ${container.id} has no parent container.`)
          return state;
        }

        return {
          rootNode: updatedRoot,
          cursor: {
            containerId: parentContainer.container.id,
            index: parentContainer.indexInParent + 1,
          },
        };
      }
      return {
        rootNode: updatedRoot,
        cursor: {
          containerId: container.id,
          index: cursor.index - 1,
        },
      };
    }
  }

  if (container.type !== "inline-container") return state;

  const prevNode = container.children[cursor.index - 1];

  if (prevNode && (prevNode.type === "command-input" || prevNode.type === "multi-digit")) {
    console.log(`Delling ${prevNode.children.map(child => child.content).join("")}`)
    return handleBackspace({
      rootNode: state.rootNode,
      cursor: {
        containerId: prevNode.id,
        index: prevNode.children.length,
      },
    });
  }

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
      case "accented": { //TODO remove
        const baseChild = parent.base;

        if (parent.accent.type === 'custom') {
          if (key === "accent.content" && baseChild.type === "inline-container") {
            replacementChildren = baseChild.children;
          }
        }
        break;
      }
      // case "decorated": {
      //   break;
      // }
      case "overunderset": {
        const baseChild = parent.base;

        if (key === "content" && baseChild.type === "inline-container") {
          replacementChildren = baseChild.children;
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
      case "big-operator": {
        //const lower = parent.lower;
        //const upper = parent.upper;
        return handleArrowLeft(state);

      }
      case "childed": {
        console.log(`I am in childed. I am at ${key}`)
        const child = parent[key as keyof typeof parent];
        const corners = [parent.subLeft, parent.supLeft, parent.subRight, parent.supRight];

        if (key === 'supLeft' && corners.every(corner => isEmptyNode(corner))) {
          console.log(`YOU SHOULD REVERT`)
          replacementChildren = (parent.base as InlineContainerNode).children
        }
        else if (key != 'supLeft' && isEmptyNode(child)) {
          return handleArrowLeft(state)
          //return state
        }
        break;
      }
      case "matrix": {
        const matrix = parent;
      
        // Try to extract row and column indices from the key
        const match = key.match(/^rows\[(\d+)\]\[(\d+)\]$/);
        if (!match) {
          console.warn("Could not parse matrix cell key:", key);
          return state;
        }
      
        const rowIndex = parseInt(match[1], 10);
        const colIndex = parseInt(match[2], 10);
        const cell = matrix.rows?.[rowIndex]?.[colIndex];
      
        if (!cell) {
          console.warn("Matrix cell not found at position:", key);
          return state;
        }
      
        const allCellsEmpty = matrix.rows.every(row =>
          row.every(isEmptyNode)
        );
      
        if (allCellsEmpty) {
          // Remove the matrix entirely
          replacementChildren = [];
          break;
        }
      
        const rowIsEmpty = matrix.rows[rowIndex].every(isEmptyNode);
        if (rowIsEmpty && matrix.rows.length > 1) {
          const newRows = [
            ...matrix.rows.slice(0, rowIndex),
            ...matrix.rows.slice(rowIndex + 1),
          ];
      
          const updatedMatrix = {
            ...matrix,
            rows: newRows,
          };
      
          const newRow = newRows[Math.max(0, rowIndex - 1)];
          const fallbackCol = Math.min(colIndex, newRow.length - 1);
          const fallbackCell = newRow[fallbackCol];
      
          const updatedRoot = updateNodeById(state.rootNode, matrix.id, updatedMatrix);
      
          return {
            rootNode: updatedRoot,
            cursor: {
              containerId: fallbackCell.id,
              index: fallbackCell.children.length, 
            },
          };
        }
      
        const columnIsEmpty = matrix.rows.every(row => isEmptyNode(row[colIndex]));
        if (columnIsEmpty && matrix.rows[0].length > 1) {
          const newRows = matrix.rows.map(row =>
            [...row.slice(0, colIndex), ...row.slice(colIndex + 1)]
          );
      
          const updatedMatrix = {
            ...matrix,
            rows: newRows,
          };
      
          const fallbackRow = newRows[rowIndex] ?? newRows[newRows.length - 1];
          const fallbackCol = Math.max(0, colIndex - 1);
          const fallbackCell = fallbackRow[fallbackCol];
      
          const updatedRoot = updateNodeById(state.rootNode, matrix.id, updatedMatrix);
      
          return {
            rootNode: updatedRoot,
            cursor: {
              containerId: fallbackCell.id,
              index: fallbackCell.children.length,
            },
          };
        }
      
        return handleArrowLeft(state);
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

  const currentToDelete = container.children[cursor.index - 1]

  if (currentToDelete.type === 'text') {
    // Either deal with this or make implicit group
  }

  console.log(`Deleting ${currentToDelete.type}`)
  //const order = directionalChildOrder[currentToDelete.type];
  //const childToDelete = currentToDelete[order[order.length - 1]]

  //console.log(`${childToDelete}`)
  if (currentToDelete.type !== "text"
    && currentToDelete.type !== "styled"
    && (currentToDelete.type !== "big-operator" || !isEmptyNode(currentToDelete.lower) || !isEmptyNode(currentToDelete.upper))) {
    const simulatePrevState = handleArrowLeft(state)

    const children = getLogicalChildren(currentToDelete)
    const lastChild = children[children.length - 1]

    console.log(lastChild?.type)

    //TODO: handle brackets (revert)

    return handleBackspace(simulatePrevState)
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

  const prevChild = container.children[cursor.index - 1]
  if (prevChild.type === 'text') {
    //TODO check if this is broken? It does not work after nav
    return {
      rootNode: updatedRoot,
      cursor: {
        containerId: container.id,
        index: cursor.index - 1,
      },
    };
  }

  return {
    rootNode: updatedRoot,
    cursor: {
      containerId: container.id,
      index: cursor.index - 1,
    },
  };
};
