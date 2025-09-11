// models/libraryTypes.ts
import type { MathNode } from "./mathNodeTypes";

/**
 * A unique math snippet stored in the library.
 * Identified by LaTeX (1:1 with node).
 */
export interface LibraryEntry {
  id: string;                 // globally unique entry ID
  latex: string;              // unique identifier for entry
  node: MathNode;             // original math node
  globalDragCount: number;    // sum of all collection-local dragCounts
  commandSequence?: string;   // optional custom command binding (unique across entries)
}

/**
 * Base fields common to both custom and premade collections.
 */
interface BaseCollection {
  id: string;
  archivedAt?: number;        // timestamp when archived (undefined = active)
  deletedAt?: number;         // timestamp when soft-deleted (undefined = active)
}

/**
 * Premade collections are shipped with the app.
 * - Name is handled via i18n lookup on `id`.
 * - Cannot be modified directly (no adding/removing entries).
 */
export interface PremadeCollection extends BaseCollection {
  type: "premade";
  // no name or createdAt, handled by app/i18n
}

/**
 * Custom collections are created by the user.
 * - Have a user-defined name.
 * - Can be edited, duplicated, archived, soft-deleted.
 */
export interface CustomCollection extends BaseCollection {
  type: "custom";
  name: string;
  createdAt: number;          // ms since epoch
}

/**
 * A collection can be premade or custom.
 */
export type LibraryCollection = PremadeCollection | CustomCollection;

/**
 * The N:M mapping between entries and collections.
 * Stores per-collection state for each entry.
 */
export interface LibraryMembership {
  entryId: string;
  collectionId: string;
  addedAt: number;            // when added to this collection
  dragCount: number;          // local drag count in this collection
}

/**
 * Root object for exporting/importing the entire library.
 */
export interface MathNodeLibrary {
  entries: Record<string, LibraryEntry>;
  collections: Record<string, LibraryCollection>;
  memberships: LibraryMembership[];

  // Explicit ordering of collection IDs
  collectionOrder: string[];
}
