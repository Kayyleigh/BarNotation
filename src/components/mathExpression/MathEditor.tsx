// // //components/mathExpression/MathEditor.tsx
// // import React, { useCallback, useEffect, useRef, useState } from "react";
// // import { setCursor } from "../../logic/editor-state";
// // import { handleKeyDown } from "../../logic/handle-keydown";
// // import { MathRenderer } from "./MathRenderer";
// // import LatexViewer from "./LatexViewer";
// // import { useZoom } from "../../hooks/mathZoom/useZoom";
// // import {
// //   insertNodeAtCursor,
// //   deleteSelectedNode,
// //   getSelectedNode,
// // } from "../../logic/node-manipulation";
// // import { parseLatex } from "../../models/latexParser";
// // import { nodeToLatex } from "../../models/nodeToLatex";
// // import { findNodeById } from "../../utils/treeUtils";
// // import type { EditorState } from "../../logic/editor-state";
// // import type { CursorPosition } from "../../logic/cursor";
// // import type { TextStyle } from "../../models/mathNodeTypes";
// // import { useHover } from "../../hooks/mathHover/useHover";
// // import type { DragSource, DropTarget } from "../../models/dragTypes";
// // import { useCustomCommands } from "../../hooks/customCommands/useCustomCommands";
// // import { useDragReader, useDragWriter } from "../../hooks/mathDrag/useDragContext";

// // interface MathEditorProps {
// //   resetZoomSignal: number;
// //   defaultZoom: number;
// //   showLatex: boolean;
// //   cellId: string;
// //   editorState: EditorState;
// //   updateEditorState: (newState: EditorState) => void;
// //   onDropNode: (
// //     from: DragSource,
// //     to: DropTarget,
// //   ) => void;
// //   onHoverInfoChange?: (info: { hoveredType: string; zoomLevel: number }) => void;
// // }

// // const MathEditor: React.FC<MathEditorProps> = ({
// //   resetZoomSignal,
// //   defaultZoom,
// //   showLatex,
// //   cellId,
// //   editorState,
// //   updateEditorState,
// //   onDropNode,
// //   onHoverInfoChange,
// // }) => {
// //   const { commandMap } = useCustomCommands();

// //   const { hoverPath, setHoverPath } = useHover();

// //   const editorRef = useRef<HTMLDivElement>(null);
// //   const zoomLevel = useZoom(editorRef, resetZoomSignal, defaultZoom);

// //   const [isActive, setIsActive] = useState(false);

// //   const { draggingSource, dropTarget } = useDragReader();
// //   const { setDropTarget } = useDragWriter();

// //   const hoveredNode = hoverPath[hoverPath.length - 1]
// //     ? findNodeById(editorState.rootNode, hoverPath[hoverPath.length - 1])
// //     : null;
// //   const hoveredType = hoveredNode?.type ?? "";

// //   useEffect(() => {
// //     const node = editorRef.current;
// //     if (!node) {
// //       setHoverPath([])
// //       return;
// //     }

// //     const handleMouseLeave = (e: MouseEvent) => {
// //       const related = e.relatedTarget as Node | null;
// //       if (!related || !node.contains(related)) {
// //         setHoverPath([]); // ← Clear hover when mouse leaves the entire editor
// //       }
// //     };

// //     node.addEventListener("mouseleave", handleMouseLeave);
// //     return () => {
// //       node.removeEventListener("mouseleave", handleMouseLeave);
// //     };
// //   }, [setHoverPath]);

// //   useEffect(() => {
// //     if (onHoverInfoChange) {
// //       onHoverInfoChange({ hoveredType, zoomLevel });
// //     }
// //   }, [hoveredType, zoomLevel, onHoverInfoChange]);

// //   const onKeyDown = (e: React.KeyboardEvent) => {
// //     const prevFocusedNodeContainerId = editorState.cursor?.containerId;

// //     const updated = handleKeyDown(e, editorState, commandMap);

// //     if (updated) {
// //       const prevFocusedNodeContainer = findNodeById(updated.rootNode, prevFocusedNodeContainerId);
// //       const prevFocusedNode = (prevFocusedNodeContainer?.type === 'inline-container' || prevFocusedNodeContainer?.type === 'command-input' || prevFocusedNodeContainer?.type === 'multi-digit')
// //         ? prevFocusedNodeContainer.children[updated.cursor?.index - 1]
// //         : prevFocusedNodeContainer

