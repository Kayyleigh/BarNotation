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

// import React, { useState, useCallback } from "react";
// import MathEditor from "../../mathExpression/MathEditor";
// import type { EditorState } from "../../../logic/editor-state";
// import { HoverProvider } from "../../../hooks/mathHover/HoverProvider";
// import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";
// import styles from "./cell.module.css";
// import type { DragSource, DropTarget } from "../../../models/dragTypes";
// import LatexViewer from "../../mathExpression/LatexViewer";

// type MathCellProps = {
//   resetZoomSignal: number;
//   defaultZoom: number;
//   showLatex: boolean;
//   cellId: string;
//   editorState: EditorState;
//   updateEditorState: (newState: EditorState) => void;
//   selectedCellId: string | null;            // controlled selection
//   setSelectedCellId: (id: string | null) => void;
//   onDropNode: (from: DragSource, to: DropTarget) => void;
// };

// const MathCell: React.FC<MathCellProps> = ({
//   resetZoomSignal,
//   defaultZoom,
//   showLatex,
//   cellId,
//   editorState,
//   updateEditorState,
//   selectedCellId,
//   setSelectedCellId,
//   onDropNode,
// }) => {
//   const { mode } = useEditorMode();
//   const isEditMode = mode === "edit";
//   const isSelected = selectedCellId === cellId;

//   // Hover info (always tracked)
//   const [hoverInfo, setHoverInfo] = useState<{ hoveredType: string; zoomLevel: number }>({
//     hoveredType: "",
//     zoomLevel: defaultZoom,
//   });

//   // Handler when editor gets focus
//   const handleEditorFocus = useCallback(() => {
//     setSelectedCellId(cellId);
//   }, [cellId, setSelectedCellId]);

//   // Handler when editor loses focus
//   const handleEditorBlur = useCallback(() => {
//     setSelectedCellId(null);
//   }, [setSelectedCellId]);

//   const style: React.CSSProperties = {
//     textAlign: isEditMode ? "left" : "center",
//     boxShadow: isEditMode ? undefined : "none",
//     border: isEditMode ? undefined : "none",
//   };

//   return (
//     <>
//       <div className={styles.mathCell}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") {
//             e.preventDefault();
//             setSelectedCellId(cellId);
//             // Forward actual focus into the MathEditor
//             const editorDiv = document.querySelector<HTMLDivElement>(
//               `[data-math-editor="${cellId}"]`
//             );
//             editorDiv?.focus();
//           }
//         }}>
//         <div className={styles.mathScrollContainer} style={style}>
//           <HoverProvider>
//             <MathEditor
//               resetZoomSignal={resetZoomSignal}
//               defaultZoom={defaultZoom}
//               showLatex={showLatex}
//               cellId={cellId}
//               editorState={editorState}
//               updateEditorState={updateEditorState}
//               onDropNode={onDropNode}
//               onHoverInfoChange={setHoverInfo}
//               onFocus={handleEditorFocus} // notify parent when focused
//               onBlur={handleEditorBlur}
//               isSelected={isSelected}     // only selected cell can receive focus
//             />
//           </HoverProvider>
//         </div>

//         {isEditMode && (
//           <div className={styles.hoverTypeInfo}>
//             {hoverInfo.hoveredType ? `${hoverInfo.hoveredType} • ` : ""}
//             {Math.round(hoverInfo.zoomLevel * 100)}%
//           </div>
//         )}
//       </div>
//       <LatexViewer rootNode={editorState.rootNode} showLatex={showLatex} />
//     </>
//   );
// };

// export default React.memo(MathCell);

// import React, { useState } from "react";
// import MathEditor from "../../mathExpression/MathEditor";
// import type { EditorState } from "../../../logic/editor-state";
// import { HoverProvider } from "../../../hooks/mathHover/HoverProvider";
// import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";
// import styles from "./cell.module.css";
// import type { BaseCellProps } from "../../../models/cellRegistry";

// const MathCell: React.FC<BaseCellProps<EditorState>> = ({ 
//   id, 
//   content, 
//   onChange,
//   editorState,
//   updateEditorState,
// }) => {
//   const { mode } = useEditorMode();
//   const isEditMode = mode === "edit";

//   const [hoverInfo, setHoverInfo] = useState<{ hoveredType: string; zoomLevel: number }>({
//     hoveredType: "",
//     zoomLevel: 1,
//   });

//   return (
//     <div className={styles.mathCell}>
//       <HoverProvider>
//         <MathEditor
//           cellId={id}
//           editorState={content}
//           updateEditorState={onChange}
//           onHoverInfoChange={setHoverInfo}
//           //resetZoomSignal, defaultZoom, showLatex, onDropNode, isSelected

//           // focus/selection handled externally by CellWrapper/CellRenderer
//         />
//       </HoverProvider>

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
import type { BaseCellProps } from "../../../models/cellRegistry";
import type { DragSource, DropTarget } from "../../../models/dragTypes";

interface MathCellExtraProps {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  editorState: EditorState;
  updateEditorState: (newState: EditorState) => void;
  selectedCellId: string | null;
  setSelectedCellId: (id: string | null) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
}

type MathCellProps = BaseCellProps<EditorState> & MathCellExtraProps;

const MathCell: React.FC<MathCellProps> = ({
  id,
  content,
  onChange,
  resetZoomSignal,
  defaultZoom,
  showLatex,
  selectedCellId,
  setSelectedCellId,
  onDropNode,
}) => {
  const { mode } = useEditorMode();
  const isEditMode = mode === "edit";
  const isSelected = selectedCellId === id;

  const [hoverInfo, setHoverInfo] = useState<{ hoveredType: string; zoomLevel: number }>({
    hoveredType: "",
    zoomLevel: defaultZoom,
  });

  const handleEditorFocus = useCallback(() => setSelectedCellId(id), [id, setSelectedCellId]);
  const handleEditorBlur = useCallback(() => setSelectedCellId(null), [setSelectedCellId]);

  return (
    <>
      <div
        className={styles.mathCell}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            setSelectedCellId(id);
            const editorDiv = document.querySelector<HTMLDivElement>(`[data-math-editor="${id}"]`);
            editorDiv?.focus();
          }
        }}
      >
        <div className={styles.mathScrollContainer}>
          <HoverProvider>
            <MathEditor
              resetZoomSignal={resetZoomSignal}
              defaultZoom={defaultZoom}
              showLatex={showLatex}
              cellId={id}
              editorState={content}
              updateEditorState={onChange}
              onDropNode={onDropNode}
              onHoverInfoChange={setHoverInfo}
              onFocus={handleEditorFocus}
              onBlur={handleEditorBlur}
              isSelected={isSelected}
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
    </>
  );
};

export default React.memo(MathCell);
