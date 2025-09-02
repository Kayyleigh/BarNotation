// hooks/mathDrag/DragProvider.tsx
import React, { useState, useMemo } from "react";
import { DragContext } from "./DragContext";
import type { DragSource, DropTarget } from "../../models/dragTypes";

export const DragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draggingSource, setDraggingSource] = useState<DragSource | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  const contextValue = useMemo(
    () => ({ draggingSource, setDraggingSource, dropTarget, setDropTarget }),
    [draggingSource, dropTarget]
  );

  return (
    <DragContext.Provider value={contextValue}>
      {children}
    </DragContext.Provider>
  );
};
