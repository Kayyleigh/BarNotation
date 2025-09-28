// // // components/mathExpression/MathEditor.tsx
// // import React, { useCallback, useEffect, useMemo, useRef } from "react";
// // import { setCursor } from "../../logic/editor-state";
// // import { handleKeyDown } from "../../logic/handle-keydown";
// // import { MathRenderer } from "./MathRenderer";
// // import { useZoom } from "../../hooks/mathZoom/useZoom";
// // import { insertNodeAtCursor, deleteSelectedNode, getSelectedNode } from "../../logic/node-manipulation";
// // import { parseLatex } from "../../models/latexParser";
// // import { nodeToLatex } from "../../models/nodeToLatex";
// // import { findNodeById } from "../../utils/treeUtils";
// // import type { EditorState } from "../../logic/editor-state";
// // import type { CursorPosition } from "../../logic/cursor";
// // import type { TextStyle } from "../../models/mathNodeTypes";
// // import { useHover } from "../../hooks/mathHover/useHover";
// // import type { DragSource, DropTarget } from "../../models/dragTypes";
// // import { useCustomCommands } from "../../hooks/customCommands/useCustomCommands";

// // interface MathEditorProps {
// //   resetZoomSignal: number;
// //   defaultZoom: number;
// //   showLatex: boolean;
// //   cellId: string;
// //   editorState: EditorState;
// //   updateEditorState: (newState: EditorState) => void;
// //   onDropNode: (from: DragSource, to: DropTarget) => void;
// //   onHoverInfoChange?: (info: { hoveredType: string; zoomLevel: number }) => void;
// //   onFocus?: () => void;          // notify parent when focused
// //   isSelected: boolean;           // only selected cell can focus
// // }

// // const MathEditor: React.FC<MathEditorProps> = ({
// //   resetZoomSignal,
// //   defaultZoom,
// //   cellId,
// //   editorState,
// //   updateEditorState,
// //   onDropNode,
// //   onHoverInfoChange,
// //   onFocus,
// //   // onBlur,
// //   isSelected,
// // }) => {
// //   const { commandMap } = useCustomCommands();
// //   const { hoverPath, setHoverPath } = useHover();
// //   const editorRef = useRef<HTMLDivElement>(null);
// //   const zoomLevel = useZoom(editorRef, resetZoomSignal, defaultZoom);

// //   const hoveredNode = hoverPath[hoverPath.length - 1]
// //     ? findNodeById(editorState.rootNode, hoverPath[hoverPath.length - 1])
// //     : null;
// //   const hoveredType = hoveredNode?.type ?? "";

// //   useEffect(() => {
// //     if (onHoverInfoChange) {
// //       onHoverInfoChange({ hoveredType, zoomLevel });
// //     }
// //   }, [hoveredType, zoomLevel, onHoverInfoChange]);

// //   // Focus only if selected
// //   useEffect(() => {
// //     if (isSelected) {
// //       editorRef.current?.focus();
// //       onFocus?.();
// //     }
// //   }, [isSelected, onFocus]);

// //   const onKeyDown = (e: React.KeyboardEvent) => {
// //     const prevNode = getSelectedNode(editorState)
// //     const updated = handleKeyDown(e, editorState, commandMap);
// //     if (updated) {
// //       if (prevNode?.type === 'command-input') {
// //         const newNode = getSelectedNode(updated)
// //         if (newNode?.type !== "command-input") {
// //           editorRef.current?.focus();
// //           onFocus?.();
// //         }
// //       }
// //       updateEditorState(updated);
// //     }
// //   };

// //   const onCopy = (e: React.ClipboardEvent) => {
// //     const selectedNode = getSelectedNode(editorState);
// //     if (!selectedNode) {
// //       console.warn("No node selected on copy");
// //       return;
// //     }
// //     if (selectedNode) {
// //       const latex = nodeToLatex(selectedNode, false);
// //       e.clipboardData.setData("text/plain", latex);
// //       console.log("Copied LaTeX:", latex);
// //       e.preventDefault();
// //     }
// //   };

// //   const onCut = (e: React.ClipboardEvent) => {
// //     const selectedNode = getSelectedNode(editorState);
// //     if (selectedNode) {
// //       e.clipboardData.setData("text/plain", nodeToLatex(selectedNode, false));
// //       updateEditorState(deleteSelectedNode(editorState));
// //       e.preventDefault();
// //     }
// //   };

