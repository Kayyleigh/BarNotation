// utils/treeUtils.ts
import type { MathNode } from "../models/types";

export type TreePath = {
  parent: MathNode;
  index: number;
  path: MathNode[];
};

export const findParentAndIndex = (
    root: MathNode,
    targetId: string
  ): TreePath | null => {
    const stack: { node: MathNode; parent: MathNode | null; path: MathNode[] }[] = [
      { node: root, parent: null, path: [root] },
    ];
  
    while (stack.length > 0) {
      const { node, parent, path } = stack.pop()!;
  
      const children = getLogicalChildren(node);
  
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id === targetId) {
          return { parent: node, index: i, path: [...path, child] };
        }
        stack.push({ node: child, parent: node, path: [...path, child] });
      }
    }
  
    return null;
  };

  export const findNextPositionUp = (root: MathNode, fromId: string): string | null => {
    const pos = findParentAndIndex(root, fromId);
    if (!pos || !pos.parent) return null;
  
    const parent = pos.parent;
    const siblings = getLogicalChildren(parent);
    const index = pos.index;
  
    if (index + 1 < siblings.length) {
      return siblings[index + 1].id; // Found a next sibling
    } else {
      return findNextPositionUp(root, parent.id); // Recurse upward
    }
  };


  export const getLogicalChildren = (node: MathNode): MathNode[] => {
    switch (node.type) {
      case "inline-container":
      case "group":
        return node.children;
      case "fraction":
        return [node.numerator, node.denominator];
      case "subsup":
        return [node.base, node.subLeft, node.supLeft, node.subRight, node.supRight]
        .filter((child): child is MathNode => child !== undefined);
      default:
        return [];
    }
  };