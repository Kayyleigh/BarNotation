// components/mathExpression/shared/useMathDrag.ts
import React from "react";
import { MathNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps } from "../MathRenderer";
import { useDragReader, useDragWriter } from "../../../hooks/mathDrag/useDragContext";
import { nodeToLatex } from "../../../models/nodeToLatex";

/**
 * Hook to attach drag-and-drop behavior for math nodes.
 * Usage: const drag = useMathDrag(baseProps, node);
 * Then spread: <span {...drag}>...</span>
 */
export function useMathDrag(baseProps: CoreRenderProps & { node: MathNode }) {
  const { draggingSource, dropTarget } = useDragReader();
  const { setDraggingSource, setDropTarget } = useDragWriter();

  const { cellId, containerId, index, node, onDropNode } = baseProps;

  const handleDragStart = React.useCallback((e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData("text/plain", nodeToLatex(node));
    setDraggingSource({
      type: "cell",
      cellId,
      containerId,
      index,
      node,
    });
  }, [cellId, containerId, index, node, setDraggingSource]);

  const handleDragEnd = React.useCallback(() => {
    setDraggingSource(null);
    setDropTarget(null);
  }, [setDraggingSource, setDropTarget]);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    if (e.currentTarget !== e.target) return; // only deepest element
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({
      type: "cell",
      cellId,
      containerId,
      index,
    });
    if (draggingSource?.type === "cell" && draggingSource.cellId === cellId) {
      e.dataTransfer.dropEffect = "move";
    } 
    else {
      e.dataTransfer.dropEffect = "copy"
    }
  }, [cellId, containerId, draggingSource, index, setDropTarget]);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingSource) return;
    onDropNode(draggingSource, {
      type: "cell",
      cellId,
      containerId,
      index,
    });
    setDraggingSource(null);
    setDropTarget(null);
  }, [draggingSource, onDropNode, cellId, containerId, index, setDraggingSource, setDropTarget]);

  const isDropTarget =
    baseProps.node.type !== "inline-container" &&
    dropTarget?.type === "cell" &&
    dropTarget.cellId === baseProps.cellId &&
    dropTarget.containerId === baseProps.containerId &&
    dropTarget.index === baseProps.index;

  return {
    drag: {
      draggable: cellId !== "readonly" && node.type !== "root-wrapper",
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
    isDropTarget,
  };
}
