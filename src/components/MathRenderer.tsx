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
  renderRootWrapperNode,
  renderNthRootNode,
} from "./MathRenderers";
import { findParentContainerAndIndex } from "../utils/treeUtils";

export type MathRendererProps = {
  node: MathNode;
  cursor: CursorPosition;
  hoveredId?: string;
  onCursorChange: (cursor: CursorPosition) => void;  
  onRootChange: (newRoot: MathNode) => void;
  onHoverChange: (hoveredId?: string) => void;

  // Drag-and-drop handlers
  onStartDrag: (nodeId: string) => void;
  onUpdateDropTarget: (targetId: string, targetIndex: number) => void;
  onHandleDrop: () => void;
  onClearDrag: () => void;

  parentContainerId?: string;
  ancestorIds?: string[];
  index?: number;
  inheritedStyle?: TextStyle;
};

export const MathRenderer: React.FC<MathRendererProps> = ({
  node,
  cursor,
  hoveredId,
  onCursorChange,
  onHoverChange,
  onRootChange,
  onStartDrag,
  onUpdateDropTarget,
  onHandleDrop,
  onClearDrag,
  parentContainerId,
  ancestorIds,
  index,
  inheritedStyle = { fontFamily: "normal" },
}) => {

  const dragHandlers = {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.stopPropagation();
      onStartDrag(node.id);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onUpdateDropTarget(node.id, index ?? 0);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onHandleDrop();
    },
    onDragEnd: () => {
      onClearDrag();
    },
  };

  const baseProps = { cursor, hoveredId, onCursorChange, onHoverChange, onRootChange, onStartDrag, onUpdateDropTarget, onHandleDrop, onClearDrag, parentContainerId, ancestorIds, index, inheritedStyle };

  let content;

  switch (node.type) {
    case "text":
      content = renderTextNode(node, baseProps);
			break;
    case "multi-digit":
      content = renderMultiDigitNode(node, baseProps);
			break;
    case "command-input":
      content = renderCommandInputNode(node, baseProps);
			break;
    case "inline-container":
      content = renderInlineContainerNode(node, baseProps);
			break;
    case "group":
      content = renderGroupNode(node, baseProps);
			break;
    case "fraction":
      content = renderFractionNode(node, baseProps);
			break;
    case "nth-root":
      content = renderNthRootNode(node, baseProps);
			break;
    case "big-operator":
      content = renderBigOperatorNode(node, baseProps);
			break;
    case "childed":
      content = renderChildedNode(node, baseProps);
			break;
    case "accented":
      content = renderAccentedNode(node, baseProps);
			break;
    // case "matrix":
    //   content = renderMatrixNode(node, baseProps);
		// 	break;
    // case "vector":
    //   content = renderVectorNode(node, baseProps);
		// 	break;
    // case "binom":
    //   content = renderBinomNode(node, baseProps);
		// 	break;
    // case "arrow":
    //   content = renderArrowNode(node, baseProps);
		// 	break;
    // case "cases":
    //   content = renderCasesNode(node, baseProps);
		// 	break;
    case "styled":
      content = renderStyledNode(node, baseProps);
			break;
    // case "multiline":
    //   content = renderMultilineNode(node, baseProps);
		// 	break;
    case "root-wrapper":
      content = renderRootWrapperNode(node, baseProps);
      break;
    default:
      console.warn(`No case match in MathRenderer.`)
      return (
        <span
          className={clsx("math-node", {
            selected: cursor.containerId === node.id,
          })}
        >
          Unsupported node: {node.id}
        </span>
      );
  }
  // Wrap the rendered content in a draggable div
  return (
    <span {...dragHandlers} className="draggable-node-wrapper">
      {content}
    </span>
  );
};
