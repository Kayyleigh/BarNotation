import { useState } from "react";
import MathEditor from "../mathExpression/MathEditor";
import clsx from "clsx";

interface MathCellProps {
  resetZoomSignal: number;
  defaultZoom: number;
  isPreviewMode: boolean;
  onDelete: () => void;
}

const MathCell: React.FC<MathCellProps> = ({ resetZoomSignal, defaultZoom, isPreviewMode, onDelete }) => {
  const [showToolbar, setShowToolbar] = useState(false);

  const [showLatex, setShowLatex] = useState(false);
  const toggleLatex = () => setShowLatex(prev => !prev);

  return (
    <div
      className={clsx("cell", "math-cell", { preview: isPreviewMode })}
      style={{
        textAlign: isPreviewMode ? "center" : "left",
        boxShadow: isPreviewMode ? "none" : undefined,
        border: isPreviewMode ? "none" : undefined,
        zoom: isPreviewMode ? 1 : defaultZoom, // or adjust with transform/scale
      }}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      {showToolbar && (
        <div className="cell-toolbar">
          <button className="preview-button" onClick={toggleLatex}>
            {showLatex ? "🙈 Hide Latex" : "👁️ Show Latex"}
          </button>
          <button className="delete-button" onClick={onDelete}>🗑️</button>
        </div>
      )}
      <MathEditor resetZoomSignal={resetZoomSignal} defaultZoom={defaultZoom} showLatex={showLatex} />
    </div>
  );
};

export default MathCell;
