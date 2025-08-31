// // components/mathLibrary/CollectionTabs.tsx
// import { useRef, useState, useCallback } from "react";
// import Tooltip from "../tooltips/Tooltip";
// import type { LibraryCollection, LibraryEntry } from "../../models/libraryTypes";
// import styles from "./MathLibrary.module.css";
// import clsx from "clsx";
// import TabDropdownPortal from "./TabDropdownPortal";
// import { useDragContext } from "../../hooks/mathDrag/useDragContext";
// import { nodeToLatex } from "../../models/nodeToLatex";
// import React from "react";
// import { useToast } from "../../hooks/toast/useToast";
// import { useI18n } from "../../i18n/useI18n";

// interface CollectionTabsProps {
//   collections: LibraryCollection[];
//   activeColl: string;
//   setActiveColl: (newId: string) => void;
//   editingCollId: string | null;
//   setEditingCollId: React.Dispatch<React.SetStateAction<string | null>>;
//   setCollections: React.Dispatch<React.SetStateAction<LibraryCollection[]>>;
//   menuOpenFor: string | null;
//   setMenuOpenFor: React.Dispatch<React.SetStateAction<string | null>>;
//   onDropEntryToCollection: (entry: LibraryEntry, targetCollectionId: string) => void;
// }

// const CollectionTabs: React.FC<CollectionTabsProps> = ({
//   collections,
//   activeColl,
//   setActiveColl,
//   editingCollId,
//   setEditingCollId,
//   setCollections,
//   menuOpenFor,
//   setMenuOpenFor,
//   onDropEntryToCollection,
// }) => {
//   const { t } = useI18n(); // use language hook

//   const { showToast } = useToast();

//   const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
//   const [draggingTabIdx, setDraggingTabIdx] = useState<number | null>(null);
//   const dragOverTabIdx = useRef<number | null>(null);
//   const [dragOverPosition, setDragOverPosition] = useState<"left" | "right" | null>(null);
//   const renameInputRef = useRef<HTMLInputElement | null>(null);

//   // Drag context from your hook
//   const { draggingNode, setDraggingNode, dropTarget, setDropTarget } = useDragContext();

//   const resetDragState = () => {
//     setDraggingTabIdx(null);
//     setDragOverPosition(null);
//     dragOverTabIdx.current = null;
//   };

//   // Tab reorder drag handlers (existing)
//   const onTabDragStart = (e: React.DragEvent, idx: number) => {
//     setDraggingTabIdx(idx);
//     e.dataTransfer.effectAllowed = "move";
//   };

//   const onTabDragOver = (e: React.DragEvent, idx: number) => {
//     if (draggingTabIdx === null) return;
//     e.preventDefault();

//     const target = e.currentTarget as HTMLElement;
//     const rect = target.getBoundingClientRect();
//     const mouseX = e.clientX;
//     const midpoint = rect.left + rect.width / 2;
//     const position = mouseX < midpoint ? "left" : "right";

//     dragOverTabIdx.current = idx;
//     setDragOverPosition(position);
//   };

//   const onTabDrop = (e: React.DragEvent, visibleIdx: number) => {
//     e.preventDefault();
//     if (draggingTabIdx === null) return;

//     let newVisibleIdx = visibleIdx;
//     if (dragOverPosition === "right") {
//       newVisibleIdx += 1;
//     }

//     if (draggingTabIdx < newVisibleIdx) {
//       newVisibleIdx--;
//     }

//     const visibleTabs = collections.filter((c) => !c.archived);
//     newVisibleIdx = Math.max(0, Math.min(newVisibleIdx, visibleTabs.length - 1));

//     if (draggingTabIdx === newVisibleIdx) {
//       resetDragState();
//       return;
//     }

//     const fromId = visibleTabs[draggingTabIdx].id;
//     const toId = visibleTabs[newVisibleIdx].id;

//     const fromIndex = collections.findIndex((c) => c.id === fromId);
//     const toIndex = collections.findIndex((c) => c.id === toId);
//     if (fromIndex === -1 || toIndex === -1) return;

//     setCollections((colls) => {
//       const updated = [...colls];
//       const [moved] = updated.splice(fromIndex, 1);
//       updated.splice(toIndex, 0, moved);
//       return updated;
//     });

//     resetDragState();
//   };

//   const onTabDragEnd = () => {
//     resetDragState();
//   };

