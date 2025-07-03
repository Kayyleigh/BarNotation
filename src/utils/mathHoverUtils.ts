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
  if (ancestorIds.length === 0) return;

  const related = e.relatedTarget as HTMLElement | null;

  // Still inside this node, do nothing
  if (related && related instanceof Node && e.currentTarget.contains(related)) {
    return;
  }

  // Check if mouse moved into an ancestor node
  for (const ancestorId of ancestorIds) {
    const ancestorElem = document.querySelector(`[data-nodeid="${ancestorId}"]`) as HTMLElement | null;
    if (
      ancestorElem &&
      related instanceof Node &&
      ancestorElem.contains(related)
    ) {
      // Trim hover path up to this ancestor
      const ancestorIndex = ancestorIds.indexOf(ancestorId);
      if (ancestorIndex !== -1) {
        const newPath = ancestorIds.slice(0, Math.max(ancestorIndex, 0));
        onHoverChange(newPath);
      } 
      return;
    }
  }

  // If none of the ancestors match and we are not inside the node anymore, clear hover
  hoverClearTimeout = window.setTimeout(() => {
    onHoverChange([]); // Clear hover path
    hoverClearTimeout = null;
  }, 0);
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