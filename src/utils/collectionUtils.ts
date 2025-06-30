import { PREMADE_COLLECTIONS_RAW } from "../constants/premadeMathCollections";
import type { LibraryCollection, LibraryEntry } from "../models/libraryTypes";
import { parseLatex } from "../models/latexParser";

export function createPremadeCollections(): LibraryCollection[] {
    return PREMADE_COLLECTIONS_RAW.map(col => {
        const safeEntries = col.entries.reduce((acc, e) => {
            try {
                const node = parseLatex(e.latex);
                acc.push({
                    id: e.id,
                    latex: e.latex,
                    node,
                    addedAt: Date.now(),
                    draggedCount: 0,
                });
            } catch (error) {
                console.warn(`Failed to parse latex entry '${e.latex}' in collection '${col.name}':`, error);
            }
            return acc;
        }, [] as LibraryEntry[]);

        return {
            ...col,
            entries: safeEntries,
        };
    });
}
