import type { EditorState } from "./editor-state";
import { createCommandInputNode, createMultiDigitNode, createTextNode } from "../models/nodeFactories";
import { findNodeById, updateNodeById } from "../utils/treeUtils";
import { specialSequences } from "../models/specialSequences";
import { type InlineContainerNode, type TextNode } from "../models/types";
import { getCloseSymbol, getOpenSymbol, type BracketStyle } from "../utils/bracketUtils";
import { transformToGroupNode } from "./transformations";

export const handleCharacterInsertInTextContainer = (state: EditorState, char: string): EditorState => {
  const container = findNodeById(state.rootNode, state.cursor.containerId);

  if (!container) return state;
  
  if (container.type === "multi-digit" || container.type === "command-input") {
    //TODO if command-input still check for sequence match, and transform if match found
    console.log(`trying to insert ${char} inside ${container.type}`)

    const children = container.children
    // Keep node, update content
    const newNode = createTextNode(char);
    const updatedChildren = [
      ...children.slice(0, state.cursor.index),
      newNode,
      ...children.slice(state.cursor.index),
    ];

    const updatedRoot = updateNodeById(state.rootNode, container.id, {
      ...container,
      children: updatedChildren,
    });

    return {
      rootNode: updatedRoot,
      cursor: {
        containerId: container.id,
        index: state.cursor.index + 1,
      },
    };
  }
  return state;
}

