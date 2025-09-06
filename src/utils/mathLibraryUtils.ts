// utils/mathLibraryUtils.ts
import { PREMADE_COLLECTIONS_RAW } from "../constants/premadeMathCollections";
import { parseLatex } from "../models/latexParser";
import type {
    CustomCollection,
    LibraryCollection,
    LibraryEntry,
    LibraryMembership,
    MathNodeLibrary,
} from "../models/libraryTypes";
import type { MathNode } from "../models/mathNodeTypes";

/* ---------------------------------- Config --------------------------------- */

export const STORAGE_KEY = "mathLibrary";
export const ACTIVE_COLL_KEY = "mathLibraryActiveCollection";
export const SORT_OPTION_KEY = "mathLibrarySortOption";
export const RECOVERY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

/* --------------------------------- Helpers --------------------------------- */

// Defensive clone (shallow). We keep updates immutable.
function cloneLib(lib: MathNodeLibrary): MathNodeLibrary {
    return {
        entries: { ...lib.entries },
        collections: { ...lib.collections },
        memberships: [...lib.memberships],
        collectionOrder: [...lib.collectionOrder],
    };
}

export function isPremadeCollection(
    c: LibraryCollection
): c is Extract<LibraryCollection, { type: "premade" }> {
    return c.type === "premade";
}

export function isCustomCollection(
    c: LibraryCollection
): c is Extract<LibraryCollection, { type: "custom" }> {
    return c.type === "custom";
}

export function now(): number {
    return Date.now();
}

// Build quick indexes (not persisted)
export function indexMemberships(library: MathNodeLibrary) {
    const byCollection = new Map<string, LibraryMembership[]>();
    const byEntry = new Map<string, LibraryMembership[]>();
    for (const m of library.memberships) {
        if (!byCollection.has(m.collectionId)) byCollection.set(m.collectionId, []);
        byCollection.get(m.collectionId)!.push(m);

        if (!byEntry.has(m.entryId)) byEntry.set(m.entryId, []);
        byEntry.get(m.entryId)!.push(m);
    }
    return { byCollection, byEntry };
}

export function getCollectionsArray(lib: MathNodeLibrary): LibraryCollection[] {
    return Object.values(lib.collections);
}

export function getActiveCollections(lib: MathNodeLibrary): LibraryCollection[] {
    return getCollectionsArray(lib).filter(
        (c) => (!isCustomCollection(c) || !c.archivedAt) && !c.deletedAt
    );
}

export function getEntriesForCollection(
    lib: MathNodeLibrary,
    collectionId: string
): LibraryEntry[] { //TODO when done debugging,  make this a clean return again?
    const { byCollection } = indexMemberships(lib);
    const memberships = byCollection.get(collectionId) || [];
    const entries = memberships
        .map((m) => lib.entries[m.entryId])
        .filter(Boolean);
    return entries;
}

export function getMembership(
    lib: MathNodeLibrary,
    entryId: string,
    collectionId: string
): LibraryMembership | undefined {
    return lib.memberships.find(
        (m) => m.entryId === entryId && m.collectionId === collectionId
    );
}

export function hasLatexInCollection(
    lib: MathNodeLibrary,
    collectionId: string,
    latex: string
): boolean {
    const entries = getEntriesForCollection(lib, collectionId);
    return entries.some((e) => e.latex === latex);
}

export function findEntryByLatex(
    lib: MathNodeLibrary,
    latex: string
): LibraryEntry | undefined {
    // entries keyed by id, so scan values (fine for typical sizes)
    return Object.values(lib.entries).find((e) => e.latex === latex);
}

export function findEntryIdByCommandSequence(
    lib: MathNodeLibrary,
    cmd: string
): string | undefined {
    return Object.values(lib.entries).find((e) => e.commandSequence === cmd)?.id;
}

/* ------------------------------ Persistence -------------------------------- */

export function saveLibrary(lib: MathNodeLibrary): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lib));
}

export function loadLibrary(): MathNodeLibrary | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as MathNodeLibrary;
        // basic shape sanity
        if (!parsed.entries || !parsed.collections || !parsed.memberships) return null;
        return parsed;
    } catch {
        return null;
    }
}

/* ------------------------- Creation / Bootstrapping ------------------------- */

export function createEmptyLibrary(): MathNodeLibrary {
    return { entries: {}, collections: {}, memberships: [], collectionOrder: [] };
}

