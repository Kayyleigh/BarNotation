import type { EditorState } from "../logic/editor-state";
import type { TextCellType } from "./textTypes";

export interface NoteMetadata {
  title: string;        // The displayed title of the note
  author?: string;      // Optional author name
  dateOrPeriod?: string;
  createdAt?: number;   // Timestamp (ms since epoch) when the note was created
  updatedAt?: number;   // Timestamp when the note was last updated
  archived: boolean;
  archivedAt?: number;  // Timestamp when the note was archived
  // can add more fields as needed, for example:
  // tags?: string[];
  // description?: string;
}

export interface Note {
  id: string;
  metadata: NoteMetadata;
  cells: CellData[];
}

export type TextCellContent = {
  text: string;
  type: TextCellType;
};

type TextCellData = {
  id: string;
  type: "text";
  content: TextCellContent;
};

type MathCellData = {
  id: string;
  type: "math";
  content: EditorState;
};

export type CellData =
  | TextCellData
  | MathCellData;

// For notes menu:
export type NoteSummary = {
  id: string;
  title: string;
  cellCount: number;
  archived: boolean;
  createdAt?: number;
  updatedAt?: number;
};
