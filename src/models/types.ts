export type NodeType =
  | "text"
  | "inline-container"
  | "group"
  | "fraction"
  | "root"
  | "big-operator"
  | "subsup"
  | "decorated"
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
  children: MathNode[];
  showBrackets: boolean;
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
  body: MathNode;
}

export interface SubSuperscriptNode extends BaseNode {
  type: "subsup";
  base: MathNode;
  subLeft: MathNode;
  supLeft: MathNode;
  subRight: MathNode;
  supRight: MathNode;
}

export interface DecoratedNode extends BaseNode {
  type: "decorated";
  base: MathNode;
  decoration: "hat" | "bar" | "angl";
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
  | SubSuperscriptNode
  | DecoratedNode
  | MatrixNode
  | VectorNode;
