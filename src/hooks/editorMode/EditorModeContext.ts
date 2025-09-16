// components/editor/EditorModeContext.ts
import { createContext } from "react";

export type EditingMode = "edit" | "preview";

export interface EditorModeContextValue {
  editingMode: EditingMode;      // edit or preview
  locked: boolean;         // true if locked
  setEditingMode: (mode: EditingMode) => void;
  setLocked: (locked: boolean) => void;
  toggleEditingMode: () => void;    // toggles between edit and preview
  toggleLocked: () => void;      // locks/unlocks (only from preview)
}

export const EditorModeContext = createContext<EditorModeContextValue | undefined>(undefined);
