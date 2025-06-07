import React from "react";

interface NotesMenuProps {
  width: number;
  onWidthChange: (width: number) => void;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
}

const NotesMenu: React.FC<NotesMenuProps> = ({
  width,
  onWidthChange,
  selectedNoteId,
  onSelectNote
}) => {
  return (
    <div
      style={{
        width,
        minWidth: 200,
        maxWidth: 500,
        borderRight: "1px solid #ccc",
        padding: "1rem",
        background: "#f9f9f9"
      }}
    >
      <h3>Notes Menu (WIP)</h3>
      <button onClick={() => onSelectNote("sample-note-id")}>
        Select Sample Note
      </button>
    </div>
  );
};

export default NotesMenu;
