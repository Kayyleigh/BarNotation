// components/editor/cells/BaseCell.tsx
import React, { useState } from "react";
import clsx from "clsx";
import Tooltip from "../../tooltips/Tooltip";
import styles from "./cell.module.css";
import editorStyles from "../Editor.module.css";
import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";
import { useI18n } from "../../../i18n/useI18n";

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
  const { t } = useI18n(); // use language hook

  const isEditMode = mode === "edit";
  const isLockedMode = mode === "locked";

  const [hovered, setHovered] = useState(false);

  const showToolbar = !isLockedMode && (isSelected || (isEditMode && hovered));
  const allowClick = !isLockedMode;

  const onMouseEnter = isEditMode ? () => setHovered(true) : undefined;
  const onMouseLeave = isEditMode ? () => setHovered(false) : undefined;
  const onClickHandler = allowClick ? onClick : undefined;

  return (
    <div
      className={clsx(styles.cell, {
        selected: isSelected && !isLockedMode,
        preview: !isEditMode,
        dragging: isDragging && !isLockedMode,
        dragOver: isDragOver && !isLockedMode,
        locked: isLockedMode,
      })}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClickHandler}
    >
      {!isLockedMode && (
        <Tooltip text={t("editor.cell.drag")}>
          <div className={styles.cellMargin}>
            {isSelected && <div className={styles.selectedIndicator} />}
            <div className={styles.dragSpot} onPointerDown={handlePointerDown} />
          </div>
        </Tooltip>
      )}

      <div
        className={clsx(styles.cellInner, {
          preview: !(isEditMode),
        })}
      >
        <div className={styles.cellMainContent}>
          {showToolbar && (
            <div className={styles.cellToolbar}>
              {toolbarExtras}
              <Tooltip text={t("editor.cell.duplicate")}>
                <button
                  className={editorStyles.cellToolbarButton}
                  onClick={onDuplicate}
                  type="button"
                >
                  {t("editor.cell.duplicateBtn")}
                </button>
              </Tooltip>
              <Tooltip text={t("editor.cell.delete")}>
                <button
                  className={clsx(editorStyles.cellToolbarButton, editorStyles.deleteButton)}
                  onClick={onDelete}
                  type="button"
                >
                  🗑️
                </button>
              </Tooltip>
            </div>
          )}
          <div className={styles.cellContent}>{children}</div>
          <div
            className={clsx(styles.cellTypeInfo, {
              preview: !isEditMode,
            })}
          >
            {typeLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BaseCell);
