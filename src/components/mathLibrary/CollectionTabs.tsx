// components/mathLibrary/CollectionTabs.tsx
import { useRef, useState, useCallback } from "react";
import Tooltip from "../tooltips/Tooltip";
import type { LibraryCollection, LibraryEntry } from "../../models/libraryTypes";
import styles from "./MathLibrary.module.css";
import clsx from "clsx";
import TabDropdownPortal from "./TabDropdownPortal";
import { useDragContext } from "../../hooks/useDragContext";
import { nodeToLatex } from "../../models/nodeToLatex";
import React from "react";
import { useToast } from "../../hooks/useToast";

interface CollectionTabsProps {
  collections: LibraryCollection[];
  activeColl: string;
  setActiveColl: React.Dispatch<React.SetStateAction<string>>;
  editingCollId: string | null;
  setEditingCollId: React.Dispatch<React.SetStateAction<string | null>>;
  setCollections: React.Dispatch<React.SetStateAction<LibraryCollection[]>>;
  menuOpenFor: string | null;
  setMenuOpenFor: React.Dispatch<React.SetStateAction<string | null>>;
  onDropEntryToCollection: (entry: LibraryEntry, targetCollectionId: string) => void;
}

const CollectionTabs: React.FC<CollectionTabsProps> = ({
  collections,
  activeColl,
  setActiveColl,
  editingCollId,
  setEditingCollId,
  setCollections,
  menuOpenFor,
  setMenuOpenFor,
  onDropEntryToCollection,
}) => {
  console.warn(`Rendering CollectionTabs`);

  const { showToast } = useToast();

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [draggingTabIdx, setDraggingTabIdx] = useState<number | null>(null);
  const dragOverTabIdx = useRef<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<"left" | "right" | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  // Drag context from your hook
  const { draggingNode, setDraggingNode, dropTarget, setDropTarget } = useDragContext();

  const resetDragState = () => {
    setDraggingTabIdx(null);
    setDragOverPosition(null);
    dragOverTabIdx.current = null;
  };

  // Tab reorder drag handlers (existing)
  const onTabDragStart = (e: React.DragEvent, idx: number) => {
    setDraggingTabIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const onTabDragOver = (e: React.DragEvent, idx: number) => {
    if (draggingTabIdx === null) return;
    e.preventDefault();

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const mouseX = e.clientX;
    const midpoint = rect.left + rect.width / 2;
    const position = mouseX < midpoint ? "left" : "right";

    dragOverTabIdx.current = idx;
    setDragOverPosition(position);
  };

  const onTabDrop = (e: React.DragEvent, visibleIdx: number) => {
    e.preventDefault();
    if (draggingTabIdx === null) return;

    let newVisibleIdx = visibleIdx;
    if (dragOverPosition === "right") {
      newVisibleIdx += 1;
    }

    if (draggingTabIdx < newVisibleIdx) {
      newVisibleIdx--;
    }

    const visibleTabs = collections.filter((c) => !c.archived);
    newVisibleIdx = Math.max(0, Math.min(newVisibleIdx, visibleTabs.length - 1));

    if (draggingTabIdx === newVisibleIdx) {
      resetDragState();
      return;
    }

    const fromId = visibleTabs[draggingTabIdx].id;
    const toId = visibleTabs[newVisibleIdx].id;

    const fromIndex = collections.findIndex((c) => c.id === fromId);
    const toIndex = collections.findIndex((c) => c.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    setCollections((colls) => {
      const updated = [...colls];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });

    resetDragState();
  };

  const onTabDragEnd = () => {
    resetDragState();
  };

  // Rename, delete, archive handlers (unchanged)
  const renameCollection = (id: string, newName: string) => {
    setCollections((c) =>
      c.map((col) => (col.id === id ? { ...col, name: newName.trim() || col.name } : col))
    );
    setEditingCollId(null);
  };

  const deleteCollection = (id: string) => {
    const collection = collections.find((col) => col.id === id);
    setCollections((c) => c.filter((col) => col.id !== id));
  
    if (id === activeColl && collections.length > 1) {
      const next = collections.filter((c) => !c.archived).find((c) => c.id !== id);
      if (next) setActiveColl(next.id);
      else setActiveColl("");
    }
  
    showToast({
      type: "success",
      message: `Deleted "${collection?.name || "Collection"}"`,
    });
  };

  const archiveCollection = (id: string) => {
    const collection = collections.find((col) => col.id === id);
    setCollections((colls) =>
      colls.map((col) =>
        col.id === id ? { ...col, archived: true, archivedAt: Date.now() } : col
      )
    );
  
    if (id === activeColl) {
      const next = collections.find((c) => c.id !== id && !c.archived);
      if (next) setActiveColl(next.id);
      else setActiveColl("");
    }
  
    showToast({
      type: "success",
      message: `Archived "${collection?.name || "Collection"}"`,
    });
  };
  

  // ---- New: drag/drop for dropping entries into tabs (including inactive tabs) ----

  // Called when dragging over a tab — if draggingNode exists and is a library entry, allow drop on the tab
  const onTabDragOverEntry = useCallback(
    (e: React.DragEvent, collectionId: string) => {
      if (!draggingNode) return;
      e.preventDefault();
      e.stopPropagation();

      // Show drop target if dropping onto this tab
      setDropTarget({
        cellId: "library",
        containerId: collectionId,
        index: 0, // Dropping on tab (not at a specific index)
      });

      e.dataTransfer.dropEffect = "move";
    },
    [draggingNode, setDropTarget]
  );

  // Called when dropping a dragged entry onto a tab
  const onTabDropEntry = useCallback(
    (e: React.DragEvent, collectionId: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!draggingNode) return;

      // Use draggingNode info to add the entry to target collection
      // Assume draggingNode.node is the entry node (adapt if needed)
      const entryToAdd: LibraryEntry = {
        id: crypto.randomUUID(),
        node: draggingNode.node,
        draggedCount: 0,
        latex: nodeToLatex(draggingNode.node) || "",
        addedAt: Date.now(),
      };

      onDropEntryToCollection(entryToAdd, collectionId);

      // Clear drag state
      setDraggingNode(null);
      setDropTarget(null);
    },
    [draggingNode, onDropEntryToCollection, setDraggingNode, setDropTarget]
  );

  // Remove old drop handlers using dataTransfer

  return (
    <div className={styles.tabRow}>
      <div className={styles.tabHeaderLeft}>
        {collections
          .filter((c) => !c.archived)
          .map((c, idx) => {
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
                  [styles.dropTarget]: isDropTarget, // highlight tab if it’s a drop target
                })}
                draggable
                onDragStart={(e) => onTabDragStart(e, idx)}
                onDragOver={(e) => {
                  onTabDragOver(e, idx);
                  onTabDragOverEntry(e, c.id); // allow drop of entry on tab
                }}
                onDrop={(e) => {
                  onTabDrop(e, idx);
                  onTabDropEntry(e, c.id); // drop entry on tab if applicable
                }}
                onDragEnd={onTabDragEnd}
              >
                {editingCollId === c.id ? (
                  <div className={styles.collectionNameInput}>
                    <input
                      ref={renameInputRef}
                      defaultValue={c.name}
                      onBlur={(e) => renameCollection(c.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          renameCollection(c.id, (e.target as HTMLInputElement).value);
                        if (e.key === "Escape") setEditingCollId(null);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        // Prevent dropping math entry into input directly here, since it is handled on the library drop zone
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <span
                    className={styles.collectionTab}
                    onClick={() => setActiveColl(c.id)}
                    onDoubleClick={() => {
                      setEditingCollId(c.id);
                      setTimeout(() => renameInputRef.current?.focus(), 0);
                    }}
                  >
                    {c.name}
                  </span>
                )}

                {c.id === activeColl && editingCollId !== c.id && (
                  <div className={styles.tabActions}>
                    <button
                      ref={(el) => {
                        buttonRefs.current[c.id] = el;
                      }}
                      className={styles.collectionTabButton}
                      title="More options"
                      onClick={() => setMenuOpenFor(c.id === menuOpenFor ? null : c.id)}
                    >
                      ⋯
                    </button>
                    {menuOpenFor === c.id && buttonRefs.current[c.id] && (
                      <TabDropdownPortal
                        anchorRef={{ current: buttonRefs.current[c.id] as HTMLButtonElement }}
                        onRename={() => {
                          setEditingCollId(c.id);
                          setMenuOpenFor(null);
                        }}
                        onDelete={() => {
                          if (
                            window.confirm("Are you sure you want to delete this collection?")
                          ) {
                            deleteCollection(c.id);
                          }
                          setMenuOpenFor(null);
                        }}
                        onArchive={() => {
                          archiveCollection(c.id);
                          setMenuOpenFor(null);
                        }}
                        onClose={() => setMenuOpenFor(null)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

        <Tooltip text="New Collection">
          <button
            className={styles.tabAdd}
            onClick={() => {
              const id = crypto.randomUUID();
              const name = "My Collection";
              setCollections((c) => [...c, { id, name, entries: [], createdAt: Date.now() }]);
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

      <div className={styles.tabHeaderRight}>
        {/* Archive Button */}
        <Tooltip text="Collections Archive">
          <button className={styles.archiveButton} onClick={() => setMenuOpenFor("archive")}>
            🗂️
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default React.memo(CollectionTabs);
