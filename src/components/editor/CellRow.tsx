// import React, { useCallback, useRef } from "react";
// import clsx from "clsx";
// import InsertCellButtons from "./cells/InsertCellButtons";
// import BaseCell from "./cells/BaseCell";
// import TextCell from "./cells/TextCell";
// import MathCell from "./cells/MathCell";
// import Tooltip from "../tooltips/Tooltip";
// import styles from "./Editor.module.css";
// import textStyles from "../../styles/textStyles.module.css"
// import type { EditorState } from "../../logic/editor-state";
// import type { CellData, TextCellContent } from "../../models/noteTypes";
// import type { DragSource, DropTarget } from "../../hooks/DragContext";
// import { useEditorMode } from "../../hooks/useEditorMode";

// interface CellRowProps {
//   cell: CellData;
//   index: number;
//   displayNumber: string | null;
//   selectedCellId: string | null;
//   draggingCellId: string | null;
//   dragOverInsertIndex: number | null;
//   updateDragOver: (index: number | null) => void;
//   editorStates: Record<string, EditorState>;
//   updateEditorStates: Record<string, (newState: EditorState) => void>
//   cellRefs: React.RefObject<(HTMLDivElement | null)[]>;
//   showLatexMap: Record<string, boolean>;
//   defaultZoom: number;
//   resetZoomSignal: number;
//   addCell: (type: "math" | "text", index: number) => void;
//   updateCellContent: (id: string, partialContent: Partial<TextCellContent>) => void;
//   deleteCell: (id: string) => void;
//   duplicateCell: (id: string) => void;
//   toggleShowLatex: (id: string) => void;
//   handlePointerDown: (e: React.PointerEvent, id: string, index: number) => void;
//   setSelectedCellId: (id: string | null) => void;
//   onDropNode: (from: DragSource, to: DropTarget) => void;
// }

// const CellRow: React.FC<CellRowProps> = ({
//   cell,
//   index,
//   displayNumber,
//   selectedCellId,
//   draggingCellId,
//   dragOverInsertIndex,
//   updateDragOver,
//   editorStates,
//   updateEditorStates,
//   cellRefs,
//   showLatexMap,
//   defaultZoom,
//   resetZoomSignal,
//   addCell,
//   updateCellContent,
//   deleteCell,
//   duplicateCell,
//   toggleShowLatex,
//   handlePointerDown,
//   setSelectedCellId,
//   onDropNode,
// }) => {
//   const ref = useRef<HTMLDivElement>(null);

//   const { mode } = useEditorMode();

//   const handleInsert = useCallback(
//     (type: "math" | "text") => addCell(type, index),
//     [addCell, index]
//   );

//   const handlePointerMove = (e: React.PointerEvent) => {
//     e.preventDefault();
//     updateDragOver(index);
//   };

//   return (
//     <div
//       ref={ref}
//       onPointerMove={handlePointerMove}
//     >
//       {(mode !== "locked") && <div
//         className={clsx(
//           styles.insertZone,
//           { [styles.dragOver]: dragOverInsertIndex === index }
//         )}
//         onPointerEnter={() => draggingCellId !== null && updateDragOver(index)}
//       >
//         <InsertCellButtons onInsert={handleInsert} />
//       </div>}

