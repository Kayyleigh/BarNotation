import React from "react";
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

  return (
    <div className="math-cell" style={style}>
      <MathEditor
        resetZoomSignal={resetZoomSignal}
        defaultZoom={defaultZoom}
        showLatex={showLatex}
        cellId={cellId}
        editorState={editorState}
        updateEditorState={updateEditorState}
        onDropNode={onDropNode}
      />
    </div>
  );
};

export default MathCell;
