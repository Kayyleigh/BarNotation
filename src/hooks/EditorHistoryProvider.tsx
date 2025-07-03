// // hooks/EditorHistoryProvider.tsx
// import React, { useState, useCallback } from "react";
// import { EditorHistoryContext } from "./EditorHistoryContext";
// import { createInitialHistory, applyUpdate, undo, redo } from "../logic/global-history";
// import type { EditorState } from "../logic/editor-state";
// import type { HistoryState } from "../logic/global-history";

// type EditorStatesMap = Record<string, EditorState>;

// export const EditorHistoryProvider: React.FC<{ children: React.ReactNode; initialStates: EditorStatesMap }> = ({
//   children,
//   initialStates,
// }) => {
//   const [history, setHistory] = useState<HistoryState<EditorStatesMap>>(
//     createInitialHistory(initialStates)
//   );

//   const updateState = useCallback((newStates: EditorStatesMap) => {
//     setHistory(prev => applyUpdate(prev, newStates));
//   }, []);

//   const handleUndo = useCallback(() => {
//     setHistory(prev => undo(prev));
//   }, []);

//   const handleRedo = useCallback(() => {
//     setHistory(prev => redo(prev));
//   }, []);

//   return (
//     <EditorHistoryContext.Provider
//       value={{ history, updateState, undo: handleUndo, redo: handleRedo }}
//     >
//       {children}
//     </EditorHistoryContext.Provider>
//   );
// };

// hooks/EditorHistoryProvider.tsx
import React, { useState, useCallback } from "react";
import { EditorHistoryContext } from "./EditorHistoryContext";
import {
  createInitialHistory,
  applyUpdate,
  undo,
  redo,
  type EditorSnapshot,
  type HistoryState,
} from "../logic/global-history";

export const EditorHistoryProvider: React.FC<{
  children: React.ReactNode;
  initialSnapshot: EditorSnapshot;
}> = ({ children, initialSnapshot }) => {
  const [history, setHistory] = useState<HistoryState>(
    createInitialHistory(initialSnapshot)
  );

//   const updateState = useCallback((newSnapshot: EditorSnapshot) => {
//     setHistory(prev => applyUpdate(prev, newSnapshot));
//   }, []);

const updateState = useCallback((newSnapshot: EditorSnapshot) => {
    setHistory(prev => {
      const prevSnapshot = prev.present;
  
      // Check if structure (order or rootNodes) changed, ignoring cursor
      const didStructureChange =
        prevSnapshot.order.length !== newSnapshot.order.length ||
        prevSnapshot.order.some((id, i) => newSnapshot.order[i] !== id) ||
        prevSnapshot.order.some((id) => {
          const prevEditor = prevSnapshot.states[id];
          const newEditor = newSnapshot.states[id];
          if (!prevEditor || !newEditor) return true;
  
          // Only compare rootNode, ignore cursor
          // console.warn(`${JSON.stringify(prevEditor.rootNode)}`)
          // console.warn(`${JSON.stringify(newEditor.rootNode)}`)

          // console.warn(`SAME?? ${prevEditor.rootNode === newEditor.rootNode}`)
          // return JSON.stringify(prevEditor.rootNode) !== JSON.stringify(newEditor.rootNode);
          return prevEditor.rootNode !== newEditor.rootNode;

        });
  
      if (!didStructureChange) {
        // Structure did NOT change, just update present WITHOUT pushing to past
        return {
          ...prev,
          present: newSnapshot,
        };
      }
  
      // Structure changed — push current present to past and update present
      return applyUpdate(prev, newSnapshot);
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistory(prev => undo(prev));
  }, []);

  const handleRedo = useCallback(() => {
    setHistory(prev => redo(prev));
  }, []);

  return (
    <EditorHistoryContext.Provider
      value={{ history, updateState, undo: handleUndo, redo: handleRedo }}
    >
      {children}
    </EditorHistoryContext.Provider>
  );
};
