// import React from "react";
// import clsx from "clsx";
// import type { MathNode, TextStyle } from "../../models/types";
// import type { CursorPosition } from "../../logic/cursor";

// import {
//   renderTextNode,
//   renderInlineContainerNode,
//   renderFractionNode,
//   renderGroupNode,
//   renderChildedNode,
//   renderAccentedNode,
//   renderStyledNode,
//   renderCommandInputNode,
//   renderMultiDigitNode,
//   renderBigOperatorNode,
//   renderRootWrapperNode,
//   renderNthRootNode,
// } from "./MathRenderers";

// export type MathRendererProps = {
//   node: MathNode;
//   isActive: boolean;
//   cursor: CursorPosition;
//   dropTargetCursor: CursorPosition;
//   hoveredId?: string;
//   onCursorChange: (cursor: CursorPosition) => void;  
//   onRootChange: (newRoot: MathNode) => void;
//   onHoverChange: (hoveredId?: string) => void;

//   // Drag-and-drop handlers
//   onStartDrag: (nodeId: string) => void;
//   onUpdateDropTarget: (targetId: string, targetIndex: number) => void;
//   onHandleDrop: () => void;
//   onClearDrag: () => void;

//   parentContainerId?: string;
//   ancestorIds?: string[];
//   index?: number;
//   inheritedStyle?: TextStyle;
// };

// export const MathRenderer: React.FC<MathRendererProps> = ({
//   node,
//   isActive,
//   cursor,
//   dropTargetCursor,
//   hoveredId,
//   onCursorChange,
//   onHoverChange,
//   onRootChange,
//   onStartDrag,
//   onUpdateDropTarget,
//   onHandleDrop,
//   onClearDrag,
//   parentContainerId,
//   ancestorIds,
//   index,
//   inheritedStyle = { fontStyling: { fontStyle: "normal", fontStyleAlias: "" } },
// }) => {

//   const dragHandlers = {
//     draggable: true,
//     onDragStart: (e: React.DragEvent) => {
//       e.stopPropagation();
//       onStartDrag(node.id);
//     },
//     onDragOver: (e: React.DragEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       onUpdateDropTarget(node.id, index ?? 0);
//     },
//     onDrop: (e: React.DragEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       onHandleDrop();
//     },
//     onDragEnd: () => {
//       onClearDrag();
//     },
//   };

//   const baseProps = { isActive, cursor, dropTargetCursor, hoveredId, onCursorChange, onHoverChange, onRootChange, onStartDrag, onUpdateDropTarget, onHandleDrop, onClearDrag, parentContainerId, ancestorIds, index, inheritedStyle };

//   let content;

//   switch (node.type) {
//     case "text":
//       content = renderTextNode(node, baseProps);
// 			break;
//     case "multi-digit":
//       content = renderMultiDigitNode(node, baseProps);
// 			break;
//     case "command-input":
//       content = renderCommandInputNode(node, baseProps);
// 			break;
//     case "inline-container":
//       content = renderInlineContainerNode(node, baseProps);
// 			break;
//     case "group":
//       content = renderGroupNode(node, baseProps);
// 			break;
//     case "fraction":
//       content = renderFractionNode(node, baseProps);
// 			break;
//     case "nth-root":
//       content = renderNthRootNode(node, baseProps);
// 			break;
//     case "big-operator":
//       content = renderBigOperatorNode(node, baseProps);
// 			break;
//     case "childed":
//       content = renderChildedNode(node, baseProps);
// 			break;
//     case "accented":
//       content = renderAccentedNode(node, baseProps);
// 			break;
//     // case "matrix":
//     //   content = renderMatrixNode(node, baseProps);
// 		// 	break;
//     // case "vector":
//     //   content = renderVectorNode(node, baseProps);
// 		// 	break;
//     // case "binom":
//     //   content = renderBinomNode(node, baseProps);
// 		// 	break;
//     // case "arrow":
//     //   content = renderArrowNode(node, baseProps);
// 		// 	break;
//     // case "cases":
//     //   content = renderCasesNode(node, baseProps);
// 		// 	break;
//     case "styled":
//       content = renderStyledNode(node, baseProps);
// 			break;
//     // case "multiline":
//     //   content = renderMultilineNode(node, baseProps);
// 		// 	break;
//     case "root-wrapper":
//       content = renderRootWrapperNode(node, baseProps);
//       break;
//     default:
//       console.warn(`No case match in MathRenderer.`)
//       return (
//         <span
//           className={clsx("math-node", {
//             selected: cursor.containerId === node.id,
//           })}
//         >
//           Unsupported node: {node.id}
//         </span>
//       );
//   }
  
