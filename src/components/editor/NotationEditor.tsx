// // components/editor/NotationEditor.tsx
// import React, { useState, useRef } from "react";
// import InsertCellButtons from "../cells/InsertCellButtons";
// import BaseCell from "../cells/BaseCell";
// import TextCell from "../cells/TextCell";
// import MathCell from "../cells/MathCell";
// import { useCellDragState } from "../../hooks/useCellDragState";
// import styles from "./Editor.module.css";
// import Tooltip from "../tooltips/Tooltip";
// import NoteMetaDataSection from "./NoteMetadataSection";

// import type { CellData, NoteMetadata } from "../../models/noteTypes";
// import type { EditorState } from "../../logic/editor-state";
// import type { MathNode } from "../../models/types";
// import clsx from "clsx";

// interface NotationEditorProps {
//   isPreviewMode: boolean;
//   defaultZoom: number;
//   resetZoomSignal: number;
//   noteId: string | null;

//   /** Now we receive only the cell order (IDs) */
//   order: string[];

//   /** And editorStates map with math cells only */
//   editorStates: Record<string, EditorState>;

//   /** And editorStates map with math cells only */
//   textContents: Record<string, string>;
//   setTextContents: React.Dispatch<
//     React.SetStateAction<Record<string, string>>
//   >;


//   /** Callback to update editorStates */
//   setEditorStates: React.Dispatch<
//     React.SetStateAction<Record<string, EditorState>>
//   >;

//   /** Callback to add new cell */
//   addCell: (type: "math" | "text", index?: number) => void;

//   /** Callback to update cell order after drag or delete */
//   updateOrder: (newOrder: string[]) => void;

//   showLatexMap: Record<string, boolean>;
//   setShowLatexMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

//   metadata: NoteMetadata;
//   setMetadata: React.Dispatch<React.SetStateAction<NoteMetadata>>;

//   onDropNode: (
//     from: {
//       sourceType: "cell" | "library";
//       cellId?: string;
//       containerId: string;
//       index: number;
//       node: MathNode;
//     },
//     to: {
//       cellId: string;
//       containerId: string;
//       index: number;
//     }
//   ) => void;
// }

// /** 
//  * Helper: reconstruct minimal cells array with at least id and type,
//  * Since the source of truth is order + editorStates,
//  * and text cells are not in editorStates, so store their content here.
//  * 
//  * For text cells, assume their content is stored elsewhere or empty for now.
//  * 
//  * To fully support text cell content, you'll need to maintain
//  * a separate map of text cell contents in EditorPane or context.
//  */
// const reconstructCells = (
//   order: string[],
//   editorStates: Record<string, EditorState>,
//   // Optional: external text contents map (cellId -> content)
//   textContents: Record<string, string> = {}
// ): CellData[] => {
//   return order.map((id) => {
//     if (editorStates[id]) {
//       // math cell
//       return {
//         id,
//         type: "math",
//         content: "", // math content is in editorState, content string unused
//       };
//     } else {
//       // text cell
//       return {
//         id,
//         type: "text",
//         content: textContents[id] || "",
//       };
//     }
//   });
// };

// const NotationEditor: React.FC<NotationEditorProps> = ({
//   isPreviewMode,
//   defaultZoom,
//   resetZoomSignal,
//   order,
//   editorStates,
//   setEditorStates,
//   textContents,
//   setTextContents,
//   addCell,
//   updateOrder,
//   showLatexMap,
//   setShowLatexMap,
//   metadata,
//   setMetadata,
//   onDropNode,
// }) => {
//   const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
//   const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);

//   const {
//     draggingCellId,
//     dragOverInsertIndex,
//     startDrag,
//     updateDragOver,
//     endDrag,
//   } = useCellDragState();

//   const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

//   // Because text cells' content must be tracked somewhere,
//   // here we keep a local state for text contents:
//   //const [textContents, setTextContents] = useState<Record<string, string>>({});

//   // Initialize textContents when order changes (for new text cells)
//   React.useEffect(() => {
//     const newTextContents = { ...textContents };
//     order.forEach((id) => {
//       if (!editorStates[id] && !(id in newTextContents)) {
//         newTextContents[id] = "";
//       }
//     });
//     setTextContents(newTextContents);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [order]);

//   const cells = reconstructCells(order, editorStates, textContents);

//   const updateCellContent = (id: string, newContent: string) => {
//     // Update local text content state
//     setTextContents((prev) => ({
//       ...prev,
//       [id]: newContent,
//     }));
//   };

