// import { v4 as uuidv4 } from "uuid";
// import type {
//   MathNode,
//   TextNode,
//   InlineContainerNode,
//   GroupNode,
//   FractionNode,
//   RootNode,
//   BigOperatorNode,
//   SubSuperscriptNode,
//   ActuarialSymbolNode,
//   DecoratedNode,
//   MatrixNode,
//   VectorNode
// } from "./types";
// import type { BracketStyle } from "../utils/bracketUtils";
// import type { NodeDecoration } from "../utils/accentUtils";

// export const generateId = () => uuidv4();

// export const createTextNode = (content: string = ""): TextNode => ({
//   id: uuidv4(),
//   type: "text",
//   content
// });

// export const createInlineContainer = (children: MathNode[] = []): InlineContainerNode => ({
//   id: uuidv4(),
//   type: 'inline-container',
//   children: children.length > 0 ? children : [],
// });

// export const createGroupNode = (
//   child: InlineContainerNode = createInlineContainer(), 
//   bracketStyle: BracketStyle,
// ): GroupNode => ({
//   id: uuidv4(),
//   type: "group",
//   child: child,
//   showBrackets: true,
//   bracketStyle: bracketStyle
// });

// export const createFraction = (
//   numerator: MathNode = createTextNode(""),
//   denominator: MathNode = createTextNode("")
// ): FractionNode => ({
//   id: uuidv4(),
//   type: "fraction",
//   numerator: numerator,
//   denominator: denominator
// });

// export const createRootNode = (
//   radicand: MathNode = createTextNode(""),
//   degree?: MathNode
// ): RootNode => ({
//   id: uuidv4(),
//   type: "root",
//   radicand: radicand,
//   degree
// });

// export const createBigOperator = (
//   operator: string = "∑",
//   lowerLimit: MathNode = createTextNode("n=1"),
//   upperLimit: MathNode = createTextNode("i"),
// ): BigOperatorNode => ({
//   id: uuidv4(),
//   type: "big-operator",
//   lowerLimit: lowerLimit,
//   upperLimit: upperLimit,
//   operator: operator,
// });

// export const createSubSup = (
//   base: InlineContainerNode = createInlineContainer(), 
//   subLeft: InlineContainerNode = createInlineContainer(), 
//   subRight: InlineContainerNode = createInlineContainer(), 
//   supLeft: InlineContainerNode = createInlineContainer(), 
//   supRight: InlineContainerNode = createInlineContainer(), 
// ): SubSuperscriptNode => ({
//   id: uuidv4(),
//   type: "subsup",
//   base: base,
//   subLeft: subLeft,
//   supLeft: supLeft,
//   subRight: subRight,
//   supRight: supRight,
// });

// export const createActSymb = (
//   base: InlineContainerNode = createInlineContainer(), 
//   subLeft: InlineContainerNode = createInlineContainer(), 
//   supLeft: InlineContainerNode = createInlineContainer(), 
//   subRight: InlineContainerNode = createInlineContainer(), 
//   supRight: InlineContainerNode = createInlineContainer(), 
// ): ActuarialSymbolNode => ({
//   id: uuidv4(),
//   type: "actsymb",
//   base: base,
//   subLeft: subLeft,
//   supLeft: supLeft,
//   subRight: subRight,
//   supRight: supRight,
// });

// export const createDecorated = (
//   decoration: NodeDecoration,
//   child: InlineContainerNode = createInlineContainer(),
// ): DecoratedNode => ({
//   id: uuidv4(),
//   type: "decorated",
//   child: child,
//   decoration
// });

// export const createMatrix = (
//   rows: MathNode[][] = [[createTextNode("")]]
// ): MatrixNode => ({
//   id: uuidv4(),
//   type: "matrix",
//   rows: rows
// });

// export const createVector = (
//   orientation: "horizontal" | "vertical",
//   items: MathNode[] = [createTextNode("")]
// ): VectorNode => ({
//   id: uuidv4(),
//   type: "vector",
//   items: items,
//   orientation
// });

import { v4 as uuidv4 } from "uuid";
import type {
  MathNode,
  InlineContainerNode,
  BracketStyle,
  RootWrapperNode,
  StructureNode,
  MultilineEquationNode,
  FractionNode,
  NthRootNode,
  BigOperatorNode,
  ChildedNode,
  AccentedNode,
  MatrixNode,
  CasesNode,
  VectorNode,
  BinomCoefficientNode,
  GroupNode,
  AccentKind,
  TextStyle,
} from "./types"; // Adjust imports to your setup

