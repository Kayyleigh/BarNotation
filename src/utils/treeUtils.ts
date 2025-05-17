// utils/treeUtils.ts
import { nodeToLatex } from "../models/latexParser";
import { nodeToString, type InlineContainerNode, type MathNode } from "../models/types";

export type TreePath = {
  parent: MathNode;
  index: number;
  path: MathNode[];
};

export const findNodeById = (node: MathNode, targetId: string): MathNode | null => {
    if (node.id === targetId) return node;
  
    const children = getLogicalChildren(node);
    for (const child of children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  
    return null;
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
        return node.children;
      case "group":
        return [node.child];
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

  export function updateNodeById(
    node: MathNode,
    targetId: string,
    replacement: MathNode
  ): MathNode {
    if (node.id === targetId) {
        console.log(`Yay, ${node.type} found match id ${targetId}`)
        console.log(`will replace ${nodeToString(node)} with ${nodeToString(replacement)}`)
        console.log(`returning ${nodeToLatex(replacement)}`)

      return replacement;
    }

    const children = getLogicalChildren(node)
  
    if (node.type === 'inline-container' && Array.isArray(children)) {
        console.log(`Yes, I am in if because I am a ${node.type} with children ${children}`)

      const newChildren = children.map(child =>
        updateNodeById(child, targetId, replacement)
      );
  
      return {
        ...node,
        children: newChildren,
      };
    }
    else if (Array.isArray(children) && children.length > 0) {
      console.log(`Yes, I am in elseif because I am a ${node.type} with children ${children}`)
      const newChildren = children.map(child =>
        updateNodeById(child, targetId, replacement)
      )

      if (node.type === 'fraction') {
        return {
          ...node,
          numerator: newChildren[0],
          denominator: newChildren[1]
        }
      }

      console.warn(`${node.type} is missing a case in updateNodeById (in treeUtils)`)
    };
  
    console.log(`returning ${nodeToLatex(node)}`)
    return node;
  }

  export function findParentContainerAndIndex(
    root: MathNode,
    childId: string
  ): { container: InlineContainerNode; indexInParent: number } | null {
    if (root.type === "inline-container") {
      for (let i = 0; i < root.children.length; i++) {
        const child = root.children[i];
        if (child.id === childId) {
          return { container: root, indexInParent: i };
        }
        const result = findParentContainerAndIndex(child, childId);
        if (result) return result;
      }
    }
  
    // For all other container nodes
    const containerChildren = getChildContainers(root);
    for (const container of containerChildren) {
      const result = findParentContainerAndIndex(container, childId);
      if (result) return result;
    }
  
    return null;
  }
  
  // Optional helper to explore embedded container children
  function getChildContainers(node: MathNode): InlineContainerNode[] {
    const containers: InlineContainerNode[] = [];
  
    switch (node.type) {
      case "fraction":
        containers.push(
          ...(node.numerator.type === "inline-container" ? [node.numerator] : []),
          ...(node.denominator.type === "inline-container" ? [node.denominator] : [])
        );
        break;
      case "group":
        containers.push(...[node.child] as InlineContainerNode[]);
        break;
      case "root":
        if (node.degree?.type === "inline-container") containers.push(node.degree);
        if (node.radicand.type === "inline-container") containers.push(node.radicand);
        break;
      case "subsuperscript":
        if (node.base.type === "inline-container") containers.push(node.base);
        for (const sub of ["subLeft", "subRight", "supLeft", "supRight"] as const) {
          const val = node[sub];
          if (val?.type === "inline-container") containers.push(val);
        }
        break;
      case "vector":
        containers.push(...node.items.filter(n => n.type === "inline-container") as InlineContainerNode[]);
        break;
      case "matrix":
        for (const row of node.rows) {
          containers.push(...row.filter(n => n.type === "inline-container") as InlineContainerNode[]);
        }
        break;
    }
  
    return containers;
  }