export function createDefaultLibrary(saveToStorage = true): MathNodeLibrary {
    const entries: Record<string, LibraryEntry> = {};
    const collections: Record<string, LibraryCollection> = {};
    const memberships: LibraryMembership[] = [];

    const now = Date.now();

    // explicit ordering array
    const collectionOrder: string[] = [];

    PREMADE_COLLECTIONS_RAW.forEach((rawCol) => {
        // Create premade collection
        collections[rawCol.id] = {
            type: "premade",
            id: rawCol.id,
            archivedAt: undefined,
            deletedAt: undefined,
        };

        // record the order
        collectionOrder.push(rawCol.id);

        rawCol.entries.forEach((rawEntry) => {
            try {
                const node = parseLatex(rawEntry.latex);
                const entryId = rawEntry.id;

                // Add to entries if not already present
                if (!entries[entryId]) {
                    entries[entryId] = {
                        id: entryId,
                        latex: rawEntry.latex,
                        node,
                        globalDragCount: 0,
                        commandSequence: undefined,
                    };
                }

                // Add membership mapping
                memberships.push({
                    entryId,
                    collectionId: rawCol.id,
                    addedAt: now,
                    dragCount: 0,
                });
            } catch (err) {
                console.warn(
                    `Failed to parse latex entry '${rawEntry.latex}' in premade collection '${rawCol.id}':`,
                    err
                );
            }
        });
    });

    const library: MathNodeLibrary = {
        entries,
        collections,
        memberships,
        collectionOrder
    };

    if (saveToStorage) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
        } catch (err) {
            console.error("Failed to save default library to localStorage:", err);
        }
    }

    return library;
}


export function addCustomCollection(
    lib: MathNodeLibrary,
    name: string
): MathNodeLibrary {
    const id = crypto.randomUUID();
    const created: CustomCollection = {
        id,
        type: "custom",
        name,
        createdAt: now(),
    };
    const next = cloneLib(lib);
    next.collections[id] = created;
    return next;
}

// For premades you typically seed them once (i18n provides the name at render time)
export function addPremadeCollection(
    lib: MathNodeLibrary,
    id: string // stable ID for i18n lookup
): MathNodeLibrary {
    if (lib.collections[id]) return lib; // idempotent
    const next = cloneLib(lib);
    next.collections[id] = { id, type: "premade" };
    return next;
}

/* --------------------------- Entry / Memberships --------------------------- */

function createEntry(latex: string, node: MathNode): LibraryEntry {
    return {
        id: crypto.randomUUID(),
        latex,
        node,
        globalDragCount: 0,
    };
}

function createMembership(entryId: string, collectionId: string): LibraryMembership {
    return {
        entryId,
        collectionId,
        addedAt: now(),
        dragCount: 0,
    };
}

/**
 * Add (or link) an entry to a collection.
 * - Ensures no duplicate LaTeX within the target collection.
 * - Reuses an existing entry by LaTeX if available; otherwise creates one.
 * - For premade collections: rejects mutation.
 */
export function addEntryToCollection(
    lib: MathNodeLibrary,
    collectionId: string,
    latex: string,
    node: MathNode
): MathNodeLibrary {
    const coll = lib.collections[collectionId];
    if (!coll) throw new Error("Collection not found");
    if (isPremadeCollection(coll)) throw new Error("Cannot modify premade collection");
    if (hasLatexInCollection(lib, collectionId, latex))
        throw new Error("Entry with same LaTeX already exists in collection");

    const next = cloneLib(lib);

    // find or create entry
    let entry = findEntryByLatex(next, latex);
    if (!entry) {
        entry = createEntry(latex, node);
        next.entries[entry.id] = entry;
    }

    // add membership
    next.memberships.push(createMembership(entry.id, collectionId));
    return next;
}

/**
 * Copy an existing entry (by id) to another collection.
 * - Local dragCount resets to 0 in the new collection.
 * - Cannot add to premade collections.
 */
export function copyEntryToCollection(
    lib: MathNodeLibrary,
    entryId: string,
    toCollectionId: string
): MathNodeLibrary {
    const coll = lib.collections[toCollectionId];
    if (!coll) throw new Error("Collection not found");
    if (isPremadeCollection(coll)) throw new Error("Cannot modify premade collection");

    const entry = lib.entries[entryId];
    console.log(entryId)
    if (!entry) throw new Error("Entry not found");

    if (hasLatexInCollection(lib, toCollectionId, entry.latex))
        throw new Error("Entry with same LaTeX already exists in target collection");

    const next = cloneLib(lib);
    next.memberships.push(createMembership(entryId, toCollectionId));
    return next;
}

