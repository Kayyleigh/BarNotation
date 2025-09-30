// components/editor/NotebookEditor.tsx
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useTransition,
  forwardRef,
  useImperativeHandle,
} from "react";
import InsertCellButtons from "./cells/InsertCellButtons";
import { useCellDragState } from "../../hooks/cellDrag/useCellDragState";
import styles from "./Editor.module.css";
import NoteMetaDataSection from "./noteMetadata/NoteMetadataSection";
import type { CellData, NoteMetadata, TextCellContent } from "../../models/noteTypes";
import type { EditorState } from "../../logic/editor-state";
import { useEditorMode } from "../../hooks/editorMode/useEditorMode";
import { useI18n } from "../../i18n/useI18n";
import type { DragSource, DropTarget } from "../../models/dragTypes";
import { CellRenderer, SelectCellOptions } from "./cells/CellRenderer";
import { computeDisplayNumbers, reconstructCells } from "../../utils/noteUtils";
import { createNotebookKeyMap, useNotebookInsertResolver } from "./notebookShortcuts";

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

type CellId = string;

// Define the editor interface for cell refs
export interface CellEditorHandle {
  focus: () => void;
  moveCursorToEnd?: () => void;
  ensureCursorInView?: () => void;
  focusAndScroll?: () => void;
}

// Per-cell wrapper
const CellRendererWrapper: React.FC<{
  cell: CellData;
  editorRef: React.RefObject<CellEditorHandle | null>;
  index: number;
  isSelected: boolean;
  selectCell: (id: string | null, opts: SelectCellOptions) => void;
  editorStates: Record<string, EditorState>;
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
  editorRef,
  index,
  isSelected,
  selectCell,
  editorStates,
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
  const editorState = editorStates[cell.id];
  const showLatex = showLatexMap[cell.id] ?? false;
  const displayNumber = displayNumbers[cell.id];

  const handleUpdateEditorState = useCallback(
    (newState: EditorState) => updateEditorState(cell.id, newState),
    [cell.id, updateEditorState]
  );

  const handleUpdateTextContent = useCallback(
    (partialContent: Partial<TextCellContent>) => updateTextCellContent(cell.id, partialContent),
    [cell.id, updateTextCellContent]
  );

  const handleToggleLatex = useCallback(() => toggleShowLatex(cell.id), [cell.id, toggleShowLatex]);
  const handleDelete = useCallback(() => handleDeleteCell(cell.id), [cell.id, handleDeleteCell]);
  const handleDuplicate = useCallback(() => handleDuplicateCell(cell.id), [cell.id, handleDuplicateCell]);

  const handleSelectCell = useCallback((opts: SelectCellOptions) => selectCell(cell.id, opts), [cell.id, selectCell]);
  const handleDeselectCell = useCallback(() => selectCell(null, {}), [selectCell]);

  const handleRequestSelect = useCallback(
    (opts: SelectCellOptions) => handleSelectCell(opts),
    [handleSelectCell]
  );

  return (
    <CellRenderer
      ref={setCellRef(index)}
      editorRef={editorRef}
      cell={cell}
      index={index}
      isSelected={isSelected}
      draggingCellId={draggingCellId}
      updateDragOver={updateDragOver}
      dragOverInsertIndex={dragOverInsertIndex}
      handleInsertAtIndex={handleInsertAtIndex}
      handlePointerDown={handlePointerDown}
      deleteCell={handleDelete}
      duplicateCell={handleDuplicate}
      updateTextCellContent={handleUpdateTextContent}
      toggleShowLatex={handleToggleLatex}
      showLatex={showLatex}
      onDropNode={onDropNode}
      resetZoomSignal={resetZoomSignal}
      defaultZoom={defaultZoom}
      editorState={editorState}
      updateEditorState={handleUpdateEditorState}
      displayNumber={displayNumber}
      onRequestSelect={handleRequestSelect}
      onDeselect={handleDeselectCell}
    />
  );
});

export interface NotebookEditorHandle {
  focus: () => void;
}

