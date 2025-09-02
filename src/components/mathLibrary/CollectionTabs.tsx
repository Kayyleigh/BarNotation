// // components/mathLibrary/CollectionTabs.tsx
// import React, { useRef, useState, useCallback } from "react";
// import Tooltip from "../tooltips/Tooltip";
// import clsx from "clsx";
// import { useI18n } from "../../i18n/useI18n";
// import { useToast } from "../../hooks/toast/useToast";
// import { useDragContext } from "../../hooks/mathDrag/useDragContext";
// import TabDropdownPortal from "./TabDropdownPortal";
// import styles from "./MathLibrary.module.css";
// import type { LibraryCollection, MathNodeLibrary } from "../../models/libraryTypes";
// import {
//   duplicateCollection,
//   archiveCollection,
//   softDeleteCollection,
//   renameCollection,
//   copyEntryToCollection,
//   reorderCollections,
// } from "../../utils/mathLibraryUtils";

// interface CollectionTabsProps {
//   library: MathNodeLibrary;
//   setLibrary: React.Dispatch<React.SetStateAction<MathNodeLibrary>>;
//   collections: LibraryCollection[];
//   activeColl: string | null;
//   setActiveColl: (newId: string) => void;
//   editingCollId: string | null;
//   setEditingCollId: React.Dispatch<React.SetStateAction<string | null>>;
//   menuOpenFor: string | null;
//   setMenuOpenFor: React.Dispatch<React.SetStateAction<string | null>>;
// }

// const CollectionTabs: React.FC<CollectionTabsProps> = ({
//   library,
//   setLibrary,
//   collections,
//   activeColl,
//   setActiveColl,
//   editingCollId,
//   setEditingCollId,
//   menuOpenFor,
//   setMenuOpenFor,
// }) => {
//   const { t } = useI18n();
//   const { showToast } = useToast();
//   const { draggingSource, setDraggingSource, dropTarget, setDropTarget } = useDragContext();

//   const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
//   const [draggingTabIdx, setDraggingTabIdx] = useState<number | null>(null);
//   const dragOverTabIdx = useRef<number | null>(null);
//   const [dragOverPosition, setDragOverPosition] = useState<"left" | "right" | null>(null);
//   const renameInputRef = useRef<HTMLInputElement | null>(null);

//   const resetDragState = () => {
//     setDraggingTabIdx(null);
//     setDragOverPosition(null);
//     dragOverTabIdx.current = null;
//   };

//   // --- Tab reorder handlers (same logic) ---
//   const onTabDragStart = (e: React.DragEvent, idx: number) => {
//     setDraggingTabIdx(idx);
//     e.dataTransfer.effectAllowed = "move";
//   };

//   const onTabDragOver = (e: React.DragEvent, idx: number) => {
//     if (draggingTabIdx === null) return;
//     e.preventDefault();
//     const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//     setDragOverPosition(e.clientX < rect.left + rect.width / 2 ? "left" : "right");
//     dragOverTabIdx.current = idx;
//   };

//   const onTabDrop = (e: React.DragEvent, visibleIdx: number) => {
//     e.preventDefault();
//     if (draggingTabIdx === null) return;

//     const visibleTabs = collections.filter(c => !c.archivedAt);
//     let newIdx = dragOverPosition === "right" ? visibleIdx + 1 : visibleIdx;
//     if (draggingTabIdx < newIdx) newIdx--;

//     if (draggingTabIdx === newIdx) {
//       resetDragState();
//       return;
//     }

//     const fromId = visibleTabs[draggingTabIdx].id;
//     const toId = visibleTabs[newIdx].id;
//     const fromIndex = collections.findIndex(c => c.id === fromId);
//     const toIndex = collections.findIndex(c => c.id === toId);
//     if (fromIndex === -1 || toIndex === -1) return;

//     setLibrary(lib => reorderCollections(lib, fromIndex, toIndex));

//     resetDragState();
//   };

//   const onTabDragEnd = () => resetDragState();

