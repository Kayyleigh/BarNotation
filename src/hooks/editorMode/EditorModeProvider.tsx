import React, { useState, useCallback, type ReactNode } from "react";
import { EditorModeContext, type EditorMode } from "./EditorModeContext";

interface Props {
  children: ReactNode;
}

export const EditorModeProvider: React.FC<Props> = ({ children }) => {
  const [mode, setMode] = useState<EditorMode>(() => {
    const preview = localStorage.getItem("previewMode");
    const locked = localStorage.getItem("lockedMode");

    if (preview === "on") {
      return locked === "on" ? "locked" : "preview";
    }
    return "edit";
  });

  const togglePreview = useCallback(() => {
    setMode((prev) => {
      if (prev === "edit") {
        localStorage.setItem("previewMode", "on");
        return "preview";
      }

      if (prev === "preview") {
        localStorage.setItem("previewMode", "off");
        return "edit";
      }

      // From locked → edit (disabling both preview + locked)
      localStorage.setItem("previewMode", "off");
      localStorage.setItem("lockedMode", "off");
      return "edit";
    });
  }, []);

  const toggleLocked = useCallback(() => {
    setMode((prev) => {
      if (prev === "preview") {
        localStorage.setItem("lockedMode", "on");
        return "locked";
      }

      if (prev === "locked") {
        localStorage.setItem("lockedMode", "off");
        return "preview";
      }

      return prev; // do nothing if trying to lock from edit mode
    });
  }, []);

  return (
    <EditorModeContext.Provider value={{ mode, setMode, togglePreview, toggleLocked }}>
      {children}
    </EditorModeContext.Provider>
  );
};