//   // Rename, delete, archive handlers (unchanged)
//   const renameCollection = (id: string, newName: string) => {
//     setCollections((c) =>
//       c.map((col) => (col.id === id ? { ...col, name: newName.trim() || col.name } : col))
//     );
//     setEditingCollId(null);
//   };

//   const duplicateCollection = useCallback((id: string) => {
//     let duplicatedName: string | null = null;

//     setCollections((currentCollections) => {
//       const original = currentCollections.find((c) => c.id === id);
//       if (!original) return currentCollections;

//       duplicatedName = original.name;

//       // Deep clone entries
//       const clonedEntries = original.entries.map((entry) => ({
//         ...entry,
//         id: crypto.randomUUID(),
//       }));

//       const newCollection = {
//         ...original,
//         id: crypto.randomUUID(),
//         name: `${original.name} (Copy)`,
//         entries: clonedEntries,
//         createdAt: Date.now(),
//       };

//       const originalIndex = currentCollections.findIndex((c) => c.id === id);
//       const newCollections = [...currentCollections];
//       newCollections.splice(originalIndex + 1, 0, newCollection);

//       setEditingCollId(newCollection.id);

//       return newCollections;
//     });

//     if (duplicatedName) {
//       showToast({
//         type: "success",
//         message: t("mathLibrary.tabs.toast.duplicated", { name: duplicatedName })
//       });
//     }

//     // If setActiveColl here, do it outside setCollections and wrap in startTransition in parent.
//   }, [setCollections, setEditingCollId, showToast, t]);


//   const deleteCollection = (id: string) => {
//     const collection = collections.find((col) => col.id === id);
//     setCollections((c) => c.filter((col) => col.id !== id));

//     if (id === activeColl && collections.length > 1) {
//       const next = collections.filter((c) => !c.archived).find((c) => c.id !== id);
//       if (next) setActiveColl(next.id);
//       else setActiveColl("");
//     }

//     showToast({
//       type: "success",
//       message: t("mathLibrary.tabs.toast.deleted", {
//         name: collection?.name || t("mathLibrary.default.collection"),
//       })
//     });
//   };

//   const archiveCollection = (id: string) => {
//     const collection = collections.find((col) => col.id === id);
//     setCollections((colls) =>
//       colls.map((col) =>
//         col.id === id ? { ...col, archived: true, archivedAt: Date.now() } : col
//       )
//     );

//     if (id === activeColl) {
//       const next = collections.find((c) => c.id !== id && !c.archived);
//       if (next) setActiveColl(next.id);
//       else setActiveColl("");
//     }

//     showToast({
//       type: "success",
//       message: t("mathLibrary.tabs.toast.archived", {
//         name: collection?.name || t("mathLibrary.default.collection"),
//       })
//     });
//   };


//   // ---- Drag/drop for dropping entries into tabs (including inactive tabs) ----

//   // Called when dragging over a tab — if draggingNode exists and is a library entry, allow drop on the tab
//   const onTabDragOverEntry = useCallback(
//     (e: React.DragEvent, collectionId: string) => {
//       if (!draggingNode) return;
//       e.preventDefault();
//       e.stopPropagation();

//       // Show drop target if dropping onto this tab
//       setDropTarget({
//         cellId: "library",
//         containerId: collectionId,
//         index: 0, // Dropping on tab (not at a specific index)
//       });

//       e.dataTransfer.dropEffect = "move";
//     },
//     [draggingNode, setDropTarget]
//   );

//   // Called when dropping a dragged entry onto a tab
//   const onTabDropEntry = useCallback(
//     (e: React.DragEvent, collectionId: string) => {
//       e.preventDefault();
//       e.stopPropagation();

//       if (!draggingNode) return;

//       // Use draggingNode info to add the entry to target collection
//       // Assume draggingNode.node is the entry node (adapt if needed)
//       const entryToAdd: LibraryEntry = {
//         id: crypto.randomUUID(),
//         node: draggingNode.node,
//         draggedCount: 0,
//         latex: nodeToLatex(draggingNode.node) || "",
//         addedAt: Date.now(),
//       };

//       onDropEntryToCollection(entryToAdd, collectionId);

//       // Clear drag state
//       setDraggingNode(null);
//       setDropTarget(null);
//     },
//     [draggingNode, onDropEntryToCollection, setDraggingNode, setDropTarget]
//   );

