// // components/editor/CellRow.tsx
// import React, { useCallback, useRef } from "react";
// import clsx from "clsx";
// import InsertCellButtons from "./cells/InsertCellButtons";
// import BaseCell from "./cells/BaseCell";
// import TextCell from "./cells/TextCell";
// import MathCell from "./cells/MathCell";
// import MathView from "../mathExpression/MathView";
// import Tooltip from "../tooltips/Tooltip";
// import styles from "./Editor.module.css";
// import textStyles from "../../styles/textStyles.module.css";
// import type { EditorState } from "../../logic/editor-state";
// import type { CellData, TextCellContent } from "../../models/noteTypes";
// import { useEditorMode } from "../../hooks/editorMode/useEditorMode";
// import { noop } from "../../utils/noop";
// import { TEXT_CELL_TYPES, TEXT_TYPE_LABELS } from "../../models/textTypes";
// import { useI18n } from "../../i18n/useI18n";
// import type { DragSource, DropTarget } from "../../models/dragTypes";

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
//   const { t } = useI18n(); // use language hook

//   const ref = useRef<HTMLDivElement>(null);
//   const { mode } = useEditorMode();
//   const isLocked = mode === "locked";

//   const handleInsert = useCallback(
//     (type: "math" | "text") => addCell(type, index),
//     [addCell, index]
//   );

//   const handlePointerMove = (e: React.PointerEvent) => {
//     e.preventDefault();
//     updateDragOver(index);
//   };

//   return (
//     <div ref={ref} onPointerMove={handlePointerMove}>
//       {!isLocked && (
//         <div
//           className={clsx(styles.insertZone, {
//             [styles.dragOver]: dragOverInsertIndex === index,
//           })}
//           onPointerEnter={() => draggingCellId !== null && updateDragOver(index)}
//         >
//           <InsertCellButtons onInsert={handleInsert} />
//         </div>
//       )}

//       <div
//         ref={(el) => {
//           if (el) cellRefs.current[index] = el;
//         }}
//       >
//         <BaseCell
//           // typeLabel={cell.type === "math" ? "Math" : "Text"}
//           typeLabel={cell.type === "math" ? t("cellRow.math") : TEXT_TYPE_LABELS[cell.content.type] ?? t("cellRow.text")}
//           isSelected={!isLocked && selectedCellId === cell.id}
//           isDragging={!isLocked && draggingCellId === cell.id}
//           onClick={!isLocked ? () => setSelectedCellId(cell.id) : noop}
//           onDelete={!isLocked ? () => deleteCell(cell.id) : noop}
//           onDuplicate={!isLocked ? () => duplicateCell(cell.id) : noop}
//           handlePointerDown={!isLocked ? (e) => handlePointerDown(e, cell.id, index) : undefined}
//           toolbarExtras={
//             !isLocked &&
//             (cell.type === "math" ? (
//               <Tooltip text={showLatexMap[cell.id] ? t("cellRow.hideLatex") : t("cellRow.showLatex")}>
//                 <button
//                   className={styles.cellToolbarButton}
//                   onClick={() => toggleShowLatex(cell.id)}
//                   type="button"
//                 >
//                   {showLatexMap[cell.id] ? `🙈 ${t("cellRow.latex")}` : `👁️ ${t("cellRow.latex")}`}
//                 </button>
//               </Tooltip>
//             ) : (
//               <div className={styles.hierarchyTypeButtons}>
//                 {Object.values(TEXT_CELL_TYPES).map((typeOption) => (
//                   <button
//                     key={typeOption}
//                     type="button"
//                     className={clsx(
//                       styles.hierarchyTypeButton,
//                       textStyles[typeOption],
//                       {
//                         [styles.active]: cell.content.type === typeOption,
//                       }
//                     )}
//                     onClick={() =>
//                       updateCellContent(cell.id, {
//                         type: typeOption as typeof cell.content.type,
//                       })
//                     }
//                     title={t(`cellRow.${typeOption}`)}
//                   // title={t(`cellRow.${typeOption}`).charAt(0).toUpperCase() + t(`cellRow.${typeOption}`).slice(1)}
//                   >
//                     A
//                   </button>
//                 ))}
//               </div>
//             ))
//           }
//         >
//           {cell.type === "text" ? (
//             <TextCell
//               value={cell.content}
//               onChange={(newVal) =>
//                 updateCellContent(cell.id, { text: newVal.text })
//               }
//               displayNumber={displayNumber}
//             />
//           ) : editorStates[cell.id] ? (
//             isLocked ? (
//               <MathView
//                 node={editorStates[cell.id].rootNode}
//                 className={styles.lockedMath}
//               />
//             ) : (
//               <MathCell
//                 cellId={cell.id}
//                 defaultZoom={defaultZoom}
//                 resetZoomSignal={resetZoomSignal}
//                 showLatex={showLatexMap[cell.id] ?? false}
//                 editorState={editorStates[cell.id]}
//                 updateEditorState={updateEditorStates[cell.id]}
//                 onDropNode={onDropNode}
//               />
//             )
//           ) : (
//             <p>{t("cellRow.loading")}</p>
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
import { TEXT_CELL_TYPES, TEXT_TYPE_LABELS } from "../../models/textTypes";
import { useI18n } from "../../i18n/useI18n";
import type { EditorState } from "../../logic/editor-state";
import type { CellData, TextCellContent } from "../../models/noteTypes";
import type { DragSource, DropTarget } from "../../models/dragTypes";
import { useEditorMode } from "../../hooks/editorMode/useEditorMode";
import { noop } from "../../utils/noop";

