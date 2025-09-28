// // components/editor/cells/MathCell.tsx
// import React, {
//   useState,
//   forwardRef,
//   useImperativeHandle,
//   useRef,
//   useCallback,
// } from "react";
// import MathEditor from "../../../mathExpression/MathEditor";
// import { setCursor, type EditorState } from "../../../../logic/editor-state";
// import { HoverProvider } from "../../../../hooks/mathHover/HoverProvider";
// import { useEditorMode } from "../../../../hooks/editorMode/useEditorMode";
// import styles from "../cell.module.css";
// import type { BaseCellProps } from "../../../../models/cellRegistry";
// import type { DragSource, DropTarget } from "../../../../models/dragTypes";
// import type { CursorPosition } from "../../../../logic/cursor";

// export interface MathCellHandle {
//   focusAndScroll: () => void;
// }

// interface MathCellExtraProps {
//   resetZoomSignal: number;
//   defaultZoom: number;
//   showLatex: boolean;
//   isSelected: boolean;
//   selectCell: () => void;
//   onDropNode: (from: DragSource, to: DropTarget) => void;
// }

// type MathCellProps = BaseCellProps<EditorState> & MathCellExtraProps;

// const MathCell = forwardRef<MathCellHandle, MathCellProps>(
//   (
//     {
//       id,
//       content,
//       onChange,
//       resetZoomSignal,
//       defaultZoom,
//       showLatex,
//       isSelected,
//       selectCell,
//       onDropNode,
//     },
//     ref
//   ) => {
//     const { editingMode } = useEditorMode();
//     const isEditMode = editingMode === "edit";

//     const containerRef = useRef<HTMLDivElement>(null);

//     // useImperativeHandle(ref, () => ({
//     //   focusAndScroll: () => {
//     //     if (containerRef.current) {
//     //       selectCell();
//     //       containerRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
//     //       // optional: focus inner math editor DOM node
//     //       const editorDiv = containerRef.current.querySelector<HTMLDivElement>(
//     //         `[data-math-editor="${id}"]`
//     //       );
//     //       editorDiv?.focus();
//     //       setCursorToEnd()
//     //     }
//     //   },
//     // }));

//     const isDroppingRef = useRef(false);

//     const handleDropNode = useCallback((from: DragSource, to: DropTarget) => {
//       //console.log(`handleDropNode`)
//       isDroppingRef.current = true;
//       onDropNode(from, to);

//       // Reset flag after React has applied the state update
//       setTimeout(() => {
//         isDroppingRef.current = false;
//       }, 500);
//     }, [onDropNode]);

//     useImperativeHandle(ref, () => ({
//       focusAndScroll: () => {
//         //console.log(`imperativehandle`)

//         if (containerRef.current) {
//           // selectCell();
//           containerRef.current.scrollIntoView({ block: "center", behavior: "smooth" });

//           const editorDiv = containerRef.current.querySelector<HTMLDivElement>(
//             `[data-math-editor="${id}"]`
//           );
//           // editorDiv?.focus();

//           // Skip cursor move if we just dropped
//           if (!isDroppingRef?.current) {
//             setCursorToEnd();
//           }
//         }
//       },
//     }));

//     const setCursorToEnd = useCallback(() => {
//       const rootChild = content.rootNode.child;
//       if (!rootChild) return;

//       const newCursor: CursorPosition = {
//         containerId: rootChild.id,
//         index: rootChild.children.length, // place cursor at the end
//       };
//       onChange(setCursor(content, newCursor));
//     }, [content, onChange]);

//     const [hoverInfo, setHoverInfo] = useState({
//       hoveredType: "",
//       zoomLevel: defaultZoom,
//     });

//     return (
//       <div
//         ref={containerRef}
//         className={styles.mathCell}
//         // onClick={(e) => {
//         //   e.preventDefault();
//         //   const editorDiv = document.querySelector<HTMLDivElement>(
//         //     `[data-math-editor="${id}"]`
//         //   );
//         //   editorDiv?.focus();
//         // }}
//       >
//         <div className={styles.mathScrollContainer}>
//           <HoverProvider>
//             <MathEditor
//               resetZoomSignal={resetZoomSignal}
//               defaultZoom={defaultZoom}
//               showLatex={showLatex}
//               cellId={id}
//               editorState={content}
//               updateEditorState={onChange}
//               onDropNode={handleDropNode}
//               onHoverInfoChange={setHoverInfo}
//               // onFocus={selectCell}
//               isSelected={isSelected}
//             />
//           </HoverProvider>
//         </div>

