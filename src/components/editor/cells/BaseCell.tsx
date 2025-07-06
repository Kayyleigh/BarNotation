import React, { useState } from "react";
import clsx from "clsx";
import Tooltip from "../../tooltips/Tooltip";
import { useEditorMode } from "../../../hooks/useEditorMode";

export type BaseCellProps = {
  typeLabel: string;
  isSelected: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
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
  onDelete,
  onDuplicate,
  onClick,
  toolbarExtras,
  children,
  isDragging = false,
  isDragOver = false,
  handlePointerDown,
}) => {
  const { mode } = useEditorMode();
  const isEditMode = mode === "edit";

  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={clsx("cell", {
        selected: isSelected,
        preview: !isEditMode,
        dragging: isDragging,
        "drag-over": isDragOver,
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="cell-margin">
        {isSelected && <div className="selected-indicator" />}
        <div className="drag-spot" onPointerDown={handlePointerDown} />
      </div>

      <div className="cell-inner">
        <div className="cell-main-content">
          {(isSelected || hovered) && (
            <div className="cell-toolbar">
              {toolbarExtras}
              <Tooltip text="Duplicate cell">
                <button className={clsx("button")} onClick={onDuplicate}>
                  Duplicate
                </button>
              </Tooltip>
              <Tooltip text="Delete cell">
                <button className={clsx("button", "delete-button")} onClick={onDelete}>
                  🗑️
                </button>
              </Tooltip>
            </div>
          )}

          <div className="cell-content">{children}</div>
          <div className="cell-type-info">{typeLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BaseCell);