//   // --- Collection actions via utils ---
//   const renameCollectionHandler = (id: string, newName: string) => {
//     try {
//       const coll = library.collections[id];
//       const oldName = getCollectionDisplayName(coll);

//       if (coll.type === "premade") {
//         showToast({ type: "error", message: t("mathLibrary.tabs.toast.cannotRenamePremade") });
//         return;
//       }
//       setLibrary(lib => renameCollection(lib, id, newName.trim()));
//       setEditingCollId(null);
//       showToast({ type: "success", message: t("mathLibrary.tabs.toast.renamed", {
//         oldName: oldName,
//         newName: newName,
//       })
//      });
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
//       showToast({ type: "error", message });
//     }
//   };

//   const duplicateCollectionHandler = useCallback((id: string) => {
//     const coll = library.collections[id];

//     setLibrary(lib => {
//       const collectionsArray = Object.values(lib.collections);
//       const originalIndex = collectionsArray.findIndex(c => c.id === id);
//       if (originalIndex === -1) return lib;

//       // Duplicate and place new collection right after original
//       const newLib = duplicateCollection(lib, id, t, undefined, originalIndex + 1);

//       // Find the new collection
//       const newColl = Object.values(newLib.collections).find(c => !lib.collections[c.id]);
//       if (newColl) {
//         setActiveColl(newColl.id); // select the duplicated collection //BUG: this does not work!
//       }

//       return newLib;
//     });

//     showToast({ type: "success", message: t("mathLibrary.tabs.toast.duplicated", {
//       name: coll ? getCollectionDisplayName(coll) : id,
//     })
//    });
//   }, [setLibrary, showToast, t, setActiveColl]); //React Hook useCallback has missing dependencies: 'getCollectionDisplayName' and 'library.collections'. Either include them or remove the dependency array.eslintreact-hooks/exhaustive-deps

//   const deleteCollectionHandler = useCallback((id: string) => {
//     try {
//       const coll = library.collections[id];
//       if (coll.type === "premade") {
//         showToast({ type: "error", message: t("mathLibrary.tabs.toast.cannotDeletePremade") });
//         return;
//       }
//       setLibrary(lib => softDeleteCollection(lib, id));
//       if (activeColl === id) {
//         const next = collections.find(c => c.id !== id && !c.archivedAt);
//         setActiveColl(next?.id || "");
//       }
//       showToast({ type: "success", message: t("mathLibrary.tabs.toast.deleted", {
//         name: coll ? getCollectionDisplayName(coll) : id,
//       })
//      });
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
//       showToast({ type: "error", message });
//     }
//   }, [library.collections, setLibrary, activeColl, showToast, t, collections, setActiveColl]); //React Hook useCallback has a missing dependency: 'getCollectionDisplayName'. Either include it or remove the dependency array.eslintreact-hooks/exhaustive-deps

//   const archiveCollectionHandler = useCallback((id: string) => {
//     try {
//       const coll = library.collections[id];

//       setLibrary(lib => archiveCollection(lib, id));
//       if (activeColl === id) {
//         const next = collections.find(c => c.id !== id && !c.archivedAt);
//         setActiveColl(next?.id || "");
//       }
//       showToast({ type: "success", message: t("mathLibrary.tabs.toast.archived", {
//         name: coll ? getCollectionDisplayName(coll) : id,
//       }) 
//     });
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
//       showToast({ type: "error", message });
//     }
//   }, [activeColl, collections, setActiveColl, setLibrary, showToast, t]); //TODO React Hook useCallback has missing dependencies: 'getCollectionDisplayName' and 'library.collections'. Either include them or remove the dependency array.eslintreact-hooks/exhaustive-deps

//   // --- Drop entry on tab ---
//   const onTabDragOverEntry = useCallback((e: React.DragEvent, collectionId: string) => {
//     if (!draggingSource) return;
//     e.preventDefault();
//     e.stopPropagation();
//     setDropTarget({ type: "libraryCollection", collectionId: collectionId });
//     e.dataTransfer.dropEffect = "move";
//   }, [draggingSource, setDropTarget]);

