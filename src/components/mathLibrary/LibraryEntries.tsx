// components/mathLibrary/LibraryEntries.tsx
import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useDeferredValue,
  useRef,
  useLayoutEffect,
} from "react";
import { useDragWriter } from "../../hooks/mathDrag/useDragContext";
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
  setEntryCommandSequence,
} from "../../utils/mathLibraryUtils";
import EditCustomCommandOnEntryModal from "../modals/EditCustomCommandOnEntryModal";
import clsx from "clsx";
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
  onDelete: () => void;
  showDeleteButton: boolean;
  onDoubleClick?: () => void;
  highlight?: boolean;
  activeCollId: string;
}

/**
 * NOTE: Using custom props comparator to aggressively avoid re-renders.
 * All function props are ignored for comparison because their identity is unstable by design.
 * Only the primitive/identity-stable bits that affect rendering are compared.
 */
const LibraryEntryItem = React.memo<LibraryEntryItemProps>(
  ({ entry, localDragCount, onDelete, showDeleteButton, onDoubleClick, highlight, activeCollId }) => {
    const { t } = useI18n();
    const { setDraggingSource, setDropTarget } = useDragWriter();

    const mathViewRef = useRef<HTMLSpanElement>(null);
    const sizeRef = useRef({ w: 0, h: 0 });

    useLayoutEffect(() => {
      if (mathViewRef.current) {
        sizeRef.current = {
          w: mathViewRef.current.offsetWidth,
          h: mathViewRef.current.offsetHeight,
        };
      }
    }, [entry.id, entry.node]);

    const handleDragStart = useCallback(
      (e: React.DragEvent) => {
        e.stopPropagation();
        setDraggingSource({
          type: "library",
          collectionId: activeCollId,
          entryId: entry.id,
          node: entry.node,
        });
        // Only clear dropTarget if it is set (avoid redundant state writes)
        setDropTarget(null);

        e.dataTransfer.dropEffect = "copy";
        e.dataTransfer.setData("text/plain", entry.latex);

        // Use the existing MathView as the drag image to avoid heavy cloning/layout work.
        if (mathViewRef.current) {
          const { w, h } = sizeRef.current;
          e.dataTransfer.setDragImage(mathViewRef.current, w / 2, h / 2);
        }
      },
      [activeCollId, entry.id, entry.node, entry.latex, setDraggingSource, setDropTarget]
    );

    const handleDragEnd = useCallback(() => {
      // Clean up no matter what
      setDraggingSource(null);
      setDropTarget(null);
    }, [setDraggingSource, setDropTarget]);

    return (
      <span
        className={clsx(styles.libraryEntry, highlight && styles.customCommand)}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDoubleClick={onDoubleClick}
        role="listitem"
        tabIndex={0}
      >
        <Tooltip text={entry.commandSequence ?? entry.latex}>
          <span ref={mathViewRef} data-drag-preview>
            <MathView node={entry.node} showPlaceHolder />
          </span>
        </Tooltip>
        <div className={styles.meta}>
          <span>
            {localDragCount}/{entry.globalDragCount}
          </span>
        </div>
        {highlight && (
          <div className={styles.isCustomCommand}>
            <Tooltip text={t("customCommandIconTooltip")}>
              <span>👤</span>
            </Tooltip>
          </div>
        )}
        {showDeleteButton && (
          <button
            className={styles.entryDeleteButton}
            title={t("mathLibrary.entries.deleteEntry")}
            onClick={onDelete}
          >
            ✕
          </button>
        )}
      </span>

    );
  },
  (prev, next) => {
    // Ignore function props in comparison: onDelete, onDoubleClick
    return (
      prev.entry.id === next.entry.id &&
      prev.localDragCount === next.localDragCount &&
      prev.highlight === next.highlight &&
      prev.entry.commandSequence === next.entry.commandSequence
    );
  }
);

