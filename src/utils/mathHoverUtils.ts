let hoverClearTimeout: number | null = null;

/**
 * Called on mouse enter over a node. Clears any pending hover reset and sets the hovered ID.
 */
export function handleMouseEnter(
  nodeId: string,
  onHoverChange: (id?: string) => void
) {
  if (hoverClearTimeout !== null) {
    clearTimeout(hoverClearTimeout);
    hoverClearTimeout = null;
  }
  onHoverChange(nodeId);
}

/**
 * Called on mouse leave from a node wrapper. Checks if related target is still inside the same node or an ancestor.
 * If not, schedules hover clear.
 */
export function handleMouseLeave(
  e: React.MouseEvent,
  // nodeId: string,
  ancestorIds: string[] = [],
  onHoverChange: (id?: string) => void
) {
  const related = e.relatedTarget as HTMLElement | null;

  // Ignore if mouse is still within the current element
  if (related && related instanceof Node && e.currentTarget.contains(related)) {
    return;
  }

  // Check if the related target is inside any ancestor node
  for (const ancestorId of ancestorIds) {
    const ancestorElem = document.querySelector(`[data-nodeid="${ancestorId}"]`);
    if (ancestorElem && related instanceof Node && ancestorElem.contains(related)) {
      onHoverChange(ancestorId);
      return;
    }
  }

  // Otherwise, clear hover after a short delay (next tick)
  hoverClearTimeout = window.setTimeout(() => {
    onHoverChange(undefined);
    hoverClearTimeout = null;
  }, 0);
}

/**
 * Utility to determine if a node is considered hovered.
 */
export function getIsHovered(
  node: { id: string },
  hoveredId?: string
): boolean {
  return hoveredId === node.id;
}