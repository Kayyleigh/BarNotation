import React from "react";
import ResizableSidebar from "../layout/ResizableSidebar";

interface NotesMenuProps {
  width: number;
  onWidthChange: (width: number) => void;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
}

const NotesMenu: React.FC<NotesMenuProps> = ({
  width,
  onWidthChange,
  selectedNoteId,
  onSelectNote,
}) => {
  return (
    <ResizableSidebar
      side="left"
      title="notes menu"
      width={width}
      onWidthChange={onWidthChange}
      storageKey="notesMenuWidth"
    >
      <h3>Notes</h3>
        <p>
        Later, this will hold all your notes. 
        You will be able to open the notes by clicking them, or delete them by a button that appears on hover. 
        Also, there will be extra options available on hover such as export to LaTeX, and See Info.
        
        The bar will have a "New Note" button at the top, and hopefully a search bar as well, and ways to sort (by date created, last modified, title, size, ...)
        </p>
      <ul>
        <li
          onClick={() => onSelectNote("note-1")}
          style={{ fontWeight: selectedNoteId === "note-1" ? "bold" : "normal" }}
        >
          Note 1
        </li>
        <li
          onClick={() => onSelectNote("note-2")}
          style={{ fontWeight: selectedNoteId === "note-2" ? "bold" : "normal" }}
        >
          Note 2
        </li>
      </ul>
    </ResizableSidebar>
  );
};

export default NotesMenu;
