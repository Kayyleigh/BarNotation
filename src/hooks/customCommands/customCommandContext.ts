import { createContext } from "react";
import type { LibraryEntry, MathNodeLibrary } from "../../models/libraryTypes";

export interface CustomCommandContextType {
  commandMap: Record<string, LibraryEntry>;
  refresh: (library: MathNodeLibrary) => void;
}

export const CustomCommandContext = createContext<CustomCommandContextType | null>(null);
