// dragTypes.ts
import type { MathNode } from "../models/mathNodeTypes";

export type DragSourceLibrary = {
  type: "library";
  collectionId: string;
  entryId: string;
  node: MathNode;
};

export type DragSourceCell = {
  type: "cell";
  cellId: string;
  containerId: string;
  index: number;
  node: MathNode;
};

export type DragSource = DragSourceLibrary | DragSourceCell;

export type DropTarget =
  | { type: "libraryCollection"; collectionId: string }
  | { type: "cell"; cellId: string; containerId: string; index: number }
  | null;
