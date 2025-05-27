// textContainerUtils.ts

import { createMultiDigitNode, createCommandInputNode } from "../models/nodeFactories";
import type { TextNode, TextContainerNode } from "../models/types";

/**
 * Splits a TextContainerNode (MultiDigitNode or CommandInputNode)
 * into two parts at the given index. Each resulting part will be
 * either a single TextNode or a new container node.
 */
export const splitTextContainerNode = (
  container: TextContainerNode,
  splitIndex: number
): (TextNode | TextContainerNode)[] => {
  const left = container.children.slice(0, splitIndex);
  const right = container.children.slice(splitIndex);

  const wrapIfNeeded = (arr: TextNode[]): TextNode | TextContainerNode => {
    if (arr.length === 1) return arr[0];
    if (container.type === "multi-digit") {
      return createMultiDigitNode(arr);
    } else if (container.type === "command-input") {
      return createCommandInputNode(arr);
    } else {
      throw new Error(`Unsupported TextContainerNode type: ${container.type}`);
    }
  };

  return [wrapIfNeeded(left), wrapIfNeeded(right)];
};
