// hooks/mathDrag/useDragContext.ts
import { useContext } from "react";
import { DragReaderContext, DragWriterContext } from "./DragContext";

export const useDragReader = () => {
  return useContext(DragReaderContext);
};

export const useDragWriter = () => {
  return useContext(DragWriterContext);
};
