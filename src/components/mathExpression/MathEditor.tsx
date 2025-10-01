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
import type { CellEditorHandle } from "../editor/NotebookEditor";
import { useDragReader, useDragWriter } from "../../hooks/mathDrag/useDragContext";

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

const MathEditor = forwardRef<CellEditorHandle, MathEditorProps>((props, ref) => {
  const {
    resetZoomSignal,
    defaultZoom,
    cellId,
    editorState,
    updateEditorState,
    onDropNode,
    onHoverInfoChange,
    onFocus,
    isSelected,
  } = props;

  const { commandMap } = useCustomCommands();
  const { hoverPath, setHoverPath } = useHover();
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollInnerRef = useRef<HTMLDivElement>(null);
  const zoomLevel = useZoom(editorRef, resetZoomSignal, defaultZoom);
  const isDroppingRef = useRef(false);

  const hoveredNode = hoverPath.length ? findNodeById(editorState.rootNode, hoverPath[hoverPath.length - 1]) : null;
  const hoveredType = hoveredNode?.type ?? "";

  // ----- Cursor scrolling -----
  const scrollCursorIntoView = useCallback(() => {
    if (!scrollInnerRef.current) return;
    const cursorContainerNode = findNodeById(editorState.rootNode, editorState.cursor.containerId);
    if (!cursorContainerNode || cursorContainerNode.type !== "inline-container") return;

    const cursorNode = cursorContainerNode.children[editorState.cursor.index - 1];
    if (!cursorNode) return;

    const cursorEl = scrollInnerRef.current.querySelector<HTMLElement>(`[data-nodeid="${cursorNode.id}"]`);
    if (!cursorEl) return;

    const container = getScrollableParent(scrollInnerRef.current);
    if (!container) return;

    const elRect = cursorEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (elRect.right <= containerRect.left) {
      container.scrollLeft -= containerRect.left - elRect.left + 5;
    } else if (elRect.right > containerRect.right) {
      container.scrollLeft += elRect.right - containerRect.right + 5;
    }
  }, [editorState.cursor, editorState.rootNode]);

  // ----- Imperative methods -----
  useImperativeHandle(ref, () => ({
    focus: () => hiddenTextareaRef.current?.focus(),
    moveCursorToEnd: () => {
      const rootChild = editorState.rootNode.child;
      if (!rootChild) return;
      const newCursor: CursorPosition = { containerId: rootChild.id, index: rootChild.children.length };
      updateEditorState(setCursor(editorState, newCursor));
      scrollCursorIntoView();
    },
    ensureCursorInView: () => scrollCursorIntoView(),
    focusAndScroll: () => {
      onFocus?.();
      editorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      hiddenTextareaRef.current?.focus();
      const rootChild = editorState.rootNode.child;
      if (!rootChild) return;
      const newCursor: CursorPosition = { containerId: rootChild.id, index: rootChild.children.length };
      updateEditorState(setCursor(editorState, newCursor));
      scrollCursorIntoView();
    },
  }), [editorState, scrollCursorIntoView, onFocus, updateEditorState]);

  // ----- Hover info update -----
  useEffect(() => {
    onHoverInfoChange?.({ hoveredType, zoomLevel });
  }, [hoveredType, zoomLevel, onHoverInfoChange]);

  // ----- Scroll on cursor change -----
  useEffect(() => {
    scrollCursorIntoView();
  }, [editorState.cursor, scrollCursorIntoView]);

  // ----- Clipboard handling -----
  const editorStateRef = useRef(editorState);
  editorStateRef.current = editorState;

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

  // ----- Drag handling -----
  const handleDrop = useCallback((from: DragSource, to: DropTarget) => {
    if (!to || to.type === "libraryCollection") return;

    isDroppingRef.current = true;

    let adjustedTo = to;
    if (to.type === "cell" && to.cellId === cellId && to.containerId === "root") {
      const child = editorState.rootNode.child;
      adjustedTo = { ...to, containerId: child.id, index: child.children.length - 1 };
    }
    onDropNode(from, adjustedTo);
    onFocus?.();
    setTimeout(() => { isDroppingRef.current = false; }, 0);
  }, [cellId, editorState.rootNode, onDropNode, onFocus]);

  // ----- Cursor change -----
  const onCursorChange = useCallback((cursor: CursorPosition) => {
    updateEditorState(setCursor(editorState, cursor));
  }, [editorState, updateEditorState]);

  // ----- Key handling -----
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const prevNode = getSelectedNode(editorState);
    const updated = handleKeyDown(e, editorState, commandMap);

    if (updated) {
      updateEditorState(updated);
      const newNode = getSelectedNode(updated);
      if (prevNode?.type === "command-input" && newNode?.type !== "command-input") {
        hiddenTextareaRef.current?.focus();
      }
    }
  }, [editorState, commandMap, updateEditorState]);

  // ----- Click handling (sloppy selection) -----
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    let el = e.target as HTMLElement | null;
    while (el && el !== editorRef.current) {
      if (el.dataset.nodeid || el.className === "draggable-node-wrapper") return;
      el = el.parentElement;
    }
    onFocus?.();
    const rootChild = editorState.rootNode.child;
    if (!rootChild) return;
    const newCursor: CursorPosition = { containerId: rootChild.id, index: rootChild.children.length };
    if (!isDroppingRef.current) updateEditorState(setCursor(editorState, newCursor));
    hiddenTextareaRef.current?.focus();
  }, [editorState, onFocus, updateEditorState]);

  // ----- DragOver handling (sloppy drop) -----
  const { setDraggingSource, setDropTarget } = useDragWriter();
  const { draggingSource } = useDragReader();

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget({
      type: "cell",
      cellId: props.cellId,
      containerId: props.editorState.rootNode.child.id,
      index: props.editorState.rootNode.child.children.length - 1,
    });
  }, [props.cellId, props.editorState.rootNode.child.children.length, props.editorState.rootNode.child.id, setDropTarget]);

  const handleSloppyDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingSource) return;
    props.onDropNode(draggingSource, {
      type: "cell",
      cellId: props.cellId,
      containerId: props.editorState.rootNode.child.id,
      index: props.editorState.rootNode.child.children.length - 1,
    });
    onFocus?.();
    setDraggingSource(null);
    setDropTarget(null);
  };

  const defaultInheritedStyle = useMemo<TextStyle>(() => ({ fontStyling: { fontStyle: "normal", fontStyleAlias: "" } }), []);
  const emptyAncestorIds = useMemo<string[]>(() => [], []);

  const focusEditor = useCallback(() => {
    onFocus?.();
    hiddenTextareaRef.current?.focus();
  }, [onFocus]);

  return (
    <div
      ref={editorRef}
      className="math-editor"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onClick={handleMouseDown}
      onMouseLeave={() => setHoverPath([])}
      onDragOver={handleDragOver}
      onDrop={handleSloppyDrop}
    >
      <textarea
        ref={hiddenTextareaRef}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
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
          onDropNode={handleDrop}
          showPlaceholder={false}
          editorState={editorState}
          updateEditorState={updateEditorState}
          focusEditor={focusEditor}
        />
      </div>
    </div>
  );
});

MathEditor.displayName = "MathEditor";
export default React.memo(MathEditor);