//       <div
//         ref={(el) => {
//           if (el) cellRefs.current[index] = el;
//         }}
//       >
//         <BaseCell
//           typeLabel={cell.type === "math" ? "Math" : "Text"}
//           isSelected={selectedCellId === cell.id}
//           isDragging={draggingCellId === cell.id}
//           onClick={() => setSelectedCellId(cell.id)}
//           onDelete={() => deleteCell(cell.id)}
//           onDuplicate={() => duplicateCell(cell.id)}
//           handlePointerDown={(e) => handlePointerDown(e, cell.id, index)}
//           toolbarExtras={
//             cell.type === "math" ? (
//               <Tooltip text={showLatexMap[cell.id] ? "Hide LaTeX output" : "Show LaTeX output"}>
//                 <button
//                   className={clsx("button", "preview-button")}
//                   onClick={() => toggleShowLatex(cell.id)}
//                   type="button"
//                 >
//                   {showLatexMap[cell.id] ? "🙈 LaTeX" : "👁️ LaTeX"}
//                 </button>
//               </Tooltip>
//             ) : (
//               <div className={styles.hierarchyTypeButtons}>
//                 {["section", "subsection", "subsubsection", "plain"].map((typeOption) => (
//                   <button
//                     key={typeOption}
//                     type="button"
//                     className={clsx(
//                       styles.hierarchyTypeButton,
//                       textStyles[typeOption],
//                       { [styles.active]: cell.content.type === typeOption }
//                     )}
//                     onClick={() =>
//                       updateCellContent(cell.id, {
//                         type: typeOption as typeof cell.content.type,
//                       })
//                     }
//                     title={typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
//                   >
//                     A
//                   </button>
//                 ))}
//               </div>
//             )
//           }
//         >
//           {cell.type === "text" ? (
//             <TextCell
//               value={cell.content}
//               onChange={(newVal) => updateCellContent(cell.id, { text: newVal.text })}
//               displayNumber={displayNumber}
//             />
//           ) : editorStates[cell.id] ? (
//             <MathCell
//               cellId={cell.id}
//               defaultZoom={defaultZoom}
//               resetZoomSignal={resetZoomSignal}
//               showLatex={showLatexMap[cell.id] ?? false}
//               editorState={editorStates[cell.id]}
//               updateEditorState={updateEditorStates[cell.id]}
//               onDropNode={onDropNode}
//             />
//           ) : (
//             <p>Loading cell...</p>
//           )}
//         </BaseCell>
//       </div>
//     </div>
//   );
// };

// export default React.memo(CellRow);

import React, { useCallback, useRef } from "react";
import clsx from "clsx";
import InsertCellButtons from "./cells/InsertCellButtons";
import BaseCell from "./cells/BaseCell";
import TextCell from "./cells/TextCell";
import MathCell from "./cells/MathCell";
import MathView from "../mathExpression/MathView";
import Tooltip from "../tooltips/Tooltip";
import styles from "./Editor.module.css";
import textStyles from "../../styles/textStyles.module.css";
import type { EditorState } from "../../logic/editor-state";
import type { CellData, TextCellContent } from "../../models/noteTypes";
import type { DragSource, DropTarget } from "../../hooks/DragContext";
import { useEditorMode } from "../../hooks/useEditorMode";
import { noop } from "../../utils/noop";
import { TEXT_CELL_TYPES, TEXT_TYPE_LABELS } from "../../models/textTypes";

interface CellRowProps {
  cell: CellData;
  index: number;
  displayNumber: string | null;
  selectedCellId: string | null;
  draggingCellId: string | null;
  dragOverInsertIndex: number | null;
  updateDragOver: (index: number | null) => void;
  editorStates: Record<string, EditorState>;
  updateEditorStates: Record<string, (newState: EditorState) => void>
  cellRefs: React.RefObject<(HTMLDivElement | null)[]>;
  showLatexMap: Record<string, boolean>;
  defaultZoom: number;
  resetZoomSignal: number;
  addCell: (type: "math" | "text", index: number) => void;
  updateCellContent: (id: string, partialContent: Partial<TextCellContent>) => void;
  deleteCell: (id: string) => void;
  duplicateCell: (id: string) => void;
  toggleShowLatex: (id: string) => void;
  handlePointerDown: (e: React.PointerEvent, id: string, index: number) => void;
  setSelectedCellId: (id: string | null) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
}