// //       updateEditorState(updated);

// //       setTimeout(() => {

// //         // If previously focused node was a command-input and is now gone,
// //         // restore focus to editor.

// //         const shouldRestoreFocus =
// //           !prevFocusedNode ||
// //           prevFocusedNode.type !== "command-input"; // TODO make better fix; this ensures it is possible to type more after transformation of command (manual completion) but it re-focuses ALL THE TIME which is usually redundant

// //         if (shouldRestoreFocus) {
// //           editorRef.current?.focus();
// //         }

// //         // Otherwise, keep focus where it is (e.g. dropdown)
// //       }, 0);
// //     }
// //   };

// //   const onCursorChange = useCallback(
// //     (cursor: CursorPosition) => {
// //       console.log(`In onCursorChange with`, cursor)
// //       if (cursor === editorState.cursor) return;
// //       updateEditorState(setCursor(editorState, cursor));
// //     },
// //     [editorState, updateEditorState]
// //   );

// //   const onCopy = (e: React.ClipboardEvent) => {
// //     const selectedNode = getSelectedNode(editorState);
// //     if (selectedNode) {
// //       e.clipboardData.setData("text/plain", nodeToLatex(selectedNode, false));
// //       e.preventDefault();
// //     }
// //   };

// //   const onCut = (e: React.ClipboardEvent) => {
// //     const selectedNode = getSelectedNode(editorState);
// //     if (selectedNode) {
// //       e.clipboardData.setData("text/plain", nodeToLatex(selectedNode, false));
// //       const updated = deleteSelectedNode(editorState);
// //       updateEditorState(updated);
// //       e.preventDefault();
// //     }
// //   };

// //   const onPaste = (e: React.ClipboardEvent) => {
// //     const pastedText = e.clipboardData.getData("text/plain");
// //     if (!pastedText) return;

// //     try {
// //       const pastedNode = parseLatex(pastedText);
// //       const updated = insertNodeAtCursor(editorState, pastedNode);
// //       updateEditorState(updated);
// //       e.preventDefault();
// //     } catch (err) {
// //       console.warn("Paste failed:", err);
// //     }
// //   };

// //   // find the upper InlineContainerNode
// //   const rootChildContainerId =
// //     editorState.rootNode.type === "root-wrapper"
// //       ? editorState.rootNode.child.id
// //       : "unknown-container";

// //   const handleDropNode = React.useCallback((from: DragSource, to: DropTarget) => {
// //     if (!to) return;

// //     // Only redirect if the drop target is a cell
// //     if (
// //       to.type === "cell" &&
// //       to.cellId === cellId &&
// //       to.containerId === "root" //TODO maybe dirty hardcoded
// //     ) {
// //       const child = editorState.rootNode.child;
// //       to = {
// //         ...to,
// //         containerId: child.id,
// //         index: child.children.length,
// //       };
// //     }

// //     onDropNode(from, to);
// //     editorRef.current?.focus();
// //     console.log("restored focus to", editorRef)

// //   }, [cellId, editorState.rootNode.child, onDropNode]);

// //   const defaultInheritedStyle: TextStyle = React.useMemo(() => ({
// //     fontStyling: { fontStyle: "normal", fontStyleAlias: "" },
// //   }), []);

// //   const emptyAncestorIds = React.useMemo(() => [], []);

// //   return (
// //     <>
// //       <div
// //         ref={editorRef}
// //         className="math-editor"
// //         tabIndex={0}
// //         onKeyDown={onKeyDown}
// //         onCopy={onCopy}
// //         onCut={onCut}
// //         onPaste={onPaste}
// //         onMouseLeave={() => setHoverPath([])}
// //         onFocus={() => setIsActive(true)}
// //         onBlur={(e) => {
// //           if (!e.currentTarget.contains(e.relatedTarget as Node)) {
// //             setIsActive(false);
// //           }
// //         }}
// //         onDragOver={(e) => {
// //           e.preventDefault();
// //           e.stopPropagation();
// //           if (!draggingSource) return;

