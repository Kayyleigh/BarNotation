// // components/mathLibrary/MathLibrary.tsx
// import { useEffect, useState, useCallback, useTransition } from "react";
// import LibCollectionArchiveModal from "../modals/LibCollectionArchiveModal";
// import LibraryEntries from "./LibraryEntries";
// import type { LibraryCollection, LibraryEntry } from "../../models/libraryTypes";
// import { createPremadeCollections } from "../../utils/collectionUtils";
// import { useToast } from "../../hooks/toast/useToast";
// import styles from "./MathLibrary.module.css";
// import CollectionTabs from "./CollectionTabs";
// import SearchBar from "../common/SearchBar";
// import type { DropSource, DropTarget } from "../layout/EditorWorkspace";
// import { useDragContext } from "../../hooks/mathDrag/useDragContext";
// import { nodeToLatex } from "../../models/nodeToLatex";
// import { parseLatex } from "../../models/latexParser";
// import React from "react";
// import { SortDropdown } from "../common/SortDropdown";
// import { useI18n } from "../../i18n/useI18n";

// const STORAGE_KEY = "mathLibraryCollections";
// const ACTIVE_COLL_KEY = "mathLibraryActiveCollection";
// const SORT_OPTION_KEY = "mathLibrarySortOption";

// export type SortOption =
//   | "date"
//   | "date-asc"
//   | "usage"
//   | "usage-asc"
//   | "latex"
//   | "latex-desc";

// interface MathLibraryProps {
//   onDropNode: (from: DropSource, to: DropTarget) => void;
//   updateEntryRef: React.RefObject<(id: string) => void>; //unused?
// }

// const MathLibrary: React.FC<MathLibraryProps> = ({
//   updateEntryRef,
// }) => {
//   const { t } = useI18n(); // use language hook

//   const { showToast } = useToast();

//   // React 18 startTransition hook for deferred updates
//   const [, startTransition] = useTransition();

//   // Collections state
//   const [collections, setCollections] = useState<LibraryCollection[]>(() => {
//     try {
//       const stored = localStorage.getItem(STORAGE_KEY);
//       if (stored) {
//         const parsed: LibraryCollection[] = JSON.parse(stored);
//         parsed.forEach((c) =>
//           c.entries.forEach((e) => {
//             if (typeof e.addedAt === "string") {
//               e.addedAt = new Date(e.addedAt).getTime();
//             }
//           })
//         );
//         return parsed;
//       }
//     } catch {
//       showToast({
//         type: "error",
//         message: t("mathLibrary.error.loadStorage")
//       });
//     }
//     return createPremadeCollections(t);
//   });

//   // // THIS HAS TO GO THROUGH THE PARSIGN AGAIN!!! ONLY USE IF NEEDED
//   // const [collections, setCollections] = useState<LibraryCollection[]>(() => {
//   //   try {
//   //     const stored = localStorage.getItem(STORAGE_KEY);
//   //     const storedCollections: LibraryCollection[] = stored ? JSON.parse(stored) : [];

//   //     // Fix addedAt if stored
//   //     storedCollections.forEach((c) =>
//   //       c.entries.forEach((e) => {
//   //         if (typeof e.addedAt === "string") {
//   //           e.addedAt = new Date(e.addedAt).getTime();
//   //         }
//   //       })
//   //     );

//   //     // Load the current premade collections
//   //     const premade = createPremadeCollections(t);

//   //     // Make a Set of existing collection IDs
//   //     const existingIds = new Set(storedCollections.map(c => c.id));

//   //     // Add only the new premade collections
//   //     const merged = [
//   //       ...storedCollections,
//   //       ...premade.filter(c => !existingIds.has(c.id))
//   //     ];

//   //     return merged;
//   //   } catch {
//   //     showToast({
//   //       type: "error",
//   //       message: t("mathLibrary.error.loadStorage")
//   //     });

//   //     // On error, just fall back to premade
//   //     return createPremadeCollections(t);
//   //   }
//   // });

//   // Active collection id state
//   const [activeColl, setActiveColl] = useState<string>(() => {
//     try {
//       const storedId = localStorage.getItem(ACTIVE_COLL_KEY);
//       const valid = collections.find((c) => c.id === storedId && !c.archived);
//       if (valid) return valid.id;

