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
import cellStyles from "./cells/cell.module.css";
import Tooltip from "../tooltips/Tooltip";

interface NotationEditorProps {
  defaultZoom: number;
  resetZoomSignal: number;
  noteId: string | null;
  order: string[];
  editorStates: Record<string, EditorState>;
  setEditorStates: React.Dispatch<React.SetStateAction<Record<string, EditorState>>>;
  textContents: Record<string, TextCellContent>;
  setTextContents: React.Dispatch<React.SetStateAction<Record<string, TextCellContent>>>;
  // addCell: (type: "math" | "text", index?: number) => void;
  addCellRef: React.RefObject<(type: "math" | "text", index?: number) => void>;
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

  // const handleInsertAtEnd = useCallback(
  //   (type: "text" | "math") => addCell(type, visibleCells.length), //TODO do not hardcode text math like that for extensibility
  //   [addCell, visibleCells.length]
  // );

  const handleInsertAtIndex = useCallback((type: "math" | "text", idx: number) => {
    addCellRef.current(type, idx);
  },
    [addCellRef]
  );

  const handleInsertAtEnd = useCallback((type: "text" | "math") => {
    addCellRef.current(type, visibleCells.length);
  },
    [visibleCells.length, addCellRef]
  );

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
            // addCell={addCell}
            addCell={handleInsertAtIndex} // < --- THIS 
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
        {mode !== "locked" &&
          <div
            className={clsx(
              styles.insertZone,
              { [styles.dragOver]: dragOverInsertIndex === visibleCells.length }
            )}
            onPointerEnter={() => draggingCellId !== null && updateDragOver(visibleCells.length)}
          >
            <InsertCellButtons
              onInsert={handleInsertAtEnd}
              isPermanent={true}
            />
          </div>}
      </div>
      {mode === "locked" && (
        <div className={styles.lockedBadge}>
        <div style={{ position: "relative"}}>
        <Tooltip text="You are in locked mode. Unlock to continue editing.">
        🔒
        </Tooltip>          
        </div>
        </div>


      )}
    </main>
  );
};

export default React.memo(NotationEditor);