LibraryEntryItem.displayName = "LibraryEntryItem";

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
  const { setDropTarget } = useDragWriter();
  const [editingEntry, setEditingEntry] = useState<LibraryEntry | null>(null);

  // Defer search term to decouple keystrokes from full recomputations/re-renders.
  const deferredSearch = useDeferredValue(searchTerm);

  const entries = useMemo(() => getEntriesForCollection(library, activeCollId), [library, activeCollId]);

  // Precompute a membership lookup for the active collection to avoid repeated function calls in map/sort.
  const membershipById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getMembership>>();
    for (const e of entries) {
      map.set(e.id, getMembership(library, e.id, activeCollId));
    }
    return map;
  }, [library, activeCollId, entries]);

  const filteredSortedEntries = useMemo(() => {
    let filtered = entries;
    const term = deferredSearch.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((e) => e.latex.toLowerCase().includes(term) || e.commandSequence?.toLowerCase().includes(term));
    }

    const byDateDesc = (a: LibraryEntry, b: LibraryEntry) =>
      (membershipById.get(b.id)?.addedAt || 0) - (membershipById.get(a.id)?.addedAt || 0);
    const byDateAsc = (a: LibraryEntry, b: LibraryEntry) =>
      (membershipById.get(a.id)?.addedAt || 0) - (membershipById.get(b.id)?.addedAt || 0);
    const byLocalUsageDesc = (a: LibraryEntry, b: LibraryEntry) =>
      (membershipById.get(b.id)?.dragCount || 0) - (membershipById.get(a.id)?.dragCount || 0);
    const byLocalUsageAsc = (a: LibraryEntry, b: LibraryEntry) =>
      (membershipById.get(a.id)?.dragCount || 0) - (membershipById.get(b.id)?.dragCount || 0);
    const byGlobalUsageDesc = (a: LibraryEntry, b: LibraryEntry) => (b.globalDragCount || 0) - (a.globalDragCount || 0);
    const byGlobalUsageAsc = (a: LibraryEntry, b: LibraryEntry) => (a.globalDragCount || 0) - (b.globalDragCount || 0);

    switch (sortOption) {
      case "date":
        return filtered.slice().sort(byDateDesc);
      case "date-asc":
        return filtered.slice().sort(byDateAsc);
      case "usage-local":
        return filtered.slice().sort(byLocalUsageDesc);
      case "usage-local-asc":
        return filtered.slice().sort(byLocalUsageAsc);
      case "usage-global":
        return filtered.slice().sort(byGlobalUsageDesc);
      case "usage-global-asc":
        return filtered.slice().sort(byGlobalUsageAsc);
      case "latex":
        return filtered.slice().sort((a, b) => a.latex.localeCompare(b.latex));
      case "latex-desc":
        return filtered.slice().sort((a, b) => b.latex.localeCompare(a.latex));
      default:
        return filtered;
    }
  }, [entries, deferredSearch, sortOption, membershipById]);

  const handleDragOverCollection = useCallback(
    (e: React.DragEvent) => {
      // Needed to allow drop
      e.preventDefault();

      setDropTarget({ type: "libraryCollection", collectionId: activeCollId });
      e.dataTransfer.dropEffect = "copy";
    },
    [ activeCollId, setDropTarget]
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  
    // trigger onDrop logic
    onDrop(activeCollId);
  
    // clear the drop target after the drop
    setDropTarget(null);
  }, [activeCollId, onDrop, setDropTarget]);

  const [initialRenderDone, setInitialRenderDone] = useState<Record<string, boolean>>({});

  const renderedSignal = useMemo(
    () => ({
      length: filteredSortedEntries.length,
      sort: sortOption,
      search: deferredSearch,
      coll: activeCollId,
    }),
    [filteredSortedEntries.length, sortOption, deferredSearch, activeCollId]
  );
  
  useEffect(() => {
    if (!activeCollId || initialRenderDone[activeCollId]) return;
  
    onRendered?.();
    setInitialRenderDone(prev => ({ ...prev, [activeCollId]: true }));
  }, [renderedSignal, onRendered, activeCollId, initialRenderDone]);

  const activeCollection = library.collections[activeCollId];
  const isPremade = activeCollection?.type === "premade";

  const handleSaveCommand = useCallback(
    (entryId: string, cmd: string | undefined) => {
      const normalized = cmd?.trim();
      try {
        setLibrary((prevLib) => setEntryCommandSequence(prevLib, entryId, normalized || undefined));
        setEditingEntry(null);
        showToast({
          type: "success",
          message: normalized ? t("mathLibrary.entries.toast.commandSaved") : t("mathLibrary.entries.toast.commandCleared"),
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("mathLibrary.entries.toast.failed");
        showToast({ type: "error", message });
      }
    },
    [setLibrary, showToast, t]
  );

  return (
    <div
      className={styles.libraryDropZone}
      onDragOver={handleDragOverCollection}
      onDrop={handleDrop}
      role="list"
      aria-label={t("mathLibrary.entries.ariaLabel", { name: activeCollId })}
    >
      {filteredSortedEntries.map((entry) => {
        const membership = membershipById.get(entry.id);
        const localDragCount = membership?.dragCount ?? 0;

        // Stable callbacks per item are still recreated due to closure over entry.id.
        // We accept their identity changes but ignore them in the child comparator to avoid re-renders.
        const handleDelete = () => setLibrary((lib) => removeEntryFromCollection(lib, entry.id, activeCollId));
        const handleEdit = () => setEditingEntry(entry);

        return (
          <LibraryEntryItem
            key={entry.id}
            entry={entry}
            localDragCount={localDragCount}
            onDelete={handleDelete}
            onDoubleClick={handleEdit}
            highlight={!!entry.commandSequence}
            showDeleteButton={!isPremade}
            activeCollId={activeCollId}
          />
        );
      })}

      {filteredSortedEntries.length === 0 && (
        <p className={styles.empty}>
          {entries.length === 0 ? t("mathLibrary.entries.empty") : t("mathLibrary.entries.noMatches")}
        </p>
      )}

      {editingEntry && (
        <EditCustomCommandOnEntryModal
          entry={editingEntry}
          onSave={(cmd) => handleSaveCommand(editingEntry.id, cmd)}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
};

export default React.memo(LibraryEntries);
