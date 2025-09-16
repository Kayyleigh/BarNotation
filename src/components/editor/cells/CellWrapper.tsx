// components/editor/cells/CellWrapper.tsx
import React from "react";
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

  return (
    <div
      className={clsx(styles.cell, {
        selected: isSelected,
        preview: editingMode === 'preview',
        dragging: isDragging,
        dragOver: isDragOver,
      })}
      onClick={onSelect}
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
        />
        <div className={styles.cellContent}>
          {/* Children is e.g. <MathCell>, <TextCell> */}
          {children}
        </div>

        <div
          className={clsx(styles.cellTypeInfo, {
            // preview: !isEditMode,
          })}
        >
          {typeLabel}
        </div>
      </div>
    </div>
  );
};
