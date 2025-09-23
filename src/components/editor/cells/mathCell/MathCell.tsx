// components/editor/cells/MathCell.tsx
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";
import MathEditor from "../../../mathExpression/MathEditor";
import { setCursor, type EditorState } from "../../../../logic/editor-state";
import { HoverProvider } from "../../../../hooks/mathHover/HoverProvider";
import { useEditorMode } from "../../../../hooks/editorMode/useEditorMode";
import styles from "../cell.module.css";
import type { BaseCellProps } from "../../../../models/cellRegistry";
import type { DragSource, DropTarget } from "../../../../models/dragTypes";
import type { CursorPosition } from "../../../../logic/cursor";

export interface MathCellHandle {
  focusAndScroll: () => void;
}

interface MathCellExtraProps {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  isSelected: boolean;
  selectCell: () => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
}

type MathCellProps = BaseCellProps<EditorState> & MathCellExtraProps;

const MathCell = forwardRef<MathCellHandle, MathCellProps>(
  (
    {
      id,
      content,
      onChange,
      resetZoomSignal,
      defaultZoom,
      showLatex,
      isSelected,
      selectCell,
      onDropNode,
    },
    ref
  ) => {
    const { editingMode } = useEditorMode();
    const isEditMode = editingMode === "edit";

    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focusAndScroll: () => {
        if (containerRef.current) {
          selectCell();
          containerRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
          // optional: focus inner math editor DOM node
          const editorDiv = containerRef.current.querySelector<HTMLDivElement>(
            `[data-math-editor="${id}"]`
          );
          editorDiv?.focus();
          setCursorToEnd()
        }
      },
    }));

    const setCursorToEnd = useCallback(() => {
      const rootChild = content.rootNode.child;
      if (!rootChild) return;

      const newCursor: CursorPosition = {
        containerId: rootChild.id,
        index: rootChild.children.length, // place cursor at the end
      };
      onChange(setCursor(content, newCursor));
    }, [content, onChange]);

    const [hoverInfo, setHoverInfo] = useState({
      hoveredType: "",
      zoomLevel: defaultZoom,
    });

    return (
      <div
        ref={containerRef}
        className={styles.mathCell}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const editorDiv = document.querySelector<HTMLDivElement>(
              `[data-math-editor="${id}"]`
            );
            editorDiv?.focus();
          }
        }}
      >
        <div className={styles.mathScrollContainer}>
          <HoverProvider>
            <MathEditor
              resetZoomSignal={resetZoomSignal}
              defaultZoom={defaultZoom}
              showLatex={showLatex}
              cellId={id}
              editorState={content}
              updateEditorState={onChange}
              onDropNode={onDropNode}
              onHoverInfoChange={setHoverInfo}
              onFocus={selectCell}
              isSelected={isSelected}
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

