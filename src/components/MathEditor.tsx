import React, { useEffect, useRef, useState } from "react";
import { createRootWrapper } from "../models/nodeFactories";
import { createEditorState, setCursor } from "../logic/editor-state";
import { handleKeyDown } from "../logic/handle-keydown";
import { MathRenderer } from "./MathRenderer";
import LatexViewer from "./LatexViewer";
import { useEditorHistory } from "../hooks/useEditorHistory";
import { useDragState } from "../hooks/useDragState";
import { useHoverState } from "../hooks/useHoverState";
import { useZoom } from "../hooks/useZoom";
import {
  insertNodeAtCursor,
  deleteSelectedNode,
  getSelectedNode,
} from "../logic/node-manipulation";
import { parseLatex } from "../models/mathNodeParser";
import { findNodeById } from "../utils/treeUtils";
import { nodeToLatex } from "../models/nodeToLatex";

const initialState = createEditorState(createRootWrapper());

const MathEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  const {
    state: editorState,
    update: updateEditorState,
    undo,
    redo,
  } = useEditorHistory(initialState);

  // Create a ref that always has the current editorState
  const editorStateRef = useRef(editorState);
  useEffect(() => {
    editorStateRef.current = editorState;
  }, [editorState]);

  const { 
    hoveredNodeId, 
    setHoveredNodeId 
  } = useHoverState();

  // Hook with ref instead of value
  const {
    startDrag,
    updateDropTarget,
    handleDrop,
    clearDrag,
    dropTargetId,
    dropTargetIndex,
  } = useDragState(editorStateRef, updateEditorState);

  // Active state for editor (i.e. is cursor active in this editor component?)
  const [isActive, setIsActive] = useState(false);

  // Zoom level
  const zoomLevel = useZoom(editorRef);

  // Get hovered node type
  const hoveredNode = hoveredNodeId && findNodeById(editorState.rootNode, hoveredNodeId);
  const hoveredType = hoveredNode ? hoveredNode.type : "None";

  const dropTargetCursor = { containerId: dropTargetId, index: dropTargetIndex }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const isMac = navigator.platform.includes("Mac");
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    if (ctrlKey && e.key === "z") {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
      return;
    }

    if (ctrlKey && e.key === "y") {
      e.preventDefault();
      redo();
      return;
    }

    const updated = handleKeyDown(e, editorState);
    if (updated) updateEditorState(updated);
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
        onFocus={() => setIsActive(true)}
        onBlur={(e) => {
          // Only clear active if focus leaves the whole editor container
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsActive(false);
          }
        }}
      >
        <MathRenderer
          node={editorState.rootNode}
          cursor={editorState.cursor}
          dropTargetCursor={dropTargetCursor}
          hoveredId={hoveredNodeId}
          onHoverChange={setHoveredNodeId}
          onCursorChange={(newCursor) =>
            updateEditorState(setCursor(editorState, newCursor))
          }
          onRootChange={(newRoot) =>
            updateEditorState({ ...editorState, rootNode: newRoot })
          }
          onStartDrag={startDrag}
          onUpdateDropTarget={updateDropTarget}
          onHandleDrop={handleDrop}
          onClearDrag={clearDrag}
          isActive={isActive}  // is editor active (i.e. should I render the cursor)
        />
      {/* Overlay text in upper right */}
      {hoveredType && (
          <div className="hover-type-info">
  {hoveredType} • {Math.round(zoomLevel * 100)}%
  </div>
        )}
      </div>
      <LatexViewer rootNode={editorState.rootNode} />
    </div>
  );
};

export default MathEditor;
