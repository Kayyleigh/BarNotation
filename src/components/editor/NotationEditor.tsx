// components/editor/NotationEditor.tsx
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
  // setMetadata: React.Dispatch<React.SetStateAction<NoteMetadata>>;
  setMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;

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
  textContents: Record<string, string> = {},
): CellData[] => {
  return order.map((id) =>
    editorStates[id]
      ? { id, type: "math", content: "" } // math content is in editorState, content string unused
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
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);

  const handleMetadataUpdate = (partialMetadata: Partial<NoteMetadata>) => {
    if (noteId) {
      setMetadata(noteId, partialMetadata);
    }
  };

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
        setMetadata={handleMetadataUpdate} //??? TODO
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
