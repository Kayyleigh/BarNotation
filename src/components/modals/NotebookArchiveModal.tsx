// NotebookArchiveModal.tsx
import React, { useState, useMemo, useCallback } from "react";
import Modal from "./Modal";
import ArchiveModal from "./ArchiveModal";
import type { Note } from "../../models/noteTypes";
import archiveStyles from "./ArchiveModal.module.css";
import noteArchiveStyles from "./NotebookArchiveModal.module.css";
import Tooltip from "../tooltips/Tooltip";
import { formatArchivedAt, formatCreatedAt } from "../../utils/dateUtils";

type SortKey = "archived" | "created" | "cellcount" | "title";
type SortDir = "asc" | "desc";
type SortValue = `${SortKey}_${SortDir}`;

interface Props {
  notes: Note[];
  onClose: () => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const sortOptions = [
  { label: "Recently Archived", value: "archived_desc" },
  { label: "Longest Archived", value: "archived_asc" },
  { label: "Newest Created", value: "created_desc" },
  { label: "Oldest Created", value: "created_asc" },
  { label: "Most Cells", value: "cellcount_desc" },
  { label: "Least Cells", value: "cellcount_asc" },
  { label: "Title A → Z", value: "title_desc" },
  { label: "Title Z → A", value: "title_asc" },
];

const NotebookArchiveModal: React.FC<Props> = ({ notes, onClose, onUnarchive, onDelete }) => {
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState<SortValue>("archived_desc");

  const filtered = useMemo(() => {
    const [key, dir] = sortValue.split("_") as [SortKey, SortDir];
    const sortFn = (a: Note, b: Note) => {
      switch (key) {
        case "archived":
          return (b.metadata.archivedAt ?? 0) - (a.metadata.archivedAt ?? 0);
        case "created":
          return (b.metadata.createdAt ?? 0) - (a.metadata.createdAt ?? 0);
        case "cellcount":
          return (b.cells.length ?? 0) - (a.cells.length ?? 0);
        case "title":
          return a.metadata.title.localeCompare(b.metadata.title);
      }
    };
    const sorted = [...notes]
      .filter(n =>
        n.metadata.title.toLowerCase().includes(search) ||
        n.metadata.author?.toLowerCase().includes(search) ||
        n.metadata.courseCode?.toLowerCase().includes(search)
      )
      .sort((a, b) => dir === "asc" ? -sortFn(a, b) : sortFn(a, b));
    return sorted;
  }, [notes, search, sortValue]);

  const handleSortChange = useCallback((val: string) => {
    setSortValue(val as SortValue);
  }, []);

  return (
    <Modal onClose={onClose}>
      <ArchiveModal
        title="Archived Notebooks"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search archived notebooks..."
        searchTooltip="Search by title, course code, or author name"
        sortValue={sortValue}
        onSortChange={handleSortChange}
        sortOptions={sortOptions}
        items={filtered}
        renderItem={(note) => (
          <li key={note.id} className={archiveStyles.item}>
            <div className={archiveStyles.header}>
              <div>
                <div className={archiveStyles.metaLine}>
                  <strong>{note.metadata.title}</strong>
                  <span className={archiveStyles.dot}>·</span>
                  <span className={archiveStyles.entries}>
                    {note.cells.length} cell{note.cells.length === 1 ? "" : "s"}
                  </span>
                </div>
                {note.metadata.author && (
                  <div className={noteArchiveStyles.authorLine}>
                    By <span>{note.metadata.author}</span>
                  </div>
                )}
                <div className={archiveStyles.dateLine}>
                  {note.metadata.archivedAt && (
                    <time title={`Archived at ${new Date(note.metadata.archivedAt).toLocaleString()}`}>
                      {formatArchivedAt(note.metadata.archivedAt)}
                    </time>
                  )}
                  {note.metadata.createdAt && (
                    <span>, <time title={`Created at ${new Date(note.metadata.createdAt).toLocaleString()}`}>
                      {formatCreatedAt(note.metadata.createdAt)}
                    </time></span>
                  )}
                </div>
              </div>
              <div className={archiveStyles.actions}>
                {/* <Tooltip text="Preview notebook"><button>Preview</button></Tooltip> //TODO: implement this by getting the whole NotationEditor in such a way that everything is replaced by MathView and computationally efficient*/} 
                <Tooltip text="Restore notebook"><button onClick={() => onUnarchive(note.id)}>Restore</button></Tooltip>
                <Tooltip text="Permanently delete"><button onClick={() => {
                  if (confirm(`Delete "${note.metadata.title}" permanently?`)) {
                    onDelete(note.id);
                  }
                }}>🗑️</button></Tooltip>
              </div>
            </div>
          </li>
        )}
      />
    </Modal>
  );
};

export default NotebookArchiveModal;
