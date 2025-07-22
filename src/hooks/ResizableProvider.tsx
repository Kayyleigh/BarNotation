// ResizableProvider.tsx
import React, { type ReactNode } from "react";
import { useResizablePanelsHook } from "./useResizablePanels";
import { ResizableContext } from "./ResizableContext";

export const ResizableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { value } = useResizablePanelsHook();

  return (
    <ResizableContext.Provider value={value}>
      {children}
    </ResizableContext.Provider>
  );
};
