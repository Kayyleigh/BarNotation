// // components/mathLibrary/LibraryEntries.tsx
// import React, { useMemo, useCallback, useEffect } from "react";
// import { useDragContext } from "../../hooks/mathDrag/useDragContext";
// import type { LibraryCollection } from "../../models/libraryTypes";
// import styles from "./MathLibrary.module.css";
// import type { SortOption } from "./MathLibrary";
// import MathView from "../mathExpression/MathView";
// import Tooltip from "../tooltips/Tooltip";
// import { useI18n } from "../../i18n/useI18n";

// interface LibraryEntriesProps {
//   collections: LibraryCollection[];
//   setCollections: React.Dispatch<React.SetStateAction<LibraryCollection[]>>;
//   activeColl: string;
//   sortOption: SortOption;
//   searchTerm: string;
//   onDrop: (e: React.DragEvent, dropIndex: number | null) => void;
//   onRendered?: () => void;
// }

// interface LibraryEntryItemProps {
//   entry: LibraryCollection["entries"][0];
//   isDropTarget: boolean;
//   onDragStart: (e: React.DragEvent) => void;
//   onDragOver: (e: React.DragEvent) => void;
//   onDragLeave: () => void;
//   onDelete: () => void;
// }

// const LibraryEntryItem: React.FC<LibraryEntryItemProps> = React.memo(
//   ({ entry, isDropTarget, onDragStart, onDragOver, onDragLeave, onDelete }) => {
//     const { t } = useI18n(); // use language hook
//     return (
//       <div
//         className={`${styles.libraryEntry} ${isDropTarget ? styles.dropTarget : ""}`}
//         draggable
//         onDragStart={onDragStart}
//         onDragOver={onDragOver}
//         onDragLeave={onDragLeave}
//         role="listitem"
//         tabIndex={0}
//       >
//         <Tooltip text={entry.latex}>
//           <MathView node={entry.node} showPlaceHolder={true} />
//         </Tooltip>
//         <div className={styles.meta}>
//           <span>{entry.draggedCount}×</span>
//         </div>
//         <button
//           className={styles.entryDeleteButton}
//           title={t("mathLibrary.entries.deleteEntry")}
//           onClick={onDelete}
//         >
//           ✕
//         </button>
//       </div>
//     );
//   }
// );

// const LibraryEntries: React.FC<LibraryEntriesProps> = ({
//   collections,
//   setCollections,
//   activeColl,
//   sortOption,
//   searchTerm,
//   onDrop,
//   onRendered,
// }) => {
//   const { t } = useI18n(); // use language hook

//   const { draggingNode, setDraggingNode, dropTarget, setDropTarget } = useDragContext();

//   // Find the active collection
//   const collection = collections.find((c) => c.id === activeColl);

//   // Compute filtered and sorted entries, always return an array (empty if no collection)
//   const filteredEntries = useMemo(() => {
//     if (!collection) return [];

//     let filtered = collection.entries;

//     if (searchTerm.trim() !== "") {
//       const lower = searchTerm.toLowerCase();
//       filtered = filtered.filter((e) => e.latex.toLowerCase().includes(lower));
//     }

//     switch (sortOption) {
//       case "date":
//         filtered = filtered.slice().sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
//         break;
//       case "date-asc":
//         filtered = filtered.slice().sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
//         break;
//       case "usage":
//         filtered = filtered.slice().sort((a, b) => (b.draggedCount || 0) - (a.draggedCount || 0));
//         break;
//       case "usage-asc":
//         filtered = filtered.slice().sort((a, b) => (a.draggedCount || 0) - (b.draggedCount || 0));
//         break;
//       case "latex":
//         filtered = filtered.slice().sort((a, b) => a.latex.localeCompare(b.latex));
//         break;
//       case "latex-desc":
//         filtered = filtered.slice().sort((a, b) => b.latex.localeCompare(a.latex));
//         break;
//     }

//     return filtered;
//   }, [collection, searchTerm, sortOption]);

//   // Drag and drop handlers — hooks must be declared unconditionally here

//   const handleDragStartAtIndex = useCallback(
//     (index: number) => (e: React.DragEvent) => {
//       e.stopPropagation();
//       const entry = filteredEntries[index];
//       if (!entry) return;

//       setDraggingNode({
//         sourceType: "library",
//         cellId: activeColl,
//         containerId: entry.id,
//         index,
//         node: entry.node,
//       });
//       setDropTarget(null);
//       e.dataTransfer.effectAllowed = "move";

//       const latexText = entry.latex || "";
//       e.dataTransfer.setData("text/plain", latexText);
//     },
//     [activeColl, filteredEntries, setDraggingNode, setDropTarget]
//   );

//   const handleDragOverEntryAtIndex = useCallback(
//     (index: number) => (e: React.DragEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       if (!draggingNode) return;
//       setDropTarget({
//         cellId: "library",
//         containerId: activeColl,
//         index,
//       });
//       e.dataTransfer.dropEffect = "move";
//     },
//     [draggingNode, activeColl, setDropTarget]
//   );