// //   const onPaste = (e: React.ClipboardEvent) => {
// //     const pastedText = e.clipboardData.getData("text/plain");

// //     if (!pastedText) {
// //       console.warn("Nothing in clipboard");
// //       return;
// //     }

// //     try {
// //       const pastedNode = parseLatex(pastedText);
// //       updateEditorState(insertNodeAtCursor(editorState, pastedNode));
// //       console.log("Pasted LaTeX:", pastedText);

// //       e.preventDefault();
// //     } catch (err) {
// //       console.error("Error during paste:", err);
// //     }
// //   };

// //   // const handleDropNode = useCallback(
// //   //   (from: DragSource, to: DropTarget) => {
// //   //     if (!to || to.type === "libraryCollection") return;

// //   //     let adjustedTo = to;

// //   //     if (to.type === "cell" && to.cellId === cellId && to.containerId === "root") {
// //   //       const child = editorState.rootNode.child;
// //   //       adjustedTo = { ...to, containerId: child.id, index: child.children.length - 1 };
// //   //     }

// //   //     onDropNode(from, adjustedTo);

// //   //     //TODO: make sure this is a bit delayed
// //   //     editorRef.current?.focus();
// //   //     onFocus?.();
// //   //   },
// //   //   [cellId, editorState.rootNode.child, onDropNode, onFocus]
// //   // );

// //   // At top of MathEditor (or wherever makes sense)
// //   const isDroppingRef = useRef(false);

// //   const handleDropNode = useCallback(
// //     (from: DragSource, to: DropTarget) => {
// //       if (!to || to.type === "libraryCollection") return;

// //       isDroppingRef.current = true; // Mark as dropping

// //       let adjustedTo = to;

// //       if (to.type === "cell" && to.cellId === cellId && to.containerId === "root") {
// //         const child = editorState.rootNode.child;
// //         adjustedTo = { ...to, containerId: child.id, index: child.children.length - 1 };
// //       }

// //       onDropNode(from, adjustedTo);

// //       // Ensure blurEditor doesn’t immediately clobber state
// //       setTimeout(() => {
// //         isDroppingRef.current = false;
// //         editorRef.current?.focus();
// //         onFocus?.();
// //       }, 0);
// //     },
// //     [cellId, editorState.rootNode.child, onDropNode, onFocus]
// //   );

// //   const onCursorChange = useCallback((cursor: CursorPosition) => {
// //     updateEditorState(setCursor(editorState, cursor));
// //   }, [editorState, updateEditorState]);

// //   const defaultInheritedStyle = useMemo<TextStyle>(
// //     () => ({ fontStyling: { fontStyle: "normal", fontStyleAlias: "" } }),
// //     []
// //   );

// //   const emptyAncestorIds = useMemo<string[]>(() => [], []);

// //   return (
// //     <div
// //       ref={editorRef}
// //       className="math-editor"
// //       tabIndex={isSelected ? 0 : 0}  // only selected cell is focusable
// //       onKeyDown={onKeyDown}
// //       onCopy={onCopy}
// //       onCut={onCut}
// //       onPaste={onPaste}
// //       // onFocus={onFocus}
// //       onMouseLeave={() => setHoverPath([])}
// //     >
// //       <div className="math-editor-scroll-inner">
// //         <MathRenderer
// //           cellId={cellId}
// //           node={editorState.rootNode}
// //           cursor={editorState.cursor}
// //           containerId="root"
// //           index={0}
// //           hoverPath={hoverPath}
// //           setHoverPath={setHoverPath}
// //           inheritedStyle={defaultInheritedStyle}
// //           onCursorChange={onCursorChange}
// //           isActive={isSelected}
// //           ancestorIds={emptyAncestorIds}
// //           onDropNode={handleDropNode}
// //           showPlaceholder={false}
// //           editorState={editorState}
// //           updateEditorState={updateEditorState}
// //           editorRef={editorRef}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default React.memo(MathEditor);

// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   forwardRef,
//   useImperativeHandle,
// } from "react";
// import { setCursor } from "../../logic/editor-state";
// import { handleKeyDown } from "../../logic/handle-keydown";
// import { MathRenderer } from "./MathRenderer";
// import { useZoom } from "../../hooks/mathZoom/useZoom";
// import { insertNodeAtCursor, deleteSelectedNode, getSelectedNode } from "../../logic/node-manipulation";
// import { parseLatex } from "../../models/latexParser";
// import { nodeToLatex } from "../../models/nodeToLatex";
// import { findNodeById } from "../../utils/treeUtils";
// import type { EditorState } from "../../logic/editor-state";
// import type { CursorPosition } from "../../logic/cursor";
// import type { TextStyle } from "../../models/mathNodeTypes";
// import { useHover } from "../../hooks/mathHover/useHover";
// import type { DragSource, DropTarget } from "../../models/dragTypes";
// import { useCustomCommands } from "../../hooks/customCommands/useCustomCommands";

// export interface MathEditorHandle {
//   focusAndScroll: () => void;
// }

// interface MathEditorProps {
//   resetZoomSignal: number;
//   defaultZoom: number;
//   showLatex: boolean;
//   cellId: string;
//   editorState: EditorState;
//   updateEditorState: (newState: EditorState) => void;
//   onDropNode: (from: DragSource, to: DropTarget) => void;
//   onHoverInfoChange?: (info: { hoveredType: string; zoomLevel: number }) => void;
//   onFocus?: () => void;
//   isSelected: boolean;
// }

// const MathEditor = forwardRef<MathEditorHandle, MathEditorProps>(({
//   resetZoomSignal,
//   defaultZoom,
//   cellId,
//   editorState,
//   updateEditorState,
//   onDropNode,
//   onHoverInfoChange,
//   onFocus,
//   isSelected,
// }, ref) => {
//   const { commandMap } = useCustomCommands();
//   const { hoverPath, setHoverPath } = useHover();
//   const editorRef = useRef<HTMLDivElement>(null);
//   const zoomLevel = useZoom(editorRef, resetZoomSignal, defaultZoom);

//   const hoveredNode = hoverPath[hoverPath.length - 1]
//     ? findNodeById(editorState.rootNode, hoverPath[hoverPath.length - 1])
//     : null;
//   const hoveredType = hoveredNode?.type ?? "";

//   // Expose focusAndScroll to parent
//   useImperativeHandle(ref, () => ({
//     focusAndScroll: () => {
//       if (!isSelected) return;
//       editorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
//       editorRef.current?.focus();

//       // Move cursor to end
//       const rootChild = editorState.rootNode.child;
//       if (rootChild) {
//         const newCursor: CursorPosition = {
//           containerId: rootChild.id,
//           index: rootChild.children.length,
//         };
//         updateEditorState(setCursor(editorState, newCursor));
//       }

//       onFocus?.();
//     },
//   }), [editorState, isSelected, onFocus, updateEditorState]);

//   useEffect(() => {
//     if (onHoverInfoChange) onHoverInfoChange({ hoveredType, zoomLevel });
//   }, [hoveredType, zoomLevel, onHoverInfoChange]);

//   const onKeyDown = (e: React.KeyboardEvent) => {
//     const prevNode = getSelectedNode(editorState);
//     const updated = handleKeyDown(e, editorState, commandMap);
//     if (updated) {
//       if (prevNode?.type === 'command-input') {
//         const newNode = getSelectedNode(updated);
//         if (newNode?.type !== "command-input") {
//           editorRef.current?.focus();
//           onFocus?.();
//         }
//       }
//       updateEditorState(updated);
//     }
//   };

//   const editorStateRef = useRef(editorState);
//   editorStateRef.current = editorState; // always keep latest

//   useEffect(() => {
//     const el = editorRef.current;
//     if (!el) return;

//     const handleCopy = (e: ClipboardEvent) => {
//       const selectedNode = getSelectedNode(editorStateRef.current);
//       if (!selectedNode) return;
//       e.clipboardData?.setData("text/plain", nodeToLatex(selectedNode, false));
//       e.preventDefault();
//     };

//     const handleCut = (e: ClipboardEvent) => {
//       const selectedNode = getSelectedNode(editorStateRef.current);
//       if (!selectedNode) return;
//       e.clipboardData?.setData("text/plain", nodeToLatex(selectedNode, false));
//       updateEditorState(deleteSelectedNode(editorStateRef.current));
//       e.preventDefault();
//     };

