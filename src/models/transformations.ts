// models/transformations.ts
import type { 
  FractionNode, 
  MathNode, 
  RootNode, 
  SubSuperscriptNode 
} from './types';
import { generateId, createTextNode } from './nodeFactories';

export const transformToFraction = (node: MathNode): FractionNode => ({
  id: generateId(),
  type: 'fraction',
  numerator: node,
  denominator: createTextNode(),
});

export const transformToSubscript = (node: MathNode): SubSuperscriptNode => ({
  id: generateId(),
  type: 'subsup',
  base: node,
  subRight: createTextNode(),
});

export const transformToSuperscript = (node: MathNode): SubSuperscriptNode => ({
  id: generateId(),
  type: 'subsup',
  base: node,
  supRight: createTextNode(),
});

export const transformToRoot = (degree: MathNode | undefined): RootNode => ({
  id: generateId(),
  type: 'root',
  radicand: createTextNode(),
  degree: degree,
});
