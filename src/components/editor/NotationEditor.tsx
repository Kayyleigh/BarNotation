// // components/editor/NotationEditor.tsx
// import React, {
//   useState,
//   useRef,
//   useCallback,
//   useMemo,
//   useEffect,
//   useTransition,
// } from "react";
// import InsertCellButtons from "./cells/InsertCellButtons";
// import BaseCell from "./cells/BaseCell";
// import TextCell from "./cells/TextCell";
// import MathCell from "./cells/MathCell";
// import { useCellDragState } from "../../hooks/useCellDragState";
// import styles from "./Editor.module.css";
// import Tooltip from "../tooltips/Tooltip";
// import NoteMetaDataSection from "./NoteMetadataSection";
// import clsx from "clsx";

// import type { CellData, NoteMetadata, TextCellContent } from "../../models/noteTypes";
// import type { EditorState } from "../../logic/editor-state";
// import { nodeToLatex } from "../../models/nodeToLatex";
// import type { DropTarget } from "../layout/EditorWorkspace";
// import type { DragSource } from "../../hooks/DragContext";

// interface NotationEditorProps {
//   // isPreviewMode: boolean;
//   defaultZoom: number;
//   resetZoomSignal: number;
//   noteId: string | null;
//   order: string[];
//   editorStates: Record<string, EditorState>;
//   setEditorStates: React.Dispatch<React.SetStateAction<Record<string, EditorState>>>;
//   textContents: Record<string, TextCellContent>;
//   setTextContents: React.Dispatch<React.SetStateAction<Record<string, TextCellContent>>>;
//   addCell: (type: "math" | "text", index?: number) => void;
//   duplicateCell: (id: string) => void;
//   deleteCell: (id: string) => void;
//   updateOrder: (newOrder: string[]) => void;
//   showLatexMap: Record<string, boolean>;
//   setShowLatexMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
//   metadata: NoteMetadata;
//   setMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;
//   onDropNode: (from: DragSource, to: DropTarget) => void;
// }

// // const reconstructCells = (
// //   order: string[],
// //   editorStates: Record<string, EditorState>,
// //   textContents: Record<string, TextCellContent> = {}
// // ): CellData[] =>
// //   order.map((id) =>
// //     editorStates[id]
// //       ? { id, type: "math", content: nodeToLatex(editorStates[id].rootNode) }
// //       : { id, type: "text", content: textContents[id].text || "" }
// //   );

// const reconstructCells = (
//   order: string[],
//   editorStates: Record<string, EditorState>,
//   textContents: Record<string, TextCellContent> = {}
// ): CellData[] =>
//   order.map((id) => {
//     if (editorStates[id]) {
//       return {
//         id,
//         type: "math",
//         // content: editorStates[id],  // store EditorState directly here
//         content: nodeToLatex(editorStates[id].rootNode),
//       };
//     } else if (textContents[id]) {
//       return {
//         id,
//         type: "text",
//         content: textContents[id],  // object with text & type
//       };
//     } else {
//       // fallback empty text cell
//       return {
//         id,
//         type: "text",
//         content: { text: "", type: "plain" },
//       };
//     }
//   });

// const NotationEditor: React.FC<NotationEditorProps> = ({
//   noteId,
//   // isPreviewMode,
//   defaultZoom,
//   resetZoomSignal,
//   order,
//   editorStates,
//   setEditorStates,
//   textContents,
//   setTextContents,
//   addCell,
//   duplicateCell,
//   deleteCell,
//   updateOrder,
//   showLatexMap,
//   setShowLatexMap,
//   metadata,
//   setMetadata,
//   onDropNode,
// }) => {
//   const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
//   // const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);
//   const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

//   const {
//     draggingCellId,
//     dragOverInsertIndex,
//     startDrag,
//     updateDragOver,
//     endDrag,
//   } = useCellDragState();

//   const baseCells = useMemo(
//     () => reconstructCells(order, editorStates, textContents),
//     [order, editorStates, textContents]
//   );

//   const [visibleCells, setVisibleCells] = useState(baseCells);
//   const [isPending, startTransition] = useTransition();

//   const prevNoteIdRef = useRef(noteId);
//   const baseCellsRef = useRef(baseCells);
//   baseCellsRef.current = baseCells;

