// // components/mathLibrary/MathLibrary.tsx
// import React, { useEffect, useState, useRef } from "react";
// import ResizableSidebar from "../layout/ResizableSidebar";
// import { MathView } from "../mathExpression/MathView";
// import { useDragContext } from "../../hooks/useDragContext";
// import styles from "./MathLibrary.module.css";
// import type { LibraryEntry, LibraryCollection } from "../../models/libraryTypes";
// import { parseLatex } from "../../models/latexParser";
// import type { DropTarget } from "../../hooks/DragContext";
// import clsx from "clsx";
// import Tooltip from "../tooltips/Tooltip";
// import TabDropdownPortal from "./TabDropdownPortal";
// import LibCollectionArchiveModal from "../modals/LibCollectionArchiveModal";
// import { createPremadeCollections } from "../../utils/collectionUtils";
// import SearchBar from "../common/SearchBar";
// import { useToast } from "../../hooks/useToast";
// import { nodeToLatex } from "../../models/nodeToLatex";

// // storage key per collection set
// const STORAGE_KEY = "mathLibraryCollections";

// const MathLibrary: React.FC<{
//   width: number;
//   onWidthChange: (w: number) => void;
//   onDropNode: any;
//   addEntryRef?: React.RefObject<(entry: LibraryEntry) => void>;
//   updateEntryRef?: React.RefObject<(id: string) => void>;
// }> = ({ width, onWidthChange, onDropNode, addEntryRef, updateEntryRef }) => {
//   console.warn(`Rendering MathLibrary with: ${width}, ${addEntryRef}, ${updateEntryRef?.current}`)
//   const { showToast } = useToast();

//   const { draggingNode, setDraggingNode, setDropTarget } = useDragContext();

//   const premade = React.useMemo(() => createPremadeCollections(), []);
//   const [loadingCollections, setLoadingCollections] = useState(true);

//   const [collections, setCollections] = useState<LibraryCollection[]>(() => {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (!raw) {
//         // No saved data: return premade collections or default fallback
//         const defaultColls = premade.length > 0 ? premade : [{ id: crypto.randomUUID(), name: "Default", entries: [] }];
//         setLoadingCollections(false);
//         return defaultColls;
//       }

//       const savedCollections: LibraryCollection[] = JSON.parse(raw);

//       // Merge saved + premade, keeping saved collections first to override premade if conflict
//       setLoadingCollections(false);
//       return [
//         ...savedCollections,
//         ...premade.filter(pc => !savedCollections.some(sc => sc.id === pc.id))
//       ];
//     } catch {
//       // On parse error, fallback to premade or default
//       setLoadingCollections(false);
//       return premade.length > 0 ? premade : [{ id: crypto.randomUUID(), name: "Default", entries: [] }];
//     }
//   });

//   const [activeColl, setActiveColl] = useState<string>("");
//   const [hoveredTab, setHoveredTab] = useState<string | null>(null);

//   const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

//   const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
//   const [showArchiveModal, setShowArchiveModal] = useState(false);

//   const [editingCollId, setEditingCollId] = useState<string | null>(null);
//   const renameInputRef = useRef<HTMLInputElement | null>(null);

//   const [draggingTabIdx, setDraggingTabIdx] = useState<number | null>(null);
//   const dragOverTabIdx = useRef<number | null>(null);

//   const [dragOverPosition, setDragOverPosition] = useState<"left" | "right" | null>(null);

//   const [filter, setFilter] = useState("");
//   type SortOption = "date" | "date-asc" | "usage" | "usage-asc" | "latex" | "latex-desc";
//   const [sortBy, setSortBy] = useState<SortOption>("date");

//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
//     if (!collections.find(c => c.id === activeColl) && collections.filter(c => !c.archived).length > 0) {
//       setActiveColl(collections.filter(c => !c.archived)[0].id);
//     }
//   }, [activeColl, collections]);

//   // External refs
//   useEffect(() => {
//     if (addEntryRef) {
//       addEntryRef.current = (entry) => {
//         setCollections(colls =>
//           colls.map(c =>
//             c.id === activeColl ? { ...c, entries: [...c.entries, entry] } : c
//           )
//         );
//       };
//     }
//   }, [activeColl, addEntryRef]);

