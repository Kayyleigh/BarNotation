// components/editor/cells/MathCell.tsx
import React, { forwardRef, useRef, useState, useCallback, useLayoutEffect, useImperativeHandle } from "react";
import MathEditor from "../../../mathExpression/MathEditor";
import { HoverProvider } from "../../../../hooks/mathHover/HoverProvider";
import { useEditorMode } from "../../../../hooks/editorMode/useEditorMode";
import styles from "../cell.module.css";
import type { BaseCellProps } from "../../../../models/cellRegistry";
import type { DragSource, DropTarget } from "../../../../models/dragTypes";
import { EditorState } from "../../../../logic/editor-state";
import { getScrollableParent } from "../../../../utils/dom";
import { CellEditorHandle } from "../../NotebookEditor";
import { SelectCellOptions } from "../CellRenderer";

interface MathCellExtraProps {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  isSelected: boolean;
  selectCell: (opts: SelectCellOptions) => void
  onDropNode: (from: DragSource, to: DropTarget) => void;
}

type MathCellProps = BaseCellProps<EditorState> & MathCellExtraProps;

const MathCell = forwardRef<CellEditorHandle, MathCellProps>(
  ({ id, content, onChange, resetZoomSignal, defaultZoom, showLatex, isSelected, selectCell, onDropNode }, ref) => {
    const { editingMode } = useEditorMode();
    const isEditMode = editingMode === "edit";
    const editorRef = useRef<CellEditorHandle>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [hoverInfo, setHoverInfo] = useState({ hoveredType: "", zoomLevel: defaultZoom });

    // expose imperative methods
    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      moveCursorToEnd: () => editorRef.current?.moveCursorToEnd?.(),
      ensureCursorInView: () => editorRef.current?.ensureCursorInView?.(),
      focusAndScroll: () => {
        editorRef.current?.focusAndScroll?.();
      },
    }), []);

    // Scroll into view when selected
    useLayoutEffect(() => {
      if (!isSelected) return;
      const container = containerRef.current;
      if (!container) return;
      const scrollParent = getScrollableParent(container);
      if (!scrollParent) return;

      const ro = new ResizeObserver(() => {
        container.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      ro.observe(container);

      requestAnimationFrame(() => container.scrollIntoView({ block: "center", behavior: "smooth" }));
      return () => ro.disconnect();
    }, [isSelected]);

    const handleHoverInfoChange = useCallback((info: typeof hoverInfo) => setHoverInfo(info), []);
    
    const handleFocus = useCallback(() => selectCell({ focus: true }), [selectCell]);

    return (
      <div className={styles.mathCell} ref={containerRef}>
        <div className={styles.mathScrollContainer}>
          <HoverProvider>
            <MathEditor
              ref={editorRef}
              resetZoomSignal={resetZoomSignal}
              defaultZoom={defaultZoom}
              showLatex={showLatex}
              cellId={id}
              editorState={content}
              updateEditorState={onChange}
              onDropNode={onDropNode}
              isSelected={isSelected}
              onHoverInfoChange={handleHoverInfoChange}
              onFocus={handleFocus}
            />
          </HoverProvider>
        </div>

        {isEditMode && (
          <div className={styles.hoverTypeInfo}>
            {hoverInfo.hoveredType ? `${hoverInfo.hoveredType} • ` : ""}
            {Math.round(hoverInfo.zoomLevel * 100)}%
          </div>
        )}
      </div>
    );
  }
);

MathCell.displayName = "MathCell";
export default React.memo(MathCell);
