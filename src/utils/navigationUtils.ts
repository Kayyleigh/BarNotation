import type { CursorPosition } from "../logic/cursor";
import type { MathNode } from "../models/types";

// Arrow navigable structure of compound nodes
export const directionalChildOrder: Record<
  string,
  string[] // ordered list of child keys
> = {
  "fraction": ["numerator", "denominator"],
  "nth-root": ["base", "index"], // if degree exists
  "childed": ["base", "subLeft", "supLeft", "subRight", "supRight"],
  "big-operator": ["operator", "lower", "upper"],
  "group": ["child"],
  "accented": ["base"],
  // inline-container is already sequential
};

export function flattenCursorPositions(node: MathNode): CursorPosition[] {
  const positions: CursorPosition[] = [];

  function visit(n: MathNode) {
    if (n.type === "inline-container") {
      // Start of this container
      positions.push({ containerId: n.id, index: 0 });

      n.children.forEach((child, i) => {
        // Visit children recursively
        visit(child);
        // Cursor between child i and i+1
        positions.push({ containerId: n.id, index: i + 1 });
      });
    } else {
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