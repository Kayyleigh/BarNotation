// components/editor/useEditorMode.ts
import { useContext } from "react";
import { EditorModeContext } from "./EditorModeContext";

export function useEditorMode() {
  const context = useContext(EditorModeContext);
  if (!context) {
    throw new Error("useEditorMode must be used within EditorModeProvider");
  }
  return context;
}