//   const handleDragLeaveEntry = useCallback(() => {
//     if (dropTarget?.cellId === "library") {
//       setDropTarget(null);
//     }
//   }, [dropTarget, setDropTarget]);

//   const handleDragOverListEnd = useCallback(
//     (e: React.DragEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       if (!draggingNode) return;
//       setDropTarget({
//         cellId: "library",
//         containerId: activeColl,
//         index: filteredEntries.length, // drop at end
//       });
//       e.dataTransfer.dropEffect = "move";
//     },
//     [draggingNode, activeColl, filteredEntries.length, setDropTarget]
//   );

//   const handleDropOnListEnd = useCallback(
//     (e: React.DragEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       onDrop(e, null);
//       setDraggingNode(null);
//       setDropTarget(null);
//     },
//     [onDrop, setDraggingNode, setDropTarget]
//   );

//   // Memoize arrays of handlers per entry index to avoid recreating inline functions each render
//   const dragStartHandlers = useMemo(
//     () => filteredEntries.map((_, idx) => handleDragStartAtIndex(idx)),
//     [filteredEntries, handleDragStartAtIndex]
//   );
//   const dragOverHandlers = useMemo(
//     () => filteredEntries.map((_, idx) => handleDragOverEntryAtIndex(idx)),
//     [filteredEntries, handleDragOverEntryAtIndex]
//   );

//   useEffect(() => {
//     if (filteredEntries.length > 0 || collection?.entries.length === 0) { //TODO??
//       onRendered?.();
//     }
//   }, [filteredEntries, collection?.entries.length, onRendered]);


//   if (!collection) return null;


//   return (
//     <div
//       className={styles.libraryDropZone}
//       onDragOver={handleDragOverListEnd}
//       onDrop={handleDropOnListEnd}
//       role="list"
//       aria-label={t("mathLibrary.entries.ariaLabel", { name: collection.name })} 
//     >
//       {filteredEntries.map((entry, idx) => (
//         <LibraryEntryItem
//           key={entry.id}
//           entry={entry}
//           isDropTarget={
//             dropTarget?.cellId === "library" &&
//             dropTarget.containerId === activeColl &&
//             dropTarget.index === idx
//           }
//           onDragStart={dragStartHandlers[idx]}
//           onDragOver={dragOverHandlers[idx]}
//           onDragLeave={handleDragLeaveEntry}
//           onDelete={() => {
//             const updatedCollections = collections.map((coll) => {
//               if (coll.id !== activeColl) return coll;
//               return {
//                 ...coll,
//                 entries: coll.entries.filter((e) => e.id !== entry.id),
//               };
//             });
//             setCollections(updatedCollections);
//           }}
//           // onDrop={dropHandlers[idx]}
//         />
//       ))}
//       {filteredEntries.length === 0 &&
//         (collection.entries.length === 0 ? (
//           <p className={styles.empty}>{t("mathLibrary.entries.empty")}</p>
//         ) : (
//           <p className={styles.empty}>{t("mathLibrary.entries.noMatches")}</p>
//         ))}
//       {dropTarget?.cellId === "library" &&
//         dropTarget.containerId === activeColl &&
//         dropTarget.index === null && <div className={styles.dropTargetEnd} />}
//     </div>
//   );
// };

// export default React.memo(LibraryEntries);

// components/mathLibrary/LibraryEntries.tsx
import React, { useMemo, useCallback, useEffect } from "react";
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
} from "../../utils/mathLibraryUtils";
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
  isDropTarget: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDelete: () => void;
  showDeleteButton: boolean;
}

