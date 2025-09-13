// components/editor/cells/InsertCellButtons.tsx
import React, { useState, useCallback } from "react";
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
  isPermanent = false
}) => {
  const { mode } = useEditorMode();
  const { t } = useI18n(); // use language hook

  const isLocked = mode === "locked";
  const isEdit = mode === "edit";

  const [hovered, setHovered] = useState(false);

  const show = (isPermanent && isEdit) || hovered;

  const handleMouseEnter = !isPermanent ? () => setHovered(true) : undefined;
  const handleMouseLeave = !isPermanent ? () => setHovered(false) : undefined;

  // TODO make generic??
  const handleInsert = useCallback(
    (type: "math" | "text") => {
      if (!isLocked) onInsert(type);
    },
    [isLocked, onInsert]
  );

  return (
    <div
      className={clsx(styles.insertZone, {
        [styles.dragOver]: isDropTarget,
      })}
      onPointerEnter={handlePointerEnter}
    >
      <div
        className={clsx(styles.addButtons, styles.insertBetween, { [styles.visible]: show })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ pointerEvents: isLocked ? "none" : "auto" }}
        aria-hidden={isLocked}
      >
        <Tooltip text={isLocked ? t("editor.lockedAdd") : t("editor.addMath")}>
          <button
            className={clsx(styles.mathCellButton, "button")}
            onClick={() => handleInsert("math")}
            disabled={isLocked}
            type="button"
          >
            + {t("editor.math")}
          </button>
        </Tooltip>

        <Tooltip text={isLocked ? t("editor.lockedAdd") : t("editor.addText")}>
          <button
            className={clsx(styles.textCellButton, "button")}
            onClick={() => handleInsert("text")}
            disabled={isLocked}
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
