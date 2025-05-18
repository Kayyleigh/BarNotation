import React, { useRef } from "react";
import { createInlineContainer } from "../models/nodeFactories"
import { createEditorState, setCursor, type EditorState } from "../logic/editor-state";
import { handleKeyDown } from "../logic/handle-keydown";
import Toolbar from "./Toolbar";
import { MathRenderer } from "./MathRenderer";
import { useEditorHistory } from "../hooks/useEditorHistory";

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
    const isMac = navigator.platform.includes("Mac");
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

  return (
    <div className="editor-container">
      <Toolbar onAddNode={() => {}} />
      <div
        ref={editorRef}
        className="math-editor"
        tabIndex={0}
        onKeyDown={onKeyDown}
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
