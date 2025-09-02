// hooks/mathDrag/DragContext.ts
import { createContext } from "react";
import type { DragSource, DropTarget } from "../../models/dragTypes";

export const DragContext = createContext<{
  draggingSource: DragSource | null;
  setDraggingSource: React.Dispatch<React.SetStateAction<DragSource | null>>;
  dropTarget: DropTarget;
  setDropTarget: React.Dispatch<React.SetStateAction<DropTarget>>;
}>({
  draggingSource: null,
  setDraggingSource: () => {},
  dropTarget: null,
  setDropTarget: () => {},
});
