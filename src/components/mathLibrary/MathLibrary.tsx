// // components/mathLibrary/MathLibrary.tsx
// import React, { useEffect, useState } from "react";
// import ResizableSidebar from "../layout/ResizableSidebar";
// import type { MathNode, StructureNode } from "../../models/types";
// import styles from "./MathLibrary.module.css";
// import type { LibraryEntry } from "../../models/libraryTypes";
// import { MathView } from "../mathExpression/MathView";
// import { parseLatex } from "../../models/mathNodeParser";
// import { useDragContext } from "../../hooks/useDragContext";
// import { nodeToLatex } from "../../models/nodeToLatex";
// import { createInlineContainer, createRootWrapper } from "../../models/nodeFactories";

// type DropSource = {
//   sourceType: "cell" | "library";
//   cellId?: string;
//   containerId: string;
//   index: number;
//   node: MathNode;
// };

// type DropTarget = {
//   cellId: string;
//   containerId: string;
//   index: number;
// };

// interface MathLibraryProps {
//   width: number;
//   onWidthChange: (width: number) => void;
//   onDropNode: (from: DropSource, to: DropTarget) => void;
//   addEntryRef?: React.RefObject<(entry: LibraryEntry) => void>;
// }

// const STORAGE_KEY = "mathLibrary";

// const MathLibrary: React.FC<MathLibraryProps> = ({ width, onWidthChange, onDropNode, addEntryRef }) => {
//   const [entries, setEntries] = useState<LibraryEntry[]>([]);
//   const [filter, setFilter] = useState('');
//   const [sortBy, setSortBy] = useState<'date' | 'usage' | 'latex'>('date');
//   const { draggingNode, setDraggingNode, setDropTarget } = useDragContext();

//   // Load from localStorage on mount
//   useEffect(() => {
//     const stored = localStorage.getItem(STORAGE_KEY);
//     if (stored) {
//       try {
//         const parsed = JSON.parse(stored);
//         setEntries(parsed);
//       } catch (e) {
//         console.warn("Failed to parse math library from storage", e);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (addEntryRef) {
//       addEntryRef.current = (entry: LibraryEntry) => {
//         setEntries((prev) => [...prev, entry]);
//       };
//     }
//   }, [addEntryRef]);

//   // Save to localStorage on change
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
//   }, [entries]);

//   const handleDelete = (id: string) => {
//     setEntries((prev) => prev.filter((entry) => entry.id !== id));
//   };

//   const addEntry = (node: MathNode) => {
//     const entry: LibraryEntry = {
//       id: crypto.randomUUID(),
//       node,
//       addedAt: Date.now(),
//       draggedCount: 0,
//       latex: nodeToLatex(node), // You’ll need to import this
//     };
//     setEntries(prev => [...prev, entry]);
//   };

//   const onLibraryItemDragged = (entryId: string) => {
//     setEntries(prev =>
//       prev.map(entry =>
//         entry.id === entryId ? { ...entry, draggedCount: entry.draggedCount + 1 } : entry
//       )
//     );
//   };

//   return (
//     <ResizableSidebar
//       side="right"
//       title="Math Library"
//       width={width}
//       onWidthChange={onWidthChange}
//       storageKey="mathLibraryWidth"
//     >
//       <div
//         className={styles.libraryDropZone}
//         onDragOver={(e) => {
//           e.preventDefault();
//           setDropTarget({
//             cellId: "library",
//             containerId: "library",
//             index: entries.length, // drop to end
//           });
//         }}
//         onDrop={(e) => {
//           e.preventDefault();
//           if (draggingNode) {
//             onDropNode(draggingNode, {
//               cellId: "library",
//               containerId: "library",
//               index: entries.length,
//             });
//             setDraggingNode(null);
//             setDropTarget(null);
//             return;
//           }

//           // Fallback for text/plain or legacy drops (e.g. LaTeX string)
//           try {
//             const latex = e.dataTransfer.getData("text/plain");
//             if (latex) {
//               const node = parseLatex(latex);
//               if (node) {
//                 const newEntry = {
//                   id: crypto.randomUUID(),
//                   node,
//                 };
//                 setEntries((prev) => [...prev, newEntry]);
//               }
//             }
//           } catch (err) {
//             console.warn("Failed to parse fallback LaTeX drop data", err);
//           }
//         }}
//       >
//         {entries.length === 0 && (
//           <p className={styles.empty}>Drag math expressions here!</p>
//         )}

