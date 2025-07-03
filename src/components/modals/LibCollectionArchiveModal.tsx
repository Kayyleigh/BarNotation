import React, { useEffect, useRef, useState } from "react";
import styles from "./LibCollectionArchiveModal.module.css";
import type { LibraryCollection } from "../../models/libraryTypes";
import { MathView } from "../mathExpression/MathView";
import SearchBar from "../common/SearchBar";

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
  const [search, setSearch] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

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

  const filtered = archived.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} ref={contentRef}>
        <h2>Archived Collections</h2>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search archived collections..."
          tooltip="Search by collection name"
          className={styles.searchBar}
        />

        {filtered.length === 0 ? (
          <p className={styles.empty}>No matching collections.</p>
        ) : (
          <ul className={styles.list}>
            {filtered.map((col) => (
              <li key={col.id} className={styles.item}>
                <div className={styles.header}>
                  <div>
                    <strong>{col.name}</strong>
                    <div className={styles.meta}>
                      {col.entries.length} entr{col.entries.length === 1 ? "y" : "ies"}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}
                    >
                      {expandedId === col.id ? "Hide" : "Preview"}
                    </button>
                    <button onClick={() => onUnarchive(col.id)}>Restore</button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${col.name}" permanently?`)) {
                          onDelete(col.id);
                        }
                      }}
                    >
                      🗑️
                    </button>
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
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default LibCollectionArchiveModal;