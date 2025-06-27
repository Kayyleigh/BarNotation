import React, { useState } from "react";
import { DragContext, type DragSource, type DropTarget } from "./DragContext";

export const DragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draggingNode, setDraggingNode] = useState<DragSource>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  return (
    <DragContext.Provider value={{ draggingNode, setDraggingNode, dropTarget, setDropTarget }}>
      {children}
    </DragContext.Provider>
  );
};
