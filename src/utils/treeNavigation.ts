import {
    MathNode,
    CharacterNode,
    MultiCharacterNode,
  } from "../math/types";
  
  import { findNodeById, findParentNode } from "../math/treeUtils";
  
  /**
   * Finds the path to the node with the given ID.
   * Returns an array of nodes from root to target.
   */
  export function findPathToNode(root: MathNode, targetId: string): MathNode[] | null {
    if (root.id === targetId) return [root];
  
    for (const child of root.children) {
      const path = findPathToNode(child, targetId);
      if (path) return [root, ...path];
    }
  
    return null;
  }
  
  /**
   * Checks if the node is the first child of its parent in the path.
   */
  export function isFirstChildInPath(path: MathNode[]): boolean {
    if (path.length < 2) return false;
    const parent = path[path.length - 2];
    const node = path[path.length - 1];
    return parent.children[0]?.id === node.id;
  }
  
  /**
   * Checks if the node is the last child of its parent in the path.
   */
  export function isLastChildInPath(path: MathNode[]): boolean {
    if (path.length < 2) return false;
    const parent = path[path.length - 2];
    const node = path[path.length - 1];
    const siblings = parent.children;
    return siblings[siblings.length - 1]?.id === node.id;
  }
  
  /**
   * Creates a deep clone of a node tree with the target replaced.
   */
  export function deepReplaceNode(
    root: MathNode,
    targetId: string,
    replacement: MathNode
  ): MathNode {
    if (root.id === targetId) return replacement;
  
    const clone = root.cloneWithChildren(root.children);
    clone.children = root.children.map(child =>
      deepReplaceNode(child, targetId, replacement)
    );
    return clone;
  }
  
  /**
   * Escapes the node one level up and inserts a sibling after (or before) it.
   * Use direction = "right" or "left".
   */
  export function escapeOneLevel(
    direction: "left" | "right", // "left" for first child, "right" for last child
    rootTree: MathNode,
    currentNodeId: string,
    updateTree: (newTree: MathNode) => void
  ) {
    const node = findNodeById(rootTree, currentNodeId);
  
    if (!node) {
      return;
    }
  
    // Find the parent node of the current node
    const parentNode = findParentNode(rootTree, currentNodeId);
  
    if (!parentNode) {
      return;
    }
  
    // Clone the node with its children
    //const clonedNode = node.cloneWithChildren(node.children);
  
    // Handle right arrow (moving out from the last child)
    if (direction === "right" && node === parentNode?.children[parentNode.children.length - 1]) {
      // Add a MultiCharacterNode or new node to the parent's next level
      const newNode = new CharacterNode(""); // Example, adjust accordingly
      parentNode?.children.push(newNode);
    } else {
        console.log(`Yess right on ${parentNode?.children}`)
        //TODO: jump to next child's first input
    }
  
    // Handle left arrow (moving out from the first child)
    if (direction === "left" && node === parentNode?.children[0]) {
      // Move out to the next higher level and update tree
      const newNode = new CharacterNode("");
      parentNode?.children.unshift(newNode);
    } else {
        console.log(`Yess left on ${parentNode?.children}`)
        //TODO: jump to prev child's last input
    }
  
    // Update the tree after modifying the parent node
    updateTree(deepReplaceNode(rootTree, parentNode.id, parentNode));
  }
  