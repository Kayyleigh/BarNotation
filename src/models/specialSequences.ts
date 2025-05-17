import { createDecorated, createTextNode } from '../models/nodeFactories';
import type { MathNode, TextNode } from '../models/types';
import { decorationToLatexCommand, type NodeDecoration } from '../utils/accentUtils';

// Build dynamic decorated nodes
const decoratedEntries: { sequence: string; mathNode: MathNode }[] = Object.entries(decorationToLatexCommand).map(
  ([decoration, sequence]) => ({
    sequence,
    mathNode: createDecorated(decoration as NodeDecoration)
  })
);

/**
 * Define sequences like \alpha or \in and their corresponding MathNode transformations.
 * These are matched when a user types such sequences into a text node.
 */
export const specialSequences: { sequence: string; mathNode: MathNode }[] = [
  {
    sequence: '\\alpha',
    mathNode: createTextNode('α'), // Greek alpha symbol as plain text
  },
  {
    sequence: '\\in',
    mathNode: createTextNode('∈'), // Set membership symbol
  },
  //   "\\beta": "β",
  //   "\\pi": "π",
  //   ...


  ...decoratedEntries
];

export const symbolToLatex: Record<string, string> = Object.fromEntries(
  specialSequences
    .filter(e => e.mathNode.type === 'text')
    .map(e => [(e.mathNode as TextNode).content, e.sequence])
);

export const symbolToLatexInverse = Object.fromEntries(
  Object.entries(symbolToLatex).map(([k, v]) => [v.replace(/^\\/, ""), k])
);