//   useEffect(() => {
//     if (updateEntryRef) {
//       updateEntryRef.current = (id) => {
//         setCollections(colls =>
//           colls.map(coll => ({
//             ...coll,
//             entries: coll.entries.map(e =>
//               e.id === id ? { ...e, draggedCount: e.draggedCount + 1 } : e
//             ),
//           }))
//         );
//       };
//     }
//   }, [updateEntryRef]);

//   const cur = React.useMemo(() => collections.find(c => c.id === activeColl), [collections, activeColl]);
//   const entries = React.useMemo(() => cur?.entries || [], [cur]);

//   // Search + sort
//   const filtered = React.useMemo(() => {
//     return entries.filter(e =>
//       e.latex.toLowerCase().includes(filter.toLowerCase())
//     );
//   }, [entries, filter]);

//   const sorted = React.useMemo(() => {
//     const cleanLatex = (s: string) => s.replace(/[\\{}[\]]/g, "");
//     return [...filtered].sort((a, b) => {
//       switch (sortBy) {
//         case "date": return b.addedAt - a.addedAt;
//         case "date-asc": return a.addedAt - b.addedAt;
//         case "usage": return b.draggedCount - a.draggedCount;
//         case "usage-asc": return a.draggedCount - b.draggedCount;
//         case "latex": return cleanLatex(a.latex).localeCompare(cleanLatex(b.latex));
//         case "latex-desc": return cleanLatex(b.latex).localeCompare(cleanLatex(a.latex));
//         default: return 0;
//       }
//     });
//   }, [filtered, sortBy]);

//   // Reordering
//   const dropInsertionRef = useRef<number>(sorted.length);

//   const onDragStart = (e: React.DragEvent, idx: number, entry: LibraryEntry) => {
//     setDraggingNode({ sourceType: "library", cellId: activeColl, containerId: entry.id, index: idx, node: entry.node });
//     e.dataTransfer.effectAllowed = "move";
//     setDropTarget({ cellId: "library", containerId: activeColl, index: idx });
//     e.dataTransfer.setData("text/plain", entry.latex);
//   };

//   const onDropEntry = (e?: React.DragEvent, targetCollectionId?: string) => {
//     e?.preventDefault();

//     const targetId = targetCollectionId || activeColl;
//     const to: DropTarget = {
//       cellId: "library",
//       containerId: targetId,
//       index: dropInsertionRef.current ?? entries.length,
//     };

//     if (draggingNode) {
//       // Drop from editor or elsewhere
//       if (draggingNode.sourceType === "cell") {
//         if (to.containerId !== activeColl) {
//           showToast({ message: `Dropping into non-active tab not (yet) supported`, type: "warning" });
//         }
//         else {
//           onDropNode(draggingNode, to);
//           setDraggingNode(null);
//           setDropTarget(null);
//           return;
//         }
//       }

//       // Reordering inside library //TODO I think it does not reorder
//       if (draggingNode.containerId === activeColl) {
//         const from = draggingNode.index;
//         const toIdx = dropInsertionRef.current ?? entries.length;

//         if (from !== toIdx) {
//           const arr = [...entries];
//           const [moved] = arr.splice(from, 1);
//           arr.splice(toIdx, 0, moved);
//           updateCollectionEntries(arr);
//           console.log(`Math Libary 191 updated collection entries`)
//         }

//         setDraggingNode(null);
//         setDropTarget(null);
//         return;
//       }

//       // Copying into another collection
//       if (draggingNode?.sourceType === "library") {
//         const fromCollId = draggingNode.cellId;

//         // Deep-copy into different tab
//         if (fromCollId !== targetId) {
//           const sourceColl = collections.find(c => c.id === fromCollId);
//           const sourceEntry = sourceColl?.entries.find(e => e.node.id === draggingNode.node.id);