/**
 * Remove an entry from a collection.
 * - Updates entry.globalDragCount -= local dragCount.
 * - Deletes entry entirely if it has no memberships left afterward.
 */
export function removeEntryFromCollection(
    lib: MathNodeLibrary,
    entryId: string,
    collectionId: string
): MathNodeLibrary {
    const coll = lib.collections[collectionId];
    if (!coll) throw new Error("Collection not found");
    if (isPremadeCollection(coll)) throw new Error("Cannot modify premade collection");

    const entry = lib.entries[entryId];
    if (!entry) throw new Error("Entry not found");

    const next = cloneLib(lib);
    const idx = next.memberships.findIndex(
        (m) => m.entryId === entryId && m.collectionId === collectionId
    );
    if (idx === -1) return lib; // nothing to do

    const membership = next.memberships[idx];

    // update global cache
    const updatedEntry = { ...entry, globalDragCount: entry.globalDragCount - membership.dragCount };
    next.entries[entryId] = updatedEntry;

    // remove membership
    next.memberships.splice(idx, 1);

    // if no memberships left for this entry, delete entry
    const stillLinked = next.memberships.some((m) => m.entryId === entryId);
    if (!stillLinked) delete next.entries[entryId];

    return next;
}

/**
 * Increment drag counts for an entry within a collection.
 * - membership.dragCount++
 * - entry.globalDragCount++
 */
export function incrementDragCount(
    lib: MathNodeLibrary,
    entryId: string,
    collectionId: string
): MathNodeLibrary {
    const entry = lib.entries[entryId];
    if (!entry) throw new Error("Entry not found");

    const idx = lib.memberships.findIndex(
        (m) => m.entryId === entryId && m.collectionId === collectionId
    );
    if (idx === -1) throw new Error("Membership not found");

    const next = cloneLib(lib);
    // bump local
    next.memberships[idx] = {
        ...next.memberships[idx],
        dragCount: next.memberships[idx].dragCount + 1,
    };
    // bump global
    next.entries[entryId] = {
        ...entry,
        globalDragCount: entry.globalDragCount + 1,
    };
    return next;
}

/* ---------------------------- Command Sequences ---------------------------- */

import { specialSequences } from "../models/specialSequences";

/**
 * Assign or clear a command sequence on an entry.
 * - Enforces uniqueness across entries.
 * - To clear, pass `undefined` or empty string.
 * - (Optional) you can pass a `forbidden` set to reject overlaps with reserved sequences.
 */
export function setEntryCommandSequence(
    lib: MathNodeLibrary,
    entryId: string,
    commandSequence: string | undefined,
    forbidden: Set<string> = new Set()
): MathNodeLibrary {
    const entry = lib.entries[entryId];
    if (!entry) throw new Error("Entry not found");

    const normalized = commandSequence?.trim();

    if (normalized) {
        // 1. Check forbidden/reserved
        if (forbidden.has(normalized)) {
            throw new Error("Command sequence is reserved");
        }

        // 2. Check against built-in special sequences
        if (specialSequences.some(seq => seq.sequence === normalized)) {
            throw new Error("Command sequence is already reserved as a built-in command");
        }

        // 3. Check against other custom entries
        const clashId = findEntryIdByCommandSequence(lib, normalized);
        if (clashId && clashId !== entryId) {
            throw new Error("Command sequence already in use by another entry");
        }
    }

    const next = cloneLib(lib);
    next.entries[entryId] = {
        ...entry,
        commandSequence: normalized || undefined,
    };
    return next;
}

/**
 * Find entries where the commandSequence contains a substring (case-insensitive).
 */
export function searchEntriesByCommandSubstring(
    lib: MathNodeLibrary,
    substring: string
): LibraryEntry[] {
    const needle = substring.trim().toLowerCase();
    if (!needle) return [];
    return Object.values(lib.entries).filter(
        (e) => e.commandSequence && e.commandSequence.toLowerCase().includes(needle)
    );
}

/* ---------------------------- Collections (CRUD) --------------------------- */

/**
 * Renames a collection in the library.
 * - For custom collections, updates the `name`.
 * - For premade collections, does nothing (or could throw if you want to enforce immutability).
 *
 * @param lib - The current library
 * @param collectionId - ID of the collection to rename
 * @param newName - The new name for the collection
 * @returns A new MathNodeLibrary with the updated collection name
 */
