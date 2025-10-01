// hooks/EditorHistoryProvider.tsx
import React, { useState, useCallback, useMemo } from "react";
import { EditorHistoryContext } from "./EditorHistoryContext";
import {
  createInitialHistory,
  applyUpdate,
  undo,
  redo,
  type EditorSnapshot,
  type HistoryState,
} from "../../logic/global-history";

export const EditorHistoryProvider: React.FC<{
  children: React.ReactNode;
  initialSnapshot: EditorSnapshot;
}> = ({ children, initialSnapshot }) => {
  const [history, setHistory] = useState<HistoryState>(
    createInitialHistory(initialSnapshot)
  );

  const updateState = useCallback((newSnapshot: EditorSnapshot) => {
    setHistory(prev => {
      const prevSnapshot = prev.present;

      const didStructureChange =
        prevSnapshot.order.length !== newSnapshot.order.length ||
        prevSnapshot.order.some((id, i) => newSnapshot.order[i] !== id) ||
        prevSnapshot.order.some((id) => {
          const prevMath = prevSnapshot.states[id];
          const newMath = newSnapshot.states[id];
          const prevText = prevSnapshot.textContents[id];
          const newText = newSnapshot.textContents[id];

          if (prevMath && newMath) {
            // Math cell: ignore cursor
            return prevMath.rootNode !== newMath.rootNode;
          }

          if (prevText && newText) {
            // Text cell: compare content
            return prevText.text !== newText.text || prevText.type !== newText.type;
          }

          // If cell exists in one snapshot but not the other, it changed
          return true;
        });

      if (!didStructureChange) {
        // Only cursor changed, no need to push to past
        return {
          ...prev,
          present: newSnapshot,
        };
      }

      return applyUpdate(prev, newSnapshot);
    });
  }, []);


  const handleUndo = useCallback(() => {
    setHistory(prev => undo(prev));
  }, []);

  const handleRedo = useCallback(() => {
    setHistory(prev => redo(prev));
  }, []);

  const contextValue = useMemo(() => ({
    history,
    updateState,
    undo: handleUndo,
    redo: handleRedo,
  }), [history, updateState, handleUndo, handleRedo]);

  return (
    <EditorHistoryContext.Provider
      value={contextValue}
    >
      {children}
    </EditorHistoryContext.Provider>
  );
};
