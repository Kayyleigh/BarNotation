// components/editor/EditorModeContext.ts
import { createContext } from "react";

export type EditorMode = "preview" | "edit" | "locked";

export interface EditorModeContextValue {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  togglePreview: () => void;
  toggleLocked: () => void;
}

export const EditorModeContext = createContext<EditorModeContextValue | undefined>(undefined);
