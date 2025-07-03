// components/NotesMenu.tsx
import React, { useMemo, useState, useRef } from "react";
import ResizableSidebar from "../layout/ResizableSidebar";
import styles from "./NotesMenu.module.css";
import type { Note } from "../../models/noteTypes";
import NoteActionsDropdown from "./NoteActionsDropdown";
import SearchBar from "../common/SearchBar";
import Tooltip from "../tooltips/Tooltip";
import { useToast } from "../../hooks/useToast";

type SortBy = "created" | "modified" | "title" | "cellCount";

type NotesMenuProps = {
  width: number;
  onWidthChange: (newWidth: number) => void;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  notes: Note[];
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onArchiveNote: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onExportLatex: (id: string) => void;
};

const sortFunctions: Record<SortBy, (a: Note, b: Note) => number> = {
  created: (a, b) => (b.metadata.createdAt ?? 0) - (a.metadata.createdAt ?? 0),
  modified: (a, b) => (b.metadata.updatedAt ?? 0) - (a.metadata.updatedAt ?? 0),
  title: (a, b) => a.metadata.title.localeCompare(b.metadata.title),
  cellCount: (a, b) => b.cells.length - a.cells.length,
};

const NotesMenu: React.FC<NotesMenuProps> = ({
  width,
  onWidthChange,
  selectedNoteId,
  onSelectNote,
  notes,
  onCreateNote,
  onDeleteNote,
  onArchiveNote,
  onDuplicateNote,
  onExportLatex,
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("modified");
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);
  const dotRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const filteredNotes = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return notes
      .filter(
        (note) =>
          !note.metadata.archived &&
          note.metadata.title.toLowerCase().includes(lower)
      )
      .sort(sortFunctions[sortBy]);
  }, [notes, searchTerm, sortBy]);

  const formatCreatedAt = (timestamp: number) => {
    // TODO: extend to have "Today" "Yesterday" etc
    const now = Date.now();
    const diffInMs = now - timestamp;
    const diffInMinutes = diffInMs / (1000 * 60);
  
    if (diffInMinutes < 2) return "Created just now";
  
    return (
      "Created " +
      new Date(timestamp).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  };
  
  return (
    <ResizableSidebar
      side="left"
      title="Notes"
      width={width}
      onWidthChange={onWidthChange}
      storageKey="notesMenuWidth"
    >
      <div className={styles.notesMenu}>
        <div className={styles.menuHeader}>
          <Tooltip text="Create new notebook">
            <button className={styles.newNoteButton} onClick={onCreateNote}>
              ➕ New Note
            </button>
          </Tooltip>
          <Tooltip text="View archived notebooks">
            <button className={styles.newNoteButton} onClick={() => showToast({ message: `Archive modal does not exist yet`, type: "warning" })}>
              🗂️ Archived
            </button>
          </Tooltip>
          <SearchBar placeholder="Search notes..." value={searchTerm} onChange={(e) => setSearchTerm(e)} tooltip="Search notes by title" />
        </div>
        <div className={styles.notesSectionHeader}>
          <div className={styles.notesSectionLabel}>Notes</div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className={styles.sortDropdown}
          >
            <option value="modified">Last Modified</option>
            <option value="created">Creation Date</option>
            <option value="title">Title A → Z</option>
            <option value="cellCount">Cell Count</option>
          </select>
        </div>
        <ul className={styles.notesList}>
          {filteredNotes.length === 0 && (
            <li className={styles.noNotes}>No notes found.</li>
          )}
          {filteredNotes.map((note) => (
            <li
              key={note.id}
              className={`${styles.noteItem} ${selectedNoteId === note.id ? styles.selected : ""}`}
              onClick={() => onSelectNote(note.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectNote(note.id);
              }}
              tabIndex={0}
              role="button"
            >
              <div className={styles.noteTextBlock}>
                <div className={styles.noteTitle}>{note.metadata.title}</div>
                <div className={styles.noteMeta}>
                  <span>{note.cells.length} cells</span>
                  <span className={styles.noteDate}>
                    {note.metadata.updatedAt
                      ? new Date(note.metadata.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </span>
                  <span className={styles.noteDate}>
                    {note.metadata.createdAt ? formatCreatedAt(note.metadata.createdAt) : ""}
                  </span>
                </div>
              </div>
              <button
                ref={(el) => {
                  dotRefs.current[note.id] = el;
                }}
                className={styles.moreButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenForId(note.id === menuOpenForId ? null : note.id);
                }}
                aria-label="Note options"
              >
                ⋯
              </button>
              {menuOpenForId === note.id && dotRefs.current[note.id] && (
                <NoteActionsDropdown
                  anchorRef={{ current: dotRefs.current[note.id]! }}
                  onClose={() => setMenuOpenForId(null)}
                  onDelete={() => onDeleteNote(note.id)}
                  onArchive={() => onArchiveNote(note.id)}
                  onDuplicate={() => onDuplicateNote(note.id)}
                  onExportLatex={() => onExportLatex(note.id)}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </ResizableSidebar>
  );
};

export default React.memo(NotesMenu);
