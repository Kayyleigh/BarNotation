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
import type { NoteMetadata, TextCellContent } from "../../models/noteTypes";
import type { EditorState } from "../../logic/editor-state";
import { useEditorMode } from "../../hooks/editorMode/useEditorMode";
import cellStyles from "./cells/cell.module.css";
import { useI18n } from "../../i18n/useI18n";
import type { DragSource, DropTarget } from "../../models/dragTypes";
import { CellRenderer } from "./cells/CellRenderer";
import { computeDisplayNumbers, reconstructCells } from "../../utils/noteUtils";

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

  const updateTextCellContent = useCallback(
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
      const currentIndex =
        selectedCellId != null
          ? visibleCells.findIndex(c => c.id === selectedCellId)
          : visibleCells.length - 1; // -1 if no cells yet, will insert at end

      const keymap: Record<string, "text" | "math"> = {
        Digit1: "math",
        Digit2: "text",
        Numpad1: "math",
        Numpad2: "text",
      };

      // Alt+Delete: delete selected cell if any
      if (e.altKey && e.code === "Delete" && selectedCellId) {
        e.preventDefault();
        handleDeleteCell(selectedCellId);
        return;
      }

      // Alt+Delete: delete selected cell if any
      if (e.altKey && e.code === "Equal" && selectedCellId) {
        e.preventDefault();
        handleDuplicateCell(selectedCellId);
        return;
      }

      // store pending insertion instead of inserting immediately
      if (e.altKey && keymap[e.code]) {
        e.preventDefault();
        pendingInsertRef.current = keymap[e.code]; // mark type
        return; // don't insert yet
      }

      // Alt+Arrow: insert in direction
      if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const direction = e.key === "ArrowUp" ? "above" : "below";

        if (pendingInsertRef.current) {
          // insert now according to direction
          const insertIndex =
            direction === "above"
              ? (selectedCellId != null ? currentIndex : visibleCells.length)
              : (selectedCellId != null ? currentIndex + 1 : visibleCells.length);

          handleInsertAtIndex(pendingInsertRef.current, insertIndex);
          pendingInsertRef.current = null;
          return;
        }

        // No pending → normal Alt+Arrow navigation
        if (selectedCellId != null) {
          if (direction === "above" && currentIndex > 0) {
            setSelectedCellId(visibleCells[currentIndex - 1].id);
          } else if (direction === "below" && currentIndex < visibleCells.length - 1) {
            setSelectedCellId(visibleCells[currentIndex + 1].id);
          }
        }
      }
    }

    window.addEventListener("keydown", handlerKeyDown);
    return () => window.removeEventListener("keydown", handlerKeyDown);
  }, [selectedCellId, visibleCells, handleInsertAtIndex, setSelectedCellId, handleDeleteCell, handleDuplicateCell]);

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
          <CellRenderer
            key={cell.id}
            ref={el => {
              cellRefs.current[index] = el;
            }}
            cell={cell}
            index={index}
            selectedCellId={selectedCellId}
            setSelectedCellId={setSelectedCellId}
            draggingCellId={draggingCellId}
            updateDragOver={updateCellDragOver}
            dragOverInsertIndex={dragOverInsertIndex}
            handleInsertAtIndex={handleInsertAtIndex}
            handlePointerDown={handlePointerDown}
            deleteCell={handleDeleteCell}
            duplicateCell={handleDuplicateCell}
            updateTextCellContent={updateTextCellContent}
            toggleShowLatex={toggleShowLatex}
            showLatexMap={showLatexMap}
            onDropNode={onDropNode}
            resetZoomSignal={resetZoomSignal}
            defaultZoom={defaultZoom}
            editorStates={editorStates}
            updateEditorState={updateEditorState}
            displayNumbers={displayNumbers}
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