//   const getCollectionDisplayName = (collection: LibraryCollection): string => {
//     if (collection.isPremade) {
//       const key = "premadeCollections." + collection.id
//       return t(key);
//     }
//     return collection.name; // fallback to saved name for user collections
//   };

//   return (
//     <div className={styles.tabRow}>
//       <div className={styles.tabHeaderLeft}>
//         {collections
//           .filter((c) => !c.archived)
//           .map((c, idx) => {
//             const isDragOver = dragOverTabIdx.current === idx;
//             const isDropTarget =
//               dropTarget?.cellId === "library" && dropTarget.containerId === c.id;

//             return (
//               <div
//                 key={c.id}
//                 className={clsx(styles.tab, {
//                   [styles.active]: c.id === activeColl,
//                   [styles.dragging]: draggingTabIdx === idx,
//                   [styles.dragOverLeft]: isDragOver && dragOverPosition === "left",
//                   [styles.dragOverRight]: isDragOver && dragOverPosition === "right",
//                   [styles.dropTarget]: isDropTarget, // highlight tab if it’s a drop target
//                 })}
//                 draggable
//                 onDragStart={(e) => onTabDragStart(e, idx)}
//                 onDragOver={(e) => {
//                   onTabDragOver(e, idx);
//                   onTabDragOverEntry(e, c.id); // allow drop of entry on tab
//                 }}
//                 onDrop={(e) => {
//                   onTabDrop(e, idx);
//                   onTabDropEntry(e, c.id); // drop entry on tab if applicable
//                 }}
//                 onDragEnd={onTabDragEnd}
//               >
//                 {editingCollId === c.id ? (
//                   <div className={styles.collectionNameInput}>
//                     <input
//                       ref={renameInputRef}
//                       defaultValue={getCollectionDisplayName(c) || c.name}
//                       onBlur={(e) => renameCollection(c.id, e.target.value)}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter")
//                           renameCollection(c.id, (e.target as HTMLInputElement).value);
//                         if (e.key === "Escape") setEditingCollId(null);
//                       }}
//                       onDragOver={(e) => e.preventDefault()}
//                       onDrop={(e) => {
//                         e.preventDefault();
//                         // Prevent dropping math entry into input directly here, since it is handled on the library drop zone
//                       }}
//                       autoFocus
//                     />
//                   </div>
//                 ) : (
//                   // <span
//                   //   className={styles.collectionTab}
//                   //   onClick={() => setActiveColl(c.id)}
//                   //   onDoubleClick={() => {
//                   //     setEditingCollId(c.id);
//                   //     setTimeout(() => renameInputRef.current?.focus(), 0);
//                   //   }}
//                   // >
//                   //   {/* {c.name} */}
//                   //   {getCollectionDisplayName(c)}
//                   // </span>
//                   <button
//                     className={styles.collectionTab}
//                     onClick={() => setActiveColl(c.id)}
//                     onDoubleClick={() => {
//                       setEditingCollId(c.id);
//                       setTimeout(() => renameInputRef.current?.focus(), 0);
//                     }}
//                     tabIndex={0}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter" || e.key === " ") {
//                         e.preventDefault();
//                         setActiveColl(c.id);
//                       }
//                     }}
//                   >
//                     {getCollectionDisplayName(c)}
//                   </button>
//                 )}

//                 {c.id === activeColl && editingCollId !== c.id && (
//                   <div className={styles.tabActions}>
//                     <button
//                       ref={(el) => {
//                         buttonRefs.current[c.id] = el;
//                       }}
//                       className={styles.collectionTabButton}
//                       title={t("mathLibrary.tabs.tooltip.moreOptions")}
//                       onClick={() => setMenuOpenFor(c.id === menuOpenFor ? null : c.id)}
//                     >
//                       ⋯
//                     </button>
//                     {menuOpenFor === c.id && buttonRefs.current[c.id] && (
//                       <TabDropdownPortal
//                         anchorRef={{ current: buttonRefs.current[c.id] as HTMLButtonElement }}
//                         onRename={() => {
//                           setEditingCollId(c.id);
//                           setMenuOpenFor(null);
//                         }}
//                         onDuplicate={() => {
//                           duplicateCollection(c.id);
//                           setMenuOpenFor(null);
//                         }}
//                         onDelete={() => {
//                           if (
//                             window.confirm(t("mathLibrary.tabs.confirm.delete"))
//                           ) {
//                             deleteCollection(c.id);
//                           }
//                           setMenuOpenFor(null);
//                         }}
//                         onArchive={() => {
//                           archiveCollection(c.id);
//                           setMenuOpenFor(null);
//                         }}
//                         onClose={() => setMenuOpenFor(null)}
//                       />
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}

