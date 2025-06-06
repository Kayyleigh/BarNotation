import React from "react";
import MathEditor from "../mathExpression/MathEditor";

type MathCellProps = {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  isPreviewMode: boolean;
};

const MathCell: React.FC<MathCellProps> = ({
  resetZoomSignal,
  defaultZoom,
  showLatex,
  isPreviewMode,
}) => {
  const style: React.CSSProperties = {
    textAlign: isPreviewMode ? "center" : "left",
    zoom: isPreviewMode ? 1 : defaultZoom,
    boxShadow: isPreviewMode ? "none" : undefined,
    border: isPreviewMode ? "none" : undefined,
  };

  return (
    <div className="math-cell" style={style}>
      <MathEditor
        resetZoomSignal={resetZoomSignal}
        defaultZoom={defaultZoom}
        showLatex={showLatex}
      />
    </div>
  );
};

export default MathCell;
