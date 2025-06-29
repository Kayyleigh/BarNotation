import React, { useState } from "react";
import MathEditor from "../mathExpression/MathEditor";
import type { MathNode } from "../../models/types";
import type { EditorState } from "../../logic/editor-state";

type MathCellProps = {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  isPreviewMode: boolean;
  cellId: string;
  editorState: EditorState;
  updateEditorState: (newState: EditorState) => void;
  onDropNode: (
    from: {
      sourceType: "cell" | "library";
      cellId?: string;
      containerId: string;
      index: number;
      node: MathNode;
    },
    to: {
      cellId: string;
      containerId: string;
      index: number;
    }
  ) => void;
};

const MathCell: React.FC<MathCellProps> = ({
  resetZoomSignal,
  defaultZoom,
  showLatex,
  isPreviewMode,
  cellId,
  editorState,
  updateEditorState,
  onDropNode,
}) => {
  const style: React.CSSProperties = {
    textAlign: isPreviewMode ? "center" : "left",
    zoom: isPreviewMode ? 1 : defaultZoom,
    boxShadow: isPreviewMode ? "none" : undefined,
    border: isPreviewMode ? "none" : undefined,
  };

  const [hoverInfo, setHoverInfo] = useState<{ hoveredType: string; zoomLevel: number }>({
    hoveredType: "",
    zoomLevel: defaultZoom,
  });

  return (
    <div className="math-cell">
      <div className="math-editor-scroll-container" style={style}>
        <MathEditor
          resetZoomSignal={resetZoomSignal}
          defaultZoom={defaultZoom}
          showLatex={showLatex}
          cellId={cellId}
          editorState={editorState}
          updateEditorState={updateEditorState}
          onDropNode={onDropNode}
          onHoverInfoChange={setHoverInfo}
        />
      </div>
      {hoverInfo.hoveredType && !isPreviewMode && (
        <div className="hover-type-info">
          {hoverInfo.hoveredType} • {Math.round(hoverInfo.zoomLevel * 100)}%
        </div>
      )}
    </div>
  );
};

export default MathCell;
