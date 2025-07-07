import React, { useRef, useEffect } from "react";
import NoteActionsDropdown from "./NoteActionsDropdown";
import styles from "./NotesMenu.module.css";
import type { NoteSummary } from "../../models/noteTypes";
import { formatCreatedAt } from "../../utils/dateUtils";

type Props = {
  note: NoteSummary;
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
        <div className={styles.noteTitle}>{note.title}</div>
        <div className={styles.noteMeta}>
          <span>
            {note.cellCount} cell{note.cellCount === 1 ? "" : "s"}
          </span>
          <span className={styles.noteDate}>
            {note.createdAt && (
              <span className={styles.noteDate}>{formatCreatedAt(note.createdAt)}</span>
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

// Custom comparison function for memoization
function areEqual(prevProps: Props, nextProps: Props) {
  // Compare relevant note fields (assuming these are stable and only update on real changes)
  if (
    prevProps.note.title !== nextProps.note.title ||
    prevProps.note.cellCount !== nextProps.note.cellCount ||
    prevProps.note.createdAt !== nextProps.note.createdAt
  ) {
    return false;
  }

  // Compare simple booleans and function identities
  if (prevProps.selected !== nextProps.selected) return false;
  if (prevProps.menuOpen !== nextProps.menuOpen) return false;

  // onClick, setMenuOpen and other handlers ideally stable via useCallback in parent,
  // but compare to be safe:
  if (prevProps.onClick !== nextProps.onClick) return false;
  if (prevProps.setMenuOpen !== nextProps.setMenuOpen) return false;
  if (prevProps.onDeleteNote !== nextProps.onDeleteNote) return false;
  if (prevProps.onArchiveNote !== nextProps.onArchiveNote) return false;
  if (prevProps.onDuplicateNote !== nextProps.onDuplicateNote) return false;
  if (prevProps.onExportLatex !== nextProps.onExportLatex) return false;

  // dotRef usually stable, but compare anyway:
  if (prevProps.dotRef !== nextProps.dotRef) return false;

  return true; // props equal, skip re-render
}

export default React.memo(NoteListItem, areEqual);
