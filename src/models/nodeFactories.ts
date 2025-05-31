import { v4 as uuidv4 } from "uuid";
import type {
  MathNode,
  InlineContainerNode,
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
  TextNode,
  MultiDigitNode,
  CommandInputNode,
  StyledNode,
} from "./types"; // Adjust imports to your setup
import type { BracketStyle } from "../utils/bracketUtils";

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
  content: string,
  inputAlias: string = content,
): TextNode => ({
  id: uuidv4(),
  type: "text",
  content,
  inputAlias,
});

export const createMultiDigitNode = (children: TextNode[] = []): MultiDigitNode => ({
  id: uuidv4(),
  type: "multi-digit",
  children,
});

export const createCommandInputNode = (children: TextNode[] = []): CommandInputNode => ({
  id: uuidv4(),
  type: "command-input",
  children,
});

export const createStyledNode = (child: MathNode, style: TextStyle = {}): StyledNode => ({
  id: uuidv4(),
  type: "styled",
  child,
  style,
});
