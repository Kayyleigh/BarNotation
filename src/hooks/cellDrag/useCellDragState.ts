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
    setDraggingCellId(id);
    initialIndexRef.current = index;
  };

  function updateDragOver(index: number | null) {
    if (draggingCellIdRef.current !== null) {
      setDragOverInsertIndex(index);
    }
  }

  const endDrag = () => {
    const startIndex = initialIndexRef.current;
    const endIndex = dragOverInsertIndexRef.current;
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