export function renameCollection(
    lib: MathNodeLibrary,
    collectionId: string,
    newName: string
): MathNodeLibrary {
    const collection = lib.collections[collectionId];
    if (!collection) throw new Error(`Collection ${collectionId} not found`);

    // Only rename custom collections
    if (collection.type === "custom") {
        const next = cloneLib(lib);
        next.collections[collectionId] = {
            ...collection,
            name: newName.trim() || collection.name,
        };
        return next;
    }

    // Premade collections cannot be renamed
    return lib;
}

export function archiveCollection(
    lib: MathNodeLibrary,
    collectionId: string
): MathNodeLibrary {
    const coll = lib.collections[collectionId];
    if (!coll) throw new Error("Collection not found");
    // if (!isCustomCollection(coll)) return lib; // only custom can be archived

    if (coll.archivedAt) return lib;
    const next = cloneLib(lib);
    next.collections[collectionId] = { ...coll, archivedAt: now() };
    return next;
}

export function unarchiveCollection(
    lib: MathNodeLibrary,
    collectionId: string
): MathNodeLibrary {
    const coll = lib.collections[collectionId];
    if (!coll) throw new Error("Collection not found");
    if (!isCustomCollection(coll)) return lib;

    if (!coll.archivedAt) return lib;
    const next = cloneLib(lib);
    next.collections[collectionId] = { ...coll, archivedAt: undefined };
    return next;
}

export function softDeleteCollection(
    lib: MathNodeLibrary,
    collectionId: string
): MathNodeLibrary {
    const coll = lib.collections[collectionId];
    if (!coll) throw new Error("Collection not found");
    if (!isCustomCollection(coll)) throw new Error("Cannot delete premade collection");
    if (coll.deletedAt) return lib;

    const next = cloneLib(lib);
    next.collections[collectionId] = { ...coll, deletedAt: now() };

    // Optionally, you can also hide memberships immediately (but keep for recovery).
    // We’ll keep memberships; purge happens in `purgeExpiredDeletes`.
    return next;
}

/**
 * Recover a soft-deleted custom collection within the recovery window.
 */
export function recoverCollection(
    lib: MathNodeLibrary,
    collectionId: string
): MathNodeLibrary {
    const coll = lib.collections[collectionId];
    if (!coll) throw new Error("Collection not found");
    if (!isCustomCollection(coll)) return lib;
    if (!coll.deletedAt) return lib;

    const withinWindow = now() - coll.deletedAt < RECOVERY_WINDOW_MS;
    if (!withinWindow) throw new Error("Recovery window expired");

    const next = cloneLib(lib);
    next.collections[collectionId] = { ...coll, deletedAt: undefined };
    return next;
}

/**
 * After recovery window, fully remove the collection and all its memberships.
 * Also garbage-collect entries that become unused.
 */
export function purgeExpiredDeletes(lib: MathNodeLibrary): MathNodeLibrary {
    const next = cloneLib(lib);
    const toDelete = Object.values(next.collections)
        .filter((c) => isCustomCollection(c) && c.deletedAt && now() - c.deletedAt >= RECOVERY_WINDOW_MS)
        .map((c) => c.id);

    if (toDelete.length === 0) return lib;

    // Remove memberships for those collections
    next.memberships = next.memberships.filter((m) => !toDelete.includes(m.collectionId));

    // Remove collections
    for (const id of toDelete) {
        delete next.collections[id];
    }

    // GC orphan entries
    const linkedEntryIds = new Set(next.memberships.map((m) => m.entryId));
    for (const id of Object.keys(next.entries)) {
        if (!linkedEntryIds.has(id)) delete next.entries[id];
    }

    return next;
}

/**
 * Duplicate any collection (premade or custom) into a new custom collection.
 * - New collection gets `name = "<orig> (copy)"` (caller can decide final name).
 * - All memberships are recreated with dragCount=0 and addedAt=now.
 * - New collection is optionally inserted at a specific index (default: end)
 */