const LibraryEntryItem: React.FC<LibraryEntryItemProps> = React.memo(
  ({ entry, localDragCount, isDropTarget, onDragStart, onDragOver, onDragLeave, onDelete, showDeleteButton }) => {
    const { t } = useI18n();

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
          <span>{localDragCount}/{entry.globalDragCount}</span>
        </div>
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

  const { draggingNode, setDraggingNode, dropTarget, setDropTarget } = useDragContext();

  const entries = useMemo(
    () => getEntriesForCollection(library, activeCollId),
    [library, activeCollId]
  );

  const filteredSortedEntries = useMemo(() => {
    let filtered = entries;

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((e) => e.latex.toLowerCase().includes(lower));
    }

    switch (sortOption) {
      case "date":
        filtered = filtered
          .slice()
          .sort((a, b) => {
            const aMembership = getMembership(library, a.id, activeCollId);
            const bMembership = getMembership(library, b.id, activeCollId);
            return (bMembership?.addedAt || 0) - (aMembership?.addedAt || 0);
          });
        break;
      case "date-asc":
        filtered = filtered
          .slice()
          .sort((a, b) => {
            const aMembership = getMembership(library, a.id, activeCollId);
            const bMembership = getMembership(library, b.id, activeCollId);
            return (aMembership?.addedAt || 0) - (bMembership?.addedAt || 0);
          });
        break;
      case "usage-local":
        filtered = filtered
          .slice()
          .sort((a, b) => {
            const aMembership = getMembership(library, a.id, activeCollId);
            const bMembership = getMembership(library, b.id, activeCollId);
            return (bMembership?.dragCount || 0) - (aMembership?.dragCount || 0);
          });
        break;
      case "usage-local-asc":
        filtered = filtered
          .slice()
          .sort((a, b) => {
            const aMembership = getMembership(library, a.id, activeCollId);
            const bMembership = getMembership(library, b.id, activeCollId);
            return (aMembership?.dragCount || 0) - (bMembership?.dragCount || 0);
          });
        break;
      case "usage-global":
        filtered = filtered
          .slice()
          .sort((a, b) => {
            return (b.globalDragCount || 0) - (a.globalDragCount || 0);
          });
        break;
      case "usage-global-asc":
        filtered = filtered
          .slice()
          .sort((a, b) => {
            return (a.globalDragCount || 0) - (b.globalDragCount || 0);
          });
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

  // --- Drag & Drop handlers ---
  const handleDragStart = useCallback(
    (entry: LibraryEntry) => (e: React.DragEvent) => {
      e.stopPropagation();
      setDraggingNode({
        sourceType: "library",
        cellId: activeCollId,
        containerId: entry.id,
        node: entry.node,
        index: 0 // may be fucked
      });
      setDropTarget(null);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", entry.latex);
    },
    [activeCollId, setDraggingNode, setDropTarget]
  );

  const handleDragOverEntry = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggingNode) return;
      setDropTarget({
        cellId: "library",
        containerId: activeCollId,
        index: idx,
      });
      e.dataTransfer.dropEffect = "move";
    },
    [draggingNode, activeCollId, setDropTarget]
  );

  const handleDragLeave = useCallback(() => {
    if (dropTarget?.cellId === "library") setDropTarget(null);
  }, [dropTarget, setDropTarget]);

  const handleDropAtEnd = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggingNode) return;
      setDropTarget({ //THIS IS DOING A LOT OF STUFF: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
        cellId: "library",
        containerId: activeCollId,
        index: filteredSortedEntries.length,
      });
      e.dataTransfer.dropEffect = "move";
    },
    [draggingNode, activeCollId, filteredSortedEntries.length, setDropTarget]
  );

  const handleDrop = useCallback(() => {
    if (!draggingNode || !dropTarget) return;

    if (dropTarget.containerId !== activeCollId) {
      setDraggingNode(null);
      setDropTarget(null);
      return;
    }

    try { //TODO find out when this even fails
      onDrop(dropTarget.containerId);
      showToast({ type: "success", message: t("mathLibrary.entries.toast.added") });
    } catch (err: unknown) {
      let message: string;

      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      } else if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as Record<string, unknown>).message === "string"
      ) {
        // Fully safe extraction without using `any`
        message = (err as Record<string, string>).message;
      } else {
        message = t("mathLibrary.entries.toast.failed");
      }

      showToast({ type: "error", message });
    } finally {
      setDraggingNode(null);
      setDropTarget(null);
    }
  }, [draggingNode, dropTarget, activeCollId, setDraggingNode, setDropTarget, onDrop, showToast, t]);

  useEffect(() => {
    onRendered?.();
  }, [filteredSortedEntries, onRendered]);

  const activeCollection = library.collections[activeCollId];
  const isPremade = activeCollection?.type === "premade";

  return (
    <div
      className={styles.libraryDropZone}
      onDragOver={handleDropAtEnd}
      onDrop={handleDrop}
      role="list"
      aria-label={t("mathLibrary.entries.ariaLabel", { name: activeCollId })}
    >
      {filteredSortedEntries.map((entry, idx) => {
        const membership = getMembership(library, entry.id, activeCollId);

        return (
          <LibraryEntryItem
            key={entry.id}
            entry={entry}
            localDragCount={membership?.dragCount ?? 0}
            isDropTarget={
              dropTarget?.cellId === "library" &&
              dropTarget.containerId === activeCollId &&
              dropTarget.index === idx
            }
            onDragStart={handleDragStart(entry)}
            onDragOver={handleDragOverEntry(idx)}
            onDragLeave={handleDragLeave}
            onDelete={() =>
              setLibrary((lib) => removeEntryFromCollection(lib, entry.id, activeCollId))
            }
            showDeleteButton={!isPremade}
          />
        );
      })}

      {filteredSortedEntries.length === 0 && (
        <p className={styles.empty}>
          {entries.length === 0 ? t("mathLibrary.entries.empty") : t("mathLibrary.entries.noMatches")}
        </p>
      )}

      {dropTarget?.cellId === "library" && dropTarget.containerId === activeCollId && dropTarget.index === null && (
        <div className={styles.dropTargetEnd} />
      )}
    </div>
  );
};

export default React.memo(LibraryEntries);
