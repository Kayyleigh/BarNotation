// EditorModeProvider.tsx
import React, { useState, useCallback, type ReactNode } from "react";
import { EditorModeContext, type EditingMode } from "./EditorModeContext";

interface Props { children: ReactNode; }

export const EditorModeProvider: React.FC<Props> = ({ children }) => {
  const [editingMode, setEditingMode] = useState<EditingMode>(() => {
    return localStorage.getItem("previewMode") === "on" ? "preview" : "edit";
  });
  const [locked, setLocked] = useState(() => localStorage.getItem("lockedMode") === "on");

  const toggleEditingMode = useCallback(() => {
    setEditingMode(prev => {
      const next = prev === "edit" ? "preview" : "edit";
      localStorage.setItem("previewMode", next === "preview" ? "on" : "off");
      // Exiting preview automatically clears locked
      if (locked && next === "edit") setLocked(false);
      return next;
    });
  }, [locked]);

  const toggleLocked = useCallback(() => {
    setLocked(prev => {
      if (editingMode !== "preview") return prev; // only allow from preview
      localStorage.setItem("lockedMode", prev ? "off" : "on");
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
