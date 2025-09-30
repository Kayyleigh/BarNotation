// components/editor/notebookShortcuts.ts
import { useEffect } from "react";
import type { CellData, TextCellContent } from "../../models/noteTypes";
import { type TextCellType, TEXT_CELL_TYPES } from "../../models/textTypes";
import type React from "react";

export type KeyHandler = (
  e: KeyboardEvent,
  selectedCellId?: string,
  currentIndex?: number
) => void;

/**
 * Pure factory function: generates a notebook key map.
 */
export function createNotebookKeyMap(
  visibleCells: CellData[],
  handleInsertAtIndex: (type: "text" | "math", idx: number) => void,
  pendingInsertRef: React.RefObject<"text" | "math" | null>,
  arrowUsedRef: React.RefObject<boolean>,
  handleDeleteCell: (id: string) => void,
  handleDuplicateCell: (id: string) => void,
  selectCell: (id: string, opts?: { focus?: boolean; moveCursorToEnd?: boolean }) => void,
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
      if (!id) return;
      e.preventDefault();
      handleDeleteCell(id);
    },
    "Alt+Equal": (e, id) => {
      if (!id) return;
      e.preventDefault();
      handleDuplicateCell(id);
    },

    "Alt+Digit1": (e) => {
      e.preventDefault();
      pendingInsertRef.current = "math";
      arrowUsedRef.current = false;
    },
    "Alt+Digit2": (e) => {
      e.preventDefault();
      pendingInsertRef.current = "text";
      arrowUsedRef.current = false;
    },
    "Alt+Numpad1": (e) => {
      e.preventDefault();
      pendingInsertRef.current = "math";
      arrowUsedRef.current = false;
    },
    "Alt+Numpad2": (e) => {
      e.preventDefault();
      pendingInsertRef.current = "text";
      arrowUsedRef.current = false;
    },

    "Alt+ArrowUp": (e, _id, currentIndex) => {
      const index = currentIndex ?? 1; // ensure up leads to first cell
      e.preventDefault();

      if (pendingInsertRef.current) {
        const insertIndex = Math.max(0, index);
        handleInsertAtIndex(pendingInsertRef.current, insertIndex);
        pendingInsertRef.current = null;
        arrowUsedRef.current = true;
      } else if (index > 0) {
        selectCell(visibleCells[index - 1].id, { focus: true, moveCursorToEnd: true });
      }
    },

    "Alt+ArrowDown": (e, _id, currentIndex) => {
      const index = currentIndex ?? visibleCells.length - 2; // ensure down leads to last cell
      e.preventDefault();

      if (pendingInsertRef.current) {
        const insertIndex = index + 1;
        handleInsertAtIndex(pendingInsertRef.current, insertIndex);
        pendingInsertRef.current = null;
        arrowUsedRef.current = true;
      } else if (index < visibleCells.length - 1) {
        selectCell(visibleCells[index + 1].id, { focus: true, moveCursorToEnd: true });
      }
    },

    // Text cell header shortcuts
    "Alt+Period": (e, id) => {
      if (!id) return;
      const cell = visibleCells.find((c) => c.id === id);
      if (!cell || cell.type !== "text") return;
      e.preventDefault();
      const newType = getNextTextCellType(cell.content.type, 1);
      updateTextCellContent(id, { type: newType });
    },
    "Alt+Comma": (e, id) => {
      if (!id) return;
      const cell = visibleCells.find((c) => c.id === id);
      if (!cell || cell.type !== "text") return;
      e.preventDefault();
      const newType = getNextTextCellType(cell.content.type, -1);
      updateTextCellContent(id, { type: newType });
    },
  };
}

/**
 * React hook to manage global keyup resolution for pending inserts.
 */
export function useNotebookInsertResolver(
  pendingInsertRef: React.RefObject<"text" | "math" | null>,
  arrowUsedRef: React.RefObject<boolean>,
  handleInsertAtEnd: (type: "text" | "math") => void
) {
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        (e.code === "Digit1" || e.code === "Numpad1") &&
        pendingInsertRef.current === "math"
      ) {
        if (!arrowUsedRef.current) handleInsertAtEnd("math");
        pendingInsertRef.current = null;
        arrowUsedRef.current = false;
      }
      if (
        (e.code === "Digit2" || e.code === "Numpad2") &&
        pendingInsertRef.current === "text"
      ) {
        if (!arrowUsedRef.current) handleInsertAtEnd("text");
        pendingInsertRef.current = null;
        arrowUsedRef.current = false;
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [handleInsertAtEnd, pendingInsertRef, arrowUsedRef]);
}
