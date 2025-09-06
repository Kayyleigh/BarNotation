// components/mathLibrary/CollectionTabs.tsx
import React, { useRef, useState, useCallback, useLayoutEffect } from "react";
import Tooltip from "../tooltips/Tooltip";
import clsx from "clsx";
import { useI18n } from "../../i18n/useI18n";
import { useToast } from "../../hooks/toast/useToast";
import TabDropdownPortal from "./TabDropdownPortal";
import styles from "./MathLibrary.module.css";
import type { LibraryCollection, MathNodeLibrary } from "../../models/libraryTypes";
import {
  duplicateCollection,
  archiveCollection,
  softDeleteCollection,
  renameCollection,
  copyEntryToCollection,
  reorderCollectionsByVisibleIndex,
} from "../../utils/mathLibraryUtils";
import { useDragReader, useDragWriter } from "../../hooks/mathDrag/useDragContext";

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
  activeColl,
  setActiveColl,
  editingCollId,
  setEditingCollId,
  menuOpenFor,
  setMenuOpenFor,
}) => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { setDraggingSource, setDropTarget } = useDragWriter();
  const { draggingSource, dropTarget } = useDragReader();

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [draggingTabId, setDraggingTabId] = useState<string | null>(null);
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
    setDraggingTabId(null);
    setDragOverPosition(null);
    dragOverTabIdx.current = null;
  };

  // --- Tab reorder handlers ---
  const onTabDragStart = (e: React.DragEvent, id: string) => {
    setDraggingTabId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onTabDragOver = (e: React.DragEvent, idx: number) => {
    if (draggingTabId === null) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOverPosition(e.clientX < rect.left + rect.width / 2 ? "left" : "right");
    dragOverTabIdx.current = idx;
  };

  const onTabDrop = (e: React.DragEvent, visibleIdx: number) => {
    e.preventDefault();
    if (!draggingTabId) return;

    const targetVisibleIndex = dragOverPosition === "right" ? visibleIdx + 1 : visibleIdx;

    setLibrary((lib) =>
      reorderCollectionsByVisibleIndex(lib, draggingTabId, targetVisibleIndex)
    );

    resetDragState();
  };

  const onTabDragEnd = () => resetDragState();

  // --- Collection actions ---

  const renameCollectionHandler = useCallback((id: string, newName: string) => {
    const coll = library.collections[id];
    if (!coll) return;

    if (coll.type === "premade") {
      showToast({ type: "error", message: t("mathLibrary.tabs.toast.cannotRenamePremade") });
      return;
    }

    const oldName = getCollectionDisplayName(coll);
    let success = false;
    let errorMessage: string | null = null;

    setLibrary((lib) => {
      try {
        const updated = renameCollection(lib, id, newName.trim());
        success = true;
        return updated;
      } catch (err: unknown) {
        errorMessage = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
        return lib;
      }
    });

    setEditingCollId(null);

    if (success) {
      showToast({ type: "success", message: t("mathLibrary.tabs.toast.renamed", { oldName, newName }) });
    } else if (errorMessage) {
      showToast({ type: "error", message: errorMessage });
    }
  }, [library.collections, getCollectionDisplayName, setLibrary, setEditingCollId, showToast, t]);

  const duplicateCollectionHandler = useCallback((id: string) => {
    const coll = library.collections[id];
    if (!coll) return;

    const originalIndex = library.collectionOrder.findIndex((collId) => collId === id);
    if (originalIndex === -1) return;

    let newCollId: string | null = null;
    let errorMessage: string | null = null;

    setLibrary((lib) => {
      try {
        const newLib = duplicateCollection(lib, id, t, undefined);
        const newColl = Object.values(newLib.collections).find(c => !lib.collections[c.id]);
        if (newColl) newCollId = newColl.id;
        return newLib;
      } catch (err: unknown) {
        errorMessage = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
        return lib;
      }
    });

    if (newCollId) {
      setActiveColl(newCollId);
      showToast({ type: "success", message: t("mathLibrary.tabs.toast.duplicated", { name: getCollectionDisplayName(coll) }) });
    } else if (errorMessage) {
      showToast({ type: "error", message: errorMessage });
    }
  }, [library, setLibrary, setActiveColl, showToast, t, getCollectionDisplayName]);

  const deleteCollectionHandler = useCallback((id: string) => {
    const coll = library.collections[id];
    if (!coll) return;

    if (coll.type === "premade") {
      showToast({ type: "error", message: t("mathLibrary.tabs.toast.cannotDeletePremade") });
      return;
    }

    let nextActiveId: string | null = null;
    let success = false;
    let errorMessage: string | null = null;

    setLibrary((lib) => {
      try {
        const updated = softDeleteCollection(lib, id);
        success = true;
        if (activeColl === id) {
          const next = Object.values(updated.collections).find(c => !c.archivedAt && !c.deletedAt);
          nextActiveId = next?.id || null;
        }
        return updated;
      } catch (err: unknown) {
        errorMessage = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
        return lib;
      }
    });

    if (nextActiveId) setActiveColl(nextActiveId);

    if (success) {
      showToast({ type: "success", message: t("mathLibrary.tabs.toast.deleted", { name: getCollectionDisplayName(coll) }) });
    } else if (errorMessage) {
      showToast({ type: "error", message: errorMessage });
    }
  }, [library.collections, setLibrary, activeColl, setActiveColl, showToast, t, getCollectionDisplayName]);

  const archiveCollectionHandler = useCallback((id: string) => {
    const coll = library.collections[id];
    if (!coll) return;

    let nextActiveId: string | null = null;
    let success = false;
    let errorMessage: string | null = null;

    setLibrary((lib) => {
      try {
        const updated = archiveCollection(lib, id);
        success = true;
        if (activeColl === id) {
          const next = Object.values(updated.collections).find(c => !c.archivedAt && !c.deletedAt);
          nextActiveId = next?.id || null;
        }
        return updated;
      } catch (err: unknown) {
        errorMessage = err instanceof Error ? err.message : t("mathLibrary.tabs.toast.failed");
        return lib;
      }
    });

    if (nextActiveId) setActiveColl(nextActiveId);

    if (success) {
      showToast({ type: "success", message: t("mathLibrary.tabs.toast.archived", { name: getCollectionDisplayName(coll) }) });
    } else if (errorMessage) {
      showToast({ type: "error", message: errorMessage });
    }
  }, [library.collections, setLibrary, activeColl, setActiveColl, showToast, t, getCollectionDisplayName]);

  // Dragging a Library Entry onto a collection tab
  const onTabDragOverEntry = useCallback(
    (e: React.DragEvent, collectionId: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggingSource) return;
      setDropTarget({ type: "libraryCollection", collectionId });
      e.dataTransfer.dropEffect = "copy";
    },
    [draggingSource, setDropTarget]
  );

  const onTabDropEntry = useCallback(
    (e: React.DragEvent, collectionId: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!draggingSource || draggingSource.type !== "library") return;

      const coll = library.collections[collectionId];
      if (!coll) return;

      let success = false;
      let errorMessage: string | null = null;

      setLibrary(prevLib => {
        try {
          const updated = copyEntryToCollection(prevLib, draggingSource.entryId, collectionId);
          success = true;
          return updated;
        } catch (err: unknown) {
          errorMessage = err instanceof Error
            ? err.message
            : typeof err === "string"
              ? err
              : t("mathLibrary.tabs.toast.failed");
          return prevLib; // return previous state on error
        }
      });

      // Clear drag state immediately after update
      setDraggingSource(null);
      setDropTarget(null);

      // Trigger toast outside updater to avoid React warnings
      if (success) {
        const entryLatex = library.entries[draggingSource.entryId]?.latex ?? "<unknown>";
        showToast({
          type: "success",
          message: t("mathLibrary.tabs.toast.copiedToColl", {
            entry: entryLatex,
            collection: getCollectionDisplayName(coll),
          }),
        });
      } else if (errorMessage) {
        showToast({ type: "error", message: errorMessage });
      }
    },
    [
      draggingSource,
      getCollectionDisplayName,
      library.collections,
      library.entries,
      setDraggingSource,
      setDropTarget,
      setLibrary,
      showToast,
      t,
    ]
  );

  const handleDoubleClick = (c: LibraryCollection) => {
    if (c.type === "custom") {
      setEditingCollId(c.id);
      setTimeout(() => renameInputRef.current?.focus(), 0);
    } else {
      showToast({ type: "error", message: t("mathLibrary.tabs.toast.cannotRenamePremade") });
    }
  };

  const tabRowRef = useRef<HTMLDivElement>(null);
  const [scrollbar, setScrollbar] = useState({ width: 0, left: 0 });

  const updateScrollbar = useCallback(() => {
    const tabRow = tabRowRef.current;
    if (!tabRow) return;

    const visibleRatio = tabRow.scrollWidth ? tabRow.clientWidth / tabRow.scrollWidth : 1;
    const width = tabRow.clientWidth * visibleRatio;              // thumb width
    const left = (tabRow.scrollLeft / tabRow.scrollWidth) * tabRow.clientWidth; // thumb left

    setScrollbar(visibleRatio === 1 ? { width: 0, left: 0 } : { width, left });
  }, []);

  useLayoutEffect(() => {
    const tabRow = tabRowRef.current;
    if (!tabRow) return;

    const handleScroll = () => requestAnimationFrame(updateScrollbar);
    const handleResize = () => updateScrollbar();

    tabRow.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    updateScrollbar();

    return () => {
      tabRow.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateScrollbar]);

  // --- Render ---
  return (
    <div className={styles.tabRowWrapper}>

      <div
        className={styles.tabRow}
        ref={tabRowRef}
        onWheel={e => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
      >
        <div className={styles.tabHeaderLeft}>
          {library.collectionOrder
            .map(id => library.collections[id])               // map order → collections
            .filter(c => c && !c.archivedAt && !c.deletedAt)  // skip missing/archived
            .map((c, idx) => {
              const isDragOver = dragOverTabIdx.current === idx;
              const isDropTarget = dropTarget?.type === "libraryCollection" && dropTarget.collectionId === c.id;

              return (
                <div
                  key={c.id}
                  className={clsx(styles.tab, {
                    [styles.active]: c.id === activeColl,
                    [styles.dragging]: draggingTabId === c.id,
                    [styles.dragOverLeft]: isDragOver && dragOverPosition === "left",
                    [styles.dragOverRight]: isDragOver && dragOverPosition === "right",
                    [styles.dropTarget]: isDropTarget,
                  })}
                  draggable={editingCollId === null}
                  onDragStart={e => onTabDragStart(e, c.id)}
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
                      onDoubleClick={() => handleDoubleClick(c)}
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
                  return { ...lib, collections: { ...lib.collections, [id]: newCollection }, collectionOrder: [...lib.collectionOrder, id] };
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
      {/* Custom overlay scrollbar */}
      <div
        className={styles.tabRowScrollbar}
        style={{
          width: `${scrollbar.width}px`,
          left: `${scrollbar.left}px`,
        }}
      />
    </div>
  );
};

export default React.memo(CollectionTabs);
