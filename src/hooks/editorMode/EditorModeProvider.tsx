// EditorModeProvider.tsx
import React, { useState, useCallback, type ReactNode } from "react";
import { EditorModeContext, type EditingMode } from "./EditorModeContext";

interface Props { children: ReactNode; }

export const EditorModeProvider: React.FC<Props> = ({ children }) => {
  const [editingMode, setEditingMode] = useState<EditingMode>(() => {
    return localStorage.getItem("previewMode") === "on" ? "preview" : "edit";
  });

  // always start as false, no persistence
  const [locked, setLocked] = useState(false);

  const toggleEditingMode = useCallback(() => {
    setEditingMode(prev => {
      const next = prev === "edit" ? "preview" : "edit";
      localStorage.setItem("previewMode", next === "preview" ? "on" : "off");
      // exiting preview automatically clears locked (but doesn’t persist)
      if (locked && next === "edit") setLocked(false)
      return next;
    });
  }, [locked]);

  const toggleLocked = useCallback(() => {
    setLocked(prev => {
      if (editingMode !== "preview") return prev; // only allow from preview
      return !prev;
    });
  }, [editingMode]);

  return (
    <EditorModeContext.Provider value={{
      editingMode,
      locked,
      setEditingMode,
      setLocked,
      toggleEditingMode,
      toggleLocked,
    }}>
      {children}
    </EditorModeContext.Provider>
  );
};