//           if (sourceEntry) {
//             const newEntry = {
//               ...sourceEntry,
//               id: crypto.randomUUID(),
//               addedAt: Date.now(),
//               draggedCount: 0,
//             };
//             setCollections(colls =>
//               colls.map(c =>
//                 c.id === targetId
//                   ? { ...c, entries: [...c.entries, newEntry] }
//                   : c
//               )
//             );
//             // TODO: cut off latex string if too long?
//             showToast({ message: `Copied ${nodeToLatex(draggingNode.node)} to ${collections.find(c => c.id === targetId)?.name}`, type: "success" });
//           }
//           setDraggingNode(null);
//           setDropTarget(null);
//           return;
//         } 
//         // Do not attempt further duplication if into own collection
//         else return;
//       }
//     }

//     // Fallback: text/plain LaTeX drop
//     try {
//       const latex = e?.dataTransfer?.getData("text/plain");
//       if (latex) {
//         const node = parseLatex(latex);
//         if (node) {
//           const newEntry: LibraryEntry = {
//             id: crypto.randomUUID(),
//             node,
//             addedAt: Date.now(),
//             draggedCount: 0,
//             latex,
//           };
//           setCollections(colls =>
//             colls.map(c =>
//               c.id === activeColl ? { ...c, entries: [...c.entries, newEntry] } : c
//             )
//           );
//         }
//       }
//     } catch (err) {
//       console.warn("Failed to parse LaTeX drop:", err);
//     }
//   };

//   const onTabDragStart = (e: React.DragEvent, idx: number) => {
//     setDraggingTabIdx(idx);
//     e.dataTransfer.effectAllowed = "move";
//     // You can optionally set drag image or dataTransfer data if needed
//   };

//   const onTabDragOver = (e: React.DragEvent, idx: number) => {
//     if (draggingTabIdx === null) return; // Do not treat as dragOver when source is not a tab

//     e.preventDefault();

//     // Calculate if mouse is on left or right half of the tab
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

//     // Adjust for forward movement (classic off-by-one)
//     if (draggingTabIdx < newVisibleIdx) {
//       newVisibleIdx--;
//     }

//     // Clamp to valid range
//     const visibleTabs = collections.filter(c => !c.archived);
//     newVisibleIdx = Math.max(0, Math.min(newVisibleIdx, visibleTabs.length - 1));

//     if (draggingTabIdx === newVisibleIdx) {
//       resetDragState();
//       return;
//     }

//     // Map visible indices to real indices in collections[]
//     const fromId = visibleTabs[draggingTabIdx].id;
//     const toId = visibleTabs[newVisibleIdx].id;

//     const fromIndex = collections.findIndex(c => c.id === fromId);
//     const toIndex = collections.findIndex(c => c.id === toId);

//     if (fromIndex === -1 || toIndex === -1) return;

//     // Reorder in collections
//     setCollections((colls) => {
//       const updated = [...colls];
//       const [moved] = updated.splice(fromIndex, 1);
//       updated.splice(toIndex, 0, moved);
//       return updated;
//     });

//     resetDragState();
//   };


//   const resetDragState = () => {
//     setDraggingTabIdx(null);
//     setDragOverPosition(null);
//     dragOverTabIdx.current = null;
//   };

//   const onTabDragEnd = () => {
//     setDraggingTabIdx(null);
//     dragOverTabIdx.current = null;
//   };

//   const updateCollectionEntries = (newEntries: LibraryEntry[]) => {
//     setCollections(colls =>
//       colls.map(c =>
//         c.id === activeColl ? { ...c, entries: newEntries } : c
//       )
//     );
//   };

//   const renameCollection = (id: string, newName: string) => {
//     setCollections(c =>
//       c.map(col =>
//         col.id === id ? { ...col, name: newName.trim() || col.name } : col
//       )
//     );
//     setEditingCollId(null);
//   };

//   const deleteCollection = (id: string) => {
//     setCollections(c => c.filter(col => col.id !== id));
//     if (id === activeColl && collections.length > 1) {
//       const next = collections.filter(c => !c.archived).find(c => c.id !== id);
//       if (next) {
//         setActiveColl(next.id);
//       }
//       else setActiveColl(""); // No non-archived collection to select
//     }
//   };

