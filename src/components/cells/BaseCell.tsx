import React, { useState } from "react";
import clsx from "clsx";

export type BaseCellProps = {
  typeLabel: string;
  isSelected: boolean;
  isPreviewMode: boolean;
  onDelete: () => void;
  onClick: () => void;
  toolbarExtras?: React.ReactNode;
  children: React.ReactNode;
  isDragging?: boolean;
  isDragOver?: boolean;
  handlePointerDown?: (e: React.PointerEvent) => void;
};

const BaseCell: React.FC<BaseCellProps> = ({
  typeLabel,
  isSelected,
  isPreviewMode,
  onDelete,
  onClick,
  toolbarExtras,
  children,
  isDragging = false,
  isDragOver = false,
  handlePointerDown,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={clsx("cell", {
        selected: isSelected,
        preview: isPreviewMode,
        dragging: isDragging,
        "drag-over": isDragOver,
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="cell-inner">
        {/* Drag Handle */}
        <div className="drag-handle" onPointerDown={handlePointerDown}>
          ☰
        </div>

        <div className="cell-main-content">
          {/* Toolbar */}
          {(isSelected || hovered) && (
            <div className="cell-toolbar">
              {toolbarExtras}
              <button className="delete-button" onClick={onDelete}>
                🗑️
              </button>
            </div>
          )}

          <div className="cell-content">{children}</div>
          <div className="cell-type-info">{typeLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default BaseCell;
