import React from "react";
import clsx from "clsx";
import type { MathNode, TextStyle } from "../models/types";
import type { CursorPosition } from "../logic/cursor";

import {
  renderTextNode,
  renderInlineContainerNode,
  renderFractionNode,
  renderGroupNode,
  renderChildedNode,
  renderAccentedNode,
  renderStyledNode,
  renderCommandInputNode,
  renderMultiDigitNode,
  renderBigOperatorNode,
} from "./MathRenderers";

export type MathRendererProps = {
  node: MathNode;
  cursor: CursorPosition;
  onCursorChange: (cursor: CursorPosition) => void;
  onRootChange: (newRoot: MathNode) => void;
  parentContainerId?: string;
  index?: number;
  inheritedStyle?: TextStyle;
};

export const MathRenderer: React.FC<MathRendererProps> = ({
  node,
  cursor,
  onCursorChange,
  onRootChange,
  parentContainerId,
  index,
  inheritedStyle = { fontFamily: "normal" },
}) => {
  const props = { cursor, onCursorChange, onRootChange, parentContainerId, index, inheritedStyle };

  switch (node.type) {
    case "text":
      return renderTextNode(node, props);

    case "multi-digit":
      return renderMultiDigitNode(node, props);

    case "command-input":
      return renderCommandInputNode(node, props);

    case "inline-container":
      return renderInlineContainerNode(node, props);

    case "group":
      return renderGroupNode(node, props);

    case "fraction":
      return renderFractionNode(node, props);

    case "nth-root":
      return renderNthRootNode(node, props);

    case "big-operator":
      return renderBigOperatorNode(node, props);

    case "childed":
      return renderChildedNode(node, props);

    case "accented":
      return renderAccentedNode(node, props);

    case "matrix":
      return renderMatrixNode(node, props);

    case "vector":
      return renderVectorNode(node, props);

    case "binom":
      return renderBinomNode(node, props);

    case "arrow":
      return renderArrowNode(node, props);

    case "cases":
      return renderCasesNode(node, props);

    case "styled":
      return renderStyledNode(node, props);

    case "multiline":
      return renderMultilineNode(node, props);

    case "root-wrapper":
      return renderRootWrapperNode(node, props);

    default:
      console.warn(`No case match in MathRenderer.`)
      return (
        <span
          className={clsx("math-node", {
            selected: cursor.containerId === node.id,
          })}
        >
          Unsupported node: {node}
        </span>
      );
  }
};
