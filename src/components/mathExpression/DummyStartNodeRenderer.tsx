// DummyStartNodeRenderer.tsx
import React from "react";
import clsx from "clsx";
import type { CursorPosition } from "../../logic/cursor";
import { handleMouseEnter, handleMouseLeave } from "../../utils/mathHoverUtils";
import type { DragSource, DropTarget } from "../../models/dragTypes";
import { useDragReader, useDragWriter } from "../../hooks/mathDrag/useDragContext";

type Props = {
  containerId: string;
  cellId: string;
  isActive: boolean;
  cursor: CursorPosition;
  hoverPath: string[];
  onCursorChange: (pos: CursorPosition) => void;
  setHoverPath: (path: string[]) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
  ancestorIds: string[];
  focusEditor: () => void
};

const DummyStartNodeRenderer: React.FC<Props> = ({
  containerId,
  cellId,
  hoverPath,
  onCursorChange,
  setHoverPath,
  onDropNode,
  ancestorIds,
  focusEditor,
}) => {
  const { draggingSource, dropTarget } = useDragReader();
  const { setDraggingSource, setDropTarget } = useDragWriter();

  const isDropTarget =
    dropTarget?.type === "cell" &&
    dropTarget?.cellId === cellId &&
    dropTarget?.containerId === containerId &&
    dropTarget?.index === -1;


  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only set cursor if the node is inside an active container
    if (containerId != null && onCursorChange) {
      onCursorChange({ containerId, index: 0 });
      requestAnimationFrame(() => focusEditor());
    }
  };

  return (
    <>
      <span
        className={clsx("start-interaction-point", {
          hovered: hoverPath[hoverPath.length - 1] === containerId,
        })}
        onClick={handleClick}
        onMouseEnter={() => handleMouseEnter([...ancestorIds], setHoverPath)}
        onMouseLeave={(e) => handleMouseLeave(e, ancestorIds, setHoverPath)}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDropTarget({ type: "cell", cellId, containerId, index: -1 });
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!draggingSource) return;
          onDropNode(draggingSource, { type: "cell", cellId, containerId, index: -1 });
          setDraggingSource(null);
          setDropTarget(null);
        }}
      />
      {isDropTarget && <span className="drop-target-cursor" />}
    </>
  );
};

export default React.memo(DummyStartNodeRenderer);
