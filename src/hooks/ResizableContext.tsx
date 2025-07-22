// ResizableContext.tsx
import { createContext, useContext } from "react";
import type { ResizableCtx } from "./useResizablePanels";

export const useResizablePanels = (): ResizableCtx => {
  const ctx = useContext(ResizableContext);
  if (!ctx) {
    throw new Error("useResizablePanels must be used inside <ResizableProvider>");
  }
  return ctx;
};

export const ResizableContext = createContext<ResizableCtx | null>(null);;
