// components/editor/NotebookEditor.tsx
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useTransition,
} from "react";
import InsertCellButtons from "./cells/InsertCellButtons";
import { useCellDragState } from "../../hooks/cellDrag/useCellDragState";
import styles from "./Editor.module.css";
import NoteMetaDataSection from "./noteMetadata/NoteMetadataSection";
import type { CellData, NoteMetadata, TextCellContent } from "../../models/noteTypes";
import type { EditorState } from "../../logic/editor-state";
import { useEditorMode } from "../../hooks/editorMode/useEditorMode";
import cellStyles from "./cells/cell.module.css";
import { useI18n } from "../../i18n/useI18n";
import type { DragSource, DropTarget } from "../../models/dragTypes";
import { CellRenderer } from "./cells/CellRenderer";
import { computeDisplayNumbers, reconstructCells } from "../../utils/noteUtils";
import { createNotebookKeyMap } from "./notebookShortcuts";
import type { TextCellType } from "../../models/textTypes";

interface NotebookEditorProps {
  defaultZoom: number;
  resetZoomSignal: number;
  noteId: string | null;
  order: string[];
  editorStates: Record<string, EditorState>;
  setEditorStates: React.Dispatch<React.SetStateAction<Record<string, EditorState>>>;
  textContents: Record<string, TextCellContent>;
  setTextContents: React.Dispatch<React.SetStateAction<Record<string, TextCellContent>>>;
  addCellRef: React.RefObject<(type: "math" | "text", index?: number) => string>;
  duplicateCell: (id: string) => string;
  deleteCell: (id: string) => string | null;
  updateOrder: (newOrder: string[]) => void;
  showLatexMap: Record<string, boolean>;
  setShowLatexMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  metadata: NoteMetadata;
  setMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
}

// Small wrapper that can use hooks per cell
const CellRendererWrapper: React.FC<{
  cell: CellData;
  index: number;
  isSelected: boolean;
  setSelectedCellId: (id: string) => void;
  editorStates: Record<string, EditorState>;
  // textContents: Record<string, TextCellContent>;
  showLatexMap: Record<string, boolean>;
  displayNumbers: Record<string, string>;
  updateEditorState: (id: string, state: EditorState) => void;
  updateTextCellContent: (id: string, content: Partial<TextCellContent>) => void;
  toggleShowLatex: (id: string) => void;
  handleDeleteCell: (id: string) => void;
  handleDuplicateCell: (id: string) => void;
  setCellRef: (index: number) => (el: HTMLDivElement | null) => void;
  draggingCellId: string | null;
  dragOverInsertIndex: number | null;
  updateDragOver: (index: number) => void;
  handleInsertAtIndex: (type: "math" | "text", idx: number) => void;
  handlePointerDown: (e: React.PointerEvent, id: string, index: number) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
  resetZoomSignal: number;
  defaultZoom: number;
}> = React.memo(({
  cell,
  index,
  isSelected,
  setSelectedCellId,
  editorStates,
  // textContents,
  showLatexMap,
  displayNumbers,
  updateEditorState,
  updateTextCellContent,
  toggleShowLatex,
  handleDeleteCell,
  handleDuplicateCell,
  setCellRef,
  draggingCellId,
  dragOverInsertIndex,
  updateDragOver,
  handleInsertAtIndex,
  handlePointerDown,
  onDropNode,
  resetZoomSignal,
  defaultZoom,
}) => {
  // Extract per-cell state
  const editorState = editorStates[cell.id];
  // const textContent = textContents[cell.id];
  const showLatex = showLatexMap[cell.id] ?? false;
  const displayNumber = displayNumbers[cell.id];

  // Stable handlers bound to this cell
  const handleUpdateEditorState = useCallback(
    (newState: EditorState) => updateEditorState(cell.id, newState),
    [cell.id, updateEditorState]
  );

  const handleUpdateTextContent = useCallback( //TODO optimize
    (newRole: TextCellType) =>
      updateTextCellContent(cell.id, { ...cell.content, type: newRole }),
    [cell.content, cell.id, updateTextCellContent]
  );

  const handleToggleLatex = useCallback(
    () => toggleShowLatex(cell.id),
    [cell.id, toggleShowLatex]
  );

  const selectCell = useCallback(
    () => setSelectedCellId(cell.id),
    [cell.id, setSelectedCellId]
  );

  const handleDelete = useCallback(
    () => handleDeleteCell(cell.id),
    [cell.id, handleDeleteCell]
  );

  const handleDuplicate = useCallback(
    () => handleDuplicateCell(cell.id),
    [cell.id, handleDuplicateCell]
  );

  return (
    <CellRenderer
      key={cell.id}
      ref={setCellRef(index)}
      cell={cell}
      index={index}
      isSelected={isSelected}
      selectCell={selectCell}
      draggingCellId={draggingCellId}
      updateDragOver={updateDragOver}
      dragOverInsertIndex={dragOverInsertIndex}
      handleInsertAtIndex={handleInsertAtIndex}
      handlePointerDown={handlePointerDown}
      deleteCell={handleDelete}
      duplicateCell={handleDuplicate}
      updateTextRole={handleUpdateTextContent}
      toggleShowLatex={handleToggleLatex}
      showLatex={showLatex}
      onDropNode={onDropNode}
      resetZoomSignal={resetZoomSignal}
      defaultZoom={defaultZoom}
      editorState={editorState}
      updateEditorState={handleUpdateEditorState}
      displayNumber={displayNumber}
    />
  );
});