//   const onTabDropEntry = useCallback(
//     (e: React.DragEvent, collectionId: string) => {
//       e.preventDefault();
//       e.stopPropagation();
//       if (!draggingSource) return;

//       if (draggingSource.type === "library") {
//         let success = false;

//         setLibrary(prevLib => {
//           try {
//             const updated = copyEntryToCollection(prevLib, draggingSource.entryId, collectionId);
//             success = true;
//             return updated;
//           } catch (err: unknown) {
//             let message: string;
//             if (err instanceof Error) message = err.message;
//             else if (typeof err === "string") message = err;
//             else message = t("mathLibrary.tabs.toast.failed");

//             showToast({ type: "error", message });
//             return prevLib; // important: return previous state to prevent crash
//           }
//         });

//         if (success) {
//           showToast({ type: "success", message: t("mathLibrary.tabs.toast.duplicated") });
//         }

//       } else {
//         console.log("Want to drop a thing directly from editor", draggingSource);
//         showToast({
//           type: "info",
//           message: t("mathLibrary.tabs.toast.unsupportedDrop"),
//         });
//       }

//       setDraggingSource(null);
//       setDropTarget(null);
//     },
//     [draggingSource, setDraggingSource, setDropTarget, setLibrary, showToast, t]
//   );

//   //TODO PROBLEM: when moving this up and including it in the dependency arrays, it warns that it will cause re-renders all the time. I do not want that!
//   const getCollectionDisplayName = (c: LibraryCollection) =>
//     c.type === "premade" ? t(`premadeCollections.${c.id}`) : c.name || t("mathLibrary.tabs.default.collection");

//   // --- Render ---
//   return (
//     <div className={styles.tabRow}>
//       <div className={styles.tabHeaderLeft}>
//         {collections.filter(c => !c.archivedAt).map((c, idx) => {
//           const isDragOver = dragOverTabIdx.current === idx;
//           const isDropTarget =
//             dropTarget?.type === "libraryCollection" && dropTarget.collectionId === c.id;

//           return (
//             <div
//               key={c.id}
//               className={clsx(styles.tab, {
//                 [styles.active]: c.id === activeColl,
//                 [styles.dragging]: draggingTabIdx === idx,
//                 [styles.dragOverLeft]: isDragOver && dragOverPosition === "left",
//                 [styles.dragOverRight]: isDragOver && dragOverPosition === "right",
//                 [styles.dropTarget]: isDropTarget,
//               })}
//               draggable
//               onDragStart={e => onTabDragStart(e, idx)}
//               onDragOver={e => {
//                 onTabDragOver(e, idx);
//                 onTabDragOverEntry(e, c.id);
//               }}
//               onDrop={e => {
//                 onTabDrop(e, idx);
//                 onTabDropEntry(e, c.id);
//               }}
//               onDragEnd={onTabDragEnd}
//             >
//               {editingCollId === c.id ? (
//                 <div className={styles.collectionNameInput}>
//                   <input
//                     ref={renameInputRef}
//                     defaultValue={getCollectionDisplayName(c)}
//                     onBlur={e => renameCollectionHandler(c.id, e.target.value)}
//                     onKeyDown={e => {
//                       if (e.key === "Enter")
//                         renameCollectionHandler(
//                           c.id,
//                           (e.target as HTMLInputElement).value
//                         );
//                       if (e.key === "Escape") setEditingCollId(null);
//                     }}
//                     autoFocus
//                     disabled={c.type === "premade"} // Prevent editing premade
//                   />
//                 </div>
//               ) : (
//                 <button
//                   className={styles.collectionTab}
//                   onClick={() => setActiveColl(c.id)}
//                   onDoubleClick={() => {
//                     if (c.type === "custom") {
//                       setEditingCollId(c.id);
//                       setTimeout(() => renameInputRef.current?.focus(), 0);
//                     } else {
//                       showToast({
//                         type: "error",
//                         message: t("mathLibrary.tabs.toast.cannotRenamePremade"),
//                       });
//                     }
//                   }}
//                 >
//                   {getCollectionDisplayName(c)}
//                 </button>
//               )}