//     const handlePaste = (e: ClipboardEvent) => {
//       const pastedText = e.clipboardData?.getData("text/plain");
//       if (!pastedText) return;
//       try {
//         const pastedNode = parseLatex(pastedText);
//         updateEditorState(insertNodeAtCursor(editorStateRef.current, pastedNode));
//         e.preventDefault();
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     el.addEventListener("copy", handleCopy);
//     el.addEventListener("cut", handleCut);
//     el.addEventListener("paste", handlePaste);

//     return () => {
//       el.removeEventListener("copy", handleCopy);
//       el.removeEventListener("cut", handleCut);
//       el.removeEventListener("paste", handlePaste);
//     };
//   }, [updateEditorState]);


//   const isDroppingRef = useRef(false);
//   const handleDropNode = useCallback((from: DragSource, to: DropTarget) => {
//     if (!to || to.type === "libraryCollection") return;
//     isDroppingRef.current = true;
//     let adjustedTo = to;
//     if (to.type === "cell" && to.cellId === cellId && to.containerId === "root") {
//       const child = editorState.rootNode.child;
//       adjustedTo = { ...to, containerId: child.id, index: child.children.length - 1 };
//     }
//     onDropNode(from, adjustedTo);
//     setTimeout(() => { isDroppingRef.current = false; editorRef.current?.focus(); onFocus?.(); }, 0);
//   }, [cellId, editorState.rootNode.child, onDropNode, onFocus]);

//   const onCursorChange = useCallback((cursor: CursorPosition) => {
//     updateEditorState(setCursor(editorState, cursor));
//   }, [editorState, updateEditorState]);

//   const defaultInheritedStyle = useMemo<TextStyle>(
//     () => ({ fontStyling: { fontStyle: "normal", fontStyleAlias: "" } }), []
//   );
//   const emptyAncestorIds = useMemo<string[]>(() => [], []);

//   return (
//     <div
//       ref={editorRef}
//       className="math-editor"
//       tabIndex={0}
//       onKeyDown={onKeyDown}
//       onFocus={onFocus}     // optional, notify parent
//         contentEditable={true} // <-- allows paste events reliably

//       onMouseLeave={() => setHoverPath([])}
//     >
//       <div className="math-editor-scroll-inner">
//         <MathRenderer
//           cellId={cellId}
//           node={editorState.rootNode}
//           cursor={editorState.cursor}
//           containerId="root"
//           index={0}
//           hoverPath={hoverPath}
//           setHoverPath={setHoverPath}
//           inheritedStyle={defaultInheritedStyle}
//           onCursorChange={onCursorChange}
//           isActive={isSelected}
//           ancestorIds={emptyAncestorIds}
//           onDropNode={handleDropNode}
//           showPlaceholder={false}
//           editorState={editorState}
//           updateEditorState={updateEditorState}
//           editorRef={editorRef}
//         />
//       </div>
//     </div>
//   );
// });

// export default React.memo(MathEditor);

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
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

export interface MathEditorHandle {
  focusAndScroll: () => void;
}

interface MathEditorProps {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  cellId: string;
  editorState: EditorState;
  updateEditorState: (newState: EditorState) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
  onHoverInfoChange?: (info: { hoveredType: string; zoomLevel: number }) => void;
  onFocus?: () => void;
  isSelected: boolean;
}

