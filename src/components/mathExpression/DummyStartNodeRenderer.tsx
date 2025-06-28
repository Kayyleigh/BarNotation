// components/DummyStartNodeRenderer.tsx
import React from "react";
import clsx from "clsx";
import type { CursorPosition } from "../../logic/cursor";
import { useDragContext } from "../../hooks/useDragContext";
import type { MathNode } from "../../models/types";

type Props = {
  containerId: string;
  cellId: string;
  isActive: boolean;
  cursor: CursorPosition;
  hoveredId?: string;
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

export const DummyStartNodeRenderer: React.FC<Props> = ({
  containerId,
  cellId,
  hoveredId,
  onCursorChange,
  onHoverChange,
  onDropNode,
  ancestorIds,
}) => {
  const { draggingNode, setDraggingNode, dropTarget, setDropTarget } = useDragContext();

  const isDropTarget =
    dropTarget?.cellId === cellId && 
    dropTarget?.containerId === containerId && 
    dropTarget?.index === -1;

  return (
    <span>
      <span
        className={clsx("start-interaction-point", {
          hovered: hoveredId === containerId,    
        })}
        onClick={(e) => {
          e.stopPropagation();
          onCursorChange({ containerId, index: 0 });
        }}
        onMouseEnter={() => onHoverChange(containerId)}
        onMouseLeave={(e) => {
          const related = e.relatedTarget as HTMLElement;
          const isInsideAncestor = ancestorIds.some((id) =>
            related?.closest?.(`[data-nodeid="${id}"]`)
          );
          if (!isInsideAncestor) {
            onHoverChange(undefined);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDropTarget({ cellId, containerId, index: -1 });
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!draggingNode) return;
          onDropNode(draggingNode, { cellId, containerId, index: -1 });
          setDraggingNode(null);
          setDropTarget(null);
        }}
      />
      {isDropTarget && <span className="drop-target-cursor" />}
    </span>
  );
};
