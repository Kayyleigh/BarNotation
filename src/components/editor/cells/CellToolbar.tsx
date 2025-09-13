// components/editor/cells/CellToolbar.tsx
import React from "react";
import styles from "./CellToolbar.module.css";
import clsx from "clsx";

interface CellToolbarProps {
  onDelete: () => void;
  onDuplicate: () => void;
  extras?: React.ReactNode;
}

export const CellToolbar: React.FC<CellToolbarProps> = ({
  onDelete,
  onDuplicate,
  extras,
}) => (
  <div className={styles.cellToolbar}>
    <button className={clsx(styles.button, styles.deleteButton)} onClick={onDelete}>🗑️</button>
    <button className={styles.button} onClick={onDuplicate}>Duplicate</button>
    {extras}
  </div>
);
