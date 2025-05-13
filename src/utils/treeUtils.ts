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
    console.log(`traversing: ${root.type} ${fromId}`)
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
        return [node.base, node.subLeft, node.supLeft, node.subRight, node.supRight];
      default:
        return [];
    }
  };

  export const getPreviousLeaf = (root: MathNode, currentId: string): MathNode | null => {
    const leaves = getLeafNodesInPreOrder(root);
    const index = leaves.findIndex(n => n.id === currentId);
    return index > 0 ? leaves[index - 1] : null;
  };

  const isLeaf = (node: MathNode): boolean => {
    return node.type === 'text' // For now, only text nodes are leaves. Dunno if will ever change but if so, do it here
  };

  export const getLeafNodesInPreOrder = (node: MathNode): MathNode[] => {
    const result: MathNode[] = [];
    
    // If this is a leaf, add it to the result
    if (isLeaf(node)) {
      result.push(node);
    }
  
    // Otherwise, recurse into the children (only if not a leaf)
    const children = getLogicalChildren(node);
    for (const child of children) {
      result.push(...getLeafNodesInPreOrder(child)); // Collect leaves recursively
    }
  
    return result;
  };

  export const getAllNodesInPreOrder = (node: MathNode): MathNode[] => {
    const result: MathNode[] = [];
    
    result.push(node); // Always add the current node to the result
    
    const children = getLogicalChildren(node);
    for (const child of children) {
      result.push(...getAllNodesInPreOrder(child)); // Collect all nodes recursively
    }
  
    return result;
  };

  export const isEmptyNode = (node: MathNode | null | undefined): boolean => {
    if (!node) return true;
  
    if (node.type === "text") {
      return node.content.trim() === "";
    }
  
    const children = getLogicalChildren(node);
    return children.every(isEmptyNode);
  };

  export const findPathToNode = (
    root: MathNode,
    targetId: string
  ): MathNode[] | null => {
    if (root.id === targetId) return [root];
  
    const children = getLogicalChildren(root);
    for (const child of children) {
      const path = findPathToNode(child, targetId);
      if (path) {
        return [root, ...path];
      }
    }
  
    return null;
  };