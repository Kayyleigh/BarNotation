// components/mathLibrary/LibraryEntries.tsx
import React, { useMemo, useCallback, useEffect } from "react";
import { useDragContext } from "../../hooks/useDragContext";
import type { LibraryCollection } from "../../models/libraryTypes";
import styles from "./MathLibrary.module.css";
import type { SortOption } from "./MathLibrary";
import MathView from "../mathExpression/MathView";
import Tooltip from "../tooltips/Tooltip";

interface LibraryEntriesProps {
  collections: LibraryCollection[];
  setCollections: React.Dispatch<React.SetStateAction<LibraryCollection[]>>;
  activeColl: string;
  sortOption: SortOption;
  searchTerm: string;
  onDrop: (e: React.DragEvent, dropIndex: number | null) => void;
  onRendered?: () => void;
}

interface LibraryEntryItemProps {
  entry: LibraryCollection["entries"][0];
  isDropTarget: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDelete: () => void;
}

const LibraryEntryItem: React.FC<LibraryEntryItemProps> = React.memo(
  ({ entry, isDropTarget, onDragStart, onDragOver, onDragLeave, onDelete }) => {
    return (
      <div
        className={`${styles.libraryEntry} ${isDropTarget ? styles.dropTarget : ""}`}
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="listitem"
        tabIndex={0}
      >
        <Tooltip text={entry.latex}>
          <MathView node={entry.node} showPlaceHolder={true} />
        </Tooltip>
        <div className={styles.meta}>
          <span>{entry.draggedCount}×</span>
        </div>
        <button
          className={styles.entryDeleteButton}
          title="Delete entry"
          onClick={onDelete}
        >
          ✕
        </button>
      </div>
    );
  }
);

const LibraryEntries: React.FC<LibraryEntriesProps> = ({
  collections,
  setCollections,
  activeColl,
  sortOption,
  searchTerm,
  onDrop,
  onRendered,
}) => {
  console.warn(`Rendering LibraryEntries`);

  const { draggingNode, setDraggingNode, dropTarget, setDropTarget } = useDragContext();

  // Find the active collection
  const collection = collections.find((c) => c.id === activeColl);

  // Compute filtered and sorted entries, always return an array (empty if no collection)
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

  // Drag and drop handlers — hooks must be declared unconditionally here

  const handleDragStartAtIndex = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.stopPropagation();
      const entry = filteredEntries[index];
      if (!entry) return;

      setDraggingNode({
        sourceType: "library",
        cellId: activeColl,
        containerId: entry.id,
        index,
        node: entry.node,
      });
      setDropTarget(null);
      e.dataTransfer.effectAllowed = "move";

      const latexText = entry.latex || "";
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

  // const handleDropOnEntryAtIndex = useCallback(
  //   (index: number) => (e: React.DragEvent) => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     onDrop(e, index);
  //     setDraggingNode(null);
  //     setDropTarget(null);
  //   },
  //   [onDrop, setDraggingNode, setDropTarget]
  // );

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
        index: filteredEntries.length, // drop at end
      });
      e.dataTransfer.dropEffect = "move";
    },
    [draggingNode, activeColl, filteredEntries.length, setDropTarget]
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

  // Memoize arrays of handlers per entry index to avoid recreating inline functions each render
  const dragStartHandlers = useMemo(
    () => filteredEntries.map((_, idx) => handleDragStartAtIndex(idx)),
    [filteredEntries, handleDragStartAtIndex]
  );
  const dragOverHandlers = useMemo(
    () => filteredEntries.map((_, idx) => handleDragOverEntryAtIndex(idx)),
    [filteredEntries, handleDragOverEntryAtIndex]
  );
  // const dropHandlers = useMemo(
  //   () => filteredEntries.map((_, idx) => handleDropOnEntryAtIndex(idx)),
  //   [filteredEntries, handleDropOnEntryAtIndex]
  // );

  useEffect(() => {
    if (filteredEntries.length > 0 || collection?.entries.length === 0) {
      onRendered?.();
    }
  }, [filteredEntries, collection?.entries.length, onRendered]);
  

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
        <LibraryEntryItem
          key={entry.id}
          entry={entry}
          isDropTarget={
            dropTarget?.cellId === "library" &&
            dropTarget.containerId === activeColl &&
            dropTarget.index === idx
          }
          onDragStart={dragStartHandlers[idx]}
          onDragOver={dragOverHandlers[idx]}
          onDragLeave={handleDragLeaveEntry}
          onDelete={() => {
            const updatedCollections = collections.map((coll) => {
              if (coll.id !== activeColl) return coll;
              return {
                ...coll,
                entries: coll.entries.filter((e) => e.id !== entry.id),
              };
            });
            setCollections(updatedCollections);
          }}
          // onDrop={dropHandlers[idx]}
        />
      ))}
      {filteredEntries.length === 0 &&
        (collection.entries.length === 0 ? (
          <p className={styles.empty}>Drag math expression here</p>
        ) : (
          <p className={styles.empty}>No matches found</p>
        ))}
      {dropTarget?.cellId === "library" &&
        dropTarget.containerId === activeColl &&
        dropTarget.index === null && <div className={styles.dropTargetEnd} />}
    </div>
  );
};

export default React.memo(LibraryEntries);