//       const first = collections.find((c) => !c.archived);
//       return first ? first.id : "";
//     } catch {
//       const first = collections.find((c) => !c.archived);
//       return first ? first.id : "";
//     }
//   });;

//   // Loading state for collection entries
//   const [loadingCollection, setLoadingCollection] = useState(true);

//   // Wrap active collection setter in startTransition for smooth UI updates
//   const changeActiveCollection = (newId: string) => {
//     setLoadingCollection(true);
//     startTransition(() => {
//       setActiveColl(newId);
//     });
//   };

//   useEffect(() => {
//     try {
//       localStorage.setItem(ACTIVE_COLL_KEY, activeColl);
//     } catch {
//       showToast({
//         type: "error",
//         message: t("mathLibrary.error.saveStorage")
//       });
//     }
//   }, [activeColl, showToast, t]);  

//   useEffect(() => {
//     if (!loadingCollection) return; // Only set fallback if loading is active

//     const timer = setTimeout(() => {
//       setLoadingCollection(false);
//     }, 0);

//     return () => clearTimeout(timer);
//   }, [activeColl, loadingCollection]);

//   const [editingCollId, setEditingCollId] = useState<string | null>(null);
//   const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
//   const [archiveModalOpen, setArchiveModalOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Sort option (remember across sessions)
//   const [sortOption, setSortOption] = useState<SortOption>(() => {
//     const stored = localStorage.getItem(SORT_OPTION_KEY);
//     const validOptions: SortOption[] = [
//       "date",
//       "date-asc",
//       "usage",
//       "usage-asc",
//       "latex",
//       "latex-desc"
//     ];
//     if (stored && validOptions.includes(stored as SortOption)) {
//       return stored as SortOption;
//     }
//     return "date"; // default fallback
//   });

//   // Drag context from provider
//   const { draggingSource, setDraggingSource, setDropTarget } =
//     useDragContext();

//   // Save collections on changes
//   useEffect(() => {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
//     } catch {

//       showToast({
//         type: "error",
//         message: t("mathLibrary.error.saveStorage")
//       });
//     }
//   }, [collections, showToast, t]);

//   // Archive modal open handler
//   useEffect(() => {
//     if (menuOpenFor === "archive") {
//       setArchiveModalOpen(true);
//       setMenuOpenFor(null);
//     }
//   }, [menuOpenFor]);

//   // Update entries in a collection helper
//   const updateCollectionEntries = useCallback(
//     (collectionId: string, newEntries: LibraryEntry[]) => {
//       setCollections((prev) =>
//         prev.map((c) => (c.id === collectionId ? { ...c, entries: newEntries } : c))
//       );
//     },
//     []
//   );

//   // Update entry dragged count helper
//   const updateEntry = useCallback((id: string) => {
//     setCollections(prev => {
//       let changed = false;
//       const updated = prev.map(coll => {
//         const updatedEntries = coll.entries.map(e =>
//           e.id === id ? ((changed = true), { ...e, draggedCount: e.draggedCount + 1 }) : e
//         );
//         return changed ? { ...coll, entries: updatedEntries } : coll;
//       });
//       return changed ? updated : prev;
//     });
//   }, []);

//   useEffect(() => {
//     updateEntryRef.current = updateEntry;
//   }, [updateEntry, updateEntryRef]);

//   useEffect(() => {
//     try {
//       localStorage.setItem(SORT_OPTION_KEY, sortOption);
//     } catch {
//       showToast({
//         type: "error",
//         message: t("mathLibrary.error.saveStorage")
//       });
//     }
//   }, [sortOption, showToast, t]);

//   // Find collection by id helper
//   const findCollection = useCallback(
//     (id: string) => collections.find((c) => c.id === id),
//     [collections]
//   );

//   // Handle drop inside library //TODO this is where a lot needs to change 
//   const handleLibraryDrop = useCallback(
//     (e: React.DragEvent, dropCollectionId: string, dropIndex: number | null) => {
//       // Same logic as your original function
//       if (!draggingSource) {
//         const plainText = e.dataTransfer.getData("text/plain")?.trim();

//         if (!plainText) return;

//         const targetCollection = findCollection(dropCollectionId);
//         if (!targetCollection) return;