//   // Update visibleCells immediately when baseCells change *and* noteId is the same (typing/editing)
//   useEffect(() => {
//     if (noteId === prevNoteIdRef.current) {
//       setVisibleCells(baseCells);
//     }
//     // Always update ref after check
//     prevNoteIdRef.current = noteId;
//   }, [baseCells, noteId]);

//   // Run transition only when noteId changes (loading spinner shown)
//   useEffect(() => {
//     if (noteId !== prevNoteIdRef.current) {
//       startTransition(() => {
//         setVisibleCells(baseCellsRef.current);
//       });
//       prevNoteIdRef.current = noteId;
//     }
//   }, [noteId]);

//   // const updateCellContent = useCallback((id: string, newContent: TextCellContent) => {
//   //   setTextContents((prev) => ({ ...prev, [id]: newContent }));
//   // }, [setTextContents]);

//   // const updateCellContent = useCallback((id: string, newContent: TextCellContent) => {
//   //   setTextContents((prev) => {
//   //     const prevContent = prev[id];
//   //     if (prevContent?.text === newContent.text && prevContent?.type === newContent.type) {
//   //       return prev;  // No change, avoid re-rendering
//   //     }
//   //     return { ...prev, [id]: newContent };
//   //   });
//   // }, [setTextContents]);

//   const updateCellContent = useCallback((id: string, newContent: TextCellContent) => {
//     setTextContents(prev => {
//       const prevContent = prev[id];
//       if (
//         prevContent?.text === newContent.text &&
//         prevContent?.type === newContent.type
//       ) {
//         return prev; // Avoid object recreation
//       }

//       return {
//         ...prev,
//         [id]: newContent,
//       };
//     });
//   }, [setTextContents]);

//   const toggleShowLatex = useCallback((cellId: string) => {
//     setShowLatexMap((prev) => ({ ...prev, [cellId]: !prev[cellId] }));
//   }, [setShowLatexMap]);

//   const handleMetadataUpdate = useCallback((partial: Partial<NoteMetadata>) => {
//     if (noteId) setMetadata(noteId, partial);
//   }, [noteId, setMetadata]);

//   const updateEditorState = useCallback((id: string, newState: EditorState) => {
//     setEditorStates((prev) => ({ ...prev, [id]: newState }));
//   }, [setEditorStates]);

//   const memoizedUpdateEditorStateFns = useMemo(() => {
//     const fns: Record<string, (newState: EditorState) => void> = {};
//     for (const id of order) {
//       fns[id] = (newState) => updateEditorState(id, newState);
//     }
//     return fns;
//   }, [order, updateEditorState]);

//   const handlePointerDown = useCallback((e: React.PointerEvent, id: string, index: number) => {
//     e.preventDefault();
//     startDrag(id, index);

//     const handlePointerMove = (moveEvent: PointerEvent) => {
//       moveEvent.preventDefault();
//       const rects = cellRefs.current.map((ref) => ref?.getBoundingClientRect());
//       const cursorY = moveEvent.clientY;
//       const overIndex = rects.findIndex(
//         (rect) => rect && cursorY < rect.top + rect.height / 2
//       );
//       updateDragOver(overIndex);
//     };

//     const handlePointerUp = () => {
//       const { from, to } = endDrag();
//       if (from !== null && to !== null && from !== to) {
//         const newOrder = [...order];
//         const [movedId] = newOrder.splice(from, 1);
//         newOrder.splice(from < to ? to - 1 : to, 0, movedId);
//         updateOrder(newOrder);
//       }
//       window.removeEventListener("pointermove", handlePointerMove);
//       window.removeEventListener("pointerup", handlePointerUp);
//     };

//     window.addEventListener("pointermove", handlePointerMove);
//     window.addEventListener("pointerup", handlePointerUp);
//   }, [order, startDrag, updateDragOver, endDrag, updateOrder]);

//   return (
//     <main className={styles.editorLayout} onClick={(e) => {
//       if (!(e.target as HTMLElement).closest(".cell")) {
//         setSelectedCellId(null);
//       }
//     }}>
//       <NoteMetaDataSection
//         metadata={metadata}
//         setMetadata={handleMetadataUpdate}
//       />

