// components/editor/cells/MathCell.tsx
import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import MathEditor from "../../../mathExpression/MathEditor";
import type { EditorState } from "../../../../logic/editor-state";
import { HoverProvider } from "../../../../hooks/mathHover/HoverProvider";
import { useEditorMode } from "../../../../hooks/editorMode/useEditorMode";
import styles from "../cell.module.css";
import type { BaseCellProps } from "../../../../models/cellRegistry";
import type { DragSource, DropTarget } from "../../../../models/dragTypes";

export interface MathCellHandle {
  focusAndScroll: () => void;
}

interface MathCellExtraProps {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  // editorState: EditorState;
  // updateEditorState: (newState: EditorState) => void;
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
          containerRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
          // optional: focus inner math editor DOM node
          const editorDiv = containerRef.current.querySelector<HTMLDivElement>(
            `[data-math-editor="${id}"]`
          );
          editorDiv?.focus();
        }
      },
    }));

    const [hoverInfo, setHoverInfo] = useState({
      hoveredType: "",
      zoomLevel: defaultZoom,
    });

    const handleEditorFocus = useCallback(
      () => selectCell(),
      [selectCell]
    );

    return (
      <div
        ref={containerRef}
        className={styles.mathCell}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            selectCell();
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
              onFocus={handleEditorFocus}
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