export function duplicateCollection(
    lib: MathNodeLibrary,
    sourceCollectionId: string,
    t: (key: string) => string,
    newName?: string,
): MathNodeLibrary {
    const source = lib.collections[sourceCollectionId];
    if (!source) throw new Error("Source collection not found");

    const originalName =
        source.type === "custom" ? source.name : t(`premadeCollections.${source.id}`);
    const finalName = newName?.trim() || `${originalName} (Copy)`;

    const newId = crypto.randomUUID();
    const created: CustomCollection = {
        id: newId,
        type: "custom",
        name: finalName,
        createdAt: Date.now(),
    };

    const next = cloneLib(lib);
    next.collections[newId] = created;

    // Determine insertion index: default next to original
    const originalIdx = next.collectionOrder.findIndex((id) => id === sourceCollectionId);
    const insertIdx = originalIdx + 1; // insert right after original


    next.collectionOrder.splice(insertIdx, 0, newId);

    // Copy memberships with zeroed counts
    const { byCollection } = indexMemberships(next);
    const srcMemberships = byCollection.get(sourceCollectionId) || [];
    const newMemberships: LibraryMembership[] = srcMemberships.map((m) => ({
        entryId: m.entryId,
        collectionId: newId,
        addedAt: Date.now(),
        dragCount: 0,
    }));
    next.memberships.push(...newMemberships);

    return next;
}

/* ------------------------------ Sorting / View ----------------------------- */

export type LibraryEntriesSortOption = "date" | "date-asc" | "usage-local" | "usage-local-asc" | "usage-global" | "usage-global-asc" | "latex" | "latex-desc";

/**
 * Resolve and sort entries for a collection by a given option.
 * - "date": newest (addedAt) first (fallback 0)
 * - "usage": highest globalDragCount first
 * - "latex": lexicographic
 */
export function getSortedEntriesForCollection(
    lib: MathNodeLibrary,
    collectionId: string,
    sort: LibraryEntriesSortOption
): { entry: LibraryEntry; membership: LibraryMembership }[] {
    const { byCollection } = indexMemberships(lib);
    const members = byCollection.get(collectionId) || [];
    const rows = members
        .map((m) => {
            const entry = lib.entries[m.entryId];
            return entry ? { entry, membership: m } : null;
        })
        .filter((x): x is { entry: LibraryEntry; membership: LibraryMembership } => !!x);

    switch (sort) {
        case "date":
            return rows.sort((a, b) => (b.membership.addedAt ?? 0) - (a.membership.addedAt ?? 0));
        case "date-asc":
            return rows.sort((a, b) => (a.membership.addedAt ?? 0) - (b.membership.addedAt ?? 0));
        case "usage-local":
            return rows.sort((a, b) => b.membership.dragCount - a.membership.dragCount);
        case "usage-local-asc":
            return rows.sort((a, b) => a.membership.dragCount - b.membership.dragCount);
        case "usage-global":
            return rows.sort((a, b) => b.entry.globalDragCount - a.entry.globalDragCount);
        case "usage-global-asc":
            return rows.sort((a, b) => a.entry.globalDragCount - b.entry.globalDragCount);
        case "latex":
            return rows.sort((a, b) => a.entry.latex.localeCompare(b.entry.latex));
        case "latex-desc":
            return rows.sort((a, b) => b.entry.latex.localeCompare(a.entry.latex));
        default:
            return rows;
    }
}

/** Reorder collections by visible (non-archived, non-deleted) index.
 *
 * - draggingId: id of the collection being moved (must be a visible id)
 * - targetVisibleIndex: index into the *visible* list at which the item should be inserted
 *
 * Example: if visible list is [A,B,C,D] and you drag B to targetVisibleIndex = 3,
 * the result visible list becomes [A,C,D,B].
 */