//         {isEditMode && (
//           <div className={styles.hoverTypeInfo}>
//             {hoverInfo.hoveredType ? `${hoverInfo.hoveredType} • ` : ""}
//             {Math.round(hoverInfo.zoomLevel * 100)}%
//           </div>
//         )}
//       </div>
//     );
//   }
// );

// MathCell.displayName = "MathCell";
// export default React.memo(MathCell);


import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useLayoutEffect } from "react";
import MathEditor, { MathEditorHandle } from "../../../mathExpression/MathEditor";
import { HoverProvider } from "../../../../hooks/mathHover/HoverProvider";
import { useEditorMode } from "../../../../hooks/editorMode/useEditorMode";
import styles from "../cell.module.css";
import type { BaseCellProps } from "../../../../models/cellRegistry";
import type { DragSource, DropTarget } from "../../../../models/dragTypes";
import { EditorState } from "../../../../logic/editor-state";
import { getScrollableParent } from "../../../../utils/dom";

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

// const MathCell = forwardRef<MathCellHandle, MathCellProps>(
//   ({ id, content, onChange, resetZoomSignal, defaultZoom, showLatex, isSelected, selectCell, onDropNode }, ref) => {
//     const { editingMode } = useEditorMode();
//     const isEditMode = editingMode === "edit";
//     const editorRef = useRef<MathEditorHandle>(null);

//     const [hoverInfo, setHoverInfo] = useState({ hoveredType: "", zoomLevel: defaultZoom });

//     const handleDropNode = useCallback(
//       (from: DragSource, to: DropTarget) => {
//         onDropNode(from, to);
//       },
//       [onDropNode]
//     );

//     useImperativeHandle(ref, () => ({
//       focusAndScroll: () => {
//         selectCell(); // make sure this cell is selected
//         editorRef.current?.focusAndScroll(); // let MathEditor handle focus, scroll, and cursor
//       },
//     }));

//     useEffect(() => {
//       if (!isSelected) return;

//       const container = containerRef.current; // containerref doesnt exist
//       if (!container) return;

//       const rect = container.getBoundingClientRect();
//       const viewHeight = window.innerHeight || document.documentElement.clientHeight;

//       // If top/bottom of cell is outside the viewport, scroll it into view
//       if (rect.top < 0 || rect.bottom > viewHeight) {
//         container.scrollIntoView({ block: "center", behavior: "smooth" });
//       }
//     }, [isSelected]);


//     return (
//       <div className={styles.mathCell}>
//         <div className={styles.mathScrollContainer}>
//           <HoverProvider>
//             <MathEditor
//               ref={editorRef}
//               resetZoomSignal={resetZoomSignal}
//               defaultZoom={defaultZoom}
//               showLatex={showLatex}
//               cellId={id}
//               editorState={content}
//               updateEditorState={onChange}
//               onDropNode={handleDropNode}
//               isSelected={isSelected}
//               onHoverInfoChange={setHoverInfo}
//               onFocus={selectCell}
//             />
//           </HoverProvider>
//         </div>

//         {isEditMode && (
//           <div className={styles.hoverTypeInfo}>
//             {hoverInfo.hoveredType ? `${hoverInfo.hoveredType} • ` : ""}
//             {Math.round(hoverInfo.zoomLevel * 100)}%
//           </div>
//         )}
//       </div>
//     );
//   }
// );

// MathCell.displayName = "MathCell";
// export default React.memo(MathCell);

const MathCell = forwardRef<MathCellHandle, MathCellProps>(
  ({ id, content, onChange, resetZoomSignal, defaultZoom, showLatex, isSelected, selectCell, onDropNode }, ref) => {
    const { editingMode } = useEditorMode();
    const isEditMode = editingMode === "edit";
    const editorRef = useRef<MathEditorHandle>(null);

    const containerRef = useRef<HTMLDivElement>(null); // <-- add this
    const [hoverInfo, setHoverInfo] = useState({ hoveredType: "", zoomLevel: defaultZoom });

    const handleDropNode = useCallback(
      (from: DragSource, to: DropTarget) => {
        onDropNode(from, to);
      },
      [onDropNode]
    );

    // expose imperative focusAndScroll
    useImperativeHandle(ref, () => ({
      focusAndScroll: () => {
        selectCell();
        editorRef.current?.focusAndScroll();
      },
    }));

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

      // Also scroll once immediately (in case size is stable)
      requestAnimationFrame(() => {
        container.scrollIntoView({ block: "center", behavior: "smooth" });
      });

      return () => ro.disconnect();
    }, [isSelected]);

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
              onDropNode={handleDropNode}
              isSelected={isSelected}
              onHoverInfoChange={setHoverInfo}
              onFocus={selectCell}
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
