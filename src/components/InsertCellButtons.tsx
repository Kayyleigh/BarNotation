import React from "react";
import clsx from "clsx";

interface InsertCellButtonsProps {
  onInsert: (type: "math" | "text") => void;
  isVisible: boolean;
}

const InsertCellButtons: React.FC<InsertCellButtonsProps> = ({ onInsert, isVisible }) => {
  return (
    <div className={clsx("add-buttons insert-between", { visible: isVisible })}>
      <button className={clsx("button", "math-cell-button")} onClick={() => onInsert("math")}>
        + Math Cell
      </button>
      <button className={clsx("button", "text-cell-button")} onClick={() => onInsert("text")}>
        + Text Cell
      </button>
    </div>
  );
};

export default InsertCellButtons;