const CellRow: React.FC<CellRowProps> = ({
  cell,
  index,
  displayNumber,
  selectedCellId,
  draggingCellId,
  dragOverInsertIndex,
  updateDragOver,
  editorStates,
  updateEditorStates,
  cellRefs,
  showLatexMap,
  defaultZoom,
  resetZoomSignal,
  addCell,
  updateCellContent,
  deleteCell,
  duplicateCell,
  toggleShowLatex,
  handlePointerDown,
  setSelectedCellId,
  onDropNode,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { mode } = useEditorMode();
  const isLocked = mode === "locked";

  const handleInsert = useCallback(
    (type: "math" | "text") => addCell(type, index),
    [addCell, index]
  );

  const handlePointerMove = (e: React.PointerEvent) => {
    e.preventDefault();
    updateDragOver(index);
  };

  return (
    <div ref={ref} onPointerMove={handlePointerMove}>
      {!isLocked && (
        <div
          className={clsx(styles.insertZone, {
            [styles.dragOver]: dragOverInsertIndex === index,
          })}
          onPointerEnter={() => draggingCellId !== null && updateDragOver(index)}
        >
          <InsertCellButtons onInsert={handleInsert} />
        </div>
      )}

      <div
        ref={(el) => {
          if (el) cellRefs.current[index] = el;
        }}
      >
        <BaseCell
          // typeLabel={cell.type === "math" ? "Math" : "Text"}
          typeLabel={cell.type === "math" ? "Math" : TEXT_TYPE_LABELS[cell.content.type]}
          isSelected={!isLocked && selectedCellId === cell.id}
          isDragging={!isLocked && draggingCellId === cell.id}
          onClick={!isLocked ? () => setSelectedCellId(cell.id) : noop}
          onDelete={!isLocked ? () => deleteCell(cell.id) : noop}
          onDuplicate={!isLocked ? () => duplicateCell(cell.id) : noop}
          handlePointerDown={!isLocked ? (e) => handlePointerDown(e, cell.id, index) : undefined}
          toolbarExtras={
            !isLocked &&
            (cell.type === "math" ? (
              <Tooltip
                text={showLatexMap[cell.id] ? "Hide LaTeX output" : "Show LaTeX output"}
              >
                <button
                  className={clsx("button", "preview-button")}
                  onClick={() => toggleShowLatex(cell.id)}
                  type="button"
                >
                  {showLatexMap[cell.id] ? "🙈 LaTeX" : "👁️ LaTeX"}
                </button>
              </Tooltip>
            ) : (
              <div className={styles.hierarchyTypeButtons}>
                {Object.values(TEXT_CELL_TYPES).map((typeOption) => (
                  <button
                    key={typeOption}
                    type="button"
                    className={clsx(
                      styles.hierarchyTypeButton,
                      textStyles[typeOption],
                      {
                        [styles.active]: cell.content.type === typeOption,
                      }
                    )}
                    onClick={() =>
                      updateCellContent(cell.id, {
                        type: typeOption as typeof cell.content.type,
                      })
                    }
                    title={typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
                  >
                    A
                  </button>
                ))}
              </div>
            ))
          }
        >
          {cell.type === "text" ? (
            <TextCell
              value={cell.content}
              onChange={(newVal) =>
                updateCellContent(cell.id, { text: newVal.text })
              }
              displayNumber={displayNumber}
            />
          ) : editorStates[cell.id] ? (
            isLocked ? (
              <MathView
                node={editorStates[cell.id].rootNode}
                className={styles.lockedMath}
              />
            ) : (
              <MathCell
                cellId={cell.id}
                defaultZoom={defaultZoom}
                resetZoomSignal={resetZoomSignal}
                showLatex={showLatexMap[cell.id] ?? false}
                editorState={editorStates[cell.id]}
                updateEditorState={updateEditorStates[cell.id]}
                onDropNode={onDropNode}
              />
            )
          ) : (
            <p>Loading cell...</p>
          )}
        </BaseCell>
      </div>
    </div>
  );
};

export default React.memo(CellRow);
