// components/editor/notebookShortcuts.ts
import type { CellData, TextCellContent } from "../../models/noteTypes";
import { type TextCellType, TEXT_CELL_TYPES } from "../../models/textTypes";
import type React from "react";

export type KeyHandler = (
  e: KeyboardEvent,
  selectedCellId: string,
  currentIndex: number
) => void;

/**
 * Factory function to generate a notebook key map.
 */
export function createNotebookKeyMap(
  visibleCells: CellData[],
  handleInsertAtIndex: (type: "text" | "math", idx: number) => void,
  pendingInsertRef: React.RefObject<"text" | "math" | null>,
  handleDeleteCell: (id: string) => void,
  handleDuplicateCell: (id: string) => void,
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | null>>,
  updateTextCellContent: (id: string, partialContent: Partial<TextCellContent>) => void
): Record<string, KeyHandler> {

  const TEXT_CELL_TYPES_ORDER: TextCellType[] = [
    TEXT_CELL_TYPES.Section,
    TEXT_CELL_TYPES.Subsection,
    TEXT_CELL_TYPES.Subsubsection,
    TEXT_CELL_TYPES.Plain,
  ];

  const getNextTextCellType = (
    current: TextCellType,
    direction: 1 | -1
  ): TextCellType => {
    const idx = TEXT_CELL_TYPES_ORDER.indexOf(current);
    if (idx === -1) return TEXT_CELL_TYPES.Plain;
    return TEXT_CELL_TYPES_ORDER[
      (idx + direction + TEXT_CELL_TYPES_ORDER.length) % TEXT_CELL_TYPES_ORDER.length
    ];
  };

  return {
    // Cell management
    "Alt+Delete": (e, id) => {
      e.preventDefault();
      handleDeleteCell(id);
    },
    "Alt+Equal": (e, id) => {
      e.preventDefault();
      handleDuplicateCell(id);
    },

    // Alt + Digit → store pending insertion
    "Alt+Digit1": () => { pendingInsertRef.current = "math"; },
    "Alt+Digit2": () => { pendingInsertRef.current = "text"; },
    "Alt+Numpad1": () => { pendingInsertRef.current = "math"; },
    "Alt+Numpad2": () => { pendingInsertRef.current = "text"; },

    // Alt + Arrow → navigate or insert pending
    "Alt+ArrowUp": (e, _id, currentIndex) => {
      e.preventDefault();
      if (pendingInsertRef.current) {
        const insertIndex = Math.max(0, currentIndex);
        handleInsertAtIndex(pendingInsertRef.current, insertIndex);
        pendingInsertRef.current = null;
      } else if (currentIndex > 0) {
        setSelectedCellId(visibleCells[currentIndex - 1].id);
      }
    },
    "Alt+ArrowDown": (e, _id, currentIndex) => {
      e.preventDefault();
      if (pendingInsertRef.current) {
        const insertIndex = currentIndex + 1;
        handleInsertAtIndex(pendingInsertRef.current, insertIndex);
        pendingInsertRef.current = null;
      } else if (currentIndex < visibleCells.length - 1) {
        setSelectedCellId(visibleCells[currentIndex + 1].id);
      }
    },

    // Text cell header shortcuts
    "Alt+Period": (e, id) => {
      const cell = visibleCells.find(c => c.id === id);
      if (!cell || cell.type !== "text") return;
      e.preventDefault();
      const newType = getNextTextCellType(cell.content.type, 1);
      updateTextCellContent(id, { type: newType });
    },
    "Alt+Comma": (e, id) => {
      const cell = visibleCells.find(c => c.id === id);
      if (!cell || cell.type !== "text") return;
      e.preventDefault();
      const newType = getNextTextCellType(cell.content.type, -1);
      updateTextCellContent(id, { type: newType });
    },
  };
}