//         try {
//           const parsed = parseLatex(plainText);
//           const newEntry: LibraryEntry = {
//             id: crypto.randomUUID(),
//             node: parsed,
//             addedAt: Date.now(),
//             draggedCount: 0,
//             latex: plainText,
//           };

//           const updatedEntries = [...targetCollection.entries];
//           const insertIndex = dropIndex ?? updatedEntries.length;

//           updatedEntries.splice(insertIndex, 0, newEntry);

//           setCollections(prev =>
//             prev.map(c =>
//               c.id === targetCollection.id
//                 ? { ...c, entries: updatedEntries }
//                 : c
//             )
//           );

//           showToast({ type: "success", message: t("mathLibrary.success.addLatex") });
//         } catch (err) {
//           console.error("Invalid LaTeX dropped:", err);
//           showToast({ type: "error", message: t("mathLibrary.error.parseLatex") });
//         }

//         return;
//       }

//       if (
//         draggingSource.sourceType === "library" &&
//         draggingSource.cellId === dropCollectionId
//       ) {
//         return;
//       }

//       const targetCollection = findCollection(dropCollectionId);
//       if (!targetCollection) {
//         setDraggingSource(null);
//         setDropTarget(null);
//         return;
//       }

//       if (draggingSource.sourceType === "library") {
//         const sourceCollection = findCollection(draggingSource.cellId || "");
//         if (!sourceCollection) {
//           setDraggingSource(null);
//           setDropTarget(null);
//           return;
//         }

//         const sourceEntries = [...sourceCollection.entries];
//         const [movedEntry] = sourceEntries.splice(draggingSource.index, 1);

//         const targetEntries =
//           dropIndex !== null
//             ? [...targetCollection.entries]
//             : [...targetCollection.entries];

//         const insertIndex =
//           dropIndex !== null
//             ? dropIndex > sourceCollection.entries.length
//               ? sourceCollection.entries.length
//               : dropIndex
//             : targetEntries.length;

//         targetEntries.splice(insertIndex, 0, movedEntry);

//         setCollections((prev) =>
//           prev.map((c) => {
//             if (c.id === sourceCollection.id) return { ...c, entries: sourceEntries };
//             if (c.id === targetCollection.id) return { ...c, entries: targetEntries };
//             return c;
//           })
//         );

//         showToast({ type: "success", message: t("mathLibrary.success.entryMoved") }); //TODO maybe take arg to let user know which one? 
//       } else if (draggingSource.sourceType === "cell") {
//         const latex = draggingSource.node ? nodeToLatex(draggingSource.node) ?? "" : "";
//         const exists = targetCollection.entries.some(
//           (e) => e.latex === latex
//         );
//         if (exists) {
//           showToast({ type: "warning", message: t("mathLibrary.warning.entryExists") }); //TODO maybe take arg to let user know which one? 
//         } else {
//           const newEntry: LibraryEntry = {
//             id: crypto.randomUUID(),
//             node: draggingSource.node,
//             latex,
//             addedAt: Date.now(),
//             draggedCount: 0,
//           };
//           const newEntries = [...targetCollection.entries];
//           const insertIndex = dropIndex !== null ? dropIndex : newEntries.length;
//           newEntries.splice(insertIndex, 0, newEntry);

//           updateCollectionEntries(targetCollection.id, newEntries);
//           showToast({
//             type: "success",
//             message: t("mathLibrary.success.entryAddedTo", {
//               latex: newEntry.latex,
//               collection: targetCollection.name,
//             })
//           });
//         }
//       }

//       setDraggingSource(null);
//       setDropTarget(null);
//     },
//     [draggingSource, findCollection, setDraggingSource, setDropTarget, showToast, t, updateCollectionEntries]
//   );

//   const activeCollection = collections.find(c => c.id === activeColl);

//   const key = "premadeCollections." + activeCollection?.id

//   const translated = t(key);
//   const name = translated !== key ? translated : activeCollection?.name;

//   const placeholderText = activeCollection
//     ? t("mathLibrary.search.placeholderWith", { name })
//     : t("mathLibrary.search.placeholder");  

//   const sortOptions = [
//     { label: t("mathLibrary.sort.newest"), value: "date" },
//     { label: t("mathLibrary.sort.oldest"), value: "date-asc" },
//     { label: t("mathLibrary.sort.mostUsed"), value: "usage" },
//     { label: t("mathLibrary.sort.leastUsed"), value: "usage-asc" },
//     { label: t("mathLibrary.sort.aZ"), value: "latex" },
//     { label: t("mathLibrary.sort.zA"), value: "latex-desc" },
//   ];

