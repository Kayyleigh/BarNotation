// components/mathLibrary/MathLibrary.tsx
import { useEffect, useState, useCallback, useTransition } from "react";
import LibCollectionArchiveModal from "../modals/LibCollectionArchiveModal";
import LibraryEntries from "./LibraryEntries";
import type { LibraryCollection, LibraryEntry } from "../../models/libraryTypes";
import { createPremadeCollections } from "../../utils/collectionUtils";
import { useToast } from "../../hooks/toast/useToast";
import styles from "./MathLibrary.module.css";
import CollectionTabs from "./CollectionTabs";
import SearchBar from "../common/SearchBar";
import type { DropSource, DropTarget } from "../layout/EditorWorkspace";
import { useDragContext } from "../../hooks/mathDrag/useDragContext";
import { nodeToLatex } from "../../models/nodeToLatex";
import { parseLatex } from "../../models/latexParser";
import React from "react";
import { SortDropdown } from "../common/SortDropdown";

const STORAGE_KEY = "mathLibraryCollections";

export type SortOption =
  | "date"
  | "date-asc"
  | "usage"
  | "usage-asc"
  | "latex"
  | "latex-desc";

interface MathLibraryProps {
  onDropNode: (from: DropSource, to: DropTarget) => void;
  updateEntryRef: React.RefObject<(id: string) => void>; //unused?
}

