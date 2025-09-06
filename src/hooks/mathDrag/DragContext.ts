// hooks/mathDrag/DragContext.ts
import { createContext } from "react";
import type { DragSource, DropTarget } from "../../models/dragTypes";

// State that components *read* from (will re-render when this changes)
export const DragReaderContext = createContext<{
  draggingSource: DragSource | null;
  dropTarget: DropTarget;
}>({
  draggingSource: null,
  dropTarget: null,
});

// Functions that components *write* to (never cause re-render when called)
export const DragWriterContext = createContext<{
  setDraggingSource: React.Dispatch<React.SetStateAction<DragSource | null>>;
  setDropTarget: React.Dispatch<React.SetStateAction<DropTarget>>;
}>({
  setDraggingSource: () => {},
  setDropTarget: () => {},
});
