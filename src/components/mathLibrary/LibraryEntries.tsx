// import React, { useMemo, useRef } from "react";
// import { useDragContext } from "../../hooks/useDragContext";
// import { parseLatex } from "../../models/latexParser";
// import { nodeToLatex } from "../../models/nodeToLatex";
// import { MathView } from "../mathExpression/MathView";
// import type { LibraryCollection, LibraryEntry } from "../../models/libraryTypes";
// import styles from "./MathLibrary.module.css";
// import type { SortOption } from "./MathLibrary";

// interface LibraryEntriesProps {
//   collections: LibraryCollection[];
//   activeColl: string;
//   setCollections: React.Dispatch<React.SetStateAction<LibraryCollection[]>>;
//   sortOption: SortOption;
//   searchTerm: string;
// }

// const LibraryEntries: React.FC<LibraryEntriesProps> = ({
//   collections,
//   activeColl,
//   setCollections,
//   searchTerm,
// }) => {
//   const { draggingNode, setDraggingNode, dropTarget, setDropTarget } = useDragContext();

//   const activeCollection = collections.find(c => c.id === activeColl && !c.archived);
//   const dropInsertionRef = useRef<number | null>(null);

//   const entries = useMemo(() => {
//     if (!activeCollection) return [];
//     // Filter and sort (same as before)
//     const filtered = activeCollection.entries.filter(e =>
//       e.latex.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     // sorting logic here ...
//     return filtered;
//   }, [activeCollection, searchTerm]);

//   const updateEntries = (newEntries: LibraryEntry[]) => {
//     if (!activeCollection) return;
//     setCollections(prev =>
//       prev.map(c => (c.id === activeCollection.id ? { ...c, entries: newEntries } : c))
//     );
//   };

//   // Drag start: set draggingNode with full info, set drag payload to LaTeX string
//   const onEntryDragStart = (e: React.DragEvent, index: number, entry: LibraryEntry) => {
//     const dragData = {
//       sourceType: "library" as const,
//       cellId: activeCollection!.id,
//       containerId: entry.id,
//       index,
//       node: entry.node,
//     };
//     setDraggingNode(dragData);
//     e.dataTransfer.setData("text/plain", nodeToLatex(entry.node));
//     e.dataTransfer.effectAllowed = "copy";
//   };

//   // Drag over an entry: set dropTarget index
//   const onEntryDragOver = (e: React.DragEvent, index: number) => {
//     e.preventDefault();
//     setDropTarget({ cellId: activeColl, containerId: activeColl, index });
//     dropInsertionRef.current = index;
//   };

//   // Drag over empty container space (below all entries)
//   const onContainerDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDropTarget({ cellId: activeColl, containerId: activeColl, index: entries.length });
//     dropInsertionRef.current = entries.length;
//   };

//   // Drop event
//   const onContainerDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     if (!draggingNode) return;

//     // If dragging from library to same library collection - ignore
//     if (
//       draggingNode.sourceType === "library" &&
//       draggingNode.cellId === activeColl
//     ) {
//       // Just cancel
//       setDraggingNode(null);
//       setDropTarget(null);
//       dropInsertionRef.current = null;
//       return;
//     }

//     // If dragging external text (e.g., from outside app)
//     const latex = e.dataTransfer.getData("text/plain");
//     const node = latex ? parseLatex(latex) : null;

//     if (!node) {
//       // No valid node to add
//       setDraggingNode(null);
//       setDropTarget(null);
//       dropInsertionRef.current = null;
//       return;
//     }

//     // Build new entry
//     const newEntry: LibraryEntry = {
//       id: crypto.randomUUID(),
//       node,
//       latex,
//       addedAt: Date.now(),
//       draggedCount: 0,
//     };

//     // Insert at drop index (or append)
//     const insertIndex = dropInsertionRef.current ?? entries.length;
//     const newEntries = [...entries];
//     newEntries.splice(insertIndex, 0, newEntry);
//     updateEntries(newEntries);

//     // Cleanup
//     setDraggingNode(null);
//     setDropTarget(null);
//     dropInsertionRef.current = null;
//   };

//   const onEntryDragEnd = () => {
//     setDraggingNode(null);
//     setDropTarget(null);
//     dropInsertionRef.current = null;
//   };

//   if (!activeCollection) {
//     return <div className={styles.libraryEmpty}>No active collection selected.</div>;
//   }

//   return (
//     <div
//       className={styles.libraryDropZone}
//       onDragOver={onContainerDragOver}
//       onDrop={onContainerDrop}
//     >
//       {entries.length === 0 && (
//         <p className={styles.empty}>Drag math expression here</p>
//       )}
//       {entries.map((entry, idx) => (
//         <div
//           key={entry.id}
//           draggable
//           onDragStart={e => onEntryDragStart(e, idx, entry)}
//           onDragOver={e => onEntryDragOver(e, idx)}
//           onDragEnd={onEntryDragEnd}
//           className={`${styles.libraryEntry} ${dropTarget?.index === idx ? styles.dropTarget : ""}`}
//           title={entry.latex}
//         >
//           <MathView node={entry.node} />
//           <button
//             className={styles.entryDeleteButton}
//             title="Delete entry"
//             onClick={() => updateEntries(entries.filter(e => e.id !== entry.id))}
//           >
//             ✕
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default LibraryEntries;

import React, { useMemo, useCallback } from "react";
import { useDragContext } from "../../hooks/useDragContext";
import type { LibraryCollection } from "../../models/libraryTypes";
import styles from "./MathLibrary.module.css";
import type { SortOption } from "./MathLibrary";
import { MathView } from "../mathExpression/MathView";

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
  const handleDragStart = useCallback(
    (e: React.DragEvent, entryIndex: number) => {
      e.stopPropagation();
      setDraggingNode({
        sourceType: "library",
        cellId: activeColl,
        containerId: filteredEntries[entryIndex].id,
        index: entryIndex,
        node: filteredEntries[entryIndex].node,
      });
      setDropTarget(null);
      e.dataTransfer.effectAllowed = "move";

      // Add latex to dataTransfer for external drops (fix for your issue)
      const latexText = filteredEntries[entryIndex].latex;
      if (latexText) {
        e.dataTransfer.setData("text/plain", latexText);
      } else {
        e.dataTransfer.setData("text/plain", "");
      }
    },
    [activeColl, filteredEntries, setDraggingNode, setDropTarget]
  );

  const handleDragOverEntry = useCallback(
    (e: React.DragEvent, index: number) => {
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

  const handleDragLeaveEntry = useCallback(() => {
    if (dropTarget?.cellId === "library") {
      setDropTarget(null);
    }
  }, [dropTarget, setDropTarget]);

  const handleDropOnEntry = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      onDrop(e, index);
      setDraggingNode(null);
      setDropTarget(null);
    },
    [onDrop, setDraggingNode, setDropTarget]
  );

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
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOverEntry(e, idx)}
          onDragLeave={handleDragLeaveEntry}
          onDrop={(e) => handleDropOnEntry(e, idx)}
          role="listitem"
          tabIndex={0}
        >
          <MathView node={entry.node} />
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

export default LibraryEntries;
