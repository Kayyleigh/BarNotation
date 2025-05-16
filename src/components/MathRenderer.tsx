import React from "react";
import clsx from "clsx";
import type { MathNode } from "../models/types";
import type { CursorPosition } from "../logic/cursor";

import {
  renderTextNode,
  renderInlineContainerNode,
  //renderGroupNode,
  renderFractionNode,
  //renderRootNode,
  //renderBigOperatorNode,
  //renderSubSuperscriptNode,
  //renderDecoratedNode,
  //renderMatrixNode,
  //renderVectorNode,
} from "./MathRenderers";

export type MathRendererProps = {
  node: MathNode;
  cursor: CursorPosition;
  onCursorChange: (cursor: CursorPosition) => void;
  onRootChange: (newRoot: MathNode) => void;
  parentContainerId?: string;
  index?: number;
};

export const MathRenderer: React.FC<MathRendererProps> = ({
  node,
  cursor,
  onCursorChange,
  onRootChange,
  parentContainerId,
  index,
}) => {
  const props = { cursor, onCursorChange, onRootChange, parentContainerId, index };

  switch (node.type) {
    case "text":
      return renderTextNode(node, props);

    case "inline-container":
      return renderInlineContainerNode(node, props);

    case "group":
      return renderGroupNode(node, props);

    case "fraction":
      return renderFractionNode(node, props);

    case "root":
      return renderRootNode(node, props);

    case "big-operator":
      return renderBigOperatorNode(node, props);

    case "subsup":
      return renderSubSuperscriptNode(node, props);

    case "decorated":
      return renderDecoratedNode(node, props);

    case "matrix":
      return renderMatrixNode(node, props);

    case "vector":
      return renderVectorNode(node, props);

    default:
      console.log(`No case match`)
      return (
        <span
          className={clsx("math-node", {
            selected: cursor.containerId === node.id,
          })}
        >
          Unsupported node: {node.type}
        </span>
      );
  }
};
