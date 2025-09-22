// components/editor/cells/CellToolbar.tsx
import React from "react";
import styles from "./CellToolbar.module.css";
import clsx from "clsx";

interface CellToolbarProps {
  onDelete: () => void;
  onDuplicate: () => void;
  extras?: React.ReactNode;
  visible?: boolean;
}

export const CellToolbar: React.FC<CellToolbarProps> = ({
  onDelete,
  onDuplicate,
  extras,
  visible = false,
}) => (
  <div
    className={clsx(styles.cellToolbar, {
      [styles.visible]: visible,
    })}
  >
    <button className={clsx(styles.button, styles.deleteButton)} onClick={onDelete}>
      🗑️
    </button>
    <button className={styles.button} onClick={onDuplicate}>
      Duplicate
    </button>
    {extras}
  </div>
);