//       <div className={styles.cellList}>
//         {(visibleCells.length > 3 && isPending) ? (
//           <div className={styles.loadingContainer}>
//             <div className={styles.spinner} />
//             <p className={styles.loadingText}>Loading cells, this may take a while...</p>
//           </div>
//         ) : visibleCells.length === 0 ? (
//           <div className={styles.emptyMessage}>
//             No cells yet. Add one to get started!
//           </div>
//         ) : visibleCells.map((cell, index) => (
//           <React.Fragment key={cell.id}>
//             <div
//               className={styles.insertZone && ${dragOverInsertIndex === index ? "drag-over" : ""}`}
//               onPointerEnter={() => draggingCellId !== null && updateDragOver(index)}
//             >
//               <InsertCellButtons
//                 onInsert={(type) => addCell(type, index)}
//               // InsertCellButtons manages its own hover internally for visibility
//               />
//             </div>
//             <div ref={(el) => { if (el) cellRefs.current[index] = el; }}>
//               <BaseCell
//                 typeLabel={cell.type === "math" ? "Math" : "Text"}
//                 isSelected={selectedCellId === cell.id}
//                 isDragging={draggingCellId === cell.id}
//                 onClick={() => setSelectedCellId(cell.id)}
//                 onDelete={() => deleteCell(cell.id)}
//                 onDuplicate={() => duplicateCell(cell.id)}
//                 handlePointerDown={(e) => handlePointerDown(e, cell.id, index)}
//                 toolbarExtras={
//                   cell.type === "math" ? (
//                     <Tooltip text={showLatexMap[cell.id] ? "Hide LaTeX output" : "Show LaTeX output"}>
//                       <button
//                         className={clsx("button", "preview-button")}
//                         onClick={() => toggleShowLatex(cell.id)}
//                       >
//                         {showLatexMap[cell.id] ? "🙈 LaTeX" : "👁️ LaTeX"}
//                       </button>
//                     </Tooltip>
//                   ) : (
//                     <div className={styles.hierarchyTypeButtons}>
//                       {["section", "subsection", "subsubsection", "plain"].map((typeOption) => (
//                         <button
//                           key={typeOption}
//                           type="button"
//                           className={clsx(
//                             styles.hierarchyTypeButton,
//                             styles[typeOption],
//                             { [styles.active]: cell.content.type === typeOption }
//                           )}
//                           onClick={() =>
//                             updateCellContent(cell.id, {
//                               text: cell.content.text,
//                               type: typeOption as typeof cell.content.type,
//                             })
//                           }
//                           // disabled={isPreviewMode}
//                           title={typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
//                         >
//                           {typeOption.charAt(0).toUpperCase()}
//                         </button>
//                       ))}
//                     </div>
//                   )
//                 }
//               >
//                 {cell.type === "text" ? (
//                   <TextCell
//                     value={cell.content}
//                     onChange={(newVal) => updateCellContent(cell.id, newVal)}
//                   />
//                 ) : editorStates[cell.id] ? (
//                   <MathCell
//                     cellId={cell.id}
//                     defaultZoom={defaultZoom}
//                     resetZoomSignal={resetZoomSignal}
//                     showLatex={showLatexMap[cell.id] ?? false}
//                     editorState={editorStates[cell.id]}
//                     updateEditorState={memoizedUpdateEditorStateFns[cell.id]}
//                     onDropNode={onDropNode}
//                   />
//                 ) : (
//                   <div className={styles.loadingContainer}>
//                     <p className={styles.loadingText}>Loading...</p>
//                   </div>
//                 )}
//               </BaseCell>
//             </div>
//           </React.Fragment>
//         ))}
//       </div>

//       {/* <div
//         className={`insert-zone ${dragOverInsertIndex === visibleCells.length ? "drag-over" : ""}`}
//         onMouseEnter={() => setHoveredInsertIndex(visibleCells.length)}
//         onMouseLeave={() => setHoveredInsertIndex(null)}
//         onPointerEnter={() => draggingCellId !== null && updateDragOver(visibleCells.length)}
//       >
//         <InsertCellButtons
//           onInsert={(type) => addCell(type)}
//         // isVisible={isPreviewMode ? hoveredInsertIndex === visibleCells.length : true}
//         />
//       </div> */}
//       <div
//         className={`insert-zone ${dragOverInsertIndex === visibleCells.length ? "drag-over" : ""}`}
//         onPointerEnter={() => draggingCellId !== null && updateDragOver(visibleCells.length)}
//       >
//         <InsertCellButtons
//           onInsert={(type) => addCell(type, visibleCells.length)}
//           // InsertCellButtons manages its own hover internally for visibility
//         />
//       </div>
//     </main>
//   );
// };

