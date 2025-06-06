import { useRef, useState, useEffect } from "react";

export function useCellDragState() {
  const [draggingCellId, setDraggingCellId] = useState<string | null>(null);
  const [dragOverInsertIndex, setDragOverInsertIndex] = useState<number | null>(null);
  const initialIndexRef = useRef<number | null>(null);

  // Refs to expose the latest values
  const draggingCellIdRef = useRef<string | null>(null);
  const dragOverInsertIndexRef = useRef<number | null>(null);

  useEffect(() => {
    draggingCellIdRef.current = draggingCellId;
  }, [draggingCellId]);

  useEffect(() => {
    dragOverInsertIndexRef.current = dragOverInsertIndex;
  }, [dragOverInsertIndex]);

  const startDrag = (id: string, index: number) => {
    console.log("[startDrag] dragging cell id:", id, "at index:", index);
    setDraggingCellId(id);
    initialIndexRef.current = index;
  };

  function updateDragOver(index: number | null) {
    if (draggingCellIdRef.current !== null) {
      console.log("[updateDragOver] drag over insert index:", index, "And the start id was", draggingCellIdRef.current);
      setDragOverInsertIndex(index);
    } else {
      console.log("now we do nothing?", dragOverInsertIndexRef.current, "And the start id was", draggingCellIdRef.current);
    }
  }

  const endDrag = () => {
    const startIndex = initialIndexRef.current;
    const endIndex = dragOverInsertIndexRef.current;
    console.log("[endDrag] from", startIndex, "to", endIndex);

    const result = { from: startIndex, to: endIndex };

    setDraggingCellId(null);
    setDragOverInsertIndex(null);
    initialIndexRef.current = null;

    return result;
  };

  return {
    draggingCellId,
    dragOverInsertIndex,
    draggingCellIdRef,
    dragOverInsertIndexRef, 
    startDrag,
    updateDragOver,
    endDrag,
  };
}
