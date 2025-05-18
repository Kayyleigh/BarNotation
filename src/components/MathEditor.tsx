import React, { useRef } from "react";
import { createInlineContainer } from "../models/nodeFactories"
import { createEditorState, setCursor, type EditorState } from "../logic/editor-state";
import { handleKeyDown } from "../logic/handle-keydown";
import Toolbar from "./Toolbar";
import { MathRenderer } from "./MathRenderer";
import { useEditorHistory } from "../hooks/useEditorHistory";
import {
  insertNodeAtCursor,
  deleteSelectedNode,
  getSelectedNode,
} from "../logic/node-manipulation";
import { nodeToLatex } from "../models/latexParser";
import { parseLatex } from "../models/mathNodeParser";

const initialState: EditorState = createEditorState(
  createInlineContainer()
);

export const MathEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Replace useState with undoable state hook
  const {
    state: editorState,
    update: updateEditorState,
    undo,
    redo,
  } = useEditorHistory(initialState);
  
  const onKeyDown = (e: React.KeyboardEvent) => {
    const isMac = navigator.platform.includes("Mac"); //TODO what
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    // Handle undo/redo
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

    // Apply transformations (with history tracking)
    const updated = handleKeyDown(e, editorState);
    if (updated) updateEditorState(updated);
  };

  // Clipboard event handlers
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
      const pastedNode = parseLatex(pastedText); // your latex parser function
      const updated = insertNodeAtCursor(editorState, pastedNode);
      updateEditorState(updated);
      e.preventDefault();
    } catch (err) {
      console.warn("Paste failed:", err);
      console.warn(e.clipboardData.getData("text/plain"));
    }
  };


  return (
    <div className="editor-container">
      <Toolbar onAddNode={() => {}} />
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
          onCursorChange={(newCursor) =>
            updateEditorState(setCursor(editorState, newCursor))
          }
          onRootChange={(newRoot) =>
            updateEditorState({ ...editorState, rootNode: newRoot })
          }
        />
      </div>
    </div>
  );
};

export default MathEditor;
