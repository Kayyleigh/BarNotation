// components/modals/LibCollectionArchiveModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./LibCollectionArchiveModal.module.css";
import type { LibraryCollection } from "../../models/libraryTypes";
import { MathView } from "../mathExpression/MathView";
import SearchBar from "../common/SearchBar";
import { formatArchivedAt, formatCreatedAt } from "../../utils/dateUtils";
import clsx from "clsx";
import { SortDropdown } from "../common/SortDropdown";
import Tooltip from "../tooltips/Tooltip";

type LibraryCollectionSortKey = "created" | "archived" | "name" | "entryCount";
type SortDirection = "asc" | "desc";
type SortValue = `${LibraryCollectionSortKey}_${SortDirection}`;

interface Props {
  archived: LibraryCollection[];
  onClose: () => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const LibCollectionArchiveModal: React.FC<Props> = ({
  archived,
  onClose,
  onUnarchive,
  onDelete,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortValue>("archived_desc");
  const [search, setSearch] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  // Extended sorting options with intuitive labels and direction
  const collectionSortOptions: { label: string; value: SortValue }[] = [
    { label: "Recently Archived", value: "archived_desc" },
    { label: "Longest Archived", value: "archived_asc" },
    { label: "Newest Collection", value: "created_desc" },
    { label: "Oldest Collection", value: "created_asc" },
    { label: "Name A → Z", value: "name_desc" },
    { label: "Name Z → A", value: "name_asc" },
    { label: "Most Entries", value: "entryCount_desc" },
    { label: "Fewest Entries", value: "entryCount_asc" },
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.addEventListener("mouseup", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [onClose]);

  const filtered = useMemo(() => {
    // Base sorting functions by key (always descending for numbers, ascending for name)
    const baseSortFunctions: Record<
      LibraryCollectionSortKey,
      (a: LibraryCollection, b: LibraryCollection) => number
    > = {
      created: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
      archived: (a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0),
      name: (a, b) => a.name.localeCompare(b.name),
      entryCount: (a, b) => b.entries.length - a.entries.length,
    };

    // Extract sort key and direction from combined string
    const [key, dir] = sortOption.split("_") as [LibraryCollectionSortKey, SortDirection];
    const baseSortFn = baseSortFunctions[key];

    // Filter by search, then sort by key and direction
    return [...archived]
      .filter((col) => col.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (dir === "asc" ? -baseSortFn(a, b) : baseSortFn(a, b)));
  }, [archived, search, sortOption]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} ref={contentRef}>
        <h2>Archived Collections</h2>
        <div className={styles.controls}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search archived collections..."
            tooltip="Search by collection name"
            className={styles.searchBar}
          />
          <SortDropdown
            options={collectionSortOptions}
            value={sortOption}
            onChange={(val) => setSortOption(val as SortValue)}
            className={styles.sortDropdown}
            aria-label="Sort library entries"
          />
        </div>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No matching collections.</p>
        ) : (
          <ul className={styles.list}>
            {filtered.map((col) => (
              <li key={col.id} className={styles.item}>
                <div className={styles.header}>
                  <div>
                    <div className={styles.metaLine}>
                      <strong>{col.name}</strong>
                      <span className={styles.dot}>·</span>
                      <span className={styles.entries}>
                        {col.entries.length} entr{col.entries.length === 1 ? "y" : "ies"}
                      </span>
                    </div>

                    <div className={styles.dateLine}>
                      {col.archivedAt && (
                        <time
                          dateTime={new Date(col.archivedAt).toISOString()}
                          className={styles.archivedTime}
                          title={`Archived at ${new Date(col.archivedAt).toLocaleString()}`}
                        >
                          {formatArchivedAt(col.archivedAt)}
                        </time>
                      )}

                      {col.createdAt && col.archivedAt && <span>, </span>}

                      {col.createdAt && (
                        <time
                          dateTime={new Date(col.createdAt).toISOString()}
                          className={styles.createdTime}
                          title={`Created at ${new Date(col.createdAt).toLocaleString()}`}
                        >
                          {formatCreatedAt(col.createdAt)}
                        </time>
                      )}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <Tooltip text={col.entries.length === 0 ? "No entries to show" : "View collection entries"}>
                      <button
                        onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}
                        className={styles.previewToggle}
                        disabled={col.entries.length === 0}
                      >
                        {expandedId === col.id ? "Hide" : "Preview"}
                      </button>
                    </Tooltip>
                    <Tooltip text="Restore collection">
                      <button onClick={() => onUnarchive(col.id)}>Restore</button>
                    </Tooltip>
                    <Tooltip text="Permanently delete collection">
                      <button
                        className={clsx("button", "delete-button")}
                        onClick={() => {
                          if (confirm(`Delete "${col.name}" permanently?`)) {
                            onDelete(col.id);
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {expandedId === col.id && (
                  <div className={styles.preview}>
                    {col.entries.length === 0 ? (
                      <p className={styles.emptyPreview}>No entries.</p>
                    ) : (
                      <div className={styles.previewEntries}>
                        {col.entries.map((e) => (
                          <div key={e.id} className={styles.previewEntry}>
                            <MathView node={e.node} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.footer}>
          <Tooltip text="Close the collection archive">
            <button className="button secondary" onClick={onClose}>Close</button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default LibCollectionArchiveModal;