export const handleCharacterInsert = (state: EditorState, char: string): EditorState => {
  const container = findNodeById(state.rootNode, state.cursor.containerId);

  //TODO for text wrappers, make it not have a last position or sth. 
  // It currently feels unusable cuz it does not transform at end of seq bc u are nested
  // Cuz it wants you next to the node for seq check

  if (!container) return state;

  if (!container || container.type !== "inline-container") return handleCharacterInsertInTextContainer(state, char);

  const children = container.children;
  const index = state.cursor.index;
  const prevNode = children[index - 1];

  // ========== CASE 4-A: Append digit to MultiDigitNode ==========

  if (/\d/.test(char) && prevNode?.type === "multi-digit") {
    console.log(`Case 4-A reached with ${prevNode.children.map(child => child.content)}, with new ${char}`)
    const newTextNode = createTextNode(char);
    const updatedPrev = {
      ...prevNode,
      children: [...prevNode.children, newTextNode],
    };
  
    const updatedChildren = [
      ...children.slice(0, index - 1),
      updatedPrev,
      ...children.slice(index),
    ];
  
    const updatedRoot = updateNodeById(state.rootNode, container.id, {
      ...container,
      children: updatedChildren,
    });
  
    return {
      rootNode: updatedRoot,
      cursor: {
        containerId: container.id,
        index: index,
      },
    };
  }
  
  // ========== CASE 4-B: Append to CommandInputNode ==========

  if (prevNode?.type === "command-input") {
    console.log(`Case 4-B reached with ${prevNode.children.map(child => child.content)}, with new ${char}`)

    const oldSequence = prevNode.children.map(child => child.content).join("");

    // Prepare sequence for pattern matching
    const newSequence = oldSequence + char;
    
    //TODO auto completion logic?

    const match = specialSequences.find(seq => seq.sequence === newSequence);

    if (match) {
      const transformedNode = match.createNode();
      const updatedChildren = [
        ...children.slice(0, index - 1),
        transformedNode,
        ...children.slice(index),
      ];

      const updatedRoot = updateNodeById(state.rootNode, container.id, {
        ...container,
        children: updatedChildren,
      });

      let targetContainer = container
      let targetIndex = index

      if (transformedNode.type === 'nth-root') {
        targetContainer = transformedNode.base
        targetIndex = 0
      }

      if (transformedNode.type === 'accented') {
        targetContainer = transformedNode.base
        targetIndex = 0
      }

      if (transformedNode.type === 'styled') {
        console.log(transformedNode.child.type)

        if (transformedNode.child.type === 'inline-container') {
          targetContainer = transformedNode.child
          targetIndex = 0
        }
      } 

      return {
        rootNode: updatedRoot,
        cursor: {
          containerId: targetContainer.id,
          index: targetIndex,
        },
      };
    } 
    else if (oldSequence.endsWith(' ')) {
      // if last command ends with a space, force next node 

      const newNode = createTextNode(char)

      const updatedChildren = [
        ...children.slice(0, index - 1),
        prevNode,
        newNode,
        ...children.slice(index),
      ];

      const updatedRoot = updateNodeById(state.rootNode, container.id, {
        ...container,
        children: updatedChildren,
      });

      return {
        rootNode: updatedRoot,
        cursor: {
          containerId: container.id,
          index: index + 1,
        },
      };
    }
    else {
      // Keep node, update content
      const newTextNode = createTextNode(char);
      const updatedPrev = {
        ...prevNode,
        children: [...prevNode.children, newTextNode],
      };
  
      const updatedChildren = [
        ...children.slice(0, index - 1),
        updatedPrev,
        ...children.slice(index),
      ];
  
      const updatedRoot = updateNodeById(state.rootNode, container.id, {
        ...container,
        children: updatedChildren,
      });
  
      return {
        rootNode: updatedRoot,
        cursor: {
          containerId: container.id,
          index: index,
        },
      };
    }
  }

  // ========== CASE 4-C: New CommandInputNode if "\" ==========

  if (char === "\\") {
    console.log(`Case 4-C reached with new ${char}`)

    const newCommandNode = createCommandInputNode([createTextNode(char)])

    const updatedChildren = [
      ...children.slice(0, index),
      newCommandNode,
      ...children.slice(index),
    ];

    const updatedRoot = updateNodeById(state.rootNode, container.id, {
      ...container,
      children: updatedChildren,
    });

    return {
      rootNode: updatedRoot,
      cursor: {
        containerId: container.id,
        index: index + 1,
      },
    };
  }

  // ========== CASE 4-D: Merge 2 digits ==========

  if (/\d/.test(char) && prevNode?.type === "text" && /\d/.test(prevNode.content)) {
    console.log(`Case 4-D reached with new ${char}`)

    const newMultiDigitNode = createMultiDigitNode([prevNode, createTextNode(char)])

    const updatedChildren = [
      ...children.slice(0, index - 1),
      newMultiDigitNode,
      ...children.slice(index),
    ];

    const updatedRoot = updateNodeById(state.rootNode, container.id, {
      ...container,
      children: updatedChildren,
    });

    return {
      rootNode: updatedRoot,
      cursor: {
        containerId: container.id,
        index: index,
      },
    };
  }

  // ========== CASE 4-E: Fall back to normal insertion ==========

  else {
    const newNode = createTextNode(char);
    const updatedChildren = [
      ...children.slice(0, index),
      newNode,
      ...children.slice(index),
    ];

    const updatedRoot = updateNodeById(state.rootNode, container.id, {
      ...container,
      children: updatedChildren,
    });

    return {
      rootNode: updatedRoot,
      cursor: {
        containerId: container.id,
        index: state.cursor.index + 1,
      },
    };
  }

  // OLD CODE:

  // Case 1: Check for backslash-sequence
  if (prevNode?.type === "text" && prevNode.content.includes('\\')) {
  
    // Prepare potential updated node for pattern matching purposes
    const updatedPrev = { ...prevNode, content: prevNode.content + char };

    //TODO start of WIP new completion logic
    // Not yet implemented, needs to be properly planned first
    //TODO end of WIP new completion logic

    const match = specialSequences.find(seq => seq.sequence === updatedPrev.content);
    if (match) {
      const transformedNode = match.createNode();
      const updatedChildren = [
        ...children.slice(0, index - 1),
        transformedNode,
        ...children.slice(index),
      ];

      const updatedRoot = updateNodeById(state.rootNode, container.id, {
        ...container,
        children: updatedChildren,
      });

      let targetContainer = container
      let targetIndex = index

      if (transformedNode.type === 'accented') {
        targetContainer = transformedNode.base
        targetIndex = 0
      }

      if (transformedNode.type === 'styled') {
        console.log(transformedNode.child.type)

        if (transformedNode.child.type === 'inline-container') {
          targetContainer = transformedNode.child
          targetIndex = 0
        }
      } 

      return {
        rootNode: updatedRoot,
        cursor: {
          containerId: targetContainer.id,
          index: targetIndex, // transformed node takes place of old + current
        },
      };
    } 
    else if (prevNode.content.endsWith(' ')) {
      // if last command ends with a space, force next node 

      const newNode = createTextNode(char)

      const updatedChildren = [
        ...children.slice(0, index - 1),
        prevNode,
        newNode,
        ...children.slice(index),
      ];

      const updatedRoot = updateNodeById(state.rootNode, container.id, {
        ...container,
        children: updatedChildren,
      });

      return {
        rootNode: updatedRoot,
        cursor: {
          containerId: container.id,
          index: index + 1,
        },
      };
    }
    else {
      // Keep node, update content
      const updatedPrev = { ...prevNode, content: prevNode.content + char };
      const updatedChildren = [
        ...children.slice(0, index - 1),
        updatedPrev,
        ...children.slice(index),
      ];

      const updatedRoot = updateNodeById(state.rootNode, container.id, {
        ...container,
        children: updatedChildren,
      });

      return {
        rootNode: updatedRoot,
        cursor: {
          containerId: container.id,
          index,
        },
      };
    }
  }

  // Case 2: Append digit to previous digit node
  if (/\d/.test(char)) {
    if (prevNode?.type === "text" && /^\d+$/.test(prevNode.content)) {
      const updatedPrev = { ...prevNode, content: prevNode.content + char };
      const updatedChildren = [
        ...children.slice(0, index - 1),
        updatedPrev,
        ...children.slice(index),
      ];

      const updatedRoot = updateNodeById(state.rootNode, container.id, {
        ...container,
        children: updatedChildren,
      });

      return {
        rootNode: updatedRoot,
        cursor: {
          containerId: container.id,
          index,
        },
      };
    }
  }

  // Case 3: alpha-only characters (new text node)
  if (/[a-zA-Z]/.test(char)) {
    const newNode = createTextNode(char);
    const updatedChildren = [
      ...children.slice(0, index),
      newNode,
      ...children.slice(index),
    ];
    const updatedRoot = updateNodeById(state.rootNode, container.id, {
      ...container,
      children: updatedChildren,
    });

    return {
      rootNode: updatedRoot,
      cursor: {
        containerId: container.id,
        index: index + 1,
      },
    };
  }

  // Case 4: everything else — new node always
  const newNode = createTextNode(char);
  const updatedChildren = [
    ...children.slice(0, index),
    newNode,
    ...children.slice(index),
  ];

  const updatedRoot = updateNodeById(state.rootNode, container.id, {
    ...container,
    children: updatedChildren,
  });

  //console.log(`updated root to ${nodeToLatex(updatedRoot)}`)

  return {
    rootNode: updatedRoot,
    cursor: {
      containerId: container.id,
      index: state.cursor.index + 1,
    },
  };
}

