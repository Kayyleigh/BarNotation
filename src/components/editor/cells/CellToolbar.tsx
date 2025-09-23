// components/editor/cells/CellToolbar.tsx
import React from "react";
import styles from "./CellToolbar.module.css";
import clsx from "clsx";
import Tooltip from "../../tooltips/Tooltip";
import { useI18n } from "../../../i18n/useI18n";

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
}) => {
  const { t } = useI18n();

  return (
    <div
      className={clsx(styles.cellToolbar, {
        [styles.visible]: visible,
      })}
    >
      <Tooltip text={t("cellToolbar.deleteTooltip")}>
        <button
          className={clsx(styles.button, styles.deleteButton)}
          onClick={onDelete}
          aria-label={t("cellToolbar.delete")} // accessibility
        >
          🗑️
        </button>
      </Tooltip>

      <Tooltip text={t("cellToolbar.duplicateTooltip")}>
        <button
          className={styles.button}
          onClick={onDuplicate}
          aria-label={t("cellToolbar.duplicate")}
        >
          {t("cellToolbar.duplicate")}
        </button>
      </Tooltip>

      {extras}
    </div>
  );
};
