import type { InlineContainerNode, MathNode } from "../models/types";

export interface CursorPosition {
  containerId: string;
  index: number; // position *between* children
}

export const createInitialCursor = (root: MathNode): CursorPosition => {
  if (root.type !== "inline-container") throw new Error("Root must be container");
  return { containerId: root.id, index: 0 };
};

export const getNodeAtCursor = (
  container: InlineContainerNode,
  cursor: CursorPosition
): MathNode | null => {
  return container.children[cursor.index] ?? null;
};
