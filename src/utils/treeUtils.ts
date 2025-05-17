// utils/treeUtils.ts
import { nodeToLatex } from "../models/latexParser";
import { type InlineContainerNode, type MathNode } from "../models/types";

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
      case "decorated":
        return [node.child];
      case "fraction":
        return [node.numerator, node.denominator];
      case "subsup":
        return [node.base, node.subLeft, node.supLeft, node.subRight, node.supRight];
      case "actsymb":
        return [node.base, node.subLeft, node.supLeft, node.subRight, node.supRight];
      default:
        return [];
    }
  };

  export const getChildKeys = (node: MathNode): string[] => {
    switch (node.type) {
      case "fraction":
        return ["numerator", "denominator"];
      case "root":
        return ["base", "index"];
      case "subsup":
        return ["base", "subLeft", "supLeft", "subRight", "supRight"];
      case "actsymb":
        return ["base", "subLeft", "supLeft", "subRight", "supRight"];
      case "big-operator":
        return ["body", "subscript", "superscript"];
      case "decorated":
        return ["child"];
      case "group":
        return ["child"];
      case "matrix":
        return ["rows"];
      case "vector":
        return ["elements"];
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
      return replacement;
    }

    const children = getLogicalChildren(node)

    if (node.type === 'group') {
      const newChild = updateNodeById(node.child, targetId, replacement)
      return {
        ...node,
        child: newChild as InlineContainerNode,
        bracketStyle: node.bracketStyle,
      }
    }

    if (node.type === 'decorated') {
      const newChild = updateNodeById(node.child, targetId, replacement)
      return {
        ...node,
        child: newChild as InlineContainerNode,
        decoration: node.decoration,
      }
    }
  
    if (node.type === 'inline-container' && Array.isArray(children)) {
      const newChildren = children.map(child =>
        updateNodeById(child, targetId, replacement)
      );
  
      return {
        ...node,
        children: newChildren,
      };
    }
    else if (Array.isArray(children) && children.length > 0) {
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
      if (node.type === 'subsup') {
        return {
          ...node,
          base: newChildren[0],
          subLeft: newChildren[1],
          supLeft: newChildren[2],
          subRight: newChildren[3],
          supRight: newChildren[4],
        }
      }
      if (node.type === 'actsymb') {
        return {
          ...node,
          base: newChildren[0],
          subLeft: newChildren[1],
          supLeft: newChildren[2],
          subRight: newChildren[3],
          supRight: newChildren[4],
        }
      }

      console.warn(`${node.type} is missing a case in updateNodeById (in treeUtils)`)
    };
    
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

  export function findParentOfInlineContainer(
    root: MathNode,
    inlineContainerId: string
  ): { parent: MathNode; key: string } | null {

    if (root.type === 'fraction') {
      if (root.numerator.id === inlineContainerId) return { parent: root, key: "numerator" };
      if (root.denominator.id === inlineContainerId) return { parent: root, key: "denominator" };
    }
    else if (root.type === 'subsup' || root.type === 'actsymb') {
      if (root.base.id === inlineContainerId) return { parent: root, key: "base" };
      if (root.subLeft.id === inlineContainerId) return { parent: root, key: "subleft" };
      if (root.supLeft.id === inlineContainerId) return { parent: root, key: "supleft" };
      if (root.subRight.id === inlineContainerId) return { parent: root, key: "subright" };
      if (root.supRight.id === inlineContainerId) return { parent: root, key: "supright" };
    }
    else if (root.type === 'group') {
      if (root.child.id === inlineContainerId) return { parent: root, key: "child" };
    }
    else if (root.type === 'decorated') {
      if (root.child.id === inlineContainerId) return { parent: root, key: "child" };
    }
    else {
      console.log(`${root.type} but no child matches the id`)
    }

    // Recurse into children
    const childNodes = getLogicalChildren(root);
    for (const child of childNodes) {
      if (child.type === 'inline-container') {
        console.log(`child: inline container`)
      }
      else {
        console.log(`child: ${child.type}`)
      }
      const result = findParentOfInlineContainer(child, inlineContainerId);
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
      case "decorated":
        containers.push(...[node.child] as InlineContainerNode[]);
        break;
      case "root":
        if (node.degree?.type === "inline-container") containers.push(node.degree);
        if (node.radicand.type === "inline-container") containers.push(node.radicand);
        break;
      case "subsup":
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

  /**
 * Recursively finds the parent MathNode and the key under which the target inline container is stored.
 */
export function findParentContainerAndKey(
  node: MathNode,
  targetId: string
): { parent: MathNode; key: string } | null {
  // Iterate through all keys of the node
  for (const [key, value] of Object.entries(node)) {
    if (!value) continue;

    // Handle single object child
    if (typeof value === "object" && "id" in value && "type" in value) {
      const child = value as MathNode;
      if (child.id === targetId) {
        return { parent: node, key };
      }

      const res = findParentContainerAndKey(child, targetId);
      if (res) return res;
    }

    // Handle array of child nodes
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object" && "id" in item && "type" in item) {
          const child = item as MathNode;
          if (child.id === targetId) {
            return { parent: node, key };
          }

          const res = findParentContainerAndKey(child, targetId);
          if (res) return res;
        }
      }
    }
  }

  return null;
}

/**
 * Finds the nearest InlineContainerNode that contains (possibly indirectly)
 * the node with `targetId`, and returns the child index of the top-level node
 * (e.g. FractionNode) inside that container.
 */
export function findEnclosingInlineContainerAndIndex(
  node: MathNode,
  targetId: string
): { container: InlineContainerNode; indexInParent: number } | null {
  if (node.type === "inline-container") {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];

      if (containsNodeWithId(child, targetId)) {
        return { container: node, indexInParent: i };
      }
    }

    // Recurse into children
    for (const child of node.children) {
      const res = findEnclosingInlineContainerAndIndex(child, targetId);
      if (res) return res;
    }
  } else {
    // Recurse into all node fields
    const containerFields = Object.values(node);
    for (const field of containerFields) {
      if (Array.isArray(field)) {
        for (const item of field) {
          if (item && typeof item === "object" && "type" in item) {
            const res = findEnclosingInlineContainerAndIndex(item as MathNode, targetId);
            if (res) return res;
          }
        }
      } else if (field && typeof field === "object" && "type" in field) {
        const res = findEnclosingInlineContainerAndIndex(field as MathNode, targetId);
        if (res) return res;
      }
    }
  }

  return null;
}

/**
 * Returns true if the subtree rooted at `node` contains a node with `id === targetId`
 */
function containsNodeWithId(node: MathNode, targetId: string): boolean {
  if (node.id === targetId) return true;

  const values = Object.values(node);
  for (const val of values) {
    if (Array.isArray(val)) {
      for (const child of val) {
        if (child && typeof child === "object" && "id" in child) {
          if (containsNodeWithId(child as MathNode, targetId)) return true;
        }
      }
    } else if (val && typeof val === "object" && "id" in val) {
      if (containsNodeWithId(val as MathNode, targetId)) return true;
    }
  }

  return false;
}