// // components/NotesMenu.tsx
// import React, { useMemo, useState, useRef } from "react";
// import ResizableSidebar from "../layout/ResizableSidebar";
// import styles from "./NotesMenu.module.css";
// import type { Note } from "../../models/noteTypes";
// import SearchBar from "../common/SearchBar";
// import Tooltip from "../tooltips/Tooltip";
// import { useToast } from "../../hooks/useToast";
// import NoteListItem from "./NoteListItem";

// type SortBy = "created" | "modified" | "title" | "cellCount";

// type NotesMenuProps = {
//   width: number;
//   onWidthChange: (newWidth: number) => void;
//   selectedNoteId: string | null;
//   onSelectNote: (id: string) => void;
//   notes: Note[];
//   onCreateNote: () => void;
//   onDeleteNote: (id: string) => void;
//   onArchiveNote: (id: string) => void;
//   onDuplicateNote: (id: string) => void;
//   onExportLatex: (id: string) => void;
// };

// const sortFunctions: Record<SortBy, (a: Note, b: Note) => number> = {
//   created: (a, b) => (b.metadata.createdAt ?? 0) - (a.metadata.createdAt ?? 0),
//   modified: (a, b) => (b.metadata.updatedAt ?? 0) - (a.metadata.updatedAt ?? 0),
//   title: (a, b) => a.metadata.title.localeCompare(b.metadata.title),
//   cellCount: (a, b) => b.cells.length - a.cells.length,
// };

// const NotesMenu: React.FC<NotesMenuProps> = ({
//   width,
//   onWidthChange,
//   selectedNoteId,
//   onSelectNote,
//   notes,
//   onCreateNote,
//   onDeleteNote,
//   onArchiveNote,
//   onDuplicateNote,
//   onExportLatex,
// }) => {
//   const { showToast } = useToast();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortBy, setSortBy] = useState<SortBy>("modified");
//   const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);
//   const dotRefs = useRef<Record<string, HTMLButtonElement | null>>({});

//   const filteredNotes = useMemo(() => {
//     const lower = searchTerm.toLowerCase();
//     return notes
//       .filter(
//         (note) =>
//           !note.metadata.archived &&
//           note.metadata.title.toLowerCase().includes(lower)
//       )
//       .sort(sortFunctions[sortBy]);
//   }, [notes, searchTerm, sortBy]);
  
//   return (
//     <ResizableSidebar
//       side="left"
//       title="Notes"
//       width={width}
//       onWidthChange={onWidthChange}
//       storageKey="notesMenuWidth"
//     >
//       <div className={styles.notesMenu}>
//         <div className={styles.menuHeader}>
//           <Tooltip text="Create new notebook">
//             <button className={styles.newNoteButton} onClick={onCreateNote}>
//               ➕ New Note
//             </button>
//           </Tooltip>
//           <Tooltip text="View archived notebooks">
//             <button className={styles.newNoteButton} onClick={() => showToast({ message: `Archive modal does not exist yet`, type: "warning" })}>
//               🗂️ Archived
//             </button>
//           </Tooltip>
//           <SearchBar placeholder="Search notes..." value={searchTerm} onChange={(e) => setSearchTerm(e)} tooltip="Search notes by title" />
//         </div>
//         <div className={styles.notesSectionHeader}>
//           <div className={styles.notesSectionLabel}>Notes</div>
//           <select // TODO use the component
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value as SortBy)}
//             className={styles.sortDropdown}
//           >
//             <option value="modified">Last Modified</option>
//             <option value="created">Creation Date</option>
//             <option value="title">Title A → Z</option>
//             <option value="cellCount">Cell Count</option>
//           </select>
//         </div>
//         <ul className={styles.notesList}>
//           {filteredNotes.length === 0 && (
//             <li className={styles.noNotes}>No notes found.</li>
//           )}
//           {filteredNotes.map((note) => (
//             <NoteListItem
//               key={note.id}
//               note={note}
//               selected={selectedNoteId === note.id}
//               onClick={() => onSelectNote(note.id)}
//               dotRef={(el) => (dotRefs.current[note.id] = el)}
//               menuOpen={menuOpenForId === note.id}
//               setMenuOpen={(open) =>
//                 setMenuOpenForId(open ? note.id : null)
//               }
//               onDeleteNote={() => onDeleteNote(note.id)}
//               onArchiveNote={() => onArchiveNote(note.id)}
//               onDuplicateNote={() => onDuplicateNote(note.id)}
//               onExportLatex={() => onExportLatex(note.id)}
//             />
//           ))}
//         </ul>
//       </div>
//     </ResizableSidebar>
//   );
// };

// export default React.memo(NotesMenu);
// components/NotesMenu.tsx
import React, { useMemo, useState, useRef } from "react";
import ResizableSidebar from "../layout/ResizableSidebar";
import styles from "./NotesMenu.module.css";
import type { Note } from "../../models/noteTypes";
import SearchBar from "../common/SearchBar";
import Tooltip from "../tooltips/Tooltip";
import NoteListItem from "./NoteListItem";
import NotebookArchiveModal from "../modals/NotebookArchiveModal";

type SortBy = "created" | "modified" | "title" | "cellCount";

const sortFunctions: Record<SortBy, (a: Note, b: Note) => number> = {
  created: (a, b) => (b.metadata.createdAt ?? 0) - (a.metadata.createdAt ?? 0),
  modified: (a, b) => (b.metadata.updatedAt ?? 0) - (a.metadata.updatedAt ?? 0),
  title: (a, b) => a.metadata.title.localeCompare(b.metadata.title),
  cellCount: (a, b) => b.cells.length - a.cells.length,
};

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
  onUnarchiveNote: (id: string) => void; // add unarchive handler
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
  onUnarchiveNote,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("modified");
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const dotRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Filter and sort active (non-archived) notes
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

  // Archived notes for the modal
  const archivedNotes = useMemo(() => notes.filter((n) => n.metadata.archived), [notes]);

  return (
    <>
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
            <select //TODO use the SortDropdown component
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
                onClick={() => onSelectNote(note.id)}
                dotRef={(el) => (dotRefs.current[note.id] = el)}
                menuOpen={menuOpenForId === note.id}
                setMenuOpen={(open) => setMenuOpenForId(open ? note.id : null)}
                onDeleteNote={() => onDeleteNote(note.id)}
                onArchiveNote={() => onArchiveNote(note.id)}
                onDuplicateNote={() => onDuplicateNote(note.id)}
                onExportLatex={() => onExportLatex(note.id)}
              />
            ))}
          </ul>
        </div>
      </ResizableSidebar>

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
