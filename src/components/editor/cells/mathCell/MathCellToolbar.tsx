// components/editor/cells/mathCell/MathCellToolbar.tsx
import React from "react";
import toolbarStyles from "../CellToolbar.module.css";
import type { MathToolbarExtrasProps } from "../../../../models/cellRegistry";

export const MathCellToolbar: React.FC<MathToolbarExtrasProps> = React.memo(({ id, toggleShowLatex, showLatex }) => (
  <button className={toolbarStyles.button} onClick={() => toggleShowLatex(id)}>
    {showLatex ? "Hide LaTeX" : "View LaTeX"}
  </button>
));
