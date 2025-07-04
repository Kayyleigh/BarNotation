//components/mathLibrary/LibraryEntries.tsx
import React, { useMemo, useCallback } from "react";
import { useDragContext } from "../../hooks/useDragContext";
import type { LibraryCollection } from "../../models/libraryTypes";
import styles from "./MathLibrary.module.css";
import type { SortOption } from "./MathLibrary";
import MathView from "../mathExpression/MathView";
import Tooltip from "../tooltips/Tooltip";

interface LibraryEntriesProps {
  collections: LibraryCollection[];
  setCollections: React.Dispatch<React.SetStateAction<LibraryCollection[]>>
  activeColl: string;
  sortOption: SortOption;
  searchTerm: string;
  onDrop: (e: React.DragEvent, dropIndex: number | null) => void;

}

const LibraryEntries: React.FC<LibraryEntriesProps> = ({
  collections,
  setCollections,
  activeColl,
  sortOption,
  searchTerm,
  onDrop,
}) => {
  console.warn(`Rendering LibraryEntries`);

  const { draggingNode, setDraggingNode, dropTarget, setDropTarget } = useDragContext();

  // Find the active collection
  const collection = collections.find((c) => c.id === activeColl);

  // Compute filtered and sorted entries, or empty array if no collection
  const filteredEntries = useMemo(() => {
    if (!collection) return [];

    let filtered = collection.entries;

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((e) => e.latex.toLowerCase().includes(lower));
    }

    switch (sortOption) {
      case "date":
        filtered = filtered.slice().sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
        break;
      case "date-asc":
        filtered = filtered.slice().sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
        break;
      case "usage":
        filtered = filtered.slice().sort((a, b) => (b.draggedCount || 0) - (a.draggedCount || 0));
        break;
      case "usage-asc":
        filtered = filtered.slice().sort((a, b) => (a.draggedCount || 0) - (b.draggedCount || 0));
        break;
      case "latex":
        filtered = filtered.slice().sort((a, b) => a.latex.localeCompare(b.latex));
        break;
      case "latex-desc":
        filtered = filtered.slice().sort((a, b) => b.latex.localeCompare(a.latex));
        break;
    }

    return filtered;
  }, [collection, searchTerm, sortOption]);

  // All hooks (useCallback) must be called here before any returns
  const handleDragStartAtIndex = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.stopPropagation();
      setDraggingNode({
        sourceType: "library",
        cellId: activeColl,
        containerId: filteredEntries[index].id,
        index,
        node: filteredEntries[index].node,
      });
      setDropTarget(null);
      e.dataTransfer.effectAllowed = "move";
  
      const latexText = filteredEntries[index].latex || "";
      e.dataTransfer.setData("text/plain", latexText);
    },
    [activeColl, filteredEntries, setDraggingNode, setDropTarget]
  );

  const handleDragOverEntryAtIndex = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggingNode) return;
      setDropTarget({
        cellId: "library",
        containerId: activeColl,
        index,
      });
      e.dataTransfer.dropEffect = "move";
    },
    [draggingNode, activeColl, setDropTarget]
  );
  
  const handleDropOnEntryAtIndex = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDrop(e, index);
      setDraggingNode(null);
      setDropTarget(null);
    },
    [onDrop, setDraggingNode, setDropTarget]
  );

  const handleDragLeaveEntry = useCallback(() => {
    if (dropTarget?.cellId === "library") {
      setDropTarget(null);
    }
  }, [dropTarget, setDropTarget]);

  const handleDragOverListEnd = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggingNode) return;
      setDropTarget({
        cellId: "library",
        containerId: activeColl,
        index: 0,
      });
      e.dataTransfer.dropEffect = "move";
    },
    [draggingNode, activeColl, setDropTarget]
  );

  const handleDropOnListEnd = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDrop(e, null);
      setDraggingNode(null);
      setDropTarget(null);
    },
    [onDrop, setDraggingNode, setDropTarget]
  );

  // Now that hooks are all called, return early if no collection
  if (!collection) return null;

  return (
    <div
      className={styles.libraryDropZone}
      onDragOver={handleDragOverListEnd}
      onDrop={handleDropOnListEnd}
      role="list"
      aria-label={`Entries in collection ${collection.name}`}
    >
      {filteredEntries.map((entry, idx) => (
        <div
          key={entry.id}
          className={`${styles.libraryEntry} ${
            dropTarget &&
            dropTarget.cellId === "library" &&
            dropTarget.containerId === activeColl &&
            dropTarget.index === idx
              ? styles.dropTarget
              : ""
          }`}
          draggable
          onDragStart={handleDragStartAtIndex(idx)}
          onDragOver={handleDragOverEntryAtIndex(idx)}
          onDragLeave={handleDragLeaveEntry}
          onDrop={handleDropOnEntryAtIndex(idx)}
          role="listitem"
          tabIndex={0}
        >
          <Tooltip text={entry.latex}>
            <MathView node={entry.node} />
          </Tooltip>
          <div className={styles.meta}>
            <span>{entry.draggedCount}×</span>
          </div>
          <button
            className={styles.entryDeleteButton}
            title="Delete entry"
            onClick={() => {
              // Create a new collection array with the entry removed from the active collection
              const updatedCollections = collections.map((coll) => {
                if (coll.id !== activeColl) return coll; // unchanged
                return {
                  ...coll,
                  entries: coll.entries.filter((e) => e.id !== entry.id),
                };
              });
              setCollections(updatedCollections);
            }}  
          >
            ✕
          </button>
        </div>
      ))}
      {filteredEntries.length === 0 && (
        collection.entries.length === 0 
          ? <p className={styles.empty}>Drag math expression here</p>
          : <p className={styles.empty}>No matches found</p>
      )}
      {dropTarget &&
        dropTarget.cellId === "library" &&
        dropTarget.containerId === activeColl &&
        dropTarget.index === null && <div className={styles.dropTargetEnd} />}
    </div>
  );
};

export default React.memo(LibraryEntries);
