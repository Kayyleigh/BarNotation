import type { NodeDecoration } from "../utils/accentUtils";
import type { BracketStyle } from "../utils/bracketUtils";

// TODO: rename to mathtypes? 

export type MathNode =
  | MultilineEquationNode
  | RootWrapperNode
  | InlineContainerNode
  | StructureNode;

export type TextContainerNode =
  | MultiDigitNode
  | CommandInputNode;

export type StructureNode =
  | FractionNode
  | NthRootNode
  | BigOperatorNode
  | ChildedNode
  | AccentedNode //TODO remove
  | DecoratedNode
  | OverUndersetNode
  | ArrowNode
  | GroupNode
  | VectorNode
  | MatrixNode
  | CasesNode
  | TextNode
  | StyledNode
  | MultiDigitNode
  | CommandInputNode;

export type NodeType =
  | "text"
  | "command-input"
  | "multi-digit"
  | "styled"
  | "multiline"
  | "root-wrapper"
  | "inline-container"
  | "group"
  | "fraction"
  | "nth-root"
  | "big-operator"
  | "childed"
  | "accented" // TODO remove
  | "overunderset"
  | "decorated"
  | "arrow"
  | "matrix"
  | "vector"
  | "cases";

export interface BaseNode {
  id: string;
  type: NodeType;
}

export interface FontStyling {
  fontStyle: "normal" | "italic" | "upright" | "command" | "multidigit" | "bold" | "calligraphic" | "blackboard";
  fontStyleAlias: string;
}

export interface TextStyle {
  fontStyling?: FontStyling;
  color?: string;
  fontSize?: number;
}

export interface StyledNode extends BaseNode {
  type: "styled";
  child: MathNode;
  style: TextStyle;
}

export interface MultilineEquationNode extends BaseNode {
  type: "multiline";
  children: RootWrapperNode[];
  alignment?: "left" | "center" | "right" | "align" | "multline"; // Optional for LaTeX export
}

export interface RootWrapperNode extends BaseNode {
  type: "root-wrapper";
  child: InlineContainerNode;
}

export interface InlineContainerNode extends BaseNode {
  type: "inline-container";
  children: StructureNode[];
}

export type FractionVariant = "frac" | "binom";

export interface FractionNode extends BaseNode {
  type: "fraction";
  variant: FractionVariant;
  numerator: InlineContainerNode;
  denominator: InlineContainerNode;
}

export interface NthRootNode extends BaseNode {
  type: "nth-root";
  base: InlineContainerNode;
  index: InlineContainerNode;
}

export interface BigOperatorNode extends BaseNode {
  type: "big-operator";
  operator: string;
  upper: InlineContainerNode;
  lower: InlineContainerNode;
}

export type ChildedVariant = "subsup" | "actsymb";

export interface ChildedNode extends BaseNode {
  type: "childed";
  variant: ChildedVariant;
  base: InlineContainerNode;
  subLeft: InlineContainerNode;
  supLeft: InlineContainerNode;
  subRight: InlineContainerNode;
  supRight: InlineContainerNode;
}

// TODO REMOVE ONCE THE SPLIT ONES EXIST AND FUNCTION WELL
export type AccentKind =
  | { type: "predefined"; decoration: NodeDecoration }  // e.g., "hat", "tilde", "overline"
  | { type: "custom"; content: InlineContainerNode; position: "above" | "below" };

// TODO REMOVE
export interface AccentedNode extends BaseNode {
  type: "accented";
  base: InlineContainerNode;
  accent: AccentKind;
}

export interface DecoratedNode extends BaseNode {
  type: "decorated";
  base: InlineContainerNode;
  decoration: NodeDecoration;
}

export type OverUndersetVariant = "overunderset" | "nthtopbottom"; // for \underset{} and \overset{} vs. \iiitop, \ibottom, etc.

export interface OverUndersetNode extends BaseNode {
  type: "overunderset";
  variant: OverUndersetVariant;
  base: InlineContainerNode;
  content: InlineContainerNode;
  position: "above" | "below";
}

export interface ArrowNode extends BaseNode {
  type: "arrow";
  above: InlineContainerNode;
  below: InlineContainerNode;
  arrowStyle: string; // e.g. "->", "=>", etc.
}

export interface GroupNode extends BaseNode {
  type: "group";
  child: InlineContainerNode;
  bracketStyle: BracketStyle;
}

export interface VectorNode extends BaseNode {
  type: "vector";
  elements: InlineContainerNode[];
  bracketStyle: BracketStyle;
  orientation: "horizontal" | "vertical";
  // Maybe enable diff style for L vs R
}

export interface MatrixNode extends BaseNode {
  type: "matrix";
  rows: InlineContainerNode[][];
  bracketStyle: BracketStyle;
  // Maybe enable diff style for L vs R
}

export interface CasesNode extends BaseNode {
  type: "cases";
  rows: [InlineContainerNode, InlineContainerNode][]; // each row is [value, condition]
}

export interface TextNode extends BaseNode {
  type: "text";
  content: string; // single character or special sequence's result string
  inputAlias: string;
}

// Node types for multi-character sequences
export interface TextContainerNodeBase {
  id: string;
  type: "multi-digit" | "command-input";
  children: TextNode[];
}

export interface MultiDigitNode extends BaseNode {
  type: "multi-digit";
  children: TextNode[]; // each with one digit
}

export interface CommandInputNode extends BaseNode {
  type: "command-input";
  children: TextNode[]; // e.g., `\a`, `\al`, `\alpha`
}

// Helper function for stringifying MathNode
export const nodeToMathText = (node: MathNode): string => {
  switch (node.type) {
    case "text":
      return `${node.content}`;
    case "multi-digit":
    case "command-input":
      return `${node.children.map(child => child.content).join("")}`;
    case "styled":
      return `Styled(${nodeToMathText(node.child)})`;
    case "multiline":
      return `Multiline(${node.children.map(nodeToMathText).join(", ")})`;
    case "root-wrapper":
      return `RootWrapper(${nodeToMathText(node.child)})`;
    case "inline-container":
      return `Inline(${node.children.map(nodeToMathText).join(" ")})`;
    case "group":
      return `Group(${nodeToMathText(node.child)})`;
    case "fraction":
      return `Fraction(${nodeToMathText(node.numerator)}, ${nodeToMathText(node.denominator)})`;
    case "nth-root":
      return `NthRoot(${nodeToMathText(node.base)}, n=${nodeToMathText(node.index)})`;
    case "big-operator":
      return `BigOp(${node.operator}, lower=${nodeToMathText(node.lower)}, upper=${nodeToMathText(node.upper)})`;
    case "childed":
      return `_{${nodeToMathText(node.subLeft)}}^{${nodeToMathText(node.supLeft)}}{${nodeToMathText(node.base)}}_{${nodeToMathText(node.subRight)}}^{${nodeToMathText(node.supRight)}}`;
    case "accented":
      //TODO
      return `Accented(TODO)`;
    case "arrow":
      //TODO
      return `Arrow(TODO)`;
    case "matrix":
      //TODO
      return `Matrix(TODO)`;
    case "vector":
      //TODO
      return `Vector(TODO)`;
    case "cases":
      //TODO
      return `Cases(TODO)`;
    default:
      return `Unknown`;
  }
};
