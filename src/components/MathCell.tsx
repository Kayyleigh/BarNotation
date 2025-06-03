import { useState } from "react";
import MathEditor from "./MathEditor";
import clsx from "clsx";

interface MathCellProps {
  resetZoomSignal: number;
  defaultZoom: number;
  onDelete: () => void;
}

const MathCell: React.FC<MathCellProps> = ({ resetZoomSignal, defaultZoom, onDelete }) => {
  const [showToolbar, setShowToolbar] = useState(false);

  const [showLatex, setShowLatex] = useState(false);
  const toggleLatex = () => setShowLatex(prev => !prev);

  return (
    <div
      className={clsx("cell", "math-cell")}
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
