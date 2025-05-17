import type { EditorState } from "./editor-state";
import { createTextNode } from "../models/nodeFactories";
import { findNodeById, updateNodeById } from "../utils/treeUtils";
import { nodeToLatex } from "../models/latexParser";
import { specialSequences } from "../models/specialSequences";
import type { TextNode } from "../models/types";

export const handleCharacterInsert = (state: EditorState, char: string): EditorState => {
  const container = findNodeById(state.rootNode, state.cursor.containerId);
  console.log(container)
  if (!container || container.type !== "inline-container") return state;

  const children = container.children;
  const index = state.cursor.index;
  const prevNode = children[index - 1] as TextNode;

  // Case 1: Check for backslash-sequence
  if (prevNode?.type === "text" && prevNode.content.includes('\\')) {
  
    // Prepare potential updated node for pattern matching purposes
    const updatedPrev = { ...prevNode, content: prevNode.content + char };

    const match = specialSequences.find(seq => seq.sequence === updatedPrev.content);
    if (match) {
      const transformedNode = match.mathNode;
      const updatedChildren = [
        ...children.slice(0, index - 1),
        transformedNode,
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
          index: index - 1 + 1, // transformed node takes place of old + current
        },
      };
    } 
    else {
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

  console.log(`updated root to ${nodeToLatex(updatedRoot)}`)

  return {
    rootNode: updatedRoot,
    cursor: {
      containerId: container.id,
      index: state.cursor.index + 1,
    },
  };
}