// export default React.memo(NotationEditor);

// components/editor/NotationEditor.tsx
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useTransition,
} from "react";
import InsertCellButtons from "./cells/InsertCellButtons";
import { useCellDragState } from "../../hooks/useCellDragState";
import styles from "./Editor.module.css";
import NoteMetaDataSection from "./NoteMetadataSection";
import type { CellData, NoteMetadata, TextCellContent } from "../../models/noteTypes";
import type { EditorState } from "../../logic/editor-state";
import { nodeToLatex } from "../../models/nodeToLatex";
import type { DropTarget } from "../layout/EditorWorkspace";
import type { DragSource } from "../../hooks/DragContext";
import CellRow from "./CellRow";
import clsx from "clsx";
import { useEditorMode } from "../../hooks/useEditorMode";
import { computeDisplayNumbers } from "../../utils/noteUtils";

interface NotationEditorProps {
  defaultZoom: number;
  resetZoomSignal: number;
  noteId: string | null;
  order: string[];
  editorStates: Record<string, EditorState>;
  setEditorStates: React.Dispatch<React.SetStateAction<Record<string, EditorState>>>;
  textContents: Record<string, TextCellContent>;
  setTextContents: React.Dispatch<React.SetStateAction<Record<string, TextCellContent>>>;
  addCell: (type: "math" | "text", index?: number) => void;
  duplicateCell: (id: string) => void;
  deleteCell: (id: string) => void;
  updateOrder: (newOrder: string[]) => void;
  showLatexMap: Record<string, boolean>;
  setShowLatexMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  metadata: NoteMetadata;
  setMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
}

const reconstructCells = (
  order: string[],
  editorStates: Record<string, EditorState>,
  textContents: Record<string, TextCellContent> = {}
): CellData[] =>
  order.map((id) => {
    if (editorStates[id]) {
      return {
        id,
        type: "math",
        content: nodeToLatex(editorStates[id].rootNode),
      };
    } else if (textContents[id]) {
      return {
        id,
        type: "text",
        content: textContents[id],
      };
    } else {
      return {
        id,
        type: "text",
        content: { text: "", type: "plain" },
      };
    }
  });