//               {/* Action buttons only when active and not in rename mode */}
//               {c.id === activeColl && editingCollId !== c.id && (
//                 <div className={styles.tabActions}>
//                   <button
//                     ref={el => {
//                       buttonRefs.current[c.id] = el;
//                     }}
//                     className={styles.collectionTabButton}
//                     title={t("mathLibrary.tabs.tooltip.moreOptions")}
//                     onClick={() =>
//                       setMenuOpenFor(c.id === menuOpenFor ? null : c.id)
//                     }
//                   >
//                     ⋯
//                   </button>

//                   {menuOpenFor === c.id && buttonRefs.current[c.id] && (
//                     <TabDropdownPortal
//                       anchorRef={{
//                         current: buttonRefs.current[c.id] as HTMLButtonElement,
//                       }}
//                       onRename={() => {
//                         if (c.type === "custom") {
//                           setEditingCollId(c.id);
//                         }
//                         setMenuOpenFor(null);
//                       }}
//                       onDuplicate={() => {
//                         duplicateCollectionHandler(c.id);
//                         setMenuOpenFor(null);
//                       }}
//                       onDelete={() => {
//                         if (
//                           c.type === "custom" &&
//                           window.confirm(t("mathLibrary.tabs.confirm.delete"))
//                         ) {
//                           deleteCollectionHandler(c.id);
//                         }
//                         setMenuOpenFor(null);
//                       }}
//                       onArchive={() => {
//                         archiveCollectionHandler(c.id);
//                         setMenuOpenFor(null);
//                       }}
//                       onClose={() => setMenuOpenFor(null)}
//                       disabledOptions={{
//                         rename: c.type !== "custom",
//                         delete: c.type !== "custom",
//                       }}
//                     />
//                   )}
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         <Tooltip text={t("mathLibrary.tabs.tooltip.new")}>
//           <button
//             className={styles.tabAdd}
//             onClick={() => {
//               const id = crypto.randomUUID();
//               const name = t("mathLibrary.tabs.defaultName");
//               setLibrary(lib => {
//                 const newCollection: LibraryCollection = {
//                   id,
//                   type: "custom",
//                   name,
//                   createdAt: Date.now(),
//                 };
//                 return {
//                   ...lib,
//                   collections: { ...lib.collections, [id]: newCollection },
//                 };
//               });
//               setActiveColl(id);
//               setEditingCollId(id);
//               setTimeout(() => renameInputRef.current?.focus(), 0);
//             }}
//           >
//             +
//           </button>
//         </Tooltip>
//       </div>

//       <div className={styles.tabHeaderRight}>
//         <Tooltip text={t("mathLibrary.tabs.tooltip.archive")}>
//           <button
//             className={styles.archiveButton}
//             onClick={() => setMenuOpenFor("archive")}
//           >
//             🗂️
//           </button>
//         </Tooltip>
//       </div>
//     </div>
//   );
// };

// export default React.memo(CollectionTabs);

// components/mathLibrary/CollectionTabs.tsx
import React, { useRef, useState, useCallback } from "react";
import Tooltip from "../tooltips/Tooltip";
import clsx from "clsx";
import { useI18n } from "../../i18n/useI18n";
import { useToast } from "../../hooks/toast/useToast";
import { useDragContext } from "../../hooks/mathDrag/useDragContext";
import TabDropdownPortal from "./TabDropdownPortal";
import styles from "./MathLibrary.module.css";
import type { LibraryCollection, MathNodeLibrary } from "../../models/libraryTypes";
import {
  duplicateCollection,
  archiveCollection,
  softDeleteCollection,
  renameCollection,
  copyEntryToCollection,
  reorderCollections,
} from "../../utils/mathLibraryUtils";

