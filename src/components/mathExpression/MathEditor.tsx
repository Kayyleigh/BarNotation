//components/mathExpression/MathEditor.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { setCursor } from "../../logic/editor-state";
import { handleKeyDown } from "../../logic/handle-keydown";
import { MathRenderer } from "./MathRenderer";
import LatexViewer from "./LatexViewer";
import { useZoom } from "../../hooks/useZoom";
import {
  insertNodeAtCursor,
  deleteSelectedNode,
  getSelectedNode,
} from "../../logic/node-manipulation";
import { parseLatex } from "../../models/latexParser";
import { nodeToLatex } from "../../models/nodeToLatex";
import { findNodeById } from "../../utils/treeUtils";
import type { EditorState } from "../../logic/editor-state";
import { useDragContext } from "../../hooks/useDragContext";
import type { CursorPosition } from "../../logic/cursor";
import type { DropTarget } from "../layout/EditorWorkspace";
import type { DragSource } from "../../hooks/DragContext";
import type { TextStyle } from "../../models/types";
import { useHover } from "../../hooks/useHover";

interface MathEditorProps {
  resetZoomSignal: number;
  defaultZoom: number;
  showLatex: boolean;
  cellId: string;
  editorState: EditorState;
  updateEditorState: (newState: EditorState) => void;
  onDropNode: (
    from: DragSource,
    to: DropTarget,
  ) => void;
  onHoverInfoChange?: (info: { hoveredType: string; zoomLevel: number }) => void;
}

const MathEditor: React.FC<MathEditorProps> = ({
  resetZoomSignal,
  defaultZoom,
  showLatex,
  cellId,
  editorState,
  updateEditorState,
  onDropNode,
  onHoverInfoChange,
}) => {
  // console.log("Rendering MathEditor", cellId);

  const { hoverPath, setHoverPath } = useHover();

  const editorRef = useRef<HTMLDivElement>(null);
  const zoomLevel = useZoom(editorRef, resetZoomSignal, defaultZoom);

  const [isActive, setIsActive] = useState(false);

  const { draggingNode, dropTarget, setDropTarget } = useDragContext();

  const hoveredNode = hoverPath[hoverPath.length - 1]
    ? findNodeById(editorState.rootNode, hoverPath[hoverPath.length - 1])
    : null;
  const hoveredType = hoveredNode?.type ?? "";

  useEffect(() => {
    const node = editorRef.current;
    if (!node) {
      setHoverPath([])
      return;
    }
  
    const handleMouseLeave = (e: MouseEvent) => {
      const related = e.relatedTarget as Node | null;
      if (!related || !node.contains(related)) {
        setHoverPath([]); // ← Clear hover when mouse leaves the entire editor
      }
    };
  
    node.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      node.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [setHoverPath]);

  useEffect(() => {
    if (onHoverInfoChange) {
      onHoverInfoChange({ hoveredType, zoomLevel });
    }
  }, [hoveredType, zoomLevel, onHoverInfoChange]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const updated = handleKeyDown(e, editorState);
    if (updated) updateEditorState(updated);
  };

  const onCursorChange = useCallback(
    (cursor: CursorPosition) => {
      console.log(`In onCursorChange`)
      if (cursor === editorState.cursor) return;
      updateEditorState(setCursor(editorState, cursor));
    },
    [editorState, updateEditorState]
  );

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
      const updated = deleteSelectedNode(editorState);
      updateEditorState(updated);
      e.preventDefault();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text/plain");
    if (!pastedText) return;

    try {
      const pastedNode = parseLatex(pastedText);
      const updated = insertNodeAtCursor(editorState, pastedNode);
      updateEditorState(updated);
      e.preventDefault();
    } catch (err) {
      console.warn("Paste failed:", err);
    }
  };

  // find the upper InlineContainerNode
  const rootChildContainerId =
    editorState.rootNode.type === "root-wrapper"
      ? editorState.rootNode.child.id
      : "unknown-container";

  const handleDropNode = React.useCallback((from: DragSource, to: DropTarget) => {
    // Redirect drop target if needed
    if (to.containerId === editorState.rootNode.id) {
      const child = editorState.rootNode.child;
      to = { ...to, containerId: child.id, index: 0 };
    }
    onDropNode(from, to);
  }, [editorState.rootNode, onDropNode]);

  const defaultInheritedStyle: TextStyle = React.useMemo(() => ({
    fontStyling: { fontStyle: "normal", fontStyleAlias: "" },
  }), []);

  const emptyAncestorIds = React.useMemo(() => [], []);

  return (
    <div>
      <div
        ref={editorRef}
        className="math-editor"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onCopy={onCopy}
        onCut={onCut}
        onPaste={onPaste}
        onMouseLeave={() => setHoverPath([])} 
        onFocus={() => setIsActive(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsActive(false);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (draggingNode && dropTarget?.cellId !== cellId) {
            setDropTarget({
              cellId,
              containerId: rootChildContainerId,
              index: 0,
            });
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (draggingNode && dropTarget) {
            onDropNode(draggingNode, dropTarget);
          }
          setDropTarget(null);
        }}
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
            isActive={isActive}
            ancestorIds={emptyAncestorIds}
            onDropNode={handleDropNode}
          />
        </div>
      </div>
      <LatexViewer rootNode={editorState.rootNode} showLatex={showLatex} />
    </div>
  );
};

export default React.memo(MathEditor); //TODO should be memo or no?