// components/mathLibrary/LibraryEntries.tsx
import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useDragContext } from "../../hooks/mathDrag/useDragContext";
import type { MathNodeLibrary, LibraryEntry } from "../../models/libraryTypes";
import styles from "./MathLibrary.module.css";
import MathView from "../mathExpression/MathView";
import Tooltip from "../tooltips/Tooltip";
import { useI18n } from "../../i18n/useI18n";
import {
  removeEntryFromCollection,
  getEntriesForCollection,
  getMembership,
  type LibraryEntriesSortOption,
  setEntryCommandSequence,
} from "../../utils/mathLibraryUtils";
import EditCustomCommandOnEntryModal from "../modals/EditCustomCommandOnEntryModal";
import clsx from "clsx";
import { useToast } from "../../hooks/toast/useToast";

interface LibraryEntriesProps {
  library: MathNodeLibrary;
  setLibrary: React.Dispatch<React.SetStateAction<MathNodeLibrary>>;
  activeCollId: string;
  sortOption: LibraryEntriesSortOption;
  searchTerm: string;
  onDrop: (entryId: string) => void;
  onRendered?: () => void;
}

interface LibraryEntryItemProps {
  entry: LibraryEntry;
  localDragCount: number;
  onDragStart: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDelete: () => void;
  showDeleteButton: boolean;
  onDoubleClick?: () => void; //TODO remove later when replaced w other way to set edit mode
  highlight?: boolean; // optional green border support //TODO change to prettier later
}

