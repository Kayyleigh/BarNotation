import { useState } from "react";
import type { EditorState } from "../logic/editor-state";
import { deleteNodeById, insertNodeAtIndex } from "../logic/node-manipulation";
import { findNodeById, findParentContainerAndIndex } from "../utils/treeUtils";
import type { MathNode } from "../models/types";

export interface DragState {
  draggedNodeId: string | null;
  dropTargetId: string | null;
  dropTargetIndex: number | null;
}

export function useDragState(
  editorStateRef: React.RefObject<EditorState>,
  updateEditorState: (newState: EditorState) => void
) {
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  function startDrag(nodeId: string) {
    setDraggedNodeId(nodeId);
    setDropTargetId(null);
    setDropTargetIndex(null);
  }

  function updateDropTarget(targetId: string, targetIndex: number) {
    setDropTargetId(targetId);
    setDropTargetIndex(targetIndex);
  }

  function handleDrop() {
    const editorState = editorStateRef.current;

    if (!draggedNodeId || !dropTargetId || dropTargetIndex === null) {
      clearDrag();
      return;
    }

    const draggedNode: MathNode | null = findNodeById(editorState.rootNode, draggedNodeId);
    if (!draggedNode) {
      clearDrag();
      return;
    }

    let newState = deleteNodeById(editorState, draggedNodeId);

    // Find parent container of target node (target node should be new sibling)
    const container = findParentContainerAndIndex(editorState.rootNode, dropTargetId)
    if (!container) return 

    newState = insertNodeAtIndex(newState, container.container.id, dropTargetIndex, draggedNode);
    console.log(`${dropTargetId} at ${dropTargetIndex} should become ${draggedNode.type}`)
    updateEditorState(newState);
    clearDrag();
  }

  function clearDrag() {
    setDraggedNodeId(null);
    setDropTargetId(null);
    setDropTargetIndex(null);
  }

  return {
    draggedNodeId,
    dropTargetId,
    dropTargetIndex,
    startDrag,
    updateDropTarget,
    handleDrop,
    clearDrag,
  };
}