const NotationEditor: React.FC<NotationEditorProps> = ({
  noteId,
  defaultZoom,
  resetZoomSignal,
  order,
  editorStates,
  setEditorStates,
  textContents,
  setTextContents,
  addCell,
  duplicateCell,
  deleteCell,
  updateOrder,
  showLatexMap,
  setShowLatexMap,
  metadata,
  setMetadata,
  onDropNode,
}) => {
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { mode } = useEditorMode();
  const isEditMode = mode === "edit";
  // const isLockedMode = mode === "locked";

  const {
    draggingCellId,
    dragOverInsertIndex,
    startDrag,
    updateDragOver,
    endDrag,
  } = useCellDragState();

  const baseCells = useMemo(
    () => reconstructCells(order, editorStates, textContents),
    [order, editorStates, textContents]
  );

  const textCellIds = useMemo(
    () => baseCells
      .filter((cell) => cell.type === "text")
      .map((cell) => cell.id),
    [baseCells]
  );
  
  const displayNumbers = useMemo(
    () =>
      !isEditMode
        ? computeDisplayNumbers(textContents, textCellIds)
        : {},
    [isEditMode, textContents, textCellIds]
  );

  const [visibleCells, setVisibleCells] = useState(baseCells);
  const [, startTransition] = useTransition();

  const prevNoteIdRef = useRef(noteId);
  const baseCellsRef = useRef(baseCells);
  baseCellsRef.current = baseCells;

  useEffect(() => {
    if (noteId === prevNoteIdRef.current) {
      setVisibleCells(baseCells);
    }
    prevNoteIdRef.current = noteId;
  }, [baseCells, noteId]);

  useEffect(() => {
    if (noteId !== prevNoteIdRef.current) {
      startTransition(() => {
        setVisibleCells(baseCellsRef.current);
      });
      prevNoteIdRef.current = noteId;
    }
  }, [noteId]);

  // const updateCellContent = useCallback((id: string, newContent: TextCellContent) => {
  //   setTextContents(prev => {
  //     const prevContent = prev[id];
  //     if (
  //       prevContent?.text === newContent.text &&
  //       prevContent?.type === newContent.type
  //     ) {
  //       return prev; // Avoid object recreation
  //     }
  //     return { ...prev, [id]: newContent };
  //   });
  // }, [setTextContents]);

  const updateCellContent = useCallback(
    (id: string, partialContent: Partial<TextCellContent>) => {
      setTextContents(prev => {
        const prevContent = prev[id];
  
        if (!prevContent) return prev; // or handle missing cell gracefully
  
        const updatedContent = { ...prevContent, ...partialContent };
  
        if (
          prevContent.text === updatedContent.text &&
          prevContent.type === updatedContent.type
        ) {
          return prev; // No actual change
        }
  
        return { ...prev, [id]: updatedContent };
      });
    },
    [setTextContents]
  );
  

  const toggleShowLatex = useCallback((cellId: string) => {
    setShowLatexMap((prev) => ({ ...prev, [cellId]: !prev[cellId] }));
  }, [setShowLatexMap]);

  const handleMetadataUpdate = useCallback((partial: Partial<NoteMetadata>) => {
    if (noteId) setMetadata(noteId, partial);
  }, [noteId, setMetadata]);

  const updateEditorState = useCallback((id: string, newState: EditorState) => {
    setEditorStates((prev) => ({ ...prev, [id]: newState }));
  }, [setEditorStates]);

  const memoizedUpdateEditorStateFns = useMemo(() => {
    const fns: Record<string, (newState: EditorState) => void> = {};
    for (const id of order) {
      fns[id] = (newState) => updateEditorState(id, newState);
    }
    return fns;
  }, [order, updateEditorState]);

  const handlePointerDown = useCallback((e: React.PointerEvent, id: string, index: number) => {
    e.preventDefault();
    startDrag(id, index);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const rects = cellRefs.current.map((ref) => ref?.getBoundingClientRect());
      const cursorY = moveEvent.clientY;
      const overIndexRaw = rects.findIndex(
        (rect) => rect && cursorY < rect.top + rect.height / 2
      );
      const overIndex = overIndexRaw === -1 ? rects.length : overIndexRaw;
      updateDragOver(overIndex);
    };

    const handlePointerUp = () => {
      const { from, to } = endDrag();
      if (from !== null && to !== null && from !== to) {
        const newOrder = [...order];
        const [movedId] = newOrder.splice(from, 1);
        newOrder.splice(from < to ? to - 1 : to, 0, movedId);
        updateOrder(newOrder);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [startDrag, updateDragOver, endDrag, order, updateOrder]);

  return (
    <main
      className={styles.editorLayout}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest(".cell")) {
          setSelectedCellId(null);
        }
      }}
    >
      <NoteMetaDataSection
        metadata={metadata}
        setMetadata={handleMetadataUpdate}
      />

      <div className={styles.cellList}>
        {visibleCells.length === 0 && (
          <div className={styles.emptyMessage}>
            No cells yet. Add one to get started!
          </div>
        )}

        {visibleCells.map((cell, index) => (
          <CellRow
            key={cell.id}
            cell={cell}
            index={index}
            displayNumber={displayNumbers[cell.id]}
            selectedCellId={selectedCellId}
            draggingCellId={draggingCellId}
            dragOverInsertIndex={dragOverInsertIndex}
            updateDragOver={updateDragOver}
            editorStates={editorStates}
            updateEditorStates={memoizedUpdateEditorStateFns}
            cellRefs={cellRefs}
            showLatexMap={showLatexMap}
            defaultZoom={defaultZoom}
            resetZoomSignal={resetZoomSignal}
            addCell={addCell}
            updateCellContent={updateCellContent}
            deleteCell={deleteCell}
            duplicateCell={duplicateCell}
            toggleShowLatex={toggleShowLatex}
            handlePointerDown={handlePointerDown}
            setSelectedCellId={setSelectedCellId}
            onDropNode={onDropNode}
          />
        ))}

        {/* Insertion zone after last cell */}
        <div
          className={clsx(
            styles.insertZone,
            { [styles.dragOver]: dragOverInsertIndex === visibleCells.length}
          )}
          onPointerEnter={() => draggingCellId !== null && updateDragOver(visibleCells.length)}
        >
          <InsertCellButtons
            onInsert={useCallback(
              (type) => addCell(type, visibleCells.length),
              [addCell, visibleCells.length]
            )}
            isPermanent={true}
          />
        </div>
      </div>
    </main>
  );
};

export default NotationEditor;

