// components/notesMenu/NotesMenu.tsx
import React, { useMemo, useState, useRef, useCallback } from "react";
import styles from "./NotesMenu.module.css";
import type { Note, NoteSummary } from "../../models/noteTypes";
import SearchBar from "../common/SearchBar";
import Tooltip from "../tooltips/Tooltip";
import NoteListItem from "./NoteListItem";
import NotebookArchiveModal from "../modals/NotebookArchiveModal";

type SortBy = "created" | "modified" | "title" | "cellCount";

const sortFunctions: Record<SortBy, (a: NoteSummary, b: NoteSummary) => number> = {
  created: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
  modified: (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
  title: (a, b) => a.title.localeCompare(b.title),
  cellCount: (a, b) => b.cellCount - a.cellCount,
};

type NotesMenuProps = {
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  noteSummaries: NoteSummary[];
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onArchiveNote: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onExportLatex: (id: string) => void;
  onUnarchiveNote: (id: string) => void;
  archivedNotes: Note[];
};

const NotesMenu: React.FC<NotesMenuProps> = ({
  selectedNoteId,
  onSelectNote,
  noteSummaries,
  onCreateNote,
  onDeleteNote,
  onArchiveNote,
  onDuplicateNote,
  onExportLatex,
  onUnarchiveNote,
  archivedNotes,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("modified");
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const dotRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const filteredNotes = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return noteSummaries
      .filter(
        (note) => !note.archived && note.title.toLowerCase().includes(lower)
      )
      .sort(sortFunctions[sortBy]);
  }, [noteSummaries, searchTerm, sortBy]);

  // Memoize callbacks per note ID to preserve stable references

  const selectNoteCallbacks = useRef<Record<string, () => void>>({});
  const deleteNoteCallbacks = useRef<Record<string, () => void>>({});
  const archiveNoteCallbacks = useRef<Record<string, () => void>>({});
  const duplicateNoteCallbacks = useRef<Record<string, () => void>>({});
  const exportLatexCallbacks = useRef<Record<string, () => void>>({});
  const menuOpenCallbacks = useRef<Record<string, (open: boolean) => void>>({});
  const dotRefCallbacks = useRef<Record<string, (el: HTMLButtonElement | null) => void>>({});

  const getOnSelectNote = useCallback((id: string) => {
    if (!selectNoteCallbacks.current[id]) {
      selectNoteCallbacks.current[id] = () => onSelectNote(id);
    }
    return selectNoteCallbacks.current[id];
  }, [onSelectNote]);

  const getOnDeleteNote = useCallback((id: string) => {
    if (!deleteNoteCallbacks.current[id]) {
      deleteNoteCallbacks.current[id] = () => onDeleteNote(id);
    }
    return deleteNoteCallbacks.current[id];
  }, [onDeleteNote]);

  const getOnArchiveNote = useCallback((id: string) => {
    if (!archiveNoteCallbacks.current[id]) {
      archiveNoteCallbacks.current[id] = () => onArchiveNote(id);
    }
    return archiveNoteCallbacks.current[id];
  }, [onArchiveNote]);

  const getOnDuplicateNote = useCallback((id: string) => {
    if (!duplicateNoteCallbacks.current[id]) {
      duplicateNoteCallbacks.current[id] = () => onDuplicateNote(id);
    }
    return duplicateNoteCallbacks.current[id];
  }, [onDuplicateNote]);

  const getOnExportLatex = useCallback((id: string) => {
    if (!exportLatexCallbacks.current[id]) {
      exportLatexCallbacks.current[id] = () => onExportLatex(id);
    }
    return exportLatexCallbacks.current[id];
  }, [onExportLatex]);

  const getSetMenuOpenForId = useCallback((id: string) => {
    if (!menuOpenCallbacks.current[id]) {
      menuOpenCallbacks.current[id] = (open: boolean) => setMenuOpenForId(open ? id : null);
    }
    return menuOpenCallbacks.current[id];
  }, []);

  const getDotRefCallback = useCallback((id: string) => {
    if (!dotRefCallbacks.current[id]) {
      dotRefCallbacks.current[id] = (el: HTMLButtonElement | null) => {
        dotRefs.current[id] = el;
      };
    }
    return dotRefCallbacks.current[id];
  }, []);

  return (
    <>

      <div className={styles.notesMenu}>
        <div className={styles.menuHeader}>
          <Tooltip text="Create new notebook">
            <button className={styles.newNoteButton} onClick={onCreateNote}>
              ➕ New Note
            </button>
          </Tooltip>
          <Tooltip text="View archived notebooks">
            <button
              className={styles.newNoteButton}
              onClick={() => setIsArchiveModalOpen(true)}
            >
              🗂️ Archived
            </button>
          </Tooltip>
          <SearchBar
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e)}
            tooltip="Search notes by title"
          />
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
            <NoteListItem
              key={note.id}
              note={note}
              selected={selectedNoteId === note.id}
              onClick={getOnSelectNote(note.id)}
              dotRef={getDotRefCallback(note.id)}
              menuOpen={menuOpenForId === note.id}
              setMenuOpen={getSetMenuOpenForId(note.id)}
              onDeleteNote={getOnDeleteNote(note.id)}
              onArchiveNote={getOnArchiveNote(note.id)}
              onDuplicateNote={getOnDuplicateNote(note.id)}
              onExportLatex={getOnExportLatex(note.id)}
            />
          ))}
        </ul>
      </div>

      {isArchiveModalOpen && (
        <NotebookArchiveModal
          notes={archivedNotes}
          onClose={() => setIsArchiveModalOpen(false)}
          onUnarchive={onUnarchiveNote}
          onDelete={onDeleteNote}
        />
      )}
    </>
  );
};

export default React.memo(NotesMenu);
