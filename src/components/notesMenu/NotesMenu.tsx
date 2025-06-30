import React, { useState, useMemo } from "react";
import ResizableSidebar from "../layout/ResizableSidebar";
import styles from "./NotesMenu.module.css";
import type { Note } from "../../models/noteTypes";

interface NotesMenuProps {
  width: number;
  onWidthChange: (width: number) => void;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  notes: Note[];
  onCreateNote: () => void;
}

const NotesMenu: React.FC<NotesMenuProps> = ({
  width,
  onWidthChange,
  selectedNoteId,
  onSelectNote,
  notes,
  onCreateNote,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter notes by search term (case-insensitive)
  const filteredNotes = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return notes.filter(
      (note) => !note.metadata.archived && note.metadata.title.toLowerCase().includes(lower)
    );
  }, [notes, searchTerm]);

  return (
    <ResizableSidebar
      side="left"
      title="Notes"
      width={width}
      onWidthChange={onWidthChange}
      storageKey="notesMenuWidth"
    >
      <div className={styles.notesMenu}>
        <button
          className={styles.newNoteButton}
          onClick={onCreateNote}
          aria-label="Create new note"
        >
          + New Note
        </button>
        <input
          type="search"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          aria-label="Search notes"
        />
        <ul className={styles.notesList}>
          {filteredNotes.length === 0 && (
            <li className={styles.noteItem}>No notes found</li>
          )}
          {filteredNotes.map((note) => (
            <li
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`${styles.noteItem} ${
                selectedNoteId === note.id ? styles.selected : ""
              }`}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectNote(note.id);
                }
              }}
            >
              {note.metadata.title}
            </li>
          ))}
        </ul>
      </div>
    </ResizableSidebar>
  );
};

export default NotesMenu;
