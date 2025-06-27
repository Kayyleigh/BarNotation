import { createContext } from "react";
import type { MathNode } from "../models/types";

export type DragSource = {
  sourceType: "cell" | "library";
  cellId?: string;
  containerId: string;
  index: number;
  node: MathNode;
} | null;

export type DropTarget = {
  cellId: string;
  containerId: string;
  index: number;
} | null;

export const DragContext = createContext<{
  draggingNode: DragSource;
  setDraggingNode: React.Dispatch<React.SetStateAction<DragSource>>;
  dropTarget: DropTarget;
  setDropTarget: React.Dispatch<React.SetStateAction<DropTarget>>;
}>({
  draggingNode: null,
  setDraggingNode: () => {},
  dropTarget: null,
  setDropTarget: () => {},
});