// //           // Only update drop target if the current drop target is not this editor
// //           if (dropTarget?.type !== "cell" || dropTarget.cellId !== cellId) {
// //             setDropTarget({
// //               type: "cell",
// //               cellId,
// //               containerId: rootChildContainerId,
// //               index: 0, // Dropping at start of root child container
// //             });
// //           }
// //         }}
// //         onDrop={(e) => {
// //           e.preventDefault();
// //           e.stopPropagation();
// //           if (draggingSource && dropTarget?.type === "cell") {
// //             onDropNode(draggingSource, dropTarget);
// //           }
// //           setDropTarget(null);
// //         }}
// //       >
// //         <div className="math-editor-scroll-inner">
// //           <MathRenderer
// //             cellId={cellId}
// //             node={editorState.rootNode}
// //             cursor={editorState.cursor}
// //             containerId="root"
// //             index={0}
// //             hoverPath={hoverPath}
// //             setHoverPath={setHoverPath}
// //             inheritedStyle={defaultInheritedStyle}
// //             onCursorChange={onCursorChange}
// //             isActive={isActive}
// //             ancestorIds={emptyAncestorIds}
// //             onDropNode={handleDropNode}
// //             showPlaceholder={false}
// //             editorState={editorState}
// //             updateEditorState={updateEditorState}
// //             editorRef={editorRef}
// //           />
// //         </div>
// //       </div>
// //       <LatexViewer rootNode={editorState.rootNode} showLatex={showLatex} />
// //     </>
// //   );
// // };

// // export default React.memo(MathEditor); 

// //components/mathExpression/MathEditor.tsx
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { setCursor } from "../../logic/editor-state";
// import { handleKeyDown } from "../../logic/handle-keydown";
// import { MathRenderer } from "./MathRenderer";
// import LatexViewer from "./LatexViewer";
// import { useZoom } from "../../hooks/mathZoom/useZoom";
// import {
//   insertNodeAtCursor,
//   deleteSelectedNode,
//   getSelectedNode,
// } from "../../logic/node-manipulation";
// import { parseLatex } from "../../models/latexParser";
// import { nodeToLatex } from "../../models/nodeToLatex";
// import { findNodeById } from "../../utils/treeUtils";
// import type { EditorState } from "../../logic/editor-state";
// import type { CursorPosition } from "../../logic/cursor";
// import type { TextStyle } from "../../models/mathNodeTypes";
// import { useHover } from "../../hooks/mathHover/useHover";
// import type { DragSource, DropTarget } from "../../models/dragTypes";
// import { useCustomCommands } from "../../hooks/customCommands/useCustomCommands";
// import { useDragReader, useDragWriter } from "../../hooks/mathDrag/useDragContext";

// interface MathEditorProps {
//   resetZoomSignal: number;
//   defaultZoom: number;
//   showLatex: boolean;
//   cellId: string;
//   editorState: EditorState;
//   updateEditorState: (newState: EditorState) => void;
//   onDropNode: (
//     from: DragSource,
//     to: DropTarget,
//   ) => void;
//   onHoverInfoChange?: (info: { hoveredType: string; zoomLevel: number }) => void;
// }

// const MathEditor: React.FC<MathEditorProps> = ({
//   resetZoomSignal,
//   defaultZoom,
//   showLatex,
//   cellId,
//   editorState,
//   updateEditorState,
//   onDropNode,
//   onHoverInfoChange,
// }) => {
//   const { commandMap } = useCustomCommands();

//   const { hoverPath, setHoverPath } = useHover();

//   const editorRef = useRef<HTMLDivElement>(null);
//   const zoomLevel = useZoom(editorRef, resetZoomSignal, defaultZoom);

//   const [isActive, setIsActive] = useState(false);

//   const { draggingSource, dropTarget } = useDragReader();
//   const { setDropTarget } = useDragWriter();

//   const hoveredNode = hoverPath[hoverPath.length - 1]
//     ? findNodeById(editorState.rootNode, hoverPath[hoverPath.length - 1])
//     : null;
//   const hoveredType = hoveredNode?.type ?? "";

//   useEffect(() => {
//     const node = editorRef.current;
//     if (!node) {
//       setHoverPath([])
//       return;
//     }

