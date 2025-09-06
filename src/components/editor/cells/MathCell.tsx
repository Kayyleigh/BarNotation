// components/editor/cells/MathCell.tsx
import React, { useState } from "react";
import MathEditor from "../../mathExpression/MathEditor";
import type { EditorState } from "../../../logic/editor-state";
import { HoverProvider } from "../../../hooks/mathHover/HoverProvider";
import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";
import styles from "./cell.module.css";
import type { DragSource, DropTarget } from "../../../models/dragTypes";

type MathCellProps = {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
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
  cellId,
  editorState,
  updateEditorState,
  onDropNode,
}) => {
  const { mode } = useEditorMode();
  const isEditMode = mode === "edit";

  const style: React.CSSProperties = {
    textAlign: isEditMode ? "left": "center",
    // zoom: isEditMode ? defaultZoom : 1,
    boxShadow: isEditMode ? undefined : "none",
    border: isEditMode ? undefined : "none",
  };

  const [hoverInfo, setHoverInfo] = useState<{ hoveredType: string; zoomLevel: number }>({
    hoveredType: "",
    zoomLevel: defaultZoom,
  });

  return (
    <div className={styles.mathCell}>
      <div className={styles.mathScrollContainer} style={style}>
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
      {isEditMode && (
        <div className={styles.hoverTypeInfo}>
          {hoverInfo.hoveredType ? `${hoverInfo.hoveredType} • ` : ""}
          {Math.round(hoverInfo.zoomLevel * 100)}%
        </div>
      )}
    </div>
  );
};

export default React.memo(MathCell);
