// models/libraryTypes.ts
import type { MathNode } from "./types";

export interface LibraryEntry {
  id: string;
  node: MathNode;
  addedAt: number;        // timestamp
  draggedCount: number;   // how many times dragged into editor
  latex: string;          // latex string for filtering/sorting
}
  
export type LibraryCollection = {
  id: string;
  name: string;
  entries: LibraryEntry[];
};
