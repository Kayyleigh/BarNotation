// utils/treeUtils.ts
import { type CommandInputNode, type InlineContainerNode, type MathNode, type MultiDigitNode, type RootWrapperNode, type StructureNode, type TextNode } from "../models/mathNodeTypes";
import { directionalChildOrder } from "./navigationUtils";

export type TreePath = {
  parent: MathNode;
  index: number;
  path: MathNode[];
};

export function findNodePath(
  root: MathNode,
  targetId: string,
  path: MathNode[] = []
): MathNode[] | null {
  if (root.id === targetId) {
    return [...path, root];
  }

  const children = getLogicalChildren(root);
  for (const child of children) {
    const result = findNodePath(child, targetId, [...path, root]);
    if (result) {
      return result;
    }
  }

  // Handle special cases with array children (like matrix rows)
  if (root.type === "matrix") {
    for (const row of root.rows) {
      for (const cell of row) {
        const result = findNodePath(cell, targetId, [...path, root]);
        if (result) {
          return result;
        }
      }
    }
  }

  // If not found in any child
  return null;
}

/**
 * Determines whether the target container is a descendant of the given parent container.
 * Returns true if they are identical or if the target is a nested child within the parent.
 */
export function isDescendantOrSelf(
  parentContainer: MathNode,
  targetContainerId: string
): boolean {
  if (parentContainer.id === targetContainerId) return true;

  const children = getLogicalChildren(parentContainer);
  for (const child of children) {
    if (isDescendantOrSelf(child, targetContainerId)) return true;
  }

  return false;
}

export function cloneTreeWithNewIds(node: MathNode): MathNode {
  const newId = crypto.randomUUID();
  const clone: any = { ...node, id: newId };

  const childKeys = directionalChildOrder[node.type] || [];

  for (const key of childKeys) {
    const child = (node as any)[key];
    if (child) {
      clone[key] = cloneTreeWithNewIds(child);
    }
  }

  // Handle child arrays (inline-container, multi-digit, command-input, etc.)
  if (node.type === "inline-container" || node.type === "multi-digit" || node.type === "command-input") {
    clone.children = node.children.map(cloneTreeWithNewIds);
  }

  // Handle matrix
  if (node.type === "matrix") {
    clone.rows = node.rows.map((row) => row.map(cloneTreeWithNewIds));
  }

  return clone as MathNode;
}

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
    case "styled":
      return [node.child];
    case "overunderset":
      return [node.base, node.content];
    case "decorated":
      return [node.base];
    case "fraction":
      return [node.numerator, node.denominator];
    case "nth-root":
      return [node.index, node.base];
    case "big-operator":
      return [node.lower, node.upper];
    case "childed":
      return [node.base, node.subLeft, node.supLeft, node.subRight, node.supRight];
    case "matrix":
      return node.rows.flat();
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

  if (node.type === "styled") {
    const newChild = updateNodeById(node.child, targetId, replacement)

    return {
      ...node,
      child: newChild
    }
  }

  if (node.type === "group") {
    const newChild = updateInlineContainerNodeById(node.child, targetId, replacement)
    return {
      ...node,
      child: newChild,
      bracketStyle: node.bracketStyle,
    }
  }

  if (node.type === "decorated") {
    const newChild = updateInlineContainerNodeById(node.base, targetId, replacement)
    return {
      ...node,
      base: newChild,
      decoration: node.decoration,
    }
  }

  if (node.type === "matrix") {
    const newRows = node.rows.map(row =>
      row.map(cell => updateInlineContainerNodeById(cell, targetId, replacement))
    );

    return {
      ...node,
      rows: newRows,
    };
  }

  if (Array.isArray(children) && children.length > 0) {
    const newChildren = children.map(child =>
      updateInlineContainerNodeById(child as InlineContainerNode, targetId, replacement)
    )

    if (node.type === "fraction") {
      return {
        ...node,
        numerator: newChildren[0],
        denominator: newChildren[1]
      }
    }
    if (node.type === "nth-root") {
      return {
        ...node,
        index: newChildren[0],
        base: newChildren[1]
      }
    }
    if (node.type === "big-operator") {
      return {
        ...node,
        upper: newChildren[1],
        lower: newChildren[0]
      }
    }
    if (node.type === "childed") {
      return {
        ...node,
        base: newChildren[0],
        subLeft: newChildren[1],
        supLeft: newChildren[2],
        subRight: newChildren[3],
        supRight: newChildren[4],
      }
    }
    if (node.type === "overunderset") {
      return {
        ...node,
        base: newChildren[0],
        content: newChildren[1]
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
): { container: InlineContainerNode | MultiDigitNode | CommandInputNode; indexInParent: number } | null { //TODO do not allow multidigit and commandinput here
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
  else if (root.type === 'decorated') {
    if (root.base.id === inlineContainerId) return { parent: root, key: "base" };
  }
  else if (root.type === 'overunderset') {
    if (root.base.id === inlineContainerId) return { parent: root, key: "base" };
    if (root.content.id === inlineContainerId) return { parent: root, key: "content" };
  }
  else if (root.type === 'matrix') {
    for (let rowIndex = 0; rowIndex < root.rows.length; rowIndex++) {
      const row = root.rows[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (cell.id === inlineContainerId) {
          return {
            parent: root,
            key: `rows[${rowIndex}][${colIndex}]`,
          };
        }
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
    case "styled":
      containers.push(...[node.child] as InlineContainerNode[]);
      break;
    case "overunderset":
      containers.push(
        ...(node.base.type === "inline-container" ? [node.base] : []),
        ...(node.content.type === "inline-container" ? [node.content] : []),
      );
      break;
    case "decorated":
      containers.push(...[node.base] as InlineContainerNode[]);
      break;
    case "childed":
      if (node.base.type === "inline-container") containers.push(node.base);
      for (const sub of ["subLeft", "subRight", "supLeft", "supRight"] as const) {
        const val = node[sub];
        if (val?.type === "inline-container") containers.push(val);
      }
      break;
    case "matrix":
      for (const row of node.rows) {
        containers.push(...row.filter(n => n.type === "inline-container") as InlineContainerNode[]);
      }
      break;
  }

  return containers;
}