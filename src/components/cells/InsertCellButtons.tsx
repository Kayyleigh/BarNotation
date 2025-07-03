import React from "react";
import clsx from "clsx";
import Tooltip from "../tooltips/Tooltip";

interface InsertCellButtonsProps {
  onInsert: (type: "math" | "text") => void;
  isVisible: boolean;
}

const InsertCellButtons: React.FC<InsertCellButtonsProps> = ({ onInsert, isVisible }) => {
  // console.log("Rendering InsertCellButtons", isVisible);

  return (
    <div className={clsx("add-buttons insert-between", { visible: isVisible })}>
      <Tooltip text="Add math cell">
        <button className={clsx("button", "math-cell-button")} onClick={() => onInsert("math")}>
          + Math
        </button>
      </Tooltip>
      <Tooltip text="Add text cell">
        <button className={clsx("button", "text-cell-button")} onClick={() => onInsert("text")}>
          + Text
        </button>
      </Tooltip>
    </div>
  );
};

export default React.memo(InsertCellButtons);