export function reorderCollectionsByVisibleIndex(
    lib: MathNodeLibrary,
    draggingId: string,
    targetVisibleIndex: number
): MathNodeLibrary {
    if (!lib.collectionOrder) {
        console.warn("Library missing collectionOrder; cannot reorder.");
        return lib;
    }

    // Build visible order (skip archived and deleted)
    const visibleOrder = lib.collectionOrder.filter((id) => {
        const c = lib.collections[id];
        return !!c && !c.archivedAt && !c.deletedAt;
    });

    const fromVisibleIndex = visibleOrder.indexOf(draggingId);
    if (fromVisibleIndex === -1) {
        // draggingId is not visible (shouldn't happen for normal tab drags)
        return lib;
    }

    // Normalize/clamp target index
    let target = Math.max(0, Math.min(Math.floor(targetVisibleIndex), visibleOrder.length));
    // If removing from an earlier index, the insertion index shifts left by 1 after removal
    if (fromVisibleIndex < target) target--;

    // Build new visible order
    const newVisibleOrder = visibleOrder.slice();
    newVisibleOrder.splice(fromVisibleIndex, 1);
    newVisibleOrder.splice(target, 0, draggingId);

    // Rebuild the full collectionOrder:
    // For each id in the previous collectionOrder:
    // - if archived/deleted, keep it in-place
    // - otherwise, pull the next id from newVisibleOrder in order
    const newFullOrder: string[] = [];
    let vi = 0;
    for (const id of lib.collectionOrder) {
        const c = lib.collections[id];
        if (!c) {
            // Missing collection (shouldn't happen), skip it.
            continue;
        }
        if (c.archivedAt || c.deletedAt) {
            newFullOrder.push(id); // preserve archived/deleted spot
        } else {
            // take next visible id from the new visible order
            const nextVisibleId = newVisibleOrder[vi++];
            if (!nextVisibleId) {
                // Fallback: if something went wrong, keep current id
                newFullOrder.push(id);
            } else {
                newFullOrder.push(nextVisibleId);
            }
        }
    }

    // In the very rare case newFullOrder is missing some ids (shouldn't happen), append the remainder:
    const remaining = lib.collectionOrder.filter((id) => !newFullOrder.includes(id));
    if (remaining.length) newFullOrder.push(...remaining);

    return {
        ...lib,
        collectionOrder: newFullOrder,
    };
}

/**
 * Reorders collections in a library by updating the `collectionOrder` array.
 * 
 * @param lib Current library object
 * @param fromIndex Original index of the item
 * @param toIndex Target index
 * @returns New library object with collections reordered
 */
export function reorderCollections(
    lib: MathNodeLibrary,
    fromIndex: number,
    toIndex: number
): MathNodeLibrary {
    const order = [...lib.collectionOrder];
    const [moved] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, moved);

    return {
        ...lib,
        collectionOrder: order,
    };
}

/* ------------------------------- Old → New -------------------------------- */

type OldLibraryEntry = {
    id: string;
    node: MathNode;
    addedAt: number;      // per-collection (old model)
    draggedCount: number; // per-collection (old model)
    latex: string;
};

type OldLibraryCollection = {
    id: string;
    name?: string;
    entries: OldLibraryEntry[];
    createdAt?: number;
    archived?: boolean;
    archivedAt?: number;
    isPremade: boolean;
    deletedAt?: number;
};

/**
 * Migrate old shape (collections embedded with entries) to new normalized model.
 * - Creates entries (dedup by LaTeX).
 * - Creates memberships for each old collection entry.
 * - Marks premade/custom via union type.
 * - Converts archived → archivedAt timestamp if needed.
 */
export function migrateOldCollectionsToLibrary(
    oldCollections: OldLibraryCollection[]
): MathNodeLibrary {
    const lib = createEmptyLibrary();

    for (const c of oldCollections) {
        // Create collection
        if (c.isPremade) {
            lib.collections[c.id] = { id: c.id, type: "premade" };
        } else {
            const coll: CustomCollection = {
                id: c.id,
                type: "custom",
                name: c.name || "Collection",
                createdAt: c.createdAt ?? now(),
                archivedAt: c.archivedAt ?? (c.archived ? now() : undefined),
                deletedAt: c.deletedAt,
            };
            lib.collections[c.id] = coll;
        }

        // Create memberships + entries (dedupe by LaTeX)
        for (const e of c.entries) {
            let entry = findEntryByLatex(lib, e.latex);
            if (!entry) {
                entry = {
                    id: e.id || crypto.randomUUID(),
                    latex: e.latex,
                    node: e.node,
                    globalDragCount: 0,
                };
                lib.entries[entry.id] = entry;
            }
            lib.memberships.push({
                entryId: entry.id,
                collectionId: c.id,
                addedAt: e.addedAt ?? now(),
                dragCount: e.draggedCount ?? 0,
            });
            // update global cache from old local counts
            lib.entries[entry.id].globalDragCount += e.draggedCount ?? 0;
        }
    }

    return lib;
}

/* --------------------------------- Export ---------------------------------- */

export function exportLibrary(lib: MathNodeLibrary): string {
    // Returns a JSON string; you may add versioning metadata here if desired
    return JSON.stringify(lib, null, 2);
}

export function importLibrary(json: string): MathNodeLibrary {
    const parsed = JSON.parse(json) as MathNodeLibrary;
    if (!parsed.entries || !parsed.collections || !parsed.memberships)
        throw new Error("Invalid library file");
    return parsed;
}