//     const handleMouseLeave = (e: MouseEvent) => {
//       const related = e.relatedTarget as Node | null;
//       if (!related || !node.contains(related)) {
//         setHoverPath([]); // ← Clear hover when mouse leaves the entire editor
//       }
//     };

//     node.addEventListener("mouseleave", handleMouseLeave);
//     return () => {
//       node.removeEventListener("mouseleave", handleMouseLeave);
//     };
//   }, [setHoverPath]);

//   useEffect(() => {
//     if (onHoverInfoChange) {
//       onHoverInfoChange({ hoveredType, zoomLevel });
//     }
//   }, [hoveredType, zoomLevel, onHoverInfoChange]);

//   const onKeyDown = (e: React.KeyboardEvent) => {
//     const prevFocusedNodeContainerId = editorState.cursor?.containerId;

//     const updated = handleKeyDown(e, editorState, commandMap);

//     if (updated) {
//       const prevFocusedNodeContainer = findNodeById(updated.rootNode, prevFocusedNodeContainerId);
//       const prevFocusedNode = (prevFocusedNodeContainer?.type === 'inline-container' || prevFocusedNodeContainer?.type === 'command-input' || prevFocusedNodeContainer?.type === 'multi-digit')
//         ? prevFocusedNodeContainer.children[updated.cursor?.index - 1]
//         : prevFocusedNodeContainer

//       updateEditorState(updated);

//       setTimeout(() => {

//         // If previously focused node was a command-input and is now gone,
//         // restore focus to editor.

//         const shouldRestoreFocus =
//           !prevFocusedNode ||
//           prevFocusedNode.type !== "command-input"; // TODO make better fix; this ensures it is possible to type more after transformation of command (manual completion) but it re-focuses ALL THE TIME which is usually redundant

//         if (shouldRestoreFocus) {
//           editorRef.current?.focus();
//         }

//         // Otherwise, keep focus where it is (e.g. dropdown)
//       }, 0);
//     }
//   };

//   const onCursorChange = useCallback(
//     (cursor: CursorPosition) => {
//       console.log(`In onCursorChange with`, cursor)
//       if (cursor === editorState.cursor) return;
//       updateEditorState(setCursor(editorState, cursor));
//     },
//     [editorState, updateEditorState]
//   );

//   const onCopy = (e: React.ClipboardEvent) => {
//     const selectedNode = getSelectedNode(editorState);
//     if (selectedNode) {
//       e.clipboardData.setData("text/plain", nodeToLatex(selectedNode, false));
//       e.preventDefault();
//     }
//   };

//   const onCut = (e: React.ClipboardEvent) => {
//     const selectedNode = getSelectedNode(editorState);
//     if (selectedNode) {
//       e.clipboardData.setData("text/plain", nodeToLatex(selectedNode, false));
//       const updated = deleteSelectedNode(editorState);
//       updateEditorState(updated);
//       e.preventDefault();
//     }
//   };

//   const onPaste = (e: React.ClipboardEvent) => {
//     const pastedText = e.clipboardData.getData("text/plain");
//     if (!pastedText) return;

//     try {
//       const pastedNode = parseLatex(pastedText);
//       const updated = insertNodeAtCursor(editorState, pastedNode);
//       updateEditorState(updated);
//       e.preventDefault();
//     } catch (err) {
//       console.warn("Paste failed:", err);
//     }
//   };

//   // find the upper InlineContainerNode
//   const rootChildContainerId =
//     editorState.rootNode.type === "root-wrapper"
//       ? editorState.rootNode.child.id
//       : "unknown-container";

//   const handleDropNode = React.useCallback((from: DragSource, to: DropTarget) => {
//     if (!to) return;

//     // Only redirect if the drop target is a cell
//     if (
//       to.type === "cell" &&
//       to.cellId === cellId &&
//       to.containerId === "root" //TODO maybe dirty hardcoded
//     ) {
//       const child = editorState.rootNode.child;
//       to = {
//         ...to,
//         containerId: child.id,
//         index: child.children.length,
//       };
//     }

//     onDropNode(from, to);
//     editorRef.current?.focus();
//     console.log("restored focus to", editorRef)

//   }, [cellId, editorState.rootNode.child, onDropNode]);

