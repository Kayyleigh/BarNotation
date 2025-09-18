// models/transformations.ts
import type { 
  FractionNode, 
  InlineContainerNode, 
  NthRootNode, 
  StructureNode, 
  ChildedNode, 
  OverUndersetNode,
  OverUndersetVariant
} from './mathNodeTypes';
import { generateId, createInlineContainer } from './nodeFactories';

export const transformToFractionNode = (node: StructureNode | InlineContainerNode): FractionNode => ({
  id: generateId(),
  type: 'fraction',
  variant: 'frac',
  numerator: ensureInContainerNode(node),
  denominator: createInlineContainer(),
});

export const transformtoOverUndersetNode = (node: StructureNode | InlineContainerNode, variant: OverUndersetVariant = "overunderset", position: "above" | "below"): OverUndersetNode => ({
  id: generateId(),
  type: 'overunderset',
  base: ensureInContainerNode(node),
  content: createInlineContainer(),
  variant,
  position
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
  node.type === 'inline-container' ? node : createInlineContainer([node]);