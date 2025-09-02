// NotebookArchiveModal.tsx
import React, { useState, useMemo, useCallback } from "react";
import Modal from "./Modal";
import ArchiveModal from "./ArchiveModal";
import type { Note } from "../../models/noteTypes";
import archiveStyles from "./ArchiveModal.module.css";
import noteArchiveStyles from "./NotebookArchiveModal.module.css";
import Tooltip from "../tooltips/Tooltip";
import { formatArchivedAt, formatCreatedAt } from "../../utils/dateUtils";
import { useI18n } from "../../i18n/useI18n";

type SortKey = "archived" | "created" | "cellcount" | "title";
type SortDir = "asc" | "desc";
type SortValue = `${SortKey}_${SortDir}`;

interface Props {
  notes: Note[];
  onClose: () => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotebookArchiveModal: React.FC<Props> = ({ notes, onClose, onUnarchive, onDelete }) => {
  const { t, lang } = useI18n(); // get language hook (and lang for locale for date formatting)

  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState<SortValue>("archived_desc");

  const sortOptions = [
    { label: t("modals.notebookArchive.sort.recentlyArchived"), value: "archived_desc" },
    { label: t("modals.notebookArchive.sort.longestArchived"), value: "archived_asc" },
    { label: t("modals.notebookArchive.sort.newestCreated"), value: "created_desc" },
    { label: t("modals.notebookArchive.sort.oldestCreated"), value: "created_asc" },
    { label: t("modals.notebookArchive.sort.mostCells"), value: "cellcount_desc" },
    { label: t("modals.notebookArchive.sort.leastCells"), value: "cellcount_asc" },
    { label: t("modals.notebookArchive.sort.titleAZ"), value: "title_desc" },
    { label: t("modals.notebookArchive.sort.titleZA"), value: "title_asc" },
  ];

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
        n.metadata.author?.toLowerCase().includes(search) 
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
        title={t("modals.notebookArchive.title")}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("modals.notebookArchive.searchPlaceholder")}
        searchTooltip={t("modals.notebookArchive.searchTooltip")}
        sortValue={sortValue}
        onSortChange={handleSortChange}
        sortOptions={sortOptions}
        items={filtered}
        emptyMessage={t("modals.notebookArchive.noMatches")}
        renderItem={(note) => (
          <li key={note.id} className={archiveStyles.item}>
            <div className={archiveStyles.header}>
              <div>
                <div className={archiveStyles.metaLine}>
                  <strong>{note.metadata.title}</strong>
                  <span className={archiveStyles.dot}>·</span>
                  <span className={archiveStyles.entries}>
                    {note.cells.length} { t("modals.notebookArchive.cell", { count: note.cells.length } )}
                  </span>
                </div>
                {note.metadata.author && (
                  <div className={noteArchiveStyles.authorLine}>
                    {t("modals.notebookArchive.by")} <span>{note.metadata.author}</span>
                  </div>
                )}
                <div className={archiveStyles.dateLine}>
                  {note.metadata.archivedAt && (
                    <time
                      title={t("modals.notebookArchive.archivedAt", {
                        date: new Date(note.metadata.archivedAt).toLocaleString(lang),
                      })}
                    >
                      {formatArchivedAt(note.metadata.archivedAt, t, lang)}
                    </time>
                  )}
                  {note.metadata.createdAt && (
                    <span>
                      ,{" "}
                      <time
                        title={t("modals.notebookArchive.createdAt", {
                          date: new Date(note.metadata.createdAt).toLocaleString(lang),
                        })}
                      >
                        {formatCreatedAt(note.metadata.createdAt, t, lang)}
                      </time>
                    </span>
                  )}
                </div>
              </div>
              <div className={archiveStyles.actions}>
                {/* TODO: Preview notebook */}
                <Tooltip text={t("modals.notebookArchive.restoreTooltip")}>
                  <button onClick={() => onUnarchive(note.id)}>{t("modals.notebookArchive.restore")}</button>
                </Tooltip>
                <Tooltip text={t("modals.notebookArchive.deleteTooltip")}>
                  <button onClick={() => {
                    if (confirm(t("modals.notebookArchive.confirmDelete", { title: note.metadata.title }))) {
                      onDelete(note.id);
                    }
                  }}>🗑️</button>
                </Tooltip>
              </div>
            </div>
          </li>
        )}
      />
    </Modal>
  );
};

export default NotebookArchiveModal;
