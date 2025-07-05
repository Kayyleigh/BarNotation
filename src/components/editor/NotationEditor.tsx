// components/editor/NotationEditor.tsx
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useTransition,
} from "react";
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
  order: string[];
  editorStates: Record<string, EditorState>;
  setEditorStates: React.Dispatch<React.SetStateAction<Record<string, EditorState>>>;
  textContents: Record<string, string>;
  setTextContents: React.Dispatch<React.SetStateAction<Record<string, string>>>;
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
  textContents: Record<string, string> = {}
): CellData[] =>
  order.map((id) =>
    editorStates[id]
      ? { id, type: "math", content: nodeToLatex(editorStates[id].rootNode) }
      : { id, type: "text", content: textContents[id] || "" }
  );

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
  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const [visibleCells, setVisibleCells] = useState(baseCells);
  const [isPending, startTransition] = useTransition();

  const prevNoteIdRef = useRef(noteId);
  const baseCellsRef = useRef(baseCells);
  baseCellsRef.current = baseCells;

  // Update visibleCells immediately when baseCells change *and* noteId is the same (typing/editing)
  useEffect(() => {
    if (noteId === prevNoteIdRef.current) {
      setVisibleCells(baseCells);
    }
    // Always update ref after check
    prevNoteIdRef.current = noteId;
  }, [baseCells, noteId]);

  // Run transition only when noteId changes (loading spinner shown)
  useEffect(() => {
    if (noteId !== prevNoteIdRef.current) {
      startTransition(() => {
        setVisibleCells(baseCellsRef.current);
      });
      prevNoteIdRef.current = noteId;
    }
  }, [noteId]);

  const updateCellContent = useCallback((id: string, newContent: string) => {
    setTextContents((prev) => ({ ...prev, [id]: newContent }));
  }, [setTextContents]);

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
  }, [order, startDrag, updateDragOver, endDrag, updateOrder]);

  return (
    <main className={styles.editorLayout} onClick={(e) => {
      if (!(e.target as HTMLElement).closest(".cell")) {
        setSelectedCellId(null);
      }
    }}>
      <NoteMetaDataSection
        metadata={metadata}
        setMetadata={handleMetadataUpdate}
        isPreviewMode={isPreviewMode}
      />

      <div className={styles.cellList}>
        {(visibleCells.length > 3 && isPending) ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading cells, this may take a while...</p>
          </div>
        ) : visibleCells.length === 0 ? (
          <div className={styles.emptyMessage}>
            No cells yet. Add one to get started!
          </div>
        ) : visibleCells.map((cell, index) => (
          <React.Fragment key={cell.id}>
            <div
              className={`insert-zone ${dragOverInsertIndex === index ? "drag-over" : ""}`}
              onMouseEnter={() => setHoveredInsertIndex(index)}
              onMouseLeave={() => setHoveredInsertIndex(null)}
              onPointerEnter={() => draggingCellId !== null && updateDragOver(index)}
            >
              <InsertCellButtons
                onInsert={(type) => addCell(type, index)}
                isVisible={hoveredInsertIndex === index}
              />
            </div>

            <div ref={(el) => { if (el) cellRefs.current[index] = el; }}>
              <BaseCell
                typeLabel={cell.type === "math" ? "Math" : "Text"}
                isSelected={selectedCellId === cell.id}
                isPreviewMode={isPreviewMode}
                isDragging={draggingCellId === cell.id}
                onClick={() => setSelectedCellId(cell.id)}
                onDelete={() => deleteCell(cell.id)}
                onDuplicate={() => duplicateCell(cell.id)}
                handlePointerDown={(e) => handlePointerDown(e, cell.id, index)}
                toolbarExtras={cell.type === "math" ? (
                  <Tooltip text={showLatexMap[cell.id] ? "Hide LaTeX output" : "Show LaTeX output"}>
                    <button
                      className={clsx("button", "preview-button")}
                      onClick={() => toggleShowLatex(cell.id)}
                    >
                      {showLatexMap[cell.id] ? "🙈 LaTeX" : "👁️ LaTeX"}
                    </button>
                  </Tooltip>
                ) : null}
              >
                {cell.type === "text" ? (
                  <TextCell
                    value={cell.content}
                    isPreviewMode={isPreviewMode}
                    onChange={(newVal) => updateCellContent(cell.id, newVal)}
                  />
                ) : editorStates[cell.id] ? (
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
                ) : (
                  <div className={styles.loadingContainer}>
                    <p className={styles.loadingText}>Loading...</p>
                  </div>
                )}
              </BaseCell>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div
        className={`insert-zone ${dragOverInsertIndex === visibleCells.length ? "drag-over" : ""}`}
        onMouseEnter={() => setHoveredInsertIndex(visibleCells.length)}
        onMouseLeave={() => setHoveredInsertIndex(null)}
        onPointerEnter={() => draggingCellId !== null && updateDragOver(visibleCells.length)}
      >
        <InsertCellButtons
          onInsert={(type) => addCell(type)}
          isVisible={isPreviewMode ? hoveredInsertIndex === visibleCells.length : true}
        />
      </div>
    </main>
  );
};

export default React.memo(NotationEditor);
