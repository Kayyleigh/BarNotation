import { createDecorated, createTextNode } from '../models/nodeFactories';
import type { MathNode } from '../models/types';
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
  
  ...decoratedEntries

//   "\\alpha": "α",
//   "\\beta": "β",
//   "\\pi": "π",
//   // ...


  // Future support:
  // {
  //   sequence: '\\hat',
  //   mathNode: createAccentNode('hat', createTextNode('')), // To be implemented
  // },
];
