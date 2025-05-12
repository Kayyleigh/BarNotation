import {
    MathNode,
    CharacterNode,
    MultiCharacterNode,
    FractionNode,
    RootNode,
    BigOperatorNode,
    MatrixNode,
    VectorNode,
    SubSupScriptedNode,
    GroupNode,
    DecoratedNode,
  } from "./types";

export function deepReplaceNode(
    root: MathNode,
    targetId: string,
    newNode: MathNode
  ): MathNode {
    // If we've found the target node, return the new node
    if (root.id === targetId) return newNode;
  
    // Clone the current node to avoid mutation
    const clone = Object.assign(Object.create(Object.getPrototypeOf(root)), root);
  
    // If the node has children, recursively replace within the children
    if (root.children) {
      clone.children = root.children.map(child =>
        deepReplaceNode(child, targetId, newNode)
      );
    }
  
    return clone;
  }
  
  export function deserializeMathNode(obj: any): MathNode {
    switch (obj.type) {
      case "CharacterNode":
        return new CharacterNode(obj.value);
      case "MultiCharacterNode":
        return new MultiCharacterNode(obj.chars);
      case "FractionNode":
        return new FractionNode(
          deserializeMathNode(obj.numerator),
          deserializeMathNode(obj.denominator)
        );
      case "RootNode":
        return new RootNode(
          deserializeMathNode(obj.radicand),
          deserializeMathNode(obj.index)
        );
      case "BigOperatorNode":
        return new BigOperatorNode(
          obj.operatorSymbol,
          deserializeMathNode(obj.lower),
          deserializeMathNode(obj.upper),
          deserializeMathNode(obj.body),
        );
      case "MatrixNode":
        return new MatrixNode(
          obj.rows.map(deserializeMathNode) //maybe wrong
        );
      case "VectorNode":
        return new VectorNode(
          obj.elements.map(deserializeMathNode),
          obj.orientation
        );
      case "SubSupScriptedNode":
        return new SubSupScriptedNode(
          deserializeMathNode(obj.base),
          deserializeMathNode(obj.ll),
          deserializeMathNode(obj.ul),
          deserializeMathNode(obj.lr),
          deserializeMathNode(obj.ur)
        );
      case "GroupNode":
        return new GroupNode(
          obj.groupChildren.map(deserializeMathNode)
        );
      case "DecoratedNode":
        return new DecoratedNode(
          obj.decoration,
          deserializeMathNode(obj.child)
        );
      default:
        throw new Error("Unknown node type: " + obj.type);
    }
  }

  export function findNodeById(node: MathNode, id: string): MathNode | null {
    if (node.id === id) return node;
    for (const child of node.children) {
      const result = findNodeById(child, id);
      if (result) return result;
    }
    return null;
  }

  /**
 * Recursively searches the tree to find the parent of the node with the given ID.
 * Returns the parent node, or null if not found.
 */
export function findParentNode(root: MathNode, targetId: string): MathNode | null {
  for (const child of root.children) {
    if (child.id === targetId) {
      return root;
    }

    const found = findParentNode(child, targetId);
    if (found) {
      return found;
    }
  }

  return null;
}