//   const deleteCell = (id: string) => {
//     const newOrder = order.filter((cellId) => cellId !== id);
//     updateOrder(newOrder);

//     // Remove text content if text cell
//     if (!editorStates[id]) {
//       setTextContents((prev) => {
//         const copy = { ...prev };
//         delete copy[id];
//         return copy;
//       });
//     }

//     // Remove editorState if math cell
//     if (editorStates[id]) {
//       setEditorStates((prev) => {
//         const copy = { ...prev };
//         delete copy[id];
//         return copy;
//       });

//       // Also update showLatexMap
//       setShowLatexMap((prev) => {
//         const copy = { ...prev };
//         delete copy[id];
//         return copy;
//       });
//     }

//     // If selected cell was deleted, clear selection
//     if (selectedCellId === id) {
//       setSelectedCellId(null);
//     }
//   };

//   const toggleShowLatex = (cellId: string) => {
//     setShowLatexMap((prev) => ({ ...prev, [cellId]: !prev[cellId] }));
//   };

//   const handlePointerDown = (
//     e: React.PointerEvent,
//     id: string,
//     index: number
//   ) => {
//     e.preventDefault();
//     startDrag(id, index);

//     const handlePointerMove = (moveEvent: PointerEvent) => {
//       moveEvent.preventDefault();
//       const rects = cellRefs.current.map((ref) =>
//         ref?.getBoundingClientRect()
//       );
//       const cursorY = moveEvent.clientY;
//       const overIndex = rects.findIndex(
//         (rect) => rect && cursorY < rect.top + rect.height / 2
//       );
//       // updateDragOver(overIndex === -1 ? cells.length : overIndex);
//       updateDragOver(overIndex);
//     };

//     const handlePointerUp = () => {
//       const { from, to } = endDrag();
//       if (from !== null && to !== null && from !== to) {
//         // reorder order array
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
//   };

//   return (
//     <main
//       className={styles.editorLayout}
//       onClick={(e) => {
//         if (!(e.target as HTMLElement).closest(".cell")) {
//           setSelectedCellId(null);
//         }
//       }}
//     >
//       <NoteMetaDataSection
//         metadata={metadata}
//         setMetadata={setMetadata}
//         isPreviewMode={isPreviewMode}
//       />

//       <div className={styles.cellList}>
//         {cells.map((cell, index) => (
//           <React.Fragment key={cell.id}>
//             <div
//               className={`insert-zone ${
//                 dragOverInsertIndex === index ? "drag-over" : ""
//               }`}
//               onMouseEnter={() => setHoveredInsertIndex(index)}
//               onMouseLeave={() => setHoveredInsertIndex(null)}
//               onPointerEnter={() =>
//                 draggingCellId !== null && updateDragOver(index)
//               }
//             >
//               <InsertCellButtons
//                 onInsert={(type) => addCell(type, index)}
//                 isVisible={hoveredInsertIndex === index}
//               />
//             </div>

//             <div
//               ref={(el) => {
//                 if (el) cellRefs.current[index] = el;
//               }}
//             >
//               <BaseCell
//                 typeLabel={cell.type === "math" ? "Math" : "Text"} // Change this when more cell types are added in the (hypothetical) future
//                 isSelected={selectedCellId === cell.id}
//                 isPreviewMode={isPreviewMode}
//                 isDragging={draggingCellId === cell.id}
//                 onClick={() => setSelectedCellId(cell.id)}
//                 onDelete={() => deleteCell(cell.id)}
//                 handlePointerDown={(e) => handlePointerDown(e, cell.id, index)}
//                 toolbarExtras={
//                   cell.type === "math" ? (
//                     <Tooltip
//                       text={
//                         showLatexMap[cell.id]
//                           ? "Hide LaTeX output for this cell"
//                           : "Show LaTeX output for this cell"
//                       }
//                     >
//                       <button
//                         className={clsx("button", "preview-button")}
//                         onClick={() => toggleShowLatex(cell.id)}
//                       >
//                         {showLatexMap[cell.id] ? "🙈 LaTeX" : "👁️ LaTeX"}
//                       </button>
//                     </Tooltip>
//                   ) : null
//                 }
//               >
//                 {cell.type === "text" ? (
//                   <TextCell
//                     value={cell.content}
//                     isPreviewMode={isPreviewMode}
//                     onChange={(newValue) => updateCellContent(cell.id, newValue)}
//                   />
//                 ) : (
//                   <MathCell
//                     cellId={cell.id}
//                     isPreviewMode={isPreviewMode}
//                     defaultZoom={defaultZoom}
//                     resetZoomSignal={resetZoomSignal}
//                     showLatex={showLatexMap[cell.id] ?? false}
//                     editorState={editorStates[cell.id]}
//                     updateEditorState={(newState) =>
//                       setEditorStates((prev) => ({ ...prev, [cell.id]: newState }))
//                     }
//                     onDropNode={onDropNode}
//                   />
//                 )}
//               </BaseCell>
//             </div>
//           </React.Fragment>
//         ))}
//       </div>

