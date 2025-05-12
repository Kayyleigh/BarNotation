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
import { deepReplaceNode } from "./treeUtils";

export function handleShortcuts(
  e: React.KeyboardEvent<HTMLInputElement>,
  currentNode: MathNode,
  rootTree: MathNode,
  updateTree: (newTree: MathNode) => void
) {
  const key = e.key;

  if (key === "^") {
    e.preventDefault();
    const power = new SubSupScriptedNode(
        currentNode, 
        new CharacterNode(""), 
        new CharacterNode(""), 
        new CharacterNode(""), 
        new CharacterNode("")
    );
    const newTree = deepReplaceNode(rootTree, currentNode.id, power);
    updateTree(newTree);
  }

  if (key === "/") {
    e.preventDefault();
    const frac = new FractionNode(currentNode, new CharacterNode(""));
    const newTree = deepReplaceNode(rootTree, currentNode.id, frac);
    updateTree(newTree);
  }

  if (key === "_") {
    e.preventDefault();
    const subscript = new SubSupScriptedNode(
        currentNode, 
        new CharacterNode(""), 
        new CharacterNode(""), 
        new CharacterNode(""), 
        new CharacterNode("")
    );
    const newTree = deepReplaceNode(rootTree, currentNode.id, subscript);
    updateTree(newTree);
  }
}
