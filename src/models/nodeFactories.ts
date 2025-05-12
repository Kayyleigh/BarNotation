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

// export const createInlineContainer = (): InlineContainerNode => ({
//   id: uuidv4(),
//   type: "inline-container",
//   children: []
// });
export const createInlineContainer = (children: MathNode[] = []): InlineContainerNode => ({
  id: uuidv4(),
  type: 'inline-container',
  children,
});

export const createGroupNode = (): GroupNode => ({
  id: uuidv4(),
  type: "group",
  children: [],
  showBrackets: true
});

export const createFraction = (): FractionNode => ({
  id: uuidv4(),
  type: "fraction",
  numerator: createTextNode(""),
  denominator: createTextNode("")
});

export const createRoot = (): RootNode => ({
  id: uuidv4(),
  type: "root",
  radicand: createTextNode(""),
});

export const createBigOperator = (): BigOperatorNode => ({
  id: uuidv4(),
  type: "big-operator",
  operator: "∑",
  body: createTextNode("")
});

export const createSubSup = (): SubSuperscriptNode => ({
  id: uuidv4(),
  type: "subsup",
  base: createTextNode("")
});

export const createDecorated = (decoration: "hat" | "bar" | "angl"): DecoratedNode => ({
  id: uuidv4(),
  type: "decorated",
  base: createTextNode(""),
  decoration
});

export const createMatrix = (): MatrixNode => ({
  id: uuidv4(),
  type: "matrix",
  rows: [[createTextNode("")]]
});

export const createVector = (orientation: "horizontal" | "vertical"): VectorNode => ({
  id: uuidv4(),
  type: "vector",
  items: [createTextNode("")],
  orientation
});