//   const isDropTarget = dropTargetCursor.containerId === node.id && dropTargetCursor.index === index;

//   // Wrap the rendered content in a draggable div
//   return (
//     <span {...dragHandlers} className="draggable-node-wrapper">
//       {content}
//         {isDropTarget && (
//         <span className="drop-target-cursor" />
//       )}
//     </span>
//   );
// };

import React from "react";
import clsx from "clsx";
import type { MathNode, TextStyle } from "../../models/types";
import { useDragContext } from "../../hooks/useDragContext";
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
import type { CursorPosition } from "../../logic/cursor";

export type MathRendererProps = {
  node: MathNode;
  cellId: string;
  isActive: boolean;
  cursor: CursorPosition;
  hoveredId?: string;
  containerId: string;
  index: number;
  inheritedStyle?: TextStyle;
  onCursorChange: (pos: CursorPosition) => void;
  onHoverChange: (id: string | undefined) => void;
  onDropNode: (
    from: {
      sourceType: "cell" | "library";
      cellId?: string;
      containerId: string;
      index: number;
      node: MathNode;
    },
    to: {
      cellId: string;
      containerId: string;
      index: number;
    }
  ) => void;
  ancestorIds: string[];
};

export type BaseRenderProps = {
  inheritedStyle: TextStyle;
  containerId: string;
  index: number;
  cursor: CursorPosition;
  hoveredId?: string;
  onCursorChange: (pos: CursorPosition) => void;
  onHoverChange: (id: string | undefined) => void;
  cellId: string;
  isActive: boolean;
  onDropNode: MathRendererProps["onDropNode"];
  ancestorIds: string[];
};

export const MathRenderer: React.FC<MathRendererProps> = ({
  node,
  cellId,
  isActive,
  containerId,
  index,
  inheritedStyle = { fontStyling: { fontStyle: "normal", fontStyleAlias: "" } },
  cursor,
  hoveredId,
  onCursorChange,
  onHoverChange,
  onDropNode,
  ancestorIds,
}) => {
  const { draggingNode, setDraggingNode, dropTarget, setDropTarget } = useDragContext();

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggingNode({
      sourceType: "cell",
      cellId,
      containerId,
      index,
      node,
    });
  };
  
  const handleDragEnd = () => {
    setDraggingNode(null);
    setDropTarget(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  
    setDropTarget({
      cellId,
      containerId,
      index,
    });
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingNode) return;
  
    onDropNode(draggingNode, {
      cellId,
      containerId,
      index,
    });
  
    setDraggingNode(null);
    setDropTarget(null);
  };

  const baseRenderProps: BaseRenderProps = {
    inheritedStyle,
    containerId,
    index,
    cursor,
    hoveredId,
    onCursorChange,
    onHoverChange,
    cellId,
    isActive,
    onDropNode,
    ancestorIds,
  };

  const newAncestorIds = [node.id, ...(baseRenderProps.ancestorIds ?? [])];

  const props = {
    ...baseRenderProps,
    ancestorIds: newAncestorIds,
    node,
  };

  let content: React.ReactNode;
  switch (node.type) {
    case "text":
      content = renderTextNode(node, props);
      break;
    case "multi-digit":
      content = renderMultiDigitNode(node, props);
      break;
    case "command-input":
      content = renderCommandInputNode(node, props);
      break;
    case "inline-container":
      content = renderInlineContainerNode(node, props);
      break;
    case "group":
      content = renderGroupNode(node, props);
      break;
    case "fraction":
      content = renderFractionNode(node, props);
      break;
    case "nth-root":
      content = renderNthRootNode(node, props);
      break;
    case "big-operator":
      content = renderBigOperatorNode(node, props);
      break;
    case "childed":
      content = renderChildedNode(node, props);
      break;
    case "accented":
      content = renderAccentedNode(node, props);
      break;
    case "styled":
      content = renderStyledNode(node, props);
      break;
    case "root-wrapper":
      content = renderRootWrapperNode(node, props);
      break;
    default:
      console.warn(`No case match for MathNode type: ${node.type}`);
      return (
        <span className="math-node unsupported">Unsupported node: {node.id}</span>
      );
  }

  const isDropTarget =
    node.type !== "root-wrapper" && node.type !== "inline-container" &&
    dropTarget?.cellId === cellId && 
    dropTarget?.containerId === containerId && 
    dropTarget?.index === index;

  const isDraggable = node.type !== "root-wrapper";

  return (
    <span
      className={clsx("draggable-node-wrapper")}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-nodeid={node.id}
    >
      {content}
      {isDropTarget && <span className="drop-target-cursor" />}
    </span>
  );
};