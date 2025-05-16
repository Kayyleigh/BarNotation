import { createTextNode } from '../models/nodeFactories';
import type { MathNode } from '../models/types';

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
  // Future support:
  // {
  //   sequence: '\\hat',
  //   mathNode: createAccentNode('hat', createTextNode('')), // To be implemented
  // },
];
