// components/mathExpression/MathRenderer.tsx
import React from "react";
import type { MathNode, TextStyle } from "../../models/mathNodeTypes";
import {
  renderTextNode,
  renderInlineContainerNode,
  renderFractionNode,
  renderGroupNode,
  renderChildedNode,
  renderStyledNode,
  renderMultiDigitNode,
  renderBigOperatorNode,
  renderRootWrapperNode,
  renderNthRootNode,
  renderDecoratedNode,
  renderOverUndersetNode,
  renderMatrixNode,
} from "./MathRenderers";
import type { CursorPosition } from "../../logic/cursor";
import type { EditorState } from "../../logic/editor-state";
import type { DragSource, DropTarget } from "../../models/dragTypes";
import { CommandInputRenderer } from "./CommandInputRenderer";
import { useDragReader, useDragWriter } from "../../hooks/mathDrag/useDragContext";

export type CoreRenderProps = {
  node: MathNode;
  cellId: string;
  isActive: boolean;
  containerId: string;
  index: number;
  inheritedStyle: TextStyle;
  cursor: CursorPosition;
  hoverPath: string[];
  ancestorIds: string[];
  setHoverPath: (path: string[]) => void;
  onCursorChange: (pos: CursorPosition) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
  showPlaceholder?: boolean;
  updateEditorState: (newState: EditorState) => void;
  editorState: EditorState;
  editorRef?: React.RefObject<HTMLDivElement | null>;
  readOnly?: boolean;
};

function renderNode(node: MathNode, props: CoreRenderProps): React.ReactNode {
  const baseProps = { ...props, ancestorIds: [...props.ancestorIds, node.id] };

  // Decide which recursive renderer to use
  const Renderer = props.readOnly ? ReadOnlyMathRenderer : MathRenderer;

  switch (node.type) {
    case "text":
      return renderTextNode(node, baseProps);
    case "multi-digit":
      return renderMultiDigitNode(node, baseProps, Renderer);
    case "command-input":
      return <CommandInputRenderer node={node} baseProps={baseProps} Renderer={Renderer} />;
    case "inline-container":
      return renderInlineContainerNode(node, baseProps, Renderer);
    case "group":
      return renderGroupNode(node, baseProps, Renderer);
    case "fraction":
      return renderFractionNode(node, baseProps, Renderer);
    case "nth-root":
      return renderNthRootNode(node, baseProps, Renderer);
    case "big-operator":
      return renderBigOperatorNode(node, baseProps, Renderer);
    case "childed":
      return renderChildedNode(node, baseProps, Renderer);
    case "decorated":
      return renderDecoratedNode(node, baseProps, Renderer);
    case "overunderset":
      return renderOverUndersetNode(node, baseProps, Renderer);
    case "styled":
      return renderStyledNode(node, baseProps, Renderer);
    case "matrix":
      return renderMatrixNode(node, baseProps, Renderer);
    case "root-wrapper":
      return renderRootWrapperNode(node, baseProps, Renderer);
    default:
      return <span className="math-node unsupported">Unsupported node: {node.id}</span>;
  }
}

const InnerMathRenderer: React.FC<CoreRenderProps> = (props) => {
  const { draggingSource, dropTarget } = useDragReader();
  const { setDraggingSource, setDropTarget } = useDragWriter();

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggingSource({
      type: "cell",
      cellId: props.cellId,
      containerId: props.containerId,
      index: props.index,
      node: props.node,
    });
  };
  const handleDragEnd = () => {
    setDraggingSource(null);
    setDropTarget(null);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({
      type: "cell",
      cellId: props.cellId,
      containerId: props.containerId,
      index: props.index,
    });
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingSource) return;
    props.onDropNode(draggingSource, {
      type: "cell",
      cellId: props.cellId,
      containerId: props.containerId,
      index: props.index,
    });
    setDraggingSource(null);
    setDropTarget(null);
  };

  const isDraggable = props.cellId !== "readonly" && props.node.type !== "root-wrapper";
  const isDropTarget =
    props.node.type !== "inline-container" &&
    dropTarget?.type === "cell" &&
    dropTarget.cellId === props.cellId &&
    dropTarget.containerId === props.containerId &&
    dropTarget.index === props.index;

  return (
    <span
      className="draggable-node-wrapper"
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-nodeid={props.node.id}
    >
      {renderNode(props.node, props)}
      {isDropTarget && <span className="drop-target-cursor" />}
    </span>
  );
};

export const MathRenderer = React.memo(InnerMathRenderer, areEqual);

function areEqual(prev: CoreRenderProps, next: CoreRenderProps) {
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
  // - The node's other props changed
  // - OR the hover inclusion changed for this node (true -> false or false -> true)
  // - OR the deepest hovered node changed AND this node is ancestor or equal to either prev or next deepest hovered node

  // Helper: Is node ancestor or equal to hovered node? 
  // Since hoverPath is from root to hovered node, this is true if nodeId is in hoverPath.
  const wasAncestorOfPrev = prevHovered; // nodeId in prevHoverPath
  const isAncestorOfNext = nextHovered; // nodeId in nextHoverPath

  // Should rerender if hover moved within this node's subtree
  const hoverMovedWithinSubtree = deepestHoveredChanged && (wasAncestorOfPrev || isAncestorOfNext);

  const ancestorIdChanged = prev.ancestorIds[prev.ancestorIds.length - 1] !== next.ancestorIds[next.ancestorIds.length - 1];

  const propsAreEqual =
    prev.node === next.node &&
    prev.cellId === next.cellId &&
    prev.containerId === next.containerId &&
    prev.index === next.index &&
    prev.isActive === next.isActive &&
    prev.cursor === next.cursor &&
    prev.inheritedStyle === next.inheritedStyle &&
    !ancestorIdChanged;

  // Return true (skip re-render) only if props equal AND hover didn't move within this node's subtree AND hover inclusion unchanged
  return propsAreEqual && !hoverMovedWithinSubtree && prevHovered === nextHovered;
}

// Memoized version
// export const MathRenderer = React.memo(InnerMathRenderer, areEqual);

const InnerReadOnlyMathRenderer: React.FC<CoreRenderProps> = (props) => {
  return <>{renderNode(props.node, props)}</>;
};

export const ReadOnlyMathRenderer = React.memo(InnerReadOnlyMathRenderer, areEqual);