const MathEditor = forwardRef<MathEditorHandle, MathEditorProps>(({
  resetZoomSignal,
  defaultZoom,
  cellId,
  editorState,
  updateEditorState,
  onDropNode,
  onHoverInfoChange,
  onFocus,
  isSelected,
}, ref) => {
  const { commandMap } = useCustomCommands();
  const { hoverPath, setHoverPath } = useHover();
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);
  const zoomLevel = useZoom(editorRef, resetZoomSignal, defaultZoom);

  const hoveredNode = hoverPath[hoverPath.length - 1]
    ? findNodeById(editorState.rootNode, hoverPath[hoverPath.length - 1])
    : null;
  const hoveredType = hoveredNode?.type ?? "";

  // Expose focusAndScroll
  useImperativeHandle(ref, () => ({
    focusAndScroll: () => {
      if (!isSelected) return;
      editorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      editorRef.current?.focus();

      if (!isDroppingRef) {
        // Move cursor to end
        const rootChild = editorState.rootNode.child;
        if (rootChild) {
          const newCursor: CursorPosition = {
            containerId: rootChild.id,
            index: rootChild.children.length,
          };
          updateEditorState(setCursor(editorState, newCursor));
        }
      }
      onFocus?.();
    },
  }), [editorState, isSelected, onFocus, updateEditorState]);

  // Update hover info
  useEffect(() => {
    if (onHoverInfoChange) onHoverInfoChange({ hoveredType, zoomLevel });
  }, [hoveredType, zoomLevel, onHoverInfoChange]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const prevNode = getSelectedNode(editorState);
    const updated = handleKeyDown(e, editorState, commandMap);

    if (updated) {
      updateEditorState(updated);

      const newNode = getSelectedNode(updated);

      // Return focus after manual completion
      if (prevNode?.type === 'command-input' && newNode?.type !== "command-input") {
        hiddenTextareaRef.current?.focus();
      }
    }
  };

  // Clipboard handling via hidden textarea
  const editorStateRef = useRef(editorState);
  editorStateRef.current = editorState; // always latest

  useEffect(() => {
    const textarea = hiddenTextareaRef.current;
    if (!textarea) return;

    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData("text/plain");
      if (!pastedText) return;

      try {
        const pastedNode = parseLatex(pastedText);
        updateEditorState(insertNodeAtCursor(editorStateRef.current, pastedNode));
        e.preventDefault();
      } catch (err) {
        console.error(err);
      }
    };

    const handleCopyCut = (e: ClipboardEvent, isCut: boolean) => {
      const selectedNode = getSelectedNode(editorStateRef.current);
      if (!selectedNode) return;

      e.clipboardData?.setData("text/plain", nodeToLatex(selectedNode, false));
      if (isCut) updateEditorState(deleteSelectedNode(editorStateRef.current));
      e.preventDefault();
    };

    textarea.addEventListener("paste", handlePaste);
    textarea.addEventListener("copy", (e) => handleCopyCut(e, false));
    textarea.addEventListener("cut", (e) => handleCopyCut(e, true));

    return () => {
      textarea.removeEventListener("paste", handlePaste);
      textarea.removeEventListener("copy", (e) => handleCopyCut(e, false));
      textarea.removeEventListener("cut", (e) => handleCopyCut(e, true));
    };
  }, [updateEditorState]);

  const isDroppingRef = useRef(false);

  const handleDropNode = useCallback((from: DragSource, to: DropTarget) => {
    if (!to || to.type === "libraryCollection") return;
    isDroppingRef.current = true;
    let adjustedTo = to;
    if (to.type === "cell" && to.cellId === cellId && to.containerId === "root") {
      const child = editorState.rootNode.child;
      adjustedTo = { ...to, containerId: child.id, index: child.children.length - 1 };
    }
    onDropNode(from, adjustedTo);
    editorRef.current?.focus();
    onFocus?.();
    setTimeout(() => {
      isDroppingRef.current = false;
    }, 0);
  }, [cellId, editorState.rootNode.child, onDropNode, onFocus]);

  const onCursorChange = useCallback((cursor: CursorPosition) => {
    updateEditorState(setCursor(editorState, cursor));
  }, [editorState, updateEditorState]);

  const defaultInheritedStyle = useMemo<TextStyle>(
    () => ({ fontStyling: { fontStyle: "normal", fontStyleAlias: "" } }), []
  );
  const emptyAncestorIds = useMemo<string[]>(() => [], []);

  const handleEditorFocus = useCallback(() => {
    const selectedNode = getSelectedNode(editorState);
    if (!selectedNode || selectedNode.type !== "command-input") {
      hiddenTextareaRef.current?.focus();
    }
  }, [editorState]);

  return (
    <div
      ref={editorRef}
      className="math-editor"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onFocus={handleEditorFocus}
      onMouseLeave={() => setHoverPath([])}
    >
      {/* Hidden textarea for clipboard */}
      <textarea
        ref={hiddenTextareaRef}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 0,
          height: 0,
        }}
      />

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
          editorRef={hiddenTextareaRef}
        />
      </div>
    </div>
  );
});

export default React.memo(MathEditor);