const NotebookEditor: React.FC<NotebookEditorProps> = ({
  noteId,
  defaultZoom,
  resetZoomSignal,
  order,
  editorStates,
  setEditorStates,
  textContents,
  setTextContents,
  addCellRef,
  duplicateCell,
  deleteCell,
  updateOrder,
  showLatexMap,
  setShowLatexMap,
  metadata,
  setMetadata,
  onDropNode,
}) => {
  const { t } = useI18n(); // use language hook

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { editingMode } = useEditorMode();

  const {
    draggingCellId,
    dragOverInsertIndex,
    startDrag: startCellDrag,
    updateDragOver: updateCellDragOver,
    endDrag: endCellDrag,
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
      editingMode !== "edit"
        ? computeDisplayNumbers(textContents, textCellIds)
        : {},
    [editingMode, textContents, textCellIds]
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

  const updateTextCellContent = useCallback( //TODO ACTUALLY USE THIS !!! ATM NOT DOING IT!!!
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

  const handlePointerDown = useCallback((e: React.PointerEvent, id: string, index: number) => {
    e.preventDefault();
    startCellDrag(id, index);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const rects = cellRefs.current.map((ref) => ref?.getBoundingClientRect());
      const cursorY = moveEvent.clientY;
      const overIndexRaw = rects.findIndex(
        (rect) => rect && cursorY < rect.top + rect.height / 2
      );
      const overIndex = overIndexRaw === -1 ? rects.length : overIndexRaw;
      updateCellDragOver(overIndex);
    };

    const handlePointerUp = () => {
      const { from, to } = endCellDrag();
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
  }, [startCellDrag, updateCellDragOver, endCellDrag, order, updateOrder]);

  // Track pending selection
  const pendingSelectionRef = useRef<string | null>(null);

  const handleInsertAtIndex = useCallback(
    (type: "math" | "text", idx: number) => {
      const newId = addCellRef.current?.(type, idx);
      if (newId) {
        pendingSelectionRef.current = newId; // store it
      }
    },
    [addCellRef]
  );

  const handleInsertAtEnd = useCallback(
    (type: "text" | "math") => {
      const newId = addCellRef.current?.(type, visibleCells.length);
      if (newId) {
        pendingSelectionRef.current = newId; // store it
      }
    },
    [visibleCells.length, addCellRef]
  );

  const handleDuplicateCell = useCallback(
    (id: string) => {
      const newId = duplicateCell(id);
      if (newId) {
        pendingSelectionRef.current = newId; // store it
      }
    },
    [duplicateCell]
  );

  const handleDeleteCell = useCallback(
    (id: string) => {
      const prevId = deleteCell(id);
      if (prevId) {
        pendingSelectionRef.current = prevId; // store it
      }
    },
    [deleteCell]
  );

  useEffect(() => {
    if (pendingSelectionRef.current) {
      setSelectedCellId(pendingSelectionRef.current);
      pendingSelectionRef.current = null;
    }
  }, [visibleCells]); // run whenever cells update

  const pendingInsertRef = useRef<"math" | "text" | null>(null);

  useEffect(() => {
    const handlerKeyDown = (e: KeyboardEvent) => {
      if (!selectedCellId) return;

      const currentIndex = visibleCells.findIndex(c => c.id === selectedCellId);
      if (currentIndex === -1) return;

      const combo = (e.altKey ? "Alt+" : "") + e.code;
      const notebookKeyMap = createNotebookKeyMap(
        visibleCells,
        handleInsertAtIndex,
        pendingInsertRef,
        handleDeleteCell,
        handleDuplicateCell,
        setSelectedCellId,
        updateTextCellContent
      );

      const handler = notebookKeyMap[combo];
      if (handler) handler(e, selectedCellId, currentIndex);
    };

    window.addEventListener("keydown", handlerKeyDown);
    return () => window.removeEventListener("keydown", handlerKeyDown);
  }, [
    selectedCellId,
    visibleCells,
    handleInsertAtIndex,
    pendingInsertRef,
    handleDeleteCell,
    handleDuplicateCell,
    setSelectedCellId,
    updateTextCellContent
  ]);

  const setCellRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    cellRefs.current[index] = el;
  }, []);

  return (
    <main
      className={styles.editorLayout}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest(`.${cellStyles.cell}`)) {
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
            {t("editor.emptyMessage")}
          </div>
        )}

        {visibleCells.map((cell, index) => (
          <CellRendererWrapper
            key={cell.id}
            cell={cell}
            index={index}
            isSelected={selectedCellId === cell.id}
            setSelectedCellId={setSelectedCellId}
            editorStates={editorStates}
            showLatexMap={showLatexMap}
            displayNumbers={displayNumbers}
            updateEditorState={updateEditorState}
            updateTextCellContent={updateTextCellContent}
            toggleShowLatex={toggleShowLatex}
            handleDeleteCell={handleDeleteCell}
            handleDuplicateCell={handleDuplicateCell}
            setCellRef={setCellRef}
            draggingCellId={draggingCellId}
            dragOverInsertIndex={dragOverInsertIndex}
            updateDragOver={updateCellDragOver}
            handleInsertAtIndex={handleInsertAtIndex}
            handlePointerDown={handlePointerDown}
            onDropNode={onDropNode}
            resetZoomSignal={resetZoomSignal}
            defaultZoom={defaultZoom}
          />
        ))}

        <InsertCellButtons
          onInsert={handleInsertAtEnd}
          handlePointerEnter={() => draggingCellId !== null && updateCellDragOver(visibleCells.length)}
          isPermanent={true}
          isDropTarget={dragOverInsertIndex === visibleCells.length}
        />
      </div>
    </main >
  );
};

export default React.memo(NotebookEditor);

