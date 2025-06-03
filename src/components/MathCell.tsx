import { useState } from "react";
import MathEditor from "./MathEditor";

interface MathCellProps {
  resetZoomSignal: number;
  defaultZoom: number;
}

const MathCell: React.FC<MathCellProps> = ({ resetZoomSignal, defaultZoom }) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div
      className="math-cell"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      <MathEditor resetZoomSignal={resetZoomSignal} defaultZoom={defaultZoom} />
      {showPreview && (
        <button className="preview-button">👁 View LaTeX</button>
      )}
    </div>
  );
};

export default MathCell;