interface CellRowProps {
  cell: CellData;
  index: number;
  displayNumber: string | null;
  selectedCellId: string | null;
  draggingCellId: string | null;
  dragOverInsertIndex: number | null;
  updateDragOver: (index: number | null) => void;
  editorStates: Record<string, EditorState>;
  updateEditorStates: Record<string, (newState: EditorState) => void>;
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
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { mode } = useEditorMode();
  const isLocked = mode === "locked";

  const isSelected = selectedCellId === cell.id;
  const isDragging = draggingCellId === cell.id;

  const handleInsert = useCallback(
    (type: "math" | "text") => addCell(type, index),
    [addCell, index]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      updateDragOver(index);
    },
    [updateDragOver, index]
  );

  const handleClick = useCallback(() => {
    if (!isLocked) setSelectedCellId(cell.id);
  }, [cell.id, isLocked, setSelectedCellId]);

  const handlePointerDownLocal = useCallback(
    (e: React.PointerEvent) => {
      if (!isLocked) handlePointerDown(e, cell.id, index);
    },
    [cell.id, index, handlePointerDown, isLocked]
  );

  const renderContent = () => {
    if (cell.type === "text") {
      return (
        <TextCell
          value={cell.content}
          onChange={(newVal) => updateCellContent(cell.id, { text: newVal.text })}
          displayNumber={displayNumber}
        />
      );
    }

    if (!editorStates[cell.id]) {
      return <p>{t("cellRow.loading")}</p>;
    }

    if (isLocked) {
      return <MathView node={editorStates[cell.id].rootNode} className={styles.lockedMath} />;
    }

    return (
      <MathCell
        cellId={cell.id}
        selectedCellId={selectedCellId}
        defaultZoom={defaultZoom}
        resetZoomSignal={resetZoomSignal}
        showLatex={showLatexMap[cell.id] ?? false}
        editorState={editorStates[cell.id]}
        updateEditorState={updateEditorStates[cell.id]}
        onDropNode={onDropNode}
        setSelectedCellId={setSelectedCellId}
      />
    );
  };

  return (
    <div ref={ref} onPointerMove={handlePointerMove}>
      {!isLocked && (
        <div
          className={clsx(styles.insertZone, { [styles.dragOver]: dragOverInsertIndex === index })}
          onPointerEnter={() => draggingCellId !== null && updateDragOver(index)}
        >
          <InsertCellButtons onInsert={handleInsert} />
        </div>
      )}

      <div ref={(el) => el && (cellRefs.current[index] = el)}>
        <BaseCell
          typeLabel={cell.type === "math" ? t("cellRow.math") : TEXT_TYPE_LABELS[cell.content.type] ?? t("cellRow.text")}
          isSelected={!isLocked && isSelected}
          isDragging={!isLocked && isDragging}
          onClick={!isLocked ? handleClick : noop}
          onDelete={!isLocked ? () => deleteCell(cell.id) : noop}
          onDuplicate={!isLocked ? () => duplicateCell(cell.id) : noop}
          handlePointerDown={!isLocked ? handlePointerDownLocal : undefined}
          toolbarExtras={
            !isLocked &&
            (cell.type === "math" ? (
              <Tooltip text={showLatexMap[cell.id] ? t("cellRow.hideLatex") : t("cellRow.showLatex")}>
                <button
                  className={styles.cellToolbarButton}
                  onClick={() => toggleShowLatex(cell.id)}
                  type="button"
                >
                  {showLatexMap[cell.id] ? `🙈 ${t("cellRow.latex")}` : `👁️ ${t("cellRow.latex")}`}
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
                      { [styles.active]: cell.content.type === typeOption }
                    )}
                    onClick={() => updateCellContent(cell.id, { type: typeOption as typeof cell.content.type })}
                    title={t(`cellRow.${typeOption}`)}
                  >
                    A
                  </button>
                ))}
              </div>
            ))
          }
        >
          {renderContent()}
        </BaseCell>
      </div>
    </div>
  );
};

export default React.memo(CellRow);