//   const archiveCollection = (id: string) => {
//     setCollections(colls =>
//       colls.map(col =>
//         col.id === id ? { ...col, archived: true } : col
//       )
//     );
//     // If you just archived the active collection, switch to a remaining one
//     if (id === activeColl) {
//       const next = collections.find(c => c.id !== id && !c.archived);
//       if (next) setActiveColl(next.id);
//       else setActiveColl(""); // No non-archived collection to select
//     }
//   };

//   const unarchiveCollection = (id: string) => {
//     setCollections(colls =>
//       colls.map(col =>
//         col.id === id ? { ...col, archived: false } : col
//       )
//     );
//     setShowArchiveModal(false);
//   };

//   return (
//     <ResizableSidebar
//       side="right"
//       title="Math Library"
//       width={width}
//       onWidthChange={onWidthChange}
//       storageKey="mathLibraryWidth"
//     >
//       <div className={styles.tabRow}>
//         <div className={styles.tabHeaderLeft}>
//           {collections.filter(c => !c.archived).map((c, idx) => {
//             const isDragOver = dragOverTabIdx.current === idx;

//             return (
//               <div
//                 key={c.id}
//                 className={clsx(styles.tab, { 
//                   [styles.active]: c.id === activeColl, 
//                   [styles.hovered]: c.id === hoveredTab,
//                   [styles.dragging]: draggingTabIdx === idx,
//                   [styles.dragOverLeft]: isDragOver && dragOverPosition === "left",
//                   [styles.dragOverRight]: isDragOver && dragOverPosition === "right",
//                 })}
//                 draggable
//                 onDragStart={(e) => onTabDragStart(e, idx)}
//                 onDragOver={(e) => onTabDragOver(e, idx)}
//                 onDrop={(e) => onTabDrop(e, idx)}
//                 onDragEnd={onTabDragEnd}
//               >
//                 {editingCollId === c.id ? (
//                   <div className={styles.collectionNameInput}>
//                     <input
//                       ref={renameInputRef}
//                       defaultValue={c.name}
//                       onBlur={(e) => renameCollection(c.id, e.target.value)}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") renameCollection(c.id, (e.target as HTMLInputElement).value);
//                         if (e.key === "Escape") setEditingCollId(null);
//                       }}
//                       onDragOver={(e) => e.preventDefault()}
//                       onDrop={(e) => {
//                         e.preventDefault();
//                         onDropEntry(e, c.id); // pass the target collection ID
//                       }}
//                       autoFocus
//                     />
//                   </div>
//                 ) : (
//                   <span 
//                     className={styles.collectionTab} 
//                     onClick={() => setActiveColl(c.id)}
//                     onDragOver={(e) => {
//                       e.preventDefault();
//                       setHoveredTab(c.id);
//                     }}
//                     onDragLeave={() => setHoveredTab(null)}
//                     onDrop={(e) => {
//                       e.preventDefault();
//                       setHoveredTab(null);
//                       onDropEntry(e, c.id);
//                     }}
//                   >
//                     {c.name}
//                   </span>
//                 )}

//                 {(c.id === activeColl && editingCollId !== c.id) && (
//                   <div className={styles.tabActions}>
//                     <button
//                       ref={(el) => { buttonRefs.current[c.id] = el; }}
//                       className={styles.collectionTabButton}
//                       title="More options"
//                       onClick={() => {
//                         setMenuOpenFor(c.id === menuOpenFor ? null : c.id);
//                       }}
//                     >
//                       ⋯
//                     </button>
//                     {menuOpenFor && menuOpenFor === c.id && buttonRefs.current[c.id] && (
//                       <TabDropdownPortal 
//                         anchorRef={{ current: buttonRefs.current[c.id] as HTMLButtonElement}}
//                         onRename={() => {
//                           setEditingCollId(c.id);
//                           setMenuOpenFor(null);
//                         }}
//                         onDelete={() => {
//                           if (window.confirm("Are you sure you want to delete this collection?")) {
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
//           })} {/* <-- fixed here, removed extra }) */}
//           <Tooltip text="New Collection">
//             <button
//               className={styles.tabAdd}
//               onClick={() => {
//                 const id = crypto.randomUUID();
//                 const name = "My Collection";
//                 setCollections(c => [...c, { id, name, entries: [] }]);
//                 setActiveColl(id);
//                 setEditingCollId(id);
//                 setTimeout(() => {
//                   renameInputRef.current?.focus();
//                 }, 0);
//               }}
//             >
//               +
//             </button>
//           </Tooltip>
//         </div>
//         <div className={styles.tabHeaderRight}>
//           <Tooltip text="Collections Archive">
//             <button 
//               className={styles.archiveButton} 
//               onClick={() => setShowArchiveModal(true)} 
//               title="View archived collections"
//             >
//               🗂️
//             </button>  
//           </Tooltip>
//         </div>
//       </div>