//   const defaultInheritedStyle: TextStyle = React.useMemo(() => ({
//     fontStyling: { fontStyle: "normal", fontStyleAlias: "" },
//   }), []);

//   const emptyAncestorIds = React.useMemo(() => [], []);

//   return (
//     <>
//       <div
//         ref={editorRef}
//         className="math-editor"
//         tabIndex={0}
//         onKeyDown={onKeyDown}
//         onCopy={onCopy}
//         onCut={onCut}
//         onPaste={onPaste}
//         onMouseLeave={() => setHoverPath([])}
//         onFocus={() => setIsActive(true)}
//         onBlur={(e) => {
//           if (!e.currentTarget.contains(e.relatedTarget as Node)) {
//             setIsActive(false);
//           }
//         }}
//         onDragOver={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           if (!draggingSource) return;

//           // Only update drop target if the current drop target is not this editor
//           if (dropTarget?.type !== "cell" || dropTarget.cellId !== cellId) {
//             setDropTarget({
//               type: "cell",
//               cellId,
//               containerId: rootChildContainerId,
//               index: 0, // Dropping at start of root child container
//             });
//           }
//         }}
//         onDrop={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           if (draggingSource && dropTarget?.type === "cell") {
//             onDropNode(draggingSource, dropTarget);
//           }
//           setDropTarget(null);
//         }}
//       >
//         <div className="math-editor-scroll-inner">
//           <MathRenderer
//             cellId={cellId}
//             node={editorState.rootNode}
//             cursor={editorState.cursor}
//             containerId="root"
//             index={0}
//             hoverPath={hoverPath}
//             setHoverPath={setHoverPath}
//             inheritedStyle={defaultInheritedStyle}
//             onCursorChange={onCursorChange}
//             isActive={isActive}
//             ancestorIds={emptyAncestorIds}
//             onDropNode={handleDropNode}
//             showPlaceholder={false}
//             editorState={editorState}
//             updateEditorState={updateEditorState}
//             editorRef={editorRef}
//           />
//         </div>
//       </div>
//       <LatexViewer rootNode={editorState.rootNode} showLatex={showLatex} />
//     </>
//   );
// };

// export default React.memo(MathEditor); 

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { setCursor } from "../../logic/editor-state";
import { handleKeyDown } from "../../logic/handle-keydown";
import { MathRenderer } from "./MathRenderer";
import { useZoom } from "../../hooks/mathZoom/useZoom";
import { insertNodeAtCursor, deleteSelectedNode, getSelectedNode } from "../../logic/node-manipulation";
import { parseLatex } from "../../models/latexParser";
import { nodeToLatex } from "../../models/nodeToLatex";
import { findNodeById } from "../../utils/treeUtils";
import type { EditorState } from "../../logic/editor-state";
import type { CursorPosition } from "../../logic/cursor";
import type { TextStyle } from "../../models/mathNodeTypes";
import { useHover } from "../../hooks/mathHover/useHover";
import type { DragSource, DropTarget } from "../../models/dragTypes";
import { useCustomCommands } from "../../hooks/customCommands/useCustomCommands";
// import { useDragReader, useDragWriter } from "../../hooks/mathDrag/useDragContext";

interface MathEditorProps {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  cellId: string;
  editorState: EditorState;
  updateEditorState: (newState: EditorState) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
  onHoverInfoChange?: (info: { hoveredType: string; zoomLevel: number }) => void;
  onFocus?: () => void;          // notify parent when focused
  // onBlur?: () => void;          // notify parent when blurred
  isSelected: boolean;           // only selected cell can focus
}

