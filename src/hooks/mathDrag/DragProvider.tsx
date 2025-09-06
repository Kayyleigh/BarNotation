// hooks/mathDrag/DragProvider.tsx
import React, { useState, useMemo } from "react";
import { DragReaderContext, DragWriterContext } from "./DragContext";
import type { DragSource, DropTarget } from "../../models/dragTypes";

export const DragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draggingSource, setDraggingSource] = useState<DragSource | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  const readerValue = useMemo(
    () => ({ draggingSource, dropTarget }),
    [draggingSource, dropTarget]
  );

  const writerValue = useMemo(
    () => ({ setDraggingSource, setDropTarget }),
    []
  );

  return (
    <DragReaderContext.Provider value={readerValue}>
      <DragWriterContext.Provider value={writerValue}>
        {children}
      </DragWriterContext.Provider>
    </DragReaderContext.Provider>
  );
};