const MathLibrary: React.FC<MathLibraryProps> = ({
  updateEntryRef,
}) => {
  const { showToast } = useToast();

  // React 18 startTransition hook for deferred updates
  const [, startTransition] = useTransition(); //'isPending' is assigned a value but never used.eslint@typescript-eslint/no-unused-vars

  // Collections state
  const [collections, setCollections] = useState<LibraryCollection[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: LibraryCollection[] = JSON.parse(stored);
        parsed.forEach((c) =>
          c.entries.forEach((e) => {
            if (typeof e.addedAt === "string") {
              e.addedAt = new Date(e.addedAt).getTime();
            }
          })
        );
        return parsed;
      }
    } catch {
      showToast({
        type: "error",
        message: "Failed to load library collections from storage.",
      });
    }
    return createPremadeCollections();
  });

  // Active collection id state
  const [activeColl, setActiveColl] = useState<string>(() => {
    const first = collections.find((c) => !c.archived);
    return first ? first.id : "";
  });

  // Loading state for collection entries
  const [loadingCollection, setLoadingCollection] = useState(true);

  // Wrap active collection setter in startTransition for smooth UI updates
  const changeActiveCollection = (newId: string) => {
    setLoadingCollection(true);
    startTransition(() => {
      setActiveColl(newId);
    });
  };

  useEffect(() => {
    if (!loadingCollection) return; // Only set fallback if loading is active

    const timer = setTimeout(() => {
      setLoadingCollection(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [activeColl, loadingCollection]);

  const [editingCollId, setEditingCollId] = useState<string | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("date");
  const [searchTerm, setSearchTerm] = useState("");

  // Drag context from provider
  const { draggingNode, setDraggingNode, setDropTarget } =
    useDragContext();

  // Save collections on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch {
      showToast({ type: "error", message: "Failed to save library collections." });
    }
  }, [collections, showToast]);

  // Archive modal open handler
  useEffect(() => {
    if (menuOpenFor === "archive") {
      setArchiveModalOpen(true);
      setMenuOpenFor(null);
    }
  }, [menuOpenFor]);

  // Update entries in a collection helper
  const updateCollectionEntries = useCallback(
    (collectionId: string, newEntries: LibraryEntry[]) => {
      setCollections((prev) =>
        prev.map((c) => (c.id === collectionId ? { ...c, entries: newEntries } : c))
      );
    },
    []
  );

  // Update entry dragged count helper
  const updateEntry = useCallback((id: string) => {
    setCollections(prev => {
      let changed = false;
      const updated = prev.map(coll => {
        const updatedEntries = coll.entries.map(e =>
          e.id === id ? ((changed = true), { ...e, draggedCount: e.draggedCount + 1 }) : e
        );
        return changed ? { ...coll, entries: updatedEntries } : coll;
      });
      return changed ? updated : prev;
    });
  }, []);

  useEffect(() => {
    updateEntryRef.current = updateEntry;
  }, [updateEntry, updateEntryRef]);

  // Find collection by id helper
  const findCollection = useCallback(
    (id: string) => collections.find((c) => c.id === id),
    [collections]
  );

  // Handle drop inside library
  const handleLibraryDrop = useCallback(
    (e: React.DragEvent, dropCollectionId: string, dropIndex: number | null) => {
      // Same logic as your original function
      if (!draggingNode) {
        const plainText = e.dataTransfer.getData("text/plain")?.trim();

        if (!plainText) return;

        const targetCollection = findCollection(dropCollectionId);
        if (!targetCollection) return;

        try {
          const parsed = parseLatex(plainText);
          const newEntry: LibraryEntry = {
            id: crypto.randomUUID(),
            node: parsed,
            addedAt: Date.now(),
            draggedCount: 0,
            latex: plainText,
          };

          const updatedEntries = [...targetCollection.entries];
          const insertIndex = dropIndex ?? updatedEntries.length;

          updatedEntries.splice(insertIndex, 0, newEntry);

          setCollections(prev =>
            prev.map(c =>
              c.id === targetCollection.id
                ? { ...c, entries: updatedEntries }
                : c
            )
          );

          showToast({ type: "success", message: "LaTeX added to library." });
        } catch (err) {
          console.error("Invalid LaTeX dropped:", err);
          showToast({ type: "error", message: "Failed to parse LaTeX." });
        }

        return;
      }

      if (
        draggingNode.sourceType === "library" &&
        draggingNode.cellId === dropCollectionId
      ) {
        return;
      }

      const targetCollection = findCollection(dropCollectionId);
      if (!targetCollection) {
        setDraggingNode(null);
        setDropTarget(null);
        return;
      }

      if (draggingNode.sourceType === "library") {
        const sourceCollection = findCollection(draggingNode.cellId || "");
        if (!sourceCollection) {
          setDraggingNode(null);
          setDropTarget(null);
          return;
        }

        const sourceEntries = [...sourceCollection.entries];
        const [movedEntry] = sourceEntries.splice(draggingNode.index, 1);

        const targetEntries =
          dropIndex !== null
            ? [...targetCollection.entries]
            : [...targetCollection.entries];

        const insertIndex =
          dropIndex !== null
            ? dropIndex > sourceCollection.entries.length
              ? sourceCollection.entries.length
              : dropIndex
            : targetEntries.length;

        targetEntries.splice(insertIndex, 0, movedEntry);

        setCollections((prev) =>
          prev.map((c) => {
            if (c.id === sourceCollection.id) return { ...c, entries: sourceEntries };
            if (c.id === targetCollection.id) return { ...c, entries: targetEntries };
            return c;
          })
        );

        showToast({ type: "success", message: "Entry moved between collections." });
      } else if (draggingNode.sourceType === "cell") {
        const latex = draggingNode.node ? nodeToLatex(draggingNode.node) ?? "" : "";
        const exists = targetCollection.entries.some(
          (e) => e.latex === latex
        );
        if (exists) {
          showToast({ type: "warning", message: "Entry already exists in collection." });
        } else {
          const newEntry: LibraryEntry = {
            id: crypto.randomUUID(),
            node: draggingNode.node,
            latex,
            addedAt: Date.now(),
            draggedCount: 0,
          };
          const newEntries = [...targetCollection.entries];
          const insertIndex = dropIndex !== null ? dropIndex : newEntries.length;
          newEntries.splice(insertIndex, 0, newEntry);

          updateCollectionEntries(targetCollection.id, newEntries);
          showToast({ type: "success", message: `Entry ${newEntry.latex} added to ${targetCollection.name}.` });
        }
      }

      setDraggingNode(null);
      setDropTarget(null);
    },
    [draggingNode, findCollection, setDraggingNode, setDropTarget, showToast, updateCollectionEntries]
  );

  const activeCollection = collections.find(c => c.id === activeColl);
  const placeholderText = `Search ${activeCollection ? activeCollection.name : "Collection"}...`;

  const sortOptions = [
    { label: "Newest", value: "date" },
    { label: "Oldest", value: "date-asc" },
    { label: "Most Used", value: "usage" },
    { label: "Least Used", value: "usage-asc" },
    { label: "A → Z", value: "latex" },
    { label: "Z → A", value: "latex-desc" },
  ];

  const memoizedOnDrop = useCallback(
    (e: React.DragEvent<Element>, dropIndex: number | null) => {
      e.preventDefault();
      console.log(`In line 896 of MathLibrary; memoizedOnDrop`)
      handleLibraryDrop(e, activeColl, dropIndex);
    },
    [handleLibraryDrop, activeColl]
  );

  return (
    <div className={styles.libraryContainer}>
      <CollectionTabs
        collections={collections}
        activeColl={activeColl}
        setActiveColl={changeActiveCollection}
        editingCollId={editingCollId}
        setEditingCollId={setEditingCollId}
        setCollections={setCollections}
        menuOpenFor={menuOpenFor}
        setMenuOpenFor={setMenuOpenFor}
        onDropEntryToCollection={(entry, collectionId) => {
          const coll = findCollection(collectionId);
          if (!coll) return;
          const exists = coll.entries.some((e) => e.latex === entry.latex);
          if (exists) {
            showToast({ type: "warning", message: `Entry ${entry.latex} already exists in ${coll.name}.` });
            return;
          }
          const newEntry = { ...entry, addedAt: Date.now(), draggedCount: 0 };
          updateCollectionEntries(collectionId, [...coll.entries, newEntry]);
          showToast({ type: "success", message: `Entry ${entry.latex} added to ${coll.name}.` });
        }}
      />

      <div className={styles.controls}>
        <SearchBar
          placeholder={placeholderText}
          value={searchTerm}
          onChange={setSearchTerm}
          className={styles.librarySearch}
          tooltip="Search on LaTeX substring"
        />
        <SortDropdown
          options={sortOptions}
          value={sortOption}
          onChange={(val) => setSortOption(val as SortOption)}
          className={styles.sortDropdown}
          aria-label="Sort library entries"
        />
      </div>

      {activeColl ? (
        loadingCollection ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading collections, this may take a while...</p>
          </div>
        ) : (
          <LibraryEntries
            onRendered={() => setLoadingCollection(false)} //TODO
            collections={collections}
            setCollections={setCollections}
            activeColl={activeColl}
            sortOption={sortOption}
            searchTerm={searchTerm}
            onDrop={memoizedOnDrop}
          />
        )
      ) : (
        <p>No active collection available.</p>
      )}
      {archiveModalOpen && (
        <LibCollectionArchiveModal
          archived={collections.filter((c) => c.archived)}
          onClose={() => setArchiveModalOpen(false)}
          onUnarchive={(id) => {
            const unarchived = collections.find((c) => c.id === id);
            setCollections((prev) =>
              prev.map((c) => (c.id === id ? { ...c, archived: false } : c))
            );
            showToast({
              type: "success",
              message: `Unarchived "${unarchived?.name || "Collection"}"`,
            });
          }}
          onDelete={(id) => {
            const deleted = collections.find((c) => c.id === id);
            setCollections((prev) => prev.filter((c) => c.id !== id));
            showToast({
              type: "success",
              message: `Deleted "${deleted?.name || "Collection"}"`,
            });
          }}
        />
      )}
    </div>
  );
};

export default React.memo(MathLibrary);
