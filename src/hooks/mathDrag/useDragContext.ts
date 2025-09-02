// hooks/mathDrag/useDragContext.ts
import { useContext } from "react";
import { DragContext } from "./DragContext";

export const useDragContext = () => {
  return useContext(DragContext);
};
