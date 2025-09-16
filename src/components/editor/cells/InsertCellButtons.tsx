// components/editor/cells/InsertCellButtons.tsx
import React from "react";
import clsx from "clsx";
import Tooltip from "../../tooltips/Tooltip";
import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";
import styles from "../Editor.module.css";
import { useI18n } from "../../../i18n/useI18n";

interface InsertCellButtonsProps {
  onInsert: (type: "math" | "text") => void;
  handlePointerEnter: React.PointerEventHandler<HTMLDivElement>;
  isDropTarget?: boolean;
  isPermanent?: boolean;
}

const InsertCellButtons: React.FC<InsertCellButtonsProps> = ({
  onInsert,
  handlePointerEnter,
  isDropTarget = false,
  isPermanent = false,
}) => {
  const { editingMode } = useEditorMode();
  const { t } = useI18n();

  const isEdit = editingMode === "edit";

  // Show permanently if in edit + isPermanent, otherwise rely on CSS hover
  const alwaysVisible = isPermanent && isEdit;

  return (
    <div
      className={clsx(styles.insertZone, {
        [styles.dragOver]: isDropTarget,
      })}
      onPointerEnter={handlePointerEnter}
    >
      <div
        className={clsx(styles.addButtons, styles.insertBetween, {
          [styles.visible]: alwaysVisible,
        })}
      >
        <Tooltip text={t("editor.addMath")}>
          <button
            className={clsx(styles.mathCellButton, "button")}
            onClick={() => onInsert("math")}
            type="button"
          >
            + {t("editor.math")}
          </button>
        </Tooltip>

        <Tooltip text={t("editor.addText")}>
          <button
            className={clsx(styles.textCellButton, "button")}
            onClick={() => onInsert("text")}
            type="button"
          >
            + {t("editor.text")}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default React.memo(InsertCellButtons);