const NotebookEditor = forwardRef<NotebookEditorHandle, NotebookEditorProps>(({
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
}, ref) => {
  const { t } = useI18n();
  const notebookEditorContainerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => notebookEditorContainerRef.current?.focus() }));

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const editorRefs = useRef<Map<CellId, React.RefObject<CellEditorHandle | null>>>(new Map());

  const { editingMode } = useEditorMode();
  const {
    draggingCellId,
    dragOverInsertIndex,
    startDrag: startCellDrag,
    updateDragOver: updateCellDragOver,
    endDrag: endCellDrag,
  } = useCellDragState();

  const baseCells = useMemo(() => reconstructCells(order, editorStates, textContents), [order, editorStates, textContents]);
  const textCellIds = useMemo(() => baseCells.filter(c => c.type === "text").map(c => c.id), [baseCells]);
  const displayNumbers = useMemo(() => editingMode !== "edit" ? computeDisplayNumbers(textContents, textCellIds) : {}, [editingMode, textContents, textCellIds]);

  const [visibleCells, setVisibleCells] = useState(baseCells);
  const [, startTransition] = useTransition();
  const prevNoteIdRef = useRef(noteId);
  const baseCellsRef = useRef(baseCells);
  baseCellsRef.current = baseCells;

  useEffect(() => {
    if (noteId === prevNoteIdRef.current) {
      setVisibleCells(baseCells);
    } else {
      startTransition(() => setVisibleCells(baseCellsRef.current));
    }
    prevNoteIdRef.current = noteId;
  }, [baseCells, noteId]);

  const updateTextCellContent = useCallback((id: string, partialContent: Partial<TextCellContent>) => {
    setTextContents(prev => {
      const prevContent = prev[id];
      if (!prevContent) return prev;
      const updatedContent = { ...prevContent, ...partialContent };
      if (prevContent.text === updatedContent.text && prevContent.type === updatedContent.type) return prev;
      return { ...prev, [id]: updatedContent };
    });
  }, [setTextContents]);

  const toggleShowLatex = useCallback((cellId: string) => {
    setShowLatexMap(prev => ({ ...prev, [cellId]: !prev[cellId] }));
  }, [setShowLatexMap]);

  const handleMetadataUpdate = useCallback((partial: Partial<NoteMetadata>) => {
    if (noteId) setMetadata(noteId, partial);
  }, [noteId, setMetadata]);

  const updateEditorState = useCallback((id: string, newState: EditorState) => {
    setEditorStates(prev => ({ ...prev, [id]: newState }));
  }, [setEditorStates]);

  const handlePointerDown = useCallback((e: React.PointerEvent, id: string, index: number) => {
    e.preventDefault();
    startCellDrag(id, index);

    const handleMove = (moveEvent: PointerEvent) => {
      const cursorY = moveEvent.clientY;
      const overIndex = cellRefs.current.findIndex(ref => {
        const rect = ref?.getBoundingClientRect();
        return rect && cursorY < rect.top + rect.height / 2;
      });
      updateCellDragOver(overIndex === -1 ? cellRefs.current.length : overIndex);
    };

    const handleUp = () => {
      const { from, to } = endCellDrag();
      if (from !== null && to !== null && from !== to) {
        const newOrder = [...order];
        const [movedId] = newOrder.splice(from, 1);
        newOrder.splice(from < to ? to - 1 : to, 0, movedId);
        updateOrder(newOrder);
      }
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }, [startCellDrag, updateCellDragOver, endCellDrag, order, updateOrder]);

  // Pending selection after insert/duplicate/delete
  const pendingSelectionRef = useRef<string | null>(null);

  const handleInsertAtIndex = useCallback((type: "math" | "text", idx: number) => {
    const newId = addCellRef.current?.(type, idx);
    if (newId) pendingSelectionRef.current = newId;
  }, [addCellRef]);

  const handleInsertAtEnd = useCallback((type: "math" | "text") => {
    const newId = addCellRef.current?.(type, visibleCells.length);
    if (newId) pendingSelectionRef.current = newId;
  }, [addCellRef, visibleCells.length]);

  const handleDuplicateCell = useCallback((id: string) => {
    const newId = duplicateCell(id);
    if (newId) pendingSelectionRef.current = newId;
  }, [duplicateCell]);

  const handleDeleteCell = useCallback((id: string) => {
    const prevId = deleteCell(id);
    if (prevId) pendingSelectionRef.current = prevId;
  }, [deleteCell]);

  useEffect(() => {
    if (pendingSelectionRef.current) {
      setSelectedCellId(pendingSelectionRef.current);
      pendingSelectionRef.current = null;
    }
  }, [visibleCells]);

  const selectCell = useCallback((id: CellId | null, options: SelectCellOptions = {}) => {
    setSelectedCellId(id);
    if (!id) return; // deselect case

    const ref = editorRefs.current.get(id)?.current;
    if (!ref) return;

    if (options.focus) ref.focus();
    if (options.moveCursorToEnd && ref.moveCursorToEnd) ref.moveCursorToEnd();
    if (ref.ensureCursorInView) ref.ensureCursorInView();
  }, []);

  const pendingInsertRef = useRef<"math" | "text" | null>(null);
  const arrowUsedRef = useRef(false);
  useNotebookInsertResolver(pendingInsertRef, arrowUsedRef, handleInsertAtEnd);

  const keyMap = useMemo(() => createNotebookKeyMap(
    visibleCells,
    handleInsertAtIndex,
    pendingInsertRef,
    arrowUsedRef,
    handleDeleteCell,
    handleDuplicateCell,
    selectCell,
    updateTextCellContent
  ), [visibleCells, handleInsertAtIndex, handleDeleteCell, handleDuplicateCell, selectCell, updateTextCellContent]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const combo = (e.altKey ? "Alt+" : "") + e.code;
      const handlerFn = keyMap[combo];
      if (!handlerFn) return;

      const currentIndex = selectedCellId ? visibleCells.findIndex(c => c.id === selectedCellId) : undefined;
      handlerFn(e, selectedCellId ?? undefined, currentIndex);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyMap, selectedCellId, visibleCells]);

  const setCellRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    cellRefs.current[index] = el;
  }, []);

  // const blurEditor = useCallback(() => setSelectedCellId(null), []);

  const getEditorRef = (id: string) => {
    let ref = editorRefs.current.get(id);
    if (!ref) {
      ref = React.createRef<CellEditorHandle>();
      editorRefs.current.set(id, ref);
    }
    return ref;
  };

  return (
    <main
      ref={notebookEditorContainerRef}
      className={styles.editorLayout}
    // onBlur={blurEditor}
    >
      <NoteMetaDataSection metadata={metadata} setMetadata={handleMetadataUpdate} />

      <div className={styles.cellList}>
        {visibleCells.length === 0 && <div className={styles.emptyMessage}>{t("editor.emptyMessage")}</div>}

        {visibleCells.map((cell, index) => (
          <CellRendererWrapper
            key={cell.id}
            cell={cell}
            editorRef={getEditorRef(cell.id)}
            index={index}
            isSelected={selectedCellId === cell.id}
            selectCell={selectCell}
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
    </main>
  );
});

export default React.memo(NotebookEditor);