export const generateId = () => uuidv4();

// ========== Core Factories ==========

export const createInlineContainer = (children: StructureNode[] = []): InlineContainerNode => ({
  id: uuidv4(),
  type: "inline-container",
  children,
});

export const createRootWrapper = (child: InlineContainerNode = createInlineContainer()): RootWrapperNode => ({
  id: uuidv4(),
  type: "root-wrapper",
  child,
});

export const createMultilineEquation = (children: RootWrapperNode[] = [createRootWrapper()]): MultilineEquationNode => ({
  id: uuidv4(),
  type: "multiline",
  children,
});

// ========== Structure Factories ==========

export const createFraction = (
  numerator: InlineContainerNode = createInlineContainer(),
  denominator: InlineContainerNode = createInlineContainer()
): FractionNode => ({
  id: uuidv4(),
  type: "fraction",
  numerator,
  denominator,
});

export const createNthRoot = (
  base: InlineContainerNode = createInlineContainer(),
  index: InlineContainerNode = createInlineContainer()
): NthRootNode => ({
  id: uuidv4(),
  type: "nth-root",
  base,
  index,
});

export const createBigOperator = (
  operator: string = "∑",
  lower: InlineContainerNode = createInlineContainer(),
  upper: InlineContainerNode = createInlineContainer()
): BigOperatorNode => ({
  id: uuidv4(),
  type: "big-operator",
  operator,
  lower,
  upper,
});

export const createChildedNode = (
  base: InlineContainerNode = createInlineContainer(),
  variant: "subsup" | "actsymb" = "subsup",
  subLeft: InlineContainerNode = createInlineContainer(),
  supLeft: InlineContainerNode = createInlineContainer(),
  subRight: InlineContainerNode = createInlineContainer(),
  supRight: InlineContainerNode = createInlineContainer(),
): ChildedNode => ({
  id: uuidv4(),
  type: "childed",
  base,
  subLeft,
  supLeft,
  subRight,
  supRight,
  variant,
});

export const createAccentedNode = (
  base: InlineContainerNode = createInlineContainer(),
  accent: AccentKind,
): AccentedNode => ({
  id: uuidv4(),
  type: "accented",
  base,
  accent,
});

export const createArrowNode = (
  arrowStyle: string = "→",
  above: InlineContainerNode = createInlineContainer(),
  below: InlineContainerNode = createInlineContainer(),
): MathNode => ({
  id: uuidv4(),
  type: "arrow",
  arrowStyle,
  above,
  below,
});

export const createGroupNode = (
  child: InlineContainerNode = createInlineContainer(),
  bracketStyle: BracketStyle = "parentheses"
): GroupNode => ({
  id: uuidv4(),
  type: "group",
  child,
  bracketStyle,
});

// ========== Composite Layout Structures ==========

export const createBinomCoefficientNode = (
  top: InlineContainerNode = createInlineContainer(),
  bottom: InlineContainerNode = createInlineContainer()
): BinomCoefficientNode => ({
  id: uuidv4(),
  type: "binom",
  top,
  bottom,
});

export const createVectorNode = (
  elements: InlineContainerNode[] = [createInlineContainer()],
  bracketStyle: BracketStyle = "parentheses",
  orientation: "horizontal" | "vertical" = "vertical"
): VectorNode => ({
  id: uuidv4(),
  type: "vector",
  elements,
  bracketStyle,
  orientation
});

export const createMatrixNode = (
  rows: InlineContainerNode[][] = [[createInlineContainer()]],
  bracketStyle: BracketStyle = "parentheses"
): MatrixNode => ({
  id: uuidv4(),
  type: "matrix",
  rows,
  bracketStyle
});

export const createCasesNode = (
  rows: [InlineContainerNode, InlineContainerNode][] = [
    [createInlineContainer(), createInlineContainer()],
  ]
): CasesNode => ({
  id: uuidv4(),
  type: "cases",
  rows,
});

// ========== Text and Styling ==========

export const createTextNode = (
  content: string
): MathNode => ({
  id: uuidv4(),
  type: "text",
  content,
});

export const createStyledNode = (
  child: MathNode,
  style: TextStyle = {}
): MathNode => ({
  id: uuidv4(),
  type: "styled",
  child,
  style,
});
