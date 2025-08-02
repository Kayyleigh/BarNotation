// hooks/DragProvider.tsx
import React, { useState, useMemo } from "react";
import { DragContext, type DragSource, type DropTarget } from "./DragContext";

export const DragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draggingNode, setDraggingNode] = useState<DragSource>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  const contextValue = useMemo(() => ({
    draggingNode,
    setDraggingNode,
    dropTarget,
    setDropTarget,
  }), [draggingNode, dropTarget]);

  return (
    <DragContext.Provider value={contextValue}>
      {children}
    </DragContext.Provider>
  );
};
