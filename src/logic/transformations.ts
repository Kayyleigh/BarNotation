import { type EditorState } from "./editor-state";
import { findNodeById, updateNodeById } from "../utils/treeUtils";
import { transformToFractionNode } from "../models/transformations";

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

  console.log(fraction.denominator.type)

  return {
    rootNode: updatedRoot,
    cursor: {
      containerId: fraction.denominator.id,
      index: 0,
    },
  };
}