//       <div
//         className={`insert-zone ${
//           dragOverInsertIndex === cells.length ? "drag-over" : ""
//         }`}
//         onMouseEnter={() => setHoveredInsertIndex(cells.length)}
//         onMouseLeave={() => setHoveredInsertIndex(null)}
//         onPointerEnter={() =>
//           draggingCellId !== null && updateDragOver(cells.length)
//         }
//       >
//         <InsertCellButtons
//           onInsert={(type) => addCell(type)}
//           isVisible={isPreviewMode ? hoveredInsertIndex === cells.length : true}
//         />
//       </div>
//     </main>
//   );
// };

// export default NotationEditor;

import React, { useState, useRef } from "react";
import InsertCellButtons from "../cells/InsertCellButtons";
import BaseCell from "../cells/BaseCell";
import TextCell from "../cells/TextCell";
import MathCell from "../cells/MathCell";
import { useCellDragState } from "../../hooks/useCellDragState";
import styles from "./Editor.module.css";
import Tooltip from "../tooltips/Tooltip";
import NoteMetaDataSection from "./NoteMetadataSection";
import clsx from "clsx";

import type { CellData, NoteMetadata } from "../../models/noteTypes";
import type { EditorState } from "../../logic/editor-state";
import type { MathNode } from "../../models/types";

interface NotationEditorProps {
  isPreviewMode: boolean;
  defaultZoom: number;
  resetZoomSignal: number;
  noteId: string | null;

  /** Cell order (source of truth) */
  order: string[];

  /** Editor state for math cells only */
  editorStates: Record<string, EditorState>;
  setEditorStates: React.Dispatch<React.SetStateAction<Record<string, EditorState>>>;

  /** Text content state (externalized for undo/redo) */
  textContents: Record<string, string>;
  setTextContents: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  /** Drag/reorder insertion */
  addCell: (type: "math" | "text", index?: number) => void;
  deleteCell: (id: string) => void;
  updateOrder: (newOrder: string[]) => void;

  /** Math preview visibility */
  showLatexMap: Record<string, boolean>;
  setShowLatexMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  /** Note metadata */
  metadata: NoteMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<NoteMetadata>>;

  /** Drag-and-drop math node handler */
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
}

/** Constructs a unified list of cells from order + state maps */
const reconstructCells = (
  order: string[],
  editorStates: Record<string, EditorState>,
  textContents: Record<string, string>,
): CellData[] => {
  return order.map((id) =>
    editorStates[id]
      ? { id, type: "math", content: "" } // math content is in editorState, content string unused
      : { id, type: "text", content: textContents[id] || "" }
  );
};

// const reconstructCells = (
//   order: string[],
//   editorStates: Record<string, EditorState>,
//   // Optional: external text contents map (cellId -> content)
//   textContents: Record<string, string> = {}
// ): CellData[] => {
//   return order.map((id) => {
//     if (editorStates[id]) {
//       // math cell
//       return {
//         id,
//         type: "math",
//         content: "", // math content is in editorState, content string unused
//       };
//     } else {
//       // text cell
//       return {
//         id,
//         type: "text",
//         content: textContents[id] || "",
//       };
//     }
//   });
// };