const LibraryEntryItem: React.FC<LibraryEntryItemProps> = React.memo(
  ({ entry, localDragCount, onDragStart, onDragLeave, onDelete, showDeleteButton, onDoubleClick, highlight, }) => {
    const { t } = useI18n();

    return (
      <div
        // className={`${styles.libraryEntry}`}
        className={clsx(styles.libraryEntry, highlight && styles.customCommand)} //TODO no green border
        draggable
        onDragStart={onDragStart}
        onDragLeave={onDragLeave}
        onDoubleClick={onDoubleClick} //TODO change later
        role="listitem"
        tabIndex={0}
      >
        <Tooltip text={entry.commandSequence ?? entry.latex}>
          <MathView node={entry.node} showPlaceHolder={true} />
        </Tooltip>
        <div className={styles.meta}>
          <span>{localDragCount}/{entry.globalDragCount}</span>
        </div>
        {entry.commandSequence &&
          <div className={styles.isCustomCommand}>
            <Tooltip text={t("customCommandIconTooltip")}>
              <span>👤</span> {/* TODO: maybe centralize all uses of this emoji for maintainability (to ever change it to own svg) */}
            </Tooltip>
          </div>
        }
        {showDeleteButton && (
          <button
            className={styles.entryDeleteButton}
            title={t("mathLibrary.entries.deleteEntry")}
            onClick={onDelete}
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

const LibraryEntries: React.FC<LibraryEntriesProps> = ({
  library,
  setLibrary,
  activeCollId,
  sortOption,
  searchTerm,
  onDrop,
  onRendered,
}) => {
  const { t } = useI18n();
  const { showToast } = useToast();

  const { draggingSource, setDraggingSource, dropTarget, setDropTarget } = useDragContext();

  const [editingEntry, setEditingEntry] = useState<LibraryEntry | null>(null);

  const entries = useMemo(
    () => getEntriesForCollection(library, activeCollId),
    [library, activeCollId]
  );

  // --- Filtering & sorting (unchanged) ---
  const filteredSortedEntries = useMemo(() => {
    let filtered = entries;
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((e) => e.latex.toLowerCase().includes(lower) || e.commandSequence?.toLowerCase().includes(lower));
    }
    switch (sortOption) {
      case "date": {
        filtered = filtered.slice().sort((a, b) => {
          const aMembership = getMembership(library, a.id, activeCollId);
          const bMembership = getMembership(library, b.id, activeCollId);
          return (bMembership?.addedAt || 0) - (aMembership?.addedAt || 0);
        });
        break;
      }
      case "date-asc": {
        filtered = filtered.slice().sort((a, b) => {
          const aMembership = getMembership(library, a.id, activeCollId);
          const bMembership = getMembership(library, b.id, activeCollId);
          return (aMembership?.addedAt || 0) - (bMembership?.addedAt || 0);
        });
        break;
      }
      case "usage-local": {
        filtered = filtered.slice().sort((a, b) => {
          const aMembership = getMembership(library, a.id, activeCollId);
          const bMembership = getMembership(library, b.id, activeCollId);
          return (bMembership?.dragCount || 0) - (aMembership?.dragCount || 0);
        });
        break;
      }
      case "usage-local-asc": {
        filtered = filtered.slice().sort((a, b) => {
          const aMembership = getMembership(library, a.id, activeCollId);
          const bMembership = getMembership(library, b.id, activeCollId);
          return (aMembership?.dragCount || 0) - (bMembership?.dragCount || 0);
        });
        break;
      }
      case "usage-global":
        filtered = filtered.slice().sort((a, b) => (b.globalDragCount || 0) - (a.globalDragCount || 0));
        break;
      case "usage-global-asc":
        filtered = filtered.slice().sort((a, b) => (a.globalDragCount || 0) - (b.globalDragCount || 0));
        break;
      case "latex":
        filtered = filtered.slice().sort((a, b) => a.latex.localeCompare(b.latex));
        break;
      case "latex-desc":
        filtered = filtered.slice().sort((a, b) => b.latex.localeCompare(a.latex));
        break;
    }
    return filtered;
  }, [activeCollId, entries, library, searchTerm, sortOption]);

  // --- Drag & Drop handlers (unchanged) ---
  const handleDragStart = useCallback(
    (entry: LibraryEntry) => (e: React.DragEvent) => {
      e.stopPropagation();
      setDraggingSource({
        type: "library",
        collectionId: activeCollId,
        entryId: entry.id,
        node: entry.node,
      });
      setDropTarget(null);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", entry.latex);
    },
    [activeCollId, setDraggingSource, setDropTarget]
  );

  const handleDragLeave = useCallback(() => {
    if (dropTarget?.type === "libraryCollection") {
      setDropTarget(null);
    }
  }, [dropTarget, setDropTarget]);

  const handleDropAtEnd = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggingSource) return;
      setDropTarget({ type: "libraryCollection", collectionId: activeCollId });
      e.dataTransfer.dropEffect = "move";
    },
    [draggingSource, activeCollId, setDropTarget]
  );

  const handleDrop = useCallback(() => {
    if (!draggingSource || !dropTarget) return;
    if (
      dropTarget.type !== "libraryCollection" ||
      (draggingSource.type === "library" && draggingSource.collectionId === dropTarget.collectionId)
    ) {
      setDraggingSource(null);
      setDropTarget(null);
      return;
    }
    try {
      onDrop(dropTarget.collectionId);
    } finally {
      setDraggingSource(null);
      setDropTarget(null);
    }
  }, [draggingSource, dropTarget, onDrop, setDraggingSource, setDropTarget]);

  useEffect(() => {
    onRendered?.();
  }, [filteredSortedEntries, onRendered]);

  const activeCollection = library.collections[activeCollId];
  const isPremade = activeCollection?.type === "premade";

  // --- Handle save of command sequence ---
  const handleSaveCommand = (entryId: string, cmd: string | undefined) => {
    const normalized = cmd?.trim();
    try {
      setLibrary((prevLib) =>
        setEntryCommandSequence(prevLib, entryId, normalized || undefined) //BUG: this crashes instead of toast
      );
      setEditingEntry(null);
      showToast({
        type: "success",
        message: normalized
          ? t("mathLibrary.entries.toast.commandSaved")
          : t("mathLibrary.entries.toast.commandCleared"),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("mathLibrary.entries.toast.failed");
      showToast({ type: "error", message });
    }
  };

  return (
    <div
      className={styles.libraryDropZone}
      onDragOver={handleDropAtEnd}
      onDrop={handleDrop}
      role="list"
      aria-label={t("mathLibrary.entries.ariaLabel", { name: activeCollId })}
    >
      {filteredSortedEntries.map((entry) => {
        const membership = getMembership(library, entry.id, activeCollId);
        return (
          <LibraryEntryItem
            key={entry.id}
            entry={entry}
            localDragCount={membership?.dragCount ?? 0}
            onDragStart={handleDragStart(entry)}
            onDragLeave={handleDragLeave}
            onDelete={() =>
              setLibrary((lib) => removeEntryFromCollection(lib, entry.id, activeCollId))
            }
            onDoubleClick={() => setEditingEntry(entry)}
            highlight={!!entry.commandSequence}
            showDeleteButton={!isPremade}
          />
        );
      })}

      {filteredSortedEntries.length === 0 && (
        <p className={styles.empty}>
          {entries.length === 0
            ? t("mathLibrary.entries.empty")
            : t("mathLibrary.entries.noMatches")}
        </p>
      )}

      {editingEntry && (
        <EditCustomCommandOnEntryModal
          entry={editingEntry}
          onSave={(cmd) => handleSaveCommand(editingEntry.id, cmd)}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
};

export default React.memo(LibraryEntries);