//       {loadingCollections ? (
//         <div className={styles.loadingContainer}>
//           <div className={styles.spinner} />
//           <p className={styles.loadingText}>Loading collections, this may take a while...</p>
//           {/* <p className={styles.loadingText}>You know the usual, we might have to wait a bit</p> */}
//         </div>
//       ) : collections.length === 0 ? (
//         <div className={styles.empty}>
//           No collections yet. Click <strong>+</strong> to create one.
//         </div>
//       ) : (
//         <span>
//           <div className={styles.controls}>
//             <SearchBar placeholder="Search in collection..." value={filter} onChange={setFilter} tooltip="Search on LaTeX substring" />
//             <select className={styles.sortDropdown} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
//               <option value="date">Newest</option>
//               <option value="date-asc">Oldest</option>
//               <option value="usage">Most Used</option>
//               <option value="usage-asc">Least Used</option>
//               <option value="latex">A → Z</option>
//               <option value="latex-desc">Z → A</option>
//             </select>
//           </div>

//           <div
//             className={styles.libraryDropZone}
//             onDragOver={(e) => {
//               e.preventDefault();
//               dropInsertionRef.current = sorted.length;
//             }}
//             onDrop={onDropEntry}
//           >
//             {sorted.map((entry, idx) => (
//               <div
//                 key={entry.id}
//                 className={styles.libraryEntry}
//                 draggable
//                 onDragStart={(e) => onDragStart(e, idx, entry)}
//                 onDragOver={(e) => {
//                   e.preventDefault();
//                   dropInsertionRef.current = idx;
//                 }}
//                 onDragEnd={() => {
//                   setDraggingNode(null);
//                   setDropTarget(null);
//                 }}
//               >
//                 <Tooltip text={entry.latex}>
//                   <MathView node={entry.node} />
//                 </Tooltip>              
//                 <div className={styles.meta}>
//                   <span>{entry.draggedCount}×</span>
//                 </div>
//                 <button
//                   className={styles.entryDeleteButton}
//                   title="Delete entry"
//                   onClick={() =>
//                     updateCollectionEntries(entries.filter(e => e.id !== entry.id))
//                   }
//                 >
//                   ✕
//                 </button>
//               </div>
//             ))}
//             {sorted.length === 0 && <p className={styles.empty}>Drag math expression here</p>}
//           </div>
//         </span>
//       )}
//       {showArchiveModal && (
//         <LibCollectionArchiveModal
//           archived={collections.filter(c => c.archived)}
//           onUnarchive={(id) => unarchiveCollection(id)}
//           onClose={() => setShowArchiveModal(false)}
//           onDelete={(id) => {
//             setCollections(c => c.filter(col => col.id !== id));
//           }}
//         />
//       )}
//     </ResizableSidebar>
//   );  
// };

// export default MathLibrary;

import { useEffect, useState, useCallback, useTransition } from "react";
import LibCollectionArchiveModal from "../modals/LibCollectionArchiveModal";
import LibraryEntries from "./LibraryEntries";
import type { LibraryCollection, LibraryEntry } from "../../models/libraryTypes";
import { createPremadeCollections } from "../../utils/collectionUtils";
import { useToast } from "../../hooks/useToast";
import styles from "./MathLibrary.module.css";
import CollectionTabs from "./CollectionTabs";
import SearchBar from "../common/SearchBar";
import type { DropSource, DropTarget } from "../layout/EditorWorkspace";
import { useDragContext } from "../../hooks/useDragContext";
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
  console.warn(`Rendering MathLibrary`);

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
