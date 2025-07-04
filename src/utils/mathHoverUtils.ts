let hoverClearTimeout: number | null = null;

export function handleMouseEnter(
  fullPath: string[],
  onHoverChange: (path: string[]) => void
) {
  if (hoverClearTimeout !== null) {
    clearTimeout(hoverClearTimeout);
    hoverClearTimeout = null;
  }
  onHoverChange(fullPath);
}

export function handleMouseLeave(
  e: React.MouseEvent,
  ancestorIds: string[] = [],
  onHoverChange: (path: string[]) => void
) {
  if (ancestorIds.length === 0) {
    // Mouse left the root node (no ancestors), clear hover path
    onHoverChange([]);
    return;
  }

  const related = e.relatedTarget as HTMLElement | null;

  // Still inside this node, do nothing
  if (related && related instanceof Node && e.currentTarget.contains(related)) {
    return;
  }

  // Iterate ancestorIds from last to first for deepest match
  for (let i = ancestorIds.length - 1; i >= 0; i--) {
    const ancestorId = ancestorIds[i];
    const ancestorElem = document.querySelector(`[data-nodeid="${ancestorId}"]`) as HTMLElement | null;

    if (
      ancestorElem &&
      related instanceof Node &&
      ancestorElem.contains(related)
    ) {
      // Trim hover path up to this ancestor (inclusive)
      const newPath = ancestorIds.slice(0, i + 1);
      onHoverChange(newPath);
      return;
    }
  }

  // Mouse left all ancestors — clear hover path completely
  onHoverChange([]);
}


/**
 * Utility to determine if a node is considered hovered.
 */
export function getIsHovered(
  node: { id: string },
  hoverPath: string[]
): boolean {
  return hoverPath[hoverPath.length - 1] === node.id;
}