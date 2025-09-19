/**
 * Text cell types as string literals (fully erasable, no runtime code).
 */
export const TEXT_CELL_TYPES = {
    Section: "section",
    Subsection: "subsection",
    Subsubsection: "subsubsection",
    Plain: "plain",
} as const;

/**
 * Type representing valid text cell types.
 */
export type TextCellType = typeof TEXT_CELL_TYPES[keyof typeof TEXT_CELL_TYPES];

/**
 * Mapping from TextCellType to human-readable label.
 */
export const TEXT_TYPE_LABELS: Record<TextCellType, string> = {
    [TEXT_CELL_TYPES.Plain]: "Plain text",
    [TEXT_CELL_TYPES.Section]: "Section header",
    [TEXT_CELL_TYPES.Subsection]: "Subsection header",
    [TEXT_CELL_TYPES.Subsubsection]: "Subsubsection header",
};

const TEXT_CELL_TYPES_ORDER: TextCellType[] = [
    TEXT_CELL_TYPES.Section,
    TEXT_CELL_TYPES.Subsection,
    TEXT_CELL_TYPES.Subsubsection,
    TEXT_CELL_TYPES.Plain,
];

/**
 * Returns the next or previous TextCellType in a cyclic manner.
 */
export function getNextTextCellType(current: TextCellType, direction: 1 | -1): TextCellType {
    const idx = TEXT_CELL_TYPES_ORDER.indexOf(current);
    if (idx === -1) return TEXT_CELL_TYPES.Plain; // fallback
    const nextIdx = (idx + direction + TEXT_CELL_TYPES_ORDER.length) % TEXT_CELL_TYPES_ORDER.length;
    return TEXT_CELL_TYPES_ORDER[nextIdx];
}
