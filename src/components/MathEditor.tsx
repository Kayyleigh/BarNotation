// import React, { useRef, useState, useEffect } from "react";
// import { createInlineContainer } from "../models/nodeFactories"
// import { createEditorState, setCursor, type EditorState } from "../logic/editor-state";
// import { handleKeyDown } from "../logic/handle-keydown";
// import Toolbar from "./Toolbar";
// import { MathRenderer } from "./MathRenderer";
// import { useEditorHistory } from "../hooks/useEditorHistory";
// import {
//   insertNodeAtCursor,
//   deleteSelectedNode,
//   getSelectedNode,
// } from "../logic/node-manipulation";
// import { nodeToLatex } from "../models/latexParser";
// import { parseLatex } from "../models/mathNodeParser";

// const initialState: EditorState = createEditorState(
//   createInlineContainer()
// );

// export const MathEditor: React.FC = () => {
//   const editorRef = useRef<HTMLDivElement>(null);

//   // ========== Dark Mode State ==========
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     return localStorage.getItem("mathEditorTheme") === "dark";
//   });

//   useEffect(() => {
//     localStorage.setItem("mathEditorTheme", isDarkMode ? "dark" : "light");
//   }, [isDarkMode]);

//   const toggleDarkMode = () => setIsDarkMode(prev => !prev);

//   // ========== Editor State & Logic ==========
//   const {
//     state: editorState,
//     update: updateEditorState,
//     undo,
//     redo,
//   } = useEditorHistory(initialState);

//   const onKeyDown = (e: React.KeyboardEvent) => {
//     const isMac = navigator.platform.includes("Mac");
//     const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

//     if (ctrlKey && e.key === "z") {
//       e.preventDefault();
//       if (e.shiftKey) redo();
//       else undo();
//       return;
//     }

//     if (ctrlKey && e.key === "y") {
//       e.preventDefault();
//       redo();
//       return;
//     }

//     const updated = handleKeyDown(e, editorState);
//     if (updated) updateEditorState(updated);
//   };

//   const onCopy = (e: React.ClipboardEvent) => {
//     const selectedNode = getSelectedNode(editorState);
//     if (selectedNode) {
//       e.clipboardData.setData("text/plain", nodeToLatex(selectedNode));
//       e.preventDefault();
//     }
//   };

//   const onCut = (e: React.ClipboardEvent) => {
//     const selectedNode = getSelectedNode(editorState);
//     if (selectedNode) {
//       e.clipboardData.setData("text/plain", nodeToLatex(selectedNode));
//       const updated = deleteSelectedNode(editorState);
//       updateEditorState(updated);
//       e.preventDefault();
//     }
//   };

//   const onPaste = (e: React.ClipboardEvent) => {
//     const pastedText = e.clipboardData.getData("text/plain");
//     if (!pastedText) return;

//     try {
//       const pastedNode = parseLatex(pastedText);
//       const updated = insertNodeAtCursor(editorState, pastedNode);
//       updateEditorState(updated);
//       e.preventDefault();
//     } catch (err) {
//       console.warn("Paste failed:", err);
//     }
//   };

//   return (
//     <div className={`editor-container ${isDarkMode ? "dark" : ""}`}>
//       <Toolbar onAddNode={() => {}} />
      
//       <button onClick={toggleDarkMode} className="theme-toggle-button">
//         {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
//       </button>
      
//       <div
//         ref={editorRef}
//         className="math-editor"
//         tabIndex={0}
//         onKeyDown={onKeyDown}
//         onCopy={onCopy}
//         onCut={onCut}
//         onPaste={onPaste}
//       >
//         <MathRenderer
//           node={editorState.rootNode}
//           cursor={editorState.cursor}
//           onCursorChange={(newCursor) =>
//             updateEditorState(setCursor(editorState, newCursor))
//           }
//           onRootChange={(newRoot) =>
//             updateEditorState({ ...editorState, rootNode: newRoot })
//           }
//         />
//       </div>
//     </div>
//   );
// };

// export default MathEditor;
import React, { useRef } from "react";
import { createInlineContainer, createRootWrapper } from "../models/nodeFactories";
import { createEditorState, setCursor } from "../logic/editor-state";
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

const initialState = createEditorState(createRootWrapper());

const MathEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  const {
    state: editorState,
    update: updateEditorState,
    undo,
    redo,
  } = useEditorHistory(initialState);

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
        onCursorChange={(newCursor) =>
          updateEditorState(setCursor(editorState, newCursor))
        }
        onRootChange={(newRoot) =>
          updateEditorState({ ...editorState, rootNode: newRoot })
        }
      />
    </div>
  );
};

export default MathEditor;
