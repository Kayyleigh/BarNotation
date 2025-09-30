// components/editor/cells/CellWrapper.tsx
import React, { useState, useCallback } from "react";
import styles from "./cell.module.css";
import { CellToolbar } from "./CellToolbar";
import clsx from "clsx";
import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";
import { SelectCellOptions } from "./CellRenderer";

interface CellWrapperProps {
  id: string;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: (opts?: SelectCellOptions | null) => void;
  onDeselect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  draggableProps?: {
    onPointerDown?: (e: React.PointerEvent) => void;
  };
  toolbarExtras?: React.ReactNode;
  children: React.ReactNode;
  showLatex?: boolean;
  latex?: string;
  typeLabel: string;
}

export const CellWrapper: React.FC<CellWrapperProps> = React.memo(({
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
  onDeselect,
  onDelete,
  onDuplicate,
  draggableProps,
  toolbarExtras,
  children,
  typeLabel,
}) => {
  const { editingMode } = useEditorMode();
  const [hovered, setHovered] = useState(false);

  const showToolbar = isSelected || (editingMode === "edit" && hovered);

  // Memoized handlers to avoid inline functions
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handlePointerDown = draggableProps?.onPointerDown;

  return (
    <div
      className={clsx(styles.cell, {
        selected: isSelected,
        preview: editingMode === "preview",
        dragging: isDragging,
        dragOver: isDragOver,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.cellMargin}>
        {isSelected && <div className={styles.selectedIndicator} />}
        <div className={styles.dragSpot} onPointerDown={handlePointerDown} />
      </div>

      <div
        className={clsx(styles.cellInner, styles.cellMainContent)}
        onClick={(e) => {
          // Only select cell if the click wasn't inside math content
          if ((e.target as HTMLElement).closest(".math-node")) {
            return; // math-node clicks handle cursor separately
          }
          onSelect({});
        }}
        onBlur={(e) => {
          const nextTarget = e.relatedTarget as HTMLElement | null;
          if (nextTarget && e.currentTarget.contains(nextTarget)) {
            // Focus moved inside the same cell → ignore
            return;
          }
          if (isSelected) {
            onDeselect();
          }
        }}
      >
        <CellToolbar
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          extras={toolbarExtras}
          visible={showToolbar}
        />
        <div className={styles.cellContent}>{children}</div>
        <div className={styles.cellTypeInfo}>{typeLabel}</div>
      </div>
    </div>
  );
});

CellWrapper.displayName = "CellWrapper";