//         {entries.map((entry, idx) => (
//           <div
//             key={entry.id}
//             className={styles.libraryEntry}
//             draggable
//             onDragStart={(e) => {
//               const dragData: DropSource = {
//                 sourceType: "library",
//                 containerId: "library",
//                 index: idx,
//                 node: entry.node,
//               };

//               // Internal use
//               setDraggingNode(dragData);
//               e.dataTransfer.effectAllowed = "copyMove";

//               // External drag support: provide LaTeX version
//               try {
//                   // RECOVER THIS IF I DECIDE THAT "LATEX VERSION" REQUIRES THE BLOCK WRAP `\[ ... \]`
//                   // const rootWrappedNode = (entry.node.type === "inline-container") 
//                   //   ? createRootWrapper(entry.node)
//                   //   : createRootWrapper(createInlineContainer([entry.node as StructureNode]))
//                   // const latex = nodeToLatex(rootWrappedNode);
//                   const latex = nodeToLatex(entry.node)
//                   e.dataTransfer.setData("text/plain", latex);
//                 } catch (err) {
//                   console.warn("Failed to convert node to LaTeX during drag:", err);
//                 }
//             }}
//             onDragEnd={() => {
//               setDraggingNode(null);
//               setDropTarget(null);
//             }}
//           >
//             <MathView node={entry.node} />
//             <button
//               className={styles.deleteButton}
//               onClick={() => handleDelete(entry.id)}
//               title="Delete"
//             >
//               ✕
//             </button>
//           </div>
//         ))}
//       </div>
//     </ResizableSidebar>
//   );
// };

// export default MathLibrary;

import React, { useEffect, useState, useRef } from "react";
import ResizableSidebar from "../layout/ResizableSidebar";
import { MathView } from "../mathExpression/MathView";
import { useDragContext } from "../../hooks/useDragContext";
import styles from "./MathLibrary.module.css";
import type { LibraryEntry, LibraryCollection } from "../../models/libraryTypes";
import { parseLatex } from "../../models/mathNodeParser";
import type { DropTarget } from "../../hooks/DragContext";
import clsx from "clsx";
import Tooltip from "../tooltips/Tooltip";

// storage key per collection set
const STORAGE_KEY = "mathLibraryCollections";