//   const handleSetSearchTerm = useCallback((val: string) => {
//     setSearchTerm(val);
//   }, []);

//   const handleSortChange = useCallback((val: string) => {
//     setSortOption(val as SortOption);
//   }, []);

//   const handleDropEntryToCollection = useCallback(
//     (entry: LibraryEntry, collectionId: string) => {
//       const coll = findCollection(collectionId);
//       if (!coll) return;
//       const exists = coll.entries.some((e) => e.latex === entry.latex);
//       if (exists) {
//         showToast({
//           type: "warning",
//           message: t("mathLibrary.warning.entryExistsIn", {
//             latex: entry.latex,
//             collection: coll.name,
//           }),
//         });
//         return;
//       }
//       const newEntry = { ...entry, addedAt: Date.now(), draggedCount: 0 };
//       updateCollectionEntries(collectionId, [...coll.entries, newEntry]);
//       showToast({
//         type: "success",
//         message: t("mathLibrary.success.entryAddedTo", {
//           latex: entry.latex,
//           collection: coll.name,
//         }),
//       });
//     },
//     [findCollection, showToast, t, updateCollectionEntries]
//   );

//   const handleUnarchive = useCallback((id: string) => {
//     const unarchived = collections.find((c) => c.id === id);
//     setCollections((prev) =>
//       prev.map((c) => (c.id === id ? { ...c, archived: false } : c))
//     );
//     showToast({
//       type: "success",
//       message: t("mathLibrary.success.unarchived", {
//         name: unarchived?.name || t("mathLibrary.default.collection"),
//       }),
//     });
//   }, [collections, showToast, t]);

//   const handleDelete = useCallback((id: string) => {
//     const deleted = collections.find((c) => c.id === id);
//     setCollections((prev) => prev.filter((c) => c.id !== id));
//     showToast({
//       type: "success",
//       message: t("mathLibrary.success.deleted", {
//         name: deleted?.name || t("mathLibrary.default.collection"),
//       }),
//     });
//   }, [collections, showToast, t]);

//   const handleCloseArchiveModal = useCallback(() => {
//     setArchiveModalOpen(false);
//   }, []);


//   const memoizedOnDrop = useCallback(
//     (e: React.DragEvent<Element>, dropIndex: number | null) => {
//       e.preventDefault();
//       console.log(`In line 896 of MathLibrary; memoizedOnDrop`)
//       handleLibraryDrop(e, activeColl, dropIndex);
//     },
//     [handleLibraryDrop, activeColl]
//   );

//   return (
//     <div className={styles.libraryContainer}>
//       <CollectionTabs
//         collections={collections}
//         activeColl={activeColl}
//         setActiveColl={changeActiveCollection}
//         editingCollId={editingCollId}
//         setEditingCollId={setEditingCollId}
//         setCollections={setCollections}
//         menuOpenFor={menuOpenFor}
//         setMenuOpenFor={setMenuOpenFor}
//         onDropEntryToCollection={handleDropEntryToCollection}
//       />

//       <div className={styles.controls}>
//         <SearchBar
//           placeholder={placeholderText}
//           value={searchTerm}
//           onChange={handleSetSearchTerm}
//           className={styles.librarySearch}
//           tooltip={t("mathLibrary.search.tooltip")}
//         />
//         <SortDropdown
//           options={sortOptions}
//           value={sortOption}
//           onChange={handleSortChange}
//           className={styles.sortDropdown}
//           aria-label={t("mathLibrary.sort.ariaLabel")}
//         />
//       </div>

//       {activeColl ? (
//         loadingCollection ? (
//           <div className={styles.loadingContainer}>
//             <div className={styles.spinner} />
//             <p className={styles.loadingText}>{t("mathLibrary.loading")}</p>
//           </div>
//         ) : (
//           <LibraryEntries
//             onRendered={() => setLoadingCollection(false)} // TODO optional: can also be memoized
//             collections={collections}
//             setCollections={setCollections}
//             activeColl={activeColl}
//             sortOption={sortOption}
//             searchTerm={searchTerm}
//             onDrop={memoizedOnDrop}
//           />
//         )
//       ) : (
//         <p>{t("mathLibrary.empty")}</p>
//       )}

