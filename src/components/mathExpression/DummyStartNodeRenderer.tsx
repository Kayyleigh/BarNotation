// components/DummyStartNodeRenderer.tsx
import React from "react";
import clsx from "clsx";
import type { CursorPosition } from "../../logic/cursor";
import { useDragContext } from "../../hooks/useDragContext";
import type { DropTarget } from "../layout/EditorWorkspace";
import type { DragSource } from "../../hooks/DragContext";
import { handleMouseEnter, handleMouseLeave } from "../../utils/mathHoverUtils";

type Props = {
  containerId: string;
  cellId: string;
  isActive: boolean;
  cursor: CursorPosition;
  hoverPath: string[]; 
  onCursorChange: (pos: CursorPosition) => void;
  setHoverPath: (path: string[]) => void;
  onDropNode: (
    from: DragSource,
    to: DropTarget,
  ) => void;
  ancestorIds: string[];
};

export const DummyStartNodeRenderer: React.FC<Props> = ({
  containerId,
  cellId,
  hoverPath,
  onCursorChange,
  setHoverPath,
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
          hovered: hoverPath[hoverPath.length - 1] === containerId,    
        })}
        onClick={(e) => {
          e.stopPropagation();
          onCursorChange({ containerId, index: 0 });
        }}
        onMouseEnter={() => handleMouseEnter([...ancestorIds], setHoverPath)}
        onMouseLeave={(e) =>
          handleMouseLeave(e, ancestorIds, setHoverPath)
        }
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
