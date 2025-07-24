// components/mathExpression/MathRenderer.tsx
import React, { useMemo } from "react";
import clsx from "clsx";
import type { MathNode, TextStyle } from "../../models/types";
import { useDragContext } from "../../hooks/mathDrag/useDragContext";
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
import type { DropTarget } from "../layout/EditorWorkspace";
import type { DragSource } from "../../hooks/mathDrag/DragContext";
import type { EditorState } from "../../logic/editor-state";

export type MathRendererProps = {
  node: MathNode;
  cellId: string;
  isActive: boolean;
  cursor: CursorPosition;
  hoverPath: string[]; 
  containerId: string;
  index: number;
  inheritedStyle: TextStyle;
  onCursorChange: (pos: CursorPosition) => void;
  setHoverPath: (path: string[]) => void;
  onDropNode: (
    from: DragSource,
    to: DropTarget,
  ) => void;
  ancestorIds: string[];
  showPlaceholder?: boolean;
  updateEditorState: (newState: EditorState) => void;
  editorState: EditorState;
};

export type BaseRenderProps = {
  inheritedStyle: TextStyle;
  containerId: string;
  index: number;
  cursor: CursorPosition;
  hoverPath: string[]; 
  onCursorChange: (pos: CursorPosition) => void;
  setHoverPath: (path: string[]) => void;
  cellId: string;
  isActive: boolean;
  onDropNode: MathRendererProps["onDropNode"];
  ancestorIds: string[];
  showPlaceholder?: boolean;
  updateEditorState: (newState: EditorState) => void;
  editorState: EditorState;
};

const InnerMathRenderer: React.FC<MathRendererProps> = ({
  node,
  cellId,
  isActive,
  containerId,
  index,
  inheritedStyle,
  cursor,
  hoverPath,
  setHoverPath,
  onCursorChange,
  onDropNode,
  ancestorIds,
  showPlaceholder,
  editorState,
  updateEditorState
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
    setDropTarget({ cellId, containerId, index });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingNode) return;
    console.log(`in MathRenderer 481 handleDrop`) //This stuff is deleted on refresh unless more input 

    let dropContainerId = containerId;
    let dropIndex = index;

    if (node.type === "root-wrapper" && node.child) {
      dropContainerId = node.child.id;
      dropIndex = node.child.children.length - 1;
    }

    onDropNode(draggingNode, {
      cellId,
      containerId: dropContainerId,
      index: dropIndex,
    });

    setDraggingNode(null);
    setDropTarget(null);
  };

  const baseRenderProps: BaseRenderProps = {
    inheritedStyle,
    containerId,
    index,
    cursor,
    hoverPath,
    onCursorChange,
    setHoverPath,
    cellId,
    isActive,
    onDropNode,
    ancestorIds,
    showPlaceholder,
    editorState,
    updateEditorState
  };

  const newAncestorIds = useMemo(() => [...(ancestorIds), node.id], [ancestorIds, node.id]);

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
    node.type !== "inline-container" &&
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

function areEqual(prev: MathRendererProps, next: MathRendererProps) {
  //TODO AVOID UNNECESSARY RERENDERS DUE TO EDITORSTATE CHANGING
  const nodeId = prev.node.id;

  const prevHoverPath = prev.hoverPath;
  const nextHoverPath = next.hoverPath;

  const prevHovered = prevHoverPath.includes(nodeId);
  const nextHovered = nextHoverPath.includes(nodeId);

  // Find deepest hovered node in previous and next paths (last element)
  const prevDeepestHovered = prevHoverPath[prevHoverPath.length - 1];
  const nextDeepestHovered = nextHoverPath[nextHoverPath.length - 1];

  // Determine if the deepest hovered node changed (means hover moved)
  const deepestHoveredChanged = prevDeepestHovered !== nextDeepestHovered;

  // We want to re-render if:
  // - The node's other props changed (same as before)
  // - OR the hover inclusion changed for this node (true -> false or false -> true)
  // - OR the deepest hovered node changed AND this node is ancestor or equal to either prev or next deepest hovered node

  // Helper: Is node ancestor or equal to hovered node? 
  // Since hoverPath is from root to hovered node, this is true if nodeId is in hoverPath.
  const wasAncestorOfPrev = prevHovered; // nodeId in prevHoverPath
  const isAncestorOfNext = nextHovered; // nodeId in nextHoverPath

  // Should rerender if hover moved within this node's subtree
  const hoverMovedWithinSubtree = deepestHoveredChanged && (wasAncestorOfPrev || isAncestorOfNext);

  const propsAreEqual =
    prev.node === next.node &&
    prev.cellId === next.cellId &&
    prev.containerId === next.containerId &&
    prev.index === next.index &&
    prev.isActive === next.isActive &&
    prev.cursor === next.cursor &&
    prev.inheritedStyle === next.inheritedStyle &&
    prev.ancestorIds === next.ancestorIds;

  // Return true (skip re-render) only if props equal AND hover didn't move within this node's subtree AND hover inclusion unchanged
  return propsAreEqual && !hoverMovedWithinSubtree && prevHovered === nextHovered;
}

// Memoized version
export const MathRenderer = React.memo(InnerMathRenderer, areEqual);