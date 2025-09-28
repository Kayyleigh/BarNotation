// components/editor/cells/CellRenderer.tsx
import React, { useMemo, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import type { CellData, TextCellContent } from "../../../models/noteTypes";
import type { EditorState } from "../../../logic/editor-state";
import InsertCellButtons from "./InsertCellButtons";
import { cellRegistry, type CellType, type CellContent } from "../../../models/cellRegistry";
import { CellWrapper } from "./CellWrapper";
import type { DragSource, DropTarget } from "../../../models/dragTypes";
import { useI18n } from "../../../i18n/useI18n";
import LatexViewer from "../../mathExpression/LatexViewer";
import type { TextCellType } from "../../../models/textTypes";

export interface CellRendererProps {
  cell: CellData;
  index: number;
  isSelected: boolean;
  selectCell: () => void;
  handleInsertAtIndex: (type: CellType, idx: number) => void;
  handlePointerDown: (e: React.PointerEvent, id: string, index: number) => void;
  deleteCell: () => void;
  duplicateCell: () => void;
  updateTextCellContent: (newContent: Partial<TextCellContent>) => void;
  toggleShowLatex: () => void;
  showLatex: boolean;
  onDropNode: (from: DragSource, to: DropTarget) => void;
  resetZoomSignal: number;
  defaultZoom: number;
  editorState: EditorState;
  updateEditorState: (newState: EditorState) => void;
  draggingCellId: string | null;
  dragOverInsertIndex: number | null;
  updateDragOver: (index: number) => void;
  displayNumber: string;
}

export const CellRenderer = React.memo(
  React.forwardRef<HTMLDivElement, CellRendererProps>((props, ref) => {
    const {
      cell,
      index,
      isSelected,
      selectCell,
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

    // Create a ref to hold the child's focusAndScroll
    const cellHandleRef = useRef<{ focusAndScroll: () => void } | null>(null);

    // Whenever selection changes, call it
    useLayoutEffect(() => {
      if (isSelected) {
        cellHandleRef.current?.focusAndScroll();
      }
    }, [isSelected]);

    const typeLabel = useMemo(
      () => registryEntry.getLabel?.(cell.content as ContentType) ?? registryEntry.label,
      [registryEntry, cell.content]
    );

    const updateTextRole = useCallback(
      (newRole: TextCellType) => {
        updateTextCellContent({ type: newRole });
      },
      [updateTextCellContent]
    );

    const toolbarExtras = useMemo(() => {
      return registryEntry.getToolbarExtras?.({
        id: cell.id,
        role: (cell.content as TextCellContent).type,
        updateRole: updateTextRole, // pass stable callback
        toggleShowLatex,
        showLatex,
        t,
      });
    }, [registryEntry, cell.id, cell.content, showLatex, t, toggleShowLatex, updateTextRole]);

    const handlePointerDownLocal = useCallback(
      (e: React.PointerEvent) => handlePointerDown(e, cell.id, index),
      [handlePointerDown, cell.id, index]
    );

    const latexVersionMapRef = useRef<Map<string, number>>(new Map());

    const markLatexOutdated = useCallback((cellId: string) => {
      const current = latexVersionMapRef.current.get(cellId) ?? 0;
      latexVersionMapRef.current.set(cellId, current + 1);
    }, []);

    // --- inside CellRenderer ---
    const handleChangeRef = useRef<((value: any) => void) | null>(null);

    // always update the ref to point to the latest logic
    useEffect(() => {
      if (cell.type === "text") {
        handleChangeRef.current = (newContent: TextCellContent) => {
          updateTextCellContent(newContent);
          markLatexOutdated(cell.id);
        };
      } else if (cell.type === "math") {
        handleChangeRef.current = (newState: EditorState) => {
          const oldState = editorState;
          updateEditorState(newState);
          if (oldState.rootNode !== newState.rootNode) {
            markLatexOutdated(cell.id);
          }
        };
      }
    }, [cell.type, cell.id, updateTextRole, updateEditorState, editorState, markLatexOutdated, updateTextCellContent]);

    // provide a stable callback to children
    const cellOnChange = useCallback((value: any) => {
      handleChangeRef.current?.(value);
    }, []);

    const componentProps = useMemo(() => {
      const baseProps: Record<string, unknown> = {
        id: cell.id,
        content: cell.content as ContentType,
        onChange: cellOnChange,
      };

      if (cell.type === "text") {
        Object.assign(baseProps, {
          displayNumber: displayNumber,
        });
      }

      if (cell.type === "math") {
        Object.assign(baseProps, {
          editorState,
          isSelected,
          selectCell,
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
      selectCell,
      defaultZoom,
      resetZoomSignal,
      showLatex,
      onDropNode
    ]);

    const isDragging = draggingCellId === cell.id;
    const isDragOver = dragOverInsertIndex === index;

    const getLatexRef = useRef<() => string>(() => "");
    getLatexRef.current = () =>
      registryEntry.getLatex?.(cell.content as CellContent<typeof cell.type>) ?? "";
    const stableGetLatex = useCallback(() => getLatexRef.current(), []);

    return (
      <div ref={ref}>
        <InsertCellButtons
          onInsert={(type) => handleInsertAtIndex(type, index)}
          handlePointerEnter={() => draggingCellId !== null && updateDragOver(index)}
          isDropTarget={isDragOver}
        />

        <CellWrapper
          id={cell.id}
          isSelected={isSelected}
          isDragging={isDragging}
          isDragOver={isDragOver}
          onSelect={selectCell}
          onDelete={deleteCell}
          onDuplicate={duplicateCell}
          draggableProps={{ onPointerDown: handlePointerDownLocal }}
          typeLabel={typeLabel}
          toolbarExtras={toolbarExtras}
        >
          {/* <Component {...componentProps} /> */}
          <Component {...componentProps} ref={cellHandleRef} />

        </CellWrapper>

        {registryEntry.hasLatex && (
          <LatexViewer
            showLatex={showLatex}
            getLatex={stableGetLatex}
            contentVersion={latexVersionMapRef.current.get(cell.id) ?? 0}
          />
        )}
      </div>
    );
  })
);

CellRenderer.displayName = "CellRenderer";
