export type NoteMetadata = {
  title: string;
  courseCode?: string;
  author?: string;
  dateOrPeriod?: string;
};

export type Note = {
  id: string;
  metadata: NoteMetadata;
  cells: CellData[];
};

export type CellData = {
  id: string;
  type: "math" | "text";
  content: string;
};
