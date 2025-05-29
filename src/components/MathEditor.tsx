import React, { useRef } from "react";
import { createRootWrapper } from "../models/nodeFactories";
import { createEditorState, setCursor, setHoveredNode } from "../logic/editor-state";
import { handleKeyDown } from "../logic/handle-keydown";
import { MathRenderer } from "./MathRenderer";
import { useEditorHistory } from "../hooks/useEditorHistory";
import {
  insertNodeAtCursor,
  deleteSelectedNode,
  getSelectedNode,
} from "../logic/node-manipulation";
import { nodeToLatex } from "../models/latexParser";
import { parseLatex } from "../models/mathNodeParser";
import { findNodeById } from "../utils/treeUtils";

const initialState = createEditorState(createRootWrapper());

const MathEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  const {
    state: editorState,
    update: updateEditorState,
    undo,
    redo,
  } = useEditorHistory(initialState);

  // Get hovered node type
  const hoveredNode = editorState.hoveredNodeId && findNodeById(editorState.rootNode, editorState.hoveredNodeId);
  const hoveredType = hoveredNode ? hoveredNode.type : "None";


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
      e.clipboardData.setData("text/plain", nodeToLatex(selectedNode));
      e.preventDefault();
    }
  };

  const onCut = (e: React.ClipboardEvent) => {
    const selectedNode = getSelectedNode(editorState);
    if (selectedNode) {
      e.clipboardData.setData("text/plain", nodeToLatex(selectedNode));
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
    <div
      ref={editorRef}
      className="math-editor"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onCopy={onCopy}
      onCut={onCut}
      onPaste={onPaste}
    >
      <MathRenderer
        node={editorState.rootNode}
        cursor={editorState.cursor}
        hoveredId={editorState.hoveredNodeId}
        onCursorChange={(newCursor) =>
          updateEditorState(setCursor(editorState, newCursor))
        }
        onRootChange={(newRoot) =>
          updateEditorState({ ...editorState, rootNode: newRoot })
        }
        onHoverChange={(hoveredId) =>
          updateEditorState(setHoveredNode(editorState, hoveredId))
        }
      />
    {/* Overlay text in upper right */}
    {hoveredType && (
        <div className="hover-type-info">
          {hoveredType}
        </div>
      )}
    </div>
  );
};

export default MathEditor;