//       {archiveModalOpen && (
//         <LibCollectionArchiveModal
//           archived={collections.filter((c) => c.archived)}
//           onClose={handleCloseArchiveModal}
//           onUnarchive={handleUnarchive}
//           onDelete={handleDelete}
//         />
//       )}
//     </div>
//   );  
// };

// export default React.memo(MathLibrary);

// components/MathLibrary.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { MathNodeLibrary, LibraryCollection, LibraryEntry } from "../../models/libraryTypes";
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
import { useDragContext } from "../../hooks/mathDrag/useDragContext";
import { useToast } from "../../hooks/toast/useToast";

interface MathLibraryProps {
  library: MathNodeLibrary;
  setLibrary: React.Dispatch<React.SetStateAction<MathNodeLibrary>>;
  updateEntryRef: React.RefObject<(id: string) => void>;
}

const MathLibrary: React.FC<MathLibraryProps> = ({ library, setLibrary, updateEntryRef }) => {
  const { t } = useI18n();
  const { showToast } = useToast();

  // === STATE ===
  const [activeCollId, setActiveCollId] = useState<string | null>(() => {
    try {
      const storedId = localStorage.getItem(ACTIVE_COLL_KEY);
      const storedCollection = storedId ? library.collections[storedId] : null;

      if (storedCollection && !storedCollection.archivedAt && !storedCollection.deletedAt) {
        return storedId;
      }

      // fallback to "premade-structures" if available and not archived/deleted
      const defaultColl = library.collections["premade-structures"];
      if (defaultColl && !defaultColl.archivedAt && !defaultColl.deletedAt) {
        return "premade-structures";
      }

      // fallback: none
      return null;
    } catch {
      const defaultColl = library.collections["premade-structures"];
      return defaultColl && !defaultColl.archivedAt && !defaultColl.deletedAt
        ? "premade-structures"
        : null;
    }
  });

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
  const { draggingSource, setDraggingSource } = useDragContext();

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

  // === DERIVED ===
  const collections = useMemo(
    () => Object.values(library.collections).filter((c) => !c.deletedAt),
    [library]
  );
  const activeColl: LibraryCollection | null = activeCollId
    ? library.collections[activeCollId] ?? null
    : null;

  // === HANDLERS ===
  const changeActiveCollection = useCallback((id: string) => {
    setActiveCollId(id);
    setLoadingCollection(true);
  }, []);

  const handleSetSearchTerm = useCallback((term: string) => setSearchTerm(term), []);

  const handleSortChange = useCallback((opt: string) => setSortOption(opt), []);

  const handleDropOnLibrary = useCallback(() => {
    if (!activeColl || !draggingSource) return;

    const latex = nodeToLatex(draggingSource.node, false);
    if (!latex) {
      showToast({ type: "error", message: t("mathLibrary.entries.toast.invalidLatex") });
      return;
    }

    let success = false;

    setLibrary((lib) => {
      try {
        const updated = addEntryToCollection(lib, activeColl.id, latex, draggingSource.node);
        success = true;
        return updated;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("mathLibrary.entries.toast.failed");
        showToast({ type: "error", message }); //BUG? of duplication toast
        return lib; // keep unchanged
      }
    });

    setDraggingSource(null);

    if (success) {
      showToast({ type: "success", message: t("mathLibrary.entries.toast.added") });
    }
  }, [activeColl, draggingSource, setLibrary, setDraggingSource, showToast, t]);

  const handleUnarchive = useCallback((collectionId: string) => {
    try {
      setLibrary((lib) => {
        const col = lib.collections[collectionId];
        if (!col) throw new Error(t("mathLibrary.collections.toast.notFound"));
        return {
          ...lib,
          collections: {
            ...lib.collections,
            [collectionId]: { ...col, archivedAt: undefined },
          },
        };
      });
      showToast({ type: "success", message: t("mathLibrary.collections.toast.unarchived") });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("mathLibrary.collections.toast.failed");
      showToast({ type: "error", message });
    }
  }, [setLibrary, showToast, t]);

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
            onRendered={() => setLoadingCollection(false)}
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

export default MathLibrary;