// models/transformations.ts
import type { 
  FractionNode, 
  InlineContainerNode, 
  NthRootNode, 
  StructureNode, 
  ChildedNode, 
  AccentedNode
} from './types';
import { generateId, createInlineContainer } from './nodeFactories';

export const transformToFractionNode = (node: StructureNode): FractionNode => ({
  id: generateId(),
  type: 'fraction',
  numerator: ensureInContainerNode(node),
  denominator: createInlineContainer(),
});

export const transformToCustomAccentNode = (node: StructureNode, position: "above" | "below"): AccentedNode => ({
  id: generateId(),
  type: 'accented',
  base: ensureInContainerNode(node),
  accent: {
    type: "custom",
    content: createInlineContainer(),
    position
  }
});

export const transformToChildedNode = (node: StructureNode, variant: "subsup" | "actsymb" = "subsup"): ChildedNode => ({
  id: generateId(),
  type: 'childed',
  base: ensureInContainerNode(node),
  subLeft: createInlineContainer(),
  supLeft: createInlineContainer(),
  subRight: createInlineContainer(),
  supRight: createInlineContainer(),
  variant
});

export const transformToSubscriptNode = (node: StructureNode): ChildedNode => ({
  id: generateId(),
  type: 'childed',
  base: ensureInContainerNode(node),
  subLeft: createInlineContainer(),
  supLeft: createInlineContainer(),
  subRight: createInlineContainer(),
  supRight: createInlineContainer(),
  variant: 'subsup',
});
//TODO these are the same
export const transformToSuperscriptNode = (node: StructureNode): ChildedNode => ({
  id: generateId(),
  type: 'childed',
  base: ensureInContainerNode(node),
  subLeft: createInlineContainer(),
  supLeft: createInlineContainer(),
  subRight: createInlineContainer(),
  supRight: createInlineContainer(),
  variant: 'subsup',
});

export const transformToNthRootNode = (index: InlineContainerNode): NthRootNode => ({
  id: generateId(),
  type: 'nth-root',
  base: createInlineContainer(),
  index: index,
});

export const ensureInContainerNode = (node: StructureNode | InlineContainerNode): InlineContainerNode =>
  node.type === 'inline-container' ? node : createInlineContainer([node as StructureNode]);