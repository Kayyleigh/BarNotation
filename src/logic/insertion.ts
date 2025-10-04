import type { EditorState } from "./editor-state";
import { createCommandInputNode, createMultiDigitNode, createTextNode } from "../models/nodeFactories";
import { cloneTreeWithNewIds, findNodeById, findParentContainerAndIndex, updateNodeById } from "../utils/treeUtils";
import { specialSequences } from "../models/specialSequences";
import { MultiDigitNode, type InlineContainerNode, type MathNode, type TextNode } from "../models/mathNodeTypes";
import { getCloseSymbol, getOpenSymbol, getStyleFromSymbol, isClosingBracket, isOpeningBracket, type BracketStyle } from "../utils/bracketUtils";
import { transformToGroupNode } from "./transformations";
import type { LibraryEntry } from "../models/libraryTypes";

export const handleCharacterInsertInTextContainer = (state: EditorState, char: string): EditorState => {
  const container = findNodeById(state.rootNode, state.cursor.containerId);

  if (!container) return state;

  if (container.type === "multi-digit" || container.type === "command-input") {
    //TODO if command-input still check for sequence match, and transform if match found
    // //console.log(`trying to insert ${char} inside ${container.type}`)

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

export const handleCharacterInsert = (
  state: EditorState,
  char: string,
  commandMap?: Record<string, LibraryEntry>,
): EditorState => {
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

  if ((/\d/.test(char) && prevNode?.type === "multi-digit")
    || (/[.,]/.test(char) && prevNode?.type === "multi-digit" && /\d/.test(prevNode.children[prevNode.children.length - 1].content))) {

    // //console.log(`Case 4-A reached with ${prevNode.children.map(child => child.content)}, with new ${char}`)
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

  //TODO maybe I should instead always have digit nodes and keep track of token types to make up valid vs invalid multi-digited numbers
  else if (prevNode?.type === "multi-digit" && /[.,]/.test(prevNode.children[prevNode.children.length - 1].content)) {
    // 1️⃣ Split off the last character
    const lastChild = prevNode.children[prevNode.children.length - 1];
    const remainingChildren = prevNode.children.slice(0, -1);

    const updatedPrevNode: MultiDigitNode = {
      ...prevNode,
      children: remainingChildren,
    };

    // 2️⃣ Create a new TextNode for the last char
    const newTextNode = createTextNode(lastChild.content);

    // 3️⃣ Replace prevNode in children with updatedPrevNode + newTextNode
    const updatedChildren = [
      ...children.slice(0, index - 1),
      updatedPrevNode,
      newTextNode,
      ...children.slice(index),
    ];

    const updatedRoot = updateNodeById(state.rootNode, container.id, {
      ...container,
      children: updatedChildren,
    });

    // 4️⃣ Simulate cursor right after the new TextNode
    const simulatedState: EditorState = {
      ...state,
      rootNode: updatedRoot,
      cursor: {
        containerId: container.id,
        index: index + 1,
      },
    };

    // 5️⃣ Call handleCharacterInsert recursively with the new char
    return handleCharacterInsert(simulatedState, char, commandMap);
  }


  // ========== CASE 4-B: Append to CommandInputNode ==========

  if (prevNode?.type === "command-input") {
    // //console.log(`Case 4-B reached with ${prevNode.children.map(child => child.content)}, with new ${char}`)

    const oldSequence = prevNode.children.map(child => child.content).join("");

    // Prepare sequence for pattern matching
    const newSequence = oldSequence + char;

    // 1. First check built-in sequences
    let match = specialSequences.find(seq => seq.sequence === newSequence);

    // 2. If no match, also check custom ones in commandMap
    if (!match && commandMap) {
      const customNode = commandMap[newSequence];
      if (customNode) {
        // Wrap in the same structure as a special sequence match
        match = {
          sequence: newSequence,
          createNode: () => cloneTreeWithNewIds(customNode.node),
        };
      }
    }

    if (match) {
      const transformedNode = match.createNode();

      let replacementChildren: MathNode[] = [];

      let targetContainer = container;
      let targetIndex = index;

      if (transformedNode.type === "inline-container") {
        // Flatten its children instead of inserting a nested inline-container
        replacementChildren = transformedNode.children;
        targetIndex += transformedNode.children.length - 1;
      } else {
        replacementChildren = [transformedNode];
      }

      // Handle special bracket cases (e.g., \lceil or \rceil)
      if (
        transformedNode.type === "text" &&
        (isOpeningBracket(transformedNode.content) || isClosingBracket(transformedNode.content))
      ) {
        const style = getStyleFromSymbol(transformedNode.content);
        const side = isOpeningBracket(transformedNode.content) ? "open" : "close";
        const safeStyle = style || "parentheses";

        const updatedChildren = [
          ...children.slice(0, index - 1), // remove the CommandInputNode
          ...children.slice(index),
        ];

        const updatedRoot = updateNodeById(state.rootNode, container.id, {
          ...container,
          children: updatedChildren,
        });

        return handleBracketInsert({ ...state, rootNode: updatedRoot }, safeStyle, side);
      }

      const updatedChildren = [
        ...children.slice(0, index - 1), // Remove the command input node
        ...replacementChildren,         // Insert flattened node(s)
        ...children.slice(index),
      ];

      const updatedRoot = updateNodeById(state.rootNode, container.id, {
        ...container,
        children: updatedChildren,
      });

      // Adjust cursor for specific complex node types
      if (transformedNode.type === "nth-root") {
        targetContainer = transformedNode.base;
        targetIndex = 0;
      }

      if (transformedNode.type === "decorated" || transformedNode.type === "overunderset") {
        targetContainer = transformedNode.base;
        targetIndex = 0;
      }

      if (transformedNode.type === "styled") {
        if (transformedNode.child.type === "inline-container") {
          if (transformedNode.child.children.length === 0) {
            targetContainer = transformedNode.child;
            targetIndex = 0;
          }
          else {
            targetContainer = container;
            targetIndex = index;
          }
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
    // //console.log(`Case 4-C reached with new ${char}`)

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

  // if (/\d/.test(char) && prevNode?.type === "text" && /\d/.test(prevNode.content)) {
  if (/[0-9.,]/.test(char) && prevNode?.type === "text" && /[0-9]/.test(prevNode.content)) {

    // //console.log(`Case 4-D reached with new ${char}`)

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
      // //console.log(`Maybe end of container`)
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
    // else //console.log(`uhm?`)

    return updatedState;
  }

  return state;
};

export function replaceCommandWithNode(
  state: EditorState,
  commandNodeId: string,
  replacementNode: MathNode
): EditorState {
  // Step 0: Find the command input node
  const commandNode = findNodeById(state.rootNode, commandNodeId);
  if (!commandNode || commandNode.type !== "command-input") return state;

  // Step 1: Find parent container and index of command node
  const parentInfo = findParentContainerAndIndex(state.rootNode, commandNodeId);
  if (!parentInfo || parentInfo.container.type !== "inline-container") return state;

  const { container } = parentInfo;
  const index = container.children.findIndex(child => child.id === commandNodeId);
  if (index === -1) return state;

  // Step 2: Handle special bracket input (e.g. \lceil, \rceil)
  if (
    replacementNode.type === "text" &&
    (isOpeningBracket(replacementNode.content) || isClosingBracket(replacementNode.content))
  ) {
    const style = getStyleFromSymbol(replacementNode.content) || "parentheses";
    const side = isOpeningBracket(replacementNode.content) ? "open" : "close";

    const updatedChildren = [
      ...container.children.slice(0, index),
      ...container.children.slice(index + 1), // Remove command node
    ];

    const updatedRoot = updateNodeById(state.rootNode, container.id, {
      ...container,
      children: updatedChildren,
    });

    return handleBracketInsert(
      {
        ...state,
        rootNode: updatedRoot,
      },
      style,
      side
    );
  }

  // Step 3: Replace the command node inline with the new node
  const replacementChildren =
    replacementNode.type === "inline-container"
      ? replacementNode.children
      : [replacementNode];

  const updatedChildren = [
    ...container.children.slice(0, index),
    ...replacementChildren,
    ...container.children.slice(index + 1),
  ];

  const updatedRoot = updateNodeById(state.rootNode, container.id, {
    ...container,
    children: updatedChildren,
  });

  // Step 4: Decide cursor target
  let targetContainerId = container.id;
  let targetIndex = index + 1;

  if (replacementNode.type === "inline-container") {
    targetIndex += replacementNode.children.length - 1;
  }

  if (replacementNode.type === "nth-root") {
    targetContainerId = replacementNode.base.id;
    targetIndex = 0;
  }

  // Ensure that cursor is placed into the "base" node position to comfortably continue typing
  if (replacementNode.type === "decorated") {
    targetContainerId = replacementNode.base.id;
    targetIndex = 0;
  }

  if (replacementNode.type === "overunderset") {
    targetContainerId = replacementNode.base.id;
    targetIndex = 0;
  }

  if (replacementNode.type === "styled") {
    if (replacementNode.child.type === "inline-container" && replacementNode.child.children.length === 0) {
      targetContainerId = replacementNode.child.id;
      targetIndex = 0;
    }
    else {
      targetContainerId = container.id;
      targetIndex = index + 1;
    }
  }

  return {
    rootNode: updatedRoot,
    cursor: {
      containerId: targetContainerId,
      index: targetIndex,
    },
  };
}
