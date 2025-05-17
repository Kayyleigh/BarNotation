import React, { useRef, useState } from "react";
import { createInlineContainer } from "../models/nodeFactories"
import { createEditorState, setCursor, type EditorState } from "../logic/editor-state";
import { handleKeyDown } from "../logic/handle-keydown";
import Toolbar from "./Toolbar";
import { MathRenderer } from "./MathRenderer";

const initialState: EditorState = createEditorState(
  createInlineContainer()
);

export const MathEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(initialState);
  const editorRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const updated = handleKeyDown(e, editorState);
    if (updated) setEditorState(updated);
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
            setEditorState((prev) => setCursor(prev, newCursor))
          }
          onRootChange={(newRoot) =>
            setEditorState((prev) => ({ ...prev, rootNode: newRoot }))
          }
        />
      </div>
    </div>
  );
};

export default MathEditor;