const MathLibrary: React.FC<{
  width: number;
  onWidthChange: (w: number) => void;
  onDropNode: any;
  addEntryRef?: React.RefObject<(entry: LibraryEntry) => void>;
  updateEntryRef?: React.RefObject<(id: string) => void>;
}> = ({ width, onWidthChange, onDropNode, addEntryRef, updateEntryRef }) => {
  const { draggingNode, setDraggingNode, setDropTarget } = useDragContext();

  const [collections, setCollections] = useState<LibraryCollection[]>([]);
  const [activeColl, setActiveColl] = useState<string>("");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const [editingCollId, setEditingCollId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const [filter, setFilter] = useState("");
  type SortOption = "date" | "date-asc" | "usage" | "usage-asc" | "latex" | "latex-desc";
  const [sortBy, setSortBy] = useState<SortOption>("date");

  // Load from storage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setCollections(parsed);
        if (parsed.length > 0) {
          setActiveColl(parsed[0].id);
        }
      } catch {
        console.warn("Failed to parse library data.");
      }
    } else {
      const defaultId = crypto.randomUUID();
      setCollections([{ id: defaultId, name: "Default", entries: [] }]);
      setActiveColl(defaultId);
    }
  }, []);

  // Save to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    if (!collections.find(c => c.id === activeColl) && collections.length > 0) {
      setActiveColl(collections[0].id);
    }
  }, [activeColl, collections]);

  // External refs
  useEffect(() => {
    if (addEntryRef) {
      addEntryRef.current = (entry) => {
        setCollections(colls =>
          colls.map(c =>
            c.id === activeColl ? { ...c, entries: [...c.entries, entry] } : c
          )
        );
      };
    }
  }, [activeColl, addEntryRef]);

  useEffect(() => {
    if (updateEntryRef) {
      updateEntryRef.current = (id) => {
        console.log(`we are? to be using it! ${id}`)

        setCollections(colls =>
          colls.map(coll => ({
            ...coll,
            entries: coll.entries.map(e =>
              e.id === id ? { ...e, draggedCount: e.draggedCount + 1 } : e
            ),
          }))
        );
      };
    }
  }, [updateEntryRef]);

  const cur = collections.find(c => c.id === activeColl);
  const entries = cur?.entries || [];

  // Search + sort
  const filtered = entries.filter(e =>
    e.latex.toLowerCase().includes(filter.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    const cleanLatex = (s: string) => s.replace(/[\\{}[\]]/g, "");

    switch (sortBy) {
      case "date":
        return b.addedAt - a.addedAt;
      case "date-asc":
        return a.addedAt - b.addedAt;
      case "usage":
        return b.draggedCount - a.draggedCount;
      case "usage-asc":
        return a.draggedCount - b.draggedCount;
      case "latex":
        return cleanLatex(a.latex).localeCompare(cleanLatex(b.latex));
      case "latex-desc":
        return cleanLatex(b.latex).localeCompare(cleanLatex(a.latex));
      default:
        return 0;
    }
  });

  // Reordering
  const dropInsertionRef = useRef<number>(sorted.length);

  const onDragStart = (e: React.DragEvent, idx: number, entry: LibraryEntry) => {
    setDraggingNode({ sourceType: "library", cellId: activeColl, containerId: entry.id, index: idx, node: entry.node });
    e.dataTransfer.effectAllowed = "move";
    setDropTarget({ cellId: "library", containerId: activeColl, index: idx });
    e.dataTransfer.setData("text/plain", entry.latex);
  };

  const onDropEntry = (e?: React.DragEvent, targetCollectionId?: string) => {
    e?.preventDefault();

    const targetId = targetCollectionId || activeColl;
    const to: DropTarget = {
      cellId: "library",
      containerId: targetId,
      index: dropInsertionRef.current ?? entries.length,
    };

    if (draggingNode) {

      // Drop from editor or elsewhere
      if (draggingNode.sourceType === "cell") {
        onDropNode(draggingNode, to);
        setDraggingNode(null);
        setDropTarget(null);
        return;
      }

      // Reordering inside library
      if (draggingNode.containerId === activeColl) {
        const from = draggingNode.index;
        const toIdx = dropInsertionRef.current ?? entries.length;

        if (from !== toIdx) {
          const arr = [...entries];
          const [moved] = arr.splice(from, 1);
          arr.splice(toIdx, 0, moved);
          updateCollectionEntries(arr);
        }

        setDraggingNode(null);
        setDropTarget(null);
        return;
      }

      // Copying into another collection
      if (draggingNode?.sourceType === "library") {
        const fromCollId = draggingNode.cellId;

        // Deep-copy into different tab
        if (fromCollId !== targetId) {
          const sourceColl = collections.find(c => c.id === fromCollId);
          const sourceEntry = sourceColl?.entries.find(e => e.node.id === draggingNode.node.id);

          if (sourceEntry) {
            const newEntry = {
              ...sourceEntry,
              id: crypto.randomUUID(),
              addedAt: Date.now(),
              draggedCount: 0,
            };
            setCollections(colls =>
              colls.map(c =>
                c.id === targetId
                  ? { ...c, entries: [...c.entries, newEntry] }
                  : c
              )
            );
          }
          setDraggingNode(null);
          setDropTarget(null);
          return;
        } 
        // Do not attempt further duplication if into own collection
        else return;
      }
    }

    // Fallback: text/plain LaTeX drop
    try {
      const latex = e?.dataTransfer?.getData("text/plain");
      if (latex) {
        const node = parseLatex(latex);
        if (node) {
          const newEntry: LibraryEntry = {
            id: crypto.randomUUID(),
            node,
            addedAt: Date.now(),
            draggedCount: 0,
            latex,
          };
          setCollections(colls =>
            colls.map(c =>
              c.id === activeColl ? { ...c, entries: [...c.entries, newEntry] } : c
            )
          );
        }
      }
    } catch (err) {
      console.warn("Failed to parse LaTeX drop:", err);
    }
  };

  const updateCollectionEntries = (newEntries: LibraryEntry[]) => {
    setCollections(colls =>
      colls.map(c =>
        c.id === activeColl ? { ...c, entries: newEntries } : c
      )
    );
  };

  const renameCollection = (id: string, newName: string) => {
    setCollections(c =>
      c.map(col =>
        col.id === id ? { ...col, name: newName.trim() || col.name } : col
      )
    );
    setEditingCollId(null);
  };

  const deleteCollection = (id: string) => {
    setCollections(c => c.filter(col => col.id !== id));
    if (id === activeColl && collections.length > 1) {
      const next = collections.find(c => c.id !== id);
      if (next) setActiveColl(next.id);
    }
  };

  return (
    <ResizableSidebar
      side="right"
      title="Math Library"
      width={width}
      onWidthChange={onWidthChange}
      storageKey="mathLibraryWidth"
    >
      <div className={styles.tabRow}>
        {collections.map(c => (
          <div
            key={c.id}
            className={clsx(styles.tab, { 
              [styles.active]: c.id === activeColl, 
              [styles.hovered]: c.id === hoveredTab,
            })}
          >
            {editingCollId === c.id ? (
              <div className={styles.collectionNameInput}>
                <input
                  ref={renameInputRef}
                  defaultValue={c.name}
                  onBlur={(e) => renameCollection(c.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameCollection(c.id, (e.target as HTMLInputElement).value);
                    if (e.key === "Escape") setEditingCollId(null);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    onDropEntry(e, c.id); // pass the target collection ID
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <span 
                className={styles.collectionTab} 
                onClick={() => setActiveColl(c.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoveredTab(c.id);
                }}
                onDragLeave={() => setHoveredTab(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setHoveredTab(null);
                  onDropEntry(e, c.id);
                }}
              >
                {c.name}
              </span>
            )}

            {(c.id === activeColl && editingCollId !== c.id) && (
              <div className={styles.tabActions}>
                <button className={styles.collectionTabButton} title="Rename" onClick={() => setEditingCollId(c.id)}>✏️</button>
                {collections.length > 0 && (
                  <button className={styles.collectionTabButton} title="Delete" onClick={() => deleteCollection(c.id)}>🗑️</button>
                )}
              </div>
            )}
          </div>
        ))}
        <Tooltip text="New Collection">
          <button
            className={styles.tabAdd}
            onClick={() => {
              const id = crypto.randomUUID();
              const name = "New Collection";
              setCollections(c => [...c, { id, name, entries: [] }]);
              setActiveColl(id);
              setEditingCollId(id);
              setTimeout(() => {
                renameInputRef.current?.focus();
              }, 0);
            }}
          >
            +
          </button>
        </Tooltip>
      </div>

      {collections.length === 0 ? (
        <div className={styles.empty}>
          No collections yet. Click <strong>+</strong> to create one.
        </div>
      ) : (
        <span>
          <div className={styles.controls}>
            <Tooltip text="Search on LaTeX substring" style={{ width: "100%" }}>
              <div className={styles.searchBar}>
                <input
                  placeholder="Search..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                {filter && (
                  <button
                    className={styles.clearButton}
                    onClick={() => setFilter("")}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </Tooltip>
            <select className={styles.sortDropdown} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
              <option value="date">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="usage">Most Used</option>
              <option value="usage-asc">Least Used</option>
              <option value="latex">A → Z</option>
              <option value="latex-desc">Z → A</option>
            </select>
          </div>

          <div
            className={styles.libraryDropZone}
            onDragOver={(e) => {
              e.preventDefault();
              dropInsertionRef.current = sorted.length;
            }}
            onDrop={onDropEntry}
          >
            {sorted.map((entry, idx) => (
              <div
                key={entry.id}
                className={styles.libraryEntry}
                draggable
                onDragStart={(e) => onDragStart(e, idx, entry)}
                onDragOver={(e) => {
                  e.preventDefault();
                  dropInsertionRef.current = idx;
                }}
                onDrop={onDropEntry}
                onDragEnd={() => {
                  setDraggingNode(null);
                  setDropTarget(null);
                }}
              >
                <Tooltip text={entry.latex}>
                  <MathView node={entry.node} />
                </Tooltip>              
                <div className={styles.meta}>
                  <span title="Used">{entry.draggedCount}×</span>
                </div>
              </div>
            ))}
            {sorted.length === 0 && <p className={styles.empty}>Drag math expression here</p>}
          </div>
        </span>

      )}
    </ResizableSidebar>
  );
};

export default MathLibrary;
