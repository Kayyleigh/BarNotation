import type { MathNode } from "./types";
import { createTextNode, createInlineContainer } from "./nodeFactories";

export type CommandDefinition = {
  sequence: string;
  description: string;
  aliases?: string[];
  category?: string;
  createNode: () => MathNode;
  latex?: string;
};

export const commandRegistry: CommandDefinition[] = [
  {
    sequence: "sqrt",
    description: "Square root",
    latex: "\\sqrt",
    createNode: () => ({
      type: "nth-root",
      base: createInlineContainer([]),
      index: createInlineContainer([createTextNode("2")]),
      id: crypto.randomUUID(),
    }),
    category: "Roots",
  },
  {
    sequence: "alpha",
    description: "Greek letter: α",
    latex: "\\alpha",
    createNode: () => createTextNode("α"),
    category: "Greek Letters",
  },
  {
    sequence: "beta",
    description: "Greek letter: β",
    latex: "\\beta",
    createNode: () => createTextNode("β"),
    category: "Greek Letters",
  },
  {
    sequence: "gamma",
    description: "Greek letter: γ",
    latex: "\\gamma",
    createNode: () => createTextNode("γ"),
    category: "Greek Letters",
  },
  {
    sequence: "pi",
    description: "Greek letter: π",
    latex: "\\pi",
    createNode: () => createTextNode("π"),
    category: "Greek Letters",
  },
  {
    sequence: "theta",
    description: "Greek letter: θ",
    latex: "\\theta",
    createNode: () => createTextNode("θ"),
    category: "Greek Letters",
  },
  {
    sequence: "infty",
    description: "Infinity symbol: ∞",
    latex: "\\infty",
    createNode: () => createTextNode("∞"),
    category: "Symbols",
  },
  {
    sequence: "rightarrow",
    description: "Right arrow: →",
    latex: "\\rightarrow",
    createNode: () => createTextNode("→"),
    category: "Symbols",
  },
  {
    sequence: "leftarrow",
    description: "Left arrow: ←",
    latex: "\\leftarrow",
    createNode: () => createTextNode("←"),
    category: "Symbols",
  },
];
