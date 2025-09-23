// components/editor/cells/mathCell/MathCellToolbar.tsx
import React from "react";
import toolbarStyles from "../CellToolbar.module.css";
import type { MathToolbarExtrasProps } from "../../../../models/cellRegistry";
import Tooltip from "../../../tooltips/Tooltip";

export const MathCellToolbar: React.FC<MathToolbarExtrasProps> = React.memo(({ id, toggleShowLatex, showLatex, t }) => (
  <Tooltip text={t("cellToolbar.latexTooltip")}>
    <button className={toolbarStyles.button} onClick={() => toggleShowLatex(id)}>
      {showLatex ? "Hide LaTeX" : "View LaTeX"}
    </button>
  </Tooltip>
));