interface CollectionTabsProps {
  library: MathNodeLibrary;
  setLibrary: React.Dispatch<React.SetStateAction<MathNodeLibrary>>;
  collections: LibraryCollection[];
  activeColl: string | null;
  setActiveColl: (newId: string) => void;
  editingCollId: string | null;
  setEditingCollId: React.Dispatch<React.SetStateAction<string | null>>;
  menuOpenFor: string | null;
  setMenuOpenFor: React.Dispatch<React.SetStateAction<string | null>>;
}

const CollectionTabs: React.FC<CollectionTabsProps> = ({
  library,
  setLibrary,
  collections,
  activeColl,
  setActiveColl,
  editingCollId,
  setEditingCollId,
  menuOpenFor,
  setMenuOpenFor,
}) => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { draggingSource, setDraggingSource, dropTarget, setDropTarget } = useDragContext();

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [draggingTabIdx, setDraggingTabIdx] = useState<number | null>(null);
  const dragOverTabIdx = useRef<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<"left" | "right" | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const getCollectionDisplayName = useCallback(
    (c: LibraryCollection) =>
      c.type === "premade"
        ? t(`premadeCollections.${c.id}`)
        : c.name || t("mathLibrary.tabs.default.collection"),
    [t]
  );

  const resetDragState = () => {
    setDraggingTabIdx(null);
    setDragOverPosition(null);
    dragOverTabIdx.current = null;
  };

  // --- Tab reorder handlers ---
  const onTabDragStart = (e: React.DragEvent, idx: number) => {
    setDraggingTabIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const onTabDragOver = (e: React.DragEvent, idx: number) => {
    if (draggingTabIdx === null) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOverPosition(e.clientX < rect.left + rect.width / 2 ? "left" : "right");
    dragOverTabIdx.current = idx;
  };

  const onTabDrop = (e: React.DragEvent, visibleIdx: number) => {
    e.preventDefault();
    if (draggingTabIdx === null) return;

    const visibleTabs = collections.filter(c => !c.archivedAt);
    let newIdx = dragOverPosition === "right" ? visibleIdx + 1 : visibleIdx;
    if (draggingTabIdx < newIdx) newIdx--;

    if (draggingTabIdx === newIdx) {
      resetDragState();
      return;
    }

    const fromId = visibleTabs[draggingTabIdx].id;
    const toId = visibleTabs[newIdx].id;
    const fromIndex = collections.findIndex(c => c.id === fromId);
    const toIndex = collections.findIndex(c => c.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    setLibrary(lib => reorderCollections(lib, fromIndex, toIndex));
    resetDragState();
  };

  const onTabDragEnd = () => resetDragState();

  // --- Collection actions ---
  const renameCollectionHandler = (id: string, newName: string) => {
    const coll = library.collections[id];
    if (!coll) return;

    if (coll.type === "premade") {
      showToast({ type: "error", message: t("mathLibrary.tabs.toast.cannotRenamePremade") });
      return;
    }

    const oldName = getCollectionDisplayName(coll);

    try {
      setLibrary(lib => renameCollection(lib, id, newName.trim()));
      setEditingCollId(null);
      showToast({
        type: "success",
        message: t("mathLibrary.tabs.toast.renamed", { oldName, newName }),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
      showToast({ type: "error", message });
    }
  };

  const duplicateCollectionHandler = useCallback(
    (id: string) => {
      const coll = library.collections[id];
      if (!coll) return;

      setLibrary(lib => {
        const collectionsArray = Object.values(lib.collections);
        const originalIndex = collectionsArray.findIndex(c => c.id === id);
        if (originalIndex === -1) return lib;

        const newLib = duplicateCollection(lib, id, t, undefined, originalIndex + 1);
        const newColl = Object.values(newLib.collections).find(c => !lib.collections[c.id]);

        if (newColl) {
          setActiveColl(newColl.id);
        }

        return newLib;
      });

      showToast({
        type: "success",
        message: t("mathLibrary.tabs.toast.duplicated", { name: getCollectionDisplayName(coll) }),
      });
    },
    [library.collections, setLibrary, setActiveColl, showToast, t, getCollectionDisplayName]
  );

  const deleteCollectionHandler = useCallback(
    (id: string) => {
      const coll = library.collections[id];
      if (!coll) return;

      if (coll.type === "premade") {
        showToast({ type: "error", message: t("mathLibrary.tabs.toast.cannotDeletePremade") });
        return;
      }

      try {
        setLibrary(lib => softDeleteCollection(lib, id));

        if (activeColl === id) {
          const next = collections.find(c => c.id !== id && !c.archivedAt);
          setActiveColl(next?.id || "");
        }

        showToast({
          type: "success",
          message: t("mathLibrary.tabs.toast.deleted", { name: getCollectionDisplayName(coll) }),
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
        showToast({ type: "error", message });
      }
    },
    [library.collections, setLibrary, activeColl, collections, setActiveColl, showToast, t, getCollectionDisplayName]
  );

  const archiveCollectionHandler = useCallback(
    (id: string) => {
      const coll = library.collections[id];
      if (!coll) return;

      try {
        setLibrary(lib => archiveCollection(lib, id));

        if (activeColl === id) {
          const next = collections.find(c => c.id !== id && !c.archivedAt);
          setActiveColl(next?.id || "");
        }

        showToast({
          type: "success",
          message: t("mathLibrary.tabs.toast.archived", { name: getCollectionDisplayName(coll) }),
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
        showToast({ type: "error", message });
      }
    },
    [library.collections, setLibrary, activeColl, collections, setActiveColl, showToast, t, getCollectionDisplayName]
  );

  // --- Drop entry on tab ---
  const onTabDragOverEntry = useCallback(
    (e: React.DragEvent, collectionId: string) => {
      if (!draggingSource) return;
      e.preventDefault();
      e.stopPropagation();
      setDropTarget({ type: "libraryCollection", collectionId });
      e.dataTransfer.dropEffect = "move";
    },
    [draggingSource, setDropTarget]
  );

  const onTabDropEntry = useCallback(
    (e: React.DragEvent, collectionId: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggingSource) return;

      if (draggingSource.type === "library") {
        let success = false;
        const coll = library.collections[collectionId];

        setLibrary(prevLib => {
          try {
            const updated = copyEntryToCollection(prevLib, draggingSource.entryId, collectionId);
            success = true;
            return updated;
          } catch (err: unknown) {
            const message =
              err instanceof Error
                ? err.message
                : typeof err === "string"
                ? err
                : t("mathLibrary.tabs.toast.failed");

            showToast({ type: "error", message });
            return prevLib;
          }
        });

        if (success) {
          showToast({ type: "success", message: t("mathLibrary.tabs.toast.copiedToColl", { entry: library.entries[draggingSource.entryId].latex, collection: getCollectionDisplayName(coll) } ) });
        }
      } else {
        console.log("Unsupported drop type", draggingSource);
        showToast({ type: "info", message: t("mathLibrary.tabs.toast.unsupportedDrop") });
      }

      setDraggingSource(null);
      setDropTarget(null);
    },
    [draggingSource, getCollectionDisplayName, library.collections, library.entries, setDraggingSource, setDropTarget, setLibrary, showToast, t]
  );

  // --- Render ---
  return (
    <div className={styles.tabRow}>
      <div className={styles.tabHeaderLeft}>
        {collections.filter(c => !c.archivedAt).map((c, idx) => {
          const isDragOver = dragOverTabIdx.current === idx;
          const isDropTarget = dropTarget?.type === "libraryCollection" && dropTarget.collectionId === c.id;

          return (
            <div
              key={c.id}
              className={clsx(styles.tab, {
                [styles.active]: c.id === activeColl,
                [styles.dragging]: draggingTabIdx === idx,
                [styles.dragOverLeft]: isDragOver && dragOverPosition === "left",
                [styles.dragOverRight]: isDragOver && dragOverPosition === "right",
                [styles.dropTarget]: isDropTarget,
              })}
              draggable
              onDragStart={e => onTabDragStart(e, idx)}
              onDragOver={e => {
                onTabDragOver(e, idx);
                onTabDragOverEntry(e, c.id);
              }}
              onDrop={e => {
                onTabDrop(e, idx);
                onTabDropEntry(e, c.id);
              }}
              onDragEnd={onTabDragEnd}
            >
              {editingCollId === c.id ? (
                <div className={styles.collectionNameInput}>
                  <input
                    ref={renameInputRef}
                    defaultValue={getCollectionDisplayName(c)}
                    onBlur={e => renameCollectionHandler(c.id, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") renameCollectionHandler(c.id, (e.target as HTMLInputElement).value);
                      if (e.key === "Escape") setEditingCollId(null);
                    }}
                    autoFocus
                    disabled={c.type === "premade"}
                  />
                </div>
              ) : (
                <button
                  className={styles.collectionTab}
                  onClick={() => setActiveColl(c.id)}
                  onDoubleClick={() => {
                    if (c.type === "custom") {
                      setEditingCollId(c.id);
                      setTimeout(() => renameInputRef.current?.focus(), 0);
                    } else {
                      showToast({
                        type: "error",
                        message: t("mathLibrary.tabs.toast.cannotRenamePremade"),
                      });
                    }
                  }}
                >
                  {getCollectionDisplayName(c)}
                </button>
              )}

              {c.id === activeColl && editingCollId !== c.id && (
                <div className={styles.tabActions}>
                  <button
                    ref={el => {
                      buttonRefs.current[c.id] = el;
                    }}
                    className={styles.collectionTabButton}
                    title={t("mathLibrary.tabs.tooltip.moreOptions")}
                    onClick={() => setMenuOpenFor(c.id === menuOpenFor ? null : c.id)}
                  >
                    ⋯
                  </button>

                  {menuOpenFor === c.id && buttonRefs.current[c.id] && (
                    <TabDropdownPortal
                      anchorRef={{ current: buttonRefs.current[c.id] as HTMLButtonElement }}
                      onRename={() => {
                        if (c.type === "custom") setEditingCollId(c.id);
                        setMenuOpenFor(null);
                      }}
                      onDuplicate={() => {
                        duplicateCollectionHandler(c.id);
                        setMenuOpenFor(null);
                      }}
                      onDelete={() => {
                        if (c.type === "custom" && window.confirm(t("mathLibrary.tabs.confirm.delete"))) {
                          deleteCollectionHandler(c.id);
                        }
                        setMenuOpenFor(null);
                      }}
                      onArchive={() => {
                        archiveCollectionHandler(c.id);
                        setMenuOpenFor(null);
                      }}
                      onClose={() => setMenuOpenFor(null)}
                      disabledOptions={{ rename: c.type !== "custom", delete: c.type !== "custom" }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

        <Tooltip text={t("mathLibrary.tabs.tooltip.new")}>
          <button
            className={styles.tabAdd}
            onClick={() => {
              const id = crypto.randomUUID();
              const name = t("mathLibrary.tabs.defaultName");
              setLibrary(lib => {
                const newCollection: LibraryCollection = {
                  id,
                  type: "custom",
                  name,
                  createdAt: Date.now(),
                };
                return { ...lib, collections: { ...lib.collections, [id]: newCollection } };
              });
              setActiveColl(id);
              setEditingCollId(id);
              setTimeout(() => renameInputRef.current?.focus(), 0);
            }}
          >
            +
          </button>
        </Tooltip>
      </div>

      <div className={styles.tabHeaderRight}>
        <Tooltip text={t("mathLibrary.tabs.tooltip.archive")}>
          <button className={styles.archiveButton} onClick={() => setMenuOpenFor("archive")}>
            🗂️
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default React.memo(CollectionTabs);
