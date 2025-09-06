// components/mathLibrary/MathLibrary.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { MathNodeLibrary, LibraryEntry } from "../../models/libraryTypes";
import {
  ACTIVE_COLL_KEY,
  addEntryToCollection,
  softDeleteCollection,
} from "../../utils/mathLibraryUtils";
import { useI18n } from "../../i18n/useI18n";
import styles from "./MathLibrary.module.css";
import CollectionTabs from "./CollectionTabs";
import SearchBar from "../common/SearchBar";
import { SortDropdown } from "../common/SortDropdown";
import LibraryEntries from "./LibraryEntries";
import LibCollectionArchiveModal from "../modals/LibCollectionArchiveModal";
import { nodeToLatex } from "../../models/nodeToLatex";
import { useToast } from "../../hooks/toast/useToast";
import { useDragReader, useDragWriter } from "../../hooks/mathDrag/useDragContext";

interface MathLibraryProps {
  library: MathNodeLibrary;
  setLibrary: React.Dispatch<React.SetStateAction<MathNodeLibrary>>;
  updateEntryRef: React.RefObject<(id: string) => void>;
}

const MathLibrary: React.FC<MathLibraryProps> = ({ library, setLibrary, updateEntryRef }) => {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [activeCollId, setActiveCollId] = useState<string | null>(null);

  useEffect(() => {
    if (activeCollId) return; // already set

    try {
      const storedId = localStorage.getItem(ACTIVE_COLL_KEY);
      const storedCollection = storedId ? library.collections[storedId] : null;

      if (storedCollection && !storedCollection.archivedAt && !storedCollection.deletedAt) {
        setActiveCollId(storedId);
        return;
      }

      // fallback to "premade-structures" if available
      const defaultColl = library.collections["premade-structures"];
      if (defaultColl && !defaultColl.archivedAt && !defaultColl.deletedAt) {
        setActiveCollId("premade-structures");
      }
    } catch {
      // ignore, leave null
    }
  }, [activeCollId, library.collections]);

  // Persist active collection in localStorage whenever it changes
  useEffect(() => {
    if (activeCollId) localStorage.setItem(ACTIVE_COLL_KEY, activeCollId);
  }, [activeCollId]);

  const [editingCollId, setEditingCollId] = useState<string | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  const [loadingCollection, setLoadingCollection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date"); // default sort mode
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const { draggingSource } = useDragReader();
  const { setDraggingSource } = useDragWriter();

  // --- Update entry dragged count for a specific membership ---
  const updateEntryDraggedCount = useCallback(
    (entryId: string, collectionId: string) => {
      setLibrary((prev: MathNodeLibrary): MathNodeLibrary => {
        const entry = prev.entries[entryId];
        if (!entry) return prev;

        // Update memberships array
        const memberships = prev.memberships.map((m) =>
          m.entryId === entryId && m.collectionId === collectionId
            ? { ...m, dragCount: m.dragCount + 1 }
            : m
        );

        // Recalculate entry's global dragged count
        const globalDragCount = memberships
          .filter((m) => m.entryId === entryId)
          .reduce((sum, m) => sum + m.dragCount, 0);

        const updatedEntry: LibraryEntry = { ...entry, globalDragCount };

        return {
          ...prev,
          entries: { ...prev.entries, [entryId]: updatedEntry },
          memberships,
          collections: { ...prev.collections }, // preserve collections
        };
      });
    },
    [setLibrary] //TODO?? Can prevent?
  );

  useEffect(() => {
    if (!activeCollId) return;

    updateEntryRef.current = (entryId: string) => {
      updateEntryDraggedCount(entryId, activeCollId);
    };
  }, [updateEntryDraggedCount, activeCollId, updateEntryRef]);

  // Archive modal open handler
  useEffect(() => {
    if (menuOpenFor === "archive") {
      setArchiveModalOpen(true);
      setMenuOpenFor(null);
    }
  }, [menuOpenFor]);

  useEffect(() => {
    if (!loadingCollection) return; // Only set fallback if loading is active

    const timer = setTimeout(() => {
      setLoadingCollection(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [loadingCollection]);

  const handleLibraryRendered = useCallback(() => {
    setLoadingCollection(false);
  }, []);

  // === DERIVED ===
  const collections = useMemo(
    () => Object.values(library.collections).filter((c) => !c.deletedAt),
    [library]
  );

  // === HANDLERS ===
  const changeActiveCollection = useCallback((id: string) => {
    setActiveCollId(id);
    setLoadingCollection(true);
  }, []);

  const handleSetSearchTerm = useCallback((term: string) => setSearchTerm(term), []);

  const handleSortChange = useCallback((opt: string) => setSortOption(opt), []);

  const handleDropOnLibrary = useCallback(() => {
    if (!activeCollId || !draggingSource) return;

    if (draggingSource.type === "library" && activeCollId === draggingSource.collectionId) return;

    const latex = nodeToLatex(draggingSource.node, false);
    if (!latex) {
      showToast({ type: "error", message: t("mathLibrary.entries.toast.invalidLatex") });
      return;
    }

    let success = false;
    let errorMessage: string | null = null;

    // Attempt state update safely
    setLibrary((lib) => {
      try {
        const updated = addEntryToCollection(lib, activeCollId, latex, draggingSource.node);
        success = true;
        return updated;
      } catch (err: unknown) {
        errorMessage =
          err instanceof Error ? err.message : t("mathLibrary.entries.toast.failed");
        return lib; // No state change if failed
      }
    });

    setDraggingSource(null);

    // Show toast outside of state updater
    if (success) {
      showToast({ type: "success", message: t("mathLibrary.entries.toast.added") });
    } else if (errorMessage) {
      showToast({ type: "error", message: errorMessage });
    }
  }, [activeCollId, draggingSource, setLibrary, setDraggingSource, showToast, t]);

  const handleUnarchive = useCallback((collectionId: string) => {
    let success = false;
    let errorMessage: string | null = null;

    setLibrary((lib) => {
      const col = lib.collections[collectionId];
      if (!col) {
        errorMessage = t("mathLibrary.collections.toast.notFound");
        return lib;
      }

      success = true;
      return {
        ...lib,
        collections: {
          ...lib.collections,
          [collectionId]: { ...col, archivedAt: undefined },
        },
      };
    });

    if (success) {
      // Update active collection after library state is updated
      setActiveCollId(collectionId);

      showToast({ type: "success", message: t("mathLibrary.success.unarchived") });
    } else if (errorMessage) {
      showToast({ type: "error", message: errorMessage });
    }
  }, [setLibrary, setActiveCollId, showToast, t]);

  const handleDelete = useCallback((collectionId: string) => {
    try {
      setLibrary((lib) => softDeleteCollection(lib, collectionId));
      showToast({ type: "success", message: t("mathLibrary.collections.toast.deleted") });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("mathLibrary.collections.toast.failed");
      showToast({ type: "error", message });
    }
  }, [setLibrary, showToast, t]);

  const handleCloseArchiveModal = useCallback(() => setArchiveModalOpen(false), []);

  const sortOptions = [
    { label: t("mathLibrary.sort.newest"), value: "date" },
    { label: t("mathLibrary.sort.oldest"), value: "date-asc" },
    { label: t("mathLibrary.sort.mostUsedLocal"), value: "usage-local" },
    { label: t("mathLibrary.sort.leastUsedLocal"), value: "usage-local-asc" },
    { label: t("mathLibrary.sort.mostUsedGlobal"), value: "usage-global" },
    { label: t("mathLibrary.sort.leastUsedGlobal"), value: "usage-global-asc" },
    { label: t("mathLibrary.sort.aZ"), value: "latex" },
    { label: t("mathLibrary.sort.zA"), value: "latex-desc" },
  ];

  const placeholderText = t("mathLibrary.search.placeholder");

  // === RENDER ===
  return (
    <div className={styles.libraryContainer}>
      <CollectionTabs
        library={library}
        setLibrary={setLibrary}
        collections={collections}
        activeColl={activeCollId}
        setActiveColl={changeActiveCollection}
        editingCollId={editingCollId}
        setEditingCollId={setEditingCollId}
        menuOpenFor={menuOpenFor}
        setMenuOpenFor={setMenuOpenFor}
      />

      <div className={styles.controls}>
        <SearchBar
          placeholder={placeholderText}
          value={searchTerm}
          onChange={handleSetSearchTerm}
          className={styles.librarySearch}
          tooltip={t("mathLibrary.search.tooltip")}
        />
        <SortDropdown
          options={sortOptions}
          value={sortOption}
          onChange={handleSortChange}
          className={styles.sortDropdown}
          aria-label={t("mathLibrary.sort.ariaLabel")}
        />
      </div>

      {activeCollId ? (
        loadingCollection ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>{t("mathLibrary.loading")}</p>
          </div>
        ) : (
          <LibraryEntries
            library={library}
            setLibrary={setLibrary}
            activeCollId={activeCollId}
            sortOption={sortOption} //Type 'string' is not assignable to type 'LibraryEntriesSortOption'.ts(2322)
            searchTerm={searchTerm}
            onDrop={handleDropOnLibrary}
            onRendered={handleLibraryRendered}
          />
        )
      ) : (
        <p>{t("mathLibrary.empty")}</p>
      )}

      {archiveModalOpen && (
        <LibCollectionArchiveModal
          library={library}
          archived={collections.filter((c) => c.archivedAt)}
          onClose={handleCloseArchiveModal}
          onUnarchive={handleUnarchive}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default React.memo(MathLibrary);