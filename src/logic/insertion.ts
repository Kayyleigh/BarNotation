import type { EditorState } from "./editor-state";
import { createTextNode } from "../models/nodeFactories";
import { findNodeById, updateNodeById } from "../utils/treeUtils";
import { nodeToLatex } from "../models/latexParser";

export const handleCharacterInsert = (state: EditorState, char: string): EditorState => {
  const container = findNodeById(state.rootNode, state.cursor.containerId);
  console.log(container)
  if (!container || container.type !== "inline-container") return state;

  const newNode = createTextNode(char);
  const updatedChildren = [
    ...container.children.slice(0, state.cursor.index),
    newNode,
    ...container.children.slice(state.cursor.index),
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
