// components/mathExpression/MathEditor.tsx
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

  // const handleDropNode = useCallback(
  //   (from: DragSource, to: DropTarget) => {
  //     if (!to || to.type === "libraryCollection") return;

  //     let adjustedTo = to;

  //     if (to.type === "cell" && to.cellId === cellId && to.containerId === "root") {
  //       const child = editorState.rootNode.child;
  //       adjustedTo = { ...to, containerId: child.id, index: child.children.length - 1 };
  //     }

  //     onDropNode(from, adjustedTo);

  //     //TODO: make sure this is a bit delayed
  //     editorRef.current?.focus();
  //     onFocus?.();
  //   },
  //   [cellId, editorState.rootNode.child, onDropNode, onFocus]
  // );

  // At top of MathEditor (or wherever makes sense)
  const isDroppingRef = useRef(false);

  const handleDropNode = useCallback(
    (from: DragSource, to: DropTarget) => {
      if (!to || to.type === "libraryCollection") return;

      isDroppingRef.current = true; // Mark as dropping

      let adjustedTo = to;

      if (to.type === "cell" && to.cellId === cellId && to.containerId === "root") {
        const child = editorState.rootNode.child;
        adjustedTo = { ...to, containerId: child.id, index: child.children.length - 1 };
      }

      onDropNode(from, adjustedTo);

      // Ensure blurEditor doesn’t immediately clobber state
      setTimeout(() => {
        isDroppingRef.current = false;
        editorRef.current?.focus();
        onFocus?.();
      }, 0);
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
