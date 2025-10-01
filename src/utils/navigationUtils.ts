import type { CursorPosition } from "../logic/cursor";
import type { MathNode } from "../models/mathNodeTypes";

// Arrow navigable structure of compound nodes
export const directionalChildOrder: Record<
  string,
  string[] // ordered list of child keys
> = {
  "fraction": ["numerator", "denominator"],
  "nth-root": ["index", "base"],
  "childed": ["base", "supLeft", "subLeft", "supRight", "subRight"],
  "big-operator": ["lower", "upper"],
  "group": ["child"],
  "decorated": ["base"],
  "overunderset": ["base", "content"],
  "styled": ["child"],
  "matrix": [], // 2D traversal handled in `flattenCursorPositions`
  "root-wrapper": ["child"],
  // inline-container is already sequential
};

export function flattenCursorPositions(node: MathNode): CursorPosition[] {
  const positions: CursorPosition[] = [];

  function visit(n: MathNode) {
    if (n.type === "inline-container") {
      // Start of this container
      positions.push({ containerId: n.id, index: 0, });

      n.children.forEach((child, i) => {
        // Visit children recursively
        visit(child);
        // Cursor between child i and i+1
        positions.push({ containerId: n.id, index: i + 1 });
      });
    }
    else if (n.type === "multi-digit" || n.type === "command-input") {
      positions.push({ containerId: n.id, index: 0, });

      n.children.forEach((child, i) => {
        if (i < n.children.length - 1) {
          visit(child);
          // Cursor between child i and i+1
          positions.push({ containerId: n.id, index: i + 1 });
        }
      });
    }
    else if (n.type === "matrix") {    
      for (const row of n.rows) {
        for (const cell of row) {
          visit(cell);
        }
      }
    }
    else {
      // For compound nodes like fraction, root, etc.
      const order = directionalChildOrder[n.type];
      if (!order) return;

      for (const key of order) {
        const child = (n as any)[key];
        if (child && typeof child === "object") {
          visit(child);
        }
      }
    }
  }

  visit(node);
  return positions;
}

export function findCursorIndex(
  flatList: CursorPosition[],
  cursor: CursorPosition
): number {
  return flatList.findIndex(
    (p) => p.containerId === cursor.containerId && p.index === cursor.index
  );
}