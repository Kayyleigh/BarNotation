import React, { useState, useCallback, memo } from "react";
import clsx from "clsx";
import Tooltip from "../../tooltips/Tooltip";
import { useEditorMode } from "../../../hooks/useEditorMode";
import styles from "../Editor.module.css";

interface InsertCellButtonsProps {
  onInsert: (type: "math" | "text") => void;
  isPermanent?: boolean;
}

const InsertCellButtons: React.FC<InsertCellButtonsProps> = ({
  onInsert,
  isPermanent = false
}) => {
  console.warn(`Rendering cell buttons (${isPermanent})`)

  const { mode } = useEditorMode();
  const isLocked = mode === "locked";
  const isEdit = mode === "edit";

  const [hovered, setHovered] = useState(false);

  const show = (isPermanent && isEdit) || hovered;

  const handleMouseEnter = !isPermanent ? () => setHovered(true) : undefined;
  const handleMouseLeave = !isPermanent ? () => setHovered(false) : undefined;

  const handleInsert = useCallback(
    (type: "math" | "text") => {
      if (!isLocked) onInsert(type);
    },
    [isLocked, onInsert]
  );

  return (
    <div
      className={clsx(styles.addButtons, styles.insertBetween, { [styles.visible]: show })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ pointerEvents: isLocked ? "none" : "auto" }}
      aria-hidden={isLocked}
    >
      <Tooltip text={isLocked ? "Cannot add cells in locked mode" : "Add math cell"}>
        <button
          className={clsx(styles.mathCellButton, "button")}
          onClick={() => handleInsert("math")}
          disabled={isLocked}
          type="button"
        >
          + Math
        </button>
      </Tooltip>

      <Tooltip text={isLocked ? "Cannot add cells in locked mode" : "Add text cell"}>
        <button
          className={clsx(styles.textCellButton, "button")}
          onClick={() => handleInsert("text")}
          disabled={isLocked}
          type="button"
        >
          + Text
        </button>
      </Tooltip>
    </div>
  );
};

export default memo(InsertCellButtons);
