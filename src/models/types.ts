import type { BracketStyle } from "../utils/bracketUtils";

export type NodeType =
  | "text"
  | "inline-container"
  | "group"
  | "fraction"
  | "root"
  | "big-operator"
  | "subsup"
  | "actsymb"
  | "decorated"
  | "precedence"
  | "matrix"
  | "vector";

export interface BaseNode {
  id: string;
  type: NodeType;
}

export interface TextNode extends BaseNode {
  type: "text";
  content: string;
}

export interface InlineContainerNode extends BaseNode {
  type: "inline-container";
  children: MathNode[];
}

export interface GroupNode extends BaseNode {
  type: "group";
  child: InlineContainerNode;
  showBrackets: boolean; //TODO maybe dont have this but do have a field for which bracket type: {[()]}
  bracketStyle: BracketStyle;
}

export interface FractionNode extends BaseNode {
  type: "fraction";
  numerator: MathNode;
  denominator: MathNode;
}

export interface RootNode extends BaseNode {
  type: "root";
  radicand: MathNode;
  degree?: MathNode;
}

export interface BigOperatorNode extends BaseNode {
  type: "big-operator";
  operator: string;
  lowerLimit?: MathNode;
  upperLimit?: MathNode;
}

export interface SubSuperscriptNode extends BaseNode {
  type: "subsup";
  base: MathNode;
  subLeft: MathNode;
  supLeft: MathNode;
  subRight: MathNode;
  supRight: MathNode;
}

export interface ActuarialSymbolNode extends BaseNode {
  type: "actsymb";
  base: MathNode;
  subLeft: MathNode;
  supLeft: MathNode;
  subRight: MathNode;
  supRight: MathNode;
}

export interface DecoratedNode extends BaseNode {
  type: "decorated";
  base: MathNode;
  decoration: "tilde" | "hat" | "widehat" | "bar" | "ddot" | "mathring" | "angl" | "underline" | "joint";
}

export interface PrecedenceNode extends BaseNode {
  type: "precedence";
  base: MathNode;
  //precedence: MathNode; // Could change to "1" | "2" | "3"; but this is better for freedom? Or not cuz I need to parse to latex
  precedence: "1" | "2" | "3"; 
}

export interface MatrixNode extends BaseNode {
  type: "matrix";
  rows: MathNode[][];
}

export interface VectorNode extends BaseNode {
  type: "vector";
  items: MathNode[];
  orientation: "horizontal" | "vertical";
}

export type MathNode =
  | TextNode
  | InlineContainerNode
  | GroupNode
  | FractionNode
  | RootNode
  | BigOperatorNode
  | ActuarialSymbolNode
  | SubSuperscriptNode
  | DecoratedNode
  | PrecedenceNode
  | MatrixNode
  | VectorNode;


// Helper function for stringifying MathNode
export const nodeToString = (node: MathNode): string => {
  switch (node.type) {
    case "text":
      return `TextNode(id: ${node.id}, content: "${node.content}")`;
    case "inline-container":
      return `InlineContainerNode(id: ${node.id}, childrenCount: ${node.children.length})`;
    case "group":
      return `GroupNode(id: ${node.id})`;
    case "fraction":
      return `FractionNode(id: ${node.id}, numerator: ${node.numerator.id}, denominator: ${node.denominator.id})`;
    case "root":
      return `RootNode(id: ${node.id}, radicand: ${node.radicand.id}, degree: ${node.degree?.id})`;
    case "big-operator":
      return `BigOperatorNode(id: ${node.id}, operator: ${node.operator})`;
    case "subsup":
      return `SubSuperscriptNode(id: ${node.id}, base: ${node.base.id}, subLeft: ${node.subLeft.id}, supLeft: ${node.supLeft.id}, subRight: ${node.subRight.id}, supRight: ${node.supRight.id})`;
    case "decorated":
      return `DecoratedNode(id: ${node.id}, base: ${node.base.id}, decoration: ${node.decoration})`;
    case "matrix":
      return `MatrixNode(id: ${node.id}, rowsCount: ${node.rows.length})`;
    case "vector":
      return `VectorNode(id: ${node.id}, itemsCount: ${node.items.length}, orientation: ${node.orientation})`;
    default:
      return `UnknownNode`;
  }
};

// Helper function for stringifying MathNode
export const nodeToMathText = (node: MathNode): string => {
  switch (node.type) {
    case "text":
      return `${node.content}`;
    case "inline-container":
      return `${node.children.map(nodeToMathText).join(" ")}`;
    case "group":
      return `(${nodeToMathText(node.child)})`;
    case "fraction":
      return `(${nodeToMathText(node.numerator)}/${nodeToMathText(node.denominator)})`;
    case "root":
      return `RootNode(id: ${node.id}, radicand: ${node.radicand.id}, degree: ${node.degree?.id})`;
    case "big-operator":
      return `BigOperatorNode(id: ${node.id}, operator: ${node.operator})`;
    case "subsup":
      return `_{${node.subLeft.id}}^{${node.supLeft.id}}_${node.base.id}_{${node.subRight.id}}^{${node.supRight.id}}`;
    case "decorated":
      return `DecoratedNode(id: ${node.id}, base: ${node.base.id}, decoration: ${node.decoration})`;
    case "matrix":
      return `MatrixNode(id: ${node.id}, rowsCount: ${node.rows.length})`;
    case "vector":
      return `VectorNode(id: ${node.id}, itemsCount: ${node.items.length}, orientation: ${node.orientation})`;
    default:
      return `UnknownNode`;
  }
};