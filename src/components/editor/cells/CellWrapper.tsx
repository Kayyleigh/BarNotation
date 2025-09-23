// components/editor/cells/CellWrapper.tsx
import React, { useState } from "react";
import styles from "./cell.module.css";
import { CellToolbar } from "./CellToolbar";
import clsx from "clsx";
import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";

interface CellWrapperProps {
  id: string;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  draggableProps: {
    onPointerDown?: (e: React.PointerEvent) => void;
  };
  toolbarExtras?: React.ReactNode;
  children: React.ReactNode;
  showLatex?: boolean;
  latex?: string;
  typeLabel: string;
}

export const CellWrapper: React.FC<CellWrapperProps> = ({
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
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

  return (
    <div
      className={clsx(styles.cell, {
        selected: isSelected,
        preview: editingMode === "preview",
        dragging: isDragging,
        dragOver: isDragOver,
      })}
      onFocus={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.cellMargin} {...draggableProps}>
        {isSelected && <div className={styles.selectedIndicator} />}
        <div className={styles.dragSpot} onPointerDown={draggableProps.onPointerDown} />
      </div>

      <div className={clsx(styles.cellInner, styles.cellMainContent)}>
        <CellToolbar
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          extras={toolbarExtras}
          visible={showToolbar}
        />

        <div className={styles.cellContent}>{children}</div>

        <div className={styles.cellTypeInfo}>
          {typeLabel}
        </div>
      </div>
    </div>
  );
};
