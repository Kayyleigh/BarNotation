// Just the cell list
import React, { useState, useRef } from "react";
import InsertCellButtons from "../cells/InsertCellButtons";
import BaseCell from "../cells/BaseCell";
import TextCell from "../cells/TextCell";
import MathCell from "../cells/MathCell";
import { useCellDragState } from "../../hooks/useCellDragState";
import styles from "./Editor.module.css";
import Tooltip from "../tooltips/Tooltip";

interface NotationEditorProps {
  isPreviewMode: boolean;
  defaultZoom: number;
  resetZoomSignal: number;
  noteId: string | null;
  cells: CellData[];
  setCells: React.Dispatch<React.SetStateAction<CellData[]>>;
  addCell: (type: "math" | "text", index?: number) => void;
}

// TODO: also defined in EditorPane, maybe move elsewhere or reuse from one of the two in the other
type CellData = {
  id: string;
  type: "math" | "text";
  content: string;
};

const NotationEditor: React.FC<NotationEditorProps> = ({
  isPreviewMode,
  defaultZoom,
  resetZoomSignal,
  // noteId,
}) => {
  const [cells, setCells] = useState<Array<{ id: string; type: "math" | "text"; content: string }>>([]);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});
  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);

  const {
    draggingCellId,
    dragOverInsertIndex,
    // draggingCellIdRef,
    startDrag,
    updateDragOver,
    endDrag,
  } = useCellDragState();

  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateCellContent = (id: string, newContent: string) => {
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === id ? { ...cell, content: newContent } : cell
      )
    );
  };

  // TODO: use the one from EditorPane (cuz header also needs access to cell setting)
  const addCell = (type: "math" | "text", index?: number) => {
    const newCell = { id: Date.now().toString(), type, content: "" };
    setCells((prev) => {
      if (index === undefined) return [...prev, newCell];
      return [...prev.slice(0, index), newCell, ...prev.slice(index)];
    });
  };

  const deleteCell = (id: string) => {
    setCells((prev) => prev.filter((cell) => cell.id !== id));
  };

  const toggleShowLatex = (cellId: string) => {
    setShowLatexMap((prev) => ({ ...prev, [cellId]: !prev[cellId] }));
  };

  const handlePointerDown = (e: React.PointerEvent, id: string, index: number) => {
    e.preventDefault();
    startDrag(id, index);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const rects = cellRefs.current.map((ref) => ref?.getBoundingClientRect());
      const cursorY = moveEvent.clientY;
      const overIndex = rects.findIndex((rect) => rect && cursorY < rect.top + rect.height / 2);
      updateDragOver(overIndex === -1 ? cells.length : overIndex);
    };

    const handlePointerUp = () => {
      const { from, to } = endDrag();
      if (from !== null && to !== null && from !== to) {
        setCells((prev) => {
          const updated = [...prev];
          const [moved] = updated.splice(from, 1);
          updated.splice(from < to ? to - 1 : to, 0, moved);
          return updated;
        });
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <main className={styles.editorLayout} onClick={(e) => {
      if (!(e.target as HTMLElement).closest(".cell")) {
        setSelectedCellId(null);
      }
    }}>
      <div className={styles.cellList}>
        {cells.map((cell, index) => (
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
                handlePointerDown={(e) => handlePointerDown(e, cell.id, index)}
                toolbarExtras={
                  cell.type === "math" ? (
                    <Tooltip text={showLatexMap[cell.id] ? "Hide LaTeX output" : "Show LaTeX output for this cell"}>
                      <button className="button" onClick={() => toggleShowLatex(cell.id)}>
                        {showLatexMap[cell.id] ? "🙈 Hide LaTeX" : "👁️ Show LaTeX"}
                      </button>
                    </Tooltip>
                  ) : null
                }
              >
                {cell.type === "text" ? (
                  <TextCell
                    value={cell.content}
                    isPreviewMode={isPreviewMode}
                    onChange={(newValue) => updateCellContent(cell.id, newValue)}
                  />
                ) : (
                  <MathCell
                    resetZoomSignal={resetZoomSignal}
                    defaultZoom={defaultZoom}
                    showLatex={showLatexMap[cell.id] ?? false}
                    isPreviewMode={isPreviewMode}
                  />
                )}
              </BaseCell>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div
        className={`insert-zone ${dragOverInsertIndex === cells.length ? "drag-over" : ""}`}
        onMouseEnter={() => setHoveredInsertIndex(cells.length)}
        onMouseLeave={() => setHoveredInsertIndex(null)}
        onPointerEnter={() => draggingCellId !== null && updateDragOver(cells.length)}
      >
        <InsertCellButtons
          onInsert={(type) => addCell(type)}
          isVisible={hoveredInsertIndex === cells.length}
        />
      </div>
    </main>
  );
};

export default NotationEditor;
