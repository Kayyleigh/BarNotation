// utils/treeUtils.ts
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

  export const isEmptyNode = (node: MathNode | null | undefined): boolean => {
    if (!node) return true;
  
    if (node.type === "text") {
      return node.content.trim() === "";
    }
  
    const children = getLogicalChildren(node);
    return children.every(isEmptyNode);
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