const MathEditor: React.FC<MathEditorProps> = ({
  resetZoomSignal,
  defaultZoom,
  cellId,
  editorState,
  updateEditorState,
  onDropNode,
  onHoverInfoChange,
  onFocus,
  // onBlur,
  isSelected,
}) => {
  const { commandMap } = useCustomCommands();
  const { hoverPath, setHoverPath } = useHover();
  const editorRef = useRef<HTMLDivElement>(null);
  const zoomLevel = useZoom(editorRef, resetZoomSignal, defaultZoom);

  // const { draggingSource, dropTarget } = useDragReader();
  // const { setDropTarget } = useDragWriter();

  const hoveredNode = hoverPath[hoverPath.length - 1]
    ? findNodeById(editorState.rootNode, hoverPath[hoverPath.length - 1])
    : null;
  const hoveredType = hoveredNode?.type ?? "";

  useEffect(() => {
    if (onHoverInfoChange) {
      onHoverInfoChange({ hoveredType, zoomLevel });
    }
  }, [hoveredType, zoomLevel, onHoverInfoChange]);

  // Focus only if selected
  useEffect(() => {
    if (isSelected) {
      editorRef.current?.focus();
      onFocus?.();
    }
  }, [isSelected, onFocus]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const prevNode = getSelectedNode(editorState)
    const updated = handleKeyDown(e, editorState, commandMap);
    if (updated) {
      if (prevNode?.type === 'command-input') {
        const newNode = getSelectedNode(updated)
        if (newNode?.type !== "command-input") {
          editorRef.current?.focus();
          onFocus?.();
        }
      }
      updateEditorState(updated);
    }
  };

  const onCopy = (e: React.ClipboardEvent) => {
    const selectedNode = getSelectedNode(editorState);
    if (selectedNode) {
      e.clipboardData.setData("text/plain", nodeToLatex(selectedNode, false));
      e.preventDefault();
    }
  };

  const onCut = (e: React.ClipboardEvent) => {
    const selectedNode = getSelectedNode(editorState);
    if (selectedNode) {
      e.clipboardData.setData("text/plain", nodeToLatex(selectedNode, false));
      updateEditorState(deleteSelectedNode(editorState));
      e.preventDefault();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text/plain");
    if (!pastedText) return;

    try {
      const pastedNode = parseLatex(pastedText);
      updateEditorState(insertNodeAtCursor(editorState, pastedNode));
      e.preventDefault();
    } catch {
      // fail silently
    }
  };

  const handleDropNode = useCallback(
    (from: DragSource, to: DropTarget) => {
      if (!to || to.type === "libraryCollection") return;

      let adjustedTo = to;

      if (to.type === "cell" && to.cellId === cellId && to.containerId === "root") {
        const child = editorState.rootNode.child;
        adjustedTo = { ...to, containerId: child.id, index: child.children.length - 1 };
      }

      onDropNode(from, adjustedTo);
      editorRef.current?.focus();
      onFocus?.();
    },
    [cellId, editorState.rootNode.child, onDropNode, onFocus]
  );

  const onCursorChange = useCallback((cursor: CursorPosition) => {
    updateEditorState(setCursor(editorState, cursor));
  }, [editorState, updateEditorState]);

  const defaultInheritedStyle = useMemo<TextStyle>(
    () => ({ fontStyling: { fontStyle: "normal", fontStyleAlias: "" } }),
    []
  );

  const setCursorToEnd = useCallback(() => {
    const rootChild = editorState.rootNode.child;
    if (!rootChild) return;

    const newCursor: CursorPosition = {
      containerId: rootChild.id,
      index: rootChild.children.length, // place cursor at the end
    };
    updateEditorState(setCursor(editorState, newCursor));
  }, [editorState, updateEditorState]);


  const emptyAncestorIds = useMemo<string[]>(() => [], []);

  return (
    <div
      ref={editorRef}
      className="math-editor"
      tabIndex={isSelected ? 0 : -1}  // only selected cell is focusable
      onKeyDown={onKeyDown}
      onCopy={onCopy}
      onCut={onCut}
      onPaste={onPaste}
      onFocus={onFocus}
      onBlur={setCursorToEnd}
      onMouseLeave={() => setHoverPath([])}
    >
      <div className="math-editor-scroll-inner">
        <MathRenderer
          cellId={cellId}
          node={editorState.rootNode}
          cursor={editorState.cursor}
          containerId="root"
          index={0}
          hoverPath={hoverPath}
          setHoverPath={setHoverPath}
          inheritedStyle={defaultInheritedStyle}
          onCursorChange={onCursorChange}
          isActive={isSelected}
          ancestorIds={emptyAncestorIds}
          onDropNode={handleDropNode}
          showPlaceholder={false}
          editorState={editorState}
          updateEditorState={updateEditorState}
          editorRef={editorRef}
        />
      </div>
    </div>
  );
};

export default React.memo(MathEditor);
