import { v4 as uuidv4 } from "uuid";
import type {
  MathNode,
  TextNode,
  InlineContainerNode,
  GroupNode,
  FractionNode,
  RootNode,
  BigOperatorNode,
  SubSuperscriptNode,
  DecoratedNode,
  MatrixNode,
  VectorNode
} from "./types";

export const generateId = () => uuidv4();

export const createTextNode = (content: string = ""): TextNode => ({
  id: uuidv4(),
  type: "text",
  content
});

export const createInlineContainer = (children: MathNode[] = []): InlineContainerNode => ({
  id: uuidv4(),
  type: 'inline-container',
  children: children.length > 0 ? children : [createTextNode()],
});

export const createGroupNode = (children: MathNode[] = []): GroupNode => ({
  id: uuidv4(),
  type: "group",
  children: children,
  showBrackets: true
});

export const createFraction = (
  numerator: MathNode = createTextNode(""),
  denominator: MathNode = createTextNode("")
): FractionNode => ({
  id: uuidv4(),
  type: "fraction",
  numerator: numerator,
  denominator: denominator
});

export const createRootNode = (
  radicand: MathNode = createTextNode(""),
  degree?: MathNode
): RootNode => ({
  id: uuidv4(),
  type: "root",
  radicand: radicand,
  degree
});

export const createBigOperator = (
  operator: string = "∑",
  lowerLimit: MathNode = createTextNode("n=1"),
  upperLimit: MathNode = createTextNode("i"),
  body: MathNode = createTextNode("")
): BigOperatorNode => ({
  id: uuidv4(),
  type: "big-operator",
  lowerLimit: lowerLimit,
  upperLimit: upperLimit,
  operator: operator,
  body: body
});

export const createSubSup = (
  base: MathNode = createTextNode(""),
  subLeft: MathNode = createTextNode(""),
  subRight: MathNode = createTextNode(""),
  supLeft: MathNode = createTextNode(""),
  supRight: MathNode = createTextNode("")
): SubSuperscriptNode => ({
  id: uuidv4(),
  type: "subsup",
  base: base,
  subLeft: subLeft, //TODO think abt whether I need text or IC nodes (in this file, not only this line)
  supLeft: supLeft,
  subRight: subRight,
  supRight: supRight,
});

export const createDecorated = (
  decoration: "hat" | "bar" | "angl",
  base: MathNode = createTextNode("")
): DecoratedNode => ({
  id: uuidv4(),
  type: "decorated",
  base: base,
  decoration
});

export const createMatrix = (
  rows: MathNode[][] = [[createTextNode("")]]
): MatrixNode => ({
  id: uuidv4(),
  type: "matrix",
  rows: rows
});

export const createVector = (
  orientation: "horizontal" | "vertical",
  items: MathNode[] = [createTextNode("")]
): VectorNode => ({
  id: uuidv4(),
  type: "vector",
  items: items,
  orientation
});
