// components/editor/EditorModeProvider.tsx
import React, { useState, useCallback, type ReactNode } from "react";
import { EditorModeContext, type EditorMode } from "./EditorModeContext";

interface Props {
  children: ReactNode;
}

export const EditorModeProvider: React.FC<Props> = ({ children }) => {
  const [mode, setMode] = useState<EditorMode>(() => {
    const preview = localStorage.getItem("previewMode");
    return preview === "on" ? "preview" : "edit";
  });

  const togglePreview = useCallback(() => {
    setMode((prev) => {
      const next = prev === "preview" ? "edit" : "preview";
      localStorage.setItem("previewMode", next === "preview" ? "on" : "off");
      return next;
    });
  }, []);

  const toggleLocked = useCallback(() => {
    setMode((prev) => (prev === "locked" ? "edit" : "locked"));
  }, []);

  return (
    <EditorModeContext.Provider value={{ mode, setMode, togglePreview, toggleLocked }}>
      {children}
    </EditorModeContext.Provider>
  );
};
