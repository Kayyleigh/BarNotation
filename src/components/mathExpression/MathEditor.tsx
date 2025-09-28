// components/mathExpression/MathEditor.tsx
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
import { getScrollableParent } from "../../utils/dom";

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

  const scrollInnerRef = useRef<HTMLDivElement>(null);

  const hoveredNode = hoverPath[hoverPath.length - 1]
    ? findNodeById(editorState.rootNode, hoverPath[hoverPath.length - 1])
    : null;
  const hoveredType = hoveredNode?.type ?? "";

  const scrollCursorIntoView = useCallback(() => {
    if (!scrollInnerRef.current) return;
    const cursorNodeId = editorState.cursor.containerId;
    if (!cursorNodeId) return;

    const cursorEl = scrollInnerRef.current.querySelector<HTMLElement>(
      `[data-nodeid="${cursorNodeId}"]`
    );
    if (!cursorEl) return;

    const container = getScrollableParent(scrollInnerRef.current);

    if (!container) return;

    const elRect = cursorEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // If cursor is left of visible area, scroll left
    if (elRect.right > containerRect.right) {
      container.scrollLeft += elRect.right - containerRect.right + 10;
    }
    // If cursor is right of visible area, scroll right
    else if (elRect.left > containerRect.left) {
      container.scrollLeft -= containerRect.left - elRect.left;
    }
  }, [editorState.cursor]);

  // Expose focusAndScroll
  // Imperative handle
  useImperativeHandle(ref, () => ({
    focusAndScroll: () => {
      if (!isSelected) return;
      editorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      editorRef.current?.focus();

      if (!isDroppingRef.current) {
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
      scrollCursorIntoView();
    },
  }), [editorState, isSelected, onFocus, scrollCursorIntoView, updateEditorState]);

  // Effect to scroll on cursor change
  useEffect(() => {
    scrollCursorIntoView();
  }, [scrollCursorIntoView]);

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

  const focusEditor = () => {
    hiddenTextareaRef.current?.focus();
    onFocus?.();
  };

  // handle click: ignore MathRenderer nodes
  const handleClick = useCallback((e: React.MouseEvent) => {
    console.log(`click`)

    let el = e.target as HTMLElement | null;
    while (el && el !== editorRef.current) {
      if (el.dataset.dataNodeid) return; // clicked on MathRenderer node
      el = el.parentElement;
    }

    // Not a MathRenderer → move cursor & call onFocus
    onFocus?.();
    if (!isDroppingRef.current) {
      const rootChild = editorState.rootNode.child;
      if (rootChild) {
        const newCursor: CursorPosition = {
          containerId: rootChild.id,
          index: rootChild.children.length,
        };
        updateEditorState(setCursor(editorState, newCursor));
      }
    }

    // Also focus textarea
    hiddenTextareaRef.current?.focus();
  }, [editorState, isDroppingRef, onFocus, updateEditorState]);

  // handle native focus event safely
  const handleFocus = useCallback(() => {
    // Only call the parent onFocus, DO NOT call editorRef.current.focus() again
    console.log(`focus`)
    onFocus?.();
  }, [onFocus]);


  useEffect(() => {
    scrollCursorIntoView();
  }, [editorState.cursor, scrollCursorIntoView]); //React Hook useEffect has a missing dependency: 'scrollCursorIntoView'. Either include it or remove the dependency array.eslintreact-hooks/exhaustive-deps

  return (
    <div
      ref={editorRef}
      className="math-editor"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onClick={handleClick}
      onFocus={handleFocus}
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

      <div className="math-editor-scroll-inner" ref={scrollInnerRef}>
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
          focusEditor={focusEditor}
        />
      </div>
    </div>
  );
});

export default React.memo(MathEditor);
