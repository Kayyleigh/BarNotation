// components/editor/NotationEditor.tsx
import React, { useState, useRef, useCallback, useMemo, useTransition, useEffect } from "react";
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
import { nodeToLatex } from "../../models/nodeToLatex";
import type { DropTarget } from "../layout/EditorWorkspace";
import type { DragSource } from "../../hooks/DragContext";

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
  // setMetadata: React.Dispatch<React.SetStateAction<NoteMetadata>>;
  setMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;

  /** Drag-and-drop math node handler */
  onDropNode: (
    from: DragSource,
    to: DropTarget,
  ) => void;
}

/** Constructs a unified list of cells from order + state maps */
const reconstructCells = (
  order: string[],
  editorStates: Record<string, EditorState>,
  textContents: Record<string, string> = {},
): CellData[] => {
  return order.map((id) =>
    editorStates[id]
      ? { id, type: "math", content: nodeToLatex(editorStates[id].rootNode) } // math content is in editorState, content string unused
      : { id, type: "text", content: textContents[id] || "" }
  );
};

const NotationEditor: React.FC<NotationEditorProps> = ({
  noteId,
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
  // console.log("Rendering NotationEditor", noteId);

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);

  const handleMetadataUpdate = useCallback(
    (partialMetadata: Partial<NoteMetadata>) => {
      if (noteId) {
        setMetadata(noteId, partialMetadata);
      }
    },
    [noteId, setMetadata]
  );  

  const {
    draggingCellId,
    dragOverInsertIndex,
    startDrag,
    updateDragOver,
    endDrag,
  } = useCellDragState();

  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  //TODO SYNC WITH GLOBALLLL
  //rn there is just no cells at all in actual global. Duplicate does say 3 cells but it does not show em 

  // States for loading phases
  const [cellsReady, setCellsReady] = useState(false);
  const [, startTransition] = useTransition(); //'isPending' is assigned a value but never used.eslint@typescript-eslint/no-unused-vars

  /** Derived cells list from current state */
  const cells = useMemo(() => {
    return reconstructCells(order, editorStates, textContents);
  }, [order, editorStates, textContents]);

  // Reset loading state on cells data change and start transition to ready
  useEffect(() => {
    setCellsReady(false);
    
    startTransition(() => {
      setTimeout(() => {
        setCellsReady(true);
      }, 0);
    });
  }, [noteId]);

  useEffect(() => {
    if (cellsReady) return;
  
    const timer = setTimeout(() => {
      setCellsReady(true);
    }, 0);
  
    return () => clearTimeout(timer);
  }, [cellsReady]);

  /** Updates local text cell content */
  const updateCellContent = (id: string, newContent: string) => {
    setTextContents((prev) => ({ ...prev, [id]: newContent }));
  };

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

  const updateEditorState = useCallback(
    (id: string, newState: EditorState) => {
      setEditorStates((prev) => ({
        ...prev,
        [id]: newState,
      }));
    },
    [setEditorStates]
  );

  const memoizedUpdateEditorStateFns = useMemo(() => {
    const fns: Record<string, (newState: EditorState) => void> = {};
    order.forEach((id) => {
      fns[id] = (newState: EditorState) => updateEditorState(id, newState);
    });
    return fns;
  }, [order, updateEditorState]);

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
        setMetadata={handleMetadataUpdate} //??? TODO
        isPreviewMode={isPreviewMode}
      />

      <div className={styles.cellList}>
        {!cellsReady ? (
          // Show loading spinner while cells prepare
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading cells, this may take a while...</p>
          </div>
        ) : cells.length === 0 ? (
          <div className={styles.emptyMessage}>
            No cells yet. Add one to get started!
          </div>
        ) : (        
          cells.map((cell, index) => (
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
                      updateEditorState={memoizedUpdateEditorStateFns[cell.id]}
                      onDropNode={onDropNode}
                    />
                  )}
                </BaseCell>
              </div>
            </React.Fragment>
          )))}
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

export default React.memo(NotationEditor);
