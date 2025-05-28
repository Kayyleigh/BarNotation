import type { InlineContainerNode, MathNode } from "../models/types";

export interface CursorPosition {
  containerId: string;
  index: number; // position *between* children
}

export const createInitialCursor = (root: MathNode): CursorPosition => {
  if (root.type !== "root-wrapper") throw new Error("Root must be root wrapper");
  return { containerId: root.child.id, index: 0 };
};

export const getNodeAtCursor = (
  container: InlineContainerNode,
  cursor: CursorPosition
): MathNode | null => {
  return container.children[cursor.index] ?? null;
};
