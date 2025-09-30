// components/editor/cells/CellRenderer.tsx
import React, { useMemo, useCallback, useRef, useLayoutEffect, useEffect } from "react";
import type { CellData, TextCellContent } from "../../../models/noteTypes";
import type { EditorState } from "../../../logic/editor-state";
import InsertCellButtons from "./InsertCellButtons";
import { cellRegistry, type CellType, type CellContent } from "../../../models/cellRegistry";
import { CellWrapper } from "./CellWrapper";
import type { DragSource, DropTarget } from "../../../models/dragTypes";
import { useI18n } from "../../../i18n/useI18n";
import LatexViewer from "../../mathExpression/LatexViewer";
import type { CellEditorHandle } from "../NotebookEditor";
import { TextCellType } from "../../../models/textTypes";

export interface SelectCellOptions {
  focus?: boolean;
  moveCursorToEnd?: boolean;
}

export interface CellRendererProps {
  cell: CellData;
  index: number;
  isSelected: boolean;
  onRequestSelect: (opts: SelectCellOptions) => void;

  handleInsertAtIndex: (type: CellType, idx: number) => void;
  handlePointerDown: (e: React.PointerEvent, id: string, index: number) => void;
  deleteCell: () => void;
  duplicateCell: () => void;
  updateTextCellContent: (newContent: Partial<TextCellContent>) => void;
  toggleShowLatex: () => void;
  showLatex: boolean;
  onDropNode: (from: DragSource, to: DropTarget) => void;
  onDeselect: () => void;

  resetZoomSignal: number;
  defaultZoom: number;
  editorState: EditorState;
  updateEditorState: (newState: EditorState) => void;

  draggingCellId: string | null;
  dragOverInsertIndex: number | null;
  updateDragOver: (index: number) => void;
  displayNumber: string;

  editorRef: React.RefObject<CellEditorHandle | null>;
}

export const CellRenderer = React.memo(
  React.forwardRef<HTMLDivElement, CellRendererProps>((props, ref) => {
    const {
      cell,
      index,
      isSelected,
      onRequestSelect,
      onDeselect,
      handleInsertAtIndex,
      handlePointerDown,
      deleteCell,
      duplicateCell,
      updateTextCellContent,
      toggleShowLatex,
      showLatex,
      onDropNode,
      resetZoomSignal,
      defaultZoom,
      editorState,
      updateEditorState,
      draggingCellId,
      dragOverInsertIndex,
      updateDragOver,
      displayNumber,
    } = props;

    const { t } = useI18n();

    const registryEntry = cellRegistry[cell.type as CellType];
    type ContentType = CellContent<typeof cell.type>;
    const Component = registryEntry.component as React.FC<any>;

    // Ref to access editor focus/scroll
    const cellHandleRef = useRef<CellEditorHandle | null>(null);

    // Auto-focus/scroll when selection changes
    useLayoutEffect(() => {
      if (isSelected) {
        cellHandleRef.current?.focus?.();
        // TODO: // BUG: if math is clicked then this should not happen. If by other means, YES: 
        // cellHandleRef.current?.moveCursorToEnd?.();
        cellHandleRef.current?.ensureCursorInView?.();
      }
    }, [isSelected]);

    // Toolbar extras memoized
    const typeLabel = useMemo(
      () => registryEntry.getLabel?.(cell.content as ContentType) ?? registryEntry.label,
      [registryEntry, cell.content]
    );

    const toolbarExtras = useMemo(() => {
      return registryEntry.getToolbarExtras?.({
        id: cell.id,
        role: (cell.content as TextCellContent).type,
        updateRole: (role: TextCellType) => updateTextCellContent({ type: role }),
        toggleShowLatex,
        showLatex,
        t,
      });
    }, [registryEntry, cell.id, cell.content, showLatex, t, toggleShowLatex, updateTextCellContent]);

    const handlePointerDownLocal = useCallback(
      (e: React.PointerEvent) => {
        handlePointerDown(e, cell.id, index);
      },
      [handlePointerDown, cell.id, index]
    );

    // Keep latest change function in ref to avoid re-renders
    const handleChangeRef = useRef<((value: any) => void) | null>(null);
    useEffect(() => {
      if (cell.type === "text") {
        handleChangeRef.current = (newContent: TextCellContent) => updateTextCellContent(newContent);
      } else if (cell.type === "math") {
        handleChangeRef.current = (newState: EditorState) => updateEditorState(newState);
      }
    }, [cell.type, updateTextCellContent, updateEditorState]);

    const cellOnChange = useCallback((value: any) => {
      handleChangeRef.current?.(value);
    }, []);

    // Component props memoized
    const componentProps = useMemo(() => {
      const baseProps: Record<string, unknown> = {
        id: cell.id,
        content: cell.content as ContentType,
        selectCell: (opts: SelectCellOptions) => onRequestSelect(opts),
        onChange: cellOnChange,
        displayNumber,
        // onSloppyClick: () => onRequestSelect({ focus: true, moveCursorToEnd: true }),
      };

      if (cell.type === "math") {
        Object.assign(baseProps, {
          editorState,
          isSelected,
          selectCell: (opts: SelectCellOptions) => onRequestSelect(opts),
          defaultZoom,
          resetZoomSignal,
          showLatex,
          onDropNode,
        });
      }

      return baseProps;
    }, [
      cell.id,
      cell.content,
      cell.type,
      cellOnChange,
      displayNumber,
      editorState,
      isSelected,
      onRequestSelect,
      defaultZoom,
      resetZoomSignal,
      showLatex,
      onDropNode,
    ]);

    const isDragging = draggingCellId === cell.id;
    const isDragOver = dragOverInsertIndex === index;

    // Handlers for InsertCellButtons
    const handleInsertAbove = useCallback(() => handleInsertAtIndex("text", index), [handleInsertAtIndex, index]);
    const handleDragEnter = useCallback(() => {
      if (draggingCellId !== null) updateDragOver(index);
    }, [draggingCellId, updateDragOver, index]);

    return (
      <div ref={ref}>
        <InsertCellButtons
          onInsert={handleInsertAbove}
          handlePointerEnter={handleDragEnter}
          isDropTarget={isDragOver}
        />

        <CellWrapper
          id={cell.id}
          isSelected={isSelected}
          isDragging={isDragging}
          isDragOver={isDragOver}
          onSelect={() => onRequestSelect({ focus: true, moveCursorToEnd: true })}
          onDeselect={onDeselect}
          onDelete={deleteCell}
          onDuplicate={duplicateCell}
          draggableProps={{ onPointerDown: handlePointerDownLocal }}
          typeLabel={typeLabel}
          toolbarExtras={toolbarExtras}
        >
          <Component {...componentProps} ref={cellHandleRef} />
        </CellWrapper>

        {registryEntry.hasLatex && (
          <LatexViewer
            showLatex={showLatex}
            getLatex={() => registryEntry.getLatex?.(cell.content as CellContent<typeof cell.type>) ?? ""}
            contentVersion={0}
          />
        )}
      </div>
    );
  })
);

CellRenderer.displayName = "CellRenderer";
