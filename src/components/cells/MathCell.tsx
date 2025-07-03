import React, { useState } from "react";
import MathEditor from "../mathExpression/MathEditor";
import type { EditorState } from "../../logic/editor-state";
import type { DropTarget } from "../layout/EditorWorkspace";
import type { DragSource } from "../../hooks/DragContext";
import { HoverProvider } from "../../hooks/HoverProvider";

type MathCellProps = {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  isPreviewMode: boolean;
  cellId: string;
  editorState: EditorState;
  updateEditorState: (newState: EditorState) => void;
  onDropNode: (
    from: DragSource,
    to: DropTarget,
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
        <HoverProvider>
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
        </HoverProvider>
      </div>
      {hoverInfo.hoveredType && !isPreviewMode && (
        <div className="hover-type-info">
          {hoverInfo.hoveredType} • {Math.round(hoverInfo.zoomLevel * 100)}%
        </div>
      )}
    </div>
  );
};

export default React.memo(MathCell);
