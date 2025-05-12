import React from "react";
import clsx from "clsx";
import type { MathNode } from "../models/types";

import {
  renderTextNode,
  renderInlineContainerNode,
  renderGroupNode,
  renderFractionNode,
  renderRootNode,
  renderBigOperatorNode,
  renderSubSuperscriptNode,
  renderDecoratedNode,
  renderMatrixNode,
  renderVectorNode,
} from "./MathRenderers";

export type MathRendererProps = {
  node: MathNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRootChange: (newRoot: MathNode) => void;
};

export const MathRenderer: React.FC<MathRendererProps> = ({
  node,
  selectedId,
  onSelect,
  onRootChange,
}) => {
  const props = { selectedId, onSelect, onRootChange };

  switch (node.type) {
    case "text":
      return renderTextNode(node, selectedId, onSelect, onRootChange);

    case "inline-container":
      return renderInlineContainerNode(node, selectedId, onSelect, onRootChange);

    case "group":
      return renderGroupNode(node, selectedId, onSelect, onRootChange);

    case "fraction":
      return renderFractionNode(node, selectedId, onSelect, onRootChange);

    case "root":
      return renderRootNode(node, selectedId, onSelect, onRootChange);

    case "big-operator":
      return renderBigOperatorNode(node, selectedId, onSelect, onRootChange);

    case "subsup":
      return renderSubSuperscriptNode(node, selectedId, onSelect, onRootChange);

    case "decorated":
      return renderDecoratedNode(node, selectedId, onSelect, onRootChange);

    case "matrix":
      return renderMatrixNode(node, selectedId, onSelect, onRootChange);

    case "vector":
      return renderVectorNode(node, selectedId, onSelect, onRootChange);

    default:
      console.log(`sucks to be you`)
      return (
        <span
          className={clsx("math-node", {
            selected: selectedId === node.id,
          })}
          onClick={() => onSelect(node.id)}
        >
          Unsupported node: {node.type}
        </span>
      );
  }
};