const NotationEditor: React.FC<NotationEditorProps> = ({
  isPreviewMode,
  defaultZoom,
  resetZoomSignal,
  order,
  editorStates,
  setEditorStates,
  textContents,
  setTextContents,
  addCell,
  deleteCell,
  updateOrder,
  showLatexMap,
  setShowLatexMap,
  metadata,
  setMetadata,
  onDropNode,
}) => {
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);

  const {
    draggingCellId,
    dragOverInsertIndex,
    startDrag,
    updateDragOver,
    endDrag,
  } = useCellDragState();

  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  /** Derived cells list from current state */
  const cells = reconstructCells(order, editorStates, textContents);

  /** Updates local text cell content */
  const updateCellContent = (id: string, newContent: string) => {
    setTextContents((prev) => ({ ...prev, [id]: newContent }));
  };

  // /** Deletes a cell completely from all relevant state layers */
  // const deleteCell = (id: string) => {
  //   // Remove ID from order
  //   const newOrder = order.filter((cellId) => cellId !== id);
  //   updateOrder(newOrder);

  //   // Remove editorState if present (math)
  //   setEditorStates((prev) => {
  //     const copy = { ...prev };
  //     delete copy[id];
  //     return copy;
  //   });

  //   // Remove text content if present (text)
  //   setTextContents((prev) => {
  //     const copy = { ...prev };
  //     delete copy[id];
  //     return copy;
  //   });

  //   // Remove LaTeX toggle state
  //   setShowLatexMap((prev) => {
  //     const copy = { ...prev };
  //     delete copy[id];
  //     return copy;
  //   });

  //   // Reset selection
  //   if (selectedCellId === id) setSelectedCellId(null);
  // };

  /** Toggles LaTeX preview for a math cell */
  const toggleShowLatex = (cellId: string) => {
    setShowLatexMap((prev) => ({ ...prev, [cellId]: !prev[cellId] }));
  };

  /** Handles drag start + pointer movement for reordering */
  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    index: number
  ) => {
    e.preventDefault();
    startDrag(id, index);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const rects = cellRefs.current.map((ref) => ref?.getBoundingClientRect());
      const cursorY = moveEvent.clientY;
      const overIndex = rects.findIndex(
        (rect) => rect && cursorY < rect.top + rect.height / 2
      );
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
  };

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
        setMetadata={setMetadata}
        isPreviewMode={isPreviewMode}
      />

      <div className={styles.cellList}>
        {cells.map((cell, index) => (
          <React.Fragment key={cell.id}>
            <div
              className={`insert-zone ${
                dragOverInsertIndex === index ? "drag-over" : ""
              }`}
              onMouseEnter={() => setHoveredInsertIndex(index)}
              onMouseLeave={() => setHoveredInsertIndex(null)}
              onPointerEnter={() =>
                draggingCellId !== null && updateDragOver(index)
              }
            >
              <InsertCellButtons
                onInsert={(type) => addCell(type, index)}
                isVisible={hoveredInsertIndex === index}
              />
            </div>

            <div
              ref={(el) => {
                if (el) cellRefs.current[index] = el;
              }}
            >
              <BaseCell
                typeLabel={cell.type === "math" ? "Math" : "Text"}
                isSelected={selectedCellId === cell.id}
                isPreviewMode={isPreviewMode}
                isDragging={draggingCellId === cell.id}
                onClick={() => setSelectedCellId(cell.id)}
                onDelete={() => deleteCell(cell.id)}
                handlePointerDown={(e) =>
                  handlePointerDown(e, cell.id, index)
                }
                toolbarExtras={
                  cell.type === "math" ? (
                    <Tooltip
                      text={
                        showLatexMap[cell.id]
                          ? "Hide LaTeX output for this cell"
                          : "Show LaTeX output for this cell"
                      }
                    >
                      <button
                        className={clsx("button", "preview-button")}
                        onClick={() => toggleShowLatex(cell.id)}
                      >
                        {showLatexMap[cell.id] ? "🙈 LaTeX" : "👁️ LaTeX"}
                      </button>
                    </Tooltip>
                  ) : null
                }
              >
                {cell.type === "text" ? (
                  <TextCell
                    value={cell.content}
                    isPreviewMode={isPreviewMode}
                    onChange={(newValue) =>
                      updateCellContent(cell.id, newValue)
                    }
                  />
                ) : (
                  <MathCell
                    cellId={cell.id}
                    isPreviewMode={isPreviewMode}
                    defaultZoom={defaultZoom}
                    resetZoomSignal={resetZoomSignal}
                    showLatex={showLatexMap[cell.id] ?? false}
                    editorState={editorStates[cell.id]}
                    updateEditorState={(newState) =>
                      setEditorStates((prev) => ({
                        ...prev,
                        [cell.id]: newState,
                      }))
                    }
                    onDropNode={onDropNode}
                  />
                )}
              </BaseCell>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div
        className={`insert-zone ${
          dragOverInsertIndex === cells.length ? "drag-over" : ""
        }`}
        onMouseEnter={() => setHoveredInsertIndex(cells.length)}
        onMouseLeave={() => setHoveredInsertIndex(null)}
        onPointerEnter={() =>
          draggingCellId !== null && updateDragOver(cells.length)
        }
      >
        <InsertCellButtons
          onInsert={(type) => addCell(type)}
          isVisible={isPreviewMode ? hoveredInsertIndex === cells.length : true}
        />
      </div>
    </main>
  );
};

export default NotationEditor;
