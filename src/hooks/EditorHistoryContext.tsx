// hooks/EditorHistoryContext.tsx
import { createContext, useContext } from "react";
import type { EditorSnapshot, HistoryState } from "../logic/global-history";

interface EditorHistoryContextValue {
  history: HistoryState;
  updateState: (newSnapshot: EditorSnapshot) => void;
  undo: () => void;
  redo: () => void;
}

export const EditorHistoryContext = createContext<EditorHistoryContextValue | undefined>(undefined);

export const useEditorHistory = (): EditorHistoryContextValue => {
  const ctx = useContext(EditorHistoryContext);
  if (!ctx) {
    throw new Error("useEditorHistory must be used within an EditorHistoryProvider");
  }
  return ctx;
};
