export interface NoteMetadata {
  title: string;        // The displayed title of the note
  author?: string;      // Optional author name
  courseCode?: string;
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

export type CellData = {
  id: string;
  type: "math" | "text";
  content: string;
};