//         <Tooltip text={t("mathLibrary.tabs.tooltip.new")}>
//           <button
//             className={styles.tabAdd}
//             onClick={() => {
//               const id = crypto.randomUUID();
//               const name = t("mathLibrary.tabs.defaultName");
//               setCollections((c) => [...c, { id, name, entries: [], createdAt: Date.now(), isPremade: false }]);
//               setActiveColl(id);
//               setEditingCollId(id);
//               setTimeout(() => {
//                 renameInputRef.current?.focus();
//               }, 0);
//             }}
//           >
//             +
//           </button>
//         </Tooltip>
//       </div>

//       <div className={styles.tabHeaderRight}>
//         {/* Archive Button */}
//         <Tooltip text={t("mathLibrary.tabs.tooltip.archive")}>
//           <button className={styles.archiveButton} onClick={() => setMenuOpenFor("archive")}>
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
import type { LibraryCollection, LibraryEntry, MathNodeLibrary } from "../../models/libraryTypes";
import {
  duplicateCollection,
  archiveCollection,
  softDeleteCollection,
  renameCollection,
} from "../../utils/mathLibraryUtils";

interface CollectionTabsProps {
  library: MathNodeLibrary;
  setLibrary: React.Dispatch<React.SetStateAction<MathNodeLibrary>>;
  collections: LibraryCollection[];
  activeColl: string;
  setActiveColl: (newId: string) => void;
  editingCollId: string | null;
  setEditingCollId: React.Dispatch<React.SetStateAction<string | null>>;
  menuOpenFor: string | null;
  setMenuOpenFor: React.Dispatch<React.SetStateAction<string | null>>;
  onDropEntryToCollection: (entry: LibraryEntry, targetCollectionId: string) => void;
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
  onDropEntryToCollection,
}) => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { draggingNode, setDraggingNode, dropTarget, setDropTarget } = useDragContext();

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [draggingTabIdx, setDraggingTabIdx] = useState<number | null>(null);
  const dragOverTabIdx = useRef<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<"left" | "right" | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const resetDragState = () => {
    setDraggingTabIdx(null);
    setDragOverPosition(null);
    dragOverTabIdx.current = null;
  };

  // --- Tab reorder handlers (same logic) ---
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

  const onTabDrop = (e: React.DragEvent, visibleIdx: number) => { // THIS ALSO HANDLES RE-ORDERING SETTING SO MUST MOVE THAT OUT TO RE-USE FOR DUPLICATION
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

    setLibrary(lib => {
      const newCollections = [...collections];
      const [moved] = newCollections.splice(fromIndex, 1);
      newCollections.splice(toIndex, 0, moved);
      return { ...lib, collections: Object.fromEntries(newCollections.map(c => [c.id, c])) };
    });

    resetDragState();
  };

  const onTabDragEnd = () => resetDragState();

  // --- Collection actions via utils ---
  const renameCollectionHandler = (id: string, newName: string) => {
    try {
      const coll = library.collections[id];
      if (coll.type === "premade") {
        showToast({ type: "error", message: t("mathLibrary.tabs.toast.cannotRenamePremade") });
        return;
      }
      setLibrary(lib => renameCollection(lib, id, newName.trim()));
      setEditingCollId(null);
      showToast({ type: "success", message: t("mathLibrary.tabs.toast.renamed") });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
      showToast({ type: "error", message });
    }
  };

  const duplicateCollectionHandler = useCallback((id: string) => {
    try {
      setLibrary(lib => {
        const newLib = duplicateCollection(lib, id, t);
        const newColl = Object.values(newLib.collections).find(c => !lib.collections[c.id]);
        if (newColl) setEditingCollId(newColl.id);
        return newLib;
      });
      showToast({ type: "success", message: t("mathLibrary.tabs.toast.duplicated") });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
      showToast({ type: "error", message });
    }
  }, [setEditingCollId, setLibrary, showToast, t]);

  const deleteCollectionHandler = useCallback((id: string) => {
    try {
      const coll = library.collections[id];
      if (coll.type === "premade") {
        showToast({ type: "error", message: t("mathLibrary.tabs.toast.cannotDeletePremade") });
        return;
      }
      setLibrary(lib => softDeleteCollection(lib, id));
      if (activeColl === id) {
        const next = collections.find(c => c.id !== id && !c.archivedAt);
        setActiveColl(next?.id || "");
      }
      showToast({ type: "success", message: t("mathLibrary.tabs.toast.deleted") });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
      showToast({ type: "error", message });
    }
  }, [library.collections, setLibrary, activeColl, showToast, t, collections, setActiveColl]);

  const archiveCollectionHandler = useCallback((id: string) => {
    try {
      setLibrary(lib => archiveCollection(lib, id));
      if (activeColl === id) {
        const next = collections.find(c => c.id !== id && !c.archivedAt);
        setActiveColl(next?.id || "");
      }
      showToast({ type: "success", message: t("mathLibrary.tabs.toast.archived") });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
      showToast({ type: "error", message });
    }
  }, [activeColl, collections, setActiveColl, setLibrary, showToast, t]);
  // --- Drop entry on tab ---
  const onTabDragOverEntry = useCallback((e: React.DragEvent, collectionId: string) => {
    if (!draggingNode) return;
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ cellId: "library", containerId: collectionId, index: 0 });
    e.dataTransfer.dropEffect = "move";
  }, [draggingNode, setDropTarget]);

  const onTabDropEntry = useCallback((e: React.DragEvent, collectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingNode) return;
    onDropEntryToCollection(draggingNode, collectionId); //TODO this is the big problem
    setDraggingNode(null);
    setDropTarget(null);
  }, [draggingNode, onDropEntryToCollection, setDraggingNode, setDropTarget]);

  const getCollectionDisplayName = (c: LibraryCollection) =>
    c.type === "premade" ? t(`premadeCollections.${c.id}`) : c.name || t("mathLibrary.tabs.default.collection");

  // --- Render ---
  return (
    <div className={styles.tabRow}>
      <div className={styles.tabHeaderLeft}>
        {collections.filter(c => !c.archivedAt).map((c, idx) => {
          const isDragOver = dragOverTabIdx.current === idx;
          const isDropTarget =
            dropTarget?.cellId === "library" && dropTarget.containerId === c.id;

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
                      if (e.key === "Enter")
                        renameCollectionHandler(
                          c.id,
                          (e.target as HTMLInputElement).value
                        );
                      if (e.key === "Escape") setEditingCollId(null);
                    }}
                    autoFocus
                    disabled={c.type === "premade"} // Prevent editing premade
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

              {/* Action buttons only when active and not in rename mode */}
              {c.id === activeColl && editingCollId !== c.id && (
                <div className={styles.tabActions}>
                  <button
                    ref={el => {
                      buttonRefs.current[c.id] = el;
                    }}
                    className={styles.collectionTabButton}
                    title={t("mathLibrary.tabs.tooltip.moreOptions")}
                    onClick={() =>
                      setMenuOpenFor(c.id === menuOpenFor ? null : c.id)
                    }
                  >
                    ⋯
                  </button>

                  {menuOpenFor === c.id && buttonRefs.current[c.id] && (
                    <TabDropdownPortal
                      anchorRef={{
                        current: buttonRefs.current[c.id] as HTMLButtonElement,
                      }}
                      onRename={() => {
                        if (c.type === "custom") {
                          setEditingCollId(c.id);
                        }
                        setMenuOpenFor(null);
                      }}
                      onDuplicate={() => {
                        duplicateCollectionHandler(c.id);
                        setMenuOpenFor(null);
                      }}
                      onDelete={() => {
                        if (
                          c.type === "custom" &&
                          window.confirm(t("mathLibrary.tabs.confirm.delete"))
                        ) {
                          deleteCollectionHandler(c.id);
                        }
                        setMenuOpenFor(null);
                      }}
                      onArchive={() => {
                        archiveCollectionHandler(c.id);
                        setMenuOpenFor(null);
                      }}
                      onClose={() => setMenuOpenFor(null)}
                      disabledOptions={{
                        rename: c.type !== "custom",
                        delete: c.type !== "custom",
                      }}
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
                return {
                  ...lib,
                  collections: { ...lib.collections, [id]: newCollection },
                };
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
          <button
            className={styles.archiveButton}
            onClick={() => setMenuOpenFor("archive")}
          >
            🗂️
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default React.memo(CollectionTabs);
