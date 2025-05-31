// utils/treeUtils.ts
import { type InlineContainerNode, type MathNode, type RootWrapperNode, type StructureNode, type TextNode } from "../models/types";

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
      case "root-wrapper":
        return [node.child];
      case "multi-digit":
        return node.children;
      case "command-input":
        return node.children;
      case "inline-container":
        return node.children;
      case "group":
        return [node.child];
      case "accented":
        return node.accent.type === "custom"
        ? [node.base, node.accent.content]
        : [node.base];      
      case "fraction":
        return [node.numerator, node.denominator];
      case "nth-root":
        return [node.index, node.base];
      case "big-operator":
        return [node.lower, node.upper];
      case "childed":
        return [node.base, node.subLeft, node.supLeft, node.subRight, node.supRight];
      case "styled":
        return [node.child];
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

    if (node.type === "multiline") {
      const children = getLogicalChildren(node)

      if (Array.isArray(children)) {
        const newChildren = children.map(child =>
          updateNodeById(child, targetId, replacement)
        );
    
        return {
          ...node,
          children: newChildren as RootWrapperNode[],
        };
      }
    } 
    else if (node.type === "root-wrapper") {
      const child = node.child

      const newChild = updateInlineContainerNodeById(child, targetId, replacement)

      return {
        ...node,
        child: newChild,
      };
    }
    else if (node.type === "styled") {
      const child = node.child

      const newChild = updateNodeById(child, targetId, replacement)

      return {
        ...node,
        child: newChild,
      };   

    }
    else if (node.type === "inline-container") {
      return updateInlineContainerNodeById(node, targetId, replacement)
    } 
    else {
      return updateStructureNodeById(node, targetId, replacement)
    } 

    return node; 
  }

  export function updateStructureNodeById(
    node: StructureNode,
    targetId: string,
    replacement: MathNode
  ): StructureNode {
    if (node.id === targetId) {
      return replacement as StructureNode;
    }

    const children = getLogicalChildren(node)

    if (node.type === "multi-digit") {
      const newChildren = children.map(child =>
        updateStructureNodeById(child as TextNode, targetId, replacement)
      );

      return {
        ...node,
        children: newChildren as TextNode[],
      };
    }
    if (node.type === "command-input") {
      const newChildren = children.map(child =>
        updateStructureNodeById(child as TextNode, targetId, replacement)
      );

      return {
        ...node,
        children: newChildren as TextNode[],
      };
    }

    if (node.type === 'styled') {
      const newChild = updateNodeById(node.child, targetId, replacement)

      return {
        ...node,
        child: newChild
      }
    }

    if (node.type === 'group') {
      const newChild = updateInlineContainerNodeById(node.child, targetId, replacement)
      return {
        ...node,
        child: newChild,
        bracketStyle: node.bracketStyle,
      }
    }

    if (node.type === 'accented' && node.accent.type === 'predefined') {
      const newChild = updateInlineContainerNodeById(node.base, targetId, replacement)
      return {
        ...node,
        base: newChild,
        accent: node.accent,
      }
    }
    if (Array.isArray(children) && children.length > 0) {
      const newChildren = children.map(child =>
        updateInlineContainerNodeById(child as InlineContainerNode, targetId, replacement)
      )

      if (node.type === 'fraction') {
        return {
          ...node,
          numerator: newChildren[0],
          denominator: newChildren[1]
        }
      }
      if (node.type === 'nth-root') {
        return {
          ...node,
          index: newChildren[0],
          base: newChildren[1]
        }
      }
      if (node.type === 'big-operator') {
        return {
          ...node,
          upper: newChildren[1],
          lower: newChildren[0]
        }
      }
      if (node.type === 'childed') {
        return {
          ...node,
          base: newChildren[0],
          subLeft: newChildren[1],
          supLeft: newChildren[2],
          subRight: newChildren[3],
          supRight: newChildren[4],
        }
      }
      if (node.type === 'accented' && node.accent.type === 'custom') {
        return {
          ...node,
          base: newChildren[0],
          accent: {
            type: 'custom',
            content: newChildren[1],
            position: node.accent.position
          }
        }
      }
      updateNodeById(node, targetId, replacement)
      console.warn(`${node.type} is missing a case in updateStructureNodeById (in treeUtils)`)
    };

    return node;
  }

  export function updateInlineContainerNodeById(
    node: InlineContainerNode,
    targetId: string,
    replacement: MathNode
  ): InlineContainerNode {
    if (node.id === targetId) {
      return replacement as InlineContainerNode;
    }

    const children = getLogicalChildren(node)
  
    if (Array.isArray(children)) {
      const newChildren = children.map(child =>
        updateStructureNodeById(child as StructureNode, targetId, replacement)
      );
  
      return {
        ...node,
        children: newChildren,
      };
    }

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

    if (root.type === 'text') {
      return null;
      //TODO: hope this doesnt fuck shit up; no idea what i am doing atm. But it kept having type=text in console
    }
    else if (root.type === 'fraction') {
      if (root.numerator.id === inlineContainerId) return { parent: root, key: "numerator" };
      if (root.denominator.id === inlineContainerId) return { parent: root, key: "denominator" };
    }
    else if (root.type === 'nth-root') {
      if (root.index.id === inlineContainerId) return { parent: root, key: "index" };
      if (root.base.id === inlineContainerId) return { parent: root, key: "base" };
    }
    else if (root.type === 'big-operator') {
      if (root.lower.id === inlineContainerId) return { parent: root, key: "lower" };
      if (root.upper.id === inlineContainerId) return { parent: root, key: "upper" };
    }
    else if (root.type === 'childed') {
      if (root.base.id === inlineContainerId) return { parent: root, key: "base" };
      if (root.subLeft.id === inlineContainerId) return { parent: root, key: "subLeft" };
      if (root.supLeft.id === inlineContainerId) return { parent: root, key: "supLeft" };
      if (root.subRight.id === inlineContainerId) return { parent: root, key: "subRight" };
      if (root.supRight.id === inlineContainerId) return { parent: root, key: "supRight" };
    }
    else if (root.type === 'group') {
      if (root.child.id === inlineContainerId) return { parent: root, key: "child" };
    }
    else if (root.type === 'styled') {
      if (root.child.id === inlineContainerId) return { parent: root, key: "child" };
    }
    else if (root.type === 'accented') {
      if (root.base.id === inlineContainerId) return { parent: root, key: "child" };

      if (root.accent.type === 'custom') {
        if (root.accent.content.id === inlineContainerId) {
          console.log(`Yes, ${root.accent.content}`)
          return { parent: root, key: "accent.content" };
        }
      }
    }
    else if (root.type !== 'inline-container') {
      console.warn(`${root.type} but no child matches the id`)
    }

    // Recurse into children
    const childNodes = getLogicalChildren(root);
    for (const child of childNodes) {
      // if (child.type === 'inline-container') {
      //   console.log(`child: inline container`)
      // }
      // else {
      //   console.log(`child: ${child.type}`)
      // }
      const result = findParentOfInlineContainer(child, inlineContainerId);
      if (result) return result;
    }
  
    return null;
  }
  
  // Optional helper to explore embedded container children
  function getChildContainers(node: MathNode): InlineContainerNode[] {
    const containers: InlineContainerNode[] = [];
  
    switch (node.type) {
      case "root-wrapper": 
        containers.push(...[node.child] as InlineContainerNode[]);
        break;
      case "fraction":
        containers.push(
          ...(node.numerator.type === "inline-container" ? [node.numerator] : []),
          ...(node.denominator.type === "inline-container" ? [node.denominator] : [])
        );
        break;
      case "nth-root":
        containers.push(
          ...(node.index.type === "inline-container" ? [node.index] : []),
          ...(node.base.type === "inline-container" ? [node.base] : [])
        );
        break;
      case "big-operator":
        containers.push(
          ...(node.lower.type === "inline-container" ? [node.lower] : []),
          ...(node.upper.type === "inline-container" ? [node.upper] : []),
        );
        break;
      case "group":
        containers.push(...[node.child] as InlineContainerNode[]);
        break;
      case "accented":
        containers.push(...[node.base] as InlineContainerNode[]);
        break;
      case "childed":
        if (node.base.type === "inline-container") containers.push(node.base);
        for (const sub of ["subLeft", "subRight", "supLeft", "supRight"] as const) {
          const val = node[sub];
          if (val?.type === "inline-container") containers.push(val);
        }
        break;
      case "vector":
        containers.push(...node.elements.filter(n => n.type === "inline-container") as InlineContainerNode[]);
        break;
      case "matrix":
        for (const row of node.rows) {
          containers.push(...row.filter(n => n.type === "inline-container") as InlineContainerNode[]);
        }
        break;
    }
  
    return containers;
  }