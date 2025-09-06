// // // components/editor/cells/MathCell.tsx
// // import React, { useState } from "react";
// // import MathEditor from "../../mathExpression/MathEditor";
// // import type { EditorState } from "../../../logic/editor-state";
// // import { HoverProvider } from "../../../hooks/mathHover/HoverProvider";
// // import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";
// // import styles from "./cell.module.css";
// // import type { DragSource, DropTarget } from "../../../models/dragTypes";

// // type MathCellProps = {
// //   resetZoomSignal: number;
// //   defaultZoom: number;
// //   showLatex: boolean;
// //   cellId: string;
// //   editorState: EditorState;
// //   updateEditorState: (newState: EditorState) => void;
// //   onDropNode: (
// //     from: DragSource,
// //     to: DropTarget,
// //   ) => void;
// // };

// // const MathCell: React.FC<MathCellProps> = ({
// //   resetZoomSignal,
// //   defaultZoom,
// //   showLatex,
// //   cellId,
// //   editorState,
// //   updateEditorState,
// //   onDropNode,
// // }) => {
// //   const { mode } = useEditorMode();
// //   const isEditMode = mode === "edit";

// //   const style: React.CSSProperties = {
// //     textAlign: isEditMode ? "left": "center",
// //     // zoom: isEditMode ? defaultZoom : 1,
// //     boxShadow: isEditMode ? undefined : "none",
// //     border: isEditMode ? undefined : "none",
// //   };

// //   const [hoverInfo, setHoverInfo] = useState<{ hoveredType: string; zoomLevel: number }>({
// //     hoveredType: "",
// //     zoomLevel: defaultZoom,
// //   });

// //   return (
// //     <div className={styles.mathCell}>
// //       <div className={styles.mathScrollContainer} style={style}>
// //         <HoverProvider>
// //           <MathEditor
// //             resetZoomSignal={resetZoomSignal}
// //             defaultZoom={defaultZoom}
// //             showLatex={showLatex}
// //             cellId={cellId}
// //             editorState={editorState}
// //             updateEditorState={updateEditorState}
// //             onDropNode={onDropNode}
// //             onHoverInfoChange={setHoverInfo}
// //           />
// //         </HoverProvider>
// //       </div>
// //       {isEditMode && (
// //         <div className={styles.hoverTypeInfo}>
// //           {hoverInfo.hoveredType ? `${hoverInfo.hoveredType} • ` : ""}
// //           {Math.round(hoverInfo.zoomLevel * 100)}%
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default React.memo(MathCell);

// // components/editor/cells/MathCell.tsx
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import MathEditor from "../../mathExpression/MathEditor";
// import type { EditorState } from "../../../logic/editor-state";
// import { HoverProvider } from "../../../hooks/mathHover/HoverProvider";
// import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";
// import styles from "./cell.module.css";
// import type { DragSource, DropTarget } from "../../../models/dragTypes";

// type MathCellProps = {
//   resetZoomSignal: number;
//   defaultZoom: number;
//   showLatex: boolean;
//   cellId: string;
//   isSelected: boolean; // ← new prop
//   setSelectedCellId: (id: string | null) => void; // ← new prop
//   editorState: EditorState;
//   updateEditorState: (newState: EditorState) => void;
//   onDropNode: (from: DragSource, to: DropTarget) => void;
// };

// const MathCell: React.FC<MathCellProps> = ({
//   resetZoomSignal,
//   defaultZoom,
//   showLatex,
//   cellId,
//   isSelected,
//   setSelectedCellId,
//   editorState,
//   updateEditorState,
//   onDropNode,
// }) => {
//   const { mode } = useEditorMode();
//   const isEditMode = mode === "edit";

//   const style: React.CSSProperties = {
//     textAlign: isEditMode ? "left" : "center",
//     boxShadow: isEditMode ? undefined : "none",
//     border: isEditMode ? undefined : "none",
//   };

//   const [hoverInfo, setHoverInfo] = useState<{ hoveredType: string; zoomLevel: number }>({
//     hoveredType: "",
//     zoomLevel: defaultZoom,
//   });

//   const containerRef = useRef<HTMLDivElement>(null);

//   // Focus editor when this cell becomes selected
//   useEffect(() => {
//     if (isSelected) {
//       containerRef.current?.querySelector<HTMLDivElement>(".math-editor")?.focus();
//     }
//   }, [isSelected]);

//   // Callback to handle editor focus and update selected cell
//   const handleEditorFocus = useCallback(() => {
//     if (!isSelected) setSelectedCellId(cellId);
//   }, [cellId, isSelected, setSelectedCellId]);

//   return (
//     <div className={styles.mathCell} ref={containerRef}>
//       <div className={styles.mathScrollContainer} style={style}>
//         <HoverProvider>
//           <MathEditor
//             resetZoomSignal={resetZoomSignal}
//             defaultZoom={defaultZoom}
//             showLatex={showLatex}
//             cellId={cellId}
//             editorState={editorState}
//             updateEditorState={updateEditorState}
//             onDropNode={onDropNode}
//             onHoverInfoChange={setHoverInfo}
//             onFocus={handleEditorFocus} // notify parent when focused
//           />
//         </HoverProvider>
//       </div>
//       {isEditMode && (
//         <div className={styles.hoverTypeInfo}>
//           {hoverInfo.hoveredType ? `${hoverInfo.hoveredType} • ` : ""}
//           {Math.round(hoverInfo.zoomLevel * 100)}%
//         </div>
//       )}
//     </div>
//   );
// };

// export default React.memo(MathCell);

import React, { useState, useCallback } from "react";
import MathEditor from "../../mathExpression/MathEditor";
import type { EditorState } from "../../../logic/editor-state";
import { HoverProvider } from "../../../hooks/mathHover/HoverProvider";
import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";
import styles from "./cell.module.css";
import type { DragSource, DropTarget } from "../../../models/dragTypes";
import LatexViewer from "../../mathExpression/LatexViewer";

type MathCellProps = {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  cellId: string;
  editorState: EditorState;
  updateEditorState: (newState: EditorState) => void;
  selectedCellId: string | null;            // controlled selection
  setSelectedCellId: (id: string | null) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
};

const MathCell: React.FC<MathCellProps> = ({
  resetZoomSignal,
  defaultZoom,
  showLatex,
  cellId,
  editorState,
  updateEditorState,
  selectedCellId,
  setSelectedCellId,
  onDropNode,
}) => {
  const { mode } = useEditorMode();
  const isEditMode = mode === "edit";
  const isSelected = selectedCellId === cellId;

  // Hover info (always tracked)
  const [hoverInfo, setHoverInfo] = useState<{ hoveredType: string; zoomLevel: number }>({
    hoveredType: "",
    zoomLevel: defaultZoom,
  });

  // Handler when editor gets focus
  const handleEditorFocus = useCallback(() => {
    setSelectedCellId(cellId);
  }, [cellId, setSelectedCellId]);

  const style: React.CSSProperties = {
    textAlign: isEditMode ? "left" : "center",
    boxShadow: isEditMode ? undefined : "none",
    border: isEditMode ? undefined : "none",
  };

  return (
    <>
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
              onFocus={handleEditorFocus} // notify parent when focused
              isSelected={isSelected}     // only selected cell can receive focus
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
      <LatexViewer rootNode={editorState.rootNode} showLatex={showLatex} />
    </>
  );
};

export default React.memo(MathCell);
