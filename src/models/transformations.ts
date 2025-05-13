// models/transformations.ts
import type { 
  FractionNode, 
  MathNode, 
  RootNode, 
  SubSuperscriptNode 
} from './types';
import { generateId, createTextNode, createInlineContainer } from './nodeFactories';

export const transformToFraction = (node: MathNode): FractionNode => ({
  id: generateId(),
  type: 'fraction',
  numerator: node,
  denominator: createInlineContainer(),
});

export const transformToSubscript = (node: MathNode): SubSuperscriptNode => ({
  id: generateId(),
  type: 'subsup',
  base: node,
  subLeft: createInlineContainer(),
  supLeft: createInlineContainer(),
  subRight: createInlineContainer(),
  supRight: createInlineContainer(),
});

export const transformToSuperscript = (node: MathNode): SubSuperscriptNode => ({
  id: generateId(),
  type: 'subsup',
  base: node,
  subLeft: createInlineContainer(),
  supLeft: createInlineContainer(),
  subRight: createInlineContainer(),
  supRight: createInlineContainer(),
});

export const transformToRoot = (degree: MathNode | undefined): RootNode => ({
  id: generateId(),
  type: 'root',
  radicand: createInlineContainer(),
  degree: degree,
});
