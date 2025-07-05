import React, { useRef, useEffect } from "react";
import NoteActionsDropdown from "./NoteActionsDropdown";
import styles from "./NotesMenu.module.css";
import type { Note } from "../../models/noteTypes";
import { formatCreatedAt } from "../../utils/dateUtils";

type Props = {
  note: Note;
  selected: boolean;
  onClick: () => void;
  dotRef: (el: HTMLButtonElement | null) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onDeleteNote: () => void;
  onArchiveNote: () => void;
  onDuplicateNote: () => void;
  onExportLatex: () => void;
};

const NoteListItem: React.FC<Props> = ({
  note,
  selected,
  onClick,
  dotRef,
  menuOpen,
  setMenuOpen,
  onDeleteNote,
  onArchiveNote,
  onDuplicateNote,
  onExportLatex,
}) => {
  const localRef = useRef<HTMLButtonElement>(null!);

  // When local ref changes, update the parent
  useEffect(() => {
    dotRef(localRef.current);
  }, [dotRef]);

  return (
    <li
      className={`${styles.noteItem} ${selected ? styles.selected : ""}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      tabIndex={0}
      role="button"
    >
      <div className={styles.noteTextBlock}>
        <div className={styles.noteTitle}>{note.metadata.title}</div>
        <div className={styles.noteMeta}>
          <span>{note.cells.length} cell{note.cells.length === 1 ? "" : "s"}</span>
          <span className={styles.noteDate}>
          {note.metadata.createdAt && (
            <span className={styles.noteDate}>
              {formatCreatedAt(note.metadata.createdAt)}
            </span>
          )}
          </span>
        </div>
      </div>
      <button
        ref={localRef}
        className={styles.moreButton}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        aria-label="Note options"
      >
        ⋯
      </button>
      {menuOpen && localRef.current && (
        <NoteActionsDropdown
          anchorRef={localRef}
          onClose={() => setMenuOpen(false)}
          onDelete={onDeleteNote}
          onArchive={onArchiveNote}
          onDuplicate={onDuplicateNote}
          onExportLatex={onExportLatex}
        />
      )}
    </li>
  );
};

export default React.memo(NoteListItem);
