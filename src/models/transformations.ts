// models/transformations.ts
import type { 
  FractionNode, 
  InlineContainerNode, 
  MathNode, 
  RootNode, 
  SubSuperscriptNode 
} from './types';
import { generateId, createInlineContainer } from './nodeFactories';

export const transformToFractionNode = (node: MathNode): FractionNode => ({
  id: generateId(),
  type: 'fraction',
  numerator: ensureInContainerNode(node),
  denominator: createInlineContainer(),
});

export const transformToSubscriptNode = (node: MathNode): SubSuperscriptNode => ({
  id: generateId(),
  type: 'subsup',
  base: ensureInContainerNode(node),
  subLeft: createInlineContainer(),
  supLeft: createInlineContainer(),
  subRight: createInlineContainer(),
  supRight: createInlineContainer(),
});

export const transformToSuperscriptNode = (node: MathNode): SubSuperscriptNode => ({
  id: generateId(),
  type: 'subsup',
  base: ensureInContainerNode(node),
  subLeft: createInlineContainer(),
  supLeft: createInlineContainer(),
  subRight: createInlineContainer(),
  supRight: createInlineContainer(),
});

export const transformToNthRootNode = (degree: MathNode | undefined): RootNode => ({
  id: generateId(),
  type: 'root',
  radicand: createInlineContainer(),
  degree: degree,
});

const ensureInContainerNode = (node: MathNode): InlineContainerNode =>
  node.type === 'inline-container' ? node : createInlineContainer([node]);