export const handleBracketInsert = (
  state: EditorState,
  bracketStyle: BracketStyle,
  side: "open" | "close"
): EditorState => {
  const container = findNodeById(state.rootNode, state.cursor.containerId) as InlineContainerNode | undefined;
  if (!container || container.type !== "inline-container") return state;

  const openSymbol = getOpenSymbol(bracketStyle);
  const closeSymbol = getCloseSymbol(bracketStyle);

  if (!openSymbol) {
    console.warn(`${bracketStyle} has no known opening symbol.`)
    return state
  }
  if (!closeSymbol) {
    console.warn(`${bracketStyle} has no known closing symbol.`)
    return state
  }

  if (side === "open") {
    // Insert the open symbol normally first
    const updatedState = handleCharacterInsert(state, openSymbol);

    const updatedContainer = findNodeById(updatedState.rootNode, state.cursor.containerId) as InlineContainerNode | undefined;
    if (!updatedContainer) return updatedState;

    const updatedChildren = updatedContainer.children;
    const newCursorIndex = updatedState.cursor.index;


    // Find matching closing bracket after the new cursor position
    const closeIdx = updatedChildren.findIndex(
      (child, i) =>
        i > newCursorIndex - 1 &&
        child.type === "text" &&
        (child as TextNode).content === closeSymbol
    );

    if (closeIdx !== -1) {
      // Transform between open bracket position and close bracket position
      return transformToGroupNode(
        updatedState,
        updatedContainer.id,
        newCursorIndex - 1,
        closeIdx,
        bracketStyle,
        "open"
      );
    }
    else {
      console.log(`Maybe end of container`)
      //return handleBracketInsert(updatedState, bracketStyle, "close")
    }

    // Otherwise, just return updated state with inserted open bracket
    return updatedState;
  }

  if (side === "close") {
    // Insert the close symbol normally first
    const updatedState = handleCharacterInsert(state, closeSymbol);

    const updatedContainer = findNodeById(updatedState.rootNode, state.cursor.containerId) as InlineContainerNode | undefined;
    if (!updatedContainer) return updatedState;

    const updatedChildren = updatedContainer.children;
    const newCursorIndex = updatedState.cursor.index;

    // Find matching opening bracket before the new cursor position
    // Note: updated cursor index will have advanced by 1 after insertion
    const openIdx = updatedChildren
      .slice(0, newCursorIndex)
      .reverse()
      .findIndex(
        (child) =>
          child.type === "text" &&
          (child as TextNode).content === openSymbol
      );

    if (openIdx !== -1) {
      // Because we reversed, convert to original index:
      const matchOpenIdx = newCursorIndex - 1 - openIdx;

      // Transform between matching open and just inserted close bracket
      return transformToGroupNode(
        updatedState,
        updatedContainer.id,
        matchOpenIdx,
        newCursorIndex - 1,
        bracketStyle,
        "close"
      );
    }
    else console.log(`uhm?`)

    return updatedState;
  }

  